import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Layout>
      <SEO 
        title="Page Non Trouvée"
        description="La page que vous recherchez n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer votre navigation."
      />
      <div className="min-h-[60vh] flex items-center justify-center" style={{ marginTop: "80px" }}>
        <div className="text-center px-4">
          <h1 className="text-6xl font-heading font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
            {t("notFound.title")}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t("notFound.subtitle")}
          </p>
          <Link href="/">
            <Button data-testid="button-back-home" size="lg" className="rounded-full">
              {t("notFound.backHome")}
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
