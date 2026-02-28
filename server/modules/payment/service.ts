/**
 * PAYMENT SERVICE - Service Central
 * 
 * Service centralisé pour la gestion des paiements.
 * Orchestre les 3 providers : PawaPay, MaishaPay, PayPal
 * Persiste les paiements en base de données PostgreSQL.
 */

import type {
  PaymentProvider,
  PaymentProviderInterface,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  WebhookPayload,
  PaymentRecord,
} from "./types";
import { pawaPayProvider } from "./providers/pawapay.provider";
import { maishaPayProvider } from "./providers/maishapay.provider";
import { payPalProvider } from "./providers/paypal.provider";
import { db } from "../../db";
import { payments } from "@shared/schema";
import { eq } from "drizzle-orm";
import { contentStorage } from "../content/storage";

class PaymentService {
  private providers: Map<PaymentProvider, PaymentProviderInterface>;

  constructor() {
    this.providers = new Map();
    this.providers.set("pawapay", pawaPayProvider);
    this.providers.set("maishapay", maishaPayProvider);
    this.providers.set("paypal", payPalProvider);
  }

  getProvider(name: PaymentProvider): PaymentProviderInterface | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): { provider: PaymentProvider; configured: boolean; label: string }[] {
    return [
      {
        provider: "maishapay",
        configured: maishaPayProvider.isConfigured(),
        label: "Carte bancaire",
      },
      {
        provider: "pawapay",
        configured: pawaPayProvider.isConfigured(),
        label: "Mobile Money",
      },
      {
        provider: "paypal",
        configured: payPalProvider.isConfigured(),
        label: "PayPal",
      },
    ];
  }

  async validateAmount(serviceId: string, amount: number, paymentMode: string = "direct"): Promise<{ valid: boolean; expectedAmount: number; message?: string }> {
    try {
      const allPrices = await contentStorage.getAllPrices();
      const priceMap: Record<string, number> = {};
      for (const p of allPrices) {
        priceMap[p.key] = p.amount;
      }

      const consultationPrice = priceMap["consultation"] ?? 20;

      if (paymentMode === "consultation") {
        if (amount !== consultationPrice) {
          return { valid: false, expectedAmount: consultationPrice, message: `Montant de consultation invalide. Attendu: ${consultationPrice}€, reçu: ${amount}€` };
        }
        return { valid: true, expectedAmount: consultationPrice };
      }

      if (serviceId === "visa") {
        const visaPrice = priceMap["visa"] ?? 600;
        if (amount !== visaPrice) {
          return { valid: false, expectedAmount: visaPrice, message: `Montant visa invalide. Attendu: ${visaPrice}€, reçu: ${amount}€` };
        }
        return { valid: true, expectedAmount: visaPrice };
      }

      if (serviceId === "agence") {
        const validAmounts = [
          priceMap["agence_classique"] ?? 800,
          priceMap["agence_premium"] ?? 1500,
          priceMap["agence_elite"] ?? 2500,
        ];
        if (!validAmounts.includes(amount)) {
          return { valid: false, expectedAmount: validAmounts[0], message: `Montant pack agence invalide. Reçu: ${amount}€` };
        }
        return { valid: true, expectedAmount: amount };
      }

      if (amount <= 0) {
        return { valid: false, expectedAmount: 0, message: "Montant doit être positif." };
      }
      return { valid: true, expectedAmount: amount };
    } catch (err) {
      console.error("[Payment] Failed to fetch prices from DB, skipping strict validation:", err);
      if (amount <= 0) {
        return { valid: false, expectedAmount: 0, message: "Montant invalide." };
      }
      return { valid: true, expectedAmount: amount };
    }
  }

  async initPayment(request: PaymentInitRequest & { paymentMode?: string; source?: string }): Promise<PaymentInitResponse> {
    const provider = this.getProvider(request.provider);
    
    if (!provider) {
      return {
        success: false,
        paymentId: "",
        provider: request.provider,
        status: "failed",
        message: `Provider ${request.provider} non supporté.`,
      };
    }

    if (!provider.isConfigured()) {
      return {
        success: false,
        paymentId: "",
        provider: request.provider,
        status: "failed",
        message: `Le mode de paiement ${this.getProviderLabel(request.provider)} n'est pas disponible actuellement.`,
      };
    }

    const paymentMode = request.paymentMode || "direct";
    const validation = await this.validateAmount(request.serviceId, request.amount, paymentMode);
    if (!validation.valid) {
      console.warn("[Payment] Amount validation failed:", validation.message);
      return {
        success: false,
        paymentId: "",
        provider: request.provider,
        status: "failed",
        message: validation.message || "Montant invalide.",
      };
    }

    const result = await provider.initPayment(request);

    if (result.success && result.paymentId) {
      try {
        const now = new Date().toISOString();
        await db.insert(payments).values({
          id: result.paymentId,
          provider: request.provider,
          externalId: result.externalId || null,
          amount: request.amount,
          currency: request.currency,
          status: result.status,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          customerEmail: request.customerEmail,
          customerName: request.customerName || null,
          customerPhone: request.customerPhone || null,
          paymentMode,
          source: request.source || "reservation",
          metadata: request.metadata ? JSON.stringify(request.metadata) : null,
          createdAt: now,
          updatedAt: now,
        });
      } catch (dbError) {
        console.error("[Payment] Failed to persist payment to DB:", dbError);
      }
    }

    return result;
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    const provider = this.getProvider(request.provider);
    
    if (!provider) {
      return {
        success: false,
        paymentId: request.paymentId,
        status: "failed",
        message: `Provider ${request.provider} non supporté.`,
      };
    }

    const record = await this.getPayment(request.paymentId);
    if (record) {
      request.externalId = record.externalId || undefined;
    }

    const result = await provider.verifyPayment(request);

    if (record && result.status !== record.status) {
      try {
        const updateData: Record<string, string> = {
          status: result.status,
          updatedAt: new Date().toISOString(),
        };
        if (result.paidAt) {
          updateData.paidAt = result.paidAt;
        }
        if (result.status === "success" && !result.paidAt) {
          updateData.paidAt = new Date().toISOString();
        }
        await db.update(payments).set(updateData).where(eq(payments.id, request.paymentId));
      } catch (dbError) {
        console.error("[Payment] Failed to update payment status in DB:", dbError);
      }
    }

    return result;
  }

  async handleWebhook(provider: PaymentProvider, payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    const providerInstance = this.getProvider(provider);
    
    if (!providerInstance) {
      return {
        success: false,
        message: `Provider ${provider} non supporté.`,
      };
    }

    const result = await providerInstance.handleWebhook(payload);

    try {
      let paymentId: string | undefined;
      let newStatus: "success" | "failed" | undefined;
      let externalId: string | undefined;

      if (provider === "pawapay") {
        const depositId = payload.data.depositId as string;
        externalId = depositId;
        const webhookStatus = (payload.data.status as string || "").toUpperCase();
        if (webhookStatus === "COMPLETED") newStatus = "success";
        else if (webhookStatus === "FAILED" || webhookStatus === "REJECTED") newStatus = "failed";

        if (depositId && newStatus) {
          const metadata = payload.data.metadata as Array<{ fieldName: string; fieldValue: string }> | undefined;
          const pidMeta = metadata?.find((m: { fieldName: string }) => m.fieldName === "payment_id");
          paymentId = pidMeta?.fieldValue;
          if (!paymentId) {
            const allPayments = await db.select().from(payments).where(eq(payments.externalId, depositId));
            if (allPayments.length > 0) paymentId = allPayments[0].id;
          }
        }
      } else if (provider === "maishapay") {
        const refId = payload.data.transactionRefId as string;
        const status = String(payload.data.status || "");
        if (status === "202" || status === "200") newStatus = "success";
        else if (status) newStatus = "failed";
        if (refId) {
          externalId = refId;
          const found = await db.select().from(payments).where(eq(payments.externalId, refId));
          if (found.length > 0) paymentId = found[0].id;
        }
      } else if (provider === "paypal") {
        const event = payload.event;
        if (event === "PAYMENT.CAPTURE.COMPLETED") newStatus = "success";
        else if (event === "PAYMENT.CAPTURE.DENIED") newStatus = "failed";
        const resource = payload.data as Record<string, unknown>;
        const resourceId = resource.id as string;
        const customId = resource.custom_id as string;
        if (resourceId) externalId = resourceId;
        if (customId) {
          paymentId = customId;
        } else if (resourceId) {
          const found = await db.select().from(payments).where(eq(payments.externalId, resourceId));
          if (found.length > 0) paymentId = found[0].id;
        }
      }

      if (paymentId && newStatus) {
        await this.updatePaymentStatus(paymentId, newStatus, externalId);
        console.log(`[Payment] DB updated: ${paymentId} -> ${newStatus}`);
      }
    } catch (dbError) {
      console.error("[Payment] Failed to update DB from webhook:", dbError instanceof Error ? dbError.message : "unknown");
    }

    return result;
  }

  async getPayment(paymentId: string): Promise<PaymentRecord | undefined> {
    try {
      const [record] = await db.select().from(payments).where(eq(payments.id, paymentId));
      if (!record) return undefined;

      return {
        id: record.id,
        provider: record.provider as PaymentProvider,
        externalId: record.externalId || undefined,
        amount: record.amount,
        currency: record.currency,
        status: record.status as PaymentRecord["status"],
        serviceId: record.serviceId,
        serviceName: record.serviceName,
        customerEmail: record.customerEmail,
        customerName: record.customerName || undefined,
        customerPhone: record.customerPhone || undefined,
        metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        paidAt: record.paidAt || undefined,
      };
    } catch (dbError) {
      console.error("[Payment] Failed to get payment from DB:", dbError);
      return undefined;
    }
  }

  async updatePaymentStatus(paymentId: string, status: PaymentRecord["status"], externalId?: string): Promise<void> {
    try {
      const updateData: Record<string, string> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (externalId) {
        updateData.externalId = externalId;
      }
      if (status === "success") {
        updateData.paidAt = new Date().toISOString();
      }
      await db.update(payments).set(updateData).where(eq(payments.id, paymentId));
    } catch (dbError) {
      console.error("[Payment] Failed to update payment status in DB:", dbError);
    }
  }

  private getProviderLabel(provider: PaymentProvider): string {
    const labels: Record<PaymentProvider, string> = {
      pawapay: "Mobile Money",
      maishapay: "Carte bancaire",
      paypal: "PayPal",
    };
    return labels[provider] || provider;
  }
}

export const paymentService = new PaymentService();
