"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useRouter } from "next/navigation";
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BookOpen,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Circle,
  Diamond,
  List,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { useCombinedHistory } from "@/hooks/use-prayer-queries";
import { LoadingState } from "@/components/LoadingStates";
import { cn } from "@/lib/utils";

// ─── Prayer status color helper ───
const statusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "missed": return "bg-red-500";
    case "alone": return "bg-yellow-400";
    case "jamaat": return "bg-green-500";
    case "on time": return "bg-sky-500";
    default: return "bg-muted-foreground/30";
  }
};

const statusIcon = (status?: string) => {
  const color = statusColor(status);
  if (status?.toLowerCase() === "on time") {
    return <Diamond className={`h-3.5 w-3.5 text-sky-500 fill-sky-500`} />;
  }
  return <div className={`w-3 h-3 rounded-full ${color}`} />;
};

const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"] as const;

// ─── Single Book Page ───
function BookPageContent({ entry, pageNumber, totalPages }: {
  entry: any;
  pageNumber: number;
  totalPages: number;
}) {
  const router = useRouter();
  const dateObj = parseISO(entry.date);
  const dayName = format(dateObj, "EEEE");
  const monthDay = format(dateObj, "MMMM d");
  const year = format(dateObj, "yyyy");

  const hasDiary = entry.diary && (
    entry.diary.summary || entry.diary.fajrToZuhr || entry.diary.zuhrToAsar ||
    entry.diary.asarToMaghrib || entry.diary.maghribToEsha || entry.diary.eshaToFajr ||
    entry.diary.customNotes
  );

  const periods = [
    { label: "Fajr → Zuhr", value: entry.diary?.fajrToZuhr },
    { label: "Zuhr → Asar", value: entry.diary?.zuhrToAsar },
    { label: "Asar → Maghrib", value: entry.diary?.asarToMaghrib },
    { label: "Maghrib → Esha", value: entry.diary?.maghribToEsha },
    { label: "Esha → Fajr", value: entry.diary?.eshaToFajr },
  ];

  return (
    <div className="flex flex-col h-full min-h-[70vh] sm:min-h-[75vh] bg-card rounded-xl border shadow-sm overflow-hidden relative select-none">


      {/* Page Header */}
      <div className="relative z-10 px-5 sm:px-8 pt-5 sm:pt-7 pb-4 border-b bg-muted/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-mono text-muted-foreground tracking-wider uppercase">
            {dayName}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
            Page {pageNumber} / {totalPages}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground tracking-tight">
          {monthDay}
        </h2>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{year}</p>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-8 py-4 sm:py-5 space-y-4 sm:space-y-5">

        {/* Prayer Section */}
        {entry.prayer && (
          <div className="space-y-2.5">
            <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Daily Prayers
            </h3>
            <div className="flex items-center justify-between gap-2 px-1">
              {prayers.map((p) => (
                <div key={p} className="flex flex-col items-center gap-1.5">
                  {statusIcon(entry.prayer?.[p])}
                  <span className="text-[10px] sm:text-xs text-muted-foreground/80 capitalize font-medium">
                    {p}
                  </span>
                </div>
              ))}
            </div>

            {/* Recite & Zikr */}
            {(entry.prayer?.recite || entry.prayer?.zikr) && (
              <div className="flex gap-3 pt-1">
                {entry.prayer.recite && entry.prayer.recite !== "none" && (
                  <div className="flex-1 text-xs p-2 rounded-md bg-muted/30">
                    <span className="text-muted-foreground">Quran: </span>
                    <span className="font-medium text-foreground">{entry.prayer.recite}</span>
                  </div>
                )}
                {entry.prayer.zikr && entry.prayer.zikr !== "none" && (
                  <div className="flex-1 text-xs p-2 rounded-md bg-muted/30">
                    <span className="text-muted-foreground">Zikr: </span>
                    <span className="font-medium text-foreground">{entry.prayer.zikr}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!entry.prayer && (
          <div className="flex items-center justify-center py-3 rounded-md border border-dashed text-xs text-muted-foreground">
            No prayer log recorded
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Diary Section */}
        {hasDiary ? (
          <div className="space-y-3">
            {entry.diary?.summary && (
              <div className="space-y-1">
                <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Summary
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.diary.summary}
                </p>
              </div>
            )}

            {periods.some(p => p.value) && (
              <div className="space-y-2">
                <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Daily Reflections
                </h3>
                <div className="space-y-2">
                  {periods.map((period) =>
                    period.value ? (
                      <div key={period.label} className="pl-3 border-l-2 border-primary/30">
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold mb-0.5">{period.label}</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{period.value}</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {entry.diary?.customNotes && (
              <div className="space-y-1 p-3 rounded-lg bg-accent/10 border">
                <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Notes
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.diary.customNotes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-3 rounded-md border border-dashed text-xs text-muted-foreground">
            No diary entry recorded
          </div>
        )}
      </div>

      {/* Page Footer */}
      <div className="relative z-10 px-5 sm:px-8 py-3 border-t bg-muted/10 flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/dashboard/entry?date=${entry.date}`)}
          className="h-7 text-xs gap-1"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          {format(dateObj, "MM/dd")}
        </span>
      </div>
    </div>
  );
}

// ─── Date Range Picker ───
function DateRangePicker({
  from, to, onFromChange, onToChange,
}: {
  from: Date;
  to: Date;
  onFromChange: (d: Date) => void;
  onToChange: (d: Date) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-normal">
            <CalendarIcon className="h-3.5 w-3.5" />
            {format(from, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={from}
            onSelect={(d) => d && onFromChange(d)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">to</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-normal">
            <CalendarIcon className="h-3.5 w-3.5" />
            {format(to, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={to}
            onSelect={(d) => d && onToChange(d)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Main Book Reader ───
export default function DiaryBookReader() {
  const router = useRouter();
  const { data: combinedEntries = [], isLoading, refetch, isFetching } = useCombinedHistory();

  // Date range state — default to last 30 days
  const [fromDate, setFromDate] = useState(() => subDays(new Date(), 30));
  const [toDate, setToDate] = useState(() => new Date());

  // Filter entries by date range, sorted oldest → newest (chronological book order)
  const filteredEntries = useMemo(() => {
    if (!combinedEntries.length) return [];

    return combinedEntries
      .filter((entry: any) => {
        try {
          const entryDate = parseISO(entry.date);
          return isWithinInterval(entryDate, {
            start: startOfDay(fromDate),
            end: endOfDay(toDate),
          });
        } catch {
          return false;
        }
      })
      .sort((a: any, b: any) => a.date.localeCompare(b.date)); // oldest first
  }, [combinedEntries, fromDate, toDate]);

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    loop: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!emblaApi) return;
      if (e.key === "ArrowLeft") emblaApi.scrollPrev();
      if (e.key === "ArrowRight") emblaApi.scrollNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [emblaApi]);

  // Reset to first page when filter changes
  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(0);
  }, [fromDate, toDate, emblaApi]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          Book Reader
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/diary")}
            className="gap-1.5 h-8"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">List View</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <DateRangePicker
          from={fromDate}
          to={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
        />
        {!isLoading && (
          <p className="text-xs text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"} in range
          </p>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState label="Loading diary..." />
      ) : filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground/30" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No Entries Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No diary or prayer entries in the selected date range. Try expanding the range or add a new entry.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/entry")}>
            Add Entry
          </Button>
        </div>
      ) : (
        <>
          {/* Carousel */}
          <div className="relative">
            {/* Prev/Next Buttons (desktop) */}
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-md bg-background/90 backdrop-blur-sm"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-md bg-background/90 backdrop-blur-sm"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Embla Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {filteredEntries.map((entry: any, index: number) => (
                  <div
                    key={entry.date}
                    className="flex-[0_0_100%] sm:flex-[0_0_90%] md:flex-[0_0_70%] lg:flex-[0_0_55%] min-w-0"
                  >
                    <BookPageContent
                      entry={entry}
                      pageNumber={index + 1}
                      totalPages={filteredEntries.length}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{currentIndex + 1}</span>
              <span>/</span>
              <span>{filteredEntries.length}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dot indicators (only show if <= 20 entries) */}
          {filteredEntries.length <= 20 && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {filteredEntries.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-200",
                    currentIndex === index
                      ? "w-6 bg-foreground"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
