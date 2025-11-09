"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Notebook,
  BarChart3,
  Edit3,
  Clock,
  Sunrise,
  Sunset,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardClient({ user }: { user: any }) {
  const pathname = usePathname();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState("");
  const [currentPrayer, setCurrentPrayer] = useState("");
  const [nextPrayerTime, setNextPrayerTime] = useState("");
  const [currentPrayerTime, setCurrentPrayerTime] = useState("");
  const [countdown, setCountdown] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [todayDate, setTodayDate] = useState(new Date().toDateString());

  // ✅ Function to fetch prayer times (used for both initial + refresh + midnight)
  const fetchPrayerTimes = async (force = false) => {
    try {
      const today = new Date().toDateString();
      const cachedData = localStorage.getItem("prayerTimesData");
      const cacheDate = localStorage.getItem("prayerTimesCacheDate");

      // Use cache if valid and not forced
      if (!force && cachedData && cacheDate === today) {
        setPrayerData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      setLoading(true);
      const proxy = "https://api.allorigins.win/raw?url=";
      const api =
        "https://muslimsalat.com/timergara.json?key=b2015473db5fff96e4d4f2fd2ad84e1c";
      const response = await fetch(proxy + encodeURIComponent(api));
      const data = await response.json();

      if (data?.items?.[0]) {
        const prayerInfo = data.items[0];
        setPrayerData(prayerInfo);
        localStorage.setItem("prayerTimesData", JSON.stringify(prayerInfo));
        localStorage.setItem("prayerTimesCacheDate", today);
        setTodayDate(today);
      }
    } catch (error) {
      console.error("Prayer fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial data load
  useEffect(() => {
    fetchPrayerTimes();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Auto-refresh at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date();
      const currentDate = now.toDateString();
      if (currentDate !== todayDate) {
        console.log("🌙 New day detected — auto-refreshing prayer data...");
        fetchPrayerTimes(true);
      }
    }, 60 * 1000); // check every minute

    return () => clearInterval(checkMidnight);
  }, [todayDate]);

  // ✅ Manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPrayerTimes(true).finally(() => setRefreshing(false));
  };

  const convertTo24Hour = (time12h: string) => {
    const [time, mod] = time12h.split(" ");
    let [h, m] = time.split(":");
    if (h === "12") h = "00";
    if (mod === "pm") h = (parseInt(h, 10) + 12).toString();
    return `${h.padStart(2, "0")}:${m}`;
  };

  // ✅ Determine current/next prayer
  useEffect(() => {
    if (!prayerData) return;

    const calcNextPrayer = () => {
      const now = currentTime;
      const total = now.getHours() * 60 + now.getMinutes();

      const prayers = [
        { name: "Fajr", time: prayerData.fajr },
        { name: "Dhuhr", time: prayerData.dhuhr },
        { name: "Asr", time: prayerData.asr },
        { name: "Maghrib", time: prayerData.maghrib },
        { name: "Isha", time: prayerData.isha },
      ];

      let next = prayers[0].name;
      let current = prayers[4].name;
      let nextT: any = null;

      for (let i = 0; i < prayers.length; i++) {
        const [h, m] = convertTo24Hour(prayers[i].time)
          .split(":")
          .map(Number);
        if (total < h * 60 + m) {
          next = prayers[i].name;
          nextT = { h, m };
          current = i > 0 ? prayers[i - 1].name : "Isha";
          break;
        }
      }

      const nextDate = new Date();
      if (nextT) nextDate.setHours(nextT.h, nextT.m, 0, 0);
      else {
        const [fh, fm] = convertTo24Hour(prayers[0].time)
          .split(":")
          .map(Number);
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
      setCurrentPrayerTime(prayerData[current.toLowerCase()]);
      setNextPrayerTime(prayerData[next.toLowerCase()]);
    };

    calcNextPrayer();
  }, [prayerData, currentTime]);

  const cards = [
    { title: "Prayer Times", icon: Clock, href: "/dashboard/prayer-times" },
    { title: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { title: "My Entries", icon: Edit3, href: "/dashboard/entry" },
    { title: "My Diaries", icon: Notebook, href: "/dashboard/diary" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-blue-50 via-emerald-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 px-4 py-6 space-y-8"
    >
      {/* 🌅 Sunrise / Sunset */}
      {prayerData && (
        <div className="flex flex-wrap justify-between items-center bg-gradient-to-r from-amber-100 to-sky-100 dark:from-indigo-900 dark:to-emerald-900 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sunrise className="w-5 h-5 text-orange-500" />
            Sunrise: <span className="font-mono">{prayerData.shurooq}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sunset className="w-5 h-5 text-purple-500" />
            Sunset: <span className="font-mono">{prayerData.maghrib}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Assalamu Alaikum, {user?.name || "Dear User"}
        </h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Current / Next Prayer */}
      {prayerData && (
        <Card className="rounded-2xl bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-slate-800 dark:to-slate-700 shadow-xl border-none">
          <CardContent className="p-5 text-center grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {currentPrayer}
              </h3>
              <p className="font-mono text-sm">{currentPrayerTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Countdown</p>
              <h3 className="text-2xl font-extrabold text-primary font-mono">
                {countdown}
              </h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Next</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {nextPrayer}
              </h3>
              <p className="font-mono text-sm">{nextPrayerTime}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prayer Times Grid */}
      {prayerData && (
        <Card className="rounded-2xl border-none shadow-md bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex justify-between items-center px-5 pt-5">
            <div>
              <CardTitle className="text-lg font-semibold">
                Today’s Prayer Times
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {prayerData.date_for}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("w-4 h-4", refreshing && "animate-spin")}
              />
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p) => (
                <div
                  key={p}
                  className={cn(
                    "py-3 rounded-xl transition-all shadow-sm",
                    currentPrayer === p
                      ? "bg-blue-500 text-white font-semibold"
                      : nextPrayer === p
                        ? "bg-emerald-500 text-white font-semibold"
                        : "bg-white/60 dark:bg-slate-800"
                  )}
                >
                  <p className="text-sm">{p}</p>
                  <p className="text-sm font-mono">
                    {prayerData[p.toLowerCase()]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Navigation */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={item.href}>
              <Card
                className={cn(
                  "rounded-2xl p-5 text-center shadow-md transition-all hover:shadow-xl hover:-translate-y-1",
                  "bg-gradient-to-br from-white/70 to-blue-50 dark:from-slate-800 dark:to-slate-700",
                  pathname === item.href && "border-primary border-2"
                )}
              >
                <CardHeader className="flex flex-col items-center p-0">
                  <item.icon className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-base font-semibold">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-xs text-muted-foreground">
                  Manage {item.title.toLowerCase()}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
