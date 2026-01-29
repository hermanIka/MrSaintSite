import { useState } from "react";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Calendar, Loader2, CheckCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import contactHeroBanner from "@/assets/images/contact-hero-banner.png";

const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact", data);
      setIsSuccess(true);
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO 
        title="Contact"
        description="Contactez Mr Saint pour vos projets de visa, création d'agence ou voyages business. Réponse rapide garantie. Email: matandusaint@gmail.com"
        keywords="contact, Mr Saint, demande visa, agence voyage, consultation"
      />
      <section
        className="relative py-24 text-white overflow-hidden"
        style={{ marginTop: "80px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${contactHeroBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              data-testid="text-page-title"
              className="text-4xl sm:text-5xl font-heading font-bold mb-6"
            >
              Contactez-moi
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Une question sur nos services ? Un projet à discuter ? Je suis à
              votre écoute pour vous accompagner dans vos projets de voyage et
              d'entrepreneuriat.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Card className="border-primary/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-heading font-bold mb-6">
                    Envoyez-moi un message
                  </h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input
                                  data-testid="input-name"
                                  placeholder="Votre nom"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  data-testid="input-email"
                                  type="email"
                                  placeholder="votre@email.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sujet</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-subject"
                                placeholder="Objet de votre message"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                data-testid="input-message"
                                placeholder="Décrivez votre projet ou votre demande..."
                                rows={6}
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        data-testid="button-send-message"
                        size="lg"
                        className="w-full sm:w-auto rounded-full px-8"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Message envoyé !
                          </>
                        ) : (
                          "Envoyer le message"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6">
                    Contact direct
                  </h3>
                  <div className="space-y-6">
                    <Link href="/reservation">
                      <div
                        data-testid="link-whatsapp"
                        className="flex items-center gap-4 hover-elevate active-elevate-2 p-4 rounded-lg transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <SiWhatsapp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            WhatsApp
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Réserver d'abord
                          </div>
                        </div>
                        <Calendar className="w-5 h-5 text-primary ml-auto" />
                      </div>
                    </Link>

                    <Link href="/reservation">
                      <div
                        data-testid="link-phone"
                        className="flex items-center gap-4 hover-elevate active-elevate-2 p-4 rounded-lg transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Téléphone
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Réserver d'abord
                          </div>
                        </div>
                        <Calendar className="w-5 h-5 text-primary ml-auto" />
                      </div>
                    </Link>

                    <a
                      href="mailto:matandusaint@gmail.com"
                      data-testid="link-email"
                      className="flex items-center gap-4 hover-elevate active-elevate-2 p-4 rounded-lg transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">Email</div>
                        <div className="text-sm text-muted-foreground truncate">
                          matandusaint@gmail.com
                        </div>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6">
                    Informations
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground mb-1">
                          Localisation
                        </div>
                        <div className="text-sm text-muted-foreground">
                          France
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground mb-1">
                          Disponibilité
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Lundi - Samedi
                          <br />
                          9h00 - 19h00
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
