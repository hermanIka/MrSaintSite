/**
 * PAYPAL PROVIDER
 * 
 * Intégration PayPal pour les paiements.
 * Configuration via variables d'environnement :
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_CLIENT_SECRET
 * - PAYPAL_ENV (sandbox | production)
 */

import type {
  PaymentProviderInterface,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  WebhookPayload,
} from "../types";

export class PayPalProvider implements PaymentProviderInterface {
  name = "paypal" as const;
  
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private environment: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.environment = process.env.PAYPAL_ENV || "sandbox";
    this.baseUrl = this.environment === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret;
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        console.error("[PayPal] Failed to get access token");
        return null;
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("[PayPal] Token exception:", error);
      return null;
    }
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "PayPal n'est pas configuré. Veuillez contacter l'administrateur.",
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          paymentId: "",
          provider: this.name,
          status: "failed",
          message: "Impossible de se connecter à PayPal.",
        };
      }

      const paymentId = `paypal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const appUrl = process.env.APP_URL || "http://localhost:5000";

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: paymentId,
              description: request.serviceName,
              amount: {
                currency_code: request.currency === "XOF" ? "EUR" : request.currency,
                value: request.amount.toFixed(2),
              },
              custom_id: JSON.stringify({
                service_id: request.serviceId,
                customer_email: request.customerEmail,
                ...request.metadata,
              }),
            },
          ],
          application_context: {
            brand_name: "Mr Saint Travel",
            landing_page: "BILLING",
            user_action: "PAY_NOW",
            return_url: `${appUrl}/api/payments/paypal/capture?payment_id=${paymentId}`,
            cancel_url: `${appUrl}/reservation?payment=cancelled`,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[PayPal] Init error:", errorData);
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: "Erreur lors de la création du paiement PayPal.",
        };
      }

      const data = await response.json();
      const approveUrl = data.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;

      return {
        success: true,
        paymentId,
        provider: this.name,
        status: "pending",
        externalId: data.id,
        checkoutUrl: approveUrl,
        redirectUrl: approveUrl,
        message: "Redirection vers PayPal...",
      };
    } catch (error) {
      console.error("[PayPal] Init exception:", error);
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "Erreur de connexion à PayPal.",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: request.paymentId,
        status: "failed",
        message: "PayPal n'est pas configuré.",
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          paymentId: request.paymentId,
          status: "pending",
          message: "Impossible de vérifier le paiement.",
        };
      }

      const response = await fetch(
        `${this.baseUrl}/v2/checkout/orders/${request.externalId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          paymentId: request.paymentId,
          status: "pending",
          message: "Impossible de récupérer les détails du paiement.",
        };
      }

      const data = await response.json();
      const status = this.mapStatus(data.status);
      const purchaseUnit = data.purchase_units?.[0];

      return {
        success: status === "success",
        paymentId: request.paymentId,
        status,
        amount: parseFloat(purchaseUnit?.amount?.value || "0"),
        currency: purchaseUnit?.amount?.currency_code,
        paidAt: data.update_time,
      };
    } catch (error) {
      console.error("[PayPal] Verify exception:", error);
      return {
        success: false,
        paymentId: request.paymentId,
        status: "pending",
        message: "Erreur lors de la vérification.",
      };
    }
  }

  async capturePayment(orderId: string): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: orderId,
        status: "failed",
        message: "PayPal n'est pas configuré.",
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          paymentId: orderId,
          status: "failed",
          message: "Impossible de capturer le paiement.",
        };
      }

      const response = await fetch(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[PayPal] Capture error:", errorData);
        return {
          success: false,
          paymentId: orderId,
          status: "failed",
          message: "Erreur lors de la capture du paiement.",
        };
      }

      const data = await response.json();
      const capturedAmount = data.purchase_units?.[0]?.payments?.captures?.[0];

      return {
        success: true,
        paymentId: orderId,
        status: "success",
        amount: parseFloat(capturedAmount?.amount?.value || "0"),
        currency: capturedAmount?.amount?.currency_code,
        paidAt: new Date().toISOString(),
        message: "Paiement capturé avec succès.",
      };
    } catch (error) {
      console.error("[PayPal] Capture exception:", error);
      return {
        success: false,
        paymentId: orderId,
        status: "failed",
        message: "Erreur lors de la capture.",
      };
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    console.log("[PayPal] Webhook received:", payload.event);
    
    const eventType = payload.event;
    
    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      console.log("[PayPal] Order approved:", payload.data);
      return { success: true, message: "Commande approuvée" };
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      console.log("[PayPal] Payment captured:", payload.data);
      return { success: true, message: "Paiement capturé" };
    }

    if (eventType === "PAYMENT.CAPTURE.DENIED") {
      console.log("[PayPal] Payment denied:", payload.data);
      return { success: false, message: "Paiement refusé" };
    }

    return { success: true, message: "Webhook traité" };
  }

  private mapStatus(paypalStatus: string): "pending" | "processing" | "success" | "failed" | "cancelled" {
    const statusMap: Record<string, "pending" | "processing" | "success" | "failed" | "cancelled"> = {
      "CREATED": "pending",
      "SAVED": "pending",
      "APPROVED": "processing",
      "VOIDED": "cancelled",
      "COMPLETED": "success",
      "PAYER_ACTION_REQUIRED": "pending",
    };
    return statusMap[paypalStatus] || "pending";
  }
}

export const payPalProvider = new PayPalProvider();
