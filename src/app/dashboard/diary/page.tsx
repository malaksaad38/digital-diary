// Updated PrayerDiaryPage with React Query
"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Circle, Diamond, Edit2, Loader2, BookOpen, CircleHelp, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCombinedHistory } from "@/hooks/use-prayer-queries";

const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "missed": return "text-red-500";
    case "alone": return "text-yellow-400";
    case "jamaat": return "text-green-500";
    case "on time":
    case "on-time": return "text-sky-500";
    default: return "text-muted-foreground";
  }
};

const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function PrayerDiaryPage() {
  const router = useRouter();

  // Use React Query hook with automatic caching
  const { data: combinedEntries = [], isLoading, refetch, isFetching } = useCombinedHistory();

  const handleEditClick = (date: string) => {
    router.push(`/dashboard/entry?date=${date}#edit`);
  };

  const handleAddDiary = (date: string) => {
    router.push(`/dashboard/entry?date=${date}#diary`);
  };

  const handleEditDiary = (date: string) => {
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
          <div className="flex gap-2">
            {/* Manual Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleAddNewClick} className="w-full sm:w-auto">
              + Add New Entry
            </Button>
          </div>
        </div>

        {/* Legend */}
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center gap-2 py-3">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-5 text-xs sm:text-sm">
              {[
                { icon: Circle, color: "red", label: "Missed" },
                { icon: Circle, color: "yellow", label: "Alone" },
                { icon: Circle, color: "green", label: "Jamaat" },
                { icon: Diamond, color: "sky", label: "On Time" },
              ].map(({ icon: Icon, color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className={`h-3 w-3 text-${color}-500 fill-${color}-500`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <button
                  aria-label="Show prayer status details"
                  className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground text-xs transition-colors"
                >
                  <CircleHelp size={14} className="relative top-[1px]" />
                  <span className="hidden sm:inline">What do these mean?</span>
                  <span className="sm:hidden">Info</span>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Prayer Status Meaning</DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-3 text-sm mt-2 leading-relaxed">
                      <p><span className="inline-flex items-center gap-1.5">
                        <Circle className="h-3 w-3 text-red-500 fill-red-500" />
                        <strong>Missed</strong></span> — You missed the prayer time (Qaza).
                      </p>
                      <p><span className="inline-flex items-center gap-1.5">
                        <Circle className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <strong>Alone</strong></span> — You prayed alone.
                      </p>
                      <p><span className="inline-flex items-center gap-1.5">
                        <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                        <strong>Jamaat</strong></span> — You prayed with congregation.
                      </p>
                      <p><span className="inline-flex items-center gap-1.5">
                        <Diamond className="h-3 w-3 text-sky-500 fill-sky-500" />
                        <strong>On Time</strong></span> — You prayed in Jamaat with Takbeeri Oola.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
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
              <Button onClick={handleAddNewClick} className="mt-4">
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Combined Entries - keeping your existing UI structure
          <div className="space-y-4">
            {combinedEntries.map((entry: any) => (
              <Card
                key={entry.date}
                className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
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
                                  {entry.prayer[p]?.toLowerCase() === "on time" ||
                                  entry.prayer[p]?.toLowerCase() === "on-time" ? (
                                    <Diamond
                                      className={`h-4 w-4 mx-auto ${statusColor(entry.prayer[p])} fill-sky-500`}
                                    />
                                  ) : (
                                    <Circle
                                      className={`h-3.5 w-3.5 mx-auto ${statusColor(entry.prayer[p])} fill-current`}
                                    />
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Recite & Zikr - keeping your existing UI */}
                      {(entry.prayer.recite || entry.prayer.zikr) && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {entry.prayer.recite && entry.prayer.recite !== "none" && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Recite Quran</p>
                                <p className="text-sm font-semibold text-foreground">
                                  {capitalizeFirst(entry.prayer.recite)}{" "}
                                  {!entry.prayer.recite.toLowerCase().includes("parah") && "Parah"}
                                </p>
                              </div>
                            </div>
                          )}
                          {entry.prayer.zikr && entry.prayer.zikr !== "none" && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Daily Azkar</p>
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
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(entry.date)}>
                        Add Prayer Log
                      </Button>
                    </div>
                  )}

                  {/* Diary Section - keeping your existing UI */}
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

                      {/* Diary content - keeping your existing structure */}
                      <div className="space-y-2">
                        {entry.diary.summary && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs font-medium text-primary mb-1">Day Summary</p>
                            <p className="text-sm text-foreground">{entry.diary.summary}</p>
                          </div>
                        )}
                        {/* Rest of diary fields... */}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 border-t border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-2">No diary entry for this date</p>
                      <Button size="sm" variant="outline" onClick={() => handleAddDiary(entry.date)}>
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