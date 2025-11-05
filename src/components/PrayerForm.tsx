"use client";

import { useState, useEffect } from "react";
import {useRouter, useSearchParams} from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit2, Save } from "lucide-react";
import { format, parse } from "date-fns";
import { toast } from "sonner";

export default function PrayerForm({ session }: any) {
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
  const [existingPrayerId, setExistingPrayerId] = useState<string | null>(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fajr: "",
    zuhr: "",
    asar: "",
    maghrib: "",
    esha: "",
    zikr: "",
  });

  // Recite states (fixed)
  const [reciteMode, setReciteMode] = useState("");
  const [customRecite, setCustomRecite] = useState("");

  const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];
  const prayerOptions = ["Missed", "Alone", "Jamaat", "On Time"];
  const reciteOptions = ["0", "2", "Custom"];
  const zikrOptions = ["Half", "Full", "None"];
  const customReciteValues = ["0.25", "0.5", "0.75", "1", "1.5", "2", "3", "4", "5"];

  const router = useRouter();

  const userId = session?.userId;

  // Check if prayer exists for selected date
  useEffect(() => {
    const checkExistingPrayer = async () => {
      if (!selectedDate || !userId) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      setIsLoading(true);

      try {
        const res = await fetch(`/api/prayers?date=${dateStr}`);
        const data = await res.json();

        if (data.success && data.data) {
          // Prayer exists for this date
          setExistingPrayerId(data.data._id);
          setFormData({
            fajr: capitalizeFirst(data.data.fajr),
            zuhr: capitalizeFirst(data.data.zuhr),
            asar: capitalizeFirst(data.data.asar),
            maghrib: capitalizeFirst(data.data.maghrib),
            esha: capitalizeFirst(data.data.esha),
            zikr: capitalizeFirst(data.data.zikr) || "",
          });

          // Recite mode fix: detect if value is numeric or custom
          if (data.data.recite === "0" || data.data.recite === "2") {
            setReciteMode(data.data.recite);
            setCustomRecite("");
          } else {
            setReciteMode("Custom");
            setCustomRecite(data.data.recite);
          }

          setIsFormDisabled(true);
          setIsEditMode(false);
        } else {
          resetForm();
          setExistingPrayerId(null);
          setIsFormDisabled(false);
          setIsEditMode(false);
        }
      } catch (error) {
        console.error("Error checking prayer:", error);
        resetForm();
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingPrayer();
  }, [selectedDate, userId]);

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setTimeout(() => {
      setIsEditMode(true);
    }, 500);
    setIsFormDisabled(false);
    router.push("#date")

  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setIsFormDisabled(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    const dateStr = format(selectedDate || new Date(), "yyyy-MM-dd");

    const finalRecite =
      reciteMode === "Custom" ? customRecite : reciteMode || "";

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

    try {
      if (isEditMode && existingPrayerId) {
        // Update existing prayer
        const res = await fetch(`/api/prayers`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existingPrayerId, ...dataToSave }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Prayer log updated successfully!", {
            description: `Prayer log for ${dateStr} has been updated.`,
          });
          setIsEditMode(false);
          setIsFormDisabled(true);
        } else {
          toast.error(data.error || "Failed to update prayer log");
        }
      } else {
        // Create new prayer
        const res = await fetch("/api/prayers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Prayer log saved successfully!", {
            description: `Prayer log for ${dateStr} has been recorded.`,
          });
          setExistingPrayerId(data.data._id);
          setIsFormDisabled(true);
        } else {
          toast.error(data.error || "Failed to save prayer log");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!");
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

  return (
    <Card className="max-w-3xl mx-auto mt-4 sm:mt-8 shadow-lg border-border/50">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-xl sm:text-2xl font-bold">
          Daily Prayer Log
        </CardTitle>
        {existingPrayerId && !isEditMode && (
          <p className="text-center text-sm text-muted-foreground">
            Prayer log exists for this date
          </p>
        )}
      </CardHeader>




      <CardContent className="px-4 sm:px-6">
        <form id={"date"} onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
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

          {/* 📱 Compact Mobile Legend (One Line, shadcn style) */}
          <div className="sm:hidden mb-3 flex flex-wrap justify-center items-center gap-2 text-[10px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>M=Missed</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-600 border border-yellow-400/30">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span>A=Alone</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/30">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>J=Jamaat</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/30">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>OT=OnTime</span>
            </div>
          </div>


          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading prayer data...
            </div>
          ) : (
            <>
              {/* Prayer Table */}
              <div  id={"edit"} className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Prayers</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20 sm:w-32 text-left font-semibold text-xs sm:text-sm">
                            Prayer
                          </TableHead>
                          {prayerOptions.map((opt) => (
                            <TableHead
                              key={opt}
                              className="text-center font-semibold text-xs sm:text-sm px-1 sm:px-4"
                            >
                              <span className="hidden sm:inline">{opt}</span>
                              <span className="sm:hidden">
                                {opt === "Missed"
                                  ? "M"
                                  : opt === "Alone"
                                    ? "A"
                                    : opt === "Jamaat"
                                      ? "J"
                                      : "OT"}
                              </span>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prayers.map((prayer) => (
                          <TableRow key={prayer}>
                            <TableCell className="capitalize font-semibold text-xs sm:text-sm">
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
                                  required
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


              {/* Recite Section (fixed) */}
              <div >
                <h3 className="text-base sm:text-lg font-semibold mb-3">Recite (Parah)</h3>
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
                        <SelectValue placeholder="Select" />
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
                <h3 className="text-base sm:text-lg font-semibold mb-3">Zikr (Daily Azkar)</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {zikrOptions.map((opt) => (
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
              <div   className="flex flex-col sm:flex-row gap-3 pt-2">
                {existingPrayerId && !isEditMode ? (
                  <Button
                    type="button"
                    onClick={handleEditClick}
                    className="w-full"
                    variant="outline"
                  >
                    <Edit2 className="mr-2 h-4 w-4"  />
                    Edit Prayer Log
                  </Button>
                ) : (
                  <>
                    <Button

                      type="submit"
                      className="w-full sm:flex-1"
                      disabled={isFormDisabled}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? "Update Prayer Log" : "Save Prayer Log"}
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
