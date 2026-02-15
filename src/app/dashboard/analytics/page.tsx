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
    Pie,
    PieChart,
    XAxis,
    YAxis,
    Line,
    LineChart,
    Area,
    AreaChart,
    RadialBarChart,
    RadialBar, Legend
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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type PrayerName = "fajr" | "zuhr" | "asar" | "maghrib" | "esha";
type PrayerStatus = "missed" | "alone" | "jamaat" | "on time" | "not selected";

interface PrayerData {
    fajr?: string;
    zuhr?: string;
    asar?: string;
    maghrib?: string;
    esha?: string;
}

interface PrayerEntry {
    date: string;
    prayer?: PrayerData;
}

interface PrayerStats {
    missed: number;
    alone: number;
    jamaat: number;
    onTime: number;
    notSelected: number;
    total: number;
}

interface MonthlyStats extends PrayerStats {
    daysWithData: number;
}

interface DailyTrendData {
    day: number;
    missed: number;
    alone: number;
    jamaat: number;
    onTime: number;
    successRate: number;
    total: number;
}

interface WeeklyData {
    week: string;
    missed: number;
    alone: number;
    jamaat: number;
    onTime: number;
    total: number;
}

interface PrayerSuccessRate {
    prayer: string;
    successRate: number;
    fill: string;
}

interface CumulativeData {
    day: number;
    jamaat: number;
    onTime: number;
    missed: number;
    alone: number;
}

interface ChartData {
    name: string;
    value: number;
    color: string;
}

interface PrayerWiseChartData {
    prayer: string;
    missed: number;
    alone: number;
    jamaat: number;
    onTime: number;
    notSelected: number;
}

interface StatusBadgeConfig {
    label: string;
    color: string;
    bgColor: string;
    shadowColor: string;
    dotColor: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRAYERS: readonly PrayerName[] = ["fajr", "zuhr", "asar", "maghrib", "esha"] as const;

const STATUS_COLORS = {
    missed: "#ef4444",
    alone: "#facc15",
    jamaat: "#22c55e",
    "on time": "#0ea5e9",
    "not selected": "#9ca3af",
} as const;

const PRAYER_LABELS: Record<PrayerName, string> = {
    fajr: "Fajr",
    zuhr: "Zuhr",
    asar: "Asar",
    maghrib: "Maghrib",
    esha: "Esha",
} as const;

const SUCCESS_RATE_THRESHOLDS = {
    BAD: 29,
    NORMAL: 59,
    GOOD: 89,
    EXCELLENT: 90,
} as const;

const EMPTY_PRAYER_STATS: PrayerStats = {
    missed: 0,
    alone: 0,
    jamaat: 0,
    onTime: 0,
    notSelected: 0,
    total: 0,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const normalizeStatus = (status?: string): string => {
    return status?.toLowerCase() || "not selected";
};

const isEntryInMonth = (entry: PrayerEntry, targetMonth: string): boolean => {
    const entryDate = new Date(entry.date);
    const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
    return entryMonth === targetMonth;
};

const getCurrentMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (monthString: string): string => {
    return new Date(monthString + "-01").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
    });
};

const calculateSuccessRate = (stats: PrayerStats): number => {
    if (stats.total === 0) return 0;
    return ((stats.jamaat + stats.onTime) / stats.total) * 100;
};

const getStatusBadgeConfig = (successRate: number): StatusBadgeConfig => {
    if (successRate <= SUCCESS_RATE_THRESHOLDS.BAD) {
        return {
            label: "Bad",
            color: "text-red-950",
            bgColor: "bg-red-300",
            shadowColor: "shadow-red-300/50",
            dotColor: "bg-red-500",
        };
    }
    if (successRate <= SUCCESS_RATE_THRESHOLDS.NORMAL) {
        return {
            label: "Normal",
            color: "text-yellow-950",
            bgColor: "bg-yellow-300",
            shadowColor: "shadow-yellow-300/50",
            dotColor: "bg-yellow-500",
        };
    }
    if (successRate <= SUCCESS_RATE_THRESHOLDS.GOOD) {
        return {
            label: "Good",
            color: "text-green-950",
            bgColor: "bg-green-300",
            shadowColor: "shadow-green-300/50",
            dotColor: "bg-green-500",
        };
    }
    return {
        label: "Excellent",
        color: "text-sky-950",
        bgColor: "bg-sky-300",
        shadowColor: "shadow-sky-300/50",
        dotColor: "bg-sky-500",
    };
};

