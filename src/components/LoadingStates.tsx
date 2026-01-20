"use client";

import {motion} from "framer-motion";
import {Loader2} from "lucide-react";
import {Card} from "@/components/ui/card";
import { useEffect, useState } from "react";

// ============================================
// MAIN FALLBACK LOADING PAGE
// Use this as loading.tsx in your app directory
// ============================================

export default function FallbackLoading() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 animate-pulse" />

            {/* Main Loading Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative z-10 flex flex-col items-center gap-6"
            >
                {/* Spinner */}
                <div className="relative">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
                    />

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        <Loader2 size={48} className="text-primary" strokeWidth={2.5} />
                    </motion.div>
                </div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="flex flex-col items-center gap-2"
                >
                    <p className="text-lg font-semibold text-foreground">Loading</p>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-sm text-muted-foreground"
                    >
                        Please wait...
                    </motion.div>
                </motion.div>

                {/* Dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            className="w-2 h-2 rounded-full bg-primary"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// MOBILE-OPTIMIZED FALLBACK (iPhone Style)
// ============================================

export function LoadingState({label}: any) {
    return (
        <Card>
            <motion.div
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.3, ease: [0.25, 0.1, 0.25, 1]}}
                className="flex flex-col items-center gap-4 p-8"
            >
                {/* iPhone-style minimal spinner */}
                <div className="relative w-16 h-16">
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                        className="absolute inset-0"
                    >
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 50 50"
                        >
                            <circle
                                className="stroke-primary/20"
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                strokeWidth="4"
                            />
                            <circle
                                className="stroke-primary"
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                strokeWidth="4"
                                strokeDasharray="80 40"
                                strokeLinecap="round"
                            />
                        </svg>
                    </motion.div>
                </div>

                <motion.p
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.2}}
                    className="text-sm font-medium text-muted-foreground"
                >
                    {label || "Loading..."}
                </motion.p>
            </motion.div>
        </Card>
    );
}
