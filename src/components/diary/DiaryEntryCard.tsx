// components/diary/DiaryEntryCard.tsx
// Wrapped in React.memo — only re-renders when the entry data actually changes
"use client";

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import PrayerLog from "./PrayerLog";
import DiaryLog from "./DiaryLog";

interface DiaryEntryCardProps {
    entry: any;
    onEditPrayer: (date: string) => void;
    onAddPrayer: (date: string) => void;
    onDeletePrayer: (id: string) => void;
    onEditDiary: (date: string) => void;
    onAddDiary: (date: string) => void;
    onDeleteDiary: (id: string) => void;
}

function getPrayerStatus(prayer: any): "excellent" | "good" | null {
    if (!prayer) return null;
    const onTime = (p: string) => p === "on time";
    const acceptable = (p: string) => p === "on time" || p === "jamaat";
    if (
        onTime(prayer.fajr) && onTime(prayer.zuhr) &&
        onTime(prayer.asar) && onTime(prayer.maghrib) && onTime(prayer.esha)
    ) return "excellent";
    if (
        acceptable(prayer.fajr) && acceptable(prayer.zuhr) &&
        acceptable(prayer.asar) && acceptable(prayer.maghrib) && acceptable(prayer.esha)
    ) return "good";
    return null;
}

function getCardBorderClass(prayer: any): string {
    const status = getPrayerStatus(prayer);
    if (status === "excellent") return "border-sky-500";
    if (status === "good") return "border-green-500";
    return "";
}

// Memoized individual diary entry card — skips re-render if props haven't changed
const DiaryEntryCard = memo(function DiaryEntryCard({
    entry,
    onEditPrayer,
    onAddPrayer,
    onDeletePrayer,
    onEditDiary,
    onAddDiary,
    onDeleteDiary,
}: DiaryEntryCardProps) {
    // Memoize date formatting — avoids re-computing on every parent re-render
    const formattedDate = useMemo(() =>
        new Date(entry.date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        }),
        [entry.date]
    );

    const prayerStatus = useMemo(() => getPrayerStatus(entry.prayer), [entry.prayer]);
    const borderClass = useMemo(() => getCardBorderClass(entry.prayer), [entry.prayer]);

    return (
        <Card className={`relative gap-2 border shadow-sm bg-card ${borderClass}`}>
            <div className="absolute right-3 md:right-7 z-10">
                {prayerStatus === "excellent" && (
                    <div className="flex justify-end z-10">
                        <div className="relative flex justify-center items-center gap-2 text-sky-950 px-3 py-1 bg-sky-300 rounded-full shadow-lg shadow-sky-300/50 text-xs md:text-sm">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                            <span className="absolute left-3 w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            <span>Excellent</span>
                        </div>
                    </div>
                )}
                {prayerStatus === "good" && (
                    <div className="flex justify-end">
                        <div className="relative flex justify-center items-center gap-2 text-green-950 bg-green-300 px-3 py-1 rounded-full shadow-lg shadow-green-300/50 text-xs md:text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                            <span className="absolute left-3 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Good</span>
                        </div>
                    </div>
                )}
            </div>

            <CardHeader className="pb-3 sm:pb-4 px-3 md:px-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-70" />
                        <span>{formattedDate}</span>
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4 px-3 md:px-6">
                <PrayerLog
                    prayer={entry.prayer}
                    date={entry.date}
                    onEdit={onEditPrayer}
                    onAdd={onAddPrayer}
                    onDelete={onDeletePrayer}
                />
                <DiaryLog
                    key={entry.date}
                    diary={entry.diary}
                    date={entry.date}
                    onEdit={onEditDiary}
                    onAdd={onAddDiary}
                    onDelete={onDeleteDiary}
                />
            </CardContent>
        </Card>
    );
});

export default DiaryEntryCard;
