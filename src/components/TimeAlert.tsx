'use client';

import React, {useEffect, useState} from 'react';
import {Badge} from "@/components/ui/badge";
import {BanIcon} from "lucide-react";

const TimeAlert = () => {
    const [prayerData, setPrayerData] = useState<any>(null);
    const currentTime = new Date()
    const [makruh, setMakruh] = useState<{
        label: string;
        endsAt: Date;
    } | null>(null);

    // -----------------------
    // FETCH PRAYER TIMES
    // -----------------------
    useEffect(() => {
        const data = localStorage.getItem("prayertimes");
        setPrayerData(data);
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
