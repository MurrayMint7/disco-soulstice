"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { api } from "~/trpc/react";
import { env } from "~/env";
import { Header } from "~/app/_components/header";
import { Footer } from "~/app/_components/footer";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const params = useParams<{ eventSlug: string }>();
  const { data: event, isLoading } = api.event.getBySlug.useQuery({
    slug: params.eventSlug,
  });

  const [quantity, setQuantity] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createCheckout = api.order.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-40 text-center">
          <p className="font-body text-cream-200/50">Loading...</p>
        </div>
      </main>
    );
  }

  if (event?.status !== "on-sale" || !event?.priceInPence) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-40 text-center">
          <p className="font-body text-cream-200/50">
            This event is not available for purchase.
          </p>
        </div>
      </main>
    );
  }

  const remaining = event.totalTickets
    ? event.totalTickets - event.ticketsSold
    : 0;
  const maxQty = Math.min(event.maxPerOrder, remaining);
  const totalPence = event.priceInPence * quantity;

  if (clientSecret) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-16 px-4 sm:px-6">
          <div className="max-w-lg mx-auto">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Complete Payment
            </h1>
            <p className="font-body text-cream-200/50 text-sm mb-8">
              {quantity} ticket{quantity > 1 ? "s" : ""} for {event.title} —
              £{(totalPence / 100).toFixed(2)}
            </p>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#e8791a",
                  },
                },
              }}
            >
              <PaymentForm />
            </Elements>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Get Tickets
          </h1>
          <p className="font-body text-cream-200/50 text-sm mb-8">
            {event.title}
          </p>

          <div className="space-y-6">
            <div>
              <label className="font-body text-cream-200/80 text-sm block mb-2">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary"
              >
                {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-border/30">
              <span className="font-body text-cream-200/80 text-sm">
                {quantity} × £{(event.priceInPence / 100).toFixed(2)}
              </span>
              <span className="font-display text-xl font-bold text-foreground">
                £{(totalPence / 100).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() =>
                createCheckout.mutate({ eventId: event.id, quantity })
              }
              disabled={createCheckout.isPending}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {createCheckout.isPending ? "Processing..." : "Proceed to Pay"}
            </button>

            {createCheckout.error && (
              <p className="font-body text-red-400 text-sm">
                {createCheckout.error.message}
              </p>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${env.NEXT_PUBLIC_APP_URL}/orders/confirm?type=ticket`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn-primary w-full justify-center disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
      {error && <p className="font-body text-red-400 text-sm">{error}</p>}
    </form>
  );
}
