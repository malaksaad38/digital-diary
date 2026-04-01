// components/diary/DiaryListClient.tsx
"use client";

import React, {useCallback, useDeferredValue, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {BookOpen, Calendar, ChevronLeft, ChevronRight, PlusIcon, RefreshCw, Search, X} from "lucide-react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
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
import {Separator} from "@/components/ui/separator";

export default function DiaryListClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = React.useState("");
    const deferredSearch = useDeferredValue(searchQuery);

    // Constants and URL State
    const ITEMS_PER_PAGE_KEY = 'diary_items_per_page';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = parseInt(searchParams.get('limit') || '7', 10);

    // Sync state with URL when page or limit changes
    const updateURL = useCallback((page: number, limit: number, replace = false) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        params.set('limit', limit.toString());
        const url = `${pathname}?${params.toString()}`;
        if (replace) router.replace(url, { scroll: false });
        else router.push(url, { scroll: false });
    }, [pathname, router, searchParams]);

    // Initial Mount: Load saved preference if not in URL
    React.useEffect(() => {
        const urlLimit = searchParams.get('limit');
        const storedLimit = typeof window !== 'undefined' ? localStorage.getItem(ITEMS_PER_PAGE_KEY) : null;
        
        if (!urlLimit && storedLimit) {
            updateURL(1, parseInt(storedLimit, 10), true);
        }
    }, []); // Only runs once on mount

    const handleSetItemsPerPage = (val: string) => {
        if (typeof window !== 'undefined') localStorage.setItem(ITEMS_PER_PAGE_KEY, val);
        updateURL(1, Number(val));
    };

    const handleSetPage = (page: number) => {
        updateURL(page, itemsPerPage);
    };


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

    // Reset to page 1 when search query changes — also updates URL
    React.useEffect(() => {
        if (currentPage !== 1) {
            handleSetPage(1);
        }
    }, [deferredSearch]);


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
        const newPage = Math.max(currentPage - 1, 1);
        handleSetPage(newPage);
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [currentPage, handleSetPage]);

    const handleNextPage = useCallback(() => {
        const newPage = Math.min(currentPage + 1, totalPages);
        handleSetPage(newPage);
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [currentPage, totalPages, handleSetPage]);

    const handlePageClick = useCallback((page: number) => {
        handleSetPage(page);
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [handleSetPage]);


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
    };    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex  items-center justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6"/>My Prayer & Diary
                </h1>
                <div className="flex items-center gap-2">
                    <Button  variant="outline"
                             size="icon"
                             onClick={handleAddNewClick}
                             title="Add New Diary">
                        <PlusIcon className="h-4 w-4" />
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
            <PrayerLegend/>

            {/* Sticky Search & Pagination Header */}
            <div className="sticky top-10 md:top-[60px] z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 space-y-4 -mx-4 px-4 shadow-sm">
                {/* Search */}

                <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
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
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/diary/book")}
                        title="Book Reader View"
                    >
                        <BookOpen className="h-4 w-4"/>
                    </Button>

                </div>

                {searchQuery && (
                    <p className="text-xs text-muted-foreground">
                        Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                    </p>
                )}

                {/* Pagination Info Control */}
                {!isLoading && filteredEntries.length > 0 && (
                    <div className="flex flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={handleSetItemsPerPage}
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
                            <span className="text-xs">per page</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <p>
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="relative">
                {isLoading ? (
                    <LoadingState label={"Loading data..."}/>
                ) : filteredEntries.length === 0 ? (
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
                            <Button onClick={searchQuery ? () => setSearchQuery("") : handleAddNewClick} variant="outline" className="mt-4">
                                {searchQuery ? 'Clear Search' : 'Add First Entry'}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {/* Combined Entries List */}
                        <div className="space-y-4 mb-2">
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

                        {/* Sticky Bottom Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="sticky bottom-16 md:bottom-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 pb-4 -mx-4 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-center gap-2">
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
                                                <span key={index} className="text-muted-foreground px-1">
                                                    {page}
                                                </span>
                                            )
                                        ))}
                                    </div>

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
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <Dialog open={!!deletePrayerId} onOpenChange={() => setDeletePrayerId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete prayer log?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this day’s prayer record. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletePrayerId(null)} disabled={isDeletingPrayer}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmPrayerDelete} disabled={isDeletingPrayer}>{isDeletingPrayer ? "Deleting..." : "Delete"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete diary Log?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. Your diary entry will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}