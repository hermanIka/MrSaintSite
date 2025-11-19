import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/Home";
import FacilitationVisa from "@/pages/FacilitationVisa";
import CreationAgence from "@/pages/CreationAgence";
import Voyages from "@/pages/Voyages";
import TripDetail from "@/pages/TripDetail";
import PortfolioPage from "@/pages/Portfolio";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/facilitation-visa" component={FacilitationVisa} />
      <Route path="/creation-agence" component={CreationAgence} />
      <Route path="/voyages" component={Voyages} />
      <Route path="/voyages/:id" component={TripDetail} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
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
