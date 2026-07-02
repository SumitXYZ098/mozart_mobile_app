import { create } from "zustand";
import { storageAPI } from "@/utils/storage";
import { getBillingCards, submitBillingCard, updateBillingCard, deleteBillingCard, getAllBankDetails } from "@/api/userApi";

export interface Card {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  isPrimary: boolean;
  enableAutopay: boolean;
  isBankAccount?: boolean;
  bankDetailsId?: number;
  bankName?: string;
  system?: string;
  ifscCode?: string;
  routingNumber?: string;
  transitNumber?: string;
  institutionNumber?: string;
  sortCode?: string;
  iban?: string;
  swiftCode?: string;
}

export interface BankDetails {
  id?: number;
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

      let cardsList = savedCardsRaw ? JSON.parse(savedCardsRaw) : [];

      try {
        const [serverCards, serverBankList] = await Promise.all([
          getBillingCards(),
          getAllBankDetails(),
        ]);

        const formattedBankCards: Card[] = (serverBankList || []).map((resp: any) => {
          const rawCardNum = resp.account_number || resp.accountNumber || resp.iban || "0000";
          const formattedCardNum = rawCardNum.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
          return {
            id: `card-bank-${resp.id}`,
            cardHolder: resp.account_holder_name || resp.accountHolderName || "Bank Account",
            cardNumber: formattedCardNum || "0000 0000 0000 0000",
            expiryDate: "12/29",
            cvv: "123",
            isPrimary: false,
            enableAutopay: true,
            isBankAccount: true,
            bankDetailsId: resp.id,
            bankName: resp.bank_name || resp.bankName || "Bank",
            system: resp.system || "SWIFT",
            ifscCode: resp.ifsc_code || resp.ifscCode,
            routingNumber: resp.routing_number || resp.routingNumber,
            transitNumber: resp.transit_number || resp.transitNumber,
            institutionNumber: resp.institution_number || resp.institutionNumber,
            sortCode: resp.sort_code || resp.sortCode,
            iban: resp.iban,
            swiftCode: resp.swift_code || resp.swiftCode,
          };
        });

        // Merge server billing cards with server bank details
        cardsList = [...(serverCards || []), ...formattedBankCards];
        await storageAPI.setItem(CARDS_STORAGE_KEY, JSON.stringify(cardsList));
        
        // Update local bank details storage with the first one as a fallback
        if (serverBankList && serverBankList.length > 0) {
          await storageAPI.setItem(BANK_STORAGE_KEY, JSON.stringify(serverBankList[0]));
        }
      } catch (err) {
        console.warn("Failed to load cards from server, using local fallback:", err);
      }

      let bankDetails = DEFAULT_BANK_DETAILS;
      const currentBankRaw = await storageAPI.getItem(BANK_STORAGE_KEY);
      if (currentBankRaw) {
        bankDetails = JSON.parse(currentBankRaw);
      }

      set({ cards: cardsList, bankDetails, isLoaded: true });
    } catch (error) {
      console.warn("Failed to load payment state from storage:", error);
      set({ cards: [], bankDetails: DEFAULT_BANK_DETAILS, isLoaded: true });
    }
  },

  addCard: async (newCardData) => {
    const { cards } = get();
    
    const [month, year] = newCardData.expiryDate.split("/");
    const expiryMonthVal = month ? month.trim() : "";
    let expiryYearVal = year ? year.trim() : "";
    if (expiryYearVal.length === 2) {
      expiryYearVal = `20${expiryYearVal}`;
    }

    const apiPayload = {
      card_holder_name: newCardData.cardHolder,
      card_number: newCardData.cardNumber.replace(/\s/g, ""),
      expiry_month: expiryMonthVal,
      expiry_year: expiryYearVal,
      cvv: newCardData.cvv,
      enable_autopay: newCardData.enableAutopay,
      is_primary: newCardData.isPrimary,
    };
    
    const resp = await submitBillingCard(apiPayload);
    let serverId = `card-${Date.now()}`;
    if (resp && resp.data && resp.data.id) {
      serverId = String(resp.data.id);
    }
    
    const newCard: Card = {
      ...newCardData,
      id: serverId,
    };

    let updatedCards = [...cards];
    if (newCard.isPrimary) {
      updatedCards = updatedCards.map((c) => ({ ...c, isPrimary: false }));
    }

    updatedCards.push(newCard);
    set({ cards: updatedCards });
    await storageAPI.setItem(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  },

  removeCard: async (id) => {
    const { cards } = get();        
    
    if (!id.startsWith("card-")) {
      try {
        await deleteBillingCard(id);
      } catch (err) {
        console.warn("Failed to delete billing card from server:", err);
      }
    }
    
    const updatedCards = cards.filter((c) => c.id !== id);
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
    
    if (!id.startsWith("card-")) {
      const [month, year] = updatedCardData.expiryDate.split("/");
      const expiryMonthVal = month ? month.trim() : "";
      let expiryYearVal = year ? year.trim() : "";
      if (expiryYearVal.length === 2) {
        expiryYearVal = `20${expiryYearVal}`;
      }

      const apiPayload = {
        card_holder_name: updatedCardData.cardHolder,
        card_number: updatedCardData.cardNumber.replace(/\s/g, ""),
        expiry_month: expiryMonthVal,
        expiry_year: expiryYearVal,
        cvv: updatedCardData.cvv,
        enable_autopay: updatedCardData.enableAutopay,
        is_primary: updatedCardData.isPrimary,
      };
      await updateBillingCard(id, apiPayload);
    }
    
    let updatedCards = cards.map((c) =>
      c.id === id ? { ...updatedCardData, id } : c
    );

    if (updatedCardData.isPrimary) {
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
