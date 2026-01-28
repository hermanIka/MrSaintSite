import { knowledgeBase } from "./knowledgeBase";

interface MatchResult {
  found: boolean;
  response: string;
  confidence: number;
  suggestedLinks?: string[];
}

interface Rule {
  keywords: string[];
  category: string;
  response: string;
  links?: string[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function calculateMatchScore(query: string, keywords: string[]): number {
  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(/\s+/);
  
  let matchCount = 0;
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedQuery.includes(normalizedKeyword)) {
      matchCount += 2;
    } else if (words.some(word => word.includes(normalizedKeyword) || normalizedKeyword.includes(word))) {
      matchCount += 1;
    }
  }
  
  return matchCount / keywords.length;
}

const rules: Rule[] = [
  {
    keywords: ["bonjour", "salut", "hello", "bonsoir", "coucou", "hey"],
    category: "greeting",
    response: `Bonjour et bienvenue chez Mr Saint ! Je suis l'assistant virtuel et je peux vous aider avec :

• La facilitation de visa
• La création d'agence de voyage
• Nos voyages organisés

Comment puis-je vous aider aujourd'hui ?`,
    links: ["/services"]
  },
  {
    keywords: ["visa", "document", "passeport", "demande visa", "obtenir visa"],
    category: "visa",
    response: `Notre service de Facilitation Visa vous accompagne de A à Z !

📋 Documents généralement requis :
• Passeport valide (6 mois minimum)
• Photos d'identité
• Justificatifs financiers
• Réservation hôtel ou lettre d'invitation

⏱️ Délais moyens :
• Dubaï : 3-5 jours
• Canada/USA : 2-4 semaines
• Europe Schengen : 1-2 semaines

💰 Tarif : À partir de 75€
📈 Taux de réussite : 95%

Souhaitez-vous réserver une consultation ?`,
    links: ["/facilitation-visa", "/reservation"]
  },
  {
    keywords: ["delai", "temps", "combien temps", "duree", "attendre"],
    category: "timing",
    response: `Les délais varient selon la destination :

• Dubaï : 3-5 jours
• Canada : 2-4 semaines
• États-Unis : 2-4 semaines
• Europe Schengen : 1-2 semaines

💡 Conseil : Commencez vos démarches au moins 1 mois avant votre voyage prévu.

Avez-vous une destination précise en tête ?`,
    links: ["/facilitation-visa"]
  },
  {
    keywords: ["refus", "refuse", "rejete", "echec", "pas accepte"],
    category: "refusal",
    response: `En cas de refus de visa, pas de panique !

Notre approche :
1. Analyse des raisons du refus
2. Conseils sur les actions correctives
3. Possibilité de reformuler la demande
4. Exploration d'alternatives si nécessaire

📈 Notre taux de réussite de 95% est dû à notre préparation minutieuse des dossiers.

Souhaitez-vous qu'on analyse votre situation ?`,
    links: ["/contact", "/facilitation-visa"]
  },
  {
    keywords: ["agence", "creer", "lancer", "entrepreneur", "formation", "business"],
    category: "agency",
    response: `Devenez entrepreneur du voyage avec notre programme de création d'agence !

📚 Notre formation comprend :
• 4 semaines de formation intensive
• Business plan personnalisé
• Accompagnement administratif
• 6 mois de coaching après formation
• Accès à notre réseau de partenaires

💰 Tarif : À partir de 230€
💼 Budget initial recommandé : 750€ - 3 000€
✅ Aucun diplôme requis !

Intéressé(e) par cette opportunité ?`,
    links: ["/creation-agence", "/reservation"]
  },
  {
    keywords: ["diplome", "etude", "qualification", "requis", "condition"],
    category: "requirements",
    response: `Bonne nouvelle : aucun diplôme spécifique n'est requis pour créer une agence de voyage !

Ce qu'il faut :
• Motivation et engagement
• Budget initial (750€ - 3 000€)
• Suivre notre formation (fortement recommandée)

Notre formation vous donne toutes les compétences nécessaires pour réussir dans ce métier.

Voulez-vous en savoir plus sur la formation ?`,
    links: ["/creation-agence"]
  },
  {
    keywords: ["budget", "cout", "prix", "tarif", "combien", "argent", "fcfa"],
    category: "pricing",
    response: `Voici nos tarifs :

🛂 Facilitation Visa : À partir de 75€
📚 Création d'Agence : À partir de 230€
✈️ Voyages Organisés : À partir de 750€

Pour la création d'agence, prévoyez un budget initial de 750€ à 3 000€ (formation + équipement + fonds de roulement).

Quel service vous intéresse ?`,
    links: ["/services", "/reservation"]
  },
  {
    keywords: ["voyage", "organise", "groupe", "excursion", "sejour", "vacances"],
    category: "trips",
    response: `Nos voyages organisés premium pour entrepreneurs et professionnels !

✈️ Ce qui est inclus :
• Vols aller-retour
• Hôtels 4-5 étoiles
• Transferts privés
• Petit-déjeuner
• Guide francophone
• Excursions sélectionnées
• Networking avec entrepreneurs locaux

💰 Tarif : À partir de 750€

Nous proposons aussi des voyages sur mesure pour les groupes !`,
    links: ["/voyages", "/reservation"]
  },
  {
    keywords: ["annulation", "annuler", "rembours", "cancel"],
    category: "cancellation",
    response: `Conditions d'annulation pour nos voyages :

• Jusqu'à 30 jours avant le départ : Remboursement intégral
• Entre 30 et 15 jours : Remboursement de 50%
• Moins de 15 jours : Aucun remboursement

💡 Conseil : Nous recommandons toujours une assurance annulation pour vous protéger des imprévus.

Avez-vous d'autres questions ?`,
    links: ["/voyages"]
  },
  {
    keywords: ["maison", "domicile", "teletravail", "distance", "chez moi"],
    category: "remote",
    response: `Absolument ! Vous pouvez gérer votre agence de voyage depuis chez vous !

Avantages du travail à domicile :
• Flexibilité totale
• Économie sur les frais de local
• Outils numériques modernes
• Liberté géographique

Notre formation inclut les meilleures pratiques du travail à distance.

Intéressé(e) par cette liberté ?`,
    links: ["/creation-agence"]
  },
  {
    keywords: ["contact", "joindre", "appeler", "email", "telephone", "parler"],
    category: "contact",
    response: `Vous pouvez nous contacter de plusieurs façons :

📧 Via notre page de contact
📅 En prenant rendez-vous directement

Notre équipe est disponible 7j/7 et répond généralement sous 24h.

Préférez-vous nous contacter ou réserver directement ?`,
    links: ["/contact", "/reservation"]
  },
  {
    keywords: ["reserver", "reservation", "rdv", "rendez-vous", "prendre"],
    category: "booking",
    response: `Pour réserver un service Mr Saint :

1. Choisissez votre service (Visa, Agence, Voyage)
2. Effectuez le paiement sécurisé
3. Recevez votre confirmation par email
4. Nous vous recontactons sous 24h

🔒 Paiement 100% sécurisé
✅ Satisfaction garantie

Prêt(e) à démarrer ?`,
    links: ["/reservation"]
  },
  {
    keywords: ["qui", "mr saint", "entreprise", "histoire", "fondateur", "propos"],
    category: "about",
    response: `Mr Saint, c'est :

📅 Fondée en 2018
👨‍💼 7+ ans d'expertise dans le voyage
👥 500+ clients satisfaits
🌍 50+ pays partenaires
⭐ 98% de satisfaction

Nos valeurs : Excellence, Confiance, Innovation, Accompagnement

Notre mission : Vous accompagner dans tous vos projets de voyage et création d'agence.`,
    links: ["/a-propos"]
  },
  {
    keywords: ["merci", "super", "genial", "parfait", "excellent"],
    category: "thanks",
    response: `Avec plaisir !

N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider !

Vous pouvez aussi :
• Explorer nos services
• Réserver directement
• Nous contacter pour une question spécifique`,
    links: ["/services", "/reservation", "/contact"]
  },
  {
    keywords: ["portfolio", "realisation", "client", "accompagne", "projet", "success", "reussite", "exemple", "cas"],
    category: "portfolio",
    response: `Découvrez nos réalisations et clients accompagnés !

Quelques succès récents :
• Afrique Travel Express - Agence de voyage créée avec 50+ réservations le premier mois
• Elite Visa Consulting - 100% de réussite sur 25 dossiers visa traités
• Business Travel Pro - 8 partenariats commerciaux signés lors d'un voyage Dubaï

Nos chiffres :
• 50+ projets accompagnés
• 95% de taux de réussite
• 8+ années d'expérience

Visitez notre portfolio pour voir tous les détails !`,
    links: ["/portfolio"]
  },
  {
    keywords: ["temoignage", "avis", "recommandation", "experience", "satisfait"],
    category: "testimonials",
    response: `Nos clients témoignent de leur expérience :

Nos clients ont réussi :
• Sophie Martin (Go Africa Travel) - CA de 150k€/an après formation
• Karim Bensalem - 3 partenariats majeurs après voyage Dubaï
• Marie Dupont - Taux de réussite visa impressionnant

Consultez notre portfolio pour plus de success stories !`,
    links: ["/portfolio", "/a-propos"]
  },
  {
    keywords: ["aide", "aider", "question", "info", "information", "renseigner"],
    category: "help",
    response: `Je suis là pour vous aider ! Voici ce que je peux faire :

🛂 Facilitation Visa - Toutes destinations
📚 Création d'Agence - Formation complète
✈️ Voyages Organisés - Expériences premium

Posez-moi vos questions sur :
• Les documents nécessaires
• Les délais et tarifs
• Les conditions et modalités

Que souhaitez-vous savoir ?`,
    links: ["/services", "/faq"]
  }
];

