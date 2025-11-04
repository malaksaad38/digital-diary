"use client";

import { useState } from "react";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PrayerForm({session}: any) {
  const today = format(new Date(), "yyyy-MM-dd");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [formData, setFormData] = useState({
    date: today,
    fajr: "",
    zuhr: "",
    asar: "",
    maghrib: "",
    esha: "",
    recite: "",
    zikr: "",
  });

  const prayers = ["fajr", "zuhr", "asar", "maghrib", "esha"];
  const prayerOptions = ["Missed", "Self", "Jamaat", "On Time"];
  const reciteOptions = ["1 Parah", "2 Parah", "None", "Custom"];
  const zikrOptions = ["Morning", "Evening", "Both", "None"];
  const customReciteValues = ["0.25", "0.5", "0.75", "1", "1.5", "2", "3", "4", "5"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReciteChange = (value: string) => {
    setFormData((prev) => ({ ...prev, recite: value }));
  };

   const userId = session.userId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId, // replace with session userId
          ...formData,
          date: format(selectedDate || new Date(), "yyyy-MM-dd"),
        }),
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        toast.success("Prayer log saved successfully!", {
          description: `Prayer log for ${formData.date} recorded.`,
        });
      } else {
        toast.error("Prayer log for this date already exists.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const getRadioClass = (option: string) => {
    switch (option) {
      case "Missed":
        return "accent-[#ef4444]";
      case "Self":
        return "accent-[#facc15]";
      case "Jamaat":
        return "accent-[#4ade80]";
      case "On Time":
        return "accent-[#38bdf8]";
      default:
        return "accent-[#9ca3af]";
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8 shadow-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Daily Prayer Log
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* --- DATE PICKER --- */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Date</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[250px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* --- PRAYER TABLE --- */}
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Prayers</h3>
            <Table className="border rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32 text-left font-semibold">Prayer</TableHead>
                  {prayerOptions.map((opt) => (
                    <TableHead key={opt} className="text-center font-semibold">
                      {opt}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {prayers.map((prayer) => (
                  <TableRow key={prayer}>
                    <TableCell className="capitalize font-semibold">{prayer}</TableCell>
                    {prayerOptions.map((opt) => (
                      <TableCell key={opt} className="text-center">
                        <input
                          type="radio"
                          name={prayer}
                          value={opt}
                          checked={formData[prayer as keyof typeof formData] === opt}
                          onChange={handleChange}
                          className={`w-4 h-4 ${getRadioClass(opt)} cursor-pointer`}
                          required
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* --- RECITE --- */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Recite</h3>
            <div className="flex flex-wrap gap-3 items-center">
              {reciteOptions.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition ${
                    formData.recite === opt
                      ? "border-primary bg-muted/30"
                      : "border-border hover:bg-muted/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="recite"
                    value={opt}
                    checked={formData.recite === opt}
                    onChange={handleChange}
                    className="accent-[hsl(var(--primary))]"
                  />
                  <span className="text-sm font-medium">{opt}</span>
                </label>
              ))}

              {formData.recite === "Custom" && (
                <Select onValueChange={handleReciteChange}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {customReciteValues.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v} Parah
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* --- ZIKR --- */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Zikr</h3>
            <div className="flex flex-wrap gap-3 items-center">
              {zikrOptions.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition ${
                    formData.zikr === opt
                      ? "border-primary bg-muted/30"
                      : "border-border hover:bg-muted/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="zikr"
                    value={opt}
                    checked={formData.zikr === opt}
                    onChange={handleChange}
                    className="accent-[hsl(var(--primary))]"
                  />
                  <span className="text-sm font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* --- SUBMIT --- */}
          <Button type="submit" className="w-full mt-4">
            Save Prayer Log
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
