"use client"
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Sunrise, Sunset, Compass } from 'lucide-react';

const PrayerTimesApp = () => {
  const [prayerData, setPrayerData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('today');
  const [error, setError] = useState(null);

  const API_KEY = 'b2015473db5fff96e4d4f2fd2ad84e1c';
  const CITY = 'timergara';

  useEffect(() => {
    fetchPrayerTimes();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerData && prayerData.items && prayerData.items[0]) {
      updateCurrentPrayer();
    }
  }, [currentTime, prayerData]);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      const todayResponse = await fetch(
        `https://muslimsalat.com/${CITY}.json?key=${API_KEY}`
      );
      const todayData = await todayResponse.json();

      const weeklyResponse = await fetch(
        `https://muslimsalat.com/${CITY}/weekly.json?key=${API_KEY}`
      );
      const weeklyDataJson = await weeklyResponse.json();

      if (todayData.status_valid === 1 || todayData.status_code === 1) {
        setPrayerData(todayData);
      } else {
        setError('Unable to fetch prayer times. Please check your location.');
      }

      if (weeklyDataJson.status_valid === 1 || weeklyDataJson.status_code === 1) {
        setWeeklyData(weeklyDataJson);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load prayer times. Please check your internet connection.');
      setLoading(false);
    }
  };

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);

    if (modifier === 'pm' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'am' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + parseInt(minutes);
  };

  const updateCurrentPrayer = () => {
    if (!prayerData || !prayerData.items || !prayerData.items[0]) return;

    const todayPrayers = prayerData.items[0];
    const prayers = [
      { name: 'Fajr', time: todayPrayers.fajr },
      { name: 'Dhuhr', time: todayPrayers.dhuhr },
      { name: 'Asr', time: todayPrayers.asr },
      { name: 'Maghrib', time: todayPrayers.maghrib },
      { name: 'Isha', time: todayPrayers.isha }
    ];

    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    let current = null;
    let next = null;

    for (let i = 0; i < prayers.length; i++) {
      const prayerMinutes = convertTo24Hour(prayers[i].time);

      if (now < prayerMinutes) {
        next = prayers[i];
        if (i > 0) {
          current = prayers[i - 1];
        }
        break;
      }
    }

    if (!next) {
      current = prayers[prayers.length - 1];
      next = prayers[0];
    }

    setCurrentPrayer(current);
    setNextPrayer(next);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading prayer times...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-white text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={fetchPrayerTimes}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const todayPrayers = prayerData?.items?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-6 h-6" />
            <h1 className="text-4xl font-bold">Prayer Times</h1>
          </div>
          <p className="text-2xl text-blue-200 mb-1">{prayerData?.title || 'Timergara, Pakistan'}</p>
          <p className="text-sm text-blue-300">{prayerData?.state}, {prayerData?.country}</p>
          <p className="text-xs text-blue-300 mt-2">Method: {prayerData?.prayer_method_name}</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-2xl">
            <Clock className="w-6 h-6" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Qibla Direction */}
        {prayerData?.qibla_direction && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 text-white text-center">
            <div className="flex items-center justify-center gap-2">
              <Compass className="w-5 h-5" />
              <span className="text-lg">Qibla Direction: <strong>{prayerData.qibla_direction}°</strong></span>
            </div>
          </div>
        )}

        {/* Current Prayer Status */}
        {nextPrayer && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 mb-6 text-white text-center border-2 border-green-400/50">
            <div className="text-lg mb-2">Next Prayer</div>
            <div className="text-5xl font-bold mb-2">{nextPrayer.name}</div>
            <div className="text-3xl text-green-200">{nextPrayer.time}</div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-lg p-2 rounded-xl">
          <button
            onClick={() => setView('today')}
            className={`flex-1 py-3 rounded-lg transition ${
              view === 'today'
                ? 'bg-white text-purple-900 font-semibold'
                : 'text-white hover:bg-white/20'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`flex-1 py-3 rounded-lg transition ${
              view === 'weekly'
                ? 'bg-white text-purple-900 font-semibold'
                : 'text-white hover:bg-white/20'
            }`}
          >
            Weekly
          </button>
        </div>

        {/* Today's Prayer Times */}
        {view === 'today' && todayPrayers && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 text-white">
              <Calendar className="w-5 h-5" />
              <h2 className="text-xl font-semibold">
                {formatDate(todayPrayers.date_for)}
              </h2>
            </div>

            {/* Sunrise Info */}
            <div className="bg-yellow-500/20 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sunrise className="w-6 h-6 text-yellow-300" />
                <span className="text-lg font-semibold text-white">Sunrise (Shurooq)</span>
              </div>
              <span className="text-xl font-bold text-white">{todayPrayers.shurooq}</span>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Fajr', time: todayPrayers.fajr, icon: Sunrise },
                { name: 'Dhuhr', time: todayPrayers.dhuhr },
                { name: 'Asr', time: todayPrayers.asr },
                { name: 'Maghrib', time: todayPrayers.maghrib, icon: Sunset },
                { name: 'Isha', time: todayPrayers.isha }
              ].map((prayer) => {
                const Icon = prayer.icon;
                const isNext = nextPrayer?.name === prayer.name;
                const isCurrent = currentPrayer?.name === prayer.name;

                return (
                  <div
                    key={prayer.name}
                    className={`flex items-center justify-between p-5 rounded-xl transition ${
                      isNext
                        ? 'bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20'
                        : isCurrent
                          ? 'bg-blue-500/20 border-2 border-blue-400'
                          : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="w-6 h-6 text-yellow-300" />}
                      <span className="text-2xl font-semibold text-white">
                        {prayer.name}
                      </span>
                      {isNext && (
                        <span className="text-xs bg-green-500 px-3 py-1 rounded-full text-white font-bold">
                          NEXT
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs bg-blue-500 px-3 py-1 rounded-full text-white font-bold">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-3xl font-bold text-white">
                      {prayer.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Prayer Times */}
        {view === 'weekly' && weeklyData?.items && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-6 text-white">
              Weekly Schedule
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white min-w-max">
                <thead>
                <tr className="border-b-2 border-white/30">
                  <th className="text-left py-4 px-3 font-bold">Date</th>
                  <th className="text-center py-4 px-3 font-bold">Fajr</th>
                  <th className="text-center py-4 px-3 font-bold">Sunrise</th>
                  <th className="text-center py-4 px-3 font-bold">Dhuhr</th>
                  <th className="text-center py-4 px-3 font-bold">Asr</th>
                  <th className="text-center py-4 px-3 font-bold">Maghrib</th>
                  <th className="text-center py-4 px-3 font-bold">Isha</th>
                </tr>
                </thead>
                <tbody>
                {weeklyData.items.map((day, idx) => {
                  const isToday = day.date_for === todayPrayers?.date_for;
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-white/10 ${
                        isToday ? 'bg-blue-500/30 border-blue-400' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="py-4 px-3 font-semibold">
                        {formatDate(day.date_for)}
                        {isToday && (
                          <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded-full">
                              TODAY
                            </span>
                        )}
                      </td>
                      <td className="text-center py-4 px-3 font-medium">
                        {day.fajr}
                      </td>
                      <td className="text-center py-4 px-3 font-medium text-yellow-300">
                        {day.shurooq}
                      </td>
                      <td className="text-center py-4 px-3 font-medium">
                        {day.dhuhr}
                      </td>
                      <td className="text-center py-4 px-3 font-medium">
                        {day.asr}
                      </td>
                      <td className="text-center py-4 px-3 font-medium">
                        {day.maghrib}
                      </td>
                      <td className="text-center py-4 px-3 font-medium">
                        {day.isha}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center text-white/60 text-sm">
          <p>Coordinates: {prayerData?.latitude}, {prayerData?.longitude}</p>
          <p>Sea Level: {prayerData?.sealevel}m | Timezone: UTC+{prayerData?.timezone}</p>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesApp;