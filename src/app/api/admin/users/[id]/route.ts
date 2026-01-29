import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import User from "@/models/User";
import Prayer from "@/models/Prayer";
import Diary from "@/models/Diary";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch recent activity
        const [prayers, diaries] = await Promise.all([
            Prayer.find({ userId: id }).sort({ date: -1 }).limit(30),
            Diary.find({ userId: id }).sort({ date: -1 }).limit(30),
        ]);

        return NextResponse.json({
            user,
            prayers,
            diaries,
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, role } = body;

        const user = await User.findByIdAndUpdate(
            id,
            { name, role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        // Delete user and all related data
        await Promise.all([
            User.findByIdAndDelete(id),
            Prayer.deleteMany({ userId: id }),
            Diary.deleteMany({ userId: id }),
        ]);

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
