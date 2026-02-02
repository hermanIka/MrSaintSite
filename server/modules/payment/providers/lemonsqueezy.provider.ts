/**
 * LEMONSQUEEZY PROVIDER - Carte Bancaire
 * 
 * Intégration LemonSqueezy pour les paiements par carte bancaire.
 * Supporte Visa, Mastercard, et autres cartes internationales.
 * 
 * Configuration via variables d'environnement :
 * - LEMONSQUEEZY_API_KEY
 * - LEMONSQUEEZY_STORE_ID
 * - LEMONSQUEEZY_VARIANT_ID (ID du produit/variant à utiliser)
 * - LEMONSQUEEZY_WEBHOOK_SECRET (optionnel, pour vérification des webhooks)
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
  private variantId: string | undefined;
  private webhookSecret: string | undefined;
  private baseUrl = "https://api.lemonsqueezy.com/v1";

  constructor() {
    this.apiKey = process.env.LEMONSQUEEZY_API_KEY;
    this.storeId = process.env.LEMONSQUEEZY_STORE_ID;
    this.variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
    this.webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.storeId && !!this.variantId;
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
      const appUrl = process.env.APP_URL 
        ? process.env.APP_URL 
        : process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : "http://localhost:5000";
      
      const checkoutPayload = {
        data: {
          type: "checkouts",
          attributes: {
            custom_price: Math.round(request.amount * 100),
            product_options: {
              name: request.serviceName,
              description: `Paiement pour ${request.serviceName} - Mr Saint Travel`,
              redirect_url: `${appUrl}/reservation?payment=success&id=${paymentId}&provider=lemonsqueezy`,
            },
            checkout_options: {
              embed: false,
              button_color: "#F2C94C",
            },
            checkout_data: {
              email: request.customerEmail,
              name: request.customerName || "",
              custom: {
                payment_id: paymentId,
                service_id: request.serviceId,
                service_name: request.serviceName,
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
                id: this.variantId,
              },
            },
          },
        },
      };

      console.log("[LemonSqueezy] Creating checkout for:", paymentId);

      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(checkoutPayload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("[LemonSqueezy] Init error:", responseText);
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: this.parseErrorMessage(responseText) || "Erreur lors de la création du checkout.",
        };
      }

      const data = JSON.parse(responseText);
      const checkoutUrl = data.data?.attributes?.url;
      const checkoutId = data.data?.id;

      if (!checkoutUrl) {
        console.error("[LemonSqueezy] No checkout URL in response:", data);
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: "URL de paiement non reçue.",
        };
      }

      console.log("[LemonSqueezy] Checkout created:", checkoutId);

      return {
        success: true,
        paymentId,
        provider: this.name,
        status: "pending",
        checkoutUrl,
        externalId: checkoutId,
        redirectUrl: checkoutUrl,
        message: "Redirection vers la page de paiement sécurisée...",
      };
    } catch (error) {
      console.error("[LemonSqueezy] Init exception:", error);
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
        message: "LemonSqueezy n'est pas configuré.",
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/orders?filter[store_id]=${this.storeId}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/vnd.api+json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[LemonSqueezy] Verify error:", errorText);
        return {
          success: false,
          paymentId: request.paymentId,
          status: "pending",
          message: "Impossible de vérifier le statut du paiement.",
        };
      }

      const data = await response.json();
      
      const order = data.data?.find((o: Record<string, unknown>) => {
        const customData = (o.attributes as Record<string, unknown>)?.first_order_item as Record<string, unknown>;
        const orderCustom = customData?.custom as Record<string, string>;
        return orderCustom?.payment_id === request.paymentId;
      });
      
      if (!order) {
        return {
          success: false,
          paymentId: request.paymentId,
          status: "pending",
          message: "Paiement en attente de confirmation.",
        };
      }

      const orderAttrs = order.attributes as Record<string, unknown>;
      const isPaid = orderAttrs.status === "paid";

      return {
        success: isPaid,
        paymentId: request.paymentId,
        status: isPaid ? "success" : "pending",
        amount: (orderAttrs.total as number) / 100,
        currency: orderAttrs.currency as string,
        paidAt: orderAttrs.created_at as string,
        message: isPaid ? "Paiement confirmé avec succès!" : "Paiement en attente.",
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
      const rawBody = JSON.stringify(payload.data);
      const isValid = this.verifySignature(rawBody, payload.signature);
      if (!isValid) {
        console.error("[LemonSqueezy] Invalid webhook signature");
        return { success: false, message: "Signature invalide" };
      }
    }

    const eventType = payload.event;
    
    if (eventType === "order_created" || eventType === "order.created") {
      console.log("[LemonSqueezy] Order created - payment successful");
      return { success: true, message: "Commande créée - paiement réussi" };
    }

    if (eventType === "order_refunded" || eventType === "order.refunded") {
      console.log("[LemonSqueezy] Order refunded");
      return { success: true, message: "Commande remboursée" };
    }

    return { success: true, message: "Webhook traité" };
  }

  private verifySignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return true;
    
    try {
      const hmac = crypto.createHmac("sha256", this.webhookSecret);
      const digest = hmac.update(payload).digest("hex");
      return crypto.timingSafeEqual(
        Buffer.from(signature), 
        Buffer.from(digest)
      );
    } catch {
      return false;
    }
  }

  private parseErrorMessage(responseText: string): string | null {
    try {
      const error = JSON.parse(responseText);
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        return error.errors[0].detail || error.errors[0].title;
      }
      if (error.message) {
        return error.message;
      }
    } catch {
      return null;
    }
    return null;
  }
}

export const lemonSqueezyProvider = new LemonSqueezyProvider();
