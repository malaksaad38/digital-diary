// app/dashboard/analytics/landing-client.tsx
"use client";

import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
    AlertCircle,
    Calendar,
    Circle,
    CircleHelp,
    Clock,
    Diamond,
    Loader2,
    TrendingUp,
    TrendingDown,
    Users,
    XCircle,
    Activity,
    BarChart3,
    PieChart as PieChartIcon
} from "lucide-react";
import {useCombinedHistory} from "@/hooks/use-prayer-queries";
import {ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent} from "@/components/ui/chart";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    XAxis,
    YAxis,
    Line,
    LineChart,
    Area,
    AreaChart,
    RadialBarChart,
    RadialBar,
    ResponsiveContainer
} from "recharts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];

const statusColors = {
    missed: "#ef4444",
    alone: "#facc15",
    jamaat: "#22c55e",
    "on time": "#0ea5e9",
    "not selected": "#9ca3af",
};

const prayerLabels = {
    fajr: "Fajr",
    zuhr: "Zuhr",
    asar: "Asar",
    maghrib: "Maghrib",
    esha: "Esha",
};

export default function PrayerAnalyticsDashboard() {
    const {data: combinedEntries = [], isLoading} = useCombinedHistory();
    const [selectedMonth, setSelectedMonth] = React.useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Calculate overall statistics
    const overallStats = React.useMemo(() => {
        const stats = {
            missed: 0,
            alone: 0,
            jamaat: 0,
            onTime: 0,
            notSelected: 0,
            total: 0,
        };

        combinedEntries.forEach((entry: any) => {
            if (entry.prayer) {
                prayers.forEach((prayer) => {
                    const status = entry.prayer[prayer]?.toLowerCase();
                    stats.total++;

                    if (!status || status === "not selected") {
                        stats.notSelected++;
                    } else if (status === "missed") {
                        stats.missed++;
                    } else if (status === "alone") {
                        stats.alone++;
                    } else if (status === "jamaat") {
                        stats.jamaat++;
                    } else if (status === "on time") {
                        stats.onTime++;
                    }
                });
            }
        });

        return stats;
    }, [combinedEntries]);

    // Calculate monthly statistics
    const monthlyStats = React.useMemo(() => {
        const stats = {
            missed: 0,
            alone: 0,
            jamaat: 0,
            onTime: 0,
            notSelected: 0,
            total: 0,
            daysWithData: 0,
        };

        combinedEntries.forEach((entry: any) => {
            const entryDate = new Date(entry.date);
            const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

            if (entryMonth === selectedMonth && entry.prayer) {
                stats.daysWithData++;
                prayers.forEach((prayer) => {
                    const status = entry.prayer[prayer]?.toLowerCase();
                    stats.total++;

                    if (!status || status === "not selected") {
                        stats.notSelected++;
                    } else if (status === "missed") {
                        stats.missed++;
                    } else if (status === "alone") {
                        stats.alone++;
                    } else if (status === "jamaat") {
                        stats.jamaat++;
                    } else if (status === "on time") {
                        stats.onTime++;
                    }
                });
            }
        });

        return stats;
    }, [combinedEntries, selectedMonth]);

    // Calculate prayer-wise statistics
    const prayerWiseStats = React.useMemo(() => {
        const stats: any = {};

        prayers.forEach((prayer) => {
            stats[prayer] = {
                missed: 0,
                alone: 0,
                jamaat: 0,
                onTime: 0,
                notSelected: 0,
                total: 0,
            };
        });

        combinedEntries.forEach((entry: any) => {
            if (entry.prayer) {
                prayers.forEach((prayer) => {
                    const status = entry.prayer[prayer]?.toLowerCase();
                    stats[prayer].total++;

                    if (!status || status === "not selected") {
                        stats[prayer].notSelected++;
                    } else if (status === "missed") {
                        stats[prayer].missed++;
                    } else if (status === "alone") {
                        stats[prayer].alone++;
                    } else if (status === "jamaat") {
                        stats[prayer].jamaat++;
                    } else if (status === "on time") {
                        stats[prayer].onTime++;
                    }
                });
            }
        });

        return stats;
    }, [combinedEntries]);

    // NEW: Calculate daily trend data for the selected month
    const dailyTrendData = React.useMemo(() => {
        const dailyData: any = {};

        combinedEntries.forEach((entry: any) => {
            const entryDate = new Date(entry.date);
            const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

            if (entryMonth === selectedMonth && entry.prayer) {
                const day = entryDate.getDate();

                if (!dailyData[day]) {
                    dailyData[day] = {
                        day: day,
                        missed: 0,
                        alone: 0,
                        jamaat: 0,
                        onTime: 0,
                        successRate: 0,
                        total: 0
                    };
                }

                prayers.forEach((prayer) => {
                    const status = entry.prayer[prayer]?.toLowerCase();
                    dailyData[day].total++;

                    if (status === "missed") {
                        dailyData[day].missed++;
                    } else if (status === "alone") {
                        dailyData[day].alone++;
                    } else if (status === "jamaat") {
                        dailyData[day].jamaat++;
                    } else if (status === "on time") {
                        dailyData[day].onTime++;
                    }
                });

                // Calculate success rate for the day
                const successful = dailyData[day].jamaat + dailyData[day].onTime;
                dailyData[day].successRate = dailyData[day].total > 0
                    ? ((successful / dailyData[day].total) * 100).toFixed(1)
                    : 0;
            }
        });

        return Object.values(dailyData).sort((a: any, b: any) => a.day - b.day);
    }, [combinedEntries, selectedMonth]);

    // NEW: Calculate weekly comparison data
    const weeklyComparisonData = React.useMemo(() => {
        const weeklyData: any = {};

        combinedEntries.forEach((entry: any) => {
            const entryDate = new Date(entry.date);
            const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

            if (entryMonth === selectedMonth && entry.prayer) {
                const weekNumber = Math.ceil(entryDate.getDate() / 7);

                if (!weeklyData[weekNumber]) {
                    weeklyData[weekNumber] = {
                        week: `Week ${weekNumber}`,
                        missed: 0,
                        alone: 0,
                        jamaat: 0,
                        onTime: 0,
                        total: 0
                    };
                }

                prayers.forEach((prayer) => {
                    const status = entry.prayer[prayer]?.toLowerCase();
                    weeklyData[weekNumber].total++;

                    if (status === "missed") weeklyData[weekNumber].missed++;
                    else if (status === "alone") weeklyData[weekNumber].alone++;
                    else if (status === "jamaat") weeklyData[weekNumber].jamaat++;
                    else if (status === "on time") weeklyData[weekNumber].onTime++;
                });
            }
        });

        return Object.values(weeklyData);
    }, [combinedEntries, selectedMonth]);

    // NEW: Calculate time-of-day performance (prayer-specific success rates)
    const prayerSuccessRates = React.useMemo(() => {
        return prayers.map((prayer) => {
            const stats = prayerWiseStats[prayer];
            const successRate = stats.total > 0
                ? ((stats.jamaat + stats.onTime) / stats.total * 100)
                : 0;

            return {
                prayer: prayerLabels[prayer as keyof typeof prayerLabels],
                successRate: parseFloat(successRate.toFixed(1)),
                fill: successRate >= 90 ? statusColors["on time"] :
                    successRate >= 60 ? statusColors.jamaat :
                        successRate >= 30 ? statusColors.alone :
                            statusColors.missed
            };
        });
    }, [prayerWiseStats]);

    // NEW: Calculate cumulative statistics over time
    const cumulativeData = React.useMemo(() => {
        let cumulative = { jamaat: 0, onTime: 0, missed: 0, alone: 0 };
        const data: any[] = [];

        const sortedEntries = [...combinedEntries]
            .filter((entry: any) => {
                const entryDate = new Date(entry.date);
                const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
                return entryMonth === selectedMonth;
            })
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedEntries.forEach((entry: any) => {
            if (entry.prayer) {
                prayers.forEach((prayer) => {
                    const status = entry.prayer[prayer]?.toLowerCase();
                    if (status === "jamaat") cumulative.jamaat++;
                    else if (status === "on time") cumulative.onTime++;
                    else if (status === "missed") cumulative.missed++;
                    else if (status === "alone") cumulative.alone++;
                });

                const day = new Date(entry.date).getDate();
                data.push({
                    day,
                    jamaat: cumulative.jamaat,
                    onTime: cumulative.onTime,
                    missed: cumulative.missed,
                    alone: cumulative.alone
                });
            }
        });

        return data;
    }, [combinedEntries, selectedMonth]);

    // Prepare chart data
    const overallChartData = [
        {name: "Missed", value: overallStats.missed, color: statusColors.missed},
        {name: "Alone", value: overallStats.alone, color: statusColors.alone},
        {name: "Jamaat", value: overallStats.jamaat, color: statusColors.jamaat},
        {name: "On Time", value: overallStats.onTime, color: statusColors["on time"]},
    ];

    const prayerWiseChartData = prayers.map((prayer) => ({
        prayer: prayerLabels[prayer as keyof typeof prayerLabels],
        missed: prayerWiseStats[prayer].missed,
        alone: prayerWiseStats[prayer].alone,
        jamaat: prayerWiseStats[prayer].jamaat,
        onTime: prayerWiseStats[prayer].onTime,
        notSelected: prayerWiseStats[prayer].notSelected,
    }));

    // Calculate success rate
    const successRate = overallStats.total > 0
        ? ((overallStats.jamaat + overallStats.onTime) / overallStats.total * 100).toFixed(1)
        : 0;

    const monthlySuccessRate = monthlyStats.total > 0
        ? ((monthlyStats.jamaat + monthlyStats.onTime) / monthlyStats.total * 100).toFixed(1)
        : 0;

    // Get available months
    const availableMonths = React.useMemo(() => {
        const months = new Set<string>();
        combinedEntries.forEach((entry: any) => {
            const date = new Date(entry.date);
            months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        });
        return Array.from(months).sort().reverse();
    }, [combinedEntries]);

    const stats = [
        {
            label: "Days Tracked",
            value: monthlyStats.daysWithData,
            color: "text-foreground",
            icon: <Calendar className="h-4 w-4 text-muted-foreground"/>,
        },
        {
            label: "Missed",
            value: monthlyStats.missed,
            color: "text-red-500",
            icon: <XCircle className="h-4 w-4 text-red-500"/>,
        },
        {
            label: "Alone",
            value: monthlyStats.alone,
            color: "text-yellow-500",
            icon: <AlertCircle className="h-4 w-4 text-yellow-500"/>,
        },
        {
            label: "Jamaat",
            value: monthlyStats.jamaat,
            color: "text-green-500",
            icon: <Users className="h-4 w-4 text-green-500"/>,
        },
        {
            label: "On Time",
            value: monthlyStats.onTime,
            color: "text-sky-500",
            icon: <Clock className="h-4 w-4 text-sky-500"/>,
        },
        {
            label: "Success Rate",
            value: `${monthlySuccessRate}%`,
            color: "text-primary",
            icon: <TrendingUp className="h-4 w-4 text-primary"/>,
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-4 space-y-6 pt-4 sm:pt-8 pb-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7"/>
                        Prayer Analytics
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    aria-label="Show info about prayers"
                                    className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                                >
                                    <CircleHelp size={20} className="relative"/>
                                </button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>About Prayer Analytics</DialogTitle>
                                    <DialogDescription asChild>
                                        <div className="space-y-3 text-sm mt-2 leading-relaxed">
                                            <p>
                                                This section helps you track your five daily prayers{" "}
                                                <strong>Fajr</strong>, <strong>Dhuhr</strong>, <strong>Asr</strong>,{" "}
                                                <strong>Maghrib</strong>, and <strong>Isha</strong>.
                                                Each prayer log show the count of your prayers
                                            </p>

                                            <div className="space-y-3 pt-2">
                                                <p>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Circle className="h-3 w-3 "/>
                                                        <strong>Success Rate</strong>
                                                    </span>{" "}
                                                    — Your <strong>Success rate</strong> Based on Jamaat and On time
                                                    (Takbeeri Oola). mean how many prayer you pray with Jamaat
                                                </p>
                                                <p>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Circle className="h-3 w-3 text-red-500 fill-red-500"/>
                                                        <strong>Missed</strong>
                                                    </span>{" "}
                                                    — You <strong>missed the prayer time</strong> (Qaza), meaning you
                                                    didn't pray within its proper time.
                                                </p>
                                                <p>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Circle className="h-3 w-3 text-yellow-400 fill-yellow-400"/>
                                                        <strong>Alone</strong>
                                                    </span>{" "}
                                                    — You <strong>prayed alone</strong> and not in congregation
                                                    (Jamaat).
                                                </p>
                                                <p>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Circle className="h-3 w-3 text-green-500 fill-green-500"/>
                                                        <strong>Jamaat</strong>
                                                    </span>{" "}
                                                    — You <strong>performed the prayer with Jamaat</strong> (in
                                                    congregation).
                                                </p>
                                                <p>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Diamond className="h-3 w-3 text-sky-500 fill-sky-500"/>
                                                        <strong>On Time</strong>
                                                    </span>{" "}
                                                    — You <strong>prayed in Jamaat with Takbeeri Oola</strong> (the
                                                    first Takbeer at the start of the prayer).
                                                </p>
                                            </div>
                                        </div>
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </h1>
                    <p className="text-muted-foreground">Track your prayer consistency and progress</p>
                </div>

                {/* Overall Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 text-center">
                    {isLoading ? (
                        <>
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-center rounded-xl bg-muted/30 py-3 sm:py-5 border border-border/50 animate-pulse"
                                >
                                    <div className="h-3 w-20 bg-muted rounded mb-2"/>
                                    <div className="h-8 w-12 bg-muted rounded mb-1"/>
                                    <div className="h-2 w-16 bg-muted rounded"/>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-cyan-50/80 to-transparent dark:from-cyan-950/20 py-3 sm:py-5 border border-transparent hover:border-cyan-200/40 transition-all duration-300">
                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">
                                    Total Prayers
                                </p>
                                <p className="text-2xl sm:text-3xl font-semibold text-cyan-500 mt-1">
                                    {overallStats.total}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                    Prayer count
                                </p>
                            </div>
                            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-red-50/80 to-transparent dark:from-red-950/20 py-3 sm:py-5 border border-transparent hover:border-red-200/40 transition-all duration-300">
                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">
                                    Missed (Qaza)
                                </p>
                                <p className="text-2xl sm:text-3xl font-semibold text-red-500 mt-1">
                                    {overallStats.missed}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                    {overallStats.total > 0
                                        ? ((overallStats.missed / overallStats.total) * 100).toFixed(1)
                                        : 0}
                                    % of total
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-yellow-50/80 to-transparent dark:from-yellow-950/20 py-3 sm:py-5 border border-transparent hover:border-yellow-200/40 transition-all duration-300">
                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">
                                    Alone
                                </p>
                                <p className="text-2xl sm:text-3xl font-semibold text-yellow-500 mt-1">
                                    {overallStats.alone}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                    {overallStats.total > 0
                                        ? ((overallStats.alone / overallStats.total) * 100).toFixed(1)
                                        : 0}
                                    % of total
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-green-50/80 to-transparent dark:from-green-950/20 py-3 sm:py-5 border border-transparent hover:border-green-200/40 transition-all duration-300">
                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">
                                    Jamaat
                                </p>
                                <p className="text-2xl sm:text-3xl font-semibold text-green-600 mt-1">
                                    {overallStats.jamaat}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                    {overallStats.total > 0
                                        ? ((overallStats.jamaat / overallStats.total) * 100).toFixed(1)
                                        : 0}
                                    % of total
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-sky-50/80 to-transparent dark:from-sky-950/20 py-3 sm:py-5 border border-transparent hover:border-sky-200/40 transition-all duration-300">
                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">
                                    On Time
                                </p>
                                <p className="text-2xl sm:text-3xl font-semibold text-sky-600 mt-1">
                                    {overallStats.onTime}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                    {overallStats.total > 0
                                        ? ((overallStats.onTime / overallStats.total) * 100).toFixed(1)
                                        : 0}
                                    % of total
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/20 py-3 sm:py-5 border border-transparent hover:border-primary/40 transition-all duration-300">
                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">
                                    Success Rate
                                </p>
                                <p className="text-2xl sm:text-3xl font-semibold text-primary mt-1">
                                    {successRate}%
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                    Jamaat + On Time
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Monthly Filter and Stats */}
                <Card className="overflow-hidden border border-border/50 shadow-sm">
                    <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                                    <Calendar className="h-5 w-5 text-primary"/>
                                    Monthly Report
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Overview of your monthly performance
                                </CardDescription>
                            </div>

                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select month"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMonths.map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {new Date(month + "-01").toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                            })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center sm:items-start space-y-2 animate-pulse">
                                        <div className="h-4 w-20 bg-muted rounded"/>
                                        <div className="h-6 w-12 bg-muted rounded"/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="flex flex-col items-center sm:items-start space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {stat.icon}
                                            <span>{stat.label}</span>
                                        </div>
                                        <p className={`text-xl sm:text-2xl font-semibold ${stat.color}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* NEW: Advanced Analytics Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="trends" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Trends</span>
                        </TabsTrigger>
                        <TabsTrigger value="comparison" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Compare</span>
                        </TabsTrigger>
                        <TabsTrigger value="prayers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Prayers</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Overall Distribution Pie Chart */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Overall Prayer Distribution</CardTitle>
                                    <CardDescription className="text-xs">
                                        {isLoading ? "Loading..." : `Total prayers: ${overallStats.total}`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-center items-center p-4">
                                    {isLoading ? (
                                        <div className="w-full h-[250px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                missed: {label: "Missed", color: statusColors.missed},
                                                alone: {label: "Alone", color: statusColors.alone},
                                                jamaat: {label: "Jamaat", color: statusColors.jamaat},
                                                onTime: {label: "On Time", color: statusColors["on time"]},
                                            }}
                                            className="w-full h-[250px]"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={overallChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {overallChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color}/>
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                            </PieChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Prayer Success Rate Radial Chart */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Prayer Success Rates</CardTitle>
                                    <CardDescription className="text-xs">
                                        Performance by prayer time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {isLoading ? (
                                        <div className="w-full h-[250px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                successRate: {label: "Success Rate", color: statusColors.jamaat},
                                            }}
                                            className="w-full h-[250px]"
                                        >
                                            <RadialBarChart
                                                data={prayerSuccessRates}
                                                innerRadius="10%"
                                                outerRadius="90%"
                                            >
                                                <RadialBar
                                                    label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                                                    background
                                                    dataKey="successRate"
                                                />
                                                <Legend
                                                    iconSize={10}
                                                    layout="vertical"
                                                    verticalAlign="middle"
                                                    align="right"
                                                    wrapperStyle={{ fontSize: '12px' }}
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                            </RadialBarChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Daily Success Rate Line Chart */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Daily Success Rate Trend</CardTitle>
                                    <CardDescription className="text-xs">
                                        Track your daily performance throughout the month
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {isLoading ? (
                                        <div className="w-full h-[300px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                successRate: {label: "Success Rate %", color: statusColors.jamaat},
                                            }}
                                            className="w-full h-[300px]"
                                        >
                                            <LineChart data={dailyTrendData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="day"
                                                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                                                />
                                                <YAxis
                                                    label={{ value: 'Success Rate %', angle: -90, position: 'insideLeft' }}
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="successRate"
                                                    stroke={statusColors.jamaat}
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cumulative Area Chart */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Cumulative Prayer Progress</CardTitle>
                                    <CardDescription className="text-xs">
                                        See how your prayers accumulate over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {isLoading ? (
                                        <div className="w-full h-[300px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                jamaat: {label: "Jamaat", color: statusColors.jamaat},
                                                onTime: {label: "On Time", color: statusColors["on time"]},
                                                alone: {label: "Alone", color: statusColors.alone},
                                                missed: {label: "Missed", color: statusColors.missed},
                                            }}
                                            className="w-full h-[300px]"
                                        >
                                            <AreaChart data={cumulativeData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="day"
                                                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                                                />
                                                <YAxis
                                                    label={{ value: 'Cumulative Count', angle: -90, position: 'insideLeft' }}
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="onTime"
                                                    stackId="1"
                                                    stroke={statusColors["on time"]}
                                                    fill={statusColors["on time"]}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="jamaat"
                                                    stackId="1"
                                                    stroke={statusColors.jamaat}
                                                    fill={statusColors.jamaat}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="alone"
                                                    stackId="1"
                                                    stroke={statusColors.alone}
                                                    fill={statusColors.alone}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="missed"
                                                    stackId="1"
                                                    stroke={statusColors.missed}
                                                    fill={statusColors.missed}
                                                />
                                            </AreaChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Comparison Tab */}
                    <TabsContent value="comparison" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Prayer-wise Comparison Bar Chart */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Prayer-wise Analysis</CardTitle>
                                    <CardDescription className="text-xs">
                                        Compare performance across prayers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {isLoading ? (
                                        <div className="w-full h-[300px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                missed: {label: "Missed", color: statusColors.missed},
                                                alone: {label: "Alone", color: statusColors.alone},
                                                jamaat: {label: "Jamaat", color: statusColors.jamaat},
                                                onTime: {label: "On Time", color: statusColors["on time"]},
                                            }}
                                            className="w-full h-[300px]"
                                        >
                                            <BarChart data={prayerWiseChartData}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="prayer"/>
                                                <YAxis/>
                                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                                <ChartLegend content={<ChartLegendContent />} />
                                                <Bar dataKey="missed" stackId="a" fill={statusColors.missed}/>
                                                <Bar dataKey="alone" stackId="a" fill={statusColors.alone}/>
                                                <Bar dataKey="jamaat" stackId="a" fill={statusColors.jamaat}/>
                                                <Bar dataKey="onTime" stackId="a" fill={statusColors["on time"]}/>
                                            </BarChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Weekly Comparison */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Weekly Comparison</CardTitle>
                                    <CardDescription className="text-xs">
                                        Performance breakdown by week
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {isLoading ? (
                                        <div className="w-full h-[300px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                missed: {label: "Missed", color: statusColors.missed},
                                                alone: {label: "Alone", color: statusColors.alone},
                                                jamaat: {label: "Jamaat", color: statusColors.jamaat},
                                                onTime: {label: "On Time", color: statusColors["on time"]},
                                            }}
                                            className="w-full h-[300px]"
                                        >
                                            <BarChart data={weeklyComparisonData}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="week"/>
                                                <YAxis/>
                                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                                <ChartLegend content={<ChartLegendContent />} />
                                                <Bar dataKey="onTime" fill={statusColors["on time"]}/>
                                                <Bar dataKey="jamaat" fill={statusColors.jamaat}/>
                                                <Bar dataKey="alone" fill={statusColors.alone}/>
                                                <Bar dataKey="missed" fill={statusColors.missed}/>
                                            </BarChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Individual Prayers Tab */}
                    <TabsContent value="prayers" className="space-y-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-3">
                            {isLoading ? (
                                <>
                                    {prayers.map((prayer) => (
                                        <Card key={prayer} className="overflow-hidden">
                                            <CardHeader className="px-1 flex justify-between items-center">
                                                <div className="flex items-center justify-between">
                                                    <div className="h-5 w-16 bg-muted rounded animate-pulse"/>
                                                </div>
                                                <div className="h-4 w-24 bg-muted rounded animate-pulse"/>
                                            </CardHeader>
                                            <CardContent className="pt-1 space-y-2 px-1">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className="flex items-center justify-between border-b border-border/40 pb-1.5">
                                                        <div className="h-4 w-16 bg-muted rounded animate-pulse"/>
                                                        <div className="h-4 w-8 bg-muted rounded animate-pulse"/>
                                                    </div>
                                                ))}
                                            </CardContent>
                                            <div className="mt-3 mx-4 mb-4 h-2 rounded-full bg-muted animate-pulse"/>
                                        </Card>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {prayers.map((prayer) => {
                                        const stats = prayerWiseStats[prayer];
                                        const prayerSuccessRate: any = stats.total > 0
                                            ? ((stats.jamaat + stats.onTime) / stats.total * 100).toFixed(1)
                                            : 0;

                                        return (
                                            <Card
                                                key={prayer}
                                                className={`${prayerSuccessRate <= 29 && "bg-red-300/10" || prayerSuccessRate <= 59 && "bg-yellow-300/10" || prayerSuccessRate <= 89 && "bg-green-300/10" || prayerSuccessRate >= 90 && "bg-sky-300/10"} group relative gap-5 md:gap-4 overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 p-4 px-6 md:px-4`}
                                            >
                                                {prayerSuccessRate <= 29 &&
                                                    <div className="flex justify-end z-10 absolute right-5 md:right-3.5 top-9">
                                                        <div className="relative flex justify-center items-center gap-1.5 text-red-950 px-2 py-0.5 bg-red-300 rounded-full shadow-lg shadow-red-300/50 text-[9px]">
                                                            <span className={"w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"}></span>
                                                            <span className={"absolute left-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"}></span>
                                                            <span>Bad</span>
                                                        </div>
                                                    </div>
                                                    || prayerSuccessRate <= 59 &&
                                                    <div className="flex justify-end z-10 absolute right-5 md:right-3.5 top-9">
                                                        <div className="relative flex justify-center items-center gap-1.5 text-yellow-950 px-2 py-0.5 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50 text-[9px]">
                                                            <span className={"w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"}></span>
                                                            <span className={"absolute left-2 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"}></span>
                                                            <span>Normal</span>
                                                        </div>
                                                    </div>
                                                    || prayerSuccessRate <= 89 &&
                                                    <div className="flex justify-end z-10 absolute right-5 md:right-3.5 top-9">
                                                        <div className="relative flex justify-center items-center gap-1.5 text-green-950 px-2 py-0.5 bg-green-300 rounded-full shadow-lg shadow-green-300/50 text-[9px]">
                                                            <span className={"w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"}></span>
                                                            <span className={"absolute left-2 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"}></span>
                                                            <span>Good</span>
                                                        </div>
                                                    </div>
                                                    || prayerSuccessRate >= 90 &&
                                                    <div className="flex justify-end z-10 absolute right-5 md:right-3.5 top-9">
                                                        <div className="relative flex justify-center items-center gap-1.5 text-sky-950 px-2 py-0.5 bg-sky-300 rounded-full shadow-lg shadow-sky-300/50 text-[9px]">
                                                            <span className={"w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"}></span>
                                                            <span className={"absolute left-2 w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"}></span>
                                                            <span>Excellent</span>
                                                        </div>
                                                    </div>}

                                                <div className="inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>

                                                <CardHeader className={"px-0"}>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="font-semibold capitalize flex items-center gap-2">
                                                            {prayerLabels[prayer as keyof typeof prayerLabels]}
                                                        </div>
                                                        <div className="text-xs pt-2">
                                                            <div className="font-medium text-foreground flex justify-between">
                                                                <span className={"text-muted-foreground"}>Success Rate:</span> {prayerSuccessRate}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="pt-1 space-y-2 md:text-xs px-1">
                                                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-red-500 rounded-full"/> Missed
                                                        </span>
                                                        <span className="font-semibold text-foreground">{stats.missed}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-yellow-500 rounded-full"/> Alone
                                                        </span>
                                                        <span className="font-semibold text-foreground">{stats.alone}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"/> Jamaat
                                                        </span>
                                                        <span className="font-semibold text-foreground">{stats.jamaat}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-sky-500 rounded-full"/> On Time
                                                        </span>
                                                        <span className="font-semibold text-foreground">{stats.onTime}</span>
                                                    </div>
                                                </CardContent>

                                                <div className="mt-3 mb-4 h-2 rounded-full bg-white dark:bg-muted overflow-hidden">
                                                    <div
                                                        className={`h-full ${prayerSuccessRate < 30 && "bg-red-600" || prayerSuccessRate < 60 && "bg-yellow-500" || prayerSuccessRate < 90 && "bg-green-500" || prayerSuccessRate > 90 && "bg-sky-500"} transition-all`}
                                                        style={{width: `${prayerSuccessRate}%`}}
                                                    />
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}