const getProgressBarColor = (successRate: number): string => {
    if (successRate < 30) return "bg-red-600";
    if (successRate < 60) return "bg-yellow-500";
    if (successRate < 90) return "bg-green-500";
    return "bg-sky-500";
};

const getCardBackgroundColor = (successRate: number): string => {
    if (successRate <= SUCCESS_RATE_THRESHOLDS.BAD) return "bg-red-300/10";
    if (successRate <= SUCCESS_RATE_THRESHOLDS.NORMAL) return "bg-yellow-300/10";
    if (successRate <= SUCCESS_RATE_THRESHOLDS.GOOD) return "bg-green-300/10";
    return "bg-sky-300/10";
};

const updateStatsForStatus = (stats: PrayerStats, status: string): void => {
    stats.total++;

    switch (status) {
        case "missed":
            stats.missed++;
            break;
        case "alone":
            stats.alone++;
            break;
        case "jamaat":
            stats.jamaat++;
            break;
        case "on time":
            stats.onTime++;
            break;
        default:
            stats.notSelected++;
    }
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCardSkeleton: React.FC = () => (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 py-3 sm:py-5 border border-border/50 animate-pulse">
        <div className="h-3 w-20 bg-muted rounded mb-2"/>
        <div className="h-8 w-12 bg-muted rounded mb-1"/>
        <div className="h-2 w-16 bg-muted rounded"/>
    </div>
);

const ChartSkeleton: React.FC<{ height?: string }> = ({ height = "h-[250px]" }) => (
    <div className={`w-full ${height} flex items-center justify-center`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
    </div>
);

interface StatusBadgeProps {
    config: StatusBadgeConfig;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ config }) => (
    <div className="flex justify-end z-10 absolute right-5 md:right-3.5 top-9">
        <div className={`relative flex justify-center items-center gap-1.5 ${config.color} px-2 py-0.5 ${config.bgColor} rounded-full shadow-lg ${config.shadowColor} text-[9px]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-ping`}/>
            <span className={`absolute left-2 w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`}/>
            <span>{config.label}</span>
        </div>
    </div>
);

interface InfoDialogProps {
    trigger: React.ReactNode;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ trigger }) => (
    <Dialog>
        <DialogTrigger asChild>
            {trigger}
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
                            Each prayer log shows the count of your prayers.
                        </p>

                        <div className="space-y-3 pt-2">
                            <p>
                                <span className="inline-flex items-center gap-1.5">
                                    <Circle className="h-3 w-3"/>
                                    <strong>Success Rate</strong>
                                </span>{" "}
                                — Your <strong>Success rate</strong> based on Jamaat and On time
                                (Takbeeri Oola). Shows how many prayers you prayed with Jamaat.
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
);

interface OverallStatCardProps {
    label: string;
    value: number | string;
    percentage?: string;
    gradientFrom: string;
    hoverBorder: string;
    textColor: string;
}

const OverallStatCard: React.FC<OverallStatCardProps> = ({
                                                             label,
                                                             value,
                                                             percentage,
                                                             gradientFrom,
                                                             hoverBorder,
                                                             textColor
                                                         }) => (
    <div className={`flex flex-col items-center justify-center rounded-xl bg-gradient-to-b ${gradientFrom} to-transparent py-3 sm:py-5 border border-transparent ${hoverBorder} transition-all duration-300`}>
        <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide">
            {label}
        </p>
        <p className={`text-2xl sm:text-3xl font-semibold ${textColor} mt-1`}>
            {value}
        </p>
        {percentage && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {percentage}
            </p>
        )}
    </div>
);

