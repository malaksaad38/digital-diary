"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {BookOpen, CalendarIcon, Edit2, Save} from "lucide-react";
import {format, parse} from "date-fns";
import {motion} from "framer-motion";
import {useCreateDiary, useDiaryByDate, useUpdateDiary} from "@/hooks/use-prayer-queries";

export default function DiaryForm({session}: any) {
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
        fajrToZuhr: "",
        zuhrToAsar: "",
        asarToMaghrib: "",
        maghribToEsha: "",
        eshaToFajr: "",
        customNotes: "",
        summary: "",
    });

    const timeFields = [
        {key: "fajrToZuhr", label: "Fajr to Zuhr", placeholder: "What happened between Fajr and Zuhr prayers..."},
        {key: "zuhrToAsar", label: "Zuhr to Asar", placeholder: "What happened between Zuhr and Asar prayers..."},
        {
            key: "asarToMaghrib",
            label: "Asar to Maghrib",
            placeholder: "What happened between Asar and Maghrib prayers..."
        },
        {
            key: "maghribToEsha",
            label: "Maghrib to Esha",
            placeholder: "What happened between Maghrib and Esha prayers..."
        },
        {key: "eshaToFajr", label: "Esha to Fajr", placeholder: "What happened between Esha and next Fajr..."},
    ];

    const userId = session?.user?.id;
    const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

    // Use React Query hooks
    const {data: diaryData, isLoading} = useDiaryByDate(dateStr, !!selectedDate && !!userId);
    const createDiary = useCreateDiary();
    const updateDiary = useUpdateDiary();

    const existingDiary = diaryData?.success && diaryData?.data ? diaryData.data : null;
    const existingDiaryId = existingDiary?._id || null;

    // Update form when diary data changes
    useEffect(() => {
        if (existingDiary) {
            setFormData({
                fajrToZuhr: existingDiary.fajrToZuhr || "",
                zuhrToAsar: existingDiary.zuhrToAsar || "",
                asarToMaghrib: existingDiary.asarToMaghrib || "",
                maghribToEsha: existingDiary.maghribToEsha || "",
                eshaToFajr: existingDiary.eshaToFajr || "",
                customNotes: existingDiary.customNotes || "",
                summary: existingDiary.summary || "",
            });
            setIsFormDisabled(true);
            setIsEditMode(false);
        } else {
            resetForm();
            setIsFormDisabled(false);
            setIsEditMode(false);
        }
    }, [existingDiary]);

    const resetForm = () => {
        setFormData({
            fajrToZuhr: "",
            zuhrToAsar: "",
            asarToMaghrib: "",
            maghribToEsha: "",
            eshaToFajr: "",
            customNotes: "",
            summary: "",
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleEditClick = () => {
        setTimeout(() => {
            setIsEditMode(true);
        }, 500);
        setIsFormDisabled(false);
        router.push("#diaryDate");
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setIsFormDisabled(true);
        // Reset form to existing data
        if (existingDiary) {
            setFormData({
                fajrToZuhr: existingDiary.fajrToZuhr || "",
                zuhrToAsar: existingDiary.zuhrToAsar || "",
                asarToMaghrib: existingDiary.asarToMaghrib || "",
                maghribToEsha: existingDiary.maghribToEsha || "",
                eshaToFajr: existingDiary.eshaToFajr || "",
                customNotes: existingDiary.customNotes || "",
                summary: existingDiary.summary || "",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) return;

        const dataToSave = {
            userId,
            date: dateStr,
            ...formData,
        };

        if (isEditMode && existingDiaryId) {
            updateDiary.mutate(
                {id: existingDiaryId, ...dataToSave},
                {
                    onSuccess: () => {
                        setIsEditMode(false);
                        setIsFormDisabled(true);
                    },
                }
            );
        } else {
            createDiary.mutate(dataToSave, {
                onSuccess: () => {
                    setIsFormDisabled(true);
                },
            });
        }
    };

    return (
        <Card id={"diary"} className="w-full h-full shadow-lg border-border/50">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
                    <BookOpen className="h-6 w-6"/>
                    Daily Diary
                </CardTitle>
                {existingDiaryId && !isEditMode && (
                    <p className="text-center text-sm text-rose-400">
                        Diary log exists for this date
                    </p>
                )}
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
                <form id={"diaryDate"} onSubmit={handleSubmit} className="space-y-6">
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
                                    Loading diary data...
                                </motion.p>
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            {/* Time Period Fields */}
                            <div className="space-y-4">
                                <h3 className="text-base sm:text-lg font-semibold">Prayer Period Entries</h3>
                                {timeFields.map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <Label htmlFor={field.key} className="text-sm font-medium">
                                            {field.label}
                                        </Label>
                                        <Textarea
                                            id={field.key}
                                            placeholder={field.placeholder}
                                            value={formData[field.key as keyof typeof formData]}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            disabled={isFormDisabled}
                                            className="min-h-[80px] resize-none"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Custom Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="customNotes" className="text-sm font-medium">
                                    Additional Notes
                                </Label>
                                <Textarea
                                    id="customNotes"
                                    placeholder="Any additional thoughts or notes for the day..."
                                    value={formData.customNotes}
                                    onChange={(e) => handleChange("customNotes", e.target.value)}
                                    disabled={isFormDisabled}
                                    className="min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Summary */}
                            <div className="space-y-2">
                                <Label htmlFor="summary" className="text-sm font-medium">
                                    Day Summary
                                </Label>
                                <Textarea
                                    id="summary"
                                    placeholder="Summarize your day in a few words..."
                                    value={formData.summary}
                                    onChange={(e) => handleChange("summary", e.target.value)}
                                    disabled={true}
                                    className="min-h-[80px] resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div id={"diaryEdit"} className="flex flex-col sm:flex-row gap-3 pt-2">
                                {existingDiaryId && !isEditMode ? (
                                    <Button
                                        type="button"
                                        onClick={handleEditClick}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <Edit2 className="mr-2 h-4 w-4"/>
                                        Edit Diary
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="submit"
                                            className="w-full sm:flex-1"
                                            disabled={isFormDisabled || createDiary.isPending || updateDiary.isPending}
                                        >
                                            <Save className="mr-2 h-4 w-4"/>
                                            {createDiary.isPending || updateDiary.isPending
                                                ? "Saving..."
                                                : isEditMode
                                                    ? "Update Diary"
                                                    : "Save Diary"}
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