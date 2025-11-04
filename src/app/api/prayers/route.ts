import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Prayer from "@/models/Prayer";
import { auth } from "@/auth"; // ✅ from auth.js setup (Auth.js official helper)

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define MONGODB_URI in .env.local");
}

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

// --- POST: Create New Prayer ---

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { userId, date, fajr, zuhr, asar, maghrib, esha, recite, zikr } = body;

    // ✅ validate required fields
    if (!userId || !date || !fajr || !zuhr || !asar || !maghrib || !esha) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    // ✅ Try inserting new prayer (unique per userId + date)
    try {
      const prayer = await Prayer.create({
        userId,
        date,
        fajr,
        zuhr,
        asar,
        maghrib,
        esha,
        recite,
        zikr,
      });

      return NextResponse.json({ success: true, data: prayer });
    } catch (error: any) {
      // Duplicate date entry
      if (error.code === 11000) {
        return NextResponse.json(
          { success: false, error: "Prayer log for this date already exists." },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error saving prayer:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- GET: Fetch All Prayers for Logged-in User ---
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const prayers = await Prayer.find({ userId: session.user.id }).sort({
      timestamp: -1,
    });

    return NextResponse.json({ success: true, data: prayers });
  } catch (error: any) {
    console.error("❌ Error fetching prayers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
