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
import { getCountryByCode, getOperatorByCode } from "@shared/pawapay-countries";

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
      
      const activeCorrespondent = request.correspondent || this.correspondent;
      const countryPhonePrefix = this.getPhonePrefixForCountry(request.countryCode);
      
      const phoneNumber = this.formatPhoneNumber(request.customerPhone || "", countryPhonePrefix);
      if (!phoneNumber) {
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: "Numéro de téléphone invalide. Vérifiez le format de votre numéro.",
        };
      }

      const localCurrency = this.getCurrencyForCorrespondent(activeCorrespondent);
      const localAmount = this.convertToLocalCurrency(
        request.amount,
        request.currency || "EUR",
        request.countryCode,
        activeCorrespondent
      );

      const depositPayload = {
        depositId,
        amount: localAmount.toString(),
        currency: localCurrency,
        correspondent: activeCorrespondent,
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

      console.log("[PawaPay] Initiating deposit:", depositId, "amount:", localAmount, localCurrency);

      const response = await fetch(`${this.baseUrl}/deposits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(depositPayload),
      });

      const responseText = await response.text();
      console.log("[PawaPay] Response status:", response.status);

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
        const rejectionCode = data.rejectionReason?.rejectionCode;
        const rejectionMessage = data.rejectionReason?.rejectionMessage;
        return {
          success: false,
          paymentId,
          provider: this.name,
          status: "failed",
          message: this.translateRejectionCode(rejectionCode, rejectionMessage),
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
    const { data } = payload;
    const status = this.mapStatus(data.status as string);
    const depositId = data.depositId as string;

    if (status === "success") {
      console.log("[PawaPay] Payment confirmed:", depositId);
      return { success: true, message: "Paiement confirmé" };
    } else if (status === "failed") {
      console.log("[PawaPay] Payment failed:", depositId);
      return { success: false, message: "Paiement échoué" };
    }

    return { success: true, message: "Webhook traité" };
  }

  private formatPhoneNumber(phone: string, countryPrefix?: string): string | null {
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
    
    if (cleaned.length === 0) {
      return null;
    }

    // Remove leading zeros
    if (cleaned.startsWith("00")) {
      cleaned = cleaned.substring(2);
    }

    const prefix = countryPrefix || "237";
    
    // If phone doesn't start with the country prefix, add it
    if (!cleaned.startsWith(prefix)) {
      // Remove leading 0 if present
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      cleaned = prefix + cleaned;
    }

    // Validate final format: 10-15 digits starting with country code
    if (/^\d{10,15}$/.test(cleaned)) {
      return cleaned;
    }

    return null;
  }

  private getPhonePrefixForCountry(countryCode?: string): string {
    const prefixMap: Record<string, string> = {
      "CMR": "237",
      "CIV": "225",
      "SEN": "221",
      "BEN": "229",
      "BFA": "226",
      "MLI": "223",
      "TGO": "228",
      "NER": "227",
      "GHA": "233",
      "KEN": "254",
      "TZA": "255",
      "UGA": "256",
      "RWA": "250",
      "ZMB": "260",
      "MWI": "265",
      "COD": "243",
      "COG": "242",
      "GAB": "241",
      "MOZ": "258",
    };
    return prefixMap[countryCode || ""] || "237";
  }

  private truncateDescription(description: string): string {
    const cleaned = description.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    if (cleaned.length < 4) {
      return "PAIEMENT MR SAINT";
    }
    return cleaned.substring(0, 22);
  }

  private getCurrencyForCorrespondent(correspondent?: string): string {
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
      "FREE_SEN": "XOF",
      "ORANGE_BFA": "XOF",
      "MOOV_BFA": "XOF",
      "ORANGE_MLI": "XOF",
      "MOOV_MLI": "XOF",
      "MOOV_TGO": "XOF",
      "AIRTEL_NER": "XOF",
      "VODAFONE_GHA": "GHS",
      "AIRTELTIGO_GHA": "GHS",
      "VODACOM_TZA": "TZS",
      "AIRTEL_TZA": "TZS",
      "TIGO_TZA": "TZS",
      "AIRTEL_RWA": "RWF",
      "AIRTEL_ZMB": "ZMW",
      "AIRTEL_MWI": "MWK",
      "TNM_MWI": "MWK",
      "VODACOM_COD": "CDF",
      "ORANGE_COD": "CDF",
      "AIRTEL_COD": "CDF",
      "MTN_MOMO_COG": "XAF",
      "AIRTEL_COG": "XAF",
      "AIRTEL_GAB": "XAF",
      "VODACOM_MOZ": "MZN",
    };
    return currencyMap[correspondent || this.correspondent || ""] || "XAF";
  }

  private convertToLocalCurrency(
    amount: number,
    sourceCurrency: string,
    countryCode?: string,
    correspondent?: string
  ): number {
    let country = countryCode ? getCountryByCode(countryCode) : null;
    
    if (!country && correspondent) {
      const operatorInfo = getOperatorByCode(correspondent);
      if (operatorInfo) {
        country = operatorInfo.country;
      }
    }

    if (!country) {
      console.warn("[PawaPay] No country found for conversion, using default EUR rate");
      return Math.round(amount * 656);
    }

    let localAmount: number;
    if (sourceCurrency === "EUR") {
      localAmount = amount * country.eurRate;
    } else if (sourceCurrency === "USD") {
      localAmount = amount * country.usdRate;
    } else {
      localAmount = amount;
    }

    return Math.round(localAmount);
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
      let rejectionCode = error.rejectionReason?.rejectionCode;
      let rejectionMessage = error.rejectionReason?.rejectionMessage;
      
      if (rejectionCode) {
        return this.translateRejectionCode(rejectionCode, rejectionMessage);
      }
      if (error.message) {
        return this.translateRejectionCode(null, error.message);
      }
      if (error.error) {
        return this.translateRejectionCode(null, error.error);
      }
    } catch {
      return null;
    }
    return null;
  }

  private translateRejectionCode(code: string | null, originalMessage?: string): string {
    const translations: Record<string, string> = {
      "AMOUNT_TOO_LARGE": "Le montant dépasse la limite autorisée par l'opérateur. Veuillez réduire le montant ou payer en plusieurs fois.",
      "AMOUNT_TOO_SMALL": "Le montant est trop faible pour un paiement Mobile Money.",
      "INVALID_RECIPIENT": "Le numéro de téléphone n'est pas valide pour ce service Mobile Money.",
      "INSUFFICIENT_BALANCE": "Solde insuffisant sur le compte Mobile Money.",
      "RECIPIENT_NOT_FOUND": "Le numéro de téléphone n'est pas associé à un compte Mobile Money.",
      "TRANSACTION_LIMIT_EXCEEDED": "Limite de transactions atteinte. Veuillez réessayer plus tard.",
      "SERVICE_UNAVAILABLE": "Le service Mobile Money est temporairement indisponible.",
      "TIMEOUT": "La transaction a expiré. Veuillez réessayer.",
      "DUPLICATE_TRANSACTION": "Cette transaction a déjà été effectuée.",
    };

    if (code && translations[code]) {
      return translations[code];
    }

    if (originalMessage) {
      if (originalMessage.toLowerCase().includes("amount") && originalMessage.toLowerCase().includes("greater")) {
        return translations["AMOUNT_TOO_LARGE"];
      }
      if (originalMessage.toLowerCase().includes("insufficient")) {
        return translations["INSUFFICIENT_BALANCE"];
      }
    }

    return originalMessage || "Erreur lors du paiement Mobile Money.";
  }
}

export const pawaPayProvider = new PawaPayProvider();
