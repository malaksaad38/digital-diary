'use client'
import React, { useState, useEffect } from 'react';
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
  Settings, Edit2,
  EditIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function PrayerTimes() {
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPrayer, setCurrentPrayer] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');
  const [countdown, setCountdown] = useState('');
  const [qazaCountdown, setQazaCountdown] = useState('');
  const [isFromCache, setIsFromCache] = useState(false);
  const [city, setCity] = useState('timergara');
  const [submittedCity, setSubmittedCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedCity(city);
    fetchPrayerTimes(true); // Force refresh from API

  };


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
      const apiUrl =
        `https://muslimsalat.com/${city}/weekly.json?key=b2015473db5fff96e4d4f2fd2ad84e1c`;
      const res = await fetch(proxy + encodeURIComponent(apiUrl));
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch');

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

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'pm') hours = String(parseInt(hours) + 12);
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const calculateCountdown = (target: Date) => {
    const diff = target.getTime() - new Date().getTime();
    if (diff <= 0) return '00h 00m 00s';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
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
    let nextTime: any = null;

    for (let i = 0; i < prayers.length; i++) {
      const [h, m] = convertTo24Hour(prayers[i].time).split(':').map(Number);
      const prayerMins = h * 60 + m;
      if (nowMins < prayerMins) {
        next = prayers[i].name;
        nextTime = { h, m };
        current = i > 0 ? prayers[i - 1].name : 'Isha';
        break;
      }
    }

    // Countdown for next prayer
    if (nextTime) {
      const nextDate = new Date();
      nextDate.setHours(nextTime.h, nextTime.m, 0, 0);
      setCountdown(calculateCountdown(nextDate));
    }

    // Qaza time (Fajr → Shurooq)
    let qazaTime24: string;
    if (current === 'Fajr') qazaTime24 = convertTo24Hour(today.shurooq);
    else {
      const idx = prayers.findIndex(p => p.name === current);
      const endIdx = idx + 1 < prayers.length ? idx + 1 : 0;
      qazaTime24 = convertTo24Hour(prayers[endIdx].time);
    }

    const [qh, qm] = qazaTime24.split(':').map(Number);
    const qazaDate = new Date();
    qazaDate.setHours(qh, qm, 0, 0);
    setQazaCountdown(calculateCountdown(qazaDate));

    setCurrentPrayer(current);
    setNextPrayer(next);
  }, [prayerData, currentTime]);

  const handleRefresh = () => {
    fetchPrayerTimes(true); // Force refresh from API
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Prayer times...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={handleRefresh}
              className="w-full mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prayerData || !prayerData.items || prayerData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No prayer times available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prayers = [
    { name: 'Fajr', key: 'fajr', icon: Sunrise, color: 'from-blue-500 to-purple-600' },
    { name: 'Dhuhr', key: 'dhuhr', icon: Sun, color: 'from-yellow-500 to-orange-500' },
    { name: 'Asr', key: 'asr', icon: CloudSun, color: 'from-orange-400 to-red-500' },
    { name: 'Maghrib', key: 'maghrib', icon: Sunrise, color: 'from-pink-500 to-purple-600' },
    { name: 'Isha', key: 'isha', icon: Moon, color: 'from-indigo-600 to-blue-800' }
  ];


  const today = prayerData.items[0];
  const todayPrayers = prayerData.items[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
      <Breadcrumbs />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}


        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Prayer Times
          </h1>
          <div className="flex justify-center items-center gap-2 mt-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {prayerData.city}, {prayerData.country}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <EditIcon/>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Enter your city</DialogTitle>
                  <DialogDescription>
                    Please type your city name in lowercase letters.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="e.g. lahore"
                    value={city}
                    onChange={(e) => setCity(e.target.value.toLowerCase())}
                    required
                  />

                  <DialogFooter>
                    <Button type="submit">Submit</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-sm mt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {today.date_for}
            </div>
            <div className="font-mono font-semibold text-lg">
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </div>
          </div>
        </div>

        {/* Current & Next */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Current Prayer
                </h3>
                <Badge className="text-xs bg-primary">Active</Badge>
              </div>
              <p className="text-3xl font-bold">{currentPrayer}</p>
              <p className="text-muted-foreground">{today[currentPrayer.toLowerCase()]}</p>
              <div className="rounded-lg p-3 bg-background/60 border">
                <p className="text-xs text-muted-foreground mb-1">
                  Qaza Time Remaining
                </p>
                <p className="text-2xl font-mono font-bold text-primary">{qazaCountdown}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-400/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-600" /> Next Prayer
                </h3>
                <Badge variant="secondary">Upcoming</Badge>
              </div>
              <p className="text-3xl font-bold">{nextPrayer}</p>
              <p className="text-muted-foreground">{today[nextPrayer.toLowerCase()]}</p>
              <div className="rounded-lg p-3 bg-background/60 border">
                <p className="text-xs text-muted-foreground mb-1">
                  Time Remaining for {nextPrayer}
                </p>
                <p className="text-2xl font-mono font-bold text-orange-600">{countdown}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Prayer Times - Redesigned */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Today's Prayer Schedule
            </CardTitle>
            <CardDescription>All five daily prayers for {todayPrayers.date_for}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {prayers.map((prayer) => {
                const Icon = prayer.icon;
                const isCurrent = currentPrayer === prayer.name;
                const isNext = nextPrayer === prayer.name;

                return (
                  <div
                    key={prayer.key}
                    className={cn(
                      "relative p-5 rounded-xl transition-all duration-300 hover:scale-105",
                      isCurrent && "ring-2 ring-primary ring-offset-2 bg-primary/10",
                      isNext && !isCurrent && "ring-2 ring-orange-500 ring-offset-2 bg-orange-500/10",
                      !isCurrent && !isNext && "bg-gradient-to-br from-muted/50 to-muted"
                    )}
                  >
                    {/* Badge */}
                    {isCurrent && (
                      <Badge className="absolute top-2 right-2 text-xs bg-primary">
                        Now
                      </Badge>
                    )}
                    {isNext && !isCurrent && (
                      <Badge className="absolute top-2 right-2 text-xs bg-orange-500">
                        Next
                      </Badge>
                    )}

                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br",
                        prayer.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{prayer.name}</p>
                        <p className="text-2xl font-bold font-mono mt-1">
                          {todayPrayers[prayer.key]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Sunrise className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sunrise (Shurooq)</p>
                  <p className="text-2xl font-bold font-mono">{todayPrayers.shurooq}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center  gap-4">
                <div className="w-12 shrink-0  h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calculation Method</p>
                  <p className="text-sm font-medium">{prayerData.prayer_method_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>7-Day Schedule</CardTitle>
            <CardDescription>Prayer times for the upcoming week</CardDescription>
          </CardHeader>
          <CardContent>
            {/* For desktop: table view */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  {prayers.map(prayer => (
                    <th
                      key={prayer.key}
                      className="text-center py-3 px-4 font-semibold whitespace-nowrap"
                    >
                      {prayer.name}
                    </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {prayerData.items.map((day, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      idx === 0 && "bg-primary/5 font-medium"
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {idx === 0  && (
                          <Badge className="text-xs">
                            Today
                          </Badge>
                        )}
                        <span>{day.date_for}</span>
                      </div>
                    </td>
                    {prayers.map(prayer => (
                      <td
                        key={prayer.key}
                        className="text-center py-3 px-4 font-mono whitespace-nowrap"
                      >
                        {day[prayer.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* For mobile: card view */}
            <div className="space-y-3 md:hidden">
              {prayerData.items.map((day, idx) => (
                <Card
                  key={idx}
                  className={cn(
                    "transition-all hover:shadow-md",
                    idx === 0  && "border-primary bg-primary/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{day.date_for}</span>
                      {idx === 0  && (
                        <Badge className="text-xs">Today</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {prayers.map(prayer => (
                        <div key={prayer.key} className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">{prayer.name}</p>
                          <p className="font-mono font-semibold text-sm">{day[prayer.key]}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center pb-8">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh from API
          </Button>
          {isFromCache && (
            <p className="text-xs text-muted-foreground text-center">
              Data loaded from cache • Will refresh automatically tomorrow
            </p>
          )}
        </div>
      </div>
    </div>
  );
}