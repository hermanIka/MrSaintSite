/**
 * PAYMENT MODULE - Types
 * 
 * Types partagés pour le système de paiement modulaire.
 * Supporte 3 providers : PawaPay (Mobile Money), MaishaPay (Carte), PayPal
 */

export type PaymentProvider = "pawapay" | "maishapay" | "paypal";

export type PaymentStatus = "pending" | "processing" | "success" | "failed" | "cancelled";

export interface PaymentInitRequest {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  serviceId: string;
  serviceName: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  correspondent?: string;
  countryCode?: string;
  metadata?: Record<string, string>;
}

export interface PaymentInitResponse {
  success: boolean;
  paymentId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  redirectUrl?: string;
  checkoutUrl?: string;
  externalId?: string;
  message?: string;
}

export interface PaymentVerifyRequest {
  paymentId: string;
  provider: PaymentProvider;
  externalId?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  paidAt?: string;
  message?: string;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  event: string;
  data: Record<string, unknown>;
  signature?: string;
}

export interface PaymentProviderInterface {
  name: PaymentProvider;
  initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
  verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse>;
  handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }>;
  isConfigured(): boolean;
}

export interface PaymentRecord {
  id: string;
  provider: PaymentProvider;
  externalId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  serviceId: string;
  serviceName: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}
