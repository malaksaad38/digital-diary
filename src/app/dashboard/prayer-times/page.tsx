'use client'
import React, { useState, useEffect } from 'react';
import {Clock, Calendar, MapPin, AlertCircle, RefreshCw, Sunrise, Moon, Sun, CloudSun, Loader2} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from "@/components/Breadcrumbs";

export default function PrayerTimes() {
  const [prayerData, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError(null);

    try {
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

      setData(data);
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

  const getCurrentPrayer = (prayers) => {
    const now = currentTime.toLocaleTimeString('en-US', { hour12: false });
    const prayerList = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    for (let i = 0; i < prayerList.length; i++) {
      const prayerTime = convertTo24Hour(prayers[prayerList[i]]);
      if (now < prayerTime) {
        return prayerList[i];
      }
    }
    return 'isha';
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
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
              onClick={fetchPrayerTimes}
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
    { name: 'Fajr', key: 'fajr', icon: Sunrise },
    { name: 'Dhuhr', key: 'dhuhr', icon: Sun },
    { name: 'Asr', key: 'asr', icon: CloudSun },
    { name: 'Maghrib', key: 'maghrib', icon: Sunrise },
    { name: 'Isha', key: 'isha', icon: Moon }
  ];

  const todayPrayers = prayerData.items[0];
  const nextPrayer = getCurrentPrayer(todayPrayers);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Breadcrumbs/>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Prayer Times</h1>
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

        {/* Today's Prayer Times */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {prayers.map((prayer) => {
                const Icon = prayer.icon;
                const isNext = nextPrayer === prayer.key;

                return (
                  <div
                    key={prayer.key}
                    className={`p-4 rounded-lg border ${isNext ? 'border-primary bg-accent' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{prayer.name}</span>
                      {isNext && <Badge variant="default" className="ml-auto text-xs">Next</Badge>}
                    </div>
                    <p className="text-2xl font-bold font-mono">
                      {todayPrayers[prayer.key]}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Sunrise className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Sunrise</p>
                  <p className="text-xl font-bold font-mono">{todayPrayers.shurooq}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Calculation Method</p>
                <p className="text-sm">{prayerData.prayer_method_name}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Schedule</CardTitle>
            <CardDescription>Prayer times for the week</CardDescription>
          </CardHeader>
          <CardContent>
            {/* For mobile: horizontal scroll */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[600px] text-sm border-collapse">
                <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Date</th>
                  {prayers.map(prayer => (
                    <th
                      key={prayer.key}
                      className="text-center py-3 px-2 font-medium whitespace-nowrap"
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
                    className={`border-b ${idx === 0 ? 'bg-accent' : ''}`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <Badge variant="outline" className="text-xs">
                            Today
                          </Badge>
                        )}
                        <span>{day.date_for}</span>
                      </div>
                    </td>
                    {prayers.map(prayer => (
                      <td
                        key={prayer.key}
                        className="text-center py-3 px-2 font-mono whitespace-nowrap"
                      >
                        {day[prayer.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Optional: stacked view for very small screens */}
            <div className="mt-4 space-y-2 sm:hidden ">
              {prayerData.items.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg ${idx === 0 ? 'bg-accent' : 'bg-card'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{day.date_for}</span>
                    {idx === 0 && <Badge variant="outline" className="text-xs">Today</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {prayers.map(prayer => (
                      <div key={prayer.key} className="text-center font-mono text-sm">
                        <div className="font-medium">{prayer.name}</div>
                        <div>{day[prayer.key]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            onClick={fetchPrayerTimes}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}