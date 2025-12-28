"use client";

import { useServiceWorker } from "@/hooks/use-service-worker";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAStatus() {
    const { isOnline, needsUpdate, updateServiceWorker } = useServiceWorker();

    return (
        <>
            {/* Offline Indicator */}
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-2 px-4 text-center text-sm font-medium"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <WifiOff className="w-4 h-4" />
                            <span>You're offline. Changes will sync when reconnected.</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Update Available Banner */}
            <AnimatePresence>
                {needsUpdate && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white py-3 px-4 shadow-lg"
                    >
                        <div className="max-w-6xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wifi className="w-5 h-5" />
                                <span className="font-medium">
                  A new version is available!
                </span>
                            </div>
                            <Button
                                onClick={updateServiceWorker}
                                size="sm"
                                variant="secondary"
                                className="bg-white text-green-600 hover:bg-gray-100"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Update Now
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}