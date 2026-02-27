import { useQuery } from "@tanstack/react-query";

export interface ServicePrices {
  visa: number;
  consultation: number;
  agence_classique: number;
  agence_premium: number;
  agence_elite: number;
  [key: string]: number;
}

const DEFAULT_PRICES: ServicePrices = {
  visa: 600,
  consultation: 20,
  agence_classique: 800,
  agence_premium: 1500,
  agence_elite: 2500,
};

export function usePrices() {
  const { data, isLoading } = useQuery<ServicePrices>({
    queryKey: ["/api/prices"],
    staleTime: 5 * 60 * 1000,
  });

  return {
    prices: data ?? DEFAULT_PRICES,
    isLoading,
  };
}