export function findBestMatch(query: string): MatchResult {
  let bestMatch: Rule | null = null;
  let bestScore = 0;

  for (const rule of rules) {
    const score = calculateMatchScore(query, rule.keywords);
    if (score > bestScore && score >= 0.3) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (bestMatch) {
    return {
      found: true,
      response: bestMatch.response,
      confidence: bestScore,
      suggestedLinks: bestMatch.links
    };
  }

  for (const faq of knowledgeBase.faq) {
    const questionScore = calculateMatchScore(query, faq.question.split(" "));
    if (questionScore > 0.4) {
      return {
        found: true,
        response: faq.answer + "\n\nCette information vous aide-t-elle ?",
        confidence: questionScore,
        suggestedLinks: ["/faq"]
      };
    }
  }

  return {
    found: false,
    response: `Je ne suis pas sûr de comprendre votre question. Voici ce que je peux vous aider avec :

• 🛂 Facilitation Visa
• 📚 Création d'Agence de Voyage
• ✈️ Voyages Organisés

Pouvez-vous reformuler ou choisir un de ces sujets ?

Vous pouvez aussi consulter notre FAQ ou nous contacter directement.`,
    confidence: 0,
    suggestedLinks: ["/faq", "/contact", "/services"]
  };
}

export function generateRuleBasedResponse(message: string): string {
  const result = findBestMatch(message);
  return result.response;
}
