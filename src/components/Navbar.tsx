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
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ButtonLogout from "@/components/ButtonLogout";

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

      {/* 📱 Mobile Top Bar - Glassmorphic Capsule */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sm:hidden fixed top-3 left-3 right-3 z-50"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none" />

          <div className="relative grid grid-cols-3 items-center h-16 px-4 gap-3">
            {/* LEFT — Page + Date */}
            <div className="flex flex-col justify-center items-start space-y-0.5">
              <span className="text-[13px] font-bold text-foreground tracking-wide drop-shadow-sm">
                {currentPage}
              </span>
              <span className="text-[10px] text-foreground/60 font-medium">
                {time?.toLocaleDateString("en-GB")}
              </span>
            </div>

            {/* CENTER — Time + Day */}
            <div className="flex flex-col justify-center items-center space-y-0.5">
              <span className="text-[14px] font-mono text-foreground font-bold tracking-tight drop-shadow-sm">
                {time?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="text-[10px] text-foreground/60 capitalize font-medium">
                {time?.toLocaleDateString("en-US", { weekday: "long" })}
              </span>
            </div>

            {/* RIGHT — Theme + Hijri */}
            <div className="flex flex-col justify-center items-end space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-7 w-7 p-0 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/30 dark:border-white/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon size={14} className="text-foreground" />
                ) : (
                  <Sun size={14} className="text-foreground" />
                )}
              </Button>
              {/*<span className="text-[10px] text-foreground/60 font-medium">*/}
              {/*  {new Intl.DateTimeFormat("en-SA-u-ca-islamic", {*/}
              {/*    day: "2-digit",*/}
              {/*    month: "numeric",*/}
              {/*    year: "numeric",*/}
              {/*  }).format(time)}*/}
              {/*</span>*/}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📱 Mobile Bottom Bar - Glassmorphic Capsule */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="sm:hidden fixed bottom-4 left-4 right-4 z-50"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-white/30 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-around px-6 py-3">
            <NavIcon
              href="/dashboard"
              icon={<Home className="w-5 h-5" />}
              label="Home"
              active={pathname === "/dashboard"}
            />
            <NavIcon
              href="/dashboard/entry"
              icon={<Edit3 className="w-5 h-5" />}
              label="Entry"
              active={pathname === "/dashboard/entry"}
            />
            <NavIcon
              href="/dashboard/diary"
              icon={<BookOpen className="w-5 h-5" />}
              label="Diary"
              active={pathname === "/dashboard/diary"}
            />
            <UserIcon user={user} />
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

// Mobile bottom icons with glassmorphic active state
export function NavIcon({ href, icon, label, active }: any) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 text-xs transition-all duration-300"
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={cn(
          "flex items-center justify-center rounded-2xl p-2.5 transition-all duration-300",
          active
            ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-110"
            : "bg-white/30 dark:bg-white/5 text-foreground/70 hover:bg-white/50 dark:hover:bg-white/10 hover:text-foreground"
        )}
      >
        {icon}
      </motion.div>
      <span
        className={cn(
          "font-medium transition-all duration-300 drop-shadow-sm",
          active ? "text-foreground text-[11px]" : "text-foreground/60 text-[10px]"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

// User icon (Mobile) with glassmorphic styling
export function UserIcon({ user }: { user: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center justify-center gap-1.5 text-xs transition-all duration-300"
        >
          <div className="relative flex items-center justify-center rounded-2xl p-2.5 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300">
            <div className="relative w-5 h-5 rounded-full border-2 border-white/50 dark:border-white/20 overflow-hidden shadow-md">
              <Image
                src={user?.image || "/default-avatar.png"}
                alt="User"
                fill
                sizes="20px"
                className="object-cover"
              />
            </div>
          </div>
          <span className="font-medium text-[10px] text-foreground/60 drop-shadow-sm">
            Profile
          </span>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className="w-64 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-5 mb-2"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative w-16 h-16 rounded-full border-2 border-white/30 dark:border-white/20 overflow-hidden shadow-lg">
            <Image
              src={user?.image || "/default-avatar.png"}
              alt="User Avatar"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-foreground/60 truncate max-w-[90%] mx-auto">
              {user?.email || "No email available"}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center border-t border-white/20 dark:border-white/10 mt-4 pt-4">
          <ButtonLogout />
        </div>
      </PopoverContent>
    </Popover>
  );
}