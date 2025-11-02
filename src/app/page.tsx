import Image from "next/image";
import Link from "next/link";
import { Notebook, Clock, Sparkles, Calendar, LogIn } from "lucide-react";
import ButtonLogin from "@/components/ButtonLogin";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

// ✅ SERVER COMPONENT (no "use client")
export default async function LandingPage() {
  const session = await auth();
  if (session){
    redirect("/dashboard")
  }
  const features = [
    {
      icon: Clock,
      title: "Prayer-Based Entries",
      desc: "Record your thoughts aligned with each prayer time for deeper reflection and discipline.",
    },
    {
      icon: Calendar,
      title: "Daily Reflection Tracker",
      desc: "Track your moods, goals, and gratitude every day through beautiful summaries.",
    },
    {
      icon: Sparkles,
      title: "Simple, Secure, & Cloud Synced",
      desc: "Your diary is safe, encrypted, and accessible from anywhere at any time.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 flex flex-col">
      {/* ---------- NAVBAR ---------- */}
      <nav className="flex items-center justify-between px-8 py-5 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Notebook className="w-7 h-7 text-indigo-600" />
          <span className="font-semibold text-xl">DigitalDiary</span>
        </div>
        <div className="flex items-center gap-4">
          <ButtonLogin  />
        </div>
      </nav>

      {/* ---------- HERO SECTION ---------- */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 md:px-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
          Your <span className="text-indigo-600">Digital Diary</span>,
          Organized Around <span className="text-indigo-600">Prayer Times</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Reflect, write, and grow spiritually — your diary entries align with daily Fajr, Zuhr, Asr, Maghrib, and Isha prayers.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          Start Your Journey
        </Link>

        <div className="mt-14 relative w-full max-w-4xl">
          <Image
            src="/images/diary-preview.png"
            alt="Digital Diary Preview"
            width={1200}
            height={700}
            className="rounded-2xl shadow-2xl"
            priority
          />
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-200 rounded-full blur-3xl opacity-60" />
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose DigitalDiary?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border hover:shadow-lg transition-all"
            >
              <Icon className="mx-auto mb-4 text-indigo-600" size={40} />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Start Your Spiritual Writing Journey?
        </h2>
        <Link
          href="/login"
          className="px-8 py-3 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-gray-100 transition-all"
        >
          Get Started
        </Link>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} DigitalDiary — Built with ❤️ using Next.js
      </footer>
    </div>
  );
}
