"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavigationProps {
  variant?: "default" | "transparent";
  showCTA?: boolean;
}

const glass = {
  shell: "bg-white/5 backdrop-blur-2xl border border-white/10",
  light: "bg-white/90 text-gray-900 backdrop-blur-2xl border border-white/20",
  gradientText: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
  premiumHover: "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl",
};

export function Navigation({ variant = "default", showCTA = true }: NavigationProps) {
  const navClass = variant === "transparent" ? "bg-transparent" : glass.shell;

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 ${navClass}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="navigation"
      aria-label="Primary"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3" aria-label="SuburbMates home">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className={`text-2xl font-bold ${glass.gradientText}`}>SuburbMates</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-gray-700 hover:text-primary transition-colors">
              Businesses
            </Link>
            <Link href="/feed" className="text-gray-700 hover:text-primary transition-colors">
              Residents
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/login">
              <Button variant="ghost" aria-label="Sign in">
                Sign In
              </Button>
            </Link>
            {showCTA && (
              <Link href="/signup">
                <Button 
                  className={`${glass.light} border-0 ${glass.premiumHover}`} 
                  aria-label="Join premium network"
                >
                  Join Premium Network
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}