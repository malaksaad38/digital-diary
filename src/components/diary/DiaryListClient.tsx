// components/diary/DiaryListClient.tsx
"use client";

import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Calendar, ChevronLeft, ChevronRight, RefreshCw, Search, X} from "lucide-react";
import {useRouter} from "next/navigation";
import {useCombinedHistory} from "@/hooks/use-prayer-queries";
import PrayerLog from "./PrayerLog";
import DiaryLog from "./DiaryLog";
import PrayerLegend from "@/components/diary/PrayerLegend";
import {LoadingState} from "@/components/LoadingStates";

const ITEMS_PER_PAGE = 7;

export default function DiaryListClient() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);

    // Use React Query hook with automatic caching
    const {data: combinedEntries = [], isLoading, refetch, isFetching} = useCombinedHistory();

    // Filter entries based on search query
    const filteredEntries = React.useMemo(() => {
        if (!searchQuery.trim()) return combinedEntries;

        const query = searchQuery.toLowerCase();
        return combinedEntries.filter((entry: any) => {
            const dateStr = new Date(entry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }).toLowerCase();

            return dateStr.includes(query) || entry.date.includes(query);
        });
    }, [combinedEntries, searchQuery]);

    // Reset to page 1 when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

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

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show smart pagination
            if (currentPage <= 3) {
                // Near the start
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // In the middle
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6"/> My Prayer & Diary
                </h1>
                <div className="flex gap-2">
                    <Button onClick={handleAddNewClick} className="w-full shrink-1">
                        + Add New Entry
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh data"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}/>
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div>
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input
                        type="text"
                        placeholder="Search by date (e.g., January, 2025, Monday)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                    </p>
                )}
            </div>

            <PrayerLegend/>

            {/* Loading State */}
            {isLoading ? (
                    <LoadingState label={"Loading data..."}/>)
                : filteredEntries.length === 0 ? (
                    // Empty State
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Calendar className="h-16 w-16 text-muted-foreground/50"/>
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-semibold">
                                    {searchQuery ? 'No Matching Entries' : 'No Records Found'}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    {searchQuery
                                        ? `No entries found matching "${searchQuery}". Try a different search term.`
                                        : 'Start tracking your daily prayers and thoughts by adding your first entry.'
                                    }
                                </p>
                            </div>
                            {searchQuery ? (
                                <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
                                    Clear Search
                                </Button>
                            ) : (
                                <Button onClick={handleAddNewClick} className="mt-4">
                                    Add First Entry
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Pagination Info */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                            <p>
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
                            </p>
                            <p>
                                Page {currentPage} of {totalPages}
                            </p>
                        </div>

                        {/* Combined Entries */}
                        <div className="space-y-4">
                            {paginatedEntries.map((entry: any) => (
                                <Card
                                    key={entry.date}
                                    className={`relative gap-2 border shadow-sm bg-card ${entry.prayer.fajr === "on time" && entry.prayer.zuhr === "on time" &&
                                    entry.prayer.asar === "on time" && entry.prayer.maghrib === "on time" &&
                                    entry.prayer.esha === "on time" && "border-sky-500 bg-sky-300/10" || (entry.prayer.fajr === "on time" || entry.prayer.fajr === "jamaat") && (entry.prayer.zuhr === "on time" || entry.prayer.zuhr === "jamaat") &&
                                    (entry.prayer.asar === "on time" || entry.prayer.asar === "jamaat") && (entry.prayer.maghrib === "on time" || entry.prayer.maghrib === "jamaat") &&
                                    (entry.prayer.esha === "on time" || entry.prayer.esha === "jamaat") && "border-green-500 bg-green-300/10"}`}
                                >
                                    <div className={"absolute right-3 md:right-7 z-10"}>
                                        {entry.prayer.fajr === "on time" && entry.prayer.zuhr === "on time" &&
                                            entry.prayer.asar === "on time" && entry.prayer.maghrib === "on time" &&
                                            entry.prayer.esha === "on time" &&
                                            <div className="flex justify-end z-10">
                                                <div
                                                    className="relative flex justify-center items-center gap-2 text-sky-950 px-3 py-1 bg-sky-300 rounded-full  shadow-lg shadow-sky-300/50 text-xs md:text-sm">
                                                    <span
                                                        className={"w-2 h-2 rounded-full bg-sky-500 animate-ping"}></span>
                                                    <span
                                                        className={"absolute left-3 w-2 h-2 rounded-full bg-sky-500 animate-pulse"}></span>
                                                    <span>Excellent</span>
                                                </div>
                                            </div> || (entry.prayer.fajr === "on time" || entry.prayer.fajr === "jamaat") && (entry.prayer.zuhr === "on time" || entry.prayer.zuhr === "jamaat") &&
                                            (entry.prayer.asar === "on time" || entry.prayer.asar === "jamaat") && (entry.prayer.maghrib === "on time" || entry.prayer.maghrib === "jamaat") &&
                                            (entry.prayer.esha === "on time" || entry.prayer.esha === "jamaat") &&
                                            <div className="flex justify-end">
                                                <div
                                                    className="relative flex justify-center items-center gap-2 text-green-950 bg-green-300 px-3 py-1  rounded-full  shadow-lg shadow-green-300/50 text-xs md:text-sm">
                                                <span
                                                    className={"w-2 h-2 rounded-full bg-green-500 animate-ping"}></span>
                                                    <span
                                                        className={"absolute left-3 w-2 h-2 rounded-full bg-green-500 animate-pulse"}></span>
                                                    <span>Good</span>
                                                </div>
                                            </div>}
                                    </div>

                                    <CardHeader className="pb-3 sm:pb-4 px-3 md:px-6">
                                        <div className="flex items-center justify-between">
                                            <CardTitle
                                                className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                                <Calendar className="h-4 w-4 opacity-70"/>
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

                                    <CardContent className="pt-0 space-y-4 px-3 md:px-6">
                                        {/* Prayer Section */}
                                        <PrayerLog
                                            prayer={entry.prayer}
                                            date={entry.date}
                                            onEdit={handleEditClick}
                                        />

                                        {/* Diary Section */}
                                        <DiaryLog
                                            diary={entry.diary}
                                            date={entry.date}
                                            onEdit={handleEditDiary}
                                            onAdd={handleAddDiary}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div>
                                <div className="flex items-center justify-center gap-2">
                                    {/* Previous Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4"/>
                                        <span className="hidden sm:inline">Previous</span>
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            typeof page === 'number' ? (
                                                <Button
                                                    key={index}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageClick(page)}
                                                    className="w-9 h-9 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            ) : (
                                                <span key={index} className="px-2 text-muted-foreground">
                          {page}
                        </span>
                                            )
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="gap-1"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
        </>
    );
}