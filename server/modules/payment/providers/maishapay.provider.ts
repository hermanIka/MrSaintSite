/**
 * MAISHAPAY PROVIDER - Carte Bancaire
 * 
 * Intégration MaishaPay pour les paiements par carte bancaire.
 * Supporte Visa, Mastercard, American Express, UnionPay.
 * 
 * Configuration via variables d'environnement :
 * - MAISHAPAY_PUBLIC_KEY (format: MP-LIVEPK-xxx)
 * - MAISHAPAY_SECRET_KEY (format: MP-LIVESK-xxx)
 * - MAISHAPAY_GATEWAY_MODE (0=sandbox, 1=live, default: 1)
 */

import type {
  PaymentProviderInterface,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  WebhookPayload,
} from "../types";

export class MaishaPayProvider implements PaymentProviderInterface {
  name = "maishapay" as const;
  
  private publicKey: string | undefined;
  private secretKey: string | undefined;
  private gatewayMode: string;
  private checkoutUrl = "https://api.maishapay.net/v1/checkout";

  constructor() {
    this.publicKey = process.env.MAISHAPAY_PUBLIC_KEY;
    this.secretKey = process.env.MAISHAPAY_SECRET_KEY;
    this.gatewayMode = process.env.MAISHAPAY_GATEWAY_MODE || "1";
  }

  isConfigured(): boolean {
    return !!this.publicKey && !!this.secretKey;
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "MaishaPay n'est pas configuré. Veuillez contacter l'administrateur.",
      };
    }

    try {
      const paymentId = `mp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const appUrl = process.env.APP_URL 
        ? process.env.APP_URL 
        : process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : "http://localhost:5000";

      const payload = {
        publicApiKey: this.publicKey,
        secretApiKey: this.secretKey,
        gatewayMode: parseInt(this.gatewayMode),
        amount: request.amount,
        currency: request.currency || "USD",
        orderId: paymentId,
        customerName: request.customerName || "",
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone || "",
        description: `Paiement pour ${request.serviceName} - Mr Saint Travel`,
        returnUrl: `${appUrl}/reservation?payment=success&id=${paymentId}&provider=maishapay`,
        cancelUrl: `${appUrl}/reservation?payment=failed&id=${paymentId}&provider=maishapay`,
        webhookUrl: `${appUrl}/api/webhooks/maishapay`,
      };

      console.log("[MaishaPay] Creating checkout for:", paymentId);

      const response = await fetch(this.checkoutUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("[MaishaPay] Init error:", responseText);
        let errorMessage = "Erreur lors de la création du paiement.";
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) errorMessage = errorData.message;
        } catch {}
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: errorMessage,
        };
      }

      const data = JSON.parse(responseText);
      const checkoutPageUrl = data.paymentUrl || data.checkout_url || data.url;
      const transactionId = data.transactionId || data.transaction_id || paymentId;

      if (!checkoutPageUrl) {
        console.error("[MaishaPay] No payment URL in response:", data);
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: "URL de paiement non reçue de MaishaPay.",
        };
      }

      console.log("[MaishaPay] Checkout created:", transactionId);

      return {
        success: true,
        paymentId,
        provider: this.name,
        status: "pending",
        checkoutUrl: checkoutPageUrl,
        externalId: transactionId,
        redirectUrl: checkoutPageUrl,
        message: "Redirection vers la page de paiement sécurisée MaishaPay...",
      };
    } catch (error) {
      console.error("[MaishaPay] Init exception:", error);
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "Erreur de connexion au service de paiement par carte.",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: request.paymentId,
        status: "failed",
        message: "MaishaPay n'est pas configuré.",
      };
    }

    try {
      const response = await fetch(
        `https://api.maishapay.net/v1/transactions/${request.externalId || request.paymentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.secretKey}`,
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
      const status = (data.status || "").toUpperCase();
      const isSuccess = status === "SUCCESS" || status === "COMPLETED" || status === "PAID";

      return {
        success: isSuccess,
        paymentId: request.paymentId,
        status: isSuccess ? "success" : status === "FAILED" || status === "CANCELLED" ? "failed" : "pending",
        amount: data.amount,
        currency: data.currency,
        paidAt: data.completedAt || data.created_at,
        message: isSuccess ? "Paiement confirmé avec succès!" : "Paiement en attente de confirmation.",
      };
    } catch (error) {
      console.error("[MaishaPay] Verify exception:", error);
      return {
        success: false,
        paymentId: request.paymentId,
        status: "pending",
        message: "Erreur lors de la vérification du paiement.",
      };
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    console.log("[MaishaPay] Webhook received:", payload.event);
    
    const status = (payload.data?.status as string || "").toUpperCase();

    if (status === "SUCCESS" || status === "COMPLETED" || payload.event === "payment.success") {
      console.log("[MaishaPay] Payment successful");
      return { success: true, message: "Paiement réussi" };
    }

    if (status === "FAILED" || payload.event === "payment.failed") {
      console.log("[MaishaPay] Payment failed");
      return { success: true, message: "Paiement échoué" };
    }

    if (status === "CANCELLED" || payload.event === "payment.cancelled") {
      console.log("[MaishaPay] Payment cancelled");
      return { success: true, message: "Paiement annulé" };
    }

    return { success: true, message: "Webhook traité" };
  }
}

export const maishaPayProvider = new MaishaPayProvider();
