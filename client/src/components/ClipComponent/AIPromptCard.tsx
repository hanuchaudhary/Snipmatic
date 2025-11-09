"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { IconRainbow, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import Image from "next/image";

interface AIPromptCardProps {
    onPromptSubmit: (prompt: string) => void;
    disabled?: boolean;
}

export function AIPromptCard({ onPromptSubmit, disabled }: AIPromptCardProps) {
    const [active, setActive] = useState(false);
    const [prompt, setPrompt] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(false);
            }
        }

        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(false));

    const handleSubmit = () => {
        onPromptSubmit(prompt);
        setActive(false);
    };

    const handleClear = () => {
        setPrompt("");
        onPromptSubmit("");
        setActive(false);
    };

    return (
        <>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm h-full w-full z-[100]"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {active ? (
                    <div className="fixed inset-0 grid place-items-center z-[101] p-4">
                        <motion.div
                            layoutId={`ai-prompt-card-${id}`}
                            ref={ref}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-[500px] bg-background dark:bg-neutral-900 rounded-3xl overflow-hidden border shadow-2xl"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Image
                                                src="/gemini.svg"
                                                alt="Gemini"
                                                className="invert"
                                                width={24}
                                                height={24}
                                            />
                                            AI Clip Prompt
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActive(false)}
                                        className="rounded-full p-1 hover:bg-muted transition-colors"
                                    >
                                        <IconX className="size-5" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <Textarea
                                        id="ai-prompt"
                                        placeholder="E.g., 'Find the most exciting moments' or 'Extract educational segments' or leave empty for automatic detection"
                                        value={prompt}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                                        className="min-h-[120px] resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty to let AI automatically detect the best clips
                                    </p>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSubmit}
                                    >
                                        Apply Prompt
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>

            <motion.button
                type="button"
                layoutId={`ai-prompt-card-${id}`}
                onClick={() => setActive(true)}
                disabled={disabled}
                className="size-7 rounded-full border bg-primary text-primary-foreground transition-colors flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Image src={"/gemini.svg"} height={20} width={20} alt="Gemini" className="" />
            </motion.button>
        </>
    );
}
