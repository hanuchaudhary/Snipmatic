import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    cta: "GET STARTED FREE",
    description: "Perfect for individuals getting started",
    featured: false,
    features: [
      "Access to 50+ Templates",
      "Basic AI Writer",
      "Limited Word Count",
      "Email Support",
      "Brand Voice Customization",
      "SEO Optimization Tools",
    ],
    name: "FREE",
    price: "$0",
  },
  {
    cta: "START 7-DAY FREE TRIAL",
    description: "Best for solo creators and marketers",
    featured: true,
    features: [
      "Everything in Free",
      "Unlimited Words",
      "Export to WordPress & Notion",
      "Long-Form Assistant",
      "Brand Voice Customization",
      "SEO Optimization Tools",
    ],
    name: "PRO",
    price: "$299",
  },
  {
    cta: "CONTACT SALES",
    description: "For the growing teams and businesses",
    featured: false,
    features: [
      "Everything in Pro",
      "5 User Seats",
      "Shared Workspaces",
      "Team Performance Analytics",
      "Priority Support",
      "SEO Optimization Tools",
    ],
    name: "ENTERPRISE",
    price: "Contact us",
  },
];

export default function PricingSection() {
  return (
    <div className="min-h-screen bg-black px-4 text-white">
      <div className="mx-auto max-w-5xl border-neutral-700 border-x py-20">
        <div className="mb-10 grid grid-cols-1 items-center gap-6 px-4 md:grid-cols-12 md:px-10">
          <div className="md:col-span-8">
            <p className="mb-4 w-fit rounded-full border border-neutral-700 px-2 py-0.5 text-red-400 text-xs tracking-wide">
              SIMPLE, SCALABLE PRICING
            </p>
            <h1 className="font-normal text-3xl tracking-tight md:text-5xl">
              Plans that fit your{" "}
              <span className="text-gray-500">writing needs</span>
            </h1>
          </div>
          <div className="md:col-span-4 md:mt-auto">
            <p className="text-gray-500">
              <span className="text-white">Simple pricing</span> with powerful
              tools to help you write faster
            </p>
          </div>
        </div>

        <div className="mb-8 grid md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              className={`relative flex h-full flex-col ${
                tier.featured ? "" : ""
              }`}
              key={tier.name}
            >
              <div
                className={`relative flex h-full flex-col ${
                  tier.featured
                    ? "border-2 border-red-500 bg-neutral-900"
                    : "border border-neutral-700 bg-black md:border-x-0 md:border-y"
                }`}
              >
                <div className="relative mb-6 border-neutral-700 border-b p-6">
                  <h3
                    className={`mb-2 font-medium text-xl ${
                      tier.featured ? "text-red-500" : "text-white"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{tier.description}</p>
                  {!tier.featured && (
                    <div className="absolute inset-0 z-10 flex flex-col justify-between">
                      <div className="absolute -top-0.5 -left-0.5">
                        <div className="size-1.5 border-neutral-400 border-t-2 border-l-2" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5">
                        <div className="size-1.5 border-neutral-400 border-t-2 border-r-2" />
                      </div>
                      <div className="absolute -right-0.5 -bottom-0.5">
                        <div className="size-1.5 border-neutral-400 border-r-2 border-b-2" />
                      </div>
                      <div className="absolute -bottom-0.5 -left-0.5">
                        <div className="size-1.5 border-neutral-400 border-b-2 border-l-2" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-6 px-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-4xl text-white">
                      {tier.price}
                    </span>
                    {tier.price !== "Contact us" && (
                      <span className="text-gray-400">/month</span>
                    )}
                  </div>
                </div>

                <div className="mb-8 flex-1 px-6">
                  <p className="mb-4 font-bold text-gray-300 text-xs tracking-wide">
                    WHAT&apos;S INCLUDED:
                  </p>
                  <ul className="mb-6 space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li className="flex items-start gap-3" key={idx}>
                        {tier.featured ? (
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                        ) : (
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                        )}
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full gap-2 rounded-sm py-2 ${
                      tier.featured
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                {!tier.featured && (
                  <div className="absolute inset-0 z-10 flex flex-col justify-between">
                    <div className="absolute -right-0.5 -bottom-0.5">
                      <div className="size-1.5 border-neutral-400 border-r-2 border-b-2" />
                    </div>
                    <div className="absolute -bottom-0.5 -left-0.5">
                      <div className="size-1.5 border-neutral-400 border-b-2 border-l-2" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
