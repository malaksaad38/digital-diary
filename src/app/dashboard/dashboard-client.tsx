"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    BookOpen,
    Calendar,
    CalendarDays,
    ChevronRight,
    Clock,
    CloudSun,
    MapPin,
    Moon,
    Percent,
    Plus,
    RefreshCw,
    Sun,
    Sunrise,
    Sunset,
    Target,
    Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCombinedHistory } from "@/hooks/use-prayer-queries";
import LatestDiaryCard from "@/components/dashboard/LatestDiaryCard";
import UpdateNameDialog from "@/components/dashboard/UpdateNameDialog";

export default function ModernDashboard({ user, isAdmin }: { user: any, isAdmin?: boolean }) {
    const { data: combinedEntries = [] } = useCombinedHistory();
    const [prayerData, setPrayerData] = useState<any>(null);
    const [isFromCache, setIsFromCache] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState("");
    const [currentPrayer, setCurrentPrayer] = useState("");
    const [countdown, setCountdown] = useState("");
    const [city, setCity] = useState(() => {
        try {
            return localStorage.getItem('userCity') || "timergara";
        } catch {
            return "timergara";
        }
    });


    const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];

    // 🕌 Fetch & cache prayer times
    const fetchPrayerTimes = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const cacheKey = "prayerTimes";
            const cacheDateKey = "prayerDate";
            const today = new Date().toDateString();

            if (!forceRefresh) {
                const cachedData = localStorage.getItem(cacheKey);
                const cacheDate = localStorage.getItem(cacheDateKey);
                if (cachedData && cacheDate === today) {
                    setPrayerData(JSON.parse(cachedData));
                    setIsFromCache(true);
                    setLoading(false);
                    return;
                }
            }

            const proxy = 'https://api.allorigins.win/raw?url=';
            const apiUrl = `https://muslimsalat.com/${encodeURIComponent(city)}/weekly.json?key=b2015473db5fff96e4d4f2fd2ad84e1c`;
            const res = await fetch(proxy + encodeURIComponent(apiUrl), {
                signal: AbortSignal.timeout(10000)
            });
            const data = await res.json();

            if (!res.ok || data.error) throw new Error(data.error || "Failed to fetch");

            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(cacheDateKey, today);

            setPrayerData(data);
            setIsFromCache(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrayerTimes();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 📊 Stats
    const overallStats = useMemo(() => {
        const s = { missed: 0, alone: 0, jamaat: 0, onTime: 0, total: 0 };
        combinedEntries.forEach((entry: any) => {
            prayers.forEach((p) => {
                const val = entry.prayer?.[p]?.toLowerCase();
                s.total++;
                if (val === "missed") s.missed++;
                else if (val === "alone") s.alone++;
                else if (val === "jamaat") s.jamaat++;
                else if (val === "on time") s.onTime++;
            });
        });
        return s;
    }, [combinedEntries]);

    const successRate =
        overallStats.total > 0
            ? ((overallStats.jamaat + overallStats.onTime) / overallStats.total) * 100
            : 0;

    // 🕒 Time helpers
    const convertTo24 = (time: string) => {
        if (!time) return "00:00";
        const [t, m] = time.split(" ");
        let [h, min] = t.split(":");
        if (h === "12") h = "00";
        if (m === "pm") h = String(parseInt(h) + 12);
        return `${h.padStart(2, "0")}:${min}`;
    };

    // 🔄 Current & next prayer logic
    useEffect(() => {
        if (!prayerData?.items?.[0]) return;
        const today = prayerData.items[0];
        const now = currentTime;
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const list = [
            { n: "Fajr", t: today.fajr },
            { n: "Dhuhr", t: today.dhuhr },
            { n: "Asr", t: today.asr },
            { n: "Maghrib", t: today.maghrib },
            { n: "Isha", t: today.isha },
        ];

        let next = list[0],
            current = list[4];
        for (let i = 0; i < list.length; i++) {
            const [h, m] = convertTo24(list[i].t).split(":").map(Number);
            if (nowMins < h * 60 + m) {
                next = list[i];
                current = list[i - 1] || list[4];
                break;
            }
        }

        const nextDate = new Date();
        const [h, m] = convertTo24(next.t).split(":").map(Number);
        nextDate.setHours(h, m, 0, 0);
        if (next === list[0] && nowMins > h * 60 + m) nextDate.setDate(nextDate.getDate() + 1);

        const diff = nextDate.getTime() - now.getTime();
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        setCountdown(`${hh}h ${mm}m`);
        setNextPrayer(next.n);
        setCurrentPrayer(current.n);
    }, [prayerData, currentTime]);

    const icons = { Fajr: Sunrise, Dhuhr: Sun, Asr: CloudSun, Maghrib: Sunset, Isha: Moon };

    return (
        <div className="max-w-6xl mx-auto bg-background px-4 pb-12 md:py-10 space-y-6 pt-4">
            {/* Header */}

            <div className="flex flex-col gap-2 md:flex-row justify-between">
                <div className="flex items-start gap-2">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold mb-1 flex items-start md:items-center gap-2">
                            Assalamu Alaikum, {user?.name || "User"}
                            <UpdateNameDialog currentName={user?.name} />

                        </h1>

                        <p className="text-sm md:text-base text-muted-foreground">
                            {currentTime.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                            {isAdmin && (
                                <Link href="/admin" className="flex justify-end md:justify-start md:py-2 -mt-10 md:-mt-0">
                                    <Button className="" variant="destructive">
                                        <Shield className=" h-4 w-4" /> Admin Panel
                                    </Button>
                                </Link>
                            )}
                        </p>
                    </div>
                </div>
                {/* Quick Actions */}
                <div className={
                    "fixed sm:static bottom-20 left-4 right-4 z-20 grid grid-cols-2 gap-2"
                }>
                    <Link href="/dashboard/entry">
                        <Button className={"w-full"}>
                            <Plus /> Add Entry
                        </Button>
                    </Link>
                    <Link href="/dashboard/diary">
                        <Button className={"w-full"}>
                            <BookOpen /> My Diary
                        </Button>
                    </Link>
                </div>
            </div>


            {/* Prayer Analytics */}
            <Card className="shadow-md py-2 md:py-6 pt-2">
                <CardContent className="p-3 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-semibold text-sm md:text-base">Prayer Analytics</p>
                        <Link href="/dashboard/analytics">
                            <Button size="default" variant="outline" className="text-xs">
                                Details <ChevronRight className="w-3 h-3" />
                            </Button>
                        </Link>
                    </div>

                    <div className="flex justify-between text-xs md:text-base gap-1 md:gap-4">
                        {[
                            {
                                label: "On Time",
                                value: overallStats.onTime,
                                icon: Clock,
                                bg: "bg-blue-100 dark:bg-blue-900/20",
                                color: "text-blue-600"
                            },
                            {
                                label: "Jamaat",
                                value: overallStats.jamaat,
                                icon: Target,
                                bg: "bg-green-100 dark:bg-green-900/20",
                                color: "text-green-600"
                            },
                            {
                                label: "Alone",
                                value: overallStats.alone,
                                icon: Activity,
                                bg: "bg-yellow-100 dark:bg-yellow-900/20",
                                color: "text-yellow-600"
                            },
                            {
                                label: "Missed",
                                value: overallStats.missed,
                                icon: Sunset,
                                bg: "bg-red-100 dark:bg-red-900/20",
                                color: "text-red-600"
                            },
                            {
                                label: "Success",
                                value: successRate.toFixed(0) + "%",
                                icon: Percent,
                                bg: "bg-indigo-100 dark:bg-indigo-900/20",
                                color: "text-indigo-600"
                            },
                        ].map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label}
                                    className={cn(stat.bg, "relative flex-1 rounded  p-2 md:p-4")}>
                                    <Icon
                                        className={cn("mx-auto size-10 md:size-14 mb-1 absolute top-1 right-0 opacity-10", stat.color)} />
                                    <p className="font-bold text-base">{stat.value}</p>
                                    <p className="text-[10px] md:text-base text-muted-foreground">{stat.label}</p>

                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t text-[10px]  md:text-base">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="size-3 md:size-4 text-blue-500" />
                            <span className="text-muted-foreground">Total Days</span>
                            <span className="font-mono font-semibold">{overallStats.total / 5}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="size-3 md:size-4 text-cyan-500" />
                            <span className="text-muted-foreground">Total Prayers</span>
                            <span className="font-mono font-semibold">{overallStats.total}</span>
                        </div>
                    </div>

                </CardContent>
            </Card>


            {/* Prayer Times */}
            <Card className="shadow-md py-2 md:py-6 pb-1">
                <CardContent className="p-3 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-semibold text-sm md:text-base">Prayer Times</p>
                        <div className="flex items-center gap-2 md:gap-4">
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => fetchPrayerTimes(true)}
                                disabled={loading}
                            >
                                <RefreshCw className={cn("w-3 h-3", loading ? "animate-spin" : "")} />
                            </Button>
                            <Link href="/dashboard/prayer-times">
                                <Button size="default" variant="outline" >
                                    Details <ChevronRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div
                        className="flex justify-between items-center text-[10px] md:text-base text-muted-foreground mb-2 md:mb-4">
                        <div className="flex items-center gap-1 md:gap-4">
                            <MapPin className="w-3 h-3" />
                            {prayerData?.city || "City"}, {prayerData?.country || "Country"}
                        </div>
                        <div className="flex items-center ">
                            <Badge variant="outline"
                                className="text-[10px] md:text-base px-2 py-1 bg-blue-100 rounded-r-none  dark:bg-blue-900/20">Now: {currentPrayer || "Prayer"}</Badge>
                            <Badge variant="outline"
                                className="text-[10px] md:text-base px-2 py-1 rounded-l-none bg-green-100 dark:bg-green-900/20">Next: {nextPrayer || "Prayer"} {countdown || "00:00"}</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1 md:gap-4 text-[10px] md:text-base">
                        {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p) => {
                            const Icon = icons[p as keyof typeof icons];
                            const time = prayerData?.items?.[0]?.[p.toLowerCase()];
                            const isCurrent = currentPrayer === p;
                            const isNext = nextPrayer === p;
                            return (
                                <div
                                    key={p}
                                    className={cn(
                                        "rounded p-2 md:p-4 relative border transition",
                                        isCurrent
                                            ? "bg-blue-100 dark:bg-blue-900/20 border-blue-400"
                                            : isNext
                                                ? "bg-green-100 dark:bg-green-900/20 border-green-400"
                                                : "bg-muted/40 border-transparent"
                                    )}
                                >
                                    <Icon
                                        className={cn("mx-auto mb-1 absolute size-10 md:size-12 opacity-10 bottom-0 right-0", isCurrent ? "text-blue-600" : isNext ? "text-green-600" : "text-muted-foreground")} />
                                    <p className="font-mono font-semibold leading-tight tracking-tighter text-sm">{time || "00:00 am"}</p>
                                    <p>{p}</p>
                                </div>
                            );
                        })}
                    </div>
                    {prayerData?.items[0].shurooq ? (
                        <div className="flex justify-between mt-4 pt-4 border-t text-[10px] md:text-base">
                            <div className="flex items-center gap-2">
                                <Sunrise className="size-3 md:size-4 text-orange-500" />
                                <span className="text-muted-foreground">Sunrise:</span>
                                <span
                                    className="font-mono font-semibold">{prayerData?.items[0].shurooq}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sunset className="size-3 md:size-4 text-purple-500" />
                                <span className="text-muted-foreground">Sunset:</span>
                                <span
                                    className="font-mono font-semibold">{prayerData?.items[0].maghrib}</span>
                            </div>
                        </div>
                    ) :
                        <div className="flex justify-between mt-4 pt-4 border-t text-[10px] md:text-base">
                            <div className="flex items-center gap-2">
                                <Sunrise className="size-3 md:size-4 text-orange-500" />
                                <span className="text-muted-foreground">Sunrise:</span>
                                <span
                                    className="font-mono font-semibold">00:00</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sunset className="size-3 md:size-4 text-purple-500" />
                                <span className="text-muted-foreground">Sunset:</span>
                                <span
                                    className="font-mono font-semibold">00:00</span>
                            </div>
                        </div>}


                </CardContent>
            </Card>
            {/* Dashboard Diary */}
            <LatestDiaryCard />
        </div>
    );
}
