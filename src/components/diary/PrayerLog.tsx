// components/diary/PrayerLog.tsx
"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Circle, Diamond, Edit2, CircleHelp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "missed": return "text-red-500";
    case "alone": return "text-yellow-400";
    case "jamaat": return "text-green-500";
    case "on time": return "text-sky-500";
    default: return "text-gray-500";
  }
};

const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

interface PrayerData {
  fajr?: string;
  zuhr?: string;
  asar?: string;
  maghrib?: string;
  esha?: string;
  recite?: string;
  zikr?: string;
}

interface PrayerLogProps {
  prayer: PrayerData | null;
  date: string;
  onEdit: (date: string) => void;
}

export default function PrayerLog({ prayer, date, onEdit }: PrayerLogProps) {
  if (!prayer) {
    return (
      <div className="text-center py-4 border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground mb-2">No prayer log for this date</p>
        <Button size="sm" variant="outline" onClick={() => onEdit(date)}>
          Add Prayer Log
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground flex gap-1">
          Prayer Log
          <Dialog>
            <DialogTrigger asChild>
              <button
                aria-label="Show info about prayers"
                className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
              >
                <CircleHelp size={14} className="relative" />
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>About Daily Prayers</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-3 text-sm mt-2 leading-relaxed">
                    <p>
                      This section helps you track your five daily prayers —{" "}
                      <strong>Fajr</strong>, <strong>Dhuhr</strong>, <strong>Asr</strong>,{" "}
                      <strong>Maghrib</strong>, and <strong>Isha</strong>.
                      Each prayer can be marked based on how it was performed:
                    </p>

                    <div className="space-y-3 pt-2">
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-gray-500 fill-gray-500" />
                          <strong>Not Selected</strong>
                        </span> — It's not Selected Yet. click edit to add it.
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-red-500 fill-red-500" />
                          <strong>Missed</strong>
                        </span>{" "}
                        — You <strong>missed the prayer time</strong> (Qaza), meaning you didn't pray within its proper time.
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <strong>Alone</strong>
                        </span>{" "}
                        — You <strong>prayed alone</strong> and not in congregation (Jamaat).
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                          <strong>Jamaat</strong>
                        </span>{" "}
                        — You <strong>performed the prayer with Jamaat</strong> (in congregation).
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Diamond className="h-3 w-3 text-sky-500 fill-sky-500" />
                          <strong>On Time</strong>
                        </span>{" "}
                        — You <strong>prayed in Jamaat with Takbeeri Oola</strong> (the first Takbeer at the start of the prayer).
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(date)}
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
                  {prayer[p as keyof PrayerData]?.toLowerCase() === "on time" ? (
                    <Diamond
                      className={`h-4 w-4 mx-auto ${statusColor(prayer[p as keyof PrayerData]!)} fill-sky-500`}
                    />
                  ) : (
                    <Circle
                      className={`h-3.5 w-3.5 mx-auto ${statusColor(prayer[p as keyof PrayerData]!)} fill-current`}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Recite & Zikr */}
      {(prayer.recite || prayer.zikr) && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {prayer.recite && prayer.recite !== "none" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex gap-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Recite Quran</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        aria-label="Show info about Quran recitation"
                        className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <CircleHelp size={13} className="relative mb-[4px]" />
                      </button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>About Reciting Quran (Parah)</DialogTitle>
                        <DialogDescription asChild>
                          <div className="space-y-3 text-sm mt-2 leading-relaxed">
                            <p>
                              This section helps you track your <strong>daily Quran recitation progress</strong>.
                              Each number or fraction represents how much of a <strong>Parah (Juz)</strong> you recited today.
                            </p>

                            <div className="space-y-3 pt-2">
                              <p>
                                <strong>0</strong> — You <strong>did not recite Quran today</strong>.
                              </p>
                              <p>
                                <strong>0.25</strong> — You recited <strong>one-fourth (¼) of a Parah</strong>, called <em>Rubu'</em> (رُبُع) in Arabic.
                              </p>
                              <p>
                                <strong>0.5</strong> — You recited <strong>half (½) of a Parah</strong>, known as <em>Nisf</em> (نِصف).
                              </p>
                              <p>
                                <strong>0.75</strong> — You recited <strong>three-fourths (¾) of a Parah</strong>, called <em>Thuluth</em> or <em>Thalātha Arba'</em> (ثلاثة أرباع).
                              </p>
                              <p>
                                <strong>1</strong> — You completed <strong>one full Parah (Juz)</strong>.
                              </p>
                              <p>
                                <strong>2</strong> — You completed <strong>two Parahs</strong> today.
                              </p>
                              <p>
                                <strong>Custom</strong> — You can select a <strong>custom value</strong> if you recited more or less than these options (for example, 1.5 Parah or 0.3 Parah).
                              </p>
                            </div>

                            <p className="pt-2 text-muted-foreground">
                              🌙 Tip: Tracking smaller portions (like 0.25 or 0.5) helps you build consistency and stay connected with the Quran daily.
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {capitalizeFirst(prayer.recite)}{" "}
                  {!prayer.recite.toLowerCase().includes("parah") && "Parah"}
                </p>
              </div>
            </div>
          )}
          {prayer.zikr && prayer.zikr !== "none" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex gap-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Daily Azkar</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        aria-label="Show information about Zikr"
                        className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <CircleHelp size={13} className="relative mb-[4px]" />
                      </button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>About Daily Zikr (Azkar)</DialogTitle>
                        <DialogDescription asChild>
                          <div className="space-y-4 text-sm mt-2 leading-relaxed">
                            <p>
                              This section helps you <strong>track your daily remembrance (Zikr)</strong> — performed in the
                              <strong> morning and evening</strong> to maintain spiritual connection and mindfulness.
                            </p>

                            <div className="border-l border-border pl-4 space-y-3">
                              <p>
                                <strong>None (0)</strong> — You did not perform your Zikr today.
                              </p>
                              <p>
                                <strong>Half (½)</strong> — You completed one session, either <em>morning</em> or <em>evening</em>.
                              </p>
                              <p>
                                <strong>Full (1)</strong> — You completed both your morning and evening Azkar today. Excellent consistency!
                              </p>
                            </div>

                            <div className="border-t border-border pt-4 space-y-2">
                              <p className="font-medium">Daily Zikr includes:</p>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>
                                  <strong>100×</strong> — <em>Thesra Kalimah (ثلاثة كلمات)</em>
                                </li>
                                <li>
                                  <strong>100×</strong> — <em>Darood Shareef (دُرود شريف)</em>
                                </li>
                                <li>
                                  <strong>100×</strong> — <em>Istighfar (اِسْتِغْفَار)</em>
                                </li>
                              </ul>
                            </div>

                            <p className="text-muted-foreground pt-2">
                              🌿 <strong>Tip:</strong> Aim for consistency over quantity. Even a single sincere recitation brings peace and reward.
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {capitalizeFirst(prayer.zikr)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}