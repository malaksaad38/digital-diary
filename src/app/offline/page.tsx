"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        setIsOnline(navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsOnline(navigator.onLine);
        if (navigator.onLine) {
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                        <WifiOff className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl">You're Offline</CardTitle>
                    <CardDescription className="text-base mt-2">
                        {isOnline
                            ? "Connection restored! You can now reload the page."
                            : "No internet connection. Some features may be limited."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/*<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">*/}
                    {/*    <p className="text-sm text-green-800 dark:text-green-200">*/}
                    {/*        <strong>Good news!</strong> You can still:*/}
                    {/*    </p>*/}
                    {/*    <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1 text-left">*/}
                    {/*        <li>• View cached prayers and reflections</li>*/}
                    {/*        <li>• Add new prayer entries (will sync later)</li>*/}
                    {/*        <li>• Access prayer times</li>*/}
                    {/*    </ul>*/}
                    {/*</div>*/}

                    <Button
                        onClick={handleRetry}
                        disabled={!isOnline}
                        className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white"
                    >
                        {/*<RefreshCw className={`w-4 h-4 mr-2 ${!isOnline ? 'animate-spin' : ''}`} />*/}
                        <RefreshCw className={`w-4 h-4 mr-2 `} />
                        {/*{isOnline ? 'Reload Page' : 'Waiting for Connection...'}*/}
                        Refresh
                    </Button>

                    <div className="text-xs text-muted-foreground">
                        Your data will automatically sync when you're back online
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}