// Converted to shadcn/ui version
"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  MapPin,
  AlertCircle,
  RefreshCw,
  Sunrise,
  Moon,
  Sun,
  CloudSun,
  Loader2,
  Timer,
  Sunset,
  Edit2 as EditIcon, Edit2, Edit2Icon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";

export default function PrayerTimes() {
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPrayer, setCurrentPrayer] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');
  const [countdown, setCountdown] = useState('');
  const [qazaCountdown, setQazaCountdown] = useState('');
  const [isFromCache, setIsFromCache] = useState(false);
  const [city, setCity] = useState("timergara");

  const fetchPrayerTimes = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = 'prayerTimes';
      const cacheDateKey = 'prayerDate';
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
      const apiUrl = `https://muslimsalat.com/${city}/weekly.json?key=b2015473db5fff96e4d4f2fd2ad84e1c`;
      const res = await fetch(proxy + encodeURIComponent(apiUrl));
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch');

      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheDateKey, today);

      setPrayerData(data);
      setIsFromCache(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const checkAndRefresh = () => {
      const now = new Date();
      const lastRefresh = localStorage.getItem('lastApiRefresh');
      const today = now.toDateString();

      if (!lastRefresh || lastRefresh !== today) {
        fetchPrayerTimes(true);
        localStorage.setItem('lastApiRefresh', today);
      }
    };

    const refreshTimer = setInterval(checkAndRefresh, 60000);
    checkAndRefresh();

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, []);

  const convertTo24Hour = (time12h) => {
    if (!time12h || typeof time12h !== 'string') return null;
    const str = time12h.trim();
    const parts = str.split(' ');
    if (parts.length < 2) return null;
    const time = parts[0];
    const modifier = parts[1].toLowerCase();

    let [hours, minutes] = time.split(':');
    hours = hours.replace(/^0+/, '') || '0';
    if (hours === '12' && modifier === 'am') hours = '00';
    else if (modifier === 'pm' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
    hours = hours.toString().padStart(2, '0');
    minutes = (minutes || '00').padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const calculateCountdown = (target) => {
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${hh}h ${mm}m ${ss}s`;
  };

  useEffect(() => {
    if (!prayerData) return;
    const today = prayerData.items[0];
    const prayers = [
      { name: 'Fajr', time: today.fajr },
      { name: 'Dhuhr', time: today.dhuhr },
      { name: 'Asr', time: today.asr },
      { name: 'Maghrib', time: today.maghrib },
      { name: 'Isha', time: today.isha },
    ];

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    let current = 'Isha';
    let next = 'Fajr';
    let nextTime = null;
    let nextIsNextDay = false;

    // Check if we're between Fajr and Shurooq (sunrise)
    const fajrConv = convertTo24Hour(today.fajr);
    const shurooqConv = convertTo24Hour(today.shurooq);
    let isBetweenFajrAndShurooq = false;

    if (fajrConv && shurooqConv) {
      const [fh, fm] = fajrConv.split(':').map(Number);
      const [sh, sm] = shurooqConv.split(':').map(Number);
      const fajrMins = fh * 60 + fm;
      const shurooqMins = sh * 60 + sm;
      isBetweenFajrAndShurooq = nowMins >= fajrMins && nowMins < shurooqMins;
    }

    for (let i = 0; i < prayers.length; i++) {
      const conv = convertTo24Hour(prayers[i].time);
      if (!conv) continue;
      const [h, m] = conv.split(':').map(Number);
      const prayerMins = h * 60 + m;
      if (nowMins < prayerMins) {
        next = prayers[i].name;
        nextTime = { h, m };
        current = i > 0 ? prayers[i - 1].name : 'Isha';
        break;
      }
    }

    if (!nextTime) {
      next = 'Fajr';
      const tomorrowItem = prayerData.items[1];
      let fajrTimeStr = tomorrowItem ? tomorrowItem.fajr : prayers[0].time;
      const conv = convertTo24Hour(fajrTimeStr);
      if (conv) {
        const [h, m] = conv.split(':').map(Number);
        nextTime = { h, m };
        nextIsNextDay = true;
        current = 'Isha';
      }
    }

    if (nextTime) {
      const nextDate = new Date();
      nextDate.setHours(nextTime.h, nextTime.m, 0, 0);
      if (nextIsNextDay) {
        nextDate.setDate(nextDate.getDate() + 1);
      } else {
        if (nextDate.getTime() <= now.getTime()) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
      }
      setCountdown(calculateCountdown(nextDate));
    } else {
      setCountdown('00h 00m 00s');
    }

    // Determine Qaza time
    let qazaTimeStr;
    let qazaHasPassed = false;

    if (current === 'Fajr') {
      // For Fajr, Qaza ends at Shurooq
      qazaTimeStr = today.shurooq;
      // Check if we're past Shurooq
      if (!isBetweenFajrAndShurooq && shurooqConv) {
        const [sh, sm] = shurooqConv.split(':').map(Number);
        const shurooqMins = sh * 60 + sm;
        if (nowMins >= shurooqMins) {
          qazaHasPassed = true;
        }
      }
    } else {
      // For other prayers, Qaza ends at next prayer time
      qazaTimeStr = next === 'Fajr' && nextIsNextDay
        ? (prayerData.items[1] ? prayerData.items[1].fajr : prayers[0].time)
        : today[next.toLowerCase()];
    }

    if (qazaHasPassed) {
      setQazaCountdown('Expired');
    } else {
      const qConv = convertTo24Hour(qazaTimeStr);
      if (qConv) {
        const [qh, qm] = qConv.split(':').map(Number);
        const qazaDate = new Date();
        qazaDate.setHours(qh, qm, 0, 0);

        if (qazaDate.getTime() <= now.getTime()) {
          setQazaCountdown('Expired');
        } else {
          setQazaCountdown(calculateCountdown(qazaDate));
        }
      } else {
        setQazaCountdown('Expired');
      }
    }

    setCurrentPrayer(current);
    setNextPrayer(next);
  }, [prayerData, currentTime]);


  const prayers = [
    { name: 'Fajr', key: 'fajr', icon: Sunrise },
    { name: 'Dhuhr', key: 'dhuhr', icon: Sun },
    { name: 'Asr', key: 'asr', icon: CloudSun },
    { name: 'Maghrib', key: 'maghrib', icon: Sunset },
    { name: 'Isha', key: 'isha', icon: Moon }
  ];

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className={"text-xl text-bold"} >Prayer times Loading...</p>

      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button className="w-full" onClick={() => fetchPrayerTimes(true)}>
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  const today = prayerData.items[0];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Prayer Times</h1>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {prayerData.city}, {prayerData.country}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {today.date_for}
            </div>
            <div className="font-mono text-lg font-semibold">
              {currentTime.toLocaleTimeString("en-US", { hour12: true })}
            </div>
          </div>
        </div>

        {/* Current & Next */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-blue-400 bg-blue-50/50 dark:bg-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Clock className="w-5 h-5" /> Current Prayer
              </CardTitle>
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Active</span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{currentPrayer}</p>
              <p className="text-muted-foreground mb-4">
                {today[currentPrayer.toLowerCase()]}
              </p>
              <div className="p-3 border rounded-md">
                <p className="text-xs text-muted-foreground">Qaza Time Remaining</p>
                <p className="text-xl font-mono font-bold text-blue-700">{qazaCountdown}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-400 bg-green-50/50 dark:bg-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Timer className="w-5 h-5" /> Next Prayer
              </CardTitle>
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Upcoming</span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{nextPrayer}</p>
              <p className="text-muted-foreground mb-4">
                {today[nextPrayer.toLowerCase()]}
              </p>
              <div className="p-3 border rounded-md">
                <p className="text-xs text-muted-foreground">Time Remaining</p>
                <p className="text-xl font-mono font-bold text-green-700">{countdown}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {prayers.map((p) => {
                const Icon = p.icon;
                const isCurrent = currentPrayer === p.name;
                const isNext = nextPrayer === p.name;

                return (
                  <div
                    key={p.key}
                    className={`p-4 border rounded-lg text-center transition ${
                      isCurrent
                        ? "bg-background border border-blue-400"
                        : isNext
                          ? "bg-background border border-green-400"
                          : "bg-background border border-border"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mx-auto mb-2 ${
                        isCurrent
                          ? "text-blue-600"
                          : isNext
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    />
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xl font-mono font-bold">{today[p.key]}</p>
                    {isCurrent && <p className="text-xs text-blue-600">Now</p>}
                    {isNext && <p className="text-xs text-green-600">Next</p>}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-center">
              <div className="flex items-center gap-2 text-sm">
                <Sunrise className="w-4 h-4 text-orange-500" /> Sunrise (Shurooq):
                <span className="font-mono font-semibold">{today.shurooq}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prayerData.items.map((day, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  idx === 0 ? "bg-primary/5 border-primary/40" : "bg-muted"
                }`}
              >
                <div className="flex justify-between mb-3">
                  <span className="font-semibold">{day.date_for}</span>
                  {idx === 0 && (
                    <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                      Today
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
                  {prayers.map((p) => (
                    <div key={p.key}>
                      <p className="text-xs text-muted-foreground">{p.name}</p>
                      <p className="font-mono font-semibold">{day[p.key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-3 pb-8">
          <Button variant="outline" onClick={() => fetchPrayerTimes(true)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh from API
          </Button>
          {isFromCache && (
            <p className="text-xs text-muted-foreground">Loaded from cache</p>
          )}
        </div>
      </div>

    </div>
  );
}
