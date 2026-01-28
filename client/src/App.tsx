import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "@/modules/foundation";
import { HomePage, AboutPage, TripsPage, TripDetailPage, PortfolioPage, NotFoundPage } from "@/modules/content";
import { ContactPage, FAQPage } from "@/modules/interaction";
import { FacilitationVisaPage, CreationAgencePage, ServicesPage } from "@/modules/process";
import { ReservationPage } from "@/modules/transaction";

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
      <Route path="/voyages" component={TripsPage} />
      <Route path="/voyages/:id" component={TripDetailPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
