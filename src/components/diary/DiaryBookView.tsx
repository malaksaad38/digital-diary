import React from "react";
import {Button} from "@/components/ui/button";
import {BookOpen, ChevronLeft, ChevronRight, Grid3x3, Pencil} from "lucide-react";

interface DiaryEntry {
    date: string;
    prayer: {
        fajr?: string;
        zuhr?: string;
        asar?: string;
        maghrib?: string;
        esha?: string;
        recite?: string;
        zikr?: string;
    };
    diary: {
        summary?: string;
        fajrToZuhr?: string;
        zuhrToAsar?: string;
        asarToMaghrib?: string;
        maghribToEsha?: string;
        eshaToFajr?: string;
        customNotes?: string;
    };
}

const PrayerStatusIcon = ({ status }: { status?: string }) => {
    const getColor = (s?: string) => {
        switch (s?.toLowerCase()) {
            case "missed": return "bg-destructive";
            case "alone": return "bg-yellow-500";
            case "jamaat": return "bg-green-500";
            case "on time": return "bg-blue-500";
            default: return "bg-muted";
        }
    };

    return (
        <div className={`w-2 h-2 rounded-full ${getColor(status)}`} />
    );
};

const BookPage = ({
                      entry,
                      position,
                      onEdit,
                      isMobile,
                  }: {
    entry: DiaryEntry | null;
    position: "left" | "right";
    onEdit: (date: string) => void;
    isMobile: boolean;
}) => {
    if (!entry) {
        return (
            <div className={`flex-1 p-6 sm:p-8 md:p-10 flex items-center justify-center bg-card ${
                !isMobile && position === "right" ? "border-l" : ""
            }`}>
                <p className="text-muted-foreground/40 text-sm italic">~ End of Journal ~</p>
            </div>
        );
    }

    const dateObj = new Date(entry.date);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    const year = dateObj.getFullYear();

    const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];

    return (
        <div className={`flex-1 flex flex-col bg-card p-6 sm:p-8 md:p-10 relative overflow-hidden ${
            !isMobile && position === "right" ? "border-l" : ""
        }`}>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                 style={{
                     backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                 }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full space-y-4 sm:space-y-5 md:space-y-6">
                {/* Header/Date */}
                <div className="text-center pb-4 border-b">
                    <p className="text-xs sm:text-sm text-muted-foreground font-light tracking-wide">
                        {dayName}
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mt-2 font-semibold">
                        {monthDay}
                    </h2>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                        {year}
                    </p>
                </div>

                {/* Prayer Status */}
                <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                        Daily Prayers
                    </h3>
                    <div className="grid grid-cols-5 gap-3 px-2">
                        {prayers.map((p) => (
                            <div key={p} className="flex flex-col items-center gap-2">
                                <PrayerStatusIcon status={entry.prayer[p as keyof typeof entry.prayer]} />
                                <span className="text-xs text-muted-foreground/80 capitalize font-medium">
                  {p.slice(0, 2).toUpperCase()}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative line */}
                <div className="h-px bg-border" />

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto space-y-4 md:space-y-5 text-sm pr-2">
                    {/* Quran Recitation */}
                    {entry.prayer.recite && entry.prayer.recite !== "none" && (
                        <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                📖 Quran Recitation
                            </p>
                            <p className="text-foreground leading-relaxed text-sm">
                                {entry.prayer.recite}
                            </p>
                        </div>
                    )}

                    {/* Daily Zikr */}
                    {entry.prayer.zikr && entry.prayer.zikr !== "none" && (
                        <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                🤲 Daily Remembrance
                            </p>
                            <p className="text-foreground leading-relaxed text-sm">
                                {entry.prayer.zikr}
                            </p>
                        </div>
                    )}

                    {/* Summary */}
                    {entry.diary?.summary && (
                        <div className="space-y-1.5 p-3 rounded-lg bg-secondary/30 border border-border">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                Summary
                            </p>
                            <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
                                {entry.diary.summary}
                            </p>
                        </div>
                    )}

                    {/* Reflections */}
                    {(entry.diary?.fajrToZuhr ||
                        entry.diary?.zuhrToAsar ||
                        entry.diary?.asarToMaghrib ||
                        entry.diary?.maghribToEsha ||
                        entry.diary?.eshaToFajr) && (
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                💭 Daily Reflections
                            </p>
                            <div className="space-y-2 text-sm">
                                {entry.diary?.fajrToZuhr && (
                                    <div className="pl-3 border-l-2 border-primary/30">
                                        <p className="text-muted-foreground text-xs font-semibold">Fajr → Zuhr</p>
                                        <p className="text-foreground leading-relaxed">
                                            {entry.diary.fajrToZuhr}
                                        </p>
                                    </div>
                                )}
                                {entry.diary?.zuhrToAsar && (
                                    <div className="pl-3 border-l-2 border-primary/30">
                                        <p className="text-muted-foreground text-xs font-semibold">Zuhr → Asar</p>
                                        <p className="text-foreground leading-relaxed">
                                            {entry.diary.zuhrToAsar}
                                        </p>
                                    </div>
                                )}
                                {entry.diary?.asarToMaghrib && (
                                    <div className="pl-3 border-l-2 border-primary/30">
                                        <p className="text-muted-foreground text-xs font-semibold">Asar → Maghrib</p>
                                        <p className="text-foreground leading-relaxed">
                                            {entry.diary.asarToMaghrib}
                                        </p>
                                    </div>
                                )}
                                {entry.diary?.maghribToEsha && (
                                    <div className="pl-3 border-l-2 border-primary/30">
                                        <p className="text-muted-foreground text-xs font-semibold">Maghrib → Esha</p>
                                        <p className="text-foreground leading-relaxed">
                                            {entry.diary.maghribToEsha}
                                        </p>
                                    </div>
                                )}
                                {entry.diary?.eshaToFajr && (
                                    <div className="pl-3 border-l-2 border-primary/30">
                                        <p className="text-muted-foreground text-xs font-semibold">Esha → Fajr</p>
                                        <p className="text-foreground leading-relaxed">
                                            {entry.diary.eshaToFajr}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Custom Notes */}
                    {entry.diary?.customNotes && (
                        <div className="space-y-1.5 p-3 rounded-lg bg-accent/10 border border-border">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                📝 Additional Notes
                            </p>
                            <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
                                {entry.diary.customNotes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Decorative line */}
                <div className="h-px bg-border mt-auto" />

                {/* Footer with edit button */}
                <div className="flex items-center justify-between pt-3">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(entry.date)}
                        className="h-8 text-xs gap-1"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <p className="text-xs text-muted-foreground/50">
                        {new Date(entry.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function DiaryBookView({
                                          entries,
                                          onEdit,
                                          onViewChange,
                                      }: {
    entries: DiaryEntry[];
    onEdit: (date: string, section: string) => void;
    onViewChange: (view: "list" | "book") => void;
}) {
    const [currentPage, setCurrentPage] = React.useState(0);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="rounded-lg border border-dashed p-8 text-center space-y-4">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <div>
                        <h3 className="font-semibold text-foreground">No entries yet</h3>
                        <p className="text-sm text-muted-foreground">Start adding entries to view them in book format</p>
                    </div>
                </div>
            </div>
        );
    }

    // On mobile, show one entry per page; on desktop, show two
    const entriesPerPage = isMobile ? 1 : 2;
    const leftPageIndex = currentPage * entriesPerPage;
    const rightPageIndex = leftPageIndex + 1;
    const leftEntry = entries[leftPageIndex] || null;
    const rightEntry = isMobile ? null : (entries[rightPageIndex] || null);

    const totalPages = isMobile ? entries.length : Math.ceil(entries.length / 2);
    const canGoNext = currentPage < totalPages - 1;
    const canGoPrev = currentPage > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <BookOpen className="h-7 w-7" />
                        Journal
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isMobile ? "Reading your daily entries" : "Open your prayer journal"}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewChange("list")}
                    className="gap-2"
                >
                    <Grid3x3 className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                </Button>
            </div>

            {/* Book Container */}
            <div className="relative">
                {/* Book Pages */}
                <div className={`flex rounded-xl overflow-hidden shadow-lg border bg-card min-h-[500px] sm:min-h-[600px] md:min-h-[700px]`}>
                    <BookPage
                        entry={leftEntry}
                        position="left"
                        onEdit={(date) => onEdit(date, "edit")}
                        isMobile={isMobile}
                    />
                    {!isMobile && leftEntry && rightEntry !== undefined && (
                        <BookPage
                            entry={rightEntry}
                            position="right"
                            onEdit={(date) => onEdit(date, "edit")}
                            isMobile={isMobile}
                        />
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={!canGoPrev}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1 justify-center">
                        {isMobile ? (
                            <span>
                Entry <span className="font-semibold text-foreground">{leftPageIndex + 1}</span> of <span className="font-semibold text-foreground">{entries.length}</span>
              </span>
                        ) : (
                            <span>
                Pages <span className="font-semibold text-foreground">{leftPageIndex + 1}</span>-<span className="font-semibold text-foreground">{Math.min(rightPageIndex + 1, entries.length)}</span> of <span className="font-semibold text-foreground">{entries.length}</span>
              </span>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={!canGoNext}
                        className="gap-2"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Page Indicators */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                currentPage === index
                                    ? "bg-foreground w-6"
                                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                            }`}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}