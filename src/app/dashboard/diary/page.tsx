"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, CalendarDays, BookOpen, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Prayer {
  _id: string;
  date: string;
  fajr: string;
  zuhr: string;
  asar: string;
  maghrib: string;
  esha: string;
  recite?: string;
  zikr?: string;
}

export default function PrayersPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayers = async () => {
      const res = await fetch("/api/prayers");
      const data = await res.json();
      setPrayers(data);
      setLoading(false);
    };
    fetchPrayers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" /> My Prayers
      </h1>

      {prayers.length === 0 ? (
        <p className="text-muted-foreground text-center mt-10">No prayer data found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {prayers.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {p.date}
                  </CardTitle>
                  <Badge variant="outline">Recorded</Badge>
                </CardHeader>

                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <PrayerField name="Fajr" value={p.fajr} />
                    <PrayerField name="Zuhr" value={p.zuhr} />
                    <PrayerField name="Asar" value={p.asar} />
                    <PrayerField name="Maghrib" value={p.maghrib} />
                    <PrayerField name="Esha" value={p.esha} />
                  </div>

                  {p.recite && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Recitation: {p.recite}</span>
                    </div>
                  )}
                  {p.zikr && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Zikr: {p.zikr}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrayerField({ name, value }: { name: string; value: string }) {
  const color =
    value === "Missed"
      ? "bg-destructive/10 text-destructive"
      : value === "Late"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400"
        : value === "Jamaat"
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
          : "bg-muted text-muted-foreground";

  return (
    <div className={`rounded-lg px-3 py-2 text-sm ${color}`}>
      <strong>{name}: </strong>{value}
    </div>
  );
}
