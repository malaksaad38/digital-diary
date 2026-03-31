import DiaryBookReader from "@/components/diary/DiaryBookReader";

export default function DiaryBookPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 sm:pt-14 pt-4">
        <DiaryBookReader />
      </div>
    </div>
  );
}
