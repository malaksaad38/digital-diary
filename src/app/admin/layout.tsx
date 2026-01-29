import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";
import User from "@/models/User";
import mongoose from "mongoose";
import {ModeToggle} from "@/components/mode-toggle";

async function getAdminUser(email: string) {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
    return User.findOne({ email });
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await getAdminUser(session.user.email);

    if (!user || user.role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <div className="flex flex-col h-full">
                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
                            </div>
                            <nav className="flex-1 px-4 space-y-2">
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard size={20} />
                                    <span>Overview</span>
                                </Link>
                                <Link
                                    href="/admin/users"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Users size={20} />
                                    <span>Users</span>
                                </Link>
                            </nav>
                            <div className=" p-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 py-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {session.user.name?.[0] || "A"}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium truncate">{session.user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                    </div>
                                </div>
                                <div className={"flex justify-between items-center"}>
                                    <Link href={"/dashboard"}>
                                        <Button variant={"outline"} >Back to Dashboard</Button>
                                    </Link>
                                    <ModeToggle/>
                                </div>

                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {session.user.name?.[0] || "A"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                    </div>
                    <div className={"flex justify-between items-center"}>
                        <Link href={"/dashboard"}>
                            <Button variant={"outline"} >Back to Dashboard</Button>
                        </Link>
                        <ModeToggle/>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
