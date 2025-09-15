"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface HeroSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  primaryCTA?: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
  secondaryCTA?: {
    text: string;
    href?: string;
    onClick?: () => void;
    ariaLabel?: string;
  };
  trustIndicators?: Array<{
    color: string;
    text: string;
  }>;
  showScrollIndicator?: boolean;
  backgroundVariant?: "default" | "white" | "gradient";
}

const glass = {
  shell: "bg-white/5 backdrop-blur-2xl border border-white/10",
  gradientText: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
  heroBg: "bg-gradient-to-br from-slate-50 via-blue-50 to-green-50",
};

export function HeroSection({
  badge,
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  trustIndicators,
  showScrollIndicator = false,
  backgroundVariant = "default"
}: HeroSectionProps) {
  const backgroundClass = {
    default: glass.heroBg,
    white: "bg-white",
    gradient: "bg-gradient-to-br from-primary/5 via-accent/5 to-success/5"
  }[backgroundVariant];

  return (
    <section className={`min-h-screen ${backgroundClass} relative overflow-hidden flex items-center pt-24`}>
      {/* Floating background elements */}
      {backgroundVariant === "default" && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-[floating_6s_ease-in-out_infinite]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            aria-hidden
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-[floating_6s_ease-in-out_infinite]"
            style={{ animationDelay: "2s" } as React.CSSProperties}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            aria-hidden
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10 w-full">
        {/* Badge */}
        {badge && (
          <motion.div
            className={`inline-flex items-center gap-2 ${glass.shell} px-6 py-3 rounded-full mb-8`}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" aria-hidden />
            <span className="text-sm text-gray-700">{badge}</span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="block text-gray-900">{title}</span>
          {subtitle && (
            <span className={`${glass.gradientText} block`}>{subtitle}</span>
          )}
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mt-6 text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          {description}
        </motion.p>

        {/* CTAs */}
        {(primaryCTA || secondaryCTA) && (
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {primaryCTA && (
              <Link href={primaryCTA.href} aria-label={primaryCTA.ariaLabel}>
                <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-primary to-accent text-white rounded-full px-10 py-6 font-semibold">
                  {primaryCTA.text}
                </Button>
              </Link>
            )}
            {secondaryCTA && (
              <Button
                variant="outline"
                size="lg"
                className={`${glass.shell} rounded-full border-white/20 text-gray-800`}
                onClick={secondaryCTA.onClick}
                aria-label={secondaryCTA.ariaLabel}
              >
                {secondaryCTA.text}
              </Button>
            )}
          </motion.div>
        )}

        {/* Trust Indicators */}
        {trustIndicators && trustIndicators.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600" aria-label="trust indicators">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`w-2 h-2 ${indicator.color} rounded-full`} aria-hidden />
                {indicator.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          aria-hidden
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full grid place-items-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </motion.div>
      )}
    </section>
  );
}