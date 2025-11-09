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
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";

export default function PrayerTimes() {
  const [prayerData, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFromCache, setIsFromCache] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');
  const [countdown, setCountdown] = useState('');

  const fetchPrayerTimes = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check localStorage first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = localStorage.getItem('prayerTimesWeeklyData');
        const cacheDate = localStorage.getItem('prayerTimesWeeklyCacheDate');
        const today = new Date().toDateString();

        // If cached data exists and is from today, use it
        if (cachedData && cacheDate === today) {
          setData(JSON.parse(cachedData));
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const apiUrl = 'https://muslimsalat.com/timergara/weekly.json?key=b2015473db5fff96e4d4f2fd2ad84e1c';

      const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Store in localStorage
      const today = new Date().toDateString();
      localStorage.setItem('prayerTimesWeeklyData', JSON.stringify(data));
      localStorage.setItem('prayerTimesWeeklyCacheDate', today);

      setData(data);
      setIsFromCache(false);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerData && prayerData.items && prayerData.items[0]) {
      const getCurrentAndNextPrayer = () => {
        const todayPrayers = prayerData.items[0];
        const now = currentTime;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const prayers = [
          { name: 'Fajr', time: todayPrayers.fajr },
          { name: 'Dhuhr', time: todayPrayers.dhuhr },
          { name: 'Asr', time: todayPrayers.asr },
          { name: 'Maghrib', time: todayPrayers.maghrib },
          { name: 'Isha', time: todayPrayers.isha }
        ];

        let current = 'Isha';
        let next = 'Fajr';
        let nextPrayerTime = null;

        for (let i = 0; i < prayers.length; i++) {
          const prayerTime24 = convertTo24Hour(prayers[i].time);
          const [prayerHour, prayerMinute] = prayerTime24.split(':').map(Number);

          const currentTotalMinutes = currentHour * 60 + currentMinute;
          const prayerTotalMinutes = prayerHour * 60 + prayerMinute;

          if (currentTotalMinutes < prayerTotalMinutes) {
            next = prayers[i].name;
            nextPrayerTime = { hour: prayerHour, minute: prayerMinute };

            if (i > 0) {
              current = prayers[i - 1].name;
            } else {
              current = 'Isha';
            }
            break;
          }
        }

        // Calculate countdown
        if (nextPrayerTime) {
          const nextPrayerDate = new Date();
          nextPrayerDate.setHours(nextPrayerTime.hour, nextPrayerTime.minute, 0, 0);

          const diff = nextPrayerDate.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          // If no prayer found today, next is Fajr tomorrow
          const fajrTime24 = convertTo24Hour(prayers[0].time);
          const [fajrHour, fajrMinute] = fajrTime24.split(':').map(Number);

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(fajrHour, fajrMinute, 0, 0);

          const diff = tomorrow.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }

        setCurrentPrayer(current);
        setNextPrayer(next);
      };

      getCurrentAndNextPrayer();
    }
  }, [prayerData, currentTime]);

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

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

  const todayPrayers = prayerData.items[0];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-accent/20">
      <Breadcrumbs/>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Prayer Times
            </h1>
            {isFromCache && (
              <Badge variant="secondary" className="text-xs">
                Cached
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{prayerData.city}, {prayerData.country}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{todayPrayers.date_for}</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-semibold">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Current & Next Prayer Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Prayer Card */}
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Current Prayer</h3>
                </div>
                <Badge className="bg-primary">Active</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{currentPrayer}</p>
                <p className="text-sm text-muted-foreground">
                  {todayPrayers[currentPrayer.toLowerCase()]}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Prayer Card with Countdown */}
          <Card className="border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-500/5 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Next Prayer</h3>
                </div>
                <Badge variant="secondary">Upcoming</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{nextPrayer}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {todayPrayers[nextPrayer.toLowerCase()]}
                </p>
                <div className="bg-background/50 rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
                  <p className="text-2xl font-mono font-bold text-orange-600">{countdown}</p>
                </div>
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
                        {idx === 0 && (
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
                    idx === 0 && "border-primary bg-primary/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{day.date_for}</span>
                      {idx === 0 && (
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