/**
 * PAWAPAY PROVIDER - Mobile Money (Africa)
 * 
 * Intégration PawaPay pour les paiements Mobile Money africains.
 * Supporte 19 pays : MTN, Orange, Airtel, M-Pesa, etc.
 * 
 * Configuration via variables d'environnement :
 * - PAWAPAY_API_TOKEN
 * - PAWAPAY_ENV (sandbox | production)
 * - PAWAPAY_CORRESPONDENT (ex: MTN_MOMO_CMR, ORANGE_CMR)
 */

import type {
  PaymentProviderInterface,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  WebhookPayload,
} from "../types";
import { randomUUID } from "crypto";

export class PawaPayProvider implements PaymentProviderInterface {
  name = "pawapay" as const;
  
  private apiToken: string | undefined;
  private environment: "sandbox" | "production";
  private baseUrl: string;
  private correspondent: string | undefined;

  constructor() {
    this.apiToken = process.env.PAWAPAY_API_TOKEN;
    this.environment = (process.env.PAWAPAY_ENV === "production") ? "production" : "sandbox";
    this.baseUrl = this.environment === "production" 
      ? "https://api.pawapay.io" 
      : "https://api.sandbox.pawapay.io";
    this.correspondent = process.env.PAWAPAY_CORRESPONDENT || "MTN_MOMO_CMR";
  }

