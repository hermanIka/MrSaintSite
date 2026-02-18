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
 * - POST /api/webhooks/:provider - Webhooks
 */

import type { Express, Request, Response } from "express";
import { paymentService } from "./service";
import { payPalProvider } from "./providers/paypal.provider";
import { maishaPayProvider } from "./providers/maishapay.provider";
import type { PaymentProvider, PaymentInitRequest } from "./types";

export function registerPaymentRoutes(app: Express): void {
  app.get("/api/payments/providers", (_req: Request, res: Response) => {
    const providers = paymentService.getAvailableProviders();
    res.json({
      success: true,
      providers,
    });
  });

  app.post("/api/payments/init", async (req: Request, res: Response) => {
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

      const request: PaymentInitRequest = {
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

  app.get("/api/payments/verify/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { provider } = req.query;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: "paymentId requis.",
        });
      }

      const payment = paymentService.getPayment(paymentId);
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

      res.json(result);
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
          paymentService.updatePaymentStatus(payment_id as string, "success", token as string);
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

  app.get("/api/payments/maishapay/callback/:paymentId", (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { status, description, transactionRefId, operatorRefId } = req.query;

      console.log("[MaishaPay] Callback received for:", paymentId, "status:", status, "desc:", description, "ref:", transactionRefId);

      const isSuccess = status === "202" || status === "200";
      
      if (isSuccess) {
        paymentService.updatePaymentStatus(paymentId, "success", (transactionRefId as string) || paymentId);
      }

      const paymentResult = isSuccess ? "success" : "failed";
      const message = description ? encodeURIComponent(description as string) : "";
      
      res.redirect(`/reservation?payment=${paymentResult}&id=${paymentId}&provider=maishapay${message ? `&message=${message}` : ""}`);
    } catch (error) {
      console.error("[MaishaPay] Callback error:", error);
      res.redirect("/reservation?payment=error&message=callback_error");
    }
  });

  app.get("/api/payments/maishapay/redirect", (req: Request, res: Response) => {
    try {
      const { paymentId, amount, currency } = req.query;

      if (!paymentId || !amount) {
        return res.status(400).send("Paramètres manquants");
      }

      if (!maishaPayProvider.isConfigured()) {
        return res.status(500).send("MaishaPay n'est pas configuré");
      }

      const appUrl = process.env.APP_URL 
        ? process.env.APP_URL 
        : process.env.REPLIT_DEPLOYMENTS_URL
          ? `https://${process.env.REPLIT_DEPLOYMENTS_URL}`
          : process.env.REPLIT_DEV_DOMAIN 
            ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
            : "http://localhost:5000";

      const callbackUrl = `${appUrl}/api/payments/maishapay/callback/${paymentId}`;
      const formData = maishaPayProvider.getCheckoutFormData(
        paymentId as string,
        parseFloat(amount as string),
        (currency as string) || "USD",
        callbackUrl
      );
      const checkoutUrl = maishaPayProvider.getCheckoutUrl();

      const formFields = Object.entries(formData)
        .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
        .join("\n        ");

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Redirection vers MaishaPay...</title>
  <style>
    body { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      margin: 0; 
      background: #000; 
      color: #F2C94C; 
      font-family: 'Inter', sans-serif;
    }
    .loader { 
      text-align: center; 
    }
    .spinner {
      border: 4px solid rgba(242,201,76,0.3);
      border-top: 4px solid #F2C94C;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Redirection vers MaishaPay en cours...</p>
    <p style="font-size: 12px; opacity: 0.7;">Veuillez patienter, ne fermez pas cette page.</p>
  </div>
  <form id="maishapayForm" action="${checkoutUrl}" method="POST" style="display:none;">
        ${formFields}
  </form>
  <script>
    document.getElementById('maishapayForm').submit();
  </script>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("[MaishaPay] Redirect error:", error);
      res.status(500).send("Erreur lors de la redirection vers MaishaPay");
    }
  });

  app.post("/api/webhooks/pawapay", async (req: Request, res: Response) => {
    try {
      const result = await paymentService.handleWebhook("pawapay", {
        provider: "pawapay",
        event: req.body.event || "deposit.completed",
        data: req.body,
        signature: req.headers["x-pawapay-signature"] as string,
      });

      res.json(result);
    } catch (error) {
      console.error("[Webhook] PawaPay error:", error);
      res.status(500).json({ success: false, message: "Erreur webhook" });
    }
  });

  app.post("/api/webhooks/maishapay", async (req: Request, res: Response) => {
    try {
      const result = await paymentService.handleWebhook("maishapay", {
        provider: "maishapay",
        event: req.body.event || req.body.status || "unknown",
        data: req.body,
        signature: req.headers["x-maishapay-signature"] as string,
      });
      res.json(result);
    } catch (error) {
      console.error("[Webhook] MaishaPay error:", error);
      res.status(500).json({ success: false, message: "Erreur webhook" });
    }
  });

  app.post("/api/webhooks/paypal", async (req: Request, res: Response) => {
    try {
      const result = await paymentService.handleWebhook("paypal", {
        provider: "paypal",
        event: req.body.event_type || "unknown",
        data: req.body.resource || req.body,
        signature: req.headers["paypal-transmission-sig"] as string,
      });

      res.json(result);
    } catch (error) {
      console.error("[Webhook] PayPal error:", error);
      res.status(500).json({ success: false, message: "Erreur webhook" });
    }
  });
}
