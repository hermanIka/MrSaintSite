import { useState } from "react";
import { Layout } from "@/modules/foundation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, Search, HelpCircle, FileText, Briefcase, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "Toutes", icon: HelpCircle },
    { id: "visa", label: "Visa", icon: FileText },
    { id: "agence", label: "Création d'agence", icon: Briefcase },
    { id: "voyages", label: "Voyages", icon: Plane },
  ];

  const faqs: FAQItem[] = [
    {
      category: "visa",
      question: "Quels documents sont nécessaires pour une demande de visa ?",
      answer:
        "Les documents varient selon la destination et le type de visa. En général, vous aurez besoin d'un passeport valide (6 mois minimum), des photos d'identité, un justificatif de ressources financières, une réservation d'hôtel ou lettre d'invitation, et parfois une assurance voyage. Nous analysons votre situation et vous fournissons une liste personnalisée.",
    },
    {
      category: "visa",
      question: "Combien de temps prend l'obtention d'un visa ?",
      answer:
        "Le délai varie selon le pays de destination : 3-5 jours pour Dubaï, 2-4 semaines pour le Canada ou les États-Unis, 1-2 semaines pour l'Europe Schengen. Nous vous recommandons de commencer les démarches au moins 1 mois avant votre voyage prévu.",
    },
    {
      category: "visa",
      question: "Que se passe-t-il si ma demande de visa est refusée ?",
      answer:
        "En cas de refus, nous analysons les raisons avec vous et vous conseillons sur les actions correctives possibles. Selon les cas, nous pouvons vous aider à reformuler votre demande ou à explorer des alternatives. Notre taux de réussite est de 95% grâce à notre préparation minutieuse des dossiers.",
    },
    {
      category: "agence",
      question: "Faut-il un diplôme pour créer une agence de voyage ?",
      answer:
        "Non, aucun diplôme spécifique n'est requis. Cependant, une formation comme celle que nous proposons est fortement recommandée pour comprendre le métier, les obligations légales, et développer les compétences nécessaires au succès de votre agence.",
    },
    {
      category: "agence",
      question: "Quel budget faut-il pour lancer son agence ?",
      answer:
        "Le budget initial varie entre 500 000 et 2 000 000 FCFA selon l'envergure de votre projet. Cela inclut la formation, les frais administratifs, l'équipement de base et un fonds de roulement. Notre programme inclut un accompagnement pour optimiser vos investissements.",
    },
    {
      category: "agence",
      question: "Combien de temps dure la formation ?",
      answer:
        "Notre programme de formation s'étend sur 4 semaines intensives, suivies de 6 mois de coaching personnalisé. Vous pouvez commencer à opérer dès la fin de la formation, avec notre soutien continu pour vos premiers mois d'activité.",
    },
    {
      category: "agence",
      question: "Puis-je travailler depuis chez moi ?",
      answer:
        "Absolument ! De nombreux agents de voyage travaillent depuis leur domicile, surtout au début. Avec les outils numériques actuels, vous pouvez gérer votre agence de n'importe où. Nous vous formons aux meilleures pratiques du travail à distance.",
    },
    {
      category: "voyages",
      question: "Qu'est-ce qui est inclus dans vos voyages organisés ?",
      answer:
        "Nos packages comprennent généralement : les vols aller-retour, l'hébergement en hôtel 4-5 étoiles, les transferts aéroport-hôtel, le petit-déjeuner, certaines excursions, et l'accompagnement d'un guide francophone. Les détails exacts sont précisés pour chaque voyage.",
    },
    {
      category: "voyages",
      question: "Peut-on personnaliser un voyage de groupe ?",
      answer:
        "Oui, nous proposons des voyages sur mesure pour les groupes (entreprises, associations, familles). Contactez-nous avec vos besoins spécifiques et nous créerons un programme adapté à vos attentes et votre budget.",
    },
    {
      category: "voyages",
      question: "Quelles sont les conditions d'annulation ?",
      answer:
        "Les conditions varient selon le voyage. En général : remboursement intégral jusqu'à 30 jours avant le départ, 50% entre 30 et 15 jours, et aucun remboursement après. Nous recommandons toujours une assurance annulation pour vous protéger des imprévus.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout>
      <section className="relative py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            data-testid="text-faq-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
          >
            Foire Aux Questions
          </h1>
          <p
            data-testid="text-faq-subtitle"
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Trouvez rapidement les réponses à vos questions
          </p>
        </div>
      </section>

      <section className="py-12 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              data-testid="input-faq-search"
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  data-testid={`button-category-${category.id}`}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  Aucune question ne correspond à votre recherche.
                </p>
                <Button
                  data-testid="button-reset-search"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                >
                  Réinitialiser la recherche
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <Card
                  key={index}
                  data-testid={`card-faq-${index}`}
                  className="border-primary/20"
                >
                  <button
                    data-testid={`button-faq-toggle-${index}`}
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4"
                  >
                    <span className="text-lg font-medium text-foreground">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 mt-1">
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </span>
                  </button>
                  {openIndex === index && (
                    <CardContent className="px-6 pb-6 pt-0">
                      <p data-testid={`text-faq-answer-${index}`} className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Notre équipe est disponible pour répondre à toutes vos questions personnellement.
          </p>
          <Link href="/contact">
            <Button
              data-testid="button-contact-us"
              size="lg"
              variant="secondary"
            >
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
