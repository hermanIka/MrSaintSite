/**
 * CHATBOT MODULE - Public Data Provider
 * 
 * Ce module fournit UNIQUEMENT les données publiques visibles par l'utilisateur.
 * 
 * RÈGLES DE SÉCURITÉ:
 * - JAMAIS d'accès aux API de paiement
 * - JAMAIS d'accès aux clés secrètes
 * - JAMAIS d'accès au back-office / admin
 * - JAMAIS d'accès aux logs internes sensibles
 * - JAMAIS d'accès à toute donnée non affichée à l'utilisateur
 * 
 * AUTORISATIONS:
 * - Données publiques / visibles
 * - Services affichés
 * - Prix affichés
 * - Voyages publiés
 * - FAQ publiques
 */

import { db } from "../../db";
import { 
  trips, 
  services, 
  faqs, 
  testimonials 
} from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface PublicTrip {
  title: string;
  destination: string;
  date: string;
  price: number;
  description: string;
  included: string[];
}

export interface PublicService {
  name: string;
  shortDescription: string;
  price: number;
  priceLabel: string;
  priceUnit: string | null;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

export interface PublicFaq {
  question: string;
  answer: string;
  category: string;
}

export interface PublicData {
  company: {
    name: string;
    expertise: string;
    mission: string;
    contact: {
      availability: string;
      responseTime: string;
      reservationLink: string;
    };
  };
  trips: PublicTrip[];
  services: PublicService[];
  faqs: PublicFaq[];
}

export async function getPublicDataForChatbot(): Promise<PublicData> {
  const [publicTrips, publicServices, publicFaqs] = await Promise.all([
    db.select({
      title: trips.title,
      destination: trips.destination,
      startDate: trips.startDate,
      endDate: trips.endDate,
      price: trips.price,
      description: trips.description,
      included: trips.included,
    }).from(trips),

    db.select({
      name: services.name,
      shortDescription: services.shortDescription,
      price: services.price,
      priceLabel: services.priceLabel,
      priceUnit: services.priceUnit,
      features: services.features,
      ctaText: services.ctaText,
      ctaLink: services.ctaLink,
    }).from(services).where(eq(services.status, "published")),

    db.select({
      question: faqs.question,
      answer: faqs.answer,
      category: faqs.category,
    }).from(faqs).orderBy(asc(faqs.order)),
  ]);

  return {
    company: {
      name: "Mr Saint",
      expertise: "7+ ans d'expérience dans le voyage",
      mission: "Accompagner les clients dans leurs projets de voyage et création d'agence",
      contact: {
        availability: "7j/7",
        responseTime: "Sous 24h",
        reservationLink: "/reservation",
      },
    },
    trips: publicTrips,
    services: publicServices,
    faqs: publicFaqs,
  };
}

export function formatPublicDataForPrompt(data: PublicData): string {
  let context = `## DONNÉES DE L'ENTREPRISE\n`;
  context += `Nom: ${data.company.name}\n`;
  context += `Expertise: ${data.company.expertise}\n`;
  context += `Mission: ${data.company.mission}\n`;
  context += `Disponibilité: ${data.company.contact.availability}\n`;
  context += `Temps de réponse: ${data.company.contact.responseTime}\n`;
  context += `Lien réservation: ${data.company.contact.reservationLink}\n\n`;

  context += `## SERVICES DISPONIBLES\n`;
  for (const service of data.services) {
    context += `### ${service.name}\n`;
    context += `${service.shortDescription}\n`;
    context += `Prix: ${service.priceLabel} ${service.price}€${service.priceUnit ? ` ${service.priceUnit}` : ''}\n`;
    context += `Avantages: ${service.features.join(', ')}\n`;
    context += `Action: ${service.ctaText} - ${service.ctaLink}\n\n`;
  }

  context += `## VOYAGES DISPONIBLES\n`;
  for (const trip of data.trips) {
    context += `### ${trip.title}\n`;
    context += `Destination: ${trip.destination}\n`;
    context += `Dates: ${trip.startDate} → ${trip.endDate}\n`;
    context += `Prix: ${trip.price}€\n`;
    context += `Description: ${trip.description}\n`;
    context += `Inclus: ${trip.included.join(', ')}\n\n`;
  }

  context += `## FAQ\n`;
  for (const faq of data.faqs) {
    context += `Q: ${faq.question}\n`;
    context += `R: ${faq.answer}\n\n`;
  }

  return context;
}
