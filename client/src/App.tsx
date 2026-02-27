import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

import { ThemeProvider } from "@/modules/foundation";
import { GoldAssistanceWidget } from "@/components/GoldAssistanceWidget";
import { HomePage, AboutPage, TripsPage, TripDetailPage, PortfolioPage, NotFoundPage } from "@/modules/content";
import { ContactPage, FAQPage } from "@/modules/interaction";
import { FacilitationVisaPage, CreationAgencePage, ServicesPage, VoyageCreditPage } from "@/modules/process";
import { ReservationPage, GoPlusPage, GoPlusSuccessPage, GoPlusFailedPage } from "@/modules/transaction";
import {
  AdminLoginPage,
  AdminDashboard,
  AdminTripsPage,
  AdminTestimonialsPage,
  AdminPortfolioPage,
  AdminFaqPage,
  AdminServicesPage,
  AdminLogsPage,
  AdminCreditRequestsPage,
  AdminGoPlusPage,
  AdminVisaRequestsPage,
  AdminAgencyRequestsPage,
  AdminPricesPage,
} from "@/modules/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/a-propos" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/reservation" component={ReservationPage} />
      <Route path="/facilitation-visa" component={FacilitationVisaPage} />
      <Route path="/creation-agence" component={CreationAgencePage} />
      <Route path="/voyage-credit" component={VoyageCreditPage} />
      <Route path="/voyages" component={TripsPage} />
      <Route path="/voyages/:id" component={TripDetailPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/go-plus" component={GoPlusPage} />
      <Route path="/go-plus/success" component={GoPlusSuccessPage} />
      <Route path="/go-plus/failed" component={GoPlusFailedPage} />
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/trips" component={AdminTripsPage} />
      <Route path="/admin/testimonials" component={AdminTestimonialsPage} />
      <Route path="/admin/portfolio" component={AdminPortfolioPage} />
      <Route path="/admin/faq" component={AdminFaqPage} />
      <Route path="/admin/services" component={AdminServicesPage} />
      <Route path="/admin/credit-requests" component={AdminCreditRequestsPage} />
      <Route path="/admin/go-plus" component={AdminGoPlusPage} />
      <Route path="/admin/visa-requests" component={AdminVisaRequestsPage} />
      <Route path="/admin/agency-requests" component={AdminAgencyRequestsPage} />
      <Route path="/admin/tarifs" component={AdminPricesPage} />
      <Route path="/admin/logs" component={AdminLogsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <GoldAssistanceWidget />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
