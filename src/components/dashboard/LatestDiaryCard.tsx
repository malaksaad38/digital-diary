"use client";

import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Calendar, ChevronRight, Plus} from "lucide-react";
import {useRouter} from "next/navigation";
import {useCombinedHistory} from "@/hooks/use-prayer-queries";
import PrayerLog from "@/components/diary/PrayerLog";
import DiaryLog from "@/components/diary/DiaryLog";
import {LoadingState} from "@/components/LoadingStates";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

export default function LatestEntryCard() {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletePrayerId, setDeletePrayerId] = useState<string | null>(null);
    const [isDeletingPrayer, setIsDeletingPrayer] = useState(false);

    const {
        data: combinedEntries = [],
        isLoading,refetch,
    } = useCombinedHistory();

    // Get latest entry (assuming entries are sorted by date desc)
    const latestEntry = React.useMemo(() => {
        if (!combinedEntries.length) return null;

        return [...combinedEntries].sort(
            (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
    }, [combinedEntries]);

    const confirmPrayerDelete = async () => {
        if (!deletePrayerId) return;

        try {
            setIsDeletingPrayer(true);

            const res = await fetch(`/api/prayers?id=${deletePrayerId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete prayer log");
            }

            await refetch();
            setDeletePrayerId(null);
        } catch (error: any) {
            console.error("Prayer delete error:", error);
            alert(error.message || "Something went wrong");
        } finally {
            setIsDeletingPrayer(false);
        }
    };


    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            setIsDeleting(true);

            const res = await fetch(`/api/diary?id=${deleteId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete diary");
            }

            await refetch();
            setDeleteId(null); // close dialog
        } catch (error: any) {
            console.error("Delete error:", error);
            alert(error.message || "Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    };
    const handleAddPrayer = (date: string) => {
        router.push(`/dashboard/entry?date=${date}#prayer`);
    };
    const handleEditPrayer = (date: string) => {
        router.push(`/dashboard/entry?date=${date}#prayer`);
    };
    const handleAddDiary = (date: string) => {
        router.push(`/dashboard/entry?date=${date}#diary`);
    };
    const handleEditDiary = (date: string) => {
        router.push(`/dashboard/entry?date=${date}#diary`);
    };

    const handleAddNewClick = () => {
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
                    <Button onClick={handleAddNewClick}>
                        <Plus className="h-4 w-4 mr-1"/>
                        Add First Entry
                    </Button>
                </CardContent>
            </Card>
        );
    }
    const onTime =
        !latestEntry?.prayer ? null : (latestEntry?.prayer?.fajr === "on time" &&
        latestEntry?.prayer?.zuhr === "on time" &&
        latestEntry?.prayer?.asar === "on time" &&
        latestEntry?.prayer?.maghrib === "on time" &&
        latestEntry?.prayer?.esha === "on time")

    const jamaat = !latestEntry?.prayer ? null : (latestEntry.prayer.fajr === "on time" || latestEntry.prayer.fajr === "jamaat") && (latestEntry.prayer.zuhr === "on time" || latestEntry.prayer.zuhr === "jamaat") &&
        (latestEntry.prayer.asar === "on time" || latestEntry.prayer.asar === "jamaat") && (latestEntry.prayer.maghrib === "on time" || latestEntry.prayer.maghrib === "jamaat") &&
        (latestEntry.prayer.esha === "on time" || latestEntry.prayer.esha === "jamaat")
    /* ---------------- Latest Entry ---------------- */

    return (
        <>
        <Card
            className={`border shadow-sm bg-card gap-0 ${onTime && "border-sky-500" || jamaat && "border-green-500"}`}>
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
                        View all <ChevronRight className="w-3 h-3"/>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0 px-3 md:px-6">
                {/* Prayer Section */}
                <PrayerLog
                    prayer={latestEntry.prayer}
                    date={latestEntry.date}
                    onEdit={handleEditPrayer}
                    onAdd={handleAddPrayer}
                    onDelete={(id) => setDeletePrayerId(id)}
                />

                {/* Diary Section */}
                <DiaryLog
                    key={latestEntry.date}
                    diary={latestEntry.diary}
                    date={latestEntry.date}
                    onEdit={handleEditDiary}
                    onAdd={handleAddDiary}
                    onDelete={(id) => setDeleteId(id)}
                />
            </CardContent>
        </Card>
            {/*Prayer Dialog*/}
            <Dialog
                open={!!deletePrayerId}
                onOpenChange={() => setDeletePrayerId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete prayer log?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this day’s prayer record.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletePrayerId(null)}
                            disabled={isDeletingPrayer}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={confirmPrayerDelete}
                            disabled={isDeletingPrayer}
                        >
                            {isDeletingPrayer ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*Diary Dialog*/}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete diary Log?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. Your diary entry will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}
