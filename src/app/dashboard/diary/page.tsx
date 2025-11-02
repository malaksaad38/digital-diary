"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays, BookOpen, Moon, Sun, Heart } from "lucide-react";

export default function PrayersPage() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        const res = await fetch("/api/prayers");
        const data = await res.json();

        if (data.success) setPrayers(data.data);
      } catch (err) {
        console.error("❌ Error fetching prayers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );

  if (!loading && prayers.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <BookOpen className="w-12 h-12 mb-3 text-gray-400" />
        <p className="text-lg font-medium">No prayers found yet</p>
        <p className="text-sm text-gray-400">Start by adding your first prayer.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🕌 My Prayers</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prayers.map((prayer) => (
            <Card
              key={prayer._id}
              className="border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                  {new Date(prayer.timestamp).toLocaleDateString()}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">🌅 Fajr:</span>
                  <span>{prayer.fajr || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">🏙️ Zuhr:</span>
                  <span>{prayer.zuhr || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">🌇 Asar:</span>
                  <span>{prayer.asar || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">🌆 Maghrib:</span>
                  <span>{prayer.maghrib || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">🌙 Esha:</span>
                  <span>{prayer.esha || "—"}</span>
                </div>

                <hr className="my-3" />

                {prayer.recite && (
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-pink-500 mt-1" />
                    <p className="text-gray-600">
                      <span className="font-medium">Recite:</span> {prayer.recite}
                    </p>
                  </div>
                )}

                {prayer.zikr && (
                  <div className="flex items-start gap-2">
                    <Moon className="w-4 h-4 text-indigo-500 mt-1" />
                    <p className="text-gray-600">
                      <span className="font-medium">Zikr:</span> {prayer.zikr}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
