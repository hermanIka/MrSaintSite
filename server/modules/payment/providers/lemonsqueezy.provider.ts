/**
 * LEMONSQUEEZY PROVIDER - Carte Bancaire
 * 
 * Intégration LemonSqueezy pour les paiements par carte bancaire.
 * Configuration via variables d'environnement :
 * - LEMONSQUEEZY_API_KEY
 * - LEMONSQUEEZY_STORE_ID
 * - LEMONSQUEEZY_WEBHOOK_SECRET
 */

import type {
  PaymentProviderInterface,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  WebhookPayload,
} from "../types";
import * as crypto from "crypto";

export class LemonSqueezyProvider implements PaymentProviderInterface {
  name = "lemonsqueezy" as const;
  
  private apiKey: string | undefined;
  private storeId: string | undefined;
  private webhookSecret: string | undefined;
  private baseUrl = "https://api.lemonsqueezy.com/v1";

  constructor() {
    this.apiKey = process.env.LEMONSQUEEZY_API_KEY;
    this.storeId = process.env.LEMONSQUEEZY_STORE_ID;
    this.webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.storeId;
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "LemonSqueezy n'est pas configuré. Veuillez contacter l'administrateur.",
      };
    }

    try {
      const paymentId = `ls_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              custom_price: request.amount * 100,
              product_options: {
                name: request.serviceName,
                description: `Paiement pour ${request.serviceName}`,
                redirect_url: `${process.env.APP_URL || ""}/reservation?payment=success&id=${paymentId}`,
              },
              checkout_data: {
                email: request.customerEmail,
                name: request.customerName || "",
                custom: {
                  payment_id: paymentId,
                  service_id: request.serviceId,
                  ...request.metadata,
                },
              },
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: this.storeId,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: process.env.LEMONSQUEEZY_VARIANT_ID || "1",
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[LemonSqueezy] Init error:", errorData);
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: "Erreur lors de la création du checkout.",
        };
      }

      const data = await response.json();
      const checkoutUrl = data.data?.attributes?.url;

      return {
        success: true,
        paymentId,
        provider: this.name,
        status: "pending",
        checkoutUrl,
        externalId: data.data?.id,
        redirectUrl: checkoutUrl,
        message: "Redirection vers la page de paiement...",
      };
    } catch (error) {
      console.error("[LemonSqueezy] Init exception:", error);
      return {
        success: false,
        paymentId: "",
        provider: this.name,
        status: "failed",
        message: "Erreur de connexion au service de paiement.",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        paymentId: request.paymentId,
        status: "failed",
        message: "LemonSqueezy n'est pas configuré.",
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/orders?filter[identifier]=${request.externalId || request.paymentId}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/vnd.api+json",
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
      const order = data.data?.[0];
      
      if (!order) {
        return {
          success: false,
          paymentId: request.paymentId,
          status: "pending",
          message: "Paiement en attente de confirmation.",
        };
      }

      const status = order.attributes.status === "paid" ? "success" : "pending";

      return {
        success: status === "success",
        paymentId: request.paymentId,
        status,
        amount: order.attributes.total / 100,
        currency: order.attributes.currency,
        paidAt: order.attributes.created_at,
      };
    } catch (error) {
      console.error("[LemonSqueezy] Verify exception:", error);
      return {
        success: false,
        paymentId: request.paymentId,
        status: "pending",
        message: "Erreur lors de la vérification du paiement.",
      };
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    console.log("[LemonSqueezy] Webhook received:", payload.event);
    
    if (this.webhookSecret && payload.signature) {
      const isValid = this.verifySignature(JSON.stringify(payload.data), payload.signature);
      if (!isValid) {
        console.error("[LemonSqueezy] Invalid webhook signature");
        return { success: false, message: "Signature invalide" };
      }
    }

    const eventType = payload.event;
    
    if (eventType === "order_created" || eventType === "order.created") {
      console.log("[LemonSqueezy] Order created:", payload.data);
      return { success: true, message: "Commande créée" };
    }

    if (eventType === "order_refunded" || eventType === "order.refunded") {
      console.log("[LemonSqueezy] Order refunded:", payload.data);
      return { success: true, message: "Commande remboursée" };
    }

    return { success: true, message: "Webhook traité" };
  }

  private verifySignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return true;
    
    const hmac = crypto.createHmac("sha256", this.webhookSecret);
    const digest = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }
}

export const lemonSqueezyProvider = new LemonSqueezyProvider();
