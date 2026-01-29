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
