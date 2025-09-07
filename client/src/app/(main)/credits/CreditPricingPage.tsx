"use client";

import { CreditPricingSlider } from "@/components/ui/pricing-slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "How do credits work?",
    answer:
      "Credits are deducted when you create clips. AI clips cost 10 credits, manual clips cost 5 credits, with additional costs for extras like multiple clips or subtitles.",
  },
  {
    question: "Do credits expire?",
    answer:
      "No! Your credits never expire. Use them whenever you want to create clips.",
  },
  {
    question: "Can I buy more credits?",
    answer:
      "Yes! You can purchase additional credits at any time. Credits stack so you can buy multiple packages.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards through our secure payment processor.",
  },
];

export function CreditPricingPage() {
  return (
    <div className="min-h-screen p-4 pt-24 font-jost">
      <div className="max-w-7xl mx-auto">
        <CreditPricingSlider />
        <div className="mt-16 bg-muted/30 rounded-3xl md:p-8 p-4 backdrop-blur-sm">
          <h3 className="text-3xl font-bold mb-14 text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h3>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
