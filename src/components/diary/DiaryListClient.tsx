// components/diary/DiaryListClient.tsx
"use client";

import React, {useCallback, useDeferredValue, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Calendar, ChevronLeft, ChevronRight, RefreshCw, Search, X} from "lucide-react";
import {useRouter} from "next/navigation";
import {useCombinedHistory} from "@/hooks/use-prayer-queries";
import PrayerLegend from "@/components/diary/PrayerLegend";
import {LoadingState} from "@/components/LoadingStates";
import DiaryEntryCard from "@/components/diary/DiaryEntryCard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

export default function DiaryListClient() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
    // useDeferredValue defers the expensive filter during rapid typing — UI stays responsive
    const deferredSearch = useDeferredValue(searchQuery);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(7);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletePrayerId, setDeletePrayerId] = useState<string | null>(null);
    const [isDeletingPrayer, setIsDeletingPrayer] = useState(false);
    // Use React Query hook with automatic caching
    const {data: combinedEntries = [], isLoading, refetch, isFetching} = useCombinedHistory();

    // Filter entries — uses deferred search so typing isn't blocked by heavy filtering
    const filteredEntries = React.useMemo(() => {
        if (!deferredSearch.trim()) return combinedEntries;

        const query = deferredSearch.toLowerCase();
        return combinedEntries.filter((entry: any) => {
            const dateStr = new Date(entry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }).toLowerCase();

            return dateStr.includes(query) || entry.date.includes(query);
        });
    }, [combinedEntries, deferredSearch]);

    // Reset to page 1 when search query or itemsPerPage changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [deferredSearch, itemsPerPage]);

    // Pagination calculations
    const currentItemsPerPage = itemsPerPage === -1 ? (filteredEntries.length || 1) : itemsPerPage;
    const totalPages = Math.ceil(filteredEntries.length / currentItemsPerPage);
    const startIndex = (currentPage - 1) * currentItemsPerPage;
    const endIndex = startIndex + currentItemsPerPage;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    const confirmPrayerDelete = async () => {
        if (!deletePrayerId) return;

        try {
            setIsDeletingPrayer(true);

            const res = await fetch(`/api/prayers?id=${deletePrayerId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete prayer log");
            }

            await refetch();
            setDeletePrayerId(null);
        } catch (error: any) {
            console.error("Prayer delete error:", error);
            alert(error.message || "Something went wrong");
        } finally {
            setIsDeletingPrayer(false);
        }
    };


    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            setIsDeleting(true);

            const res = await fetch(`/api/diary?id=${deleteId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete diary");
            }

            await refetch();
            setDeleteId(null); // close dialog
        } catch (error: any) {
            console.error("Delete error:", error);
            alert(error.message || "Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    };
    const handleAddPrayer = useCallback((date: string) => {
        router.push(`/dashboard/entry?date=${date}#prayer`);
    }, [router]);
    const handleEditPrayer = useCallback((date: string) => {
        router.push(`/dashboard/entry?date=${date}#prayer`);
    }, [router]);
    const handleAddDiary = useCallback((date: string) => {
        router.push(`/dashboard/entry?date=${date}#diary`);
    }, [router]);
    const handleEditDiary = useCallback((date: string) => {
        router.push(`/dashboard/entry?date=${date}#diary`);
    }, [router]);

    const handleAddNewClick = useCallback(() => {
        router.push("/dashboard/entry");
    }, [router]);

    const handlePreviousPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [totalPages]);

    const handlePageClick = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);

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
                        <div className="flex flex-row items-center justify-between gap-4 text-sm text-muted-foreground px-1">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={(val) => setItemsPerPage(Number(val))}
                                    >
                                        <SelectTrigger className="w-[70px] h-8 text-sm">
                                            <SelectValue placeholder="7" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">7</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="30">30</SelectItem>
                                            <SelectItem value="-1">All</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p>
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
                                    </p>
                                </div>
                            </div>

                        {/* Combined Entries */}
                        <div className="space-y-4">
                            {paginatedEntries.map((entry: any) => (
                                <DiaryEntryCard
                                    key={entry.date}
                                    entry={entry}
                                    onEditPrayer={handleEditPrayer}
                                    onAddPrayer={handleAddPrayer}
                                    onDeletePrayer={(id) => setDeletePrayerId(id)}
                                    onEditDiary={handleEditDiary}
                                    onAddDiary={handleAddDiary}
                                    onDeleteDiary={(id) => setDeleteId(id)}
                                />
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
                                                <span key={index} className=" text-muted-foreground">
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

             {/*Prayer Dialog*/}
            <Dialog
                open={!!deletePrayerId}
                onOpenChange={() => setDeletePrayerId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete prayer log?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this day’s prayer record.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletePrayerId(null)}
                            disabled={isDeletingPrayer}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={confirmPrayerDelete}
                            disabled={isDeletingPrayer}
                        >
                            {isDeletingPrayer ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/*Diary Dialog*/}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete diary Log?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. Your diary entry will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}