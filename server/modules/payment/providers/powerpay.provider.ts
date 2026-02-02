/**
 * POWERPAY PROVIDER - Mobile Money
 * 
 * Intégration PowerPay pour les paiements Mobile Money.
 * Configuration via variables d'environnement :
 * - POWERPAY_API_KEY
 * - POWERPAY_BASE_URL
 */

import type {
  PaymentProviderInterface,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  WebhookPayload,
} from "../types";

export class PowerPayProvider implements PaymentProviderInterface {
  name = "powerpay" as const;
  
  private apiKey: string | undefined;
  private baseUrl: string | undefined;

  constructor() {
    this.apiKey = process.env.POWERPAY_API_KEY;
    this.baseUrl = process.env.POWERPAY_BASE_URL || "https://api.powerpay.com";
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "PowerPay n'est pas configuré. Veuillez contacter l'administrateur.",
      };
    }

    try {
      const paymentId = `pp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const response = await fetch(`${this.baseUrl}/v1/payments/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          phone: request.customerPhone,
          email: request.customerEmail,
          description: request.serviceName,
          reference: paymentId,
          callback_url: `${process.env.APP_URL || ""}/api/webhooks/powerpay`,
          metadata: {
            service_id: request.serviceId,
            customer_name: request.customerName,
            ...request.metadata,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[PowerPay] Init error:", errorData);
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: "Erreur lors de l'initialisation du paiement Mobile Money.",
        };
      }

      const data = await response.json();

      return {
        success: true,
        paymentId,
        provider: this.name,
        status: "pending",
        externalId: data.transaction_id || data.id,
        message: "Paiement Mobile Money initié. Confirmez sur votre téléphone.",
      };
    } catch (error) {
      console.error("[PowerPay] Init exception:", error);
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "Erreur de connexion au service Mobile Money.",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: request.paymentId,
        status: "failed",
        message: "PowerPay n'est pas configuré.",
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/v1/payments/${request.externalId || request.paymentId}/status`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          paymentId: request.paymentId,
          status: "pending",
          message: "Impossible de vérifier le statut du paiement.",
        };
      }

      const data = await response.json();
      const status = this.mapStatus(data.status);

      return {
        success: status === "success",
        paymentId: request.paymentId,
        status,
        amount: data.amount,
        currency: data.currency || "XOF",
        paidAt: data.paid_at,
      };
    } catch (error) {
      console.error("[PowerPay] Verify exception:", error);
      return {
        success: false,
        paymentId: request.paymentId,
        status: "pending",
        message: "Erreur lors de la vérification du paiement.",
      };
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    console.log("[PowerPay] Webhook received:", payload.event);
    
    const { data } = payload;
    const status = this.mapStatus(data.status as string);

    if (status === "success") {
      console.log("[PowerPay] Payment confirmed:", data.reference);
      return { success: true, message: "Paiement confirmé" };
    } else if (status === "failed") {
      console.log("[PowerPay] Payment failed:", data.reference);
      return { success: false, message: "Paiement échoué" };
    }

    return { success: true, message: "Webhook traité" };
  }

  private mapStatus(externalStatus: string): "pending" | "processing" | "success" | "failed" | "cancelled" {
    const statusMap: Record<string, "pending" | "processing" | "success" | "failed" | "cancelled"> = {
      "pending": "pending",
      "processing": "processing",
      "completed": "success",
      "successful": "success",
      "success": "success",
      "failed": "failed",
      "cancelled": "cancelled",
      "canceled": "cancelled",
    };
    return statusMap[externalStatus?.toLowerCase()] || "pending";
  }
}

export const powerPayProvider = new PowerPayProvider();