interface MonthlyStatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
}

const MonthlyStatItem: React.FC<MonthlyStatItemProps> = ({ icon, label, value, color }) => (
    <div className="flex flex-col items-center sm:items-start space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {icon}
            <span>{label}</span>
        </div>
        <p className={`text-xl sm:text-2xl font-semibold ${color}`}>
            {value}
        </p>
    </div>
);

interface PrayerCardSkeletonProps {
    prayer: PrayerName;
}

const PrayerCardSkeleton: React.FC<PrayerCardSkeletonProps> = ({ prayer }) => (
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
);

interface PrayerCardProps {
    prayer: PrayerName;
    stats: PrayerStats;
}

const PrayerCard: React.FC<PrayerCardProps> = ({ prayer, stats }) => {
    const prayerSuccessRate = calculateSuccessRate(stats);
    const badgeConfig = getStatusBadgeConfig(prayerSuccessRate);
    const progressColor = getProgressBarColor(prayerSuccessRate);
    const cardBgColor = getCardBackgroundColor(prayerSuccessRate);

    return (
        <Card className={`${cardBgColor} group relative gap-5 md:gap-4 overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 p-4 px-6 md:px-4`}>
            <StatusBadge config={badgeConfig} />

            <div className="inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>

            <CardHeader className="px-0">
                <div className="flex flex-col gap-1">
                    <div className="font-semibold capitalize flex items-center gap-2">
                        {PRAYER_LABELS[prayer]}
                    </div>
                    <div className="text-xs pt-2">
                        <div className="font-medium text-foreground flex justify-between">
                            <span className="text-muted-foreground">Success Rate:</span> {prayerSuccessRate.toFixed(1)}%
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
                    className={`h-full ${progressColor} transition-all`}
                    style={{width: `${prayerSuccessRate}%`}}
                />
            </div>
        </Card>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PrayerAnalyticsDashboard() {
    const {data: combinedEntries = [], isLoading, error} = useCombinedHistory();
    const [selectedMonth, setSelectedMonth] = React.useState(getCurrentMonth);

    // Calculate all statistics in optimized hooks
    const overallStats = React.useMemo((): PrayerStats => {
        if (!combinedEntries?.length) return EMPTY_PRAYER_STATS;

        const stats = { ...EMPTY_PRAYER_STATS };

        combinedEntries.forEach((entry: PrayerEntry) => {
            if (!entry.prayer) return;

            PRAYERS.forEach((prayer) => {
                const status = normalizeStatus(entry.prayer?.[prayer]);
                updateStatsForStatus(stats, status);
            });
        });

        return stats;
    }, [combinedEntries]);

    const monthlyStats = React.useMemo((): MonthlyStats => {
        if (!combinedEntries?.length) {
            return { ...EMPTY_PRAYER_STATS, daysWithData: 0 };
        }

        const stats: MonthlyStats = { ...EMPTY_PRAYER_STATS, daysWithData: 0 };

        combinedEntries.forEach((entry: PrayerEntry) => {
            if (!isEntryInMonth(entry, selectedMonth) || !entry.prayer) return;

            stats.daysWithData++;

            PRAYERS.forEach((prayer) => {
                const status = normalizeStatus(entry.prayer?.[prayer]);
                updateStatsForStatus(stats, status);
            });
        });

        return stats;
    }, [combinedEntries, selectedMonth]);

    const prayerWiseStats = React.useMemo((): Record<PrayerName, PrayerStats> => {
        if (!combinedEntries?.length) {
            return PRAYERS.reduce((acc, prayer) => {
                acc[prayer] = { ...EMPTY_PRAYER_STATS };
                return acc;
            }, {} as Record<PrayerName, PrayerStats>);
        }

        const stats = PRAYERS.reduce((acc, prayer) => {
            acc[prayer] = { ...EMPTY_PRAYER_STATS };
            return acc;
        }, {} as Record<PrayerName, PrayerStats>);

        combinedEntries.forEach((entry: PrayerEntry) => {
            if (!entry.prayer) return;

            PRAYERS.forEach((prayer) => {
                const status = normalizeStatus(entry.prayer?.[prayer]);
                updateStatsForStatus(stats[prayer], status);
            });
        });

        return stats;
    }, [combinedEntries]);

    const dailyTrendData = React.useMemo((): DailyTrendData[] => {
        if (!combinedEntries?.length) return [];

        const dailyData: Record<number, DailyTrendData> = {};

        combinedEntries.forEach((entry: PrayerEntry) => {
            if (!isEntryInMonth(entry, selectedMonth) || !entry.prayer) return;

            const day = new Date(entry.date).getDate();

            if (!dailyData[day]) {
                dailyData[day] = {
                    day,
                    missed: 0,
                    alone: 0,
                    jamaat: 0,
                    onTime: 0,
                    successRate: 0,
                    total: 0
                };
            }

            PRAYERS.forEach((prayer) => {
                const status = normalizeStatus(entry.prayer?.[prayer]);
                dailyData[day].total++;

                if (status === "missed") dailyData[day].missed++;
                else if (status === "alone") dailyData[day].alone++;
                else if (status === "jamaat") dailyData[day].jamaat++;
                else if (status === "on time") dailyData[day].onTime++;
            });

            const successful = dailyData[day].jamaat + dailyData[day].onTime;
            dailyData[day].successRate = dailyData[day].total > 0
                ? parseFloat(((successful / dailyData[day].total) * 100).toFixed(1))
                : 0;
        });

        return Object.values(dailyData).sort((a, b) => a.day - b.day);
    }, [combinedEntries, selectedMonth]);

    const weeklyComparisonData = React.useMemo((): WeeklyData[] => {
        if (!combinedEntries?.length) return [];

        const weeklyData: Record<number, WeeklyData> = {};

        combinedEntries.forEach((entry: PrayerEntry) => {
            if (!isEntryInMonth(entry, selectedMonth) || !entry.prayer) return;

            const weekNumber = Math.ceil(new Date(entry.date).getDate() / 7);

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

            PRAYERS.forEach((prayer) => {
                const status = normalizeStatus(entry.prayer?.[prayer]);
                weeklyData[weekNumber].total++;

                if (status === "missed") weeklyData[weekNumber].missed++;
                else if (status === "alone") weeklyData[weekNumber].alone++;
                else if (status === "jamaat") weeklyData[weekNumber].jamaat++;
                else if (status === "on time") weeklyData[weekNumber].onTime++;
            });
        });

        return Object.values(weeklyData);
    }, [combinedEntries, selectedMonth]);

    const prayerSuccessRates = React.useMemo((): PrayerSuccessRate[] => {
        return PRAYERS.map((prayer) => {
            const stats = prayerWiseStats[prayer];
            const successRate = calculateSuccessRate(stats);

            const fill = successRate >= 90 ? STATUS_COLORS["on time"] :
                successRate >= 60 ? STATUS_COLORS.jamaat :
                    successRate >= 30 ? STATUS_COLORS.alone :
                        STATUS_COLORS.missed;

            return {
                prayer: PRAYER_LABELS[prayer],
                successRate: parseFloat(successRate.toFixed(1)),
                fill
            };
        });
    }, [prayerWiseStats]);

    const cumulativeData = React.useMemo((): CumulativeData[] => {
        if (!combinedEntries?.length) return [];

        const cumulative = { jamaat: 0, onTime: 0, missed: 0, alone: 0 };
        const data: CumulativeData[] = [];

        const sortedEntries = [...combinedEntries]
            .filter((entry: PrayerEntry) => isEntryInMonth(entry, selectedMonth))
            .sort((a: PrayerEntry, b: PrayerEntry) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

        sortedEntries.forEach((entry: PrayerEntry) => {
            if (!entry.prayer) return;

            PRAYERS.forEach((prayer) => {
                const status = normalizeStatus(entry.prayer?.[prayer]);
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
        });

        return data;
    }, [combinedEntries, selectedMonth]);

    const overallChartData = React.useMemo((): ChartData[] => [
        {name: "Missed", value: overallStats.missed, color: STATUS_COLORS.missed},
        {name: "Alone", value: overallStats.alone, color: STATUS_COLORS.alone},
        {name: "Jamaat", value: overallStats.jamaat, color: STATUS_COLORS.jamaat},
        {name: "On Time", value: overallStats.onTime, color: STATUS_COLORS["on time"]},
    ], [overallStats]);

    const prayerWiseChartData = React.useMemo((): PrayerWiseChartData[] => {
        return PRAYERS.map((prayer) => ({
            prayer: PRAYER_LABELS[prayer],
            missed: prayerWiseStats[prayer].missed,
            alone: prayerWiseStats[prayer].alone,
            jamaat: prayerWiseStats[prayer].jamaat,
            onTime: prayerWiseStats[prayer].onTime,
            notSelected: prayerWiseStats[prayer].notSelected,
        }));
    }, [prayerWiseStats]);

    const availableMonths = React.useMemo((): string[] => {
        if (!combinedEntries?.length) return [];

        const months = new Set<string>();
        combinedEntries.forEach((entry: PrayerEntry) => {
            const date = new Date(entry.date);
            months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        });
        return Array.from(months).sort().reverse();
    }, [combinedEntries]);

    const successRate = calculateSuccessRate(overallStats).toFixed(1);
    const monthlySuccessRate = calculateSuccessRate(monthlyStats).toFixed(1);

    const monthlyStatsData = React.useMemo(() => [
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
    ], [monthlyStats, monthlySuccessRate]);

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-500">Error Loading Data</CardTitle>
                        <CardDescription>
                            Failed to load prayer analytics. Please try refreshing the page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-4 space-y-6 pt-4 sm:pt-8 pb-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7"/>
                        Prayer Analytics
                        <InfoDialog
                            trigger={
                                <button
                                    aria-label="Show info about prayers"
                                    className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                                >
                                    <CircleHelp size={20} className="relative"/>
                                </button>
                            }
                        />
                    </h1>
                    <p className="text-muted-foreground">Track your prayer consistency and progress</p>
                </div>

                {/* Overall Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 text-center">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                        <>
                            <OverallStatCard
                                label="Total Prayers"
                                value={overallStats.total}
                                percentage="Prayer count"
                                gradientFrom="from-cyan-50/80 dark:from-cyan-950/20"
                                hoverBorder="hover:border-cyan-200/40"
                                textColor="text-cyan-500"
                            />
                            <OverallStatCard
                                label="Missed (Qaza)"
                                value={overallStats.missed}
                                percentage={`${overallStats.total > 0 ? ((overallStats.missed / overallStats.total) * 100).toFixed(1) : 0}% of total`}
                                gradientFrom="from-red-50/80 dark:from-red-950/20"
                                hoverBorder="hover:border-red-200/40"
                                textColor="text-red-500"
                            />
                            <OverallStatCard
                                label="Alone"
                                value={overallStats.alone}
                                percentage={`${overallStats.total > 0 ? ((overallStats.alone / overallStats.total) * 100).toFixed(1) : 0}% of total`}
                                gradientFrom="from-yellow-50/80 dark:from-yellow-950/20"
                                hoverBorder="hover:border-yellow-200/40"
                                textColor="text-yellow-500"
                            />
                            <OverallStatCard
                                label="Jamaat"
                                value={overallStats.jamaat}
                                percentage={`${overallStats.total > 0 ? ((overallStats.jamaat / overallStats.total) * 100).toFixed(1) : 0}% of total`}
                                gradientFrom="from-green-50/80 dark:from-green-950/20"
                                hoverBorder="hover:border-green-200/40"
                                textColor="text-green-600"
                            />
                            <OverallStatCard
                                label="On Time"
                                value={overallStats.onTime}
                                percentage={`${overallStats.total > 0 ? ((overallStats.onTime / overallStats.total) * 100).toFixed(1) : 0}% of total`}
                                gradientFrom="from-sky-50/80 dark:from-sky-950/20"
                                hoverBorder="hover:border-sky-200/40"
                                textColor="text-sky-600"
                            />
                            <OverallStatCard
                                label="Success Rate"
                                value={`${successRate}%`}
                                percentage="Jamaat + On Time"
                                gradientFrom="from-primary/10 dark:from-primary/20"
                                hoverBorder="hover:border-primary/40"
                                textColor="text-primary"
                            />
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

                            <Select
                                value={selectedMonth}
                                onValueChange={setSelectedMonth}
                                aria-label="Select month for prayer statistics"
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select month"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMonths.map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {formatMonthLabel(month)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex flex-col items-center sm:items-start space-y-2 animate-pulse">
                                        <div className="h-4 w-20 bg-muted rounded"/>
                                        <div className="h-6 w-12 bg-muted rounded"/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                                {monthlyStatsData.map((stat) => (
                                    <MonthlyStatItem
                                        key={stat.label}
                                        icon={stat.icon}
                                        label={stat.label}
                                        value={stat.value}
                                        color={stat.color}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Advanced Analytics Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
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
                                        <ChartSkeleton />
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                missed: {label: "Missed", color: STATUS_COLORS.missed},
                                                alone: {label: "Alone", color: STATUS_COLORS.alone},
                                                jamaat: {label: "Jamaat", color: STATUS_COLORS.jamaat},
                                                onTime: {label: "On Time", color: STATUS_COLORS["on time"]},
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
                                                    outerRadius={60}
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
                                        <ChartSkeleton />
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                successRate: {label: "Success Rate", color: STATUS_COLORS.jamaat},
                                            }}
                                            className="w-full h-[250px]"
                                        >
                                            <RadialBarChart
                                                data={prayerSuccessRates}
                                                innerRadius="10%"
                                                outerRadius="90%"
                                                className={""}
                                            >
                                                <RadialBar
                                                    label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                                                    background
                                                    dataKey="successRate"
                                                />
                                                <Legend
                                                    iconSize={10}
                                                    layout="vertical"
                                                    verticalAlign="bottom"
                                                    align="left"
                                                    wrapperStyle={{ fontSize: '12px' }}
                                                    payload={[
                                                        { value: "Fajr " +  prayerSuccessRates[0]?.successRate, type: "circle", id: "Fajr", color: prayerSuccessRates[0]?.fill },
                                                        { value: "Zuhr " +  prayerSuccessRates[1]?.successRate, type: "circle", id: "Zuhr", color: prayerSuccessRates[1]?.fill },
                                                        { value: "Asar " +  prayerSuccessRates[2]?.successRate, type: "circle", id: "Asar", color: prayerSuccessRates[2]?.fill },
                                                        { value: "Maghrib " +  prayerSuccessRates[3]?.successRate, type: "circle", id: "Maghrib", color: prayerSuccessRates[3]?.fill },
                                                        { value: "Esha " +  prayerSuccessRates[4]?.successRate, type: "circle", id: "Esha", color: prayerSuccessRates[4]?.fill },
                                                    ]}
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
                                        <ChartSkeleton height="h-[300px]" />
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                successRate: {label: "Success Rate %", color: STATUS_COLORS.jamaat},
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
                                                    stroke={STATUS_COLORS.jamaat}
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
                                        <ChartSkeleton height="h-[300px]" />
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                jamaat: {label: "Jamaat", color: STATUS_COLORS.jamaat},
                                                onTime: {label: "On Time", color: STATUS_COLORS["on time"]},
                                                alone: {label: "Alone", color: STATUS_COLORS.alone},
                                                missed: {label: "Missed", color: STATUS_COLORS.missed},
                                            }}
                                            className="w-full h-[300px]"
                                        >
                                            <AreaChart data={cumulativeData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="day"
                                                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -3 }}
                                                />
                                                <YAxis
                                                    label={{ value: 'Cumulative Count', angle: -90, position: 'insideLeft' }}
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="onTime"
                                                    stackId="1"
                                                    stroke={STATUS_COLORS["on time"]}
                                                    fill={STATUS_COLORS["on time"]}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="jamaat"
                                                    stackId="1"
                                                    stroke={STATUS_COLORS.jamaat}
                                                    fill={STATUS_COLORS.jamaat}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="alone"
                                                    stackId="1"
                                                    stroke={STATUS_COLORS.alone}
                                                    fill={STATUS_COLORS.alone}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="missed"
                                                    stackId="1"
                                                    stroke={STATUS_COLORS.missed}
                                                    fill={STATUS_COLORS.missed}
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
                                        <ChartSkeleton height="h-[300px]" />
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                missed: {label: "Missed", color: STATUS_COLORS.missed},
                                                alone: {label: "Alone", color: STATUS_COLORS.alone},
                                                jamaat: {label: "Jamaat", color: STATUS_COLORS.jamaat},
                                                onTime: {label: "On Time", color: STATUS_COLORS["on time"]},
                                            }}
                                            className="w-full h-[300px]"
                                        >
                                            <BarChart data={prayerWiseChartData}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="prayer" />
                                                <YAxis label={{ value: 'Prayers Count Total', angle: -90, position: 'insideLeft' }}/>
                                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                                <ChartLegend  content={<ChartLegendContent />} />
                                                <Bar dataKey="missed" stackId="a" fill={STATUS_COLORS.missed}/>
                                                <Bar dataKey="alone" stackId="a" fill={STATUS_COLORS.alone}/>
                                                <Bar dataKey="jamaat" stackId="a" fill={STATUS_COLORS.jamaat}/>
                                                <Bar dataKey="onTime" stackId="a"  fill={STATUS_COLORS["on time"]}/>
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
                                        <ChartSkeleton height="h-[300px]" />
                                    ) : (
                                        <ChartContainer
                                            config={{
                                                missed: {label: "Missed", color: STATUS_COLORS.missed},
                                                alone: {label: "Alone", color: STATUS_COLORS.alone},
                                                jamaat: {label: "Jamaat", color: STATUS_COLORS.jamaat},
                                                onTime: {label: "On Time", color: STATUS_COLORS["on time"]},
                                            }}
                                            className="w-full h-[300px]"
                                        >
                                            <BarChart data={weeklyComparisonData}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="week" />
                                                <YAxis label={{ value: 'Prayers Count', angle: -90, position: 'insideLeft' }}/>
                                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                                <ChartLegend content={<ChartLegendContent />} />
                                                <Bar dataKey="missed" fill={STATUS_COLORS.missed}/>
                                                <Bar dataKey="alone" fill={STATUS_COLORS.alone}/>
                                                <Bar dataKey="jamaat" fill={STATUS_COLORS.jamaat}/>
                                                <Bar dataKey="onTime" fill={STATUS_COLORS["on time"]}/>
                                            </BarChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Individual Prayers Tab */}
                    <TabsContent value="prayers" className="space-y-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-3">
                            {isLoading ? (
                                PRAYERS.map((prayer) => (
                                    <PrayerCardSkeleton key={prayer} prayer={prayer} />
                                ))
                            ) : (
                                PRAYERS.map((prayer) => (
                                    <PrayerCard
                                        key={prayer}
                                        prayer={prayer}
                                        stats={prayerWiseStats[prayer]}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}