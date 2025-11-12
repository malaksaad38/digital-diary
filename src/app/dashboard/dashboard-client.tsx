"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Sunrise,
  Sunset,
  Plus,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  Calendar,
  Target,
  Moon,
  Sun,
  CloudSun,
  Sparkles,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCombinedHistory } from "@/hooks/use-prayer-queries";

export default function ModernDashboard({ user }: { user: any }) {
  const { data: combinedEntries = [], isLoading } = useCombinedHistory();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState("");
  const [currentPrayer, setCurrentPrayer] = useState("");
  const [countdown, setCountdown] = useState("");

  const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];

  // Load prayer data from localStorage
  useEffect(() => {
    const loadPrayerData = () => {
      try {
        const cached = localStorage.getItem("prayerTimes");
        if (cached) {
          setPrayerData(JSON.parse(cached));
        }
      } catch (error) {
        console.error("Error loading prayer data:", error);
      }
    };

    loadPrayerData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const stats = {
      missed: 0,
      alone: 0,
      jamaat: 0,
      onTime: 0,
      total: 0,
    };

    combinedEntries.forEach((entry: any) => {
      if (entry.prayer) {
        prayers.forEach((prayer) => {
          const status = entry.prayer[prayer]?.toLowerCase();
          stats.total++;

          if (status === "missed") stats.missed++;
          else if (status === "alone") stats.alone++;
          else if (status === "jamaat") stats.jamaat++;
          else if (status === "on time") stats.onTime++;
        });
      }
    });

    return stats;
  }, [combinedEntries]);

  const successRate =
    overallStats.total > 0
      ? ((overallStats.jamaat + overallStats.onTime) / overallStats.total * 100).toFixed(1)
      : 0;

  // Convert time format
  const convertTo24Hour = (time12h: string) => {
    if (!time12h) return "00:00";
    const [time, mod] = time12h.split(" ");
    let [h, m] = time.split(":");
    if (h === "12") h = "00";
    if (mod === "pm") h = (parseInt(h, 10) + 12).toString();
    return `${h.padStart(2, "0")}:${m}`;
  };

  // Calculate next prayer and countdown
  useEffect(() => {
    if (!prayerData) return;

    const calcNextPrayer = () => {
      const now = currentTime;
      const total = now.getHours() * 60 + now.getMinutes();

      const prayersList = [
        { name: "Fajr", time: prayerData.fajr },
        { name: "Dhuhr", time: prayerData.dhuhr },
        { name: "Asr", time: prayerData.asr },
        { name: "Maghrib", time: prayerData.maghrib },
        { name: "Isha", time: prayerData.isha },
      ];

      let next = prayersList[0].name;
      let current = prayersList[4].name;
      let nextT: any = null;

      for (let i = 0; i < prayersList.length; i++) {
        const [h, m] = convertTo24Hour(prayersList[i].time).split(":").map(Number);
        if (total < h * 60 + m) {
          next = prayersList[i].name;
          nextT = { h, m };
          current = i > 0 ? prayersList[i - 1].name : "Isha";
          break;
        }
      }

      const nextDate = new Date();
      if (nextT) nextDate.setHours(nextT.h, nextT.m, 0, 0);
      else {
        const [fh, fm] = convertTo24Hour(prayersList[0].time).split(":").map(Number);
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(fh, fm, 0, 0);
      }

      const diff = nextDate.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setCountdown(`${h}h ${m}m ${s}s`);
      setCurrentPrayer(current);
      setNextPrayer(next);
    };

    calcNextPrayer();
  }, [prayerData, currentTime]);

  const prayerIcons = {
    Fajr: Sunrise,
    Dhuhr: Sun,
    Asr: CloudSun,
    Maghrib: Sunset,
    Isha: Moon,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
      {prayerData && (
        <div className="flex gap-4 mb-2 justify-between sm:gap-6">
          <div className="flex justify-center items-center gap-1">
            <Sunrise className="w-5 h-5 text-orange-500" />
            <span className="font-mono font-semibold text-sm">{prayerData.items[0].shurooq || "0:00 am"}</span>
          </div>
          <div className="flex justify-center items-center gap-1">
            <span className="font-mono font-semibold text-sm">{prayerData.items[0].maghrib || "0:00 pm"}</span>
            <Sunset className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-6">


        {/* Header Section */}
        <div className="relative overflow-hidden sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 " />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className=" text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Assalamu Alaikum, {user?.name || "Dear User"}
                </h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  May your day be blessed with guidance
                </p>
              </div>

              {/* Sunrise/Sunset */}

            </div>
            {/* Current Time */}
            {/*<div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">*/}
            {/*  <Clock className="w-4 h-4" />*/}
            {/*  <span>{currentTime.toLocaleString("en-US", {*/}
            {/*    weekday: "long",*/}
            {/*    year: "numeric",*/}
            {/*    month: "long",*/}
            {/*    day: "numeric",*/}
            {/*    hour: "2-digit",*/}
            {/*    minute: "2-digit"*/}
            {/*  })}</span>*/}
            {/*</div>*/}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/dashboard/entry">
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex gap-2">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Add New Entry</h3>
                      <p className="text-sm text-muted-foreground">
                        Record today's prayer status
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Entry
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/diary">
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex gap-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">My Diaries</h3>
                      <p className="text-sm text-muted-foreground">
                        View all your journal entries
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Diaries
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Analytics Overview Card */}
        <Card className="overflow-hidden border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b px-4">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="hidden md:flex w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Prayer Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground">Your spiritual progress at a glance</p>
                </div>
              </div>
              <Link href="/dashboard/analytics">
                <Button variant="outline" size="sm">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Jamaat */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-green-50/80 to-transparent dark:from-green-950/20 py-4 border border-green-200/40 hover:border-green-300/60 transition-all">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Jamaat</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{overallStats.jamaat}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallStats.total > 0
                    ? ((overallStats.jamaat / overallStats.total) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>

              {/* On Time */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-sky-50/80 to-transparent dark:from-sky-950/20 py-4 border border-sky-200/40 hover:border-sky-300/60 transition-all">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">On Time</p>
                <p className="text-2xl font-bold text-sky-600 mt-1">{overallStats.onTime}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallStats.total > 0
                    ? ((overallStats.onTime / overallStats.total) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>

              {/* Alone */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-yellow-50/80 to-transparent dark:from-yellow-950/20 py-4 border border-yellow-200/40 hover:border-yellow-300/60 transition-all">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Alone</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{overallStats.alone}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallStats.total > 0
                    ? ((overallStats.alone / overallStats.total) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>

              {/* Missed */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-red-50/80 to-transparent dark:from-red-950/20 py-4 border border-red-200/40 hover:border-red-300/60 transition-all">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Missed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{overallStats.missed}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallStats.total > 0
                    ? ((overallStats.missed / overallStats.total) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>

              {/* Success Rate */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-primary/10 to-transparent py-4 border border-primary/40 hover:border-primary/60 transition-all">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-primary mt-1">{successRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Overall</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Times Card */}
        <Card className="overflow-hidden border-2">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent border-b px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="hidden md:flex w-10 h-10 rounded-lg bg-purple-500/10 items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Prayer Times</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {prayerData?.items[0].date_for || "Loading..."}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/prayer-times">
                <Button variant="outline" size="sm">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {prayerData ? (
              <>
                {/* Current & Next Prayer */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                    <Badge className="absolute top-2 right-2 bg-blue-500">Current</Badge>
                    <div className="flex items-center gap-3 mt-2">
                      {currentPrayer && React.createElement(prayerIcons[currentPrayer as keyof typeof prayerIcons] || Clock, {
                        className: "w-8 h-8 text-blue-600"
                      })}
                      <div>
                        <p className="text-sm text-muted-foreground">Current Prayer</p>
                        <p className="text-xl font-bold">{currentPrayer}</p>
                        <p className="text-sm font-mono text-muted-foreground">
                          {prayerData.items[0][currentPrayer?.toLowerCase()]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                    <Badge className="absolute top-2 right-2 bg-emerald-500">Next</Badge>
                    <div className="flex items-center gap-3 mt-2">
                      {nextPrayer && React.createElement(prayerIcons[nextPrayer as keyof typeof prayerIcons] || Clock, {
                        className: "w-8 h-8 text-emerald-600"
                      })}
                      <div>
                        <p className="text-sm text-muted-foreground">Next Prayer</p>
                        <p className="text-xl font-bold">{nextPrayer}</p>
                        <p className="text-sm font-mono text-muted-foreground">
                          {prayerData.items[0][nextPrayer?.toLowerCase()]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Prayer Times */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer) => {
                    const Icon = prayerIcons[prayer as keyof typeof prayerIcons];
                    const isCurrent = currentPrayer === prayer;
                    const isNext = nextPrayer === prayer;

                    return (
                      <div
                        key={prayer}
                        className={cn(
                          "relative p-3 rounded-xl transition-all text-center border",
                          isCurrent && "bg-blue-500/10 border-blue-500/40 shadow-sm",
                          isNext && !isCurrent && "bg-emerald-500/10 border-emerald-500/40 shadow-sm",
                          !isCurrent && !isNext && "bg-muted/50 border-border hover:bg-muted/70"
                        )}
                      >
                        <Icon className={cn(
                          "w-6 h-6 mx-auto mb-2",
                          isCurrent && "text-blue-600",
                          isNext && !isCurrent && "text-emerald-600",
                          !isCurrent && !isNext && "text-muted-foreground"
                        )} />
                        <p className="text-xs font-medium mb-1">{prayer}</p>
                        <p className="text-sm font-mono font-semibold">
                          {prayerData.items[0][prayer.toLowerCase()]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Prayer times not available</p>
                <p className="text-sm mt-1">Please visit the Prayer Times page to load data</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}