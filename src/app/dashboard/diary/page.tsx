// app/dashboard/diary/page.tsx
import DiaryListClient from "@/components/diary/DiaryListClient";

export default function PrayerDiaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pt-6 sm:pt-14 pb-6">
        <DiaryListClient />
      </div>
    </div>
  );
}