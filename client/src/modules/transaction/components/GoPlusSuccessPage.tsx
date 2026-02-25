import { useState, useEffect, useRef } from "react";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Home, Loader2, Clock, AlertCircle } from "lucide-react";
import { Link, useSearch, useLocation } from "wouter";

type PollStatus = "pending" | "paid" | "failed" | "timeout";

export default function GoPlusSuccessPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const initialCardNumber = params.get("cardNumber") || "";
  const isPending = params.get("pending") === "1";
  const transactionId = params.get("transactionId") || "";

  const [pollStatus, setPollStatus] = useState<PollStatus>(isPending ? "pending" : "paid");
  const [polledCardNumber, setPolledCardNumber] = useState(initialCardNumber);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TIMEOUT_CYCLES = 150;
  const POLL_INTERVAL_MS = 4000;

  useEffect(() => {
    if (!isPending || !transactionId) return;

    intervalRef.current = setInterval(async () => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= TIMEOUT_CYCLES) {
          clearInterval(intervalRef.current!);
          setPollStatus("timeout");
        }
        return next;
      });

      try {
        const res = await fetch(`/api/go-plus/verify/${transactionId}`);
        const data = await res.json();
        if (!data.success) return;

        const status = data.status as string;

        if (status === "paid") {
          clearInterval(intervalRef.current!);
          setPollStatus("paid");
          if (data.cardNumber) setPolledCardNumber(data.cardNumber);
        } else if (status === "failed") {
          clearInterval(intervalRef.current!);
          setLocation(`/go-plus/failed?transactionId=${transactionId}`);
        }
      } catch {
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPending, transactionId]);

  const cardNumber = polledCardNumber || initialCardNumber;
  const minutesLeft = Math.max(0, Math.ceil((TIMEOUT_CYCLES - elapsed) * POLL_INTERVAL_MS / 60000));

  return (
    <Layout>
      <SEO title="GO+ Activée | Mr Saint Travel" description="Votre carte GO+ a été activée avec succès." />

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">

          {pollStatus === "pending" && (
            <>
              <div className="w-20 h-20 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Paiement en attente</h1>
              <p className="text-muted-foreground">
                Confirme le paiement sur ton téléphone Mobile Money. Ta carte GO+ s'activera automatiquement dès validation.
              </p>
              {transactionId && (
                <p className="text-sm text-muted-foreground font-mono">
                  Réf : {transactionId}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Vérification en cours... ({minutesLeft} min restantes)</span>
              </div>
            </>
          )}

          {pollStatus === "timeout" && (
            <>
              <div className="w-20 h-20 rounded-full bg-orange-500/15 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Délai dépassé</h1>
              <p className="text-muted-foreground">
                Aucune confirmation reçue dans les 10 minutes. Si tu as validé le paiement, ta carte sera activée automatiquement par notre système.
              </p>
              {transactionId && (
                <p className="text-sm text-muted-foreground font-mono">
                  Réf : {transactionId}
                </p>
              )}
              <Link href="/go-plus">
                <Button data-testid="button-retry" className="w-full" size="default">
                  Réessayer
                </Button>
              </Link>
            </>
          )}

          {pollStatus === "paid" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Carte GO+ activée !</h1>
              <p className="text-muted-foreground">
                Bravo ! Ta carte GO+ est maintenant active. Tu bénéficies de réductions sur tous les services Mr Saint. Un email de confirmation t'a été envoyé.
              </p>
            </>
          )}

          {pollStatus === "paid" && cardNumber && (
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

          {(pollStatus === "paid") && (
            <Link href="/">
              <Button data-testid="button-go-home" className="w-full" size="default">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
