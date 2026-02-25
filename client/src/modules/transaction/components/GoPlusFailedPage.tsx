import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { Link, useSearch } from "wouter";

export default function GoPlusFailedPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const reason = params.get("reason") || "";

  return (
    <Layout>
      <SEO title="Paiement échoué | Mr Saint Travel" description="Le paiement GO+ n'a pas pu être traité." />

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-heading font-bold">Paiement non abouti</h1>
          <p className="text-muted-foreground">
            {reason === "transaction_not_found"
              ? "La transaction n'a pas été trouvée. Contacte-nous si tu as été débité."
              : "Ton paiement n'a pas pu être traité. Aucun montant n'a été prélevé."}
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/go-plus">
              <Button data-testid="button-retry-purchase" className="w-full" size="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </Link>
            <Link href="/">
              <Button data-testid="button-go-home-failed" variant="outline" className="w-full" size="default">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Un problème ? Contacte-nous via WhatsApp ou la page contact.
          </p>
        </div>
      </div>
    </Layout>
  );
}
