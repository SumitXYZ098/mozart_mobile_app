import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  subscribeToPlan,
  createStripeSession,
  cancelSubscription,
  verifyPayment,
  priorityPayment,
  verifyPriorityPayment,
} from "@/api/subscriptionApi";
import { toast } from "@/stores/useToastStore";

/**
 * Hook to manage subscription plan activation/purchasing (original flow).
 */
export function useSubscribe() {
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (planName: string) => {
      if (!user || !user.token || !user.id) {
        throw new Error("You must be logged in to purchase a subscription.");
      }
      return subscribeToPlan(user.id, planName, user.token);
    },
    onSuccess: async (data, planName) => {
      if (user) {
        const updatedUser = {
          ...user,
          latest_subscription: data,
        };
        await setUser(updatedUser, true);
        toast.success(`Subscribed to ${planName} successfully!`);
      }
    },
    onError: (error: any) => {
      console.error("Subscription purchase error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to purchase plan.";
      toast.error(message);
    },
  });
}

/**
 * Hook to create a Stripe checkout session for a subscription plan.
 */
export function useCreateStripeSession() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (planName: string) => {
      if (!user || !user.token || !user.id) {
        throw new Error("You must be logged in to purchase a subscription.");
      }
      return createStripeSession(user.id, planName, user.token);
    },
    onError: (error: any) => {
      console.error("Create Stripe session error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create payment session.";
      toast.error(message);
    },
  });
}

/**
 * Hook to verify subscription payment.
 */
export function useVerifyPayment() {
  const { refreshUserProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { user } = useAuthStore.getState();
      if (!user || !user.token) {
        throw new Error("You must be logged in to verify a payment.");
      }
      return verifyPayment(sessionId, user.token);
    },
    onSuccess: async () => {
      await refreshUserProfile();
      toast.success("Payment verified! Subscription is now active.");
    },
    onError: (error: any) => {
      console.error("Verify payment error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to verify payment.";
      toast.error(message);
    },
  });
}

/**
 * Hook to cancel user subscription.
 */
export function useCancelSubscription() {
  const { refreshUserProfile } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { user } = useAuthStore.getState();
      if (!user || !user.token) {
        throw new Error("You must be logged in to cancel your subscription.");
      }
      return cancelSubscription(user.token);
    },
    onSuccess: async () => {
      await refreshUserProfile();
      toast.success("Subscription cancelled successfully.");
    },
    onError: (error: any) => {
      console.error("Cancel subscription error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to cancel subscription.";
      toast.error(message);
    },
  });
}

/**
 * Hook to create priority release/delivery payment session.
 */
export function usePriorityPayment() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (draftId: number) => {
      if (!user || !user.token) {
        throw new Error("You must be logged in to make a payment.");
      }
      return priorityPayment(draftId, user.token);
    },
    onError: (error: any) => {
      console.error("Priority payment checkout error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to initiate priority payment.";
      toast.error(message);
    },
  });
}

/**
 * Hook to verify priority release delivery payment.
 */
export function useVerifyPriorityPayment() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { user } = useAuthStore.getState();
      if (!user || !user.token) {
        throw new Error("You must be logged in to verify payment.");
      }
      return verifyPriorityPayment(sessionId, user.token);
    },
    onSuccess: () => {
      toast.success("Priority delivery payment verified successfully!");
    },
    onError: (error: any) => {
      console.error("Verify priority payment error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to verify priority payment.";
      toast.error(message);
    },
  });
}

