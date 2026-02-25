import { randomUUID } from "crypto";
import { goPlusStorage } from "./storage";
import { MaishaPayProvider } from "../payment/providers/maishapay.provider";
import { PawaPayProvider } from "../payment/providers/pawapay.provider";
import { Resend } from "resend";
import type { GoPlusCard, GoPlusPlan } from "@shared/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

function getAppUrl(): string {
  return process.env.APP_URL
    ? process.env.APP_URL
    : process.env.REPLIT_DEPLOYMENTS_URL
      ? `https://${process.env.REPLIT_DEPLOYMENTS_URL}`
      : process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : "http://localhost:5000";
}

const maishaPayProvider = new MaishaPayProvider();
const pawaPayProvider = new PawaPayProvider();

export class GoPlusService {
  async initPurchase(
    userId: string,
    planId: string,
    provider: "maishapay" | "pawapay",
    phoneNumber?: string,
    correspondent?: string,
    countryCode?: string,
  ) {
    const plan = await goPlusStorage.getGoPlusPlanById(planId);
    if (!plan) throw new Error("Plan GO+ introuvable");
    if (!plan.isActive) throw new Error("Ce plan GO+ n'est plus disponible");

    const now = new Date().toISOString();
    const transaction = await goPlusStorage.createGoPlusTransaction({
      userId,
      planId,
      provider,
      providerPaymentId: null,
      amount: plan.price,
      currency: plan.currency,
      status: "pending",
      rawWebhookPayload: null,
      createdAt: now,
      updatedAt: now,
    });

    const appUrl = getAppUrl();
    const callbackUrl = `${appUrl}/api/payments/maishapay/go-plus/callback/${transaction.id}`;

    if (provider === "maishapay") {
      const result = await maishaPayProvider.initPayment({
        provider: "maishapay",
        amount: plan.price / 100,
        currency: "USD",
        serviceId: `go-plus-${plan.id}`,
        serviceName: `Carte GO+ ${plan.name}`,
        customerEmail: userId,
        customerName: userId,
        metadata: { goPlusTransactionId: transaction.id, planId: plan.id },
      });

      if (!result.success) {
        await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, "failed");
        return { success: false, message: result.message || "Échec de l'initialisation du paiement" };
      }

      const providerPaymentId = result.externalId || result.paymentId;
      await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, "pending", providerPaymentId);

