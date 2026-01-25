"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {BookOpen, CalendarIcon, Edit2, Save, Sparkles, Languages} from "lucide-react";
import {format, parse} from "date-fns";
import {motion} from "framer-motion";
import {useCreateDiary, useDiaryByDate, useUpdateDiary} from "@/hooks/use-prayer-queries";
import {useAiSummary} from "@/hooks/use-ai-summary";
import {useTranslation} from "@/hooks/use-translation";

export default function DiaryForm({session}: any) {
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");

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
    const [translationLanguage, setTranslationLanguage] = useState<string>("en");

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
    const {generateSummary, isGenerating, error: summaryError} = useAiSummary();
    const {translate, isTranslating, error: translationError} = useTranslation();

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
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setIsFormDisabled(true);
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

    const handleGenerateSummary = async () => {
        try {
            const summary = await generateSummary({
                fajrToZuhr: formData.fajrToZuhr,
                zuhrToAsar: formData.zuhrToAsar,
                asarToMaghrib: formData.asarToMaghrib,
                maghribToEsha: formData.maghribToEsha,
                eshaToFajr: formData.eshaToFajr,
                customNotes: formData.customNotes,
            });

            setFormData((prev) => ({...prev, summary}));
        } catch (err) {
            console.error('Failed to generate summary:', err);
        }
    };

    const handleTranslateSummary = async () => {
        if (!formData.summary) return;

        try {
            const translated = await translate(formData.summary, translationLanguage);
            setFormData((prev) => ({...prev, summary: translated}));
        } catch (err) {
            console.error('Failed to translate summary:', err);
        }
    };

    const handleTranslateAllEntries = async () => {
        try {
            const entriesToTranslate = {
                fajrToZuhr: formData.fajrToZuhr,
                zuhrToAsar: formData.zuhrToAsar,
                asarToMaghrib: formData.asarToMaghrib,
                maghribToEsha: formData.maghribToEsha,
                eshaToFajr: formData.eshaToFajr,
                customNotes: formData.customNotes,
            };

            const translatedEntries: any = {};

            for (const [key, value] of Object.entries(entriesToTranslate)) {
                if (value) {
                    translatedEntries[key] = await translate(value, translationLanguage);
                } else {
                    translatedEntries[key] = value;
                }
            }

            setFormData((prev) => ({
                ...prev,
                ...translatedEntries,
            }));
        } catch (err) {
            console.error('Failed to translate entries:', err);
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

    const hasAnyContent = formData.fajrToZuhr || formData.zuhrToAsar ||
        formData.asarToMaghrib || formData.maghribToEsha ||
        formData.eshaToFajr || formData.customNotes;

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
                <form id={"diaryDate"} onSubmit={handleSubmit} className={`space-y-6`}>
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

                    {/* Translation Language Selector */}
                    {!isFormDisabled && (
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-3">Translation Language</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <Select value={translationLanguage} onValueChange={setTranslationLanguage}>
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ur">Urdu</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTranslateAllEntries}
                                    disabled={isTranslating || !hasAnyContent}
                                    className="text-xs"
                                >
                                    <Languages className="mr-1.5 h-3.5 w-3.5" />
                                    {isTranslating ? "Translating..." : "Translate All Entries"}
                                </Button>
                            </div>
                            {translationError && (
                                <p className="text-xs text-destructive mt-2">{translationError}</p>
                            )}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <motion.div
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{duration: 0.3, ease: [0.25, 0.1, 0.25, 1]}}
                                className="flex flex-col items-center gap-4 p-8"
                            >
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
                                    <div key={field.key} className={`space-y-2 `}>
                                        <Label htmlFor={field.key} className="text-sm font-medium">
                                            {field.label}
                                        </Label>
                                        <Textarea
                                            id={field.key}
                                            placeholder={field.placeholder}
                                            value={formData[field.key as keyof typeof formData]}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            disabled={isFormDisabled}
                                            className={`min-h-[80px] resize-none ${translationLanguage === "en" && "font-inter" || translationLanguage === "ur" && "font-noto_nastaliq leading-10 text-end"}`}
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
                                    className={`min-h-[100px] resize-none ${translationLanguage === "en" && "font-inter" || translationLanguage === "ur" && "font-noto_nastaliq leading-10 text-end"}`}
                                />
                            </div>

                            {/* Summary with AI Generation and Translation */}
                            <div className="space-y-2">
                                <Label htmlFor="summary" className="text-sm font-medium">
                                    Day Summary
                                </Label>
                                <div className="flex items-center justify-between">

                                    {!isFormDisabled && (
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleGenerateSummary}
                                                disabled={isGenerating || !hasAnyContent}
                                                className="h-8 text-xs"
                                            >
                                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                                {isGenerating ? "Generating..." : "Generate with AI"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleTranslateSummary}
                                                disabled={isTranslating || !formData.summary}
                                                className="h-8 text-xs"
                                            >
                                                <Languages className="mr-1.5 h-3.5 w-3.5" />
                                                {isTranslating ? "Translating..." : "Translate"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <Textarea
                                    id="summary"
                                    placeholder="AI will generate a summary of your day..."
                                    value={formData.summary}
                                    onChange={(e) => handleChange("summary", e.target.value)}
                                    disabled={isFormDisabled}
                                    className={`min-h-[80px] resize-none ${translationLanguage === "en" && "font-inter" || translationLanguage === "ur" && "font-noto_nastaliq leading-10 text-end"}`}
                                />
                                {summaryError && (
                                    <p className="text-xs text-destructive">{summaryError}</p>
                                )}
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
                                        Edit Diary Log
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
                                                    ? "Update Diary Log"
                                                    : "Save Diary Log"}
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