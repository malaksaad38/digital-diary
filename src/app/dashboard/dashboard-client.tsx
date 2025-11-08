"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {Notebook, BarChart3, User, Settings, Edit2, Edit3} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // optional helper for conditional classes

export default function DashboardClient({ user }: { user: any }) {
  const pathname = usePathname();

  const cards = [
    { title: "Prayer Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { title: "My Entries", icon: Edit3, href: "/dashboard/entry" },
    { title: "My Diaries", icon: Notebook, href: "/dashboard/diary" },
    { title: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href} className="group">
                <Card
                  className={cn(
                    "hover:shadow-lg hover:-translate-y-1 transition cursor-pointer rounded-2xl",
                    isActive ? "border-2 border-primary bg-primary/10" : ""
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{item.title}</CardTitle>
                    <item.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage {item.title.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
