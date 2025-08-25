"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

function CreditPurchaseStatusContent() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useSearchParams();
  const isPaymentSuccessful = params.get("status") === "succeeded";
  const paymentId = params.get("payment_id");

  useEffect(() => {
    if (isPaymentSuccessful && paymentId) {
      const end = Date.now() + 3 * 1000;
      const colors = [
        "#ffb347", // orange shade
        "#ffa500", // orange shade
        "#ff8c00", // orange shade
        "#ff7043", // orange shade
      ];

      const frame = () => {
        if (Date.now() > end) return;

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
        });

        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isPaymentSuccessful, paymentId]);

  useEffect(() => {
    const fetchCredits = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get("/api/credits");
          setCredits(response.data.credits);
        } catch (error) {
          console.error("Failed to fetch credits:", error);
        }
      }
      setLoading(false);
    };

    fetchCredits();
  }, [session]);

  return (
    <div
      className={`min-h-screen font-mono flex items-center justify-center p-4 ${
        isPaymentSuccessful
          ? "bg-gradient-to-br from-green-50/30 to-green-100/20 dark:from-green-950/10 dark:to-green-900/5"
          : "bg-gradient-to-br from-orange-50/30 to-orange-100/20 dark:from-orange-950/10 dark:to-orange-900/5"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl p-2 border rounded-[40px] bg-secondary/20 backdrop-blur-sm"
      >
        <Card className="border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle
              className={`text-2xl mb-2 ${
                isPaymentSuccessful
                  ? "text-green-700 dark:text-green-300"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              {isPaymentSuccessful ? "Payment Successful!" : "Payment Failed!"}
            </CardTitle>
            {
              <p className="text-muted-foreground">
                {isPaymentSuccessful
                  ? "Your credits have been added to your account"
                  : "There was an issue processing your payment"}
              </p>
            }
          </CardHeader>

          <CardContent className="space-y-6 border-border/10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex items-center justify-center gap-3 p-4"
            >
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Current Balance
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {loading ? "..." : credits?.toLocaleString() || "0"} credits
                </div>
              </div>
            </motion.div>

            <motion.div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/clip" className="flex items-center gap-2">
                  Start Creating Clips
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {isPaymentSuccessful ? (
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/credits">Buy More Credits</Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/credits">Try Again</Link>
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="text-center text-sm text-muted-foreground"
            >
              <p>
                Need help?{" "}
                <Link
                  href="mailto:support@snipmatic.com"
                  className="text-orange-500 hover:underline"
                >
                  Contact Support
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatusLoading() {
  return (
    <div className="min-h-screen font-mono flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl p-2 border rounded-[40px] bg-secondary/20 backdrop-blur-sm"
      >
        <Card className="border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl mb-2">Loading...</CardTitle>
            <p className="text-muted-foreground">
              Checking payment status
            </p>
          </CardHeader>
          <CardContent className="space-y-6 border-border/10">
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CreditPurchaseStatus() {
  return (
    <Suspense fallback={<StatusLoading />}>
      <CreditPurchaseStatusContent />
    </Suspense>
  );
}
