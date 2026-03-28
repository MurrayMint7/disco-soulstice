"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

export default function MerchCheckoutPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const sizeId = Number(searchParams.get("size"));
  const quantity = Math.max(1, Number(searchParams.get("qty")) || 1);

  const { data: item, isLoading } = api.merch.getBySlug.useQuery({
    slug: params.slug,
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createCheckout = api.merch.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
  });

  const selectedSize = item?.sizes.find((s) => s.id === sizeId);

  // Auto-create checkout session once item data loads
  useEffect(() => {
    if (item && selectedSize && !clientSecret && !createCheckout.isPending) {
      createCheckout.mutate({
        merchItemId: item.id,
        merchSizeId: selectedSize.id,
        quantity,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, selectedSize?.id]);

  if (isLoading || (!clientSecret && !createCheckout.error)) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-40 text-center">
          <p className="font-body text-cream-200/50">Loading...</p>
        </div>
      </main>
    );
  }

  if (!item || item.status !== "available" || !selectedSize) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-40 text-center">
          <p className="font-body text-cream-200/50">
            This item is not available for purchase.
          </p>
        </div>
      </main>
    );
  }

  if (createCheckout.error) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-40 text-center">
          <p className="font-body text-red-400 text-sm">
            {createCheckout.error.message}
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  const totalPence = item.priceInPence * quantity;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Complete Payment
          </h1>
          <p className="font-body text-cream-200/50 text-sm mb-8">
            {quantity} x {item.title} ({selectedSize.size}) — £
            {(totalPence / 100).toFixed(2)}
          </p>
          {clientSecret && (
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
          )}
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
        return_url: `${env.NEXT_PUBLIC_APP_URL}/orders/confirm?type=merch`,
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
