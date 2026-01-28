// Updated PrayerForm.tsx with React Query
"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {CalendarIcon, Circle, CircleHelp, Diamond, Pencil, Save, StarsIcon} from "lucide-react";
import {format, parse} from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {useCreatePrayer, usePrayerByDate, useUpdatePrayer} from "@/hooks/use-prayer-queries";
import {motion} from "framer-motion";

export default function PrayerForm({session}: any) {
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
        if (dateParam) {
            try {
                return parse(dateParam, "yyyy-MM-dd", new Date());
            } catch {
                return new Date();
            }
        }
        return new Date();
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const [formData, setFormData] = useState({
        fajr: "",
        zuhr: "",
        asar: "",
        maghrib: "",
        esha: "",
        zikr: "",
    });

    const [reciteMode, setReciteMode] = useState("");
    const [customRecite, setCustomRecite] = useState("");

    const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];
    const prayerOptions = ["Missed", "Alone", "Jamaat", "On Time"];
    const reciteOptions = ["0", "3", "Custom"];
    const zikrOptions = ["Half", "Full", "None"];
    const customReciteValues = [
        "0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2", "2.25", "2.5", "2.75", "3",
        "3.25", "3.5", "3.75", "4", "4.25", "4.5", "4.75", "5",
        "5.25", "5.5", "5.75", "6", "6.25", "6.5", "6.75", "7",
        "7.25", "7.5", "7.75", "8", "8.25", "8.5", "8.75", "9",
        "9.25", "9.5", "9.75", "10",
        "10.25", "10.5", "10.75", "11", "11.25", "11.5", "11.75", "12",
        "12.25", "12.5", "12.75", "13", "13.25", "13.5", "13.75", "14",
        "14.25", "14.5", "14.75", "15",
        "15.25", "15.5", "15.75", "16", "16.25", "16.5", "16.75", "17",
        "17.25", "17.5", "17.75", "18", "18.25", "18.5", "18.75", "19",
        "19.25", "19.5", "19.75", "20",
        "20.25", "20.5", "20.75", "21", "21.25", "21.5", "21.75", "22",
        "22.25", "22.5", "22.75", "23", "23.25", "23.5", "23.75", "24",
        "24.25", "24.5", "24.75", "25",
        "25.25", "25.5", "25.75", "26", "26.25", "26.5", "26.75", "27",
        "27.25", "27.5", "27.75", "28", "28.25", "28.5", "28.75", "29",
        "29.25", "29.5", "29.75", "30"
    ];

    const userId = session?.userId;
    const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

    // Use React Query hooks
    const {data: prayerData, isLoading} = usePrayerByDate(dateStr, !!selectedDate && !!userId);
    const createPrayer = useCreatePrayer();
    const updatePrayer = useUpdatePrayer();

    const existingPrayer = prayerData?.success && prayerData?.data ? prayerData.data : null;
    const existingPrayerId = existingPrayer?._id || null;

    // Update form when prayer data changes
    useEffect(() => {
        if (existingPrayer) {
            setFormData({
                fajr: capitalizeFirst(existingPrayer.fajr),
                zuhr: capitalizeFirst(existingPrayer.zuhr),
                asar: capitalizeFirst(existingPrayer.asar),
                maghrib: capitalizeFirst(existingPrayer.maghrib),
                esha: capitalizeFirst(existingPrayer.esha),
                zikr: capitalizeFirst(existingPrayer.zikr) || "",
            });

            if (existingPrayer.recite === "0" || existingPrayer.recite === "3") {
                setReciteMode(existingPrayer.recite);
                setCustomRecite("");
            } else {
                setReciteMode("Custom");
                setCustomRecite(existingPrayer.recite);
            }

            setIsFormDisabled(true);
            setIsEditMode(false);
        } else {
            resetForm();
            setIsFormDisabled(false);
            setIsEditMode(false);
        }
    }, [existingPrayer]);

    const capitalizeFirst = (str: string) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const resetForm = () => {
        setFormData({
            fajr: "",
            zuhr: "",
            asar: "",
            maghrib: "",
            esha: "",
            zikr: "",
        });
        setReciteMode("");
        setCustomRecite("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleEditClick = () => {
        setTimeout(() => {
            setIsEditMode(true);
        }, 500);
        setIsFormDisabled(false);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setIsFormDisabled(true);
        // Reset form to existing data
        if (existingPrayer) {
            setFormData({
                fajr: capitalizeFirst(existingPrayer.fajr),
                zuhr: capitalizeFirst(existingPrayer.zuhr),
                asar: capitalizeFirst(existingPrayer.asar),
                maghrib: capitalizeFirst(existingPrayer.maghrib),
                esha: capitalizeFirst(existingPrayer.esha),
                zikr: capitalizeFirst(existingPrayer.zikr) || "",
            });
            if (existingPrayer.recite === "0" || existingPrayer.recite === "3") {
                setReciteMode(existingPrayer.recite);
                setCustomRecite("");
            } else {
                setReciteMode("Custom");
                setCustomRecite(existingPrayer.recite);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) return;

        const finalRecite = reciteMode === "Custom" ? customRecite : reciteMode || "";

        const dataToSave = {
            userId,
            date: dateStr,
            fajr: formData.fajr.toLowerCase(),
            zuhr: formData.zuhr.toLowerCase(),
            asar: formData.asar.toLowerCase(),
            maghrib: formData.maghrib.toLowerCase(),
            esha: formData.esha.toLowerCase(),
            recite: finalRecite.toLowerCase(),
            zikr: formData.zikr.toLowerCase(),
        };

        if (isEditMode && existingPrayerId) {
            updatePrayer.mutate(
                {id: existingPrayerId, ...dataToSave},
                {
                    onSuccess: () => {
                        setIsEditMode(false);
                        setIsFormDisabled(true);
                    },
                }
            );
        } else {
            createPrayer.mutate(dataToSave, {
                onSuccess: () => {
                    setIsFormDisabled(true);
                },
            });
        }
    };

    const getRadioClass = (option: string) => {
        switch (option) {
            case "Missed":
                return "accent-red-500";
            case "Alone":
                return "accent-yellow-400";
            case "Jamaat":
                return "accent-green-500";
            case "On Time":
                return "accent-sky-500";
            default:
                return "accent-gray-400";
        }
    };

    const getTextClass = (option: string) => {
        switch (option) {
            case "Missed":
                return "text-red-500";
            case "Alone":
                return "text-yellow-500";
            case "Jamaat":
                return "text-green-500";
            case "On Time":
                return "text-sky-500";
            default:
                return "text-gray-400";
        }
    };

    return (
        <Card className="w-full h-fit shadow-lg border-border/50">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
                    <StarsIcon className="h-6 w-6"/>
                    Daily Prayer
                </CardTitle>
                {existingPrayerId && !isEditMode && (
                    <p className="text-center  text-sm text-rose-400">
                        Prayer log exists for this date
                    </p>
                )}
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
                <form id="date" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    {/* Date Picker */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-3">Select Date</h3>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-[280px] justify-start text-left font-normal"
                                    disabled={isEditMode}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                    disabled={isEditMode}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Mobile Legend */}
                    <div
                        className="sm:hidden mb-3 flex flex-wrap justify-center items-center gap-2 text-[10px] font-medium text-muted-foreground">
                        {[
                            {label: "Missed", color: "bg-red-500", text: "text-red-500", border: "border-red-500/30"},
                            {
                                label: "Alone",
                                color: "bg-yellow-500",
                                text: "text-yellow-500",
                                border: "border-yellow-500/30"
                            },
                            {
                                label: "Jamaat",
                                color: "bg-green-500",
                                text: "text-green-500",
                                border: "border-green-500/30"
                            },
                            {label: "On Time", color: "bg-sky-500", text: "text-sky-500", border: "border-sky-500/30"},
                        ].map((item) => (
                            <div
                                key={item.label}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${item.text} ${item.border} bg-opacity-10 border`}
                            >
                                <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>


                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <motion.div
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{duration: 0.3, ease: [0.25, 0.1, 0.25, 1]}}
                                className="flex flex-col items-center gap-4 p-8"
                            >
                                {/* iPhone-style minimal spinner */}
                                <div className="relative w-16 h-16">
                                    <motion.div
                                        animate={{rotate: 360}}
                                        transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                                        className="absolute inset-0"
                                    >
                                        <svg
                                            className="w-full h-full"
                                            viewBox="0 0 50 50"
                                        >
                                            <circle
                                                className="stroke-primary/20"
                                                cx="25"
                                                cy="25"
                                                r="20"
                                                fill="none"
                                                strokeWidth="4"
                                            />
                                            <circle
                                                className="stroke-primary"
                                                cx="25"
                                                cy="25"
                                                r="20"
                                                fill="none"
                                                strokeWidth="4"
                                                strokeDasharray="80 40"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </motion.div>
                                </div>

                                <motion.p
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{delay: 0.2}}
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    Loading prayer data...
                                </motion.p>
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            {/* Prayer Table - keeping your existing UI */}
                            <div id="edit" className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-1.5">
                                        Prayers
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button
                                                    aria-label="Show info about prayers"
                                                    className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                                                >
                                                    <CircleHelp size={16} className="relative top-[1px]"/>
                                                </button>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>About Daily Prayers</DialogTitle>
                                                    <DialogDescription asChild>
                                                        <div className="space-y-3 text-sm mt-2 leading-relaxed">
                                                            <p>
                                                                This section helps you track your five daily prayers
                                                                —{" "}
                                                                <strong>Fajr</strong>, <strong>Dhuhr</strong>, <strong>Asr</strong>,{" "}
                                                                <strong>Maghrib</strong>, and <strong>Isha</strong>.
                                                                Each prayer can be marked based on how it was performed:
                                                            </p>

                                                            <div className="space-y-3 pt-2">
                                                                <p>
                    <span className="inline-flex items-center gap-1.5">
                      <Circle className="h-3 w-3 text-red-500 fill-red-500"/>
                      <strong>Missed</strong>
                    </span>{" "} — You <strong>missed the prayer time</strong> (Qaza), meaning you didn’t pray within
                                                                    its proper time.
                                                                </p>
                                                                <p>
                    <span className="inline-flex items-center gap-1.5">
                      <Circle className="h-3 w-3 text-yellow-400 fill-yellow-400"/>
                      <strong>Alone</strong>
                    </span>{" "}
                                                                    — You <strong>prayed alone</strong> and not in
                                                                    congregation (Jamaat).
                                                                </p>

                                                                <p>
                    <span className="inline-flex items-center gap-1.5">
                      <Circle className="h-3 w-3 text-green-500 fill-green-500"/>
                      <strong>Jamaat</strong>
                    </span>{" "}
                                                                    — You <strong>performed the prayer with
                                                                    Jamaat</strong> (in congregation).
                                                                </p>

                                                                <p>
                    <span className="inline-flex items-center gap-1.5">
                      <Diamond className="h-3 w-3 text-sky-500 fill-sky-500"/>
                      <strong>On Time</strong>
                    </span>{" "}
                                                                    — You <strong>prayed in Jamaat with Takbeeri
                                                                    Oola</strong> (the first Takbeer at the start of the
                                                                    prayer).
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </DialogContent>
                                        </Dialog>
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead
                                                        className="w-20 sm:w-32 text-left font-semibold text-xs sm:text-sm">
                                                        Prayer
                                                    </TableHead>
                                                    {prayerOptions.map((opt) => (
                                                        <TableHead
                                                            key={opt}
                                                            className={`text-center font-semibold text-xs sm:text-sm px-1 sm:px-4 ${getTextClass(opt)}`}
                                                        >
                                                            <span className="hidden sm:inline">{opt}</span>
                                                            <span className="sm:hidden">
                                {opt === "Missed" ? "M" : opt === "Alone" ? "A" : opt === "Jamaat" ? "J" : "OT"}
                              </span>
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {prayers.map((prayer) => (
                                                    <TableRow key={prayer}>
                                                        <TableCell
                                                            className="capitalize font-semibold text-xs sm:text-sm">
                                                            {prayer}
                                                        </TableCell>
                                                        {prayerOptions.map((opt) => (
                                                            <TableCell key={opt} className="text-center px-1 sm:px-4">
                                                                <input
                                                                    type="radio"
                                                                    name={prayer}
                                                                    value={opt}
                                                                    checked={formData[prayer as keyof typeof formData]?.toLowerCase() === opt.toLowerCase()}
                                                                    onChange={handleChange}
                                                                    className={`w-4 h-4 ${getRadioClass(opt)} cursor-pointer`}
                                                                    required={false}
                                                                    disabled={isFormDisabled}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            {/* Recite Section */}
                            <div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-1.5">
                                        Recite Quran (Parah)
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button
                                                    aria-label="Show info about Quran recitation"
                                                    className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                                                >
                                                    <CircleHelp size={16} className="relative top-[1px]"/>
                                                </button>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>About Reciting Quran (Parah)</DialogTitle>
                                                    <DialogDescription asChild>
                                                        <div className="space-y-3 text-sm mt-2 leading-relaxed">
                                                            <p>
                                                                This section helps you track your <strong>daily Quran
                                                                recitation progress</strong>.
                                                                Each number or fraction represents how much of
                                                                a <strong>Parah (Juz)</strong> you recited today.
                                                            </p>

                                                            <div className="space-y-3 pt-2">
                                                                <p>
                                                                    <strong>0</strong> — You <strong>did not recite
                                                                    Quran today</strong>.
                                                                </p>

                                                                <p>
                                                                    <strong>0.25</strong> — You recited <strong>one-fourth
                                                                    (¼) of a Parah</strong>,
                                                                    called <em>Rubu'</em> (رُبُع) in Arabic.
                                                                </p>

                                                                <p>
                                                                    <strong>0.5</strong> — You recited <strong>half (½)
                                                                    of a Parah</strong>, known as <em>Nisf</em> (نِصف).
                                                                </p>

                                                                <p>
                                                                    <strong>0.75</strong> — You recited <strong>three-fourths
                                                                    (¾) of a Parah</strong>,
                                                                    called <em>Thuluth</em> or <em>Thalātha
                                                                    Arba'</em> (ثلاثة أرباع).
                                                                </p>

                                                                <p>
                                                                    <strong>1</strong> — You completed <strong>one full
                                                                    Parah (Juz)</strong>.
                                                                </p>

                                                                <p>
                                                                    <strong>2</strong> — You completed <strong>two
                                                                    Parahs</strong> today.
                                                                </p>

                                                                <p>
                                                                    <strong>Custom</strong> — You can select a <strong>custom
                                                                    value</strong> if you recited more or less than
                                                                    these options (for example, 1.5 Parah or 0.3 Parah).
                                                                </p>
                                                            </div>

                                                            <p className="pt-2 text-muted-foreground">
                                                                🌙 Tip: Tracking smaller portions (like 0.25 or 0.5)
                                                                helps you build consistency and stay connected with the
                                                                Quran daily.
                                                            </p>
                                                        </div>
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </DialogContent>
                                        </Dialog>
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                                    {reciteOptions.map((opt) => (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-2 px-2 sm:px-3 py-2 border rounded-md cursor-pointer transition text-xs sm:text-sm ${
                                                reciteMode === opt
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:bg-muted/50"
                                            } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="reciteMode"
                                                value={opt}
                                                checked={reciteMode === opt}
                                                onChange={(e) => setReciteMode(e.target.value)}
                                                className="accent-primary"
                                                disabled={isFormDisabled}
                                            />
                                            <span className="font-medium">{opt}</span>
                                        </label>
                                    ))}

                                    {reciteMode === "Custom" && (
                                        <Select
                                            onValueChange={(value) => setCustomRecite(value)}
                                            value={customRecite}
                                            disabled={isFormDisabled}
                                        >
                                            <SelectTrigger className="w-24 sm:w-28 text-xs sm:text-sm">
                                                <SelectValue placeholder="Select"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customReciteValues.map((v) => (
                                                    <SelectItem key={v} value={v}>
                                                        {v}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>

                            {/* Zikr Section */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-1.5">
                                    Zikr (Daily Tazbehaat)
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button
                                                aria-label="Show information about Zikr"
                                                className="flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                                            >
                                                <CircleHelp size={16} className="relative top-[1px]"/>
                                            </button>
                                        </DialogTrigger>

                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>About Daily Zikr (Azkar)</DialogTitle>
                                                <DialogDescription asChild>
                                                    <div className="space-y-4 text-sm mt-2 leading-relaxed">
                                                        <p>
                                                            This section helps you <strong>track your daily remembrance
                                                            (Zikr)</strong> — performed in the
                                                            <strong> morning and evening</strong> to maintain spiritual
                                                            connection and mindfulness.
                                                        </p>

                                                        <div className="border-l border-border pl-4 space-y-3">
                                                            <p>
                                                                <strong>None (0)</strong> — You did not perform your
                                                                Zikr today.
                                                            </p>
                                                            <p>
                                                                <strong>Half (½)</strong> — You completed one session,
                                                                either <em>morning</em> or <em>evening</em>.
                                                            </p>
                                                            <p>
                                                                <strong>Full (1)</strong> — You completed both your
                                                                morning and evening Azkar today. Excellent consistency!
                                                            </p>
                                                        </div>

                                                        <div className="border-t border-border pt-4 space-y-2">
                                                            <p className="font-medium">Daily Zikr includes:</p>
                                                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                                <li>
                                                                    <strong>100×</strong> — <em>Thesra Kalimah (ثلاثة
                                                                    كلمات)</em>
                                                                </li>
                                                                <li>
                                                                    <strong>100×</strong> — <em>Darood Shareef (دُرود
                                                                    شريف)</em>
                                                                </li>
                                                                <li>
                                                                    <strong>100×</strong> — <em>Istighfar
                                                                    (اِسْتِغْفَار)</em>
                                                                </li>
                                                            </ul>
                                                        </div>

                                                        <p className="text-muted-foreground pt-2">
                                                            🌿 <strong>Tip:</strong> Aim for consistency over quantity.
                                                            Even a single sincere recitation brings peace and reward.
                                                        </p>
                                                    </div>
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                </h3>

                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {zikrOptions.map((opt: string) => (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-2 px-2 sm:px-3 py-2 border rounded-md cursor-pointer transition text-xs sm:text-sm ${
                                                formData.zikr === opt
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:bg-muted/50"
                                            } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="zikr"
                                                value={opt}
                                                checked={formData.zikr === opt}
                                                onChange={handleChange}
                                                className="accent-primary"
                                                disabled={isFormDisabled}
                                            />
                                            <span className="font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                {existingPrayerId && !isEditMode ? (
                                    <Button type="button" onClick={handleEditClick} className="w-full"
                                            variant="outline">
                                        <Pencil className="mr-2 h-4 w-4"/>
                                        Edit Prayer Log
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="submit"
                                            className="w-full sm:flex-1"
                                            disabled={isFormDisabled || createPrayer.isPending || updatePrayer.isPending}
                                        >
                                            <Save className="mr-2 h-4 w-4"/>
                                            {createPrayer.isPending || updatePrayer.isPending
                                                ? "Saving..."
                                                : isEditMode
                                                    ? "Update Prayer Log"
                                                    : "Save Prayer Log"}
                                        </Button>
                                        {isEditMode && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                                className="w-full sm:w-auto"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}