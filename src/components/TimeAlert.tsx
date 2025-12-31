'use client'
import React, {useEffect, useState} from 'react';
import {Badge} from "@/components/ui/badge";

const TimeAlert = () => {
    const [prayerData, setPrayerData] = useState<any>(null);
    const [isFromCache, setIsFromCache] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState("");
    const [currentPrayer, setCurrentPrayer] = useState("");
    const [countdown, setCountdown] = useState("");

    const [city, setCity] = useState(() => {
        try {
            return localStorage.getItem('userCity') || "timergara";
        } catch {
            return "timergara";
        }
    });
    const fetchPrayerTimes = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const cacheKey = "prayerTimes";
            const cacheDateKey = "prayerDate";
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
            const apiUrl = `https://muslimsalat.com/${encodeURIComponent(city)}/weekly.json?key=b2015473db5fff96e4d4f2fd2ad84e1c`;
            const res = await fetch(proxy + encodeURIComponent(apiUrl), {
                signal: AbortSignal.timeout(10000)
            });
            const data = await res.json();

            if (!res.ok || data.error) throw new Error(data.error || "Failed to fetch");

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

    const convertTo24 = (time: string) => {
        if (!time) return "00:00";
        const [t, m] = time.split(" ");
        let [h, min] = t.split(":");
        if (h === "12") h = "00";
        if (m === "pm") h = String(parseInt(h) + 12);
        return `${h.padStart(2, "0")}:${min}`;
    };

    useEffect(() => {
        if (!prayerData?.items?.[0]) return;
        const today = prayerData.items[0];
        const now = currentTime;
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const list = [
            {n: "Fajr", t: today.fajr},
            {n: "Dhuhr", t: today.dhuhr},
            {n: "Asr", t: today.asr},
            {n: "Maghrib", t: today.maghrib},
            {n: "Isha", t: today.isha},
        ];

        let next = list[0],
            current = list[4];
        for (let i = 0; i < list.length; i++) {
            const [h, m] = convertTo24(list[i].t).split(":").map(Number);
            if (nowMins < h * 60 + m) {
                next = list[i];
                current = list[i - 1] || list[4];
                break;
            }
        }

        const nextDate = new Date();
        const [h, m] = convertTo24(next.t).split(":").map(Number);
        nextDate.setHours(h, m, 0, 0);
        if (next === list[0] && nowMins > h * 60 + m) nextDate.setDate(nextDate.getDate() + 1);

        const diff = nextDate.getTime() - now.getTime();
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 3600000) / 1200 % 60  );
        setCountdown(`${hh}h ${mm}m ${ss}s`);
        setNextPrayer(next.n);
        setCurrentPrayer(current.n);
    }, [prayerData, currentTime])

    return (
        <div className={"bg-red-400 z-40"}>
            <div className="flex items-center justify-between">
                <Badge variant="secondary"
                       className="text-[10px] md:text-base px-2 py-1 rou ">Now: {currentPrayer || "Prayer"}
                </Badge>
                <Badge variant="secondary"
                       className="text-[10px] md:text-base px-2 py-1 ">Next: {nextPrayer || "Prayer"} {countdown || "00:00"}</Badge>
            </div>

        </div>
    );
};

export default TimeAlert;