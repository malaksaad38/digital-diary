import type {Metadata, Viewport} from 'next';
import './globals.css';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import {Toaster} from "sonner";
import QueryProvider from "@/providers/query-provider";
import {ThemeProvider} from "next-themes";
import {Geist, Geist_Mono} from "next/font/google";
import PWAStatus from "@/components/pwa-status";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: 'Digital Diary - Prayer Tracker & Spiritual Journal',
    description: 'Track prayers, write reflections, and analyze your spiritual progress with beautiful Islamic-themed digital diary',
    keywords: ['prayer tracker', 'salah', 'islamic app', 'spiritual journal', 'prayer times'],
    authors: [{name: 'Digital Diary Team'}],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Digital Diary',
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: [
            {url: '/icons/icon-192x192.png'},
            {url: '/icons/icon-512x512.png', sizes: '512x512'},
        ],
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        {media: '(prefers-color-scheme: light)', color: '#10b981'},
        {media: '(prefers-color-scheme: dark)', color: '#059669'},
    ],
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <meta name="apple-mobile-web-app-capable" content="yes"/>
            <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
            <meta name="apple-mobile-web-app-title" content="Digital Diary"/>
            <meta name="mobile-web-app-capable" content="yes"/>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <QueryProvider>
                <PWAStatus/>
                {children}
            </QueryProvider>
            <Toaster richColors position={"top-center"}/>
            <PWAInstallPrompt/>
        </ThemeProvider>
        </body>
        </html>
    );
}