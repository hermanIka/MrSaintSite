import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFoundPage() {
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
            Page non trouvée
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link href="/">
            <Button data-testid="button-back-home" size="lg" className="rounded-full">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
