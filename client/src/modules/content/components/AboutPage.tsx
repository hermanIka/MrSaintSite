import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Award, Globe, Users, Target, CheckCircle, Plane } from "lucide-react";
import mrSaintPhoto from "@assets/Mr_saint_photo_profil_1769639553577.jfif";
import aboutHeroBanner from "@/assets/images/about-hero-banner.png";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  const milestones = [
    { year: t("about.milestone0Year"), title: t("about.milestone0Title"), description: t("about.milestone0Desc") },
    { year: t("about.milestone1Year"), title: t("about.milestone1Title"), description: t("about.milestone1Desc") },
    { year: t("about.milestone2Year"), title: t("about.milestone2Title"), description: t("about.milestone2Desc") },
    { year: t("about.milestone3Year"), title: t("about.milestone3Title"), description: t("about.milestone3Desc") },
  ];

  const values = [
    { icon: Award, title: t("about.value0Title"), description: t("about.value0Desc") },
    { icon: Users, title: t("about.value1Title"), description: t("about.value1Desc") },
    { icon: Globe, title: t("about.value2Title"), description: t("about.value2Desc") },
    { icon: Target, title: t("about.value3Title"), description: t("about.value3Desc") },
  ];

  const stats = [
    { value: "7+", label: t("about.stat0Label") },
    { value: "500+", label: t("about.stat1Label") },
    { value: "15+", label: t("about.stat2Label") },
    { value: "98%", label: t("about.stat3Label") },
  ];

  return (
    <Layout>
      <SEO 
        title="À Propos"
        description="Découvrez Mr Saint, expert voyagiste depuis 2018. Plus de 500 clients accompagnés, 50+ agences créées. Une vision premium du tourisme et de l'accompagnement business."
        keywords="Mr Saint, expert voyage, histoire, parcours, agence voyage premium"
      />
      <section className="relative py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={aboutHeroBanner} 
            alt="" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-testid="badge-since-2018" className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
            <Plane className="w-4 h-4" />
            <span className="text-sm font-medium">{t("about.since")}</span>
          </div>
          <h1
            data-testid="text-about-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
          >
            {t("about.title")}
          </h1>
          <p
            data-testid="text-about-subtitle"
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            {t("about.subtitle")}
          </p>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <img
                    src={mrSaintPhoto}
                    alt="Mr Saint - Fondateur"
                    data-testid="img-mr-saint-profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-primary/30"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h2
                    data-testid="text-story-title"
                    className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2"
                  >
                    {t("about.storyTitle")}
                  </h2>
                  <p data-testid="text-founder-name" className="text-primary font-medium">{t("about.founderLabel")}</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t("about.story1")}</p>
                <p>{t("about.story2")}</p>
                <p>{t("about.story3")}</p>
                <p>{t("about.story4")}</p>
                <ul className="space-y-2">
                  <li><strong className="text-foreground">Go Fly</strong> : {t("about.goFlyDesc")}</li>
                  <li><strong className="text-foreground">Go Send</strong> : {t("about.goSendDesc")}</li>
                  <li><strong className="text-foreground">Go House</strong> : {t("about.goHouseDesc")}</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/services">
                  <Button data-testid="button-discover-services" size="lg">
                    {t("about.discoverServices")}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button data-testid="button-contact-us" variant="outline" size="lg">
                    {t("about.contactUs")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  data-testid={`card-stat-${index}`}
                  className="border-primary/20 overflow-visible hover-elevate"
                >
                  <CardContent className="p-6 text-center">
                    <div data-testid={`text-stat-value-${index}`} className="text-4xl font-heading font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div data-testid={`text-stat-label-${index}`} className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-testid="text-values-title" className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              {t("about.valuesTitle")}
            </h2>
            <p data-testid="text-values-subtitle" className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("about.valuesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  data-testid={`card-value-${index}`}
                  className="border-primary/20 overflow-visible hover-elevate"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 data-testid={`text-value-title-${index}`} className="text-lg font-heading font-semibold mb-2 text-foreground">
                      {value.title}
                    </h3>
                    <p data-testid={`text-value-desc-${index}`} className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-testid="text-journey-title" className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              {t("about.journeyTitle")}
            </h2>
            <p data-testid="text-journey-subtitle" className="text-lg text-muted-foreground">
              {t("about.journeySubtitle")}
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                data-testid={`milestone-${index}`}
                className="flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1 pt-2">
                  <div data-testid={`text-milestone-year-${index}`} className="text-sm font-medium text-primary mb-1">{milestone.year}</div>
                  <h3 data-testid={`text-milestone-title-${index}`} className="text-xl font-heading font-semibold text-foreground mb-2">
                    {milestone.title}
                  </h3>
                  <p data-testid={`text-milestone-desc-${index}`} className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            {t("about.ctaTitle")}
          </h2>
          <p className="text-lg mb-10 opacity-90">
            {t("about.ctaSubtitle")}
          </p>
          <Link href="/reservation">
            <Button
              data-testid="button-cta-contact"
              size="lg"
              variant="secondary"
            >{t("about.ctaBtn")}</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
