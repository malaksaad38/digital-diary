// components/diary/DiaryLog.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, Pencil } from "lucide-react";

interface DiaryData {
  summary?: string;
  fajrToZuhr?: string;
  zuhrToAsar?: string;
  asarToMaghrib?: string;
  maghribToEsha?: string;
  eshaToFajr?: string;
  customNotes?: string;
}

interface DiaryLogProps {
  diary: DiaryData | null;
  date: string;
  onEdit: (date: string) => void;
  onAdd: (date: string) => void;
}

export default function DiaryLog({ diary, date, onEdit, onAdd }: DiaryLogProps) {
  if (!diary) {
    return (
      <div className="text-center py-4 border-t border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground mb-2">No diary entry for this date</p>
        <Button size="sm" variant="outline" onClick={() => onAdd(date)}>
          <BookOpen className="mr-2 h-3 w-3" />
          Add Diary Entry
        </Button>
      </div>
    );
  }

  const periods = [
    { label: "Fajr → Zuhr", value: diary.fajrToZuhr },
    { label: "Zuhr → Asar", value: diary.zuhrToAsar },
    { label: "Asar → Maghrib", value: diary.asarToMaghrib },
    { label: "Maghrib → Esha", value: diary.maghribToEsha },
    { label: "Esha → Fajr", value: diary.eshaToFajr },
  ];

  return (
    <div className="border-t pt-4">
        {diary.summary && (
            <div className="p-3 mb-2 rounded-lg  border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Day Summary</p>
                <p className="text-sm text-foreground">{diary.summary}</p>
            </div>
        )}
      <Accordion type="single" collapsible defaultValue={false}>
        <AccordionItem value="diary-entry" className="border-none">
          <div className="flex items-center justify-between">

            <AccordionTrigger className="hover:no-underline py-2 flex-1">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Diary Entry
              </h4>
            </AccordionTrigger>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(date)}
              className="h-7 px-2 hover:bg-primary/10"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          </div>


          <AccordionContent>
            <div className="space-y-2 pt-2">

              {periods.map((period) =>
                  period.value && (
                    <div key={period.label} className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {period.label}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {period.value}
                      </p>
                    </div>
                  )
              )}

              {diary.customNotes && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Additional Notes
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {diary.customNotes}
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}