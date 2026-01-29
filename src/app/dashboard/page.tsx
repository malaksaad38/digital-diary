import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import mongoose from "mongoose";
import User from "@/models/User";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  const dbUser = await User.findOne({ email: session.user.email });
  const isAdmin = dbUser?.role === "admin";

  return <DashboardClient user={session.user} isAdmin={isAdmin} />;
}
