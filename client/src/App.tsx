import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "@/modules/foundation";
import { HomePage, TripsPage, TripDetailPage, PortfolioPage, NotFoundPage } from "@/modules/content";
import { ContactPage } from "@/modules/interaction";
import { FacilitationVisaPage, CreationAgencePage } from "@/modules/process";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
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
