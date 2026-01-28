export const knowledgeBase = {
  company: {
    name: "Mr Saint",
    founded: "2018",
    founder: "Mr Saint",
    expertise: "7+ ans d'expérience dans le voyage",
    mission: "Accompagner les clients dans leurs projets de voyage et création d'agence",
    stats: {
      yearsExperience: "7+",
      satisfiedClients: "500+",
      countriesPartnerships: "50+",
      satisfactionRate: "98%"
    },
    values: [
      "Excellence - Standards élevés dans chaque service",
      "Confiance - Relations transparentes et honnêtes",
      "Innovation - Méthodes modernes et efficaces",
      "Accompagnement - Support personnalisé"
    ]
  },

  services: {
    visa: {
      id: "visa",
      title: "Facilitation Visa",
      subtitle: "Votre visa sans stress",
      description: "Accompagnement complet pour toutes vos démarches de visa. Nous analysons votre dossier, préparons vos documents et suivons votre demande jusqu'à l'obtention.",
      price: "À partir de 50 000 FCFA",
      features: [
        "Analyse personnalisée du dossier",
        "Préparation complète des documents",
        "Suivi de la demande en temps réel",
        "Taux de réussite de 95%",
        "Conseils pour l'entretien consulaire"
      ],
      destinations: ["Dubaï", "Canada", "USA", "Europe Schengen", "Turquie"],
      processingTime: {
        dubai: "3-5 jours",
        canada: "2-4 semaines",
        usa: "2-4 semaines",
        schengen: "1-2 semaines"
      },
      link: "/facilitation-visa"
    },
    agence: {
      id: "agence",
      title: "Création d'Agence",
      subtitle: "Devenez entrepreneur du voyage",
      description: "Formation complète et coaching personnalisé pour lancer votre propre agence de voyage. Du business plan à vos premiers clients.",
      price: "À partir de 150 000 FCFA",
      features: [
        "Formation complète de 4 semaines",
        "Business plan personnalisé",
        "Accompagnement administratif",
        "6 mois de coaching après formation",
        "Accès à notre réseau de partenaires"
      ],
      benefits: ["Indépendance", "Revenus illimités", "Flexibilité", "Passion"],
      requirements: "Aucun diplôme requis, motivation et engagement nécessaires",
      budget: "Entre 500 000 et 2 000 000 FCFA pour démarrer",
      link: "/creation-agence"
    },
    voyage: {
      id: "voyage",
      title: "Voyages Organisés",
      subtitle: "Voyages d'affaires premium",
      description: "Voyages d'affaires haut de gamme pour entrepreneurs et professionnels. Networking, découverte et opportunités business.",
      price: "À partir de 500 000 FCFA",
      features: [
        "Vols aller-retour inclus",
        "Hôtels 4-5 étoiles",
        "Transferts privés",
        "Guide francophone",
        "Networking avec entrepreneurs locaux"
      ],
      includes: [
        "Vols aller-retour",
        "Hébergement hôtel 4-5 étoiles",
        "Transferts aéroport-hôtel",
        "Petit-déjeuner",
        "Excursions sélectionnées",
        "Accompagnement guide francophone"
      ],
      cancellation: {
        fullRefund: "Jusqu'à 30 jours avant départ",
        halfRefund: "Entre 30 et 15 jours avant départ",
        noRefund: "Moins de 15 jours avant départ"
      },
      link: "/voyages"
    }
  },

  faq: [
    {
      category: "visa",
      question: "Quels documents sont nécessaires pour une demande de visa ?",
      answer: "Les documents varient selon la destination et le type de visa. En général: passeport valide (6 mois minimum), photos d'identité, justificatif de ressources financières, réservation d'hôtel ou lettre d'invitation, parfois assurance voyage. Nous analysons votre situation et fournissons une liste personnalisée."
    },
    {
      category: "visa",
      question: "Combien de temps prend l'obtention d'un visa ?",
      answer: "Le délai varie: 3-5 jours pour Dubaï, 2-4 semaines pour le Canada ou les États-Unis, 1-2 semaines pour l'Europe Schengen. Commencez les démarches au moins 1 mois avant votre voyage."
    },
    {
      category: "visa",
      question: "Que se passe-t-il si ma demande de visa est refusée ?",
      answer: "En cas de refus, nous analysons les raisons et conseillons sur les actions correctives. Nous pouvons reformuler votre demande ou explorer des alternatives. Notre taux de réussite est de 95%."
    },
    {
      category: "agence",
      question: "Faut-il un diplôme pour créer une agence de voyage ?",
      answer: "Non, aucun diplôme spécifique n'est requis. Cependant, notre formation est fortement recommandée pour comprendre le métier, les obligations légales et développer les compétences nécessaires."
    },
    {
      category: "agence",
      question: "Quel budget faut-il pour lancer son agence ?",
      answer: "Le budget initial varie entre 500 000 et 2 000 000 FCFA selon l'envergure du projet. Cela inclut formation, frais administratifs, équipement et fonds de roulement."
    },
    {
      category: "agence",
      question: "Combien de temps dure la formation ?",
      answer: "4 semaines intensives suivies de 6 mois de coaching personnalisé. Vous pouvez opérer dès la fin de la formation avec notre soutien continu."
    },
    {
      category: "agence",
      question: "Puis-je travailler depuis chez moi ?",
      answer: "Absolument! De nombreux agents travaillent depuis leur domicile. Avec les outils numériques actuels, vous pouvez gérer votre agence de n'importe où."
    },
    {
      category: "voyages",
      question: "Qu'est-ce qui est inclus dans vos voyages organisés ?",
      answer: "Nos packages comprennent: vols aller-retour, hébergement hôtel 4-5 étoiles, transferts aéroport-hôtel, petit-déjeuner, certaines excursions, accompagnement guide francophone."
    },
    {
      category: "voyages",
      question: "Peut-on personnaliser un voyage de groupe ?",
      answer: "Oui, nous proposons des voyages sur mesure pour les groupes (entreprises, associations, familles). Contactez-nous avec vos besoins spécifiques."
    },
    {
      category: "voyages",
      question: "Quelles sont les conditions d'annulation ?",
      answer: "Remboursement intégral jusqu'à 30 jours avant départ, 50% entre 30 et 15 jours, aucun remboursement après. Nous recommandons une assurance annulation."
    }
  ],

  contact: {
    email: "contact@mrsaint.com",
    availability: "7j/7",
    responseTime: "Sous 24h",
    reservationLink: "/reservation",
    contactLink: "/contact"
  },

  navigation: {
    home: { path: "/", title: "Accueil" },
    about: { path: "/a-propos", title: "À propos" },
    services: { path: "/services", title: "Services" },
    visaFacilitation: { path: "/facilitation-visa", title: "Facilitation Visa" },
    agencyCreation: { path: "/creation-agence", title: "Création d'Agence" },
    trips: { path: "/voyages", title: "Voyages" },
    faq: { path: "/faq", title: "FAQ" },
    contact: { path: "/contact", title: "Contact" },
    reservation: { path: "/reservation", title: "Réservation" }
  }
};

