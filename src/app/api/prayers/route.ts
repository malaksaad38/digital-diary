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
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const newPrayer = await Prayer.create({
      userId: session.user.id, // ✅ user ID from Auth.js session
      fajr: body.fajr,
      zuhr: body.zuhr,
      asar: body.asar,
      maghrib: body.maghrib,
      esha: body.esha,
      recite: body.recite,
      zikr: body.zikr,
      timestamp: body.timestamp || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: newPrayer }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error saving prayer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
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
