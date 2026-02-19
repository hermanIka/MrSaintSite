/**
 * MAISHAPAY PROVIDER - Carte Bancaire (REST API)
 * 
 * Intégration MaishaPay REST API pour les paiements par carte bancaire.
 * Supporte Visa, Mastercard, American Express, UnionPay avec 3D Secure.
 * 
 * API Base URL : https://marchand.maishapay.online/api
 * Endpoint Card Collection : POST /collect/v2/store/card (JSON)
 * 
 * L'API retourne une paymentPage URL hébergée par MaishaPay
 * où le client entre ses informations de carte en toute sécurité.
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

function getAppUrl(): string {
  return process.env.APP_URL 
    ? process.env.APP_URL 
    : process.env.REPLIT_DEPLOYMENTS_URL
      ? `https://${process.env.REPLIT_DEPLOYMENTS_URL}`
      : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : "http://localhost:5000";
}

export class MaishaPayProvider implements PaymentProviderInterface {
  name = "maishapay" as const;
  
  private publicKey: string | undefined;
  private secretKey: string | undefined;
  private gatewayMode: string;
  private apiBaseUrl = "https://marchand.maishapay.online/api";

  constructor() {
    let pubKey = process.env.MAISHAPAY_PUBLIC_KEY;
    let secKey = process.env.MAISHAPAY_SECRET_KEY;

    if (!pubKey || !secKey) {
      if (!pubKey) console.warn("[MaishaPay] MAISHAPAY_PUBLIC_KEY is missing or empty");
      if (!secKey) console.warn("[MaishaPay] MAISHAPAY_SECRET_KEY is missing or empty");
    } else {
      const validPrefix = /^MP-(LIVE|TEST|SB)(PK|SK)-/;
      if (!validPrefix.test(pubKey)) {
        console.warn("[MaishaPay] MAISHAPAY_PUBLIC_KEY has unexpected format. Current prefix:", pubKey.substring(0, 15));
      }
      if (!validPrefix.test(secKey)) {
        console.warn("[MaishaPay] MAISHAPAY_SECRET_KEY has unexpected format. Current prefix:", secKey.substring(0, 15));
      }
    }

    this.publicKey = pubKey;
    this.secretKey = secKey;
    this.gatewayMode = process.env.MAISHAPAY_GATEWAY_MODE || "1";
  }

  isConfigured(): boolean {
    return !!this.publicKey && !!this.secretKey;
  }

  getCheckoutFormData(paymentId: string, amount: number, currency: string, callbackUrl: string): Record<string, string> {
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

  getCheckoutUrl(): string {
    return "https://marchand.maishapay.online/payment/vers1.0/merchant/checkout";
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
      const appUrl = getAppUrl();

      const callbackUrl = `${appUrl}/api/payments/maishapay/callback/${paymentId}`;

      const currencyMap: Record<string, string> = {
        "EUR": "EURO",
        "USD": "USD",
        "CDF": "CDF",
        "XAF": "FCFA",
        "FCFA": "FCFA",
      };
      const currency = currencyMap[(request.currency || "USD").toUpperCase()] || "USD";

      console.log("[MaishaPay] Initiating card payment:", paymentId, "amount:", request.amount, currency);

      const payload = {
        transactionReference: paymentId,
        gatewayMode: this.gatewayMode,
        publicApiKey: this.publicKey,
        secretApiKey: this.secretKey,
        order: {
          amount: request.amount.toString(),
          currency: currency,
          customerFullName: request.customerName || "Client",
          customerPhoneNumber: request.customerPhone || "",
          customerEmailAdress: request.customerEmail || "",
        },
        paymentChannel: {
          channel: "CARD",
          provider: "VISA",
          callbackUrl: callbackUrl,
        },
      };

      console.log("[MaishaPay] Calling REST API:", `${this.apiBaseUrl}/collect/v2/store/card`);

      const response = await fetch(`${this.apiBaseUrl}/collect/v2/store/card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("[MaishaPay] API Response status:", response.status, "body:", responseText.substring(0, 500));

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("[MaishaPay] Failed to parse response as JSON");
        return await this.fallbackToCheckout(paymentId, request, callbackUrl);
      }

      const responseData = data?.original?.data || data?.data || data;
      const paymentPage = responseData?.paymentPage;
      const transactionId = responseData?.transactionId || responseData?.reference;

      if (paymentPage) {
        console.log("[MaishaPay] Got payment page URL:", paymentPage);
        return {
          success: true,
          paymentId,
          provider: this.name,
          status: "pending",
          checkoutUrl: paymentPage,
          externalId: transactionId || paymentId,
          redirectUrl: paymentPage,
          message: "Redirection vers la page de paiement sécurisée MaishaPay...",
        };
      }

      console.log("[MaishaPay] No paymentPage in response, falling back to checkout form");
      return await this.fallbackToCheckout(paymentId, request, callbackUrl);

    } catch (error) {
      console.error("[MaishaPay] Init exception:", error);
      
      const paymentId = `mp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const appUrl = getAppUrl();
      const callbackUrl = `${appUrl}/api/payments/maishapay/callback/${paymentId}`;
      return await this.fallbackToCheckout(paymentId, request, callbackUrl);
    }
  }

  private async fallbackToCheckout(
    paymentId: string,
    request: PaymentInitRequest,
    _callbackUrl: string
  ): Promise<PaymentInitResponse> {
    const appUrl = getAppUrl();
    const redirectUrl = `${appUrl}/api/payments/maishapay/redirect?paymentId=${encodeURIComponent(paymentId)}&amount=${request.amount}&currency=${encodeURIComponent(request.currency || "USD")}`;

    console.log("[MaishaPay] Using checkout form fallback:", redirectUrl);

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
