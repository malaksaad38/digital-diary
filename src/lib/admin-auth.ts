import { auth } from "@/auth";
import User from "@/models/User";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";

export async function requireAdmin() {
    const session = await auth();

    if (!session?.user?.email) {
        return null;
    }

    // Ensure DB connection
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "admin") {
        return null;
    }

    return user;
}
