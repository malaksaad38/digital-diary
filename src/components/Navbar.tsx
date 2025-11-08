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

export default function Navbar({ user }: { user: any }) {
  const [time, setTime] = useState(new Date());
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const pageNameMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/entry": "Entry",
    "/dashboard/diary": "Diary",
    "/dashboard/analytics": "Analytics",
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

      {/* 📱 Mobile Top Bar */}
      {/* 📱 Mobile Top Bar (Visible only on mobile) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="grid grid-cols-3 items-center h-12 px-4">

          {/* LEFT — Page + Date */}
          <div className="flex flex-col justify-center items-start space-y-[2px]">
      <span className="text-[13px] font-semibold text-foreground tracking-wide">
        {currentPage}
      </span>
            <span className="text-[11px] text-muted-foreground">
        {time?.toLocaleDateString("en-GB")}
      </span>
          </div>

          {/* CENTER — Time + Day */}
          <div className="flex flex-col justify-center items-center space-y-[2px]">
      <span className="text-[13px] font-mono text-foreground font-medium">
        {time?.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
            <span className="text-[11px] text-muted-foreground capitalize">
        {time?.toLocaleDateString("en-US", { weekday: "long" })}
      </span>
          </div>

          {/* RIGHT — Theme + Hijri */}
          <div className="flex flex-col justify-center items-end space-y-[2px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className=" size-[20px] py-1 rounded-full hover:bg-accent transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon size={15} className="text-foreground" />
              ) : (
                <Sun size={15} className="text-foreground" />
              )}
            </Button>
            <span className="text-[11px] text-muted-foreground">
        {new Intl.DateTimeFormat("en-SA-u-ca-islamic", {
          day: "2-digit",
          month: "numeric",
          year: "numeric",
        }).format(time)}
      </span>
          </div>

        </div>
      </div>




      {/* 📱 Mobile Bottom Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-md">
        <div className="flex items-center justify-between px-6 py-2">
          <NavIcon
            href="/dashboard"
            icon={<Home className="w-6 h-6" />}
            label={"Home"}
            active={pathname === "/dashboard"}
          />
          <NavIcon
            href="/dashboard/entry"
            icon={<Edit3 className="w-6 h-6" />}
            label={"Entry"}
            active={pathname === "/dashboard/entry"}
          />
          <NavIcon
            href="/dashboard/diary"
            icon={<BookOpen className="w-6 h-6" />}
            label={"Diary"}
            active={pathname === "/dashboard/diary"}
          />
          <UserIcon user={user} />
        </div>
      </nav>


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

          <ButtonLogout/>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Mobile bottom icons

import { cn } from "@/lib/utils";
import ButtonLogout from "@/components/ButtonLogout"; // if you use clsx helper

export function NavIcon({ href, icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center  text-sm transition-all duration-200",
        active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className={cn(
        "flex items-center justify-center rounded-full p-1 transition-all",
        active && "bg-primary/10 text-primary"
      )}>
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </Link>
  );
}

// User icon (Mobile)
export function UserIcon({ user }: { user: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-1 text-xs text-foreground/70 hover:text-primary transition-all">
          <div className="relative w-7 h-7 rounded-full border border-foreground/10 overflow-hidden shadow-sm">
            <Image
              src={user?.image || "/default-avatar.png"}
              alt="User"
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
          <span className="font-medium">Profile</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className="w-60 bg-background border border-border rounded-2xl shadow-xl p-4 mt-2"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative w-14 h-14 rounded-full border border-border overflow-hidden shadow-sm">
            <Image
              src={user?.image || "/default-avatar.png"}
              alt="User Avatar"
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>

          <p className="text-sm font-semibold text-foreground mt-1">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[90%]">
            {user?.email || "No email available"}
          </p>
        </div>

        <div className="flex justify-center items-center border-t border-border mt-4 pt-3">
          <ButtonLogout/>
        </div>
      </PopoverContent>
    </Popover>
  );
}