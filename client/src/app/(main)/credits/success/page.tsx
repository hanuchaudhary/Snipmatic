"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function CreditPurchaseSuccess() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get('/api/credits');
          setCredits(response.data.credits);
        } catch (error) {
          console.error('Failed to fetch credits:', error);
        }
      }
      setLoading(false);
    };

    fetchCredits();
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50/30 to-orange-100/20 dark:from-orange-950/10 dark:to-orange-900/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.6 }}
              className="flex justify-center mb-4"
            >
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl text-green-700 dark:text-green-300 mb-2">
              Payment Successful!
            </CardTitle>
            <p className="text-muted-foreground">
              Your credits have been added to your account
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex items-center justify-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
            >
              <Coins className="h-6 w-6 text-orange-500" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Current Balance</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {loading ? "..." : credits?.toLocaleString() || "0"} credits
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="space-y-3"
            >
              <Button asChild className="w-full" size="lg">
                <Link href="/clip" className="flex items-center gap-2">
                  Start Creating Clips
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/credits">
                  Buy More Credits
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="text-center text-sm text-muted-foreground"
            >
              <p>Need help? <Link href="mailto:support@snipmatic.com" className="text-orange-500 hover:underline">Contact Support</Link></p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
