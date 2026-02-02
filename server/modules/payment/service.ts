/**
 * PAYMENT SERVICE - Service Central
 * 
 * Service centralisé pour la gestion des paiements.
 * Orchestre les 3 providers : PowerPay, LemonSqueezy, PayPal
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
import { powerPayProvider } from "./providers/powerpay.provider";
import { lemonSqueezyProvider } from "./providers/lemonsqueezy.provider";
import { payPalProvider } from "./providers/paypal.provider";

class PaymentService {
  private providers: Map<PaymentProvider, PaymentProviderInterface>;
  private payments: Map<string, PaymentRecord>;

  constructor() {
    this.providers = new Map();
    this.payments = new Map();
    
    this.providers.set("powerpay", powerPayProvider);
    this.providers.set("lemonsqueezy", lemonSqueezyProvider);
    this.providers.set("paypal", payPalProvider);
  }

  getProvider(name: PaymentProvider): PaymentProviderInterface | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): { provider: PaymentProvider; configured: boolean; label: string }[] {
    return [
      {
        provider: "lemonsqueezy",
        configured: lemonSqueezyProvider.isConfigured(),
        label: "Carte bancaire",
      },
      {
        provider: "powerpay",
        configured: powerPayProvider.isConfigured(),
        label: "Mobile Money",
      },
      {
        provider: "paypal",
        configured: payPalProvider.isConfigured(),
        label: "PayPal",
      },
    ];
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
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

    const result = await provider.initPayment(request);

    if (result.success && result.paymentId) {
      const record: PaymentRecord = {
        id: result.paymentId,
        provider: request.provider,
        externalId: result.externalId,
        amount: request.amount,
        currency: request.currency,
        status: result.status,
        serviceId: request.serviceId,
        serviceName: request.serviceName,
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        metadata: request.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.payments.set(result.paymentId, record);
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

    const record = this.payments.get(request.paymentId);
    if (record) {
      request.externalId = record.externalId;
    }

    const result = await provider.verifyPayment(request);

    if (record && result.status !== record.status) {
      record.status = result.status;
      record.updatedAt = new Date().toISOString();
      if (result.paidAt) {
        record.paidAt = result.paidAt;
      }
      this.payments.set(request.paymentId, record);
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

    return providerInstance.handleWebhook(payload);
  }

  getPayment(paymentId: string): PaymentRecord | undefined {
    return this.payments.get(paymentId);
  }

  updatePaymentStatus(paymentId: string, status: PaymentRecord["status"], externalId?: string): void {
    const record = this.payments.get(paymentId);
    if (record) {
      record.status = status;
      record.updatedAt = new Date().toISOString();
      if (externalId) {
        record.externalId = externalId;
      }
      if (status === "success") {
        record.paidAt = new Date().toISOString();
      }
      this.payments.set(paymentId, record);
    }
  }

  private getProviderLabel(provider: PaymentProvider): string {
    const labels: Record<PaymentProvider, string> = {
      powerpay: "Mobile Money",
      lemonsqueezy: "Carte bancaire",
      paypal: "PayPal",
    };
    return labels[provider] || provider;
  }
}

export const paymentService = new PaymentService();
