"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Notebook,
  User,
  Settings,
} from "lucide-react";

export default function DashboardClient({ user }: { user: any }) {

  const cards = [
    { title: "My Entries", icon: Notebook },
    { title: "Analytics", icon: BarChart3 },
    { title: "Profile", icon: User },
    { title: "Settings", icon: Settings },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center py-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>

      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{item.title}</CardTitle>
                <item.icon className="h-6 w-6 text-primary group-hover:scale-110 transition" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage {item.title.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