export function buildSystemPrompt(): string {
  const kb = knowledgeBase;
  
  return `Tu es l'assistant virtuel de Mr Saint, une agence de voyage premium basée en Afrique. Tu es professionnel, chaleureux et serviable.

## À PROPOS DE MR SAINT
- Fondée en ${kb.company.founded} par ${kb.company.founder}
- ${kb.company.expertise}
- ${kb.company.stats.satisfiedClients} clients satisfaits
- Taux de satisfaction de ${kb.company.stats.satisfactionRate}
- Partenariats dans ${kb.company.stats.countriesPartnerships} pays

## NOS 3 SERVICES PRINCIPAUX

### 1. FACILITATION VISA (${kb.services.visa.price})
${kb.services.visa.description}
Destinations: ${kb.services.visa.destinations.join(", ")}
Délais: Dubaï (3-5 jours), Canada/USA (2-4 semaines), Schengen (1-2 semaines)
Taux de réussite: 95%
Documents généralement requis: passeport valide 6 mois, photos, justificatifs financiers, réservation hôtel/invitation, parfois assurance voyage.

### 2. CRÉATION D'AGENCE DE VOYAGE (${kb.services.agence.price})
${kb.services.agence.description}
Formation: 4 semaines + 6 mois de coaching
Budget initial recommandé: ${kb.services.agence.budget}
Aucun diplôme requis, possibilité de travailler depuis chez soi.

### 3. VOYAGES ORGANISÉS D'AFFAIRES (${kb.services.voyage.price})
${kb.services.voyage.description}
Inclus: vols, hôtels 4-5 étoiles, transferts, petit-déjeuner, guide francophone, excursions.
Annulation: remboursement total jusqu'à J-30, 50% entre J-30 et J-15.

## RÈGLES DE CONVERSATION
1. Réponds UNIQUEMENT sur les sujets liés à Mr Saint et ses services
2. Si on te demande des informations hors sujet, redirige poliment vers nos services
3. Propose toujours une action concrète (visiter une page, réserver, contacter)
4. Utilise un ton professionnel mais chaleureux
5. Réponds en français
6. Ne fournis JAMAIS d'informations financières personnelles ou sensibles
7. Pour les questions complexes, suggère de contacter l'équipe directement

## LIENS UTILES À MENTIONNER
- Réservation: /reservation
- Contact: /contact
- Nos services: /services
- FAQ: /faq
- Facilitation visa: /facilitation-visa
- Création d'agence: /creation-agence
- Voyages: /voyages

## FORMAT DE RÉPONSE
- Sois concis (2-3 paragraphes maximum)
- Utilise des listes à puces si pertinent
- Termine par une question ou suggestion d'action`;
}
