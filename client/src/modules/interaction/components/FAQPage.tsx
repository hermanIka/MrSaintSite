import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, Search, HelpCircle, FileText, Briefcase, Plane, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import faqHeroBanner from "@/assets/images/faq-hero-banner.png";
import type { Faq } from "@shared/schema";

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

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
  });

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
      <SEO 
        title="Questions Fréquentes"
        description="Trouvez les réponses à vos questions sur les visas, la création d'agence de voyage et les voyages organisés. FAQ complète Mr Saint."
        keywords="FAQ, questions visa, création agence, voyages, aide, support"
      />
      <section className="relative py-32 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${faqHeroBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFaqs.length === 0 ? (
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
                  key={faq.id}
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
