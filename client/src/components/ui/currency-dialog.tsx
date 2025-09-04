"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Currency, calculatePackagePrice } from "@/lib/constants";

// Re-export Currency type for backward compatibility
export type { Currency } from "@/lib/constants";

interface CurrencyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  credits: number;
}

export function CurrencyDialog({
  isOpen,
  onClose,
  onSelect,
  credits,
}: CurrencyDialogProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePrice = (currency: Currency): number => {
    return calculatePackagePrice(credits, currency);
  };

  const currencies = [
    {
      code: "INR" as Currency,
      symbol: "₹",
      name: "Indian Rupee",
      price: calculatePrice("INR"),
    },
    {
      code: "USD" as Currency,
      symbol: "$",
      name: "US Dollar",
      price: calculatePrice("USD"),
    },
  ];

  const handleSelect = () => {
    onSelect(selectedCurrency);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const dialogContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex font-jost items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="max-w-lg w-full p-1 border-2 rounded-[28px]"
        >
          <div className="relative bg-white dark:bg-neutral-900 border rounded-3xl shadow-xl p-6 w-full  z-10">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Choose Your Payment Currency
            </h3>

            <div className="space-y-3 mb-6">
              {currencies.map((currency) => (
                <label
                  key={currency.code}
                  className="flex items-center justify-between cursor-pointer p-4 rounded-lg border transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="currency"
                      value={currency.code}
                      checked={selectedCurrency === currency.code}
                      onChange={() => setSelectedCurrency(currency.code)}
                      className="w-4 h-4 text-orange-500 border-neutral-300 focus:ring-orange-500"
                    />
                    <div className="flex space-x-2">
                      <span className="text-lg">{currency.symbol}</span>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {currency.code}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {currency.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-neutral-900 dark:text-white">
                      {currency.symbol}
                      {currency.price}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      for {credits.toLocaleString()} credits
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                className="flex-1 px-4 py-2 bg-orange-500 font-semibold hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(dialogContent, document.body);
}
