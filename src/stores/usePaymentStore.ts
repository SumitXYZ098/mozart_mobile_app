import { create } from "zustand";
import { storageAPI } from "@/utils/storage";

export interface Card {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  isPrimary: boolean;
  enableAutopay: boolean;
}

export interface BankDetails {
  country: string;
  transferMethod: string;
  currency: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode?: string;
  routingNumber?: string;
  transitNumber?: string;
  institutionNumber?: string;
  sortCode?: string;
  iban?: string;
  swiftCode?: string;
}

interface PaymentStore {
  cards: Card[];
  bankDetails: BankDetails | null;
  isLoaded: boolean;
  loadPaymentState: () => Promise<void>;
  addCard: (card: Omit<Card, "id">) => Promise<void>;
  updateCard: (id: string, card: Omit<Card, "id">) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  setPrimaryCard: (id: string) => Promise<void>;
  saveBankDetails: (details: BankDetails) => Promise<void>;
}

const CARDS_STORAGE_KEY = "user_saved_cards";
const BANK_STORAGE_KEY = "user_bank_details";

const DEFAULT_CARDS: Card[] = [
  {
    id: "card-1",
    cardHolder: "YHTGRFED",
    cardNumber: "3939 3032 0223 3232",
    expiryDate: "12/28",
    cvv: "765",
    isPrimary: true,
    enableAutopay: true,
  },
  {
    id: "card-2",
    cardHolder: "YHTGRFED",
    cardNumber: "3939 3032 0223 3232",
    expiryDate: "12/28",
    cvv: "765",
    isPrimary: false,
    enableAutopay: false,
  },
];

const DEFAULT_BANK_DETAILS: BankDetails = {
  country: "India",
  transferMethod: "International Wire Transfer",
  currency: "₹",
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
};

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  cards: [],
  bankDetails: null,
  isLoaded: false,

  loadPaymentState: async () => {
    try {
      const savedCardsRaw = await storageAPI.getItem(CARDS_STORAGE_KEY);
      const savedBankRaw = await storageAPI.getItem(BANK_STORAGE_KEY);

      let cards = DEFAULT_CARDS;
      if (savedCardsRaw) {
        cards = JSON.parse(savedCardsRaw);
      } else {
        // Save defaults if not already present
        await storageAPI.setItem(CARDS_STORAGE_KEY, JSON.stringify(DEFAULT_CARDS));
      }

      let bankDetails = DEFAULT_BANK_DETAILS;
      if (savedBankRaw) {
        bankDetails = JSON.parse(savedBankRaw);
      }

      set({ cards, bankDetails, isLoaded: true });
    } catch (error) {
      console.warn("Failed to load payment state from storage:", error);
      // Fallback to defaults
      set({ cards: DEFAULT_CARDS, bankDetails: DEFAULT_BANK_DETAILS, isLoaded: true });
    }
  },

  addCard: async (newCardData) => {
    const { cards } = get();
    const id = `card-${Date.now()}`;
    const newCard: Card = { ...newCardData, id };

    let updatedCards = [...cards];
    if (newCard.isPrimary) {
      // Set all other cards as non-primary
      updatedCards = updatedCards.map((c) => ({ ...c, isPrimary: false }));
    }

    updatedCards.push(newCard);
    set({ cards: updatedCards });
    await storageAPI.setItem(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  },

  removeCard: async (id) => {
    const { cards } = get();
    const updatedCards = cards.filter((c) => c.id !== id);
    
    // If the removed card was primary and we have other cards left, make the first one primary
    if (cards.find((c) => c.id === id)?.isPrimary && updatedCards.length > 0) {
      updatedCards[0].isPrimary = true;
    }

    set({ cards: updatedCards });
    await storageAPI.setItem(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  },

  setPrimaryCard: async (id) => {
    const { cards } = get();
    const updatedCards = cards.map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    set({ cards: updatedCards });
    await storageAPI.setItem(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  },

  updateCard: async (id, updatedCardData) => {
    const { cards } = get();
    let updatedCards = cards.map((c) =>
      c.id === id ? { ...updatedCardData, id } : c
    );

    if (updatedCardData.isPrimary) {
      // Set all other cards as non-primary
      updatedCards = updatedCards.map((c) =>
        c.id === id ? c : { ...c, isPrimary: false }
      );
    }

    set({ cards: updatedCards });
    await storageAPI.setItem(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  },

  saveBankDetails: async (details) => {
    set({ bankDetails: details });
    await storageAPI.setItem(BANK_STORAGE_KEY, JSON.stringify(details));
  },
}));
