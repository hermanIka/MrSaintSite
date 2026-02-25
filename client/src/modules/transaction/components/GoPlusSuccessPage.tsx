import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Home, Loader2 } from "lucide-react";
import { Link, useSearch } from "wouter";

export default function GoPlusSuccessPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const cardNumber = params.get("cardNumber") || "";
  const isPending = params.get("pending") === "1";
  const transactionId = params.get("transactionId") || "";

  return (
    <Layout>
      <SEO title="GO+ Activée | Mr Saint Travel" description="Votre carte GO+ a été activée avec succès." />

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          {isPending ? (
            <>
              <div className="w-20 h-20 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Paiement en attente</h1>
              <p className="text-muted-foreground">
                Confirme le paiement sur ton téléphone. Ta carte GO+ sera activée automatiquement.
              </p>
              {transactionId && (
                <p className="text-sm text-muted-foreground font-mono">
                  Réf : {transactionId}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Carte GO+ activée !</h1>
              <p className="text-muted-foreground">
                Bravo ! Ta carte GO+ est maintenant active. Tu bénéficies de réductions sur tous les services Mr Saint.
              </p>
            </>
          )}

          {cardNumber && (
            <Card className="border-primary/30 bg-primary/5 text-left">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Numéro de carte</span>
                </div>
                <p className="font-mono text-sm bg-background/60 rounded-md px-3 py-2 text-foreground break-all">
                  {cardNumber}
                </p>
                <Badge
                  data-testid="badge-card-active"
                  className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30"
                >
                  Carte active — 1 an
                </Badge>
              </CardContent>
            </Card>
          )}

          <Link href="/">
            <Button data-testid="button-go-home" className="w-full" size="default">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
