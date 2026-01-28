/**
 * CONTENT MODULE - Storage
 * 
 * Gestion du stockage pour les entités de contenu:
 * - Trips (voyages)
 * - Testimonials (témoignages)
 * - Portfolio (réalisations)
 */

import {
  type Trip,
  type InsertTrip,
  type Testimonial,
  type InsertTestimonial,
  type Portfolio,
  type InsertPortfolio,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IContentStorage {
  getAllTrips(): Promise<Trip[]>;
  getTripById(id: string): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;

  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  getAllPortfolio(): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
}

export class ContentMemStorage implements IContentStorage {
  private trips: Map<string, Trip>;
  private testimonials: Map<string, Testimonial>;
  private portfolio: Map<string, Portfolio>;

  constructor() {
    this.trips = new Map();
    this.testimonials = new Map();
    this.portfolio = new Map();
    this.seedData();
  }

  private seedData() {
    const tripsData: InsertTrip[] = [
      {
        title: "Business Chine - Mars 2025",
        destination: "Shanghai & Beijing",
        date: "15-25 Mars 2025",
        price: 2800,
        description:
          "Voyage business exclusif en Chine. Découvrez les opportunités d'import-export, visitez les plus grands marchés et développez votre réseau avec des entrepreneurs chinois. Programme intensif de 10 jours avec interprète professionnel.",
        imageUrl: "/attached_assets/generated_images/China_business_trip_image_98f4deaf.png",
        itinerary: [
          "Arrivée à Shanghai - Installation à l'hôtel 5* - Briefing du voyage",
          "Visite du marché de Yiwu - Rencontre avec fournisseurs potentiels",
          "Découverte des zones industrielles - Négociations commerciales",
          "Formation import-export - Aspects douaniers et logistiques",
          "Vol vers Beijing - Visite de la Cité Interdite",
          "Rencontre avec la chambre de commerce franco-chinoise",
          "Visite d'entreprises technologiques - Networking business",
          "Atelier pratique : créer sa société d'import depuis la Chine",
          "Journée libre pour rendez-vous personnels",
          "Bilan du voyage - Retour en France",
        ],
        included: [
          "Vols internationaux en classe affaires",
          "Hébergement hôtel 5* avec petit-déjeuner",
          "Interprète professionnel français-mandarin",
          "Tous les transferts en véhicule privé",
          "Visites et entrées aux sites mentionnés",
          "Déjeuners d'affaires et dîners de networking",
          "Assurance voyage premium",
        ],
        notIncluded: [
          "Visa pour la Chine (facilitation disponible)",
          "Dépenses personnelles",
          "Achats de marchandises",
          "Frais de création de société",
        ],
      },
      {
        title: "Dubaï Business Retreat",
        destination: "Dubaï, UAE",
        date: "10-17 Avril 2025",
        price: 3200,
        description:
          "Séjour business premium à Dubaï. Explorez le hub entrepreneurial du Moyen-Orient, participez à des conférences exclusives, rencontrez des investisseurs et découvrez les opportunités d'affaires dans l'une des villes les plus dynamiques du monde.",
        imageUrl: "/attached_assets/generated_images/Dubai_trip_destination_image_ac5e2ebb.png",
        itinerary: [
          "Arrivée à Dubaï - Transfert hôtel Burj Al Arab - Welcome drink",
          "Visite de Dubai Marina et JBR - Déjeuner networking au restaurant tournant",
          "Conférence : Faire des affaires à Dubaï - Création de société aux UAE",
          "Visite du Dubai Mall et Burj Khalifa - Networking cocktail",
          "Rencontre avec investisseurs émiratis - Pitchs de projets",
          "Visite de la zone franche DMCC - Opportunités d'import-export",
          "Journée détente : Desert Safari premium avec dîner sous les étoiles",
          "Bilan du séjour - Retour en France",
        ],
        included: [
          "Vols directs Paris-Dubaï en business",
          "Hôtel 5* luxe (Burj Al Arab ou équivalent)",
          "Petit-déjeuner et dîners gastronomiques",
          "Chauffeur privé pendant tout le séjour",
          "Accès aux conférences et événements networking",
          "Desert Safari premium",
          "Assurance voyage et assistance",
        ],
        notIncluded: [
          "Visa UAE (gratuit pour les français)",
          "Déjeuners",
          "Shopping et activités personnelles",
          "Pourboires",
        ],
      },
      {
        title: "Istanbul Import Trip",
        destination: "Istanbul, Turquie",
        date: "5-12 Mai 2025",
        price: 1900,
        description:
          "Voyage d'affaires à Istanbul pour découvrir les opportunités d'import textile, maroquinerie et décoration. Visitez les plus grands grossistes, négociez directement avec les fabricants et repartez avec vos premiers contrats.",
        imageUrl: "/attached_assets/generated_images/Istanbul_trip_destination_image_02ebbd52.png",
        itinerary: [
          "Arrivée Istanbul - Installation hôtel Sultanahmet - Dîner de bienvenue",
          "Visite du Grand Bazar et marché aux épices - Initiation négociation",
          "Quartier de Laleli : grossistes textile - Rencontres fournisseurs",
          "Visite d'usines de maroquinerie - Négociations de prix",
          "Formation : Import depuis la Turquie - Aspects douaniers",
          "Zeytinburnu : marché du meuble et décoration - Networking",
          "Croisière Bosphore - Dîner d'affaires avec exportateurs turcs",
          "Bilan commercial - Retour en France",
        ],
        included: [
          "Vols Paris-Istanbul aller-retour",
          "Hôtel 4* centre historique",
          "Petit-déjeuner buffet",
          "Guide francophone spécialisé business",
          "Transferts aéroport et visites",
          "Croisière sur le Bosphore",
          "3 dîners professionnels",
        ],
        notIncluded: [
          "Visa (e-visa à faire en ligne)",
          "Déjeuners",
          "Achats de marchandises",
          "Extras personnels",
        ],
      },
    ];

    tripsData.forEach((trip) => {
      const id = randomUUID();
      this.trips.set(id, { ...trip, id });
    });

    const testimonialsData: InsertTestimonial[] = [
      {
        name: "Sophie Martin",
        business: "Go Africa Travel",
        content:
          "Grâce à l'accompagnement de Mr Saint, j'ai pu lancer mon agence en seulement 3 mois. Sa formation est complète et son réseau m'a ouvert de nombreuses portes. Aujourd'hui, mon CA dépasse les 150k€/an !",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
      },
      {
        name: "Karim Bensalem",
        business: "Luxury Escapes Agency",
        content:
          "Le voyage à Dubaï organisé par Mr Saint a transformé ma vision du business. J'ai signé 3 partenariats majeurs et développé une nouvelle branche dans mon agence. Un investissement qui a été rentabilisé en 2 mois.",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim",
      },
      {
        name: "Marie Dupont",
        business: "World Visa Services",
        content:
          "Expert incontournable de la facilitation visa. Mr Saint m'a accompagnée sur des dossiers complexes avec un taux de réussite impressionnant. Service professionnel, rapide et efficace. Je recommande les yeux fermés !",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
      },
    ];

    testimonialsData.forEach((testimonial) => {
      const id = randomUUID();
      this.testimonials.set(id, { ...testimonial, id });
    });

    const portfolioData: InsertPortfolio[] = [
      {
        businessName: "Afrique Travel Express",
        category: "Agence de voyage",
        imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=business1",
      },
      {
        businessName: "Elite Visa Consulting",
        category: "Facilitation visa",
        imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=business2",
      },
      {
        businessName: "Golden Tours International",
        category: "Voyages organisés",
        imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=business3",
      },
      {
        businessName: "Business Travel Pro",
        category: "Voyages d'affaires",
        imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=business4",
      },
      {
        businessName: "Sahara Adventures",
        category: "Tourisme aventure",
        imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=business5",
      },
      {
        businessName: "Luxury Destinations",
        category: "Voyages de luxe",
        imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=business6",
      },
    ];

    portfolioData.forEach((item) => {
      const id = randomUUID();
      this.portfolio.set(id, { ...item, id });
    });
  }

  async getAllTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values());
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const trip: Trip = { ...insertTrip, id };
    this.trips.set(id, trip);
    return trip;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(
    insertTestimonial: InsertTestimonial
  ): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async getAllPortfolio(): Promise<Portfolio[]> {
    return Array.from(this.portfolio.values());
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = randomUUID();
    const portfolio: Portfolio = { ...insertPortfolio, id };
    this.portfolio.set(id, portfolio);
    return portfolio;
  }
}

export const contentStorage = new ContentMemStorage();
