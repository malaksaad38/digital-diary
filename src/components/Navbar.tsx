"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Edit3,
  User,
  Moon,
  Sun,
  LogOut, PieChartIcon, PenLine, Clock8, Notebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ButtonLogout from "@/components/ButtonLogout";
import {PieChart} from "recharts";

export default function Navbar({ user }: { user: any }) {
  const [time, setTime] = useState(new Date());
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const pageNameMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/entry": "Entry",
    "/dashboard/diary": "Diary",
    "/dashboard/analytics": "Analytics",
    "/dashboard/prayer-times": "Prayer Times",
  };

  const currentPage =
    pageNameMap[pathname] || pathname.split("/").pop()?.toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* 🌐 Desktop Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden sm:flex sticky top-0 z-50 items-center justify-between px-6 py-3 border-b bg-background/70 backdrop-blur-md shadow-sm"
      >
        {/* Left: User */}
        <UserPopover user={user} />

        {/* Middle: Navigation */}
        <div className="flex items-center gap-6">
          <NavLink href="/dashboard" label="Dashboard" pathname={pathname} />
          <NavLink href="/dashboard/analytics" label="Analytics" pathname={pathname} />
          <NavLink href="/dashboard/prayer-times" label="Prayer Times" pathname={pathname} />
          <NavLink href="/dashboard/entry" label="Entry" pathname={pathname} />
          <NavLink href="/dashboard/diary" label="Diary" pathname={pathname} />
        </div>

        {/* Right: Clock + Theme */}
        <div className="flex items-center gap-5">
          <span className="text-sm font-mono text-muted-foreground">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={18} className="text-foreground" />
            ) : (
              <Sun size={18} className="text-foreground" />
            )}
          </Button>
        </div>
      </motion.nav>

      {/* 📱 Mobile Top Bar - iPhone Style */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="sm:hidden fixed top-2 left-2 right-2 z-50"
      >
        <div className="relative overflow-hidden rounded-[22px] border border-black/5 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-lg shadow-black/5">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/40 dark:from-white/5 dark:to-transparent pointer-events-none" />

          <div className="relative grid grid-cols-3 items-center h-[52px] px-3.5 gap-2">
            {/* LEFT — Page + Date */}
            <div className="flex flex-col justify-center items-start space-y-px gap-1">
              <span className="text-[11px] font-semibold text-foreground/80 tracking-tight leading-none">
                {currentPage}
              </span>
              <span className="text-[9px] text-foreground/50 font-medium leading-none">
                {time?.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' , year: "numeric" })}
              </span>
            </div>

            {/* CENTER — Time + Day */}
            <div className="flex flex-col justify-center items-center space-y-px gap-1">
              <span className="text-[13px] font-mono text-foreground/80 tracking-tight tabular-nums leading-none">
                {time?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="text-[9px] text-foreground/50 font-medium capitalize leading-none">
                {time?.toLocaleDateString("en-US", { weekday: "long" })}
              </span>
            </div>

            {/* RIGHT — Profile + Theme + Hijri */}
            <div className="flex items-center justify-end gap-2">
              {/* User Profile */}


              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-6 w-6 p-0 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border-0 transition-all duration-200 active:scale-90"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon size={12} className="text-foreground/70" strokeWidth={2.5} />
                ) : (
                  <Sun size={12} className="text-foreground/70" strokeWidth={2.5} />
                )}
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-center h-6 w-6 rounded-full overflow-hidden border border-foreground/10 transition-all duration-200 active:scale-90">
                    <div className="relative w-full h-full">
                      <Image
                        src={user?.image || "/default-avatar.png"}
                        alt="User"
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="bottom"
                  align="end"
                  className="w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[22px] shadow-xl shadow-black/10 p-4 mt-1"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="relative w-16 h-16 rounded-full border-2 border-black/5 dark:border-white/10 overflow-hidden">
                      <Image
                        src={user?.image || "/default-avatar.png"}
                        alt="User Avatar"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground/90">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-foreground/50 truncate max-w-[90%] mx-auto">
                        {user?.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center items-center border-t border-black/5 dark:border-white/10 mt-3.5 pt-3">
                    <ButtonLogout />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📱 Mobile Bottom Bar - iPhone Style Dock */}
      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
        className="sm:hidden fixed bottom-2 left-2 right-2 z-50"
      >
        <div className="relative overflow-hidden rounded-[28px] border border-black/5 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-lg shadow-black/5">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-white/40 dark:from-white/5 dark:to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-around px-3 py-2.5">
            <NavIcon
              href="/dashboard"
              icon={<Home size={20} />}
              label="Home"
              active={pathname === "/dashboard"}
            />
            <NavIcon
              href="/dashboard/analytics"
              icon={<PieChartIcon size={20} />}
              label="Analytics"
              active={pathname === "/dashboard/analytics"}
            />
            <NavIcon
              href="/dashboard/entry"
              icon={<PenLine size={20} />}
              label="Entry"
              active={pathname === "/dashboard/entry"}
            />
            <NavIcon
              href="/dashboard/prayer-times"
              icon={<Clock8 size={20} />}
              label="Times"
              active={pathname === "/dashboard/prayer-times"}
            />
            <NavIcon
              href="/dashboard/diary"
              icon={<Notebook size={20} />}
              label="Diary"
              active={pathname === "/dashboard/diary"}
            />
          </div>
        </div>
      </motion.nav>
    </>
  );
}

/* ----------- Components ----------- */

// NavLink (Desktop)
function NavLink({
                   href,
                   label,
                   pathname,
                 }: {
  href: string;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition-colors ${
        isActive
          ? "text-primary after:absolute after:bottom-[-3px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-full"
          : "text-foreground/80 hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}

// User Popover (Desktop)
function UserPopover({ user }: { user: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 focus:outline-none hover:opacity-90 transition">
          <div className="relative w-9 h-9 overflow-hidden rounded-full border">
            <Image
              src={user?.image || "/default-avatar.png"}
              alt="User Avatar"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <span className="font-medium text-sm hidden md:block">
            {user?.name || "User"}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-56 p-4 bg-background border rounded-xl shadow-lg"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border">
              <Image
                src={user?.image || "/default-avatar.png"}
                alt="User Avatar"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-sm text-foreground">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <div className="border-t my-2" />

          <ButtonLogout />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Mobile bottom icons - iPhone style
export function NavIcon({ href, icon, label, active }: any) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 min-w-[52px] transition-all duration-200 active:scale-95"
    >
      <motion.div
        animate={{
          scale: active ? 1 : 1,
        }}
        className={cn(
          "flex items-center justify-center rounded-full p-2 transition-all duration-200",
          active
            ? "bg-primary/95 text-background shadow-md shadow-primary/30"
            : "text-foreground/60"
        )}
      >
        {icon}
      </motion.div>
      <span
        className={cn(
          "text-[9px] font-medium transition-all duration-200 tracking-tight",
          active ? "text-foreground/90" : "text-foreground/50"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

// Remove UserIcon component as it's no longer needed