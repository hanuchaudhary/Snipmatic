import React from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import PricingSection from "@/components/pricing-section";
import { Button } from "@/components/ui/button";
import { PaymentApi } from "@/lib/api/payment";

export function PricingPage() {
  return <PricingSection />;
}

export function PricingSuccessPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    PaymentApi.getCredits()
      .then(() => {
        toast.success("Subscription updated. Credits are ready.");
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        toast.success("Subscription updated.");
        navigate("/dashboard", { replace: true });
      });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-medium">Processing your subscription...</h1>
        <Button className="mt-6" asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export function PricingCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-medium">Checkout cancelled</h1>
        <p className="mt-2 text-white/60">You can choose a plan anytime.</p>
        <Button className="mt-6" asChild>
          <Link to="/pricing">Back to pricing</Link>
        </Button>
      </div>
    </div>
  );
}
