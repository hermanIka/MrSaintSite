import type { Express, Request, Response } from "express";
import { z } from "zod";
import { paymentService } from "../payment/service";
import {
  findOrCreateClient,
  createReservation,
  finalizeReservation,
  linkPaymentToReservation,
  getAllReservationsWithDetails,
  getReservationDetail,
  updateReservationStatus,
} from "./service";
import { db } from "../../db";
import { tripReservations } from "@shared/schema";
import { eq } from "drizzle-orm";

const reserveSchema = z.object({
  provider: z.enum(["maishapay", "pawapay"]),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  numberOfPeople: z.number().int().min(1).max(50),
  travelDate: z.string().optional(),
  notes: z.string().optional(),
  correspondent: z.string().optional(),
  countryCode: z.string().optional(),
});

export function registerReservationRoutes(app: Express): void {
  app.post("/api/trips/:tripId/reserve", async (req: Request, res: Response) => {
    try {
      const { tripId } = req.params;
      const parsed = reserveSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Données invalides.", errors: parsed.error.flatten() });
      }

      const { provider, fullName, email, phone, numberOfPeople, travelDate, notes, correspondent, countryCode } = parsed.data;

      const { trips } = await import("@shared/schema");
      const tripRows = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
      const trip = tripRows[0];
      if (!trip) {
        return res.status(404).json({ success: false, message: "Voyage introuvable." });
      }

      const totalPrice = trip.price * numberOfPeople;
      const paymentAmount = (trip.hasDeposit && trip.depositAmount > 0)
        ? trip.depositAmount * numberOfPeople
        : totalPrice;
      const client = await findOrCreateClient(email, fullName, phone);
      const reservationId = await createReservation({ clientId: client.id, tripId, numberOfPeople, totalPrice, travelDate, notes });

      const appUrl = process.env.APP_URL || "http://localhost:5000";
      const paymentResult = await paymentService.initPayment({
        provider,
        amount: paymentAmount,
        currency: "EUR",
        serviceId: `trip_${tripId}`,
        serviceName: `Voyage — ${trip.title}`,
        customerEmail: email,
        customerName: fullName,
        customerPhone: phone,
        correspondent,
        countryCode,
        paymentMode: "direct",
        source: "trip_reservation",
        metadata: {
          reservationId,
          tripId,
          numberOfPeople: String(numberOfPeople),
        },
      });

      if (!paymentResult.success) {
        return res.status(400).json({ success: false, message: paymentResult.message || "Erreur de paiement." });
      }

      await linkPaymentToReservation(reservationId, paymentResult.paymentId, provider);

      return res.json({
        success: true,
        reservationId,
        paymentId: paymentResult.paymentId,
        provider,
        redirectUrl: paymentResult.redirectUrl,
        checkoutUrl: paymentResult.checkoutUrl,
        externalId: paymentResult.externalId,
        amount: paymentAmount,
      });
    } catch (err) {
      console.error("[Reservation] Error:", err);
      return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
  });

  app.get("/api/trips/reservations/verify/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const providerParam = (req.query.provider as string) || "maishapay";
      const provider = providerParam as "maishapay" | "pawapay";

      const verifyResult = await paymentService.verifyPayment({ paymentId, provider });

      if (verifyResult.status === "success") {
        const reservations = await db.select().from(tripReservations).where(eq(tripReservations.paymentId, paymentId)).limit(1);
        if (reservations.length > 0 && reservations[0].paymentStatus !== "paid") {
          await finalizeReservation(paymentId, verifyResult.amount || reservations[0].totalPrice, provider);
        }
        return res.json({ success: true, status: "success", amount: verifyResult.amount });
      }

      return res.json({ success: true, status: verifyResult.status });
    } catch (err) {
      console.error("[Reservation] Verify error:", err);
      return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
  });
}
