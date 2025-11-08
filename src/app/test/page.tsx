// app/page.tsx (or pages/index.tsx)
import React from "react";
import PrayerTimes from "@/components/PrayerTimes";

// Server Component - fetches prayer times on the server
export default async function PrayerTimesPage() {


  return (
    <div className="p-4 max-w-md mx-auto">

      <PrayerTimes/>
    </div>
  );
}
