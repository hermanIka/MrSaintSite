/**
 * PAYMENT MODULE - Routes
 * 
 * Routes API pour le système de paiement modulaire.
 * 
 * ROUTES:
 * - GET /api/payments/providers - Liste des providers disponibles
 * - POST /api/payments/init - Initialiser un paiement
 * - GET /api/payments/verify/:paymentId - Vérifier un paiement
 * - GET /api/payments/paypal/capture - Capture PayPal (callback)
 * - POST /api/webhooks/:provider - Webhooks (avec vérification de signature)
 */

import type { Express, Request, Response, NextFunction } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { paymentService } from "./service";
import { payPalProvider } from "./providers/paypal.provider";
import { maishaPayProvider } from "./providers/maishapay.provider";
import type { PaymentProvider, PaymentInitRequest } from "./types";

const isProduction = process.env.NODE_ENV === "production";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    res.status(429).json({
      success: false,
      message: "Trop de tentatives de paiement. Veuillez réessayer dans une minute.",
    });
    return;
  }

  entry.count++;
  next();
}

setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((_entry, ip) => {
    const entry = rateLimitMap.get(ip);
    if (entry && now > entry.resetAt) rateLimitMap.delete(ip);
  });
}, 60_000);

const pawaPayWebhookSchema = z.object({
  depositId: z.string().min(1),
  status: z.string().min(1),
  amount: z.string().optional(),
  currency: z.string().optional(),
  correspondent: z.string().optional(),
  failureReason: z.object({
    failureCode: z.string().optional(),
    failureMessage: z.string().optional(),
  }).optional(),
}).passthrough();

const maishaPayWebhookSchema = z.object({
  status: z.union([z.string(), z.number()]),
  transactionRefId: z.string().min(1),
  event: z.string().optional(),
  description: z.string().optional(),
}).passthrough();

const paypalWebhookSchema = z.object({
  event_type: z.string().min(1),
  resource: z.record(z.unknown()),
}).passthrough();

function verifyPawaPaySignature(body: string, signature: string | undefined): boolean {
  const webhookSecret = process.env.PAWAPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    if (isProduction) {
      console.warn("[PawaPay] PAWAPAY_WEBHOOK_SECRET not configured - rejecting webhook in production");
      return false;
    }
    return true;
  }
  if (!signature) return false;
  try {
    const computed = createHmac("sha256", webhookSecret).update(body).digest("hex");
    const sigBuf = Buffer.from(signature, "hex");
    const compBuf = Buffer.from(computed, "hex");
    if (sigBuf.length !== compBuf.length) return false;
    return timingSafeEqual(sigBuf, compBuf);
  } catch {
    return false;
  }
}

function verifyMaishaPayCallback(paymentId: string): boolean {
  return /^mp_\d+_[a-z0-9]+$/.test(paymentId);
}

function getRawBody(req: Request): string {
  if (req.rawBody instanceof Buffer) {
    return req.rawBody.toString("utf8");
  }
  return JSON.stringify(req.body);
}