  isConfigured(): boolean {
    return !!this.apiToken;
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "PawaPay n'est pas configuré. Veuillez contacter l'administrateur.",
      };
    }

    try {
      const depositId = randomUUID();
      const paymentId = `pawa_${Date.now()}_${depositId.substring(0, 8)}`;
      
      const phoneNumber = this.formatPhoneNumber(request.customerPhone || "");
      if (!phoneNumber) {
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: "Numéro de téléphone invalide. Format requis: 237XXXXXXXXX (avec code pays)",
        };
      }

      const depositPayload = {
        depositId,
        amount: request.amount.toString(),
        currency: this.getCurrencyForCorrespondent(),
        correspondent: this.correspondent,
        payer: {
          type: "MSISDN",
          address: {
            value: phoneNumber,
          },
        },
        customerTimestamp: new Date().toISOString(),
        statementDescription: this.truncateDescription(request.serviceName),
        metadata: [
          { fieldName: "payment_id", fieldValue: paymentId },
          { fieldName: "service_id", fieldValue: request.serviceId },
          { fieldName: "customer_email", fieldValue: request.customerEmail },
          { fieldName: "customer_name", fieldValue: request.customerName || "" },
        ],
      };

      console.log("[PawaPay] Initiating deposit:", depositId, "phone:", phoneNumber, "amount:", request.amount);

      const response = await fetch(`${this.baseUrl}/deposits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(depositPayload),
      });

      const responseText = await response.text();
      console.log("[PawaPay] Response status:", response.status, "body:", responseText);

      if (!response.ok) {
        console.error("[PawaPay] Init error:", responseText);
        const errorMessage = this.parseErrorMessage(responseText);
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: errorMessage || "Erreur lors de l'initialisation du paiement Mobile Money.",
        };
      }

      const data = JSON.parse(responseText);

      if (data.status === "REJECTED") {
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: data.rejectionReason?.rejectionMessage || "Paiement rejeté par l'opérateur.",
        };
      }

      return {
        success: true,
        paymentId,
        provider: this.name,
        status: data.status === "ACCEPTED" ? "pending" : "processing",
        externalId: depositId,
        message: "Paiement Mobile Money initié. Veuillez confirmer sur votre téléphone en entrant votre code PIN.",
      };
    } catch (error) {
      console.error("[PawaPay] Init exception:", error);
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "Erreur de connexion au service Mobile Money. Veuillez réessayer.",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: request.paymentId,
        status: "failed",
        message: "PawaPay n'est pas configuré.",
      };
    }

    try {
      const depositId = request.externalId || request.paymentId;
      
      const response = await fetch(`${this.baseUrl}/deposits/${depositId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[PawaPay] Verify error:", errorText);
        return {
          success: false,
          paymentId: request.paymentId,
          status: "pending",
          message: "Impossible de vérifier le statut du paiement.",
        };
      }

      const data = await response.json();
      const status = this.mapStatus(data[0]?.status || data.status);

      return {
        success: status === "success",
        paymentId: request.paymentId,
        status,
        amount: parseFloat(data[0]?.amount || data.amount),
        currency: data[0]?.currency || data.currency,
        paidAt: data[0]?.created || data.created,
        message: status === "success" 
          ? "Paiement confirmé avec succès!" 
          : status === "failed" 
            ? (data[0]?.failureReason?.failureMessage || "Le paiement a échoué.")
            : "Paiement en attente de confirmation.",
      };
    } catch (error) {
      console.error("[PawaPay] Verify exception:", error);
      return {
        success: false,
        paymentId: request.paymentId,
        status: "pending",
        message: "Erreur lors de la vérification du paiement.",
      };
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    console.log("[PawaPay] Webhook received:", payload.event);
    
    const { data } = payload;
    const status = this.mapStatus(data.status as string);
    const depositId = data.depositId as string;

    if (status === "success") {
      console.log("[PawaPay] Payment confirmed:", depositId);
      return { success: true, message: "Paiement confirmé" };
    } else if (status === "failed") {
      console.log("[PawaPay] Payment failed:", depositId, data.failureReason);
      return { success: false, message: "Paiement échoué" };
    }

    return { success: true, message: "Webhook traité" };
  }

  private formatPhoneNumber(phone: string): string | null {
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
    
    if (cleaned.length === 0) {
      return null;
    }

    // Remove leading zeros
    if (cleaned.startsWith("00")) {
      cleaned = cleaned.substring(2);
    }

    // Auto-add country code for common formats
    // Cameroon: 6XXXXXXXX or 2XXXXXXXX (9 digits local)
    if (cleaned.length === 9 && /^[62]/.test(cleaned)) {
      cleaned = "237" + cleaned;
    }
    // With leading 0: 06XXXXXXXX (10 digits)
    if (cleaned.length === 10 && cleaned.startsWith("0")) {
      cleaned = "237" + cleaned.substring(1);
    }

    // Validate final format: 10-15 digits starting with country code
    if (/^\d{10,15}$/.test(cleaned)) {
      return cleaned;
    }

    return null;
  }

  private truncateDescription(description: string): string {
    const cleaned = description.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    if (cleaned.length < 4) {
      return "PAIEMENT MR SAINT";
    }
    return cleaned.substring(0, 22);
  }

  private getCurrencyForCorrespondent(): string {
    const currencyMap: Record<string, string> = {
      "MTN_MOMO_CMR": "XAF",
      "ORANGE_CMR": "XAF",
      "MTN_MOMO_CIV": "XOF",
      "ORANGE_CIV": "XOF",
      "MTN_MOMO_BEN": "XOF",
      "MOOV_BEN": "XOF",
      "MTN_MOMO_GHA": "GHS",
      "MPESA_KEN": "KES",
      "MTN_MOMO_UGA": "UGX",
      "AIRTEL_OAPI_UGA": "UGX",
      "MTN_MOMO_ZMB": "ZMW",
      "MTN_MOMO_RWA": "RWF",
      "ORANGE_SEN": "XOF",
      "ORANGE_BFA": "XOF",
      "ORANGE_MLI": "XOF",
    };
    return currencyMap[this.correspondent || ""] || "XAF";
  }

  private mapStatus(externalStatus: string): "pending" | "processing" | "success" | "failed" | "cancelled" {
    const statusMap: Record<string, "pending" | "processing" | "success" | "failed" | "cancelled"> = {
      "ACCEPTED": "pending",
      "ENQUEUED": "pending",
      "SUBMITTED": "processing",
      "COMPLETED": "success",
      "FAILED": "failed",
      "REJECTED": "failed",
      "DUPLICATE_IGNORED": "failed",
      "CANCELLED": "cancelled",
    };
    return statusMap[externalStatus?.toUpperCase()] || "pending";
  }

  private parseErrorMessage(responseText: string): string | null {
    try {
      const error = JSON.parse(responseText);
      if (error.rejectionReason?.rejectionMessage) {
        return error.rejectionReason.rejectionMessage;
      }
      if (error.message) {
        return error.message;
      }
      if (error.error) {
        return error.error;
      }
    } catch {
      return null;
    }
    return null;
  }
}

export const pawaPayProvider = new PawaPayProvider();
