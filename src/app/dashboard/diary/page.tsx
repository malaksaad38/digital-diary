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
import { Calendar, Circle, Diamond, Edit2, Loader2 } from "lucide-react";
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
  const [entries, setEntries] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrayers();
  }, []);

  async function fetchPrayers() {
    try {
      setLoading(true);
      const res = await fetch("/api/prayers");
      const data = await res.json();
      if (data.success) setEntries(data.data);
    } catch (err) {
      console.error("Error fetching prayers:", err);
    } finally {
      setLoading(false);
    }
  }


  const handleEditClick = (date: string) => {
    // Navigate to form page with date as query parameter
    router.push(`/dashboard/entry?date=${date}`);
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
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" /> My Prayer Diary
          </h1>
          <Button onClick={handleAddNewClick} className="w-full sm:w-auto">
            + Add New Prayer Log
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
                <p className="text-sm text-muted-foreground">Loading prayers...</p>
              </div>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          // Empty State
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No Prayer Records Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start tracking your daily prayers by adding your first prayer log.
                </p>
              </div>
              <Button onClick={handleAddNewClick} className="mt-4">
                Add First Prayer Log
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Prayer Entries
          <div className="space-y-4">
            {entries.map((r) => (
              <Card
                key={r._id}
                className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>{new Date(r.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(r.date)}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 hover:bg-primary/10"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Edit</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
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
                              {r[p as keyof Prayer]?.toLowerCase() === "on time" ||
                              r[p as keyof Prayer]?.toLowerCase() === "on-time" ? (
                                <Diamond
                                  className={`h-4 w-4 mx-auto ${statusColor(
                                    r[p as keyof Prayer] as string
                                  )} fill-sky-500`}
                                />
                              ) : (
                                <Circle
                                  className={`h-3.5 w-3.5 mx-auto ${statusColor(
                                    r[p as keyof Prayer] as string
                                  )} fill-current`}
                                />
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Recite & Zikr Section */}
                  {(r.recite || r.zikr) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                      {r.recite && r.recite !== "none" && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Tilawati Quran Pak
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {capitalizeFirst(r.recite)} {!r.recite.toLowerCase().includes("parah") && "Parah"}
                            </p>
                          </div>
                        </div>
                      )}
                      {r.zikr && r.zikr !== "none" && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Zikr (Subha wa Sham)
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {capitalizeFirst(r.zikr)}
                            </p>
                          </div>
                        </div>
                      )}
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