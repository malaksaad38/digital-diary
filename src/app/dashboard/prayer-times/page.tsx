"use client"
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
  Sunset,
  Edit2, EditIcon,
} from 'lucide-react';

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
  const [city, setCity] = useState('timergara');
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [tempCity, setTempCity] = useState('timergara');

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
    return () => clearInterval(timer);
  }, [city]);

  // Make convertTo24Hour robust: trim, lower-case modifier, accept "AM"/"am" etc.
  const convertTo24Hour = (time12h) => {
    if (!time12h || typeof time12h !== 'string') return null;
    const str = time12h.trim();
    // Expecting formats like "4:30 am" or "04:30 PM"
    const parts = str.split(' ');
    if (parts.length < 2) return null;
    const time = parts[0];
    const modifier = parts[1].toLowerCase();

    let [hours, minutes] = time.split(':');
    hours = hours.replace(/^0+/, '') || '0'; // remove leading zero safely
    if (hours === '12' && modifier === 'am') hours = '00';
    else if (modifier === 'pm' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
    // pad
    hours = hours.toString().padStart(2, '0');
    minutes = (minutes || '00').padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const calculateCountdown = (target) => {
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return '00h 00m 00s';
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

    // if no nextTime found -> it's after Isha, next is Fajr of next day
    if (!nextTime) {
      // try to get the next day's fajr from prayerData.items[1] if available
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

    // build nextDate
    if (nextTime) {
      const nextDate = new Date();
      nextDate.setHours(nextTime.h, nextTime.m, 0, 0);
      if (nextIsNextDay) {
        // ensure it's tomorrow
        nextDate.setDate(nextDate.getDate() + 1);
      } else {
        // if nextDate is <= now, push to next day (safety)
        if (nextDate.getTime() <= now.getTime()) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
      }
      setCountdown(calculateCountdown(nextDate));
    } else {
      setCountdown('00h 00m 00s');
    }

    // Qaza time logic:
    // If current is Fajr -> qaza is shurooq (sunrise). Otherwise qaza is the next prayer's time.
    let qazaTimeStr;
    if (current === 'Fajr') qazaTimeStr = today.shurooq;
    else {
      const idx = prayers.findIndex(p => p.name === current);
      const endIdx = idx + 1 < prayers.length ? idx + 1 : 0;
      qazaTimeStr = prayers[endIdx].time;
    }

    const qConv = convertTo24Hour(qazaTimeStr);
    if (qConv) {
      const [qh, qm] = qConv.split(':').map(Number);
      const qazaDate = new Date();
      qazaDate.setHours(qh, qm, 0, 0);
      // if qazaDate is in the past (earlier today), it must be tomorrow
      if (qazaDate.getTime() <= now.getTime()) qazaDate.setDate(qazaDate.getDate() + 1);
      setQazaCountdown(calculateCountdown(qazaDate));
    } else {
      setQazaCountdown('00h 00m 00s');
    }

    setCurrentPrayer(current);
    setNextPrayer(next);
  }, [prayerData, currentTime]);

  const handleCitySubmit = (e) => {
    e.preventDefault();
    setCity(tempCity.toLowerCase());
    setShowCityDialog(false);
    fetchPrayerTimes(true);
  };

  const prayers = [
    { name: 'Fajr', key: 'fajr', icon: Sunrise },
    { name: 'Dhuhr', key: 'dhuhr', icon: Sun },
    { name: 'Asr', key: 'asr', icon: CloudSun },
    { name: 'Maghrib', key: 'maghrib', icon: Sunset },
    { name: 'Isha', key: 'isha', icon: Moon }
  ];

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
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => fetchPrayerTimes(true)}
            className="w-full px-4 py-2 bg-primary text-foreground rounded-md hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!prayerData || !prayerData.items || prayerData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-center text-muted-foreground">No prayer times available</p>
      </div>
    );
  }

  const today = prayerData.items[0];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Prayer Times</h1>
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{prayerData.city}, {prayerData.country}</span>
            <button
              onClick={() => {
                setTempCity(city);
                setShowCityDialog(true);
              }}
              className="ml-2 p-1"
            >
              <EditIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {today.date_for}
            </div>
            <div className="font-mono text-lg font-semibold">
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </div>
          </div>
        </div>

        {/* Current & Next Prayer */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Current Prayer
              </h3>
              <span className="px-2 py-1 bg-blue-600 text-foreground text-xs rounded">Active</span>
            </div>
            <p className="text-3xl font-bold mb-2">{currentPrayer}</p>
            <p className="text-muted-foreground mb-4">{today[currentPrayer.toLowerCase()]}</p>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground mb-1">Qaza Time Remaining</p>
              <p className="text-xl font-mono font-bold text-blue-600">{qazaCountdown}</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Timer className="w-5 h-5 text-green-600" />
                Next Prayer
              </h3>
              <span className="px-2 py-1 bg-green-600 text-foreground text-xs rounded">Upcoming</span>
            </div>
            <p className="text-3xl font-bold mb-2">{nextPrayer}</p>
            <p className="text-muted-foreground mb-4">{today[nextPrayer.toLowerCase()]}</p>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
              <p className="text-xl font-mono font-bold text-green-600">{countdown || "00h 00m 00s"} </p>
            </div>
          </div>
        </div>

        {/* Today's Prayers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {prayers.map((prayer) => {
              const Icon = prayer.icon;
              const isCurrent = currentPrayer === prayer.name;
              const isNext = nextPrayer === prayer.name;

              return (
                <div
                  key={prayer.key}
                  className={`p-4 rounded-lg text-center border-2 transition-all ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300'
                      : isNext
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
                        : 'bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    isCurrent ? 'text-blue-600' : isNext ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <p className="font-semibold mb-1">{prayer.name}</p>
                  <p className="text-xl font-mono font-bold">{today[prayer.key]}</p>
                  {isCurrent && <p className="text-xs text-blue-600 mt-1">Now</p>}
                  {isNext && <p className="text-xs text-green-600 mt-1">Next</p>}
                </div>
              );
            })}
          </div>

          {/* Sunrise */}
          <div className="mt-6 pt-4 border-t flex justify-center">
            <div className="flex items-center gap-2 text-sm">
              <Sunrise className="w-4 h-4 text-orange-500" />
              <span className="text-muted-foreground">Sunrise (Shurooq):</span>
              <span className="font-mono font-semibold">{today.shurooq}</span>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">7-Day Schedule</h2>
          <div className="space-y-3">
            {prayerData.items.map((day, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  idx === 0
                    ? 'bg-primary/5 border-primary/40'
                    : 'bg-gray-50 dark:bg-gray-700/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{day.date_for}</span>
                  {idx === 0 && (
                    <span className="px-2 py-1 bg-foreground text-background text-xs rounded">
                      Today
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
                  {prayers.map(prayer => (
                    <div key={prayer.key}>
                      <p className="text-xs text-muted-foreground mb-1">{prayer.name}</p>
                      <p className="font-mono font-semibold">{day[prayer.key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <button
            onClick={() => fetchPrayerTimes(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh from API
          </button>
          {isFromCache && (
            <p className="text-xs text-muted-foreground text-center">
              Data loaded from cache • Will refresh automatically tomorrow
            </p>
          )}
        </div>
      </div>

      {/* City Dialog */}
      {showCityDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Enter Your City</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please type your city name in lowercase letters.
            </p>
            <form onSubmit={handleCitySubmit} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. lahore"
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value.toLowerCase())}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCityDialog(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-foreground  text-background rounded-md hover:bg-primary/90"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
