"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Header } from "~/app/_components/header";
import { Footer } from "~/app/_components/footer";

export default function OrderConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type"); // "ticket" or "merch"
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const ticketOrder = api.order.getByPaymentIntent.useQuery(
    { paymentIntentId: paymentIntentId! },
    {
      enabled: type === "ticket" && !!paymentIntentId,
      refetchInterval: (query) => (query.state.data ? false : 2000),
    },
  );

  const merchOrder = api.merch.getMerchOrderByPaymentIntent.useQuery(
    { paymentIntentId: paymentIntentId! },
    {
      enabled: type === "merch" && !!paymentIntentId,
      refetchInterval: (query) => (query.state.data ? false : 2000),
    },
  );

  // Redirect to order detail page once the order is found
  useEffect(() => {
    if (type === "ticket" && ticketOrder.data) {
      router.replace(`/orders/${ticketOrder.data.order.id}`);
    }
    if (type === "merch" && merchOrder.data) {
      router.replace(`/orders/merch/${merchOrder.data.merch_order.id}`);
    }
  }, [type, ticketOrder.data, merchOrder.data, router]);

  if (!paymentIntentId || !type) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-40 text-center">
          <p className="font-body text-cream-200/50">Invalid confirmation link.</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (redirectStatus === "failed") {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-40 text-center">
          <div className="max-w-lg mx-auto">
            <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4">
              <p className="font-body text-red-400 font-semibold text-sm">
                Payment failed
              </p>
              <p className="font-body text-red-400/70 text-sm mt-1">
                Your payment could not be processed. Please try again.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-40 text-center">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4">
            <p className="font-body text-green-400 font-semibold text-sm">
              Payment successful
            </p>
            <p className="font-body text-green-400/70 text-sm mt-1">
              Confirming your order, please wait...
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
