"use client";

import { useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CurrencyDialog, Currency } from "@/components/ui/currency-dialog";
import { CreditPackage } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type { CreditPackage } from "@/lib/constants";

interface PurchaseButtonProps {
  package: CreditPackage;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function PurchaseButton({
  package: pkg,
  className = "w-full px-6 py-3 rounded-lg font-semibold text-sm transition-colors bg-orange-500 cursor-pointer hover:bg-orange-600 text-white",
  children,
  disabled = false,
}: PurchaseButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handlePurchaseClick = () => {
    if (!session?.user) {
      toast.error("Please sign in to purchase credits.");
      return;
    }
    setShowCurrencyDialog(true);
  };

  const handleCurrencySelect = async (currency: Currency) => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`/api/razorpay/order`, {
        credits: pkg.credits,
        currency: currency,
      });

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      if (!response.data.success) {
        toast.error("Failed to create order. Please try again.");
        return;
      }

      await handleRazorpayPayment(response.data, pkg, session, currency);
    } catch (error: any) {
      console.error("Purchase error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "An error occurred while processing your purchase.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (
    orderData: any,
    pkg: CreditPackage,
    session: any,
    currency: Currency
  ) => {
    if (!window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh and try again.");
      return;
    }

    return new Promise((resolve) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: currency,
        name: "Snipmatic",
        image: "/icon.png",
        description: `${pkg.credits} Credits Package`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await axios.post(
              "/api/razorpay/order/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              toast.success(
                "Payment successful! Credits have been added to your account."
              );
              router.push("/credits/status?status=succeeded");
              resolve(true);
            } else {
              router.push("/credits/status?status=failed");
              toast.error(
                "Payment verification failed. Please contact support."
              );
              resolve(false);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
            resolve(false);
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        notes: {
          credits: pkg.credits.toString(),
          price: pkg.price.toString(),
          userId: session?.user?.id || "",
          userEmail: session?.user?.email || "",
        },
        config: {
          display: {
            blocks: {
              banks: {
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
          },
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            resolve(false);
            toast.error("Payment cancelled.");
          },
          animation: true,
          // backdropclose: true,
          // escape: true,
          // handleback: true,
          // confirm_close: true
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        router.push("/credits/status?status=failed");
        toast.error("Payment failed. Please try again.");
        resolve(false);
      });

      razorpay.open();
    });
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        className={`${className} ${
          disabled || isProcessing ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handlePurchaseClick}
        disabled={disabled || isProcessing}
      >
        {isProcessing ? "Processing..." : children || "Purchase Credits"}
      </button>

      <CurrencyDialog
        isOpen={showCurrencyDialog}
        onClose={() => setShowCurrencyDialog(false)}
        onSelect={handleCurrencySelect}
        credits={pkg.credits}
      />
    </>
  );
}
