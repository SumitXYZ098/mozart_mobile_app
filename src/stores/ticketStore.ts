/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import {
  getTicketRaised,
  getTicketRaisedById,
  transformTicket,
  type Ticket,
} from "../api/issuesRaised";

interface TicketStore {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  selectLoading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  fetchTicketById: (ticketId: number) => Promise<void>;
}

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  selectedTicket: null,
  loading: false,
  selectLoading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getTicketRaised();
      const transformed: Ticket[] = (res?.results || []).map(transformTicket);

      transformed.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({ tickets: transformed, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchTicketById: async (ticketId: number) => {
    set({ selectLoading: true, error: null });
    try {
      const res = await getTicketRaisedById(ticketId);
      const transformed: Ticket = transformTicket(res);
      set({ selectedTicket: transformed, selectLoading: false });
    } catch (err: any) {
      set({ error: err.message, selectLoading: false });
    }
  },
}));
