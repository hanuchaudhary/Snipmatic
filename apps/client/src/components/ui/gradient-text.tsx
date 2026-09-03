import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
    showBorder?: boolean;
}

export function GradientText({
    children,
    className = "",
    colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
    animationSpeed = 8,
    showBorder = false,
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        backgroundSize: "300% 100%",
    };

    const gradientAnimation = {
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    };

    return (
        <div
            className={`relative flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 md:overflow-hidden cursor-pointer ${className}`}
        >
            {showBorder && (
                <motion.div
                    className="absolute inset-0 bg-cover z-0 pointer-events-none"
                    style={gradientStyle}
                    animate={gradientAnimation}
                    transition={{
                        duration: animationSpeed,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <div
                        className="absolute inset-0 bg-black rounded-[1.25rem] z-[-1]"
                        style={{
                            width: "calc(100% - 2px)",
                            height: "calc(100% - 2px)",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    ></div>
                </motion.div>
            )}
            <motion.div
                className="inline-block relative z-2 text-transparent bg-cover"
                style={{
                    ...gradientStyle,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                }}
                animate={gradientAnimation}
                transition={{
                    duration: animationSpeed,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