export function registerPaymentRoutes(app: Express): void {
  app.get("/api/payments/providers", (_req: Request, res: Response) => {
    const providers = paymentService.getAvailableProviders();
    res.json({
      success: true,
      providers,
    });
  });

  app.post("/api/payments/init", rateLimitMiddleware, async (req: Request, res: Response) => {
    try {
      const {
        provider,
        amount,
        currency = "EUR",
        serviceId,
        serviceName,
        customerEmail,
        customerName,
        customerPhone,
        correspondent,
        countryCode,
        metadata,
        paymentMode,
        source,
      } = req.body;

      if (!provider || !amount || !serviceId || !serviceName || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: "Paramètres manquants: provider, amount, serviceId, serviceName, customerEmail sont requis.",
        });
      }

      const validProviders: PaymentProvider[] = ["pawapay", "maishapay", "paypal"];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({
          success: false,
          message: `Provider invalide. Valeurs acceptées: ${validProviders.join(", ")}`,
        });
      }

      const request = {
        provider,
        amount: parseFloat(amount),
        currency,
        serviceId,
        serviceName,
        customerEmail,
        customerName,
        customerPhone,
        correspondent,
        countryCode,
        metadata,
        paymentMode: paymentMode || "direct",
        source: source || "reservation",
      };

      const result = await paymentService.initPayment(request);
      
      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("[Payment] Init error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne lors de l'initialisation du paiement.",
      });
    }
  });

  app.get("/api/payments/verify/:paymentId", rateLimitMiddleware, async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { provider } = req.query;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: "paymentId requis.",
        });
      }

      const payment = await paymentService.getPayment(paymentId);
      const paymentProvider = (provider as PaymentProvider) || payment?.provider;

      if (!paymentProvider) {
        return res.status(400).json({
          success: false,
          message: "Provider introuvable pour ce paiement.",
        });
      }

      const result = await paymentService.verifyPayment({
        paymentId,
        provider: paymentProvider,
        externalId: payment?.externalId,
      });

      res.json({
        success: result.success,
        paymentId: result.paymentId,
        status: result.status,
        message: result.message,
      });
    } catch (error) {
      console.error("[Payment] Verify error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification du paiement.",
      });
    }
  });

  app.get("/api/payments/paypal/capture", async (req: Request, res: Response) => {
    try {
      const { token, payment_id } = req.query;
      
      if (!token) {
        return res.redirect("/reservation?payment=error&message=token_missing");
      }

      const captureResult = await payPalProvider.capturePayment(token as string);
      
      if (captureResult.success) {
        if (payment_id) {
          await paymentService.updatePaymentStatus(payment_id as string, "success", token as string);
        }
        return res.redirect(`/reservation?payment=success&id=${payment_id || token}`);
      } else {
        return res.redirect(`/reservation?payment=failed&message=${encodeURIComponent(captureResult.message || "capture_failed")}`);
      }
    } catch (error) {
      console.error("[Payment] PayPal capture error:", error);
      res.redirect("/reservation?payment=error&message=internal_error");
    }
  });

  app.get("/api/payments/maishapay/callback/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { status, description, transactionRefId } = req.query;

      if (!verifyMaishaPayCallback(paymentId)) {
        console.warn("[MaishaPay] Callback rejected - invalid paymentId format:", paymentId);
        return res.redirect("/reservation?payment=error&message=invalid_payment");
      }

      const existingPayment = await paymentService.getPayment(paymentId);
      if (!existingPayment) {
        console.warn("[MaishaPay] Callback rejected - payment not found in DB:", paymentId);
        return res.redirect("/reservation?payment=error&message=payment_not_found");
      }

      const paymentSource = (existingPayment as any).source || "reservation";
      const returnPath = paymentSource === "visa" ? "/facilitation-visa"
                       : paymentSource === "agence" ? "/creation-agence"
                       : "/reservation";

      if (existingPayment.status === "success") {
        return res.redirect(`${returnPath}?payment=success&id=${paymentId}&provider=maishapay`);
      }

      if (existingPayment.status !== "pending" && existingPayment.status !== "processing") {
        console.warn("[MaishaPay] Callback rejected - payment not in pending state:", paymentId, existingPayment.status);
        return res.redirect(`${returnPath}?payment=error&message=invalid_state`);
      }

      if (!isProduction) {
        console.log("[MaishaPay] Callback for:", paymentId, "status:", status);
      }

      const isSuccess = status === "202" || status === "200";
      
      if (isSuccess) {
        await paymentService.updatePaymentStatus(paymentId, "success", (transactionRefId as string) || paymentId);
      } else {
        await paymentService.updatePaymentStatus(paymentId, "failed");
      }

      const paymentResult = isSuccess ? "success" : "failed";
      const message = description ? encodeURIComponent(description as string) : "";
      
      res.redirect(`${returnPath}?payment=${paymentResult}&id=${paymentId}&provider=maishapay${message ? `&message=${message}` : ""}`);
    } catch (error) {
      console.error("[MaishaPay] Callback error:", error instanceof Error ? error.message : "unknown");
      res.redirect("/reservation?payment=error&message=callback_error");
    }
  });

  app.get("/api/payments/maishapay/redirect", async (req: Request, res: Response) => {
    try {
      const { paymentId, amount, currency } = req.query;

      if (!paymentId || !amount) {
        return res.status(400).send("Paramètres manquants");
      }

      if (!maishaPayProvider.isConfigured()) {
        return res.status(500).send("MaishaPay n'est pas configuré");
      }

      const existingPayment = await paymentService.getPayment(paymentId as string);
      if (!existingPayment) {
        return res.status(400).send("Paiement introuvable");
      }
      if (existingPayment.amount !== parseFloat(amount as string)) {
        console.warn("[MaishaPay] Redirect amount mismatch for:", paymentId);
        return res.status(400).send("Montant invalide");
      }

      const appUrl = process.env.APP_URL 
        ? process.env.APP_URL 
        : process.env.REPLIT_DEPLOYMENTS_URL
          ? `https://${process.env.REPLIT_DEPLOYMENTS_URL}`
          : process.env.REPLIT_DEV_DOMAIN 
            ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
            : "http://localhost:5000";

      const callbackUrl = `${appUrl}/api/payments/maishapay/callback/${paymentId}`;
      
      const checkoutUrl = await maishaPayProvider.getServerSideCheckoutUrl(
        paymentId as string,
        existingPayment.amount,
        (currency as string) || "USD",
        callbackUrl
      );

      if (checkoutUrl) {
        return res.redirect(checkoutUrl);
      }

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Erreur de paiement</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #000; color: #F2C94C; font-family: 'Inter', sans-serif; }
    .loader { text-align: center; }
  </style>
</head>
<body>
  <div class="loader">
    <p>Impossible d'initialiser le paiement par carte. Veuillez réessayer.</p>
    <p style="font-size: 12px; opacity: 0.7;"><a href="/reservation" style="color: #F2C94C;">Retour à la réservation</a></p>
  </div>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("[MaishaPay] Redirect error:", error instanceof Error ? error.message : "unknown");
      res.status(500).send("Erreur lors de la redirection vers MaishaPay");
    }
  });

  app.get("/api/payments/status/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const payment = await paymentService.getPayment(paymentId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Paiement introuvable.",
        });
      }

      res.json({
        success: true,
        status: payment.status,
        provider: payment.provider,
        amount: payment.amount,
        currency: payment.currency,
      });
    } catch (error) {
      console.error("[Payment] Status check error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification du statut.",
      });
    }
  });

  app.post("/api/webhooks/pawapay", async (req: Request, res: Response) => {
    try {
      const rawBody = getRawBody(req);
      const signature = req.headers["x-pawapay-signature"] as string | undefined;

      if (!verifyPawaPaySignature(rawBody, signature)) {
        console.warn("[Webhook] PawaPay signature verification failed");
        return res.status(401).json({ success: false, message: "Signature invalide" });
      }

      const parsed = pawaPayWebhookSchema.safeParse(req.body);
      if (!parsed.success) {
        console.warn("[Webhook] PawaPay invalid payload:", parsed.error.message);
        return res.status(400).json({ success: false, message: "Payload invalide" });
      }

      const result = await paymentService.handleWebhook("pawapay", {
        provider: "pawapay",
        event: req.body.event || "deposit.completed",
        data: parsed.data,
        signature,
      });

      res.json(result);
    } catch (error) {
      console.error("[Webhook] PawaPay error:", error instanceof Error ? error.message : "unknown");
      res.status(500).json({ success: false, message: "Erreur webhook" });
    }
  });

  app.post("/api/webhooks/maishapay", async (req: Request, res: Response) => {
    try {
      const webhookSecret = process.env.MAISHAPAY_WEBHOOK_SECRET;
      if (webhookSecret) {
        const providedSecret = req.headers["x-maishapay-secret"] as string | undefined;
        if (providedSecret !== webhookSecret) {
          console.warn("[Webhook] MaishaPay secret mismatch");
          return res.status(401).json({ success: false, message: "Signature invalide" });
        }
      } else if (isProduction) {
        console.warn("[Webhook] MAISHAPAY_WEBHOOK_SECRET not configured - rejecting in production");
        return res.status(401).json({ success: false, message: "Webhook non configuré" });
      }

      const parsed = maishaPayWebhookSchema.safeParse(req.body);
      if (!parsed.success) {
        console.warn("[Webhook] MaishaPay invalid payload:", parsed.error.message);
        return res.status(400).json({ success: false, message: "Payload invalide" });
      }

      const result = await paymentService.handleWebhook("maishapay", {
        provider: "maishapay",
        event: req.body.event || String(req.body.status) || "unknown",
        data: parsed.data,
        signature: req.headers["x-maishapay-secret"] as string,
      });
      res.json(result);
    } catch (error) {
      console.error("[Webhook] MaishaPay error:", error instanceof Error ? error.message : "unknown");
      res.status(500).json({ success: false, message: "Erreur webhook" });
    }
  });

  app.post("/api/webhooks/paypal", async (req: Request, res: Response) => {
    try {
      const rawBody = getRawBody(req);
      const headerMap: Record<string, string | undefined> = {
        "paypal-auth-algo": req.headers["paypal-auth-algo"] as string | undefined,
        "paypal-cert-url": req.headers["paypal-cert-url"] as string | undefined,
        "paypal-transmission-id": req.headers["paypal-transmission-id"] as string | undefined,
        "paypal-transmission-sig": req.headers["paypal-transmission-sig"] as string | undefined,
        "paypal-transmission-time": req.headers["paypal-transmission-time"] as string | undefined,
      };

      const isVerified = await payPalProvider.verifyWebhookSignature(headerMap, rawBody);
      if (!isVerified) {
        console.warn("[Webhook] PayPal signature verification failed");
        return res.status(401).json({ success: false, message: "Signature invalide" });
      }

      const parsed = paypalWebhookSchema.safeParse(req.body);
      if (!parsed.success) {
        console.warn("[Webhook] PayPal invalid payload:", parsed.error.message);
        return res.status(400).json({ success: false, message: "Payload invalide" });
      }

      const result = await paymentService.handleWebhook("paypal", {
        provider: "paypal",
        event: parsed.data.event_type,
        data: parsed.data.resource || parsed.data,
        signature: req.headers["paypal-transmission-sig"] as string,
      });

      res.json(result);
    } catch (error) {
      console.error("[Webhook] PayPal error:", error instanceof Error ? error.message : "unknown");
      res.status(500).json({ success: false, message: "Erreur webhook" });
    }
  });
}
