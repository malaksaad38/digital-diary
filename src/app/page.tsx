"use client"
import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, Cloud, Sparkles, Calendar, Search, Heart, TrendingUp, Menu, X, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import {useRouter} from "next/navigation";

export default function DiaryLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  const features = [
    { icon: Lock, title: "Private & Secure", desc: "End-to-end encryption keeps your thoughts safe" },
    { icon: Cloud, title: "Cloud Sync", desc: "Access your diary anywhere, anytime" },
    { icon: Search, title: "Smart Search", desc: "Find any memory in seconds" },
    { icon: Calendar, title: "Daily Reminders", desc: "Never miss a day of journaling" },
    { icon: Sparkles, title: "AI Insights", desc: "Discover patterns in your emotions" },
    { icon: TrendingUp, title: "Track Progress", desc: "Visualize your personal growth" }
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Writer", text: "This app transformed my journaling habit. The interface is so beautiful, I actually look forward to writing every day." },
    { name: "Marcus Johnson", role: "Entrepreneur", text: "The AI insights helped me identify stress patterns I never noticed. Game-changing for mental health." },
    { name: "Emma Rodriguez", role: "Student", text: "Finally, a diary that syncs everywhere and keeps my thoughts completely private. Love it!" }
  ];

  const router = useRouter()
  const handleSubmit = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10 transition-colors">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-lg border-b' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <img src="/logo.png" alt="Digital Diary Logo" className="w-8 h-8 rounded-full object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Digital Diary
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition">Testimonials</a>
              {/*<a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>*/}

              <ModeToggle />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-full shadow-lg" onClick={handleSubmit} >
                  Get Started
                </Button>
              </motion.div>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <ModeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-background border-t"
          >
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-foreground">Features</a>
              <a href="#testimonials" className="block text-muted-foreground hover:text-foreground">Testimonials</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</a>
              <Button className="w-full rounded-full" onClick={handleSubmit}>Get Started</Button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="pt-32 pb-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <Badge variant="secondary" className="gap-2 py-2 px-4">
                  <Sparkles className="w-4 h-4" />
                  Now with AI-powered insights
                </Badge>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Your thoughts,
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> beautifully organized</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8">
                The modern diary app that helps you reflect, grow, and discover insights about yourself. Private, secure, and beautifully designed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="rounded-full shadow-2xl text-lg w-full sm:w-auto" onClick={handleSubmit}>
                    Start Writing Free
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="rounded-full text-lg w-full sm:w-auto">
                    Watch Demo
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>50K+ happy journalers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Bank-level security</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 shadow-2xl">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" />
                        <CardTitle>Today's Entry</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                      <div className="h-3 bg-muted rounded w-4/6"></div>
                      <div className="mt-6 flex gap-2">
                        <Badge variant="secondary">Grateful</Badge>
                        <Badge variant="secondary">Productive</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-yellow-400 rounded-full p-4 shadow-lg"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ rotate: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 bg-pink-400 rounded-full p-4 shadow-lg"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need to journal better
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features designed for your daily reflection
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-primary to-secondary w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Loved by journalers worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who've transformed their journaling habit
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Heart key={i} className="w-5 h-5 fill-red-500 text-red-500" />
                      ))}
                    </div>
                    <CardDescription className="text-base italic mb-4">
                      "{testimonial.text}"
                    </CardDescription>
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          {...fadeInUp}
          className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-center shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Start your journey today
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join 50,000+ people who trust Digital Diary with their thoughts
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" variant="secondary" className="rounded-full shadow-xl text-lg" onClick={handleSubmit}>
              Get Started Free
            </Button>
          </motion.div>
          <p className="text-primary-foreground/80 mt-4 text-sm">No credit card required • Free forever</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Digital Diary Logo" className="w-6 h-6 rounded-full" />
              <span className="text-xl font-bold">Digital Diary</span>
            </div>
            <p className="text-muted-foreground text-sm">Your private space for thoughts and reflections.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p className="hover:text-foreground cursor-pointer transition">Features</p>
              <p className="hover:text-foreground cursor-pointer transition">Pricing</p>
              <p className="hover:text-foreground cursor-pointer transition">Security</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p className="hover:text-foreground cursor-pointer transition">About</p>
              <p className="hover:text-foreground cursor-pointer transition">Blog</p>
              <p className="hover:text-foreground cursor-pointer transition">Careers</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p className="hover:text-foreground cursor-pointer transition">Help Center</p>
              <p className="hover:text-foreground cursor-pointer transition">Contact</p>
              <p className="hover:text-foreground cursor-pointer transition">Privacy</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
          <p>© 2025 Digital Diary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}