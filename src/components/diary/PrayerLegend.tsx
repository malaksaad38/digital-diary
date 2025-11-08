// components/diary/PrayerLegend.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Circle, Diamond, CircleHelp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PrayerLegend() {
  return (
    <Card className="bg-muted/30">
      <CardContent className="flex items-center justify-center gap-2">
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-5 text-xs sm:text-sm">
          <div className="flex gap-1 justify-center items-center">
            <h3 className="font-bold">Legend</h3>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  aria-label="Show prayer status details"
                  className="flex items-center pr-3 justify-center gap-1.5 text-foreground/60 hover:text-foreground text-xs transition-colors"
                >
                  <CircleHelp size={12} className="relative" />
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Prayer Status Meaning</DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-3 text-sm mt-2 leading-relaxed">
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-gray-500 fill-gray-500" />
                          <strong>Not Selected</strong>
                        </span> — It's not Selected Yet.
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-red-500 fill-red-500" />
                          <strong>Missed</strong>
                        </span> — You missed the prayer time (Qaza).
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <strong>Alone</strong>
                        </span> — You prayed alone.
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                          <strong>Jamaat</strong>
                        </span> — You prayed with congregation.
                      </p>
                      <p>
                        <span className="inline-flex items-center gap-1.5">
                          <Diamond className="h-3 w-3 text-sky-500 fill-sky-500" />
                          <strong>On Time</strong>
                        </span> — You prayed in Jamaat with Takbeeri Oola.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span>Not Selected</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Missed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span>Alone</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Jamaat</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-sky-500" />
            <span>On Time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}