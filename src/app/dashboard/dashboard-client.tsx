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
  const [loading, setLoading] = useState<boolean>(true); // <-- loading state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>("");

  useEffect(() => {
    // Fetch prayer times
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true); // start loading
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = 'https://muslimsalat.com/timergara.json?key=b2015473db5fff96e4d4f2fd2ad84e1c';
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        const data = await response.json();
        if (data && data.items && data.items[0]) {
          setPrayerData(data.items[0]);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoading(false); // end loading
      }
    };

    fetchPrayerTimes();

    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerData) {
      const getCurrentPrayer = () => {
        const now = currentTime.toLocaleTimeString('en-US', { hour12: false });
        const prayers = [
          { name: 'Fajr', time: prayerData.fajr },
          { name: 'Dhuhr', time: prayerData.dhuhr },
          { name: 'Asr', time: prayerData.asr },
          { name: 'Maghrib', time: prayerData.maghrib },
          { name: 'Isha', time: prayerData.isha }
        ];

        for (let prayer of prayers) {
          const prayerTime24 = convertTo24Hour(prayer.time);
          if (now < prayerTime24) {
            return prayer.name;
          }
        }
        return 'Fajr';
      };

      setNextPrayer(getCurrentPrayer());
    }
  }, [prayerData, currentTime]);

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') hours = '00';
    if (modifier === 'pm') hours = (parseInt(hours, 10) + 12).toString();

    return `${hours.padStart(2, '0')}:${minutes}:00`;
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

        {/* Current Prayer Time Badge */}
        {loading ? (
          <div className="animate-pulse px-4 py-2 bg-gray-200 rounded-md w-36 h-16" />
        ) : (
          prayerData && (
            <Link href="/dashboard/prayer-times">
              <CardContent className="px-2">
                <div className="flex items-center gap-3">
                  <Sunrise className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Next Prayer</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{nextPrayer}</p>
                      <Badge variant="secondary" className="text-xs">
                        {prayerData[nextPrayer.toLowerCase()]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
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
                          "text-center py-2 px-2 rounded-md transition-colors ",
                          nextPrayer === prayer
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-background text-foreground"
                        )}
                      >
                        <p className="text-xs">{prayer}</p>
                        <p className="text-sm font-mono">{prayerData[prayer.toLowerCase()]}</p>
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
