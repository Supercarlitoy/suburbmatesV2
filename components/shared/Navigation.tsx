"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { glass, animations } from "@/lib/design-system";
import { NavigationLogo } from "@/components/ui/SuburbMatesLogo";

interface NavigationProps {
  variant?: "default" | "transparent";
  showCTA?: boolean;
}

export function Navigation({ variant = "default", showCTA = true }: NavigationProps) {
  const navClass = variant === "transparent" ? "bg-transparent" : glass.shell;

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 ${navClass}`}
      {...animations.navSlideDown}
      role="navigation"
      aria-label="Primary"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <NavigationLogo />
          <div className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-gray-700 hover:text-primary transition-colors">
              Businesses
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/help" className="text-gray-700 hover:text-primary transition-colors">
              Help
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