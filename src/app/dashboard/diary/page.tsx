// app/dashboard/diary/landing-client.tsx
import DiaryListClient from "@/components/diary/DiaryListClient";

export default function PrayerDiaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6  sm:pt-14 pb-6 pt-4">
        <DiaryListClient />
      </div>
    </div>
  );
}