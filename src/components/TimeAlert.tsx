'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import {BanIcon, HelpCircle, LucideBadgeHelp} from "lucide-react";

const TimeAlert = () => {
    const [prayerData, setPrayerData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPrayer, setCurrentPrayer] = useState("");
    const [nextPrayer, setNextPrayer] = useState("");
    const [countdown, setCountdown] = useState("");

    const [makruh, setMakruh] = useState<{
        label: string;
        endsAt: Date;
    } | null>(null);

    const [city] = useState(() => {
        try {
            return localStorage.getItem("userCity") || "timergara";
        } catch {
            return "timergara";
        }
    });

    // -----------------------
    // FETCH PRAYER TIMES
    // -----------------------
    const fetchPrayerTimes = async () => {
        setLoading(true);
        try {
            const proxy = "https://api.allorigins.win/raw?url=";
            const apiUrl = `https://muslimsalat.com/${encodeURIComponent(
                city
            )}/weekly.json?key=b2015473db5fff96e4d4f2fd2ad84e1c`;

            const res = await fetch(proxy + encodeURIComponent(apiUrl));
            const data = await res.json();

            if (!res.ok || data?.error) throw new Error("Failed to fetch");

            setPrayerData(data);
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

    // -----------------------
    // TIME HELPERS
    // -----------------------
    const convertTo24 = (time: string) => {
        const [t, m] = time.split(" ");
        let [h, min] = t.split(":");

        if (h === "12") h = "00";
        if (m === "pm") h = String(Number(h) + 12);

        return `${h.padStart(2, "0")}:${min}`;
    };

    const buildDate = (time: string) => {
        const [h, m] = convertTo24(time).split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };

    // -----------------------
    // CURRENT & NEXT PRAYER
    // -----------------------
    useEffect(() => {
        if (!prayerData?.items?.[0]) return;

        const today = prayerData.items[0];
        const now = currentTime.getTime();

        const prayers = [
            { name: "Fajr", time: today.fajr },
            { name: "Sunrise", time: today.shurooq },
            { name: "Dhuhr", time: today.dhuhr },
            { name: "Asr", time: today.asr },
            { name: "Maghrib", time: today.maghrib },
            { name: "Isha", time: today.isha },
        ];

        let next = prayers[0];
        let current = prayers[5];

        for (let i = 0; i < prayers.length; i++) {
            const t = buildDate(prayers[i].time).getTime();
            if (now < t) {
                next = prayers[i];
                current = prayers[i - 1] || prayers[5];
                break;
            }
        }

        const diff = buildDate(next.time).getTime() - now;
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);

        setCountdown(`${hh}h ${mm}m ${ss}s`);
        setCurrentPrayer(current.name);
        setNextPrayer(next.name);
    }, [prayerData, currentTime]);

    // -----------------------
    // MAKRUH TIME LOGIC (15 MIN)
    // -----------------------
    useEffect(() => {
        if (!prayerData?.items?.[0]) return;

        const today = prayerData.items[0];
        const now = currentTime.getTime();

        const sunrise = buildDate(today.shurooq);
        const dhuhr = buildDate(today.dhuhr);
        const maghrib = buildDate(today.maghrib);

        // 1️⃣ 15 min after sunrise
        if (
            now >= sunrise.getTime() &&
            now < sunrise.getTime() + 15 * 60 * 1000
        ) {
            setMakruh({
                label: "Makruh time (after Sunrise)",
                endsAt: new Date(sunrise.getTime() + 15 * 60 * 1000),
            });
            return;
        }

        // 2️⃣ 15 min before Dhuhr
        if (
            now >= dhuhr.getTime() - 15 * 60 * 1000 &&
            now < dhuhr.getTime()
        ) {
            setMakruh({
                label: "Makruh time (before Dhuhr)",
                endsAt: dhuhr,
            });
            return;
        }

        // 3️⃣ 15 min before Maghrib
        if (
            now >= maghrib.getTime() - 15 * 60 * 1000 &&
            now < maghrib.getTime()
        ) {
            setMakruh({
                label: "Makruh time (before Maghrib)",
                endsAt: maghrib,
            });
            return;
        }

        setMakruh(null);
    }, [prayerData, currentTime]);

    // -----------------------
    // MAKRUH COUNTDOWN
    // -----------------------
    const makruhCountdown = makruh
        ? (() => {
            const diff = makruh.endsAt.getTime() - currentTime.getTime();
            const mm = Math.floor(diff / 60000);
            const ss = Math.floor((diff % 60000) / 1000);
            return `${mm}m ${ss}s`;
        })()
        : null;

    // -----------------------
    // UI
    // -----------------------
    return (
        <div className={`flex justify-center ${makruh ? "block" : "hidden"}`}>
            {makruh && (
                <Badge variant="destructive" className={"rounded-none w-full"}>
                   <BanIcon/> {makruh.label} — Ends in {makruhCountdown}
                </Badge>
            )}
        </div>
    );
};

export default TimeAlert;
