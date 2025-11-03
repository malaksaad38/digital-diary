import { auth } from "@/auth"; // from your Auth.js setup
import { redirect } from "next/navigation";
import { BookOpen, Calendar, Edit3, LogOut } from "lucide-react";
import clientPromise from "@/libs/mongodb";
import Link from "next/link";
import ButtonLogout from "@/components/ButtonLogout";

// ✅ Server Component
export default function DashboardPage() {

  return (
    <div className="min-h-screen text-gray-900">
      {/* ---------- NAVBAR ---------- */}
      <nav className="flex items-center justify-between px-8 py-4 border-b  backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <BookOpen className="text-indigo-600 w-6 h-6" />
          <span className="font-semibold text-lg">DigitalDiary</span>
        </div>
      </nav>

      {/* ---------- HEADER ---------- */}
      <header className="px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">
            {/*Welcome back, {session.user?.name?.split(" ")[0] || "Friend"} 👋*/}
          </h1>
          <p className="text-gray-500 mt-1">
            Here’s your prayer schedule and latest diary reflections.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
        >
          <Edit3 size={18} />
          New Entry
        </Link>
      </header>

      {/* ---------- MAIN CONTENT ---------- */}

    </div>
  );
}
