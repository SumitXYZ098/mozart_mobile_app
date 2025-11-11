import { useTicketStore } from "@/stores/ticketStore";
import { useEffect } from "react";

export const useTicketRaised = () => {
  const { tickets, fetchTickets, loading, error } = useTicketStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, fetchTickets, loading, error };
};

export const useTicketById = (ticketId: string) => {
  const { selectedTicket, selectLoading, error, fetchTicketById } =
    useTicketStore();

  useEffect(() => {
    if (ticketId && ticketId !== "") {
      fetchTicketById(Number(ticketId));
    }
  }, [fetchTicketById, ticketId]);

  return { selectedTicket, selectLoading, error };
};
