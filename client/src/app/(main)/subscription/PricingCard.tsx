import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";
import { SubscriptionDialog } from "./SubscribeButton";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  highlightLabel?: string;
  buttonVariant?: "default" | "outline";
}

export function PricingCard({
  title,
  price,
  description,
  features,
  highlight = false,
  buttonVariant = "outline",
}: PricingCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-6 space-y-4 ${
        highlight
          ? "bg-secondary rounded-xl w-full md:w-1/2 space-y-8"
          : "flex-1"
      }`}
    >
      <div className={highlight ? "grid gap-6 sm:grid-cols-2" : ""}>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium">{title}</h2>
            <span className="my-3 block text-2xl font-semibold">{price}</span>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>

          {title === "Snipper" ? (
            <SubscriptionDialog />
          ) : (
            <Button asChild className="w-inline-block" variant={buttonVariant}>
              Start Snipping
            </Button>
          )}
        </div>
      </div>

      {highlight && (
        <div>
          <div className="text-sm font-medium">Everything in Free, plus:</div>
        </div>
      )}

      <ul
        className={`${
          highlight ? "mt-4" : "border-t pt-4"
        } list-outside space-y-3 text-sm`}
      >
        {features.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="size-3" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
