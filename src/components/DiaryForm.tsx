"use client";

import { useState, useEffect } from "react";
import {useRouter, useSearchParams} from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Edit2, Save, BookOpen } from "lucide-react";
import { format, parse } from "date-fns";
import { toast } from "sonner";

export default function DiaryForm({ session }: any) {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  // Initialize selectedDate from URL parameter if it exists
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
  const [existingDiaryId, setExistingDiaryId] = useState<string | null>(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState({
    fajrToZuhr: "",
    zuhrToAsar: "",
    asarToMaghrib: "",
    maghribToEsha: "",
    eshaToFajr: "",
    customNotes: "",
    summary: "",
  });

  const userId = session?.user?.id;

  const timeFields = [
    { key: "fajrToZuhr", label: "Fajr to Zuhr", placeholder: "What happened between Fajr and Zuhr prayers..." },
    { key: "zuhrToAsar", label: "Zuhr to Asar", placeholder: "What happened between Zuhr and Asar prayers..." },
    { key: "asarToMaghrib", label: "Asar to Maghrib", placeholder: "What happened between Asar and Maghrib prayers..." },
    { key: "maghribToEsha", label: "Maghrib to Esha", placeholder: "What happened between Maghrib and Esha prayers..." },
    { key: "eshaToFajr", label: "Esha to Fajr", placeholder: "What happened between Esha and next Fajr..." },
  ];

  // Check if diary exists for selected date
  useEffect(() => {
    const checkExistingDiary = async () => {
      if (!selectedDate || !userId) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      setIsLoading(true);

      try {
        const res = await fetch(`/api/diary?date=${dateStr}`);
        const data = await res.json();

        if (data.success && data.data) {
          // Diary exists for this date
          setExistingDiaryId(data.data._id);
          setFormData({
            fajrToZuhr: data.data.fajrToZuhr || "",
            zuhrToAsar: data.data.zuhrToAsar || "",
            asarToMaghrib: data.data.asarToMaghrib || "",
            maghribToEsha: data.data.maghribToEsha || "",
            eshaToFajr: data.data.eshaToFajr || "",
            customNotes: data.data.customNotes || "",
            summary: data.data.summary || "",
          });
          setIsFormDisabled(true);
          setIsEditMode(false);
        } else {
          // No diary for this date
          resetForm();
          setExistingDiaryId(null);
          setIsFormDisabled(false);
          setIsEditMode(false);
        }
      } catch (error) {
        console.error("Error checking diary:", error);
        resetForm();
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingDiary();
  }, [selectedDate, userId]);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setTimeout(() => {
      setIsEditMode(true);
    }, 500);
    setIsFormDisabled(false);
    router.push("#date")

  };

  const handleCancelEdit = () => {
    // Refetch the original data
    if (!selectedDate || !userId) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    fetch(`/api/diary?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFormData({
            fajrToZuhr: data.data.fajrToZuhr || "",
            zuhrToAsar: data.data.zuhrToAsar || "",
            asarToMaghrib: data.data.asarToMaghrib || "",
            maghribToEsha: data.data.maghribToEsha || "",
            eshaToFajr: data.data.eshaToFajr || "",
            customNotes: data.data.customNotes || "",
            summary: data.data.summary || "",
          });
        }
      })
      .catch(error => {
        console.error("Error refetching diary:", error);
      });

    setIsEditMode(false);
    setIsFormDisabled(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setIsSaving(true);

    const dataToSave = {
      userId,
      date: dateStr,
      ...formData,
    };

    try {
      if (isEditMode && existingDiaryId) {
        // Update existing diary
        const res = await fetch(`/api/diary`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existingDiaryId, ...dataToSave }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Diary updated successfully!", {
            description: `Diary for ${dateStr} has been updated.`,
          });

          // Update the form data with the response
          setFormData({
            fajrToZuhr: data.data.fajrToZuhr || "",
            zuhrToAsar: data.data.zuhrToAsar || "",
            asarToMaghrib: data.data.asarToMaghrib || "",
            maghribToEsha: data.data.maghribToEsha || "",
            eshaToFajr: data.data.eshaToFajr || "",
            customNotes: data.data.customNotes || "",
            summary: data.data.summary || "",
          });

          setIsEditMode(false);
          setIsFormDisabled(true);
        } else {
          toast.error(data.error || "Failed to update diary");
        }
      } else {
        // Create new diary
        const res = await fetch("/api/diary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Diary saved successfully!", {
            description: `Diary for ${dateStr} has been recorded.`,
          });
          setExistingDiaryId(data.data._id);
          setIsFormDisabled(true);
          setIsEditMode(false);
        } else {
          toast.error(data.error || "Failed to save diary");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card id={"diary"} className="max-w-4xl mx-auto shadow-lg border-border/50">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6" />
          Daily Diary
        </CardTitle>
        {existingDiaryId && !isEditMode && (
          <p className="text-center text-sm text-muted-foreground">
            Diary exists for this date
          </p>
        )}
      </CardHeader>

      <CardContent  className="px-4 sm:px-6">
        <form id={"date"} onSubmit={handleSubmit} className="space-y-6">
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
              Loading diary data...
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

              <div id={"diaryEdit"}  className="flex flex-col sm:flex-row gap-3 pt-2">
                {existingDiaryId && !isEditMode ? (
                  <Button
                    type="button"
                    onClick={handleEditClick}
                    className="w-full"
                    variant="outline"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Diary
                  </Button>
                ) : (
                  <>
                    <Button

                      type="submit"
                      className="w-full sm:flex-1"
                      disabled={isFormDisabled || isSaving}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : isEditMode ? "Update Diary" : "Save Diary"}
                    </Button>
                    {isEditMode && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="w-full sm:w-auto"
                        disabled={isSaving}
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