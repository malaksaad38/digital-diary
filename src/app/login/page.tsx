"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = () =>
    signIn("google", { callbackUrl: "/dashboard" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:w-[50vw] w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 text-center space-y-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-16 h-16">
            <Image
              src="/logo.png"
              alt="App Logo"
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome Back 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Google Button */}
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-5 text-base font-medium border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <Chrome className="w-5 h-5 text-blue-500" />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-grow h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-grow h-px bg-border" />
        </div>

        <p className="text-xs text-muted-foreground">
          <a href="/" className="text-primary hover:underline">
            Go back to Home page
          </a>
        </p>

        {/*<p className="text-xs text-muted-foreground">*/}
        {/*  By continuing, you agree to our{" "}*/}
        {/*  <a href="/terms" className="text-primary hover:underline">*/}
        {/*    Terms of Service*/}
        {/*  </a>{" "}*/}
        {/*  and{" "}*/}
        {/*  <a href="/privacy" className="text-primary hover:underline">*/}
        {/*    Privacy Policy*/}
        {/*  </a>*/}
        {/*  .*/}
        {/*</p>*/}
      </motion.div>
    </div>
  );
}
