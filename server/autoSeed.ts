/**
 * AUTO-SEED MODULE
 * 
 * Vérifie si la base de données est vide au démarrage et insère les données initiales si nécessaire.
 * Inclut aussi une logique de "mise à jour" pour s'assurer que les tables critiques
 * (services, trips featured) sont correctement remplies même si d'autres données existent déjà.
 */

import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  trips,
  testimonials,
  portfolio,
  faqs,
  admins,
  services,
  goPlusPlans,
  chatbotSystemPrompts,
  type InsertTrip,
  type InsertTestimonial,
  type InsertPortfolio,
  type InsertFaq,
  type InsertService,
} from "@shared/schema";
import * as crypto from "crypto";
import { seedInitialPrompt } from "./modules/chatbot/seedPrompt";
import { contentStorage } from "./modules/content/storage";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const servicesData: InsertService[] = [
  {
    name: "Facilitation Visa",
    slug: "visa",
    shortDescription: "Obtenez votre visa sans stress",
    fullDescription: "Nous prenons en charge toutes vos démarches administratives pour l'obtention de votre visa. Tourisme, affaires, études ou travail, notre expertise garantit un traitement rapide et efficace.",
    price: 75,
    priceLabel: "À partir de",
    priceUnit: null,
    category: "visa",
    features: [
      "Consultation personnalisée (30 min) Analyse de votre projet de voyage et du type de visa adapté.",
      "Étude de profil Évaluation complète de votre situation personnelle et professionnelle.",
      "Élaboration d'une stratégie cohérente Conseils pour maximiser vos chances d'obtention du visa et éviter les refus.",
      "Sélection du pays et du type de visa Identification du visa le plus approprié selon vos objectifs.",
      "Intégration et migration stratégique Planification de votre installation dans le pays d'accueil.",
    ],
    imageUrl: null,
    iconName: "FileText",
    ctaText: "Demander mon visa",
    ctaLink: "/facilitation-visa",
    order: 1,
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Création d'Agence de Voyage",
    slug: "agence",
    shortDescription: "Lancez votre agence avec un accompagnement expert",
    fullDescription: "Programme complet de formation et coaching pour créer votre propre agence de voyage. De la conception à la première vente, nous vous accompagnons à chaque étape.",
    price: 750,
    priceLabel: "Programme complet :",
    priceUnit: null,
    category: "formation",
    features: [
      "Consultation personnalisée (30 min) Élaboration complète de ton projet de création d'agence.",
      "Définition du type d'agence et de la niche rentable Identification du marché porteur et des opportunités.",
      "Stratégie business efficace Mise en place d'un plan pour lancer une agence rentable et durable.",
      "Sélection du type d'agence optimal Recommandations sur le modèle d'agence le plus adapté à ton profil et au marché.",
      "Analyse de la concurrence, outils, logiciels et partenariats Compréhension des tendances et des ressources nécessaires pour réussir.",
      "Conseils pratiques pour démarrer rapidement Astuces pour éviter les erreurs courantes et accélérer la réussite.",
    ],
    imageUrl: null,
    iconName: "Briefcase",
    ctaText: "Découvrir le programme",
    ctaLink: "/creation-agence",
    order: 2,
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Consultation Voyage",
    slug: "consultation",
    shortDescription: "Conseil personnalisé pour votre projet voyage",
    fullDescription: "Réservez votre consultation personnalisée pour réussir votre voyage, obtenir votre visa sans stress, ou lancer une agence de voyage rentable et prospère.\n\nVotre projet peut devenir réalité tout commence ici.",
    price: 95,
    priceLabel: "",
    priceUnit: "/ session",
    category: "consultation",
    features: [
      "Session d'1 heure en visioconférence",
      "Analyse personnalisée de votre situation",
      "Conseils stratégiques adaptés",
      "Plan d'action concret",
      "Suivi par email pendant 7 jours",
    ],
    imageUrl: null,
    iconName: "MessageCircle",
    ctaText: "Réserver ma consultation",
    ctaLink: "/reservation",
    order: 3,
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Voyages Organisés",
    slug: "voyage",
    shortDescription: "Voyages d'affaires et découverte en groupe",
    fullDescription: "Participez à nos voyages organisés : business trips pour développer votre réseau et explorer de nouvelles opportunités commerciales à l'international.",
    price: 1200,
    priceLabel: "À partir de",
    priceUnit: "/ personne",
    category: "voyage",
    features: [
      "Vols et hébergement inclus",
      "Accompagnement francophone",
      "Networking avec entrepreneurs",
      "Visites de fournisseurs et marchés",
      "Formation import-export sur place",
    ],
    imageUrl: null,
    iconName: "Plane",
    ctaText: "Voir les voyages",
    ctaLink: "/voyages",
    order: 4,
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Voyage à Crédit",
    slug: "voyage-credit",
    shortDescription: "Réalisez votre rêve de voyage avec un financement flexible",
    fullDescription: "Notre solution de financement vous permet d'étaler le coût de votre voyage sur plusieurs mois. Votre demande est étudiée personnellement et une réponse vous est donnée sous 48 à 72 heures.",
    price: 0,
    priceLabel: "Financement sur mesure",
    priceUnit: null,
    category: "financement",
    features: [
      "Paiement échelonné sur plusieurs mois",
      "Étude personnalisée de votre dossier",
      "Réponse sous 48 à 72 heures",
      "Accompagnement dédié",
      "Destinations accessibles",
    ],
    imageUrl: null,
    iconName: "CreditCard",
    ctaText: "Faire une demande",
    ctaLink: "/voyage-credit",
    order: 5,
    status: "published",
    createdAt: new Date().toISOString(),
  },
];

