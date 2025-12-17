"use client";

import {RefreshCw, WifiOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default function OfflinePage() {
    const handleRetry = () => {
        window.location.reload()
        if (navigator.onLine) {
            window.location.href = '/dashboard';
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div
                        className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                        <WifiOff className="w-10 h-10 text-white"/>
                    </div>
                    <CardTitle className="text-2xl">You're Offline</CardTitle>
                    <CardDescription className="text-base mt-2">

                        No internet connection. Some features may be limited.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    <Button
                        onClick={handleRetry}
                        className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 `}/>
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