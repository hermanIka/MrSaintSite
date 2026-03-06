import { db } from "../../db";
import { tripClients, tripReservations, tripInvoices, trips } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";
import { randomUUID } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `MRS-${year}${month}-${rand}`;
}

export async function findOrCreateClient(email: string, fullName: string, phone: string) {
  const now = new Date().toISOString();
  const existing = await db.select().from(tripClients).where(eq(tripClients.email, email)).limit(1);
  if (existing.length > 0) {
    await db.update(tripClients).set({ fullName, phone, updatedAt: now }).where(eq(tripClients.id, existing[0].id));
    return { ...existing[0], fullName, phone };
  }
  const id = randomUUID();
  await db.insert(tripClients).values({ id, fullName, email, phone, createdAt: now, updatedAt: now });
  return { id, fullName, email, phone, createdAt: now, updatedAt: now };
}

export async function createReservation(data: {
  clientId: string;
  tripId: string;
  numberOfPeople: number;
  totalPrice: number;
  travelDate?: string;
  notes?: string;
}) {
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.insert(tripReservations).values({
    id,
    clientId: data.clientId,
    tripId: data.tripId,
    numberOfPeople: data.numberOfPeople,
    totalPrice: data.totalPrice,
    amountPaid: 0,
    paymentStatus: "pending",
    travelDate: data.travelDate || null,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function finalizeReservation(paymentId: string, amount: number, provider: string) {
  const now = new Date().toISOString();

  const reservations = await db.select().from(tripReservations).where(eq(tripReservations.paymentId, paymentId)).limit(1);
  if (reservations.length === 0) return null;

  const reservation = reservations[0];

  await db.update(tripReservations).set({
    paymentStatus: "paid",
    amountPaid: amount,
    paymentProvider: provider,
    updatedAt: now,
  }).where(eq(tripReservations.id, reservation.id));

  const clients = await db.select().from(tripClients).where(eq(tripClients.id, reservation.clientId)).limit(1);
  const client = clients[0];

  const tripsResult = await db.select().from(trips).where(eq(trips.id, reservation.tripId)).limit(1);
  const trip = tripsResult[0];

  const invoiceNumber = generateInvoiceNumber();
  const invoiceId = randomUUID();
  const serviceDescription = trip
    ? `Voyage — ${trip.title} · ${trip.destination} · ${reservation.numberOfPeople} personne(s)`
    : `Réservation voyage · ${reservation.numberOfPeople} personne(s)`;

  await db.insert(tripInvoices).values({
    id: invoiceId,
    reservationId: reservation.id,
    invoiceNumber,
    clientName: client?.fullName || "Client",
    clientEmail: client?.email || "",
    serviceDescription,
    amount,
    currency: "EUR",
    issueDate: now.substring(0, 10),
    createdAt: now,
  });

  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "matandusaint@gmail.com";
    const travelDate = reservation.travelDate ? new Date(reservation.travelDate).toLocaleDateString("fr-FR") : "Non précisée";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0c96b; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 32px; text-align: center;">
          <h1 style="color: #F2C94C; font-size: 28px; margin: 0;">Mr Saint</h1>
          <p style="color: #aaa; margin: 8px 0 0;">Agence de Voyage Premium</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a1a1a; font-size: 22px; margin-top: 0;">Réservation confirmée !</h2>
          <p style="color: #444;">Bonjour <strong>${client?.fullName || "Client"}</strong>,</p>
          <p style="color: #444;">Votre réservation a été confirmée avec succès. Voici le récapitulatif :</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr style="background: #f9f3db;">
              <td style="padding: 10px 14px; font-weight: bold; color: #333;">Voyage</td>
              <td style="padding: 10px 14px; color: #333;">${trip?.title || "Voyage Mr Saint"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #333;">Destination</td>
              <td style="padding: 10px 14px; color: #333;">${trip?.destination || ""}</td>
            </tr>
            <tr style="background: #f9f3db;">
              <td style="padding: 10px 14px; font-weight: bold; color: #333;">Nombre de personnes</td>
              <td style="padding: 10px 14px; color: #333;">${reservation.numberOfPeople}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #333;">Date souhaitée</td>
              <td style="padding: 10px 14px; color: #333;">${travelDate}</td>
            </tr>
            <tr style="background: #f9f3db;">
              <td style="padding: 10px 14px; font-weight: bold; color: #333;">Montant payé</td>
              <td style="padding: 10px 14px; color: #333; font-size: 18px;"><strong style="color: #c9a227;">${amount} EUR</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #333;">N° de facture</td>
              <td style="padding: 10px 14px; color: #333;">${invoiceNumber}</td>
            </tr>
          </table>
          <p style="color: #444;">Notre équipe vous contactera sous 24h pour finaliser les détails de votre voyage.</p>
          <p style="color: #888; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            Mr Saint — Agence de Voyage Premium<br>
            WhatsApp : +33 6 66 01 38 66 | Email : matandusaint@gmail.com
          </p>
        </div>
      </div>
    `;

    if (client?.email) {
      await resend.emails.send({
        from: "Mr Saint <onboarding@resend.dev>",
        to: client.email,
        subject: `✅ Réservation confirmée — ${trip?.title || "Voyage Mr Saint"}`,
        html: emailHtml,
      });
    }

    await resend.emails.send({
      from: "Mr Saint <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `🆕 Nouvelle réservation voyage — ${trip?.title || ""} (${client?.fullName || ""})`,
      html: `
        <p><strong>Nouveau client :</strong> ${client?.fullName} (${client?.email})</p>
        <p><strong>Téléphone :</strong> ${client?.phone}</p>
        <p><strong>Voyage :</strong> ${trip?.title} — ${trip?.destination}</p>
        <p><strong>Personnes :</strong> ${reservation.numberOfPeople}</p>
        <p><strong>Date souhaitée :</strong> ${travelDate}</p>
        <p><strong>Montant :</strong> ${amount} EUR</p>
        <p><strong>Facture :</strong> ${invoiceNumber}</p>
        <p><a href="${process.env.APP_URL || "https://mrsaint.fr"}/admin/reservations">Voir dans l'admin</a></p>
      `,
    });
  } catch (emailErr) {
    console.error("[Reservation] Email error (non-fatal):", emailErr);
  }

  return { reservation, client, trip, invoiceNumber };
}

export async function linkPaymentToReservation(reservationId: string, paymentId: string, provider: string) {
  const now = new Date().toISOString();
  await db.update(tripReservations).set({ paymentId, paymentProvider: provider, updatedAt: now }).where(eq(tripReservations.id, reservationId));
}

export async function getAllReservationsWithDetails() {
  const reservations = await db.select().from(tripReservations).orderBy(tripReservations.createdAt);
  const result = await Promise.all(
    reservations.map(async (r) => {
      const [clientResult, tripResult, invoiceResult] = await Promise.all([
        db.select().from(tripClients).where(eq(tripClients.id, r.clientId)).limit(1),
        db.select().from(trips).where(eq(trips.id, r.tripId)).limit(1),
        db.select().from(tripInvoices).where(eq(tripInvoices.reservationId, r.id)).limit(1),
      ]);
      return {
        ...r,
        client: clientResult[0] || null,
        trip: tripResult[0] || null,
        invoice: invoiceResult[0] || null,
      };
    })
  );
  return result;
}

export async function getReservationDetail(reservationId: string) {
  const reservations = await db.select().from(tripReservations).where(eq(tripReservations.id, reservationId)).limit(1);
  if (reservations.length === 0) return null;
  const r = reservations[0];
  const [clientResult, tripResult, invoiceResult] = await Promise.all([
    db.select().from(tripClients).where(eq(tripClients.id, r.clientId)).limit(1),
    db.select().from(trips).where(eq(trips.id, r.tripId)).limit(1),
    db.select().from(tripInvoices).where(eq(tripInvoices.reservationId, r.id)).limit(1),
  ]);
  return { ...r, client: clientResult[0] || null, trip: tripResult[0] || null, invoice: invoiceResult[0] || null };
}

export async function updateReservationStatus(reservationId: string, status: string) {
  const now = new Date().toISOString();
  await db.update(tripReservations).set({ paymentStatus: status, updatedAt: now }).where(eq(tripReservations.id, reservationId));
}
