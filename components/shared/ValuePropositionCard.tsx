"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useStandardAnimations } from "@/lib/design-system";

interface Benefit {
  title: string;
  description: string;
}

interface TrustBadge {
  text: string;
  variant: "green" | "blue" | "purple" | "orange";
}

interface ValuePropositionCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  subtitle?: string;
  benefits: Benefit[];
  trustBadges: TrustBadge[];
  cta: {
    text: string;
    href: string;
    ariaLabel: string;
    color: "primary" | "accent";
  };
  footerText: string;
  borderColor: string;
  checkIconColor: string;
  animationDirection: "left" | "right";
  searchInput?: boolean;
}


const buttonVariants = {
  primary: "bg-primary hover:bg-blue-600",
  accent: "bg-accent hover:bg-green-600",
};

export function ValuePropositionCard({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  benefits,
  trustBadges,
  cta,
  footerText,
  borderColor,
  checkIconColor,
  animationDirection,
  searchInput = false
}: ValuePropositionCardProps) {
  const { slideInFromLeft, slideInFromRight } = useStandardAnimations();
  const animationProps = animationDirection === "left" ? slideInFromLeft : slideInFromRight;

  return (
    <motion.div {...animationProps}>
      <Card className={`p-8 border-2 ${borderColor} shadow-xl h-full flex flex-col`}>
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${iconColor} rounded-lg grid place-items-center`}>
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
              {subtitle && (
                <p className={`${checkIconColor.replace('text-', 'text-')} font-semibold`}>{subtitle}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className={`h-5 w-5 ${checkIconColor} mt-1`} />
                <div>
                  <p className="font-semibold">{benefit.title}</p>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {trustBadges.map((badge, i) => (
              <StatusBadge 
                key={i} 
                variant={badge.variant} 
                size="sm"
              >
                {badge.text}
              </StatusBadge>
            ))}
          </div>

          {searchInput && (
            <Input
              type="search"
              inputMode="search"
              placeholder="Search for businesses in your suburb…"
              aria-label="Search businesses"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          )}

          <Link href={cta.href} className="block" aria-label={cta.ariaLabel}>
            <Button size="lg" className={`w-full ${buttonVariants[cta.color]} text-white shadow-lg`}>
              {cta.text}
            </Button>
          </Link>
          <p className="text-centre text-sm text-gray-500">{footerText}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}