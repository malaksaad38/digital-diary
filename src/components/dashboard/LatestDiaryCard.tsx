"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {ArrowRight, Calendar, ChevronRight, Loader2, Plus} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCombinedHistory } from "@/hooks/use-prayer-queries";
import PrayerLog from "@/components/diary/PrayerLog";
import DiaryLog from "@/components/diary/DiaryLog";
import {motion} from "framer-motion";

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
            <div className="text-center py-8 text-muted-foreground">
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
                        Loading data...
                    </motion.p>
                </motion.div>
            </div>
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
 const onTime = latestEntry.prayer.fajr === "on time" && latestEntry.prayer.zuhr === "on time" &&
     latestEntry.prayer.asar === "on time" && latestEntry.prayer.maghrib === "on time" &&
     latestEntry.prayer.esha === "on time"
    /* ---------------- Latest Entry ---------------- */
    return (
        <Card className={`border shadow-sm bg-card gap-0 ${ onTime ? "border-green-500 bg-green-300/10" : ""}`}>
            {/*<div>*/}
            {/*    {onTime &&*/}
            {/*        <div className="flex justify-start px-4 pb-4">*/}
            {/*            <div className="relative flex justify-center items-center gap-2 text-foreground px-3 py-1  rounded-full  shadow-lg shadow-green-300/50 text-xs md:text-sm">*/}
            {/*                <span className={"w-2 h-2 rounded-full bg-green-500 animate-ping"}></span>*/}
            {/*                <span className={"absolute left-3 w-2 h-2 rounded-full bg-green-500 animate-pulse"}></span>*/}
            {/*                <span>Excellent</span>*/}
            {/*            </div>*/}
            {/*        </div>}*/}
            {/*</div>*/}
            <CardHeader className="pb-3 px-3 md:px-6">
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
