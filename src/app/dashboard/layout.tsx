import {auth} from "@/auth";
import {redirect} from "next/navigation";
import Navbar from "@/components/Navbar";
import PWAStatus from "@/components/pwa-status";

export default async function LayoutPrivate({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect("/");

    const user = session.user;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors">
            <PWAStatus/>
            <Navbar user={user}/>
            <main className="max-w-6xl mx-auto md:px-6 py-6 pb-20 md:pb-4 pt-[70px] md:pt-20">
                {children}
            </main>
        </div>
    );
}
