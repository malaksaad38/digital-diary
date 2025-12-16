"use client";

import React, {useEffect, useState} from "react";
import {
    BarChart3,
    BookOpen,
    ChevronRight,
    Clock,
    Cloud,
    Heart,
    HouseHeartIcon,
    Lock,
    Menu,
    Search,
    Sparkles,
    Star,
    X,
} from "lucide-react";
import {motion, useScroll} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ModeToggle} from "@/components/mode-toggle";
import {useRouter} from "next/navigation";

export default function PrayerDiaryLanding() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const {scrollY} = useScroll();
    const router = useRouter();
    const handleSubmit = () => router.push("/login");

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeInUp = {
        initial: {opacity: 0, y: 60},
        whileInView: {opacity: 1, y: 0},
        viewport: {once: true},
        transition: {duration: 0.6},
    };

    const staggerChildren = {
        initial: {opacity: 0},
        whileInView: {opacity: 1},
        viewport: {once: true},
        transition: {staggerChildren: 0.2},
    };

    const features = [
        {
            icon: HouseHeartIcon,
            title: "Accurate Prayer Times",
            desc: "Auto-detected Salah timings based on your city Fajr to Isha with Athan alerts.",
        },
        {
            icon: Clock,
            title: "Prayer Tracking",
            desc: "Mark prayers as Prayed, Missed, Delayed, or Jama'ah. Build consistency with ease.",
        },
        {
            icon: BarChart3,
            title: "Spiritual Analytics",
            desc: "Monthly and weekly Salah insights that reveal patterns and growth.",
        },
        {
            icon: BookOpen,
            title: "Prayer-Focused Diary",
            desc: "Write reflections tied to each Salah deepen your spiritual awareness.",
        },
        {
            icon: Search,
            title: "Reflection Search",
            desc: "Find past journal entries by emotion, keywords, or prayer type.",
        },
        {
            icon: Cloud,
            title: "Cloud Sync & Security",
            desc: "Encrypted, safe, and accessible across all devices your privacy stays protected.",
        },
    ];

    const testimonials = [
        {
            name: "Aisha Siddiqui",
            role: "Teacher",
            text: "This app feels peaceful. The diary after each Salah helped strengthen my focus and gratitude."
        },
        {
            name: "Mohammed Arqam",
            role: "Engineer",
            text: "Seeing my Salah analytics was a turning point. It motivated me like never before."
        },
        {
            name: "Hafsa M.",
            role: "Student",
            text: "Finally an app that blends faith, journaling, and beautiful design. 10/10 experience."
        },
    ];

    const faq = [
        {q: "Is my data private?", a: "Yes. Your reflections and prayer habits are fully encrypted and never shared."},
        {q: "Is the app free?", a: "Yes. Core features like tracking, prayer times, and journaling are free forever."},
        {q: "Does it work worldwide?", a: "Yes. Prayer times support almost every country and calculation method."},
    ];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors relative">

            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"></div>

            {/* Navigation */}
            <motion.nav
                initial={{y: -100}}
                animate={{y: 0}}
                className={`fixed w-full z-50 transition-all duration-300 ${
                    isScrolled ? "bg-background/90 backdrop-blur-lg shadow-lg border-b" : "bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div className="flex items-center gap-2" whileHover={{scale: 1.05}}>
                        <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full object-contain"/>
                        <span
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-500 dark:from-green-400 dark:to-blue-400">
              Digital Diary
            </span>
                    </motion.div>

                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features"
                           className="text-muted-foreground hover:text-green-600 dark:hover:text-blue-400 transition">Features</a>
                        <a href="#testimonials"
                           className="text-muted-foreground hover:text-green-600 dark:hover:text-blue-400 transition">Testimonials</a>
                        <a href="#faq"
                           className="text-muted-foreground hover:text-green-600 dark:hover:text-blue-400 transition">FAQ</a>

                        <ModeToggle/>

                        <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                            <Button onClick={() => router.push("/login")}
                                    className="rounded-full shadow-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white">
                                Get Started
                            </Button>
                        </motion.div>
                    </div>

                    <div className="flex md:hidden items-center gap-2">
                        <ModeToggle/>
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                        </Button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: "auto"}}
                                className="md:hidden bg-background border-t">
                        <div className="px-6 py-4 space-y-4">
                            <a href="#features"
                               className="block text-muted-foreground hover:text-green-600 dark:hover:text-blue-400">Features</a>
                            <a href="#testimonials"
                               className="block text-muted-foreground hover:text-green-600 dark:hover:text-blue-400">Testimonials</a>
                            <a href="#faq"
                               className="block text-muted-foreground hover:text-green-600 dark:hover:text-blue-400">FAQ</a>
                            <Button onClick={() => router.push("/login")}
                                    className="w-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white">Get
                                Started</Button>
                        </div>
                    </motion.div>
                )}
            </motion.nav>

            {/* Hero Section */}
            <motion.section className="pt-36 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{opacity: 0, x: -60}} animate={{opacity: 1, x: 0}}
                                transition={{duration: 0.8}}>
                        <Badge variant="secondary"
                               className="gap-2 py-2 px-4 w-fit mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg">
                            <Sparkles className="w-4 h-4"/> Advanced Salah Analytics
                        </Badge>

                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                            Your spiritual journey,{" "}
                            <span
                                className="bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent dark:from-green-400 dark:to-blue-400">
                beautifully guided
              </span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                            Track prayers, write meaningful reflections, and analyze your spiritual progress all in one
                            peaceful Islamic-themed digital diary.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg"
                                    className="rounded-full shadow-2xl text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white"
                                    onClick={handleSubmit}>
                                Start Your Journey <ChevronRight className="w-5 h-5 ml-2"/>
                            </Button>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400"/>
                                <span>Trusted by 90,000+ Muslims worldwide</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-green-500"/>
                                <span>Private & Encrypted</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Mockup */}
                    <motion.div initial={{opacity: 0, scale: 0.85}} animate={{opacity: 1, scale: 1}}
                                transition={{duration: 0.8, delay: 0.3}} className="relative">
                        <div
                            className="relative bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-8 shadow-2xl">
                            <motion.div animate={{y: [0, -10, 0]}} transition={{duration: 3, repeat: Infinity}}>
                                <Card
                                    className="shadow-lg rounded-xl bg-background border border-transparent dark:border-gray-700">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <HouseHeartIcon className="w-6 h-6 text-foreground"/>
                                            <CardTitle className="text-foreground">Today's Prayers</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-foreground">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm opacity-70">Fajr</p>
                                                <p className="text-lg font-medium">05:02</p>
                                            </div>
                                            <Badge variant="secondary"
                                                   className="bg-background/30 text-foreground">Prayed</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm opacity-70">Dhuhr</p>
                                                <p className="text-lg font-medium">12:15</p>
                                            </div>
                                            <Badge variant="secondary"
                                                   className="bg-background/30 text-foreground">Upcoming</Badge>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Badge variant="secondary"
                                                   className="bg-background/30 text-foreground">Fajr</Badge>
                                            <Badge variant="secondary"
                                                   className="bg-background/30 text-foreground">Dhuhr</Badge>
                                            <Badge variant="secondary"
                                                   className="bg-background/30 text-foreground">Asr</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <div className="absolute -top-6 -right-6 bg-green-400 rounded-full p-4 shadow-lg">
                                <Sparkles className="w-8 h-8 text-white"/>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-blue-400 rounded-full p-4 shadow-lg">
                                <Heart className="w-8 h-8 text-white"/>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Everything you need for
                            consistent worship</h2>
                        <p className="text-xl text-muted-foreground">Powerful, secure, and designed to keep your heart
                            aligned with your practice.</p>
                    </motion.div>

                    <motion.div variants={staggerChildren} initial="initial" whileInView="whileInView"
                                className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div key={idx} variants={fadeInUp} whileHover={{y: -10, scale: 1.02}}>
                                <Card
                                    className="h-full hover:shadow-2xl transition-shadow rounded-xl border border-transparent dark:border-gray-700 bg-background">
                                    <CardHeader>
                                        <div
                                            className="bg-gradient-to-br from-green-400 to-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                            <feature.icon className="w-7 h-7 text-white"/>
                                        </div>
                                        <CardTitle className="text-foreground">{feature.title}</CardTitle>
                                        <CardDescription
                                            className="text-muted-foreground">{feature.desc}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Loved by communities
                            worldwide</h2>
                        <p className="text-xl text-muted-foreground">Real stories from people who found more presence in
                            prayer.</p>
                    </motion.div>

                    <motion.div variants={staggerChildren} initial="initial" whileInView="whileInView"
                                className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div key={i} variants={fadeInUp} whileHover={{scale: 1.03, y: -5}}>
                                <Card
                                    className="h-full bg-background rounded-2xl shadow-lg border border-transparent dark:border-gray-700 transition-transform duration-300">
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="rounded-full bg-gradient-to-br from-green-400 to-blue-500 w-12 h-12 flex items-center justify-center text-white font-semibold">{t.name[0]}</div>
                                            <div>
                                                <CardTitle className="text-base text-foreground">{t.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{t.role}</p>
                                            </div>
                                        </div>
                                        <CardDescription
                                            className="italic text-base mb-4">{`"${t.text}"`}</CardDescription>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, k) => (
                                                <Star key={k} className="w-4 h-4 text-yellow-400"/>
                                            ))}
                                        </div>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground mt-2">Short answers to common questions about privacy,
                            pricing, and features.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {faq.map((f, i) => (
                            <div key={i}
                                 className="p-6 bg-background rounded-2xl shadow-md border border-transparent dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                                <p className="font-semibold text-foreground mb-2">{f.q}</p>
                                <p className="text-sm text-muted-foreground">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div
                    className="max-w-4xl mx-auto bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-600 rounded-3xl p-12 text-center shadow-2xl">
                    <h2 className="text-4xl font-bold text-white mb-4">Start your spiritual habit today</h2>
                    <p className="text-lg text-white/90 mb-8">Join 90,000+ people who trust Digital Diary to keep their
                        prayers consistent and their reflections safe.</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button onClick={() => router.push("/login")} size="lg"
                                className="rounded-full shadow-xl text-lg bg-white text-green-600 hover:bg-green-50 transition">
                            Get Started For Free
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background border-t border-gray-200 dark:border-gray-700 py-10 px-6">
                <div className="max-w-7xl mx-auto text-center text-muted-foreground">
                    <p>© {new Date().getFullYear()} Digital Diary. All rights reserved.</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <a href="#" className="hover:text-green-500 transition">Privacy</a>
                        <a href="#" className="hover:text-green-500 transition">Terms</a>
                        <a href="#" className="hover:text-green-500 transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
