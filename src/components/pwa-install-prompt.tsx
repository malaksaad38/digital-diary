"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running as PWA
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        // Check if iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(ios);

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        const dismissedDate = dismissed ? new Date(dismissed) : null;
        const daysSinceDismissed = dismissedDate
            ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
            : 999;

        // Show prompt if not dismissed recently (wait 7 days)
        if (!standalone && daysSinceDismissed > 7) {
            if (ios) {
                // For iOS, show custom prompt after a delay
                const timer = setTimeout(() => setShowPrompt(true), 3000);
                return () => clearTimeout(timer);
            }
        }

        // Listen for beforeinstallprompt event (Android/Desktop)
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after user has been on site for a bit
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    };

    // Don't show if already installed or dismissed
    if (isStandalone || !showPrompt) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
                >
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-2 border-green-200 dark:border-green-800 shadow-2xl">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-xl">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2 text-foreground">
                                    Install Digital Diary
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {isIOS
                                        ? "Install our app for a better experience. Tap the share button and select 'Add to Home Screen'"
                                        : "Install our app for quick access, offline support, and prayer notifications"}
                                </p>

                                {!isIOS && deferredPrompt && (
                                    <Button
                                        onClick={handleInstall}
                                        className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Install App
                                    </Button>
                                )}

                                {isIOS && (
                                    <div className="flex flex-col gap-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                                                </svg>
                                            </div>
                                            <span>Tap the share icon</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                                </svg>
                                            </div>
                                            <span>Select "Add to Home Screen"</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}