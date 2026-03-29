// app/api/history/route.ts
// Single endpoint that returns prayers + diaries in one DB call — faster than two separate requests
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongo from "@/lib/mongoose";
import Prayer from "@/models/Prayer";
import Diary from "@/models/Diary";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const userId = session.user.id;

        // Run both DB queries in parallel — faster than sequential
        const [prayers, diaries] = await Promise.all([
            Prayer.find({ userId }).sort({ date: -1 }).lean(),
            Diary.find({ userId }).sort({ date: -1 }).lean(),
        ]);

        return NextResponse.json(
            { success: true, prayers, diaries },
            {
                headers: {
                    // Cache at edge for 30 seconds — reduces DB hits for repeat visits
                    "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
                },
            }
        );
    } catch (error: any) {
        console.error("❌ Error fetching history:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
