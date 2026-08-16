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
        toast.success("Subscription updated.");
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        navigate("/dashboard", { replace: true });
      });
  }, [navigate]);

  return (
    <div className="flex w-full items-center justify-center px-8 py-24">
      <div className="text-center">
        <h2 className="md:text-2xl">Processing subscription</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting to dashboard...
        </p>
        <Button className="mt-6 rounded-full" asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export function PricingCancelPage() {
  return (
    <div className="flex w-full items-center justify-center px-8 py-24">
      <div className="text-center">
        <h2 className="md:text-2xl">Checkout cancelled</h2>
        <Button className="mt-6 rounded-full" asChild>
          <Link to="/pricing">Back to pricing</Link>
        </Button>
      </div>
    </div>
  );
}
