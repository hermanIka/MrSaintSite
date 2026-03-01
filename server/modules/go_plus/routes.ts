import type { Express } from "express";
import { goPlusStorage } from "./storage";
import { goPlusService } from "./service";
import { z } from "zod";

function getAppUrl(): string {
  return process.env.APP_URL || "http://localhost:5000";
}

const purchaseSchema = z.object({
  userId: z.string().email("Email requis"),
  planId: z.string().min(1, "Plan requis"),
  provider: z.enum(["maishapay", "pawapay"]),
  phoneNumber: z.string().optional(),
  correspondent: z.string().optional(),
  countryCode: z.string().optional(),
});

export function registerGoPlusRoutes(app: Express) {
  app.get("/api/go-plus/plans", async (_req, res) => {
    try {
      const plans = await goPlusStorage.getAllGoPlusPlans();
      const activePlans = plans
        .filter(p => p.isActive)
        .map(p => ({
          ...p,
          price: p.price / 100,
          privileges: JSON.parse(p.privileges),
        }));
      res.json({ success: true, plans: activePlans });
    } catch (err) {
      console.error("[GoPlusRoutes] Erreur GET /plans:", err);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  });

  app.post("/api/go-plus/purchase", async (req, res) => {
    try {
      const parsed = purchaseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      }
      const { userId, planId, provider, phoneNumber, correspondent, countryCode } = parsed.data;
      const result = await goPlusService.initPurchase(userId, planId, provider, phoneNumber, correspondent, countryCode);
      res.json(result);
    } catch (err: any) {
      console.error("[GoPlusRoutes] Erreur POST /purchase:", err);
      res.status(400).json({ success: false, message: err.message || "Erreur lors de l'achat" });
    }
  });

  app.get("/api/go-plus/card/:userId", async (req, res) => {
    try {
      const userId = decodeURIComponent(req.params.userId);
      const result = await goPlusService.getUserActiveGoPlus(userId);

      if (result.status === "none") {
        return res.json({ success: true, status: "none" });
      }

      const card = result.card!;
      const plan = result.plan;

      res.json({
        success: true,
        status: result.status,
        card: {
          ...card,
          planName: plan?.name,
          discountPercentage: plan?.discountPercentage,
        },
        plan: plan
          ? { ...plan, price: plan.price / 100, privileges: JSON.parse(plan.privileges) }
          : undefined,
      });
    } catch (err) {
      console.error("[GoPlusRoutes] Erreur GET /card/:userId:", err);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  });

  app.get("/api/go-plus/verify/:transactionId", async (req, res) => {
    try {
      const tx = await goPlusStorage.getGoPlusTransactionById(req.params.transactionId);
      if (!tx) return res.status(404).json({ success: false, message: "Transaction introuvable" });

      if (tx.status === "paid") {
        const card = await goPlusStorage.getUserActiveGoPlusCard(tx.userId);
        return res.json({
          success: true,
          status: "paid",
          cardNumber: card?.cardNumber || null,
        });
      }

      res.json({ success: true, status: tx.status });
    } catch (err) {
      console.error("[GoPlusRoutes] Erreur GET /verify/:transactionId:", err);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  });

  app.post("/api/webhooks/maishapay/go-plus", async (req, res) => {
    try {
      const result = await goPlusService.handleWebhookMaishaPay(req.body);
      res.json(result);
    } catch (err) {
      console.error("[GoPlusRoutes] Erreur webhook MaishaPay:", err);
      res.status(500).json({ success: false, message: "Erreur traitement webhook" });
    }
  });

  app.post("/api/webhooks/pawapay/go-plus", async (req, res) => {
    try {
      const result = await goPlusService.handleWebhookPawaPay(req.body);
      res.json(result);
    } catch (err) {
      console.error("[GoPlusRoutes] Erreur webhook PawaPay:", err);
      res.status(500).json({ success: false, message: "Erreur traitement webhook" });
    }
  });

  app.get("/api/payments/maishapay/go-plus/callback/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const tx = await goPlusStorage.getGoPlusTransactionById(transactionId);

      if (!tx) {
        return res.redirect(`/go-plus/failed?reason=transaction_not_found`);
      }

      if (tx.status === "paid") {
        const card = await goPlusService.activateCard(transactionId);
        const cardNumber = card?.cardNumber || "";
        return res.redirect(`/go-plus/success?cardNumber=${cardNumber}&plan=${tx.planId}`);
      }

      return res.redirect(`/go-plus/failed?transactionId=${transactionId}`);
    } catch (err) {
      console.error("[GoPlusRoutes] Erreur callback MaishaPay:", err);
      res.redirect("/go-plus/failed");
    }
  });
}
