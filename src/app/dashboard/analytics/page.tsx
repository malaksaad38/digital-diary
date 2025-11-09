// app/dashboard/analytics/page.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Loader2,
  CircleHelp,
  Circle,
  Diamond,
  XCircle,
  AlertCircle, Users
} from "lucide-react";
import { useCombinedHistory } from "@/hooks/use-prayer-queries";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, PieChart, Pie, Cell, Line, LineChart } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import Breadcrumbs from "@/components/Breadcrumbs";
import {Select,SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

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
  const { data: combinedEntries = [], isLoading } = useCombinedHistory();
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

  // Prepare chart data
  const overallChartData = [
    { name: "Missed", value: overallStats.missed, color: statusColors.missed },
    { name: "Alone", value: overallStats.alone, color: statusColors.alone },
    { name: "Jamaat", value: overallStats.jamaat, color: statusColors.jamaat },
    { name: "On Time", value: overallStats.onTime, color: statusColors["on time"] },
    // { name: "Not Selected", value: overallStats.notSelected, color: statusColors["not selected"] },
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
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Missed",
      value: monthlyStats.missed,
      color: "text-red-500",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    },
    {
      label: "Alone",
      value: monthlyStats.alone,
      color: "text-yellow-500",
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    },
    {
      label: "Jamaat",
      value: monthlyStats.jamaat,
      color: "text-green-500",
      icon: <Users className="h-4 w-4 text-green-500" />,
    },
    {
      label: "On Time",
      value: monthlyStats.onTime,
      color: "text-sky-500",
      icon: <Clock className="h-4 w-4 text-sky-500" />,
    },
    {
      label: "Success Rate",
      value: `${monthlySuccessRate}%`,
      color: "text-primary",
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pt-4 sm:pt-8 pb-8">
        <Breadcrumbs/>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />
            Prayer Analytics
            <Dialog>
              <DialogTrigger asChild>
                <button
                  aria-label="Show info about prayers"
                  className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                >
                  <CircleHelp size={20} className="relative" />
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
                          <Circle className="h-3 w-3 " />
                          <strong>Success Rate</strong>
                        </span>{" "}
                          — Your <strong>Success rate</strong> Based on Jamaat and On time (Takbeeri Oola). mean how many prayer you pray with Jamaat
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
          </h1>
          <p className="text-muted-foreground">Track your prayer consistency and progress</p>
        </div>

        {/* Overall Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-center">
          {isLoading ? (
            // Loading skeleton for stats cards
            <>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center rounded-xl bg-muted/30 py-3 sm:py-5 border border-border/50 animate-pulse"
                >
                  <div className="h-3 w-20 bg-muted rounded mb-2" />
                  <div className="h-8 w-12 bg-muted rounded mb-1" />
                  <div className="h-2 w-16 bg-muted rounded" />
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Missed (Qaza) */}
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

              {/* Alone */}
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

              {/* Jamaat */}
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

              {/* On Time */}
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

              {/* Success Rate */}
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
                  <Calendar className="h-5 w-5 text-primary" />
                  Monthly Report
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Overview of your monthly performance
                </CardDescription>
              </div>

              {/* ✨ Modern Month Selector */}
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
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
              // Loading skeleton for monthly stats
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center sm:items-start space-y-2 animate-pulse">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-6 w-12 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center sm:items-start space-y-1"
                  >
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


        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 w-full">
          {/* Overall Distribution Pie Chart */}
          <Card className="w-full">
            <CardHeader className="pb-1 sm:pb-2 text-center">
              <CardTitle className="text-[11px] sm:text-xs font-semibold">
                Overall Prayer Distribution
              </CardTitle>
              <CardDescription className="text-[9px] sm:text-[10px]">
                {isLoading ? "Loading..." : `Total prayers: ${overallStats.total}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-1.5">
              {isLoading ? (
                <div className="w-full max-w-[280px] sm:max-w-[320px] h-[160px] sm:h-[210px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    missed: { label: "Missed", color: statusColors.missed },
                    alone: { label: "Alone", color: statusColors.alone },
                    jamaat: { label: "Jamaat", color: statusColors.jamaat },
                    onTime: { label: "On Time", color: statusColors["on time"] },
                    // notSelected: { label: "Not Selected", color: statusColors["not selected"] },
                  }}
                  className="w-full max-w-[280px] sm:max-w-[320px] h-[160px] sm:h-[210px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overallChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {overallChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Prayer-wise Comparison Bar Chart */}
          <Card className="w-full">
            <CardHeader className="pb-1 sm:pb-2 text-center">
              <CardTitle className="text-[11px] sm:text-xs font-semibold">
                Prayer-wise Analysis
              </CardTitle>
              <CardDescription className="text-[9px] sm:text-[10px]">
                Compare performance across prayers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-1.5">
              {isLoading ? (
                <div className="w-full h-[160px] sm:h-[210px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[250px] sm:min-w-[300px] max-w-full mx-auto">
                    <ChartContainer
                      config={{
                        missed: { label: "Missed", color: statusColors.missed },
                        alone: { label: "Alone", color: statusColors.alone },
                        jamaat: { label: "Jamaat", color: statusColors.jamaat },
                        onTime: { label: "On Time", color: statusColors["on time"] },
                      }}
                      className="h-[160px] sm:h-[210px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prayerWiseChartData}
                          margin={{ top: 4, right: 6, left: -15, bottom: 3 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="prayer" tick={{ fontSize: 8 }} />
                          <YAxis tick={{ fontSize: 8 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: 8 }} />
                          <Bar dataKey="missed" stackId="a" fill={statusColors.missed} name="Missed" />
                          <Bar dataKey="alone" stackId="a" fill={statusColors.alone} name="Alone" />
                          <Bar dataKey="jamaat" stackId="a" fill={statusColors.jamaat} name="Jamaat" />
                          <Bar dataKey="onTime" stackId="a" fill={statusColors["on time"]} name="On Time" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>



        {/* Individual Prayer Performance Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoading ? (
            // Loading skeleton for prayer cards
            <>
              {prayers.map((prayer) => (
                <Card key={prayer} className="overflow-hidden">
                  <CardHeader className="px-1">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="h-4 w-24 bg-muted rounded mt-2 animate-pulse" />
                  </CardHeader>
                  <CardContent className="pt-1 space-y-2 px-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/40 pb-1.5">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </CardContent>
                  <div className="mt-3 mx-4 mb-4 h-2 rounded-full bg-muted animate-pulse" />
                </Card>
              ))}
            </>
          ) : (
            <>
              {prayers.map((prayer) => {
                const stats = prayerWiseStats[prayer];
                const prayerSuccessRate = stats.total > 0
                  ? ((stats.jamaat + stats.onTime) / stats.total * 100).toFixed(1)
                  : 0;

                return (
                  <Card
                    key={prayer}
                    className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 px-6"
                  >
                    {/* Subtle gradient accent on hover */}
                    <div className=" inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className={"px-1"}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg font-semibold capitalize flex items-center gap-2">
                          {prayerLabels[prayer as keyof typeof prayerLabels]}
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Success Rate:{" "}
                        <span className="font-medium text-foreground">{prayerSuccessRate}%</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-1 space-y-2 text-sm px-1">
                      <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
        <span className="text-muted-foreground flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full" /> Missed
        </span>
                        <span className="font-semibold text-foreground">{stats.missed}</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
        <span className="text-muted-foreground flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Alone
        </span>
                        <span className="font-semibold text-foreground">{stats.alone}</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
        <span className="text-muted-foreground flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" /> Jamaat
        </span>
                        <span className="font-semibold text-foreground">{stats.jamaat}</span>
                      </div>

                      <div className="flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1">
          <span className="w-2 h-2 bg-sky-500 rounded-full" /> On Time
        </span>
                        <span className="font-semibold text-foreground">{stats.onTime}</span>
                      </div>
                    </CardContent>

                    {/* Optional Progress Bar */}
                    <div className="mt-3 mx-4 mb-4 h-2 rounded-full bg-muted overflow-hidden ">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${prayerSuccessRate}%` }}
                      />
                    </div>
                  </Card>

                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}