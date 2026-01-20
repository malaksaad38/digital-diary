import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // ✅ Professional validation
    const trimmedName = name?.trim();
    if (!trimmedName) {
        return Response.json({ error: "Name is required." }, { status: 400 });
    }
    if (trimmedName.length < 3) {
        return Response.json({ error: "Name must be at least 3 characters." }, { status: 400 });
    }
    if (trimmedName.length > 20) {
        return Response.json({ error: "Name cannot exceed 20 characters." }, { status: 400 });
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        return Response.json({ error: "Name can only contain letters and spaces." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { name: trimmedName } }
    );

    return Response.json({ success: true, name: trimmedName });
}
