"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Circle, Diamond, Edit2, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

type Prayer = {
  _id: string;
  date: string;
  fajr: string;
  zuhr: string;
  asar: string;
  maghrib: string;
  esha: string;
  recite?: string;
  zikr?: string;
};

type Diary = {
  _id: string;
  date: string;
  fajrToZuhr: string;
  zuhrToAsar: string;
  asarToMaghrib: string;
  maghribToEsha: string;
  eshaToFajr: string;
  customNotes: string;
  summary: string;
};

type CombinedEntry = {
  date: string;
  prayer?: Prayer;
  diary?: Diary;
};

const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "missed":
      return "text-red-500";
    case "alone":
      return "text-yellow-400";
    case "jamaat":
      return "text-green-500";
    case "on time":
      return "text-sky-500";
    case "on-time":
      return "text-sky-500";
    default:
      return "text-muted-foreground";
  }
};

const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function PrayerDiaryPage() {
  const router = useRouter();
  const [combinedEntries, setCombinedEntries] = useState<CombinedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch both prayers and diaries
      const [prayerRes, diaryRes] = await Promise.all([
        fetch("/api/prayers"),
        fetch("/api/diary")
      ]);

      const prayerData = await prayerRes.json();
      const diaryData = await diaryRes.json();

      // Combine data by date
      const dateMap = new Map<string, CombinedEntry>();

      if (prayerData.success && prayerData.data) {
        prayerData.data.forEach((prayer: Prayer) => {
          if (!dateMap.has(prayer.date)) {
            dateMap.set(prayer.date, { date: prayer.date });
          }
          dateMap.get(prayer.date)!.prayer = prayer;
        });
      }

      if (diaryData.success && diaryData.data) {
        diaryData.data.forEach((diary: Diary) => {
          if (!dateMap.has(diary.date)) {
            dateMap.set(diary.date, { date: diary.date });
          }
          dateMap.get(diary.date)!.diary = diary;
        });
      }

      // Convert to array and sort by date (newest first)
      const combined = Array.from(dateMap.values()).sort((a, b) =>
        b.date.localeCompare(a.date)
      );

      setCombinedEntries(combined);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (date: string) => {
    // Both prayer and diary forms are on the same page
    router.push(`/dashboard/entry?date=${date}#edit`);

  };
const handleAddDiary = (date: string) => {
    // Both prayer and diary forms are on the same page
    router.push(`/dashboard/entry?date=${date}#diary`);

  };
const handleEditDiary = (date: string) => {
    // Both prayer and diary forms are on the same page
    router.push(`/dashboard/entry?date=${date}#diaryEdit`);

  };

  const handleAddNewClick = () => {
    router.push("/dashboard/entry");

  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pt-8 sm:pt-14 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" /> My Prayer & Diary
          </h1>
          <Button onClick={handleAddNewClick} className="w-full sm:w-auto">
            + Add New Entry
          </Button>
        </div>

        {/* Legend */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm">
              <span className="font-medium text-foreground mr-2">Legend:</span>
              <div className="flex items-center gap-1.5">
                <Circle className="h-3 w-3 text-red-500 fill-red-500" />
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span>Alone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                <span>Jamaat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Diamond className="h-3 w-3 text-sky-500 fill-sky-500" />
                <span>On Time</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </CardContent>
          </Card>
        ) : combinedEntries.length === 0 ? (
          // Empty State
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No Records Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start tracking your daily prayers and thoughts by adding your first entry.
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleAddNewClick}>
                  Add First Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Combined Entries
          <div className="space-y-4">
            {combinedEntries.map((entry) => (
              <Card
                key={entry.date}
                className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>{new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Prayer Section */}
                  {entry.prayer ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-muted-foreground">Prayer Log</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(entry.date)}
                          className="h-7 px-2 hover:bg-primary/10"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>

                      {/* Prayer Table */}
                      <div className="overflow-x-auto rounded-md border -mx-4 sm:mx-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              {prayers.map((p) => (
                                <TableHead
                                  key={p}
                                  className="capitalize text-center text-xs sm:text-sm px-2 sm:px-4 font-semibold"
                                >
                                  {p}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              {prayers.map((p) => (
                                <TableCell key={p} className="text-center px-2 sm:px-4 py-3">
                                  {entry.prayer[p as keyof Prayer]?.toLowerCase() === "on time" ||
                                  entry.prayer[p as keyof Prayer]?.toLowerCase() === "on-time" ? (
                                    <Diamond
                                      className={`h-4 w-4 mx-auto ${statusColor(
                                        entry.prayer[p as keyof Prayer] as string
                                      )} fill-sky-500`}
                                    />
                                  ) : (
                                    <Circle
                                      className={`h-3.5 w-3.5 mx-auto ${statusColor(
                                        entry.prayer[p as keyof Prayer] as string
                                      )} fill-current`}
                                    />
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Recite & Zikr */}
                      {(entry.prayer.recite || entry.prayer.zikr) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2  gap-3 pt-2">
                          {entry.prayer.recite && entry.prayer.recite !== "none" && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Tilawati Quran Pak
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {capitalizeFirst(entry.prayer.recite)} {!entry.prayer.recite.toLowerCase().includes("parah") && "Parah"}
                                </p>
                              </div>
                            </div>
                          )}
                          {entry.prayer.zikr && entry.prayer.zikr !== "none" && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Zikr (Subha wa Sham)
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {capitalizeFirst(entry.prayer.zikr)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-2">No prayer log for this date</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(entry.date)}
                      >
                        Add Prayer Log
                      </Button>
                    </div>
                  )}

                  {/* Diary Section */}
                  {entry.diary ? (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Diary Entry
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDiary(entry.date)}
                          className="h-7 px-2 hover:bg-primary/10"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {entry.diary.summary && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs font-medium text-primary mb-1">Day Summary</p>
                            <p className="text-sm text-foreground">{entry.diary.summary}</p>
                          </div>
                        )}

                        {[
                          { label: "Fajr → Zuhr", value: entry.diary.fajrToZuhr },
                          { label: "Zuhr → Asar", value: entry.diary.zuhrToAsar },
                          { label: "Asar → Maghrib", value: entry.diary.asarToMaghrib },
                          { label: "Maghrib → Esha", value: entry.diary.maghribToEsha },
                          { label: "Esha → Fajr", value: entry.diary.eshaToFajr },
                        ].map((period) => (
                          period.value && (
                            <div key={period.label} className="p-3 rounded-lg bg-muted/30">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                {period.label}
                              </p>
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {period.value}
                              </p>
                            </div>
                          )
                        ))}

                        {entry.diary.customNotes && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Additional Notes
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {entry.diary.customNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 border-t border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-2">No diary entry for this date</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddDiary(entry.date)}
                      >
                        <BookOpen className="mr-2 h-3 w-3" />
                        Add Diary Entry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}