// Server Component (default in Next.js)
import PrayerDiaryLanding from "./landing-client";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

export default async function LandingPage() {
    const session = await auth()
    return session ? redirect("/dashboard") : <PrayerDiaryLanding/>
}
