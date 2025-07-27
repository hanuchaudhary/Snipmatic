"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: "Why is Pro only $5/month?",
      answer:
        "Our infrastructure costs ~$2.80 per user monthly. The remaining $2.20 covers development, support, and new features.",
    },
    {
      question: "How much do you save vs alternatives?",
      answer:
        "Hiring a video editor costs $50-100/hour. Even creating just 2 clips manually would cost more than a year of Pro.",
    },
    {
      question: "What about server processing costs?",
      answer:
        "We use AWS GPU instances for fast processing. This ensures your clips are ready in seconds, not hours.",
    },
    {
      question: "Can I downgrade anytime?",
      answer:
        "Yes! You can downgrade to the free plan anytime. You'll keep pro features until your current billing period ends.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
    },
    {
      question: "How do you keep costs so low?",
      answer:
        "Efficient cloud architecture, automated processing, and economies of scale help us offer enterprise-quality service affordably.",
    },
  ];

  return (
    <div className="bg-muted/50 rounded-3xl p-8 backdrop-blur-sm">
      <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Frequently Asked Questions
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {faqData.map((faq, index) => (
          <div
            onClick={() => toggleItem(index)}
            key={index}
            className="cursor-pointer"
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 cursor-pointer">
              <CardContent className="p-0 cursor-pointer">
                <button className="w-full px-6 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base pr-4 leading-relaxed">
                      {faq.question}
                    </h4>
                    <motion.div
                      animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="h-px bg-border mb-4" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full text-sm text-muted-foreground">
          <span>Still have questions?</span>
          <span className="text-primary font-medium cursor-pointer">
            Contact our support team →
          </span>
        </div>
      </div>
    </div>
  );
}
