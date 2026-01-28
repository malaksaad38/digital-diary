"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // ✅ Sonner

export default function UpdateNameDialog({ currentName }: { currentName?: string }) {
    const [name, setName] = useState(currentName || "");
    const [loading, setLoading] = useState(false);

    const updateName = async () => {
        const trimmed = name.trim();

        // ✅ Client-side validation
        if (!trimmed) return toast.error("Name is required.");
        if (trimmed.length < 3) return toast.error("Name must be at least 3 characters.");
        if (trimmed.length > 20) return toast.error("Name cannot exceed 20 characters.");
        if (!/^[a-zA-Z\s]+$/.test(trimmed)) return toast.error("Only letters and spaces allowed.");

        setLoading(true);

        try {
            const res = await fetch("/api/user/name", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmed }),
            });

            const data = await res.json();

            if (!res.ok) return toast.error(data.error || "Failed to update name");

            toast.success("Name updated successfully!"); // ✅ Sonner success toast
            window.location.reload();
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="h-7 w-7" title="Edit name">
                    <Pencil className="h-2 w-2" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Update your name</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />

                    <Button onClick={updateName} disabled={loading} className="w-full">
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
