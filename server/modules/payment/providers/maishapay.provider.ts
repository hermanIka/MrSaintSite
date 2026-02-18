/**
 * MAISHAPAY PROVIDER - Carte Bancaire
 * 
 * Intégration MaishaPay pour les paiements par carte bancaire.
 * Supporte Visa, Mastercard, American Express, UnionPay.
 * 
 * MaishaPay utilise un système de formulaire POST avec redirection.
 * URL Checkout : https://marchand.maishapay.online/payment/vers1.0/merchant/checkout
 * 
 * Paramètres requis : gatewayMode, publicApiKey, secretApiKey, montant, devise
 * Paramètre optionnel : callbackUrl (retour après paiement)
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
  private checkoutUrl = "https://marchand.maishapay.online/payment/vers1.0/merchant/checkout";

  constructor() {
    this.publicKey = process.env.MAISHAPAY_PUBLIC_KEY;
    this.secretKey = process.env.MAISHAPAY_SECRET_KEY;
    this.gatewayMode = process.env.MAISHAPAY_GATEWAY_MODE || "1";
  }

  isConfigured(): boolean {
    return !!this.publicKey && !!this.secretKey;
  }

  getCheckoutUrl(): string {
    return this.checkoutUrl;
  }

  getFormData(paymentId: string, amount: number, currency: string, callbackUrl: string): Record<string, string> {
    const deviseMap: Record<string, string> = {
      "EUR": "EURO",
      "USD": "USD",
      "CDF": "CDF",
      "XAF": "FCFA",
      "FCFA": "FCFA",
    };
    const devise = deviseMap[currency.toUpperCase()] || "USD";

    return {
      gatewayMode: this.gatewayMode,
      publicApiKey: this.publicKey || "",
      secretApiKey: this.secretKey || "",
      montant: amount.toString(),
      devise: devise,
      callbackUrl: callbackUrl,
    };
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
        : process.env.REPLIT_DEPLOYMENTS_URL
          ? `https://${process.env.REPLIT_DEPLOYMENTS_URL}`
          : process.env.REPLIT_DEV_DOMAIN 
            ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
            : "http://localhost:5000";

      const callbackUrl = `${appUrl}/reservation?payment=success&id=${paymentId}&provider=maishapay`;

      console.log("[MaishaPay] Creating checkout for:", paymentId, "amount:", request.amount, request.currency);

      const redirectUrl = `${appUrl}/api/payments/maishapay/redirect?paymentId=${encodeURIComponent(paymentId)}&amount=${request.amount}&currency=${encodeURIComponent(request.currency || "USD")}`;

      return {
        success: true,
        paymentId,
        provider: this.name,
        status: "pending",
        checkoutUrl: redirectUrl,
        externalId: paymentId,
        redirectUrl: redirectUrl,
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
    const payment = request as PaymentVerifyRequest & { callbackStatus?: string };
    
    if (payment.callbackStatus) {
      const status = payment.callbackStatus;
      const isSuccess = status === "202" || status === "200";
      return {
        success: isSuccess,
        paymentId: request.paymentId,
        status: isSuccess ? "success" : "failed",
        message: isSuccess ? "Paiement confirmé avec succès!" : "Le paiement a échoué.",
      };
    }

    return {
      success: false,
      paymentId: request.paymentId,
      status: "pending",
      message: "Statut du paiement en attente de confirmation via le callback MaishaPay.",
    };
  }

  async handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    console.log("[MaishaPay] Callback received:", JSON.stringify(payload.data));
    
    const status = (payload.data?.status as string || "").toString();
    const description = payload.data?.description as string || "";
    const transactionRefId = payload.data?.transactionRefId as string || "";

    if (status === "202" || status === "200") {
      console.log("[MaishaPay] Payment successful - ref:", transactionRefId, "desc:", description);
      return { success: true, message: "Paiement réussi" };
    }

    console.log("[MaishaPay] Payment status:", status, "desc:", description);
    return { success: false, message: description || "Paiement non confirmé" };
  }
}

export const maishaPayProvider = new MaishaPayProvider();
