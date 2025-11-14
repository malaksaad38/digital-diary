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
  Timer,
  Sunset,
  Edit2,
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
  }, [city]);

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
    if (diff <= 0) return 'Time Over';
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
      setQazaCountdown('Time Over');
    } else {
      const qConv = convertTo24Hour(qazaTimeStr);
      if (qConv) {
        const [qh, qm] = qConv.split(':').map(Number);
        const qazaDate = new Date();
        qazaDate.setHours(qh, qm, 0, 0);

        if (qazaDate.getTime() <= now.getTime()) {
          setQazaCountdown('Time Over');
        } else {
          setQazaCountdown(calculateCountdown(qazaDate));
        }
      } else {
        setQazaCountdown('Time Over');
      }
    }

    setCurrentPrayer(current);
    setNextPrayer(next);
  }, [prayerData, currentTime]);

  const handleCitySubmit = () => {
    if (tempCity.trim()) {
      setCity(tempCity.toLowerCase().trim());
      setShowCityDialog(false);
      fetchPrayerTimes(true);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">Loading Prayer times...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h3 className="font-bold text-xl text-center mb-2">Error Loading Data</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">{error}</p>
          <button
            onClick={() => fetchPrayerTimes(true)}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
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
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-4">

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Prayer Times
          </h1>
          <div className="flex justify-center items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{prayerData.city}, {prayerData.country}</span>
              <button
                onClick={() => {
                  setTempCity(city);
                  setShowCityDialog(true);
                }}
                className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Change city"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">{today.date_for}</span>
            </div>
            <div className="font-mono text-2xl font-bold bg-white/80 dark:bg-gray-800/80 px-6 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                Current Prayer
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                Active
              </span>
            </div>
            <p className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">{currentPrayer}</p>
            <p className="text-lg text-muted-foreground mb-6 font-medium">{today[currentPrayer.toLowerCase()]}</p>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Qaza Time Remaining</p>
              <p className={`text-2xl font-mono font-bold ${qazaCountdown === 'Time Over' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {qazaCountdown}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {currentPrayer === 'Fajr' ? 'Ends at Sunrise (Shurooq)' : `Ends at ${nextPrayer} time`}
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Timer className="w-5 h-5 text-green-600" />
                </div>
                Next Prayer
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full shadow-sm">
                Upcoming
              </span>
            </div>
            <p className="text-4xl font-bold mb-2 text-green-600 dark:text-green-400">{nextPrayer}</p>
            <p className="text-lg text-muted-foreground mb-6 font-medium">{today[nextPrayer.toLowerCase()]}</p>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Time Remaining</p>
              <p className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">{countdown || "00h 00m 00s"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            Today's Schedule
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {prayers.map((prayer) => {
              const Icon = prayer.icon;
              const isCurrent = currentPrayer === prayer.name;
              const isNext = nextPrayer === prayer.name;

              return (
                <div
                  key={prayer.key}
                  className={`py-4 px-2 rounded-xl text-center border-2 transition-all duration-300 hover:scale-105 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-400 shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                      : isNext
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400 shadow-lg shadow-green-200 dark:shadow-green-900/50'
                        : 'bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`inline-flex p-3 rounded-lg mb-3 ${
                    isCurrent ? 'bg-blue-100 dark:bg-blue-900/50' :
                      isNext ? 'bg-green-100 dark:bg-green-900/50' :
                        'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      isCurrent ? 'text-blue-600' : isNext ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <p className="font-bold mb-2 text-lg">{prayer.name}</p>
                  <p className="text-xl font-mono font-bold">{today[prayer.key]}</p>
                  {isCurrent && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      Now
                    </span>
                  )}
                  {isNext && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                      Next
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex justify-center">
              <div className="flex items-center gap-3 px-5 py-3 rounded-full border bg-gradient-to-r
      from-orange-50 to-amber-50
      dark:from-orange-900/20 dark:to-amber-900/20
      border-orange-200 dark:border-orange-800 shadow-sm">

                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                  <Sunrise className="w-5 h-5 text-orange-600" />
                </div>

                <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
        Sunrise (Shurooq):
      </span>

                <span className="font-mono font-semibold text-orange-600 text-sm">
        {today.shurooq}
      </span>

              </div>
            </div>
          </div>

        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            7-Day Schedule
          </h2>
          <div className="space-y-4">
            {prayerData.items.map((day, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                  idx === 0
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-300 dark:border-indigo-700 shadow-md'
                    : 'bg-gray-50/50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg">{day.date_for}</span>
                  {idx === 0 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-sm">
                      Today
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
                  {prayers.map(prayer => (
                    <div key={prayer.key} className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{prayer.name}</p>
                      <p className="font-mono font-bold text-base">{day[prayer.key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 pb-4">
          <button
            onClick={() => fetchPrayerTimes(true)}
            className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg flex items-center gap-2 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh from API
          </button>
          {isFromCache && (
            <p className="text-sm text-muted-foreground text-center  px-4 py-2 ">
              📦 Data loaded from cache • Auto-refreshes daily
            </p>
          )}
        </div>
      </div>

      {showCityDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Enter Your City</h3>
              <p className="text-sm text-muted-foreground">
                Please type your city name in lowercase letters.
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="e.g. lahore, karachi, islamabad"
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value.toLowerCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCitySubmit();
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 transition-all"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCityDialog(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCitySubmit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}