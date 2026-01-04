"use client";

import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Calendar, ChevronRight, Plus} from "lucide-react";
import {useRouter} from "next/navigation";
import {useCombinedHistory} from "@/hooks/use-prayer-queries";
import PrayerLog from "@/components/diary/PrayerLog";
import DiaryLog from "@/components/diary/DiaryLog";
import {LoadingState} from "@/components/LoadingStates";

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
            <LoadingState label={"Loading data..."}/>
        );
    }

    /* ---------------- Empty ---------------- */
    if (!latestEntry) {
        return (
            <Card className="text-center gap-0">
                <CardContent className=" space-y-4">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/60"/>
                    <p className="text-sm text-muted-foreground">
                        No entries yet. Start your journey today.
                    </p>
                    <Button onClick={handleAddNew}>
                        <Plus className="h-4 w-4 mr-1"/>
                        Add First Entry
                    </Button>
                </CardContent>
            </Card>
        );
    }
    const onTime = latestEntry.prayer.fajr === "on time" && latestEntry.prayer.zuhr === "on time" &&
        latestEntry.prayer.asar === "on time" && latestEntry.prayer.maghrib === "on time" &&
        latestEntry.prayer.esha === "on time"

    const jamaat = (latestEntry.prayer.fajr === "on time" || latestEntry.prayer.fajr === "jamaat") && (latestEntry.prayer.zuhr === "on time" || latestEntry.prayer.zuhr === "jamaat") &&
        (latestEntry.prayer.asar === "on time" || latestEntry.prayer.asar === "jamaat") && (latestEntry.prayer.maghrib === "on time" || latestEntry.prayer.maghrib === "jamaat") &&
        (latestEntry.prayer.esha === "on time" || latestEntry.prayer.esha === "jamaat")
    /* ---------------- Latest Entry ---------------- */
    return (
        <Card
            className={`border shadow-sm bg-card gap-0 ${onTime && "border-sky-500 bg-sky-300/10" || jamaat && "border-green-500 bg-green-300/10"}`}>
            {/*<div>*/}
            {/*    {onTime &&*/}
            {/*        <div className="flex justify-start px-4 pb-4">*/}
            {/*            <div*/}
            {/*                className="relative flex justify-center items-center gap-2 text-sky-950 px-3 py-1 bg-sky-300 rounded-full  shadow-lg shadow-sky-300/50 text-xs md:text-sm">*/}
            {/*                <span className={"w-2 h-2 rounded-full bg-sky-500 animate-ping"}></span>*/}
            {/*                <span className={"absolute left-3 w-2 h-2 rounded-full bg-sky-500 animate-pulse"}></span>*/}
            {/*                <span>Excellent</span>*/}
            {/*            </div>*/}
            {/*        </div> || jamaat &&*/}
            {/*        <div className="flex justify-start px-4 pb-4">*/}
            {/*            <div className="relative flex justify-center items-center gap-2 text-green-950 bg-green-300 px-3 py-1  rounded-full  shadow-lg shadow-green-300/50 text-xs md:text-sm">*/}
            {/*                <span className={"w-2 h-2 rounded-full bg-green-500 animate-ping"}></span>*/}
            {/*                <span className={"absolute left-3 w-2 h-2 rounded-full bg-green-500 animate-pulse"}></span>*/}
            {/*                <span>Good</span>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    }*/}
            {/*</div>*/}
            <CardHeader className="pb-3 px-3 md:px-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-70"/>
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
                        View All <ChevronRight className="w-3 h-3"/>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0 px-3 md:px-6">
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
