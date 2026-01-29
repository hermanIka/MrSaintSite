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
  updateTrip(id: string, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;

  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonialById(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<boolean>;

  getAllPortfolio(): Promise<Portfolio[]>;
  getPublishedPortfolio(): Promise<Portfolio[]>;
  getPortfolioByServiceType(serviceType: string): Promise<Portfolio[]>;
  getPortfolioById(id: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: string, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: string): Promise<boolean>;
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
        imageUrl: "/images/trips/china-shanghai-tourism.png",
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
        imageUrl: "/images/trips/dubai-tourism.png",
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
        imageUrl: "/images/trips/istanbul-tourism.png",
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
        description: "Accompagnement complet pour la création d'une agence de voyage spécialisée dans les destinations africaines. Formation sur les réservations, partenariats hôteliers et marketing digital.",
        serviceType: "agence",
        category: "Agence de voyage",
        result: "Lancement réussi avec 50+ réservations le premier mois et CA de 45k€",
        year: "2024",
        imageUrl: "/images/portfolio/afrique-travel-express.png",
        clientLogo: null,
        status: "published",
        createdAt: new Date().toISOString(),
      },
      {
        businessName: "Elite Visa Consulting",
        description: "Facilitation de visa business pour 25 entrepreneurs souhaitant se rendre en Chine. Dossiers complexes avec justificatifs d'affaires et invitations professionnelles.",
        serviceType: "visa",
        category: "Facilitation visa",
        result: "100% de taux de réussite sur les 25 dossiers traités",
        year: "2024",
        imageUrl: "/images/portfolio/elite-visa-consulting.png",
        clientLogo: null,
        status: "published",
        createdAt: new Date().toISOString(),
      },
      {
        businessName: "Golden Tours International",
        description: "Création d'une agence de voyages organisés haut de gamme. Coaching personnalisé sur le positionnement luxe et les partenariats avec des hôtels 5 étoiles.",
        serviceType: "agence",
        category: "Voyages organisés",
        result: "Agence opérationnelle en 2 mois avec 3 groupes réservés",
        year: "2023",
        imageUrl: "/images/portfolio/golden-tours-international.png",
        clientLogo: null,
        status: "published",
        createdAt: new Date().toISOString(),
      },
      {
        businessName: "Business Travel Pro",
        description: "Organisation d'un voyage d'affaires groupé à Dubaï pour 15 entrepreneurs français. Networking, visites d'entreprises et rencontres avec investisseurs locaux.",
        serviceType: "voyage",
        category: "Voyages d'affaires",
        result: "8 partenariats commerciaux signés pendant le voyage",
        year: "2024",
        imageUrl: "/images/portfolio/business-travel-pro.png",
        clientLogo: null,
        status: "published",
        createdAt: new Date().toISOString(),
      },
      {
        businessName: "Sahara Adventures",
        description: "Accompagnement dans la création d'une agence spécialisée tourisme aventure et désert. Formation sur les circuits, la logistique et les partenaires locaux.",
        serviceType: "agence",
        category: "Tourisme aventure",
        result: "Premier circuit vendu à 12 personnes sous 3 semaines",
        year: "2023",
        imageUrl: "/images/portfolio/sahara-adventures.png",
        clientLogo: null,
        status: "published",
        createdAt: new Date().toISOString(),
      },
      {
        businessName: "Luxury Destinations",
        description: "Facilitation de visas Schengen pour une délégation d'entrepreneurs africains venant à Paris pour un salon professionnel.",
        serviceType: "visa",
        category: "Visa Schengen",
        result: "18 visas obtenus sur 20 demandes en délai express",
        year: "2024",
        imageUrl: "/images/portfolio/luxury-destinations.png",
        clientLogo: null,
        status: "published",
        createdAt: new Date().toISOString(),
      },
    ];

    portfolioData.forEach((item) => {
      const id = randomUUID();
      const portfolioItem: Portfolio = {
        ...item,
        id,
        clientLogo: item.clientLogo ?? null,
        status: item.status ?? "published",
      };
      this.portfolio.set(id, portfolioItem);
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

  async updateTrip(id: string, tripData: Partial<InsertTrip>): Promise<Trip | undefined> {
    const existing = this.trips.get(id);
    if (!existing) return undefined;
    const updated: Trip = { ...existing, ...tripData };
    this.trips.set(id, updated);
    return updated;
  }

  async deleteTrip(id: string): Promise<boolean> {
    return this.trips.delete(id);
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getTestimonialById(id: string): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async createTestimonial(
    insertTestimonial: InsertTestimonial
  ): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const existing = this.testimonials.get(id);
    if (!existing) return undefined;
    const updated: Testimonial = { ...existing, ...data };
    this.testimonials.set(id, updated);
    return updated;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    return this.testimonials.delete(id);
  }

  async getAllPortfolio(): Promise<Portfolio[]> {
    return Array.from(this.portfolio.values());
  }

  async getPublishedPortfolio(): Promise<Portfolio[]> {
    return Array.from(this.portfolio.values()).filter(
      (item) => item.status === "published"
    );
  }

  async getPortfolioByServiceType(serviceType: string): Promise<Portfolio[]> {
    return Array.from(this.portfolio.values()).filter(
      (item) => item.status === "published" && item.serviceType === serviceType
    );
  }

  async getPortfolioById(id: string): Promise<Portfolio | undefined> {
    return this.portfolio.get(id);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = randomUUID();
    const portfolio: Portfolio = { 
      ...insertPortfolio, 
      id,
      clientLogo: insertPortfolio.clientLogo ?? null,
      status: insertPortfolio.status ?? "published",
    };
    this.portfolio.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const existing = this.portfolio.get(id);
    if (!existing) return undefined;
    const updated: Portfolio = { ...existing, ...data };
    this.portfolio.set(id, updated);
    return updated;
  }

  async deletePortfolio(id: string): Promise<boolean> {
    return this.portfolio.delete(id);
  }
}

export const contentStorage = new ContentMemStorage();
