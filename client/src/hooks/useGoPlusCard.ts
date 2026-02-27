import { useState } from "react";

const STORAGE_KEY = "go_plus_card";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

export interface StoredGoPlusCard {
  email: string;
  planName: string;
  discountPercentage: number;
  cardNumber: string;
  endDate: string;
  verifiedAt: string;
}

function getStoredCard(): StoredGoPlusCard | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const card = JSON.parse(raw) as StoredGoPlusCard;
    if (card.endDate && new Date(card.endDate) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (card.verifiedAt && Date.now() - new Date(card.verifiedAt).getTime() > CACHE_DURATION_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return card;
  } catch {
    return null;
  }
}

export function useGoPlusCard() {
  const [card, setCard] = useState<StoredGoPlusCard | null>(() => getStoredCard());

  const saveCard = (
    email: string,
    data: { planName?: string; discountPercentage?: number; cardNumber: string; endDate: string }
  ) => {
    const stored: StoredGoPlusCard = {
      email: email.toLowerCase().trim(),
      planName: data.planName || "",
      discountPercentage: data.discountPercentage || 0,
      cardNumber: data.cardNumber,
      endDate: data.endDate,
      verifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setCard(stored);
  };

  const clearCard = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCard(null);
  };

  const isGold = card?.planName === "Gold";
  const isPremium = card?.planName === "Premium";
  const isActive = card !== null;

  return { card, isGold, isPremium, isActive, saveCard, clearCard };
}
