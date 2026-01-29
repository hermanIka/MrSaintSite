import { Router } from "express";
import { Resend } from "resend";
import { z } from "zod";

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

router.post("/", async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);

    await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "matandusaint@gmail.com",
      subject: `[Contact] ${data.subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Sujet:</strong> ${data.subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br />")}</p>
      `,
      replyTo: data.email,
    });

    await resend.emails.send({
      from: "Mr Saint <onboarding@resend.dev>",
      to: data.email,
      subject: "Confirmation - Votre message a bien été reçu",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C9A227; margin: 0;">Mr Saint</h1>
            <p style="color: #666; margin: 5px 0;">Expert Voyagiste</p>
          </div>
          
          <h2 style="color: #333;">Bonjour ${data.name},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Nous avons bien reçu votre message concernant "<strong>${data.subject}</strong>".
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 à 48 heures ouvrées.
          </p>
          
          <div style="background: #f9f9f9; border-left: 4px solid #C9A227; padding: 15px; margin: 20px 0;">
            <p style="color: #555; margin: 0;"><strong>Récapitulatif de votre message :</strong></p>
            <p style="color: #777; font-style: italic; margin: 10px 0 0 0;">"${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}"</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            En attendant, n'hésitez pas à consulter nos services :
          </p>
          
          <ul style="color: #555; line-height: 1.8;">
            <li>Facilitation Visa</li>
            <li>Création d'Agence de Voyage</li>
            <li>Voyages Business Organisés</li>
            <li>Consultation Stratégique</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Mr Saint - Expert Voyagiste<br />
            Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: "Message envoyé avec succès" });
  } catch (error) {
    console.error("Error sending contact email:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Données invalides" });
    } else {
      res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message" });
    }
  }
});

export const contactRoutes = router;
