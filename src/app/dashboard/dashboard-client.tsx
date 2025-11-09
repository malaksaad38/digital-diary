"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notebook, BarChart3, Settings, Edit3, Clock, Sunrise } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function DashboardClient({ user }: { user: any }) {
  const pathname = usePathname();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);

        // Check localStorage first
        const cachedData = localStorage.getItem('prayerTimesData');
        const cacheDate = localStorage.getItem('prayerTimesCacheDate');
        const today = new Date().toDateString();

        // If cached data exists and is from today, use it
        if (cachedData && cacheDate === today) {
          setPrayerData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Otherwise, fetch from API
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = 'https://muslimsalat.com/timergara.json?key=b2015473db5fff96e4d4f2fd2ad84e1c';
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        const data = await response.json();

        if (data && data.items && data.items[0]) {
          const prayerInfo = data.items[0];
          setPrayerData(prayerInfo);

          // Store in localStorage
          localStorage.setItem('prayerTimesData', JSON.stringify(prayerInfo));
          localStorage.setItem('prayerTimesCacheDate', today);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();

    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerData) {
      const getCurrentAndNextPrayer = () => {
        const now = currentTime;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentSeconds = now.getSeconds();

        const prayers = [
          { name: 'Fajr', time: prayerData.fajr },
          { name: 'Dhuhr', time: prayerData.dhuhr },
          { name: 'Asr', time: prayerData.asr },
          { name: 'Maghrib', time: prayerData.maghrib },
          { name: 'Isha', time: prayerData.isha }
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

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') hours = '00';
    if (modifier === 'pm') hours = (parseInt(hours, 10) + 12).toString();

    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const cards = [
    { title: "Prayer Times", icon: Clock, href: "/dashboard/prayer-times" },
    { title: "Prayer Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { title: "My Entries", icon: Edit3, href: "/dashboard/entry" },
    { title: "My Diaries", icon: Notebook, href: "/dashboard/diary" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        {/* Current & Next Prayer Badge */}
        {loading ? (
          <div className="animate-pulse px-4 py-2 bg-gray-200 rounded-md w-48 h-20" />
        ) : (
          prayerData && (
            <Link href="/dashboard/prayer-times">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Current:</span>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {currentPrayer}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-4 h-4 text-primary" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Next:</span>
                        <Badge className="text-xs font-semibold">
                          {nextPrayer}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {prayerData[nextPrayer.toLowerCase()]}
                        </span>
                      </div>
                    </div>
                    <div className="text-center pt-1 border-t">
                      <p className="text-lg font-mono font-bold text-primary">{countdown}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        )}
      </div>

      {/* Prayer Times Banner */}
      {loading ? (
        <div className="animate-pulse h-24 w-full bg-gray-200 rounded-lg" />
      ) : (
        prayerData && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-background shadow-md rounded-lg">
              <CardContent className="py-4 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Today's Prayer Times</h3>
                    <p className="text-sm text-muted-foreground">{prayerData.date_for}</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full sm:w-auto">
                    {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                      <div
                        key={prayer}
                        className={cn(
                          "text-center py-2 px-2 rounded-md transition-colors",
                          currentPrayer === prayer
                            ? "bg-primary/20 border-2 border-primary text-foreground font-semibold"
                            : nextPrayer === prayer
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-xs">{prayer}</p>
                        <p className="text-sm font-mono">{prayerData[prayer.toLowerCase()]}</p>
                        {currentPrayer === prayer && (
                          <Badge variant="secondary" className="text-[10px] mt-1">Now</Badge>
                        )}
                        {nextPrayer === prayer && currentPrayer !== prayer && (
                          <Badge variant="secondary" className="text-[10px] mt-1">Next</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      )}

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href} className="group">
                <Card
                  className={cn(
                    "hover:shadow-lg hover:-translate-y-1 transition cursor-pointer rounded-2xl",
                    isActive ? "border-2 border-primary bg-primary/10" : ""
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{item.title}</CardTitle>
                    <item.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage {item.title.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}