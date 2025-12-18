"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCombinedHistory } from "@/hooks/use-prayer-queries";
import PrayerLog from "@/components/diary/PrayerLog";
import DiaryLog from "@/components/diary/DiaryLog";

export default function LatestEntryCard() {
    const router = useRouter();

    const {
        data: combinedEntries = [],
        isLoading,
    } = useCombinedHistory();

    // Get latest entry (assuming entries are sorted by date desc)
    const latestEntry = React.useMemo(() => {
        if (!combinedEntries.length) return null;

        return [...combinedEntries].sort(
            (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
    }, [combinedEntries]);

    const handleEditPrayer = (date: string) => {
        router.push(`/dashboard/entry?date=${date}#edit`);
    };

    const handleAddDiary = (date: string) => {
        router.push(`/dashboard/entry?date=${date}#diary`);
    };

    const handleEditDiary = (date: string) => {
        router.push(`/dashboard/entry?date=${date}#diaryEdit`);
    };

    const handleAddNew = () => {
        router.push("/dashboard/entry");
    };

    /* ---------------- Loading ---------------- */
    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-4 justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p>Loading Data...</p>
                </CardContent>
            </Card>
        );
    }

    /* ---------------- Empty ---------------- */
    if (!latestEntry) {
        return (
            <Card className="text-center gap-0">
                <CardContent className=" space-y-4">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">
                        No entries yet. Start your journey today.
                    </p>
                    <Button onClick={handleAddNew}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Entry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    /* ---------------- Latest Entry ---------------- */
    return (
        <Card className="shadow-sm gap-0">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-70" />
                        {new Date(latestEntry.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </CardTitle>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/dashboard/diary")}
                    >
                        View All
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
                {/* Prayer */}
                <PrayerLog
                    prayer={latestEntry.prayer}
                    date={latestEntry.date}
                    onEdit={handleEditPrayer}
                />

                {/* Diary */}
                <DiaryLog
                    diary={latestEntry.diary}
                    date={latestEntry.date}
                    onEdit={handleEditDiary}
                    onAdd={handleAddDiary}
                />
            </CardContent>
        </Card>
    );
}