export async function autoSeed(): Promise<void> {
  try {
    const existingPrompts = await db.select().from(chatbotSystemPrompts).limit(1);
    if (existingPrompts.length === 0) {
      console.log("🤖 No chatbot prompt found - seeding initial prompt...");
      await seedInitialPrompt();
    } else {
      console.log("✓ Chatbot system prompt already exists");
    }
  } catch (error) {
    console.error("⚠️ Chatbot prompt check error (non-fatal):", error);
  }

  try {
    const existingTrips = await db.select().from(trips).limit(1);
    if (existingTrips.length > 0) {
      console.log("✓ Database already contains data - checking for missing data...");
      await ensureDataIntegrity();
      return;
    }

    console.log("🌱 Empty database detected - starting auto-seed...");

    const existingAdmin = await db.select().from(admins).limit(1);
    if (existingAdmin.length === 0) {
      console.log("  → Inserting admin...");
      await db.insert(admins).values({
        username: "admin",
        passwordHash: hashPassword("admin123"),
        createdAt: new Date().toISOString(),
      });
    }

    console.log("  → Inserting trips...");
    const tripsData: InsertTrip[] = [
      {
        title: "Business Chine - Mars 2025",
        destination: "Shanghai & Beijing",
        date: "15-25 Mars 2025",
        price: 2800,
        isFeatured: true,
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
        isFeatured: true,
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
        isFeatured: true,
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
    await db.insert(trips).values(tripsData);

    console.log("  → Inserting testimonials...");
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
    await db.insert(testimonials).values(testimonialsData);

    console.log("  → Inserting portfolio...");
    const portfolioData: InsertPortfolio[] = [
      {
        businessName: "Afrique Travel Express",
        description:
          "Accompagnement complet pour la création d'une agence de voyage spécialisée dans les destinations africaines. Formation sur les réservations, partenariats hôteliers et marketing digital.",
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
        description:
          "Facilitation de visa business pour 25 entrepreneurs souhaitant se rendre en Chine. Dossiers complexes avec justificatifs d'affaires et invitations professionnelles.",
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
        description:
          "Création d'une agence de voyages organisés haut de gamme. Coaching personnalisé sur le positionnement luxe et les partenariats avec des hôtels 5 étoiles.",
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
        description:
          "Organisation d'un voyage d'affaires groupé à Dubaï pour 15 entrepreneurs français. Networking, visites d'entreprises et rencontres avec investisseurs locaux.",
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
        description:
          "Accompagnement dans la création d'une agence spécialisée tourisme aventure et désert. Formation sur les circuits, la logistique et les partenaires locaux.",
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
        description:
          "Facilitation de visas Schengen pour une délégation d'entrepreneurs africains venant à Paris pour un salon professionnel.",
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
    await db.insert(portfolio).values(portfolioData);

    console.log("  → Inserting FAQs...");
    const faqsData: InsertFaq[] = [
      {
        question: "Comment fonctionne la facilitation visa ?",
        answer:
          "Nous analysons votre dossier, préparons tous les documents nécessaires, et vous accompagnons jusqu'à l'obtention de votre visa. Notre taux de réussite est de 98%.",
        category: "visa",
        order: 1,
      },
      {
        question: "Quels sont les délais pour obtenir un visa ?",
        answer:
          "Les délais varient selon la destination : Dubaï (3-5 jours), Canada (2-4 semaines), USA (2-3 semaines), Schengen (10-15 jours), Turquie (3-5 jours).",
        category: "visa",
        order: 2,
      },
      {
        question: "Proposez-vous des facilités de paiement ?",
        answer:
          "Oui, nous proposons un paiement en plusieurs fois pour les voyages d'affaires et les formations. Contactez-nous pour discuter des options.",
        category: "paiement",
        order: 3,
      },
      {
        question: "Comment se déroule un voyage d'affaires ?",
        answer:
          "Nos voyages incluent : vols, hébergement premium, transferts, visites de fournisseurs/partenaires, traducteur si nécessaire, et accompagnement personnalisé.",
        category: "voyages",
        order: 4,
      },
      {
        question: "Qu'inclut la formation création d'agence ?",
        answer:
          "Formation complète : étude de marché, business plan, aspects juridiques, fournisseurs, marketing digital, et accompagnement pendant 3 mois après création.",
        category: "formation",
        order: 5,
      },
      {
        question: "Comment réserver une consultation ?",
        answer:
          "Cliquez sur 'Réserver' sur notre site, effectuez le paiement de 20€, puis accédez au calendrier pour choisir votre créneau.",
        category: "reservation",
        order: 6,
      },
    ];
    await db.insert(faqs).values(faqsData);

    console.log("  → Inserting services...");
    await db.insert(services).values(servicesData);

    console.log("  → Inserting chatbot system prompt...");
    await seedInitialPrompt();

    console.log("✅ Auto-seed completed successfully!");

    await ensureDataIntegrity();
  } catch (error) {
    console.error("⚠️ Auto-seed error (non-fatal):", error);
  }
}

async function ensureDataIntegrity(): Promise<void> {
  try {
    const existingServices = await db.select().from(services).limit(1);
    if (existingServices.length === 0) {
      console.log("  → Services table is empty - inserting services...");
      await db.insert(services).values(servicesData);
      console.log("  ✓ Services inserted successfully");
    } else {
      console.log("  ✓ Services already exist");
    }

    const featuredTrips = await db.select().from(trips).where(eq(trips.isFeatured, true));
    if (featuredTrips.length === 0) {
      console.log("  → No featured trips found - marking all trips as featured...");
      const result = await db.update(trips).set({ isFeatured: true }).where(eq(trips.isFeatured, false));
      console.log("  ✓ All trips marked as featured");
    } else {
      console.log(`  ✓ ${featuredTrips.length} featured trips found`);
    }

    const existingAdmin = await db.select().from(admins).limit(1);
    if (existingAdmin.length === 0) {
      console.log("  → No admin found - inserting default admin...");
      await db.insert(admins).values({
        username: "admin",
        passwordHash: hashPassword("admin123"),
        createdAt: new Date().toISOString(),
      });
      console.log("  ✓ Admin created");
    }

    const existingGoPlusPlans = await db.select().from(goPlusPlans);
    const hasGoldPlan = existingGoPlusPlans.some(p => p.name === "Gold");
    if (!hasGoldPlan) {
      console.log("  → Mise à jour des plans GO+ (Classique 79€, Premium 179€, Gold 299€)...");
      await db.delete(goPlusPlans);
      const now = new Date().toISOString();
      await db.insert(goPlusPlans).values([
        {
          name: "Classique",
          description: "Voyagez malin et économisez davantage.",
          price: 7900,
          currency: "EUR",
          discountPercentage: 10,
          privileges: JSON.stringify([
            "Jusqu'à -10% sur vos forfaits touristiques",
            "-25% sur le service de facilitation visa",
            "Accès prioritaire aux offres promotionnelles",
          ]),
          durationDays: 365,
          isActive: true,
          createdAt: now,
        },
        {
          name: "Premium",
          description: "Plus de confort. Plus d'avantages. Plus de liberté.",
          price: 17900,
          currency: "EUR",
          discountPercentage: 15,
          privileges: JSON.stringify([
            "Jusqu'à -15% sur vos forfaits touristiques",
            "-35% sur la facilitation visa",
            "Séjours gratuits dans nos Airbnbs partenaires jusqu'à 10 jours cumulés par an (selon disponibilité)",
            "Traitement prioritaire de vos dossiers",
          ]),
          durationDays: 365,
          isActive: true,
          createdAt: now,
        },
        {
          name: "Gold",
          description: "L'expérience GO sans limite.",
          price: 29900,
          currency: "EUR",
          discountPercentage: 15,
          privileges: JSON.stringify([
            "Facilitation visa 100% gratuite",
            "Accès à l'option Voyage à Crédit",
            "Assistance personnalisée",
            "Accès prioritaire aux offres exclusives",
          ]),
          durationDays: 365,
          isActive: true,
          createdAt: now,
        },
      ]);
      console.log("  ✓ Plans GO+ insérés (Classique 79€, Premium 179€, Gold 299€)");
    } else {
      console.log("  ✓ Plans GO+ déjà existants (avec Gold)");
    }

    // Service prices seeding
    const defaultPrices = [
      { key: "visa", label: "Facilitation Visa", amount: 600 },
      { key: "consultation", label: "Consultation expert", amount: 20 },
      { key: "agence_classique", label: "Agence Classique", amount: 800 },
      { key: "agence_premium", label: "Agence Premium", amount: 1500 },
      { key: "agence_elite", label: "Agence Elite", amount: 2500 },
    ];
    for (const p of defaultPrices) {
      await contentStorage.upsertPrice(p.key, p.label, p.amount);
    }
    console.log("  ✓ Tarifs services initialisés");

    console.log("✓ Data integrity check completed");
  } catch (error) {
    console.error("⚠️ Data integrity check error (non-fatal):", error);
  }
}