      return {
        success: true,
        transactionId: transaction.id,
        provider: "maishapay",
        redirectUrl: result.redirectUrl || result.checkoutUrl,
        checkoutUrl: result.checkoutUrl,
        status: "pending",
        message: "Redirection vers la page de paiement...",
      };
    }

    if (provider === "pawapay") {
      const result = await pawaPayProvider.initPayment({
        provider: "pawapay",
        amount: plan.price / 100,
        currency: "EUR",
        serviceId: `go-plus-${plan.id}`,
        serviceName: `Carte GO+ ${plan.name}`,
        customerEmail: userId,
        customerPhone: phoneNumber,
        correspondent,
        countryCode,
        metadata: { goPlusTransactionId: transaction.id, planId: plan.id },
      });

      const providerPaymentId = result.externalId || result.paymentId;
      await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, "pending", providerPaymentId);

      return {
        success: result.success,
        transactionId: transaction.id,
        provider: "pawapay",
        status: "pending",
        message: result.success
          ? "Demande de paiement envoyée. Veuillez confirmer sur votre téléphone."
          : result.message || "Échec de l'initialisation du paiement Mobile Money",
      };
    }

    throw new Error("Provider non supporté");
  }

  async activateCard(transactionId: string): Promise<GoPlusCard | null> {
    const transaction = await goPlusStorage.getGoPlusTransactionById(transactionId);
    if (!transaction) return null;
    if (transaction.status !== "paid") return null;

    const existingCard = await goPlusStorage.getUserActiveGoPlusCard(transaction.userId);
    if (existingCard && existingCard.planId === transaction.planId) {
      return existingCard;
    }

    const plan = await goPlusStorage.getGoPlusPlanById(transaction.planId);
    if (!plan) return null;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const card = await goPlusStorage.createGoPlusCard({
      userId: transaction.userId,
      planId: transaction.planId,
      cardNumber: randomUUID().toUpperCase(),
      status: "active",
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    try {
      const expiryFormatted = endDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      await resend.emails.send({
        from: "Mr Saint <onboarding@resend.dev>",
        to: transaction.userId,
        subject: `Votre carte GO+ Mr Saint est activée !`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head><meta charset="UTF-8" /></head>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#1a1200,#2d1f00);padding:36px 40px;text-align:center;border-bottom:2px solid #F2C94C;">
                      <p style="margin:0 0 8px;color:#F2C94C;font-size:13px;letter-spacing:3px;text-transform:uppercase;">Mr Saint Travel</p>
                      <h1 style="margin:0;color:#F2C94C;font-size:32px;font-weight:900;letter-spacing:-0.5px;">GO+</h1>
                      <p style="margin:8px 0 0;color:#fff;font-size:15px;opacity:0.8;">Programme Fidélité</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 40px;">
                      <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Votre carte est activée !</h2>
                      <p style="margin:0 0 28px;color:#aaa;font-size:15px;line-height:1.6;">
                        Félicitations ! Votre carte <strong style="color:#F2C94C;">GO+ ${plan.name}</strong> est désormais active.
                        Vous bénéficiez d'une réduction de <strong style="color:#F2C94C;">${plan.discountPercentage}%</strong> sur tous les services Mr Saint.
                      </p>

                      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:24px;margin-bottom:28px;">
                        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Numéro de carte</p>
                        <p style="margin:0;color:#F2C94C;font-size:16px;font-family:monospace;font-weight:700;word-break:break-all;">${card.cardNumber}</p>
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;width:48%;">
                            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Plan</p>
                            <p style="margin:0;color:#fff;font-size:15px;font-weight:600;">${plan.name}</p>
                          </td>
                          <td style="width:4%;"></td>
                          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;width:48%;">
                            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Expire le</p>
                            <p style="margin:0;color:#fff;font-size:15px;font-weight:600;">${expiryFormatted}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;color:#666;font-size:13px;line-height:1.7;border-top:1px solid #222;padding-top:20px;">
                        Conservez ce numéro de carte précieusement. Il vous sera demandé lors de vos réservations pour bénéficier de votre réduction.<br/><br/>
                        Merci de votre confiance,<br/>
                        <strong style="color:#F2C94C;">L'équipe Mr Saint Travel</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      });
      console.log(`[GoPlusService] Email carte GO+ envoyé à ${transaction.userId}`);
    } catch (emailErr) {
      console.error(`[GoPlusService] Échec envoi email carte GO+ à ${transaction.userId}:`, emailErr);
    }

    return card;
  }

  async handleWebhookMaishaPay(payload: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    try {
      const transactionId = (payload.metadata as Record<string, string>)?.goPlusTransactionId
        || String(payload.transactionReference || "").replace(/^mp_\d+_/, "");

      const reference = String(payload.transactionReference || "");
      const transaction = transactionId
        ? await goPlusStorage.getGoPlusTransactionById(transactionId)
        : await goPlusStorage.getGoPlusTransactionByProviderPaymentId(reference);

      if (!transaction) {
        console.warn("[GoPlusService] Webhook MaishaPay: transaction introuvable", payload);
        return { success: false, message: "Transaction introuvable" };
      }

      const status = Number(payload.status);
      const isSuccess = status === 200 || status === 202;

      await goPlusStorage.updateGoPlusTransactionStatus(
        transaction.id,
        isSuccess ? "paid" : "failed",
        reference,
      );

      await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, isSuccess ? "paid" : "failed");

      if (transaction.status !== "paid" && isSuccess) {
        await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, "paid", reference);
        await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, "paid");
        await this.activateCard(transaction.id);
      }

      const rawPayload = JSON.stringify(payload);
      await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, isSuccess ? "paid" : "failed", reference);

      return { success: true, message: isSuccess ? "Carte GO+ activée" : "Paiement échoué" };
    } catch (err) {
      console.error("[GoPlusService] Erreur webhook MaishaPay:", err);
      return { success: false, message: "Erreur traitement webhook" };
    }
  }

  async handleWebhookPawaPay(payload: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    try {
      const depositId = String(payload.depositId || "");
      const transaction = await goPlusStorage.getGoPlusTransactionByProviderPaymentId(depositId);

      if (!transaction) {
        console.warn("[GoPlusService] Webhook PawaPay: transaction introuvable pour depositId:", depositId);
        return { success: false, message: "Transaction introuvable" };
      }

      const externalStatus = String(payload.status || "");
      const isSuccess = externalStatus === "COMPLETED";
      const isFailed = externalStatus === "FAILED" || externalStatus === "REJECTED" || externalStatus === "TIMED_OUT";

      if (isSuccess) {
        await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, "paid", depositId);
        await this.activateCard(transaction.id);
      } else if (isFailed) {
        await goPlusStorage.updateGoPlusTransactionStatus(transaction.id, "failed", depositId);
      }

      return { success: true, message: isSuccess ? "Carte GO+ activée" : "Statut mis à jour" };
    } catch (err) {
      console.error("[GoPlusService] Erreur webhook PawaPay:", err);
      return { success: false, message: "Erreur traitement webhook" };
    }
  }

  async getUserActiveGoPlus(userId: string): Promise<{
    status: "active" | "expired" | "none";
    card?: GoPlusCard;
    plan?: GoPlusPlan;
  }> {
    const card = await goPlusStorage.getUserActiveGoPlusCard(userId);
    if (!card) return { status: "none" };

    if (card.endDate && new Date(card.endDate) < new Date()) {
      await goPlusStorage.updateGoPlusCardStatus(card.id, "expired");
      return { status: "expired", card };
    }

    const plan = await goPlusStorage.getGoPlusPlanById(card.planId);
    return { status: "active", card, plan: plan || undefined };
  }

  async applyGoPlusDiscount(userId: string, servicePrice: number): Promise<{
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    hasActiveCard: boolean;
  }> {
    const { status, plan } = await this.getUserActiveGoPlus(userId);

    if (status !== "active" || !plan) {
      return {
        originalPrice: servicePrice,
        finalPrice: servicePrice,
        discountAmount: 0,
        discountPercentage: 0,
        hasActiveCard: false,
      };
    }

    const discountAmount = Math.round(servicePrice * plan.discountPercentage / 100);
    const finalPrice = servicePrice - discountAmount;

    console.log(`[GoPlusService] Réduction appliquée pour ${userId}: -${plan.discountPercentage}% (-${discountAmount}€)`);

    return {
      originalPrice: servicePrice,
      finalPrice,
      discountAmount,
      discountPercentage: plan.discountPercentage,
      hasActiveCard: true,
    };
  }
}

export const goPlusService = new GoPlusService();
