"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PlusIcon from "./PlusIcon";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const items = [
    {
      question: "What video formats can I upload?",
      answer:
        "We support all major video formats including MP4, MOV, AVI, and WMV. You can also paste YouTube links directly.",
    },
    {
      question: "How long does the AI editing process take?",
      answer:
        "Most videos are processed within 5-15 minutes, depending on length and complexity. Pro users get priority processing for faster results.",
    },
    {
      question: "Can I upload directly to social media?",
      answer:
        "Yes! Our Pro and Business plans allow direct uploading to Instagram Reels, TikTok, and YouTube Shorts after you connect your accounts.",
    },
    {
      question: "Is my content secure?",
      answer:
        "Absolutely. We use bank-level encryption and secure cloud storage. Your videos are only accessible to you, and we never use your content for any other purposes.",
    },
    {
      question: "What video formats can I upload?",
      answer:
        "We support all major video formats including MP4, MOV, AVI, and WMV. You can also paste YouTube links directly.",
    },
    {
      question: "How long does the AI editing process take?",
      answer:
        "Most videos are processed within 5-15 minutes, depending on length and complexity. Pro users get priority processing for faster results.",
    },
    {
      question: "Can I upload directly to social media?",
      answer:
        "Yes! Our Pro and Business plans allow direct uploading to Instagram Reels, TikTok, and YouTube Shorts after you connect your accounts.",
    },
    {
      question: "Is my content secure?",
      answer:
        "Absolutely. We use bank-level encryption and secure cloud storage. Your videos are only accessible to you, and we never use your content for any other purposes.",
    },
  ];

  return (
    <section className="relative border-b transition-transform">
      <div className="absolute -top-4 -left-4">
        <PlusIcon />
      </div>
      <div className="absolute -bottom-4 -right-4">
        <PlusIcon />
      </div>
      <div className="md:grid grid-cols-3">
        <h2 className="col-span-1 text-xl md:text-2xl px-7 py-10 font-bold text-center border-r">
          Frequently asked questions.
        </h2>
        <div className="w-full col-span-2">
          {items.map((item, index) => (
            <div
              onClick={() => toggleItem(index)}
              key={index}
              className={`w-full md:p-7 p-5 cursor-pointer ${
                index !== items.length - 1 ? "border-b" : ""
              } overflow-hidden`}
            >
              <div className="flex items-center ">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp
                      className="w-5 h-5 cursor-pointer"
                      onClick={() => toggleItem(index)}
                    />
                  ) : (
                    <ChevronDown
                      className="w-5 h-5 cursor-pointer"
                      onClick={() => toggleItem(index)}
                    />
                  )}
                </div>
              </div>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="mt-5 text-muted-foreground">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
