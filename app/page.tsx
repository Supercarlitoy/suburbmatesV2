"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp } from "lucide-react";
import { Marquee } from "@/components/magicui/marquee";
import Link from "next/link";
import { SuburbMatesLogo } from "@/components/ui/SuburbMatesLogo";

// Reusable Components
import { Navigation } from "@/components/shared/Navigation";
import { HeroSection } from "@/components/shared/HeroSection";
import { ValuePropositionCard } from "@/components/shared/ValuePropositionCard";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { StatsSection } from "@/components/shared/StatsSection";

const floatingKeyframes = `
  @keyframes floating { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
`;

export default function HomePage() {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);

  const testimonials = [
    { name: "Mike's Plumbing", suburb: "Hawthorn", text: "Got 15 new customers in my first week! The ABN verification really helps with trust.", result: "+$3,500 revenue this month", avatar: "M", color: "bg-blue-500", rating: 5 },
    { name: "Sarah's Cafe", suburb: "Richmond", text: "Amazing platform! Local residents love finding us through SuburbMates.", result: "12 new leads this week", avatar: "S", color: "bg-pink-500", rating: 5 },
    { name: "Apex Landscaping", suburb: "Kew", text: "Setup was incredibly easy. Started getting inquiries within hours!", result: "8 projects booked", avatar: "A", color: "bg-green-500", rating: 5 },
    { name: "Luna Hair Studio", suburb: "Fitzroy", text: "Best investment for my business. Clients find me so easily now!", result: "25% more bookings", avatar: "L", color: "bg-purple-500", rating: 5 },
  ];

  const businessBenefits = [
    { title: "Get qualified leads from your suburb", description: "Average 15 new customers in first month" },
    { title: "Verified ABN increases trust", description: "Official ABR integration included" },
    { title: "Professional profile + social media", description: "Worth $500/month — yours free" },
    { title: "Be found before competitors", description: "Priority listing in search" },
  ];

  const residentBenefits = [
    { title: "Find trusted local businesses instantly", description: "Verified businesses in your neighbourhood" },
    { title: "Read verified reviews from neighbours", description: "Real feedback from local community" },
    { title: "Contact businesses directly", description: "No middleman, direct communication" },
    { title: "Support your local community", description: "Keep money in your neighbourhood" },
  ];

  const businessTrustBadges = [
    { text: "Free Forever", variant: "green" as const },
    { text: "Melbourne Focused", variant: "blue" as const },
    { text: "500+ Businesses", variant: "purple" as const },
    { text: "5 Min Setup", variant: "orange" as const },
  ];

  const residentTrustBadges = [
    { text: "Always Free", variant: "green" as const },
    { text: "Local Focus", variant: "blue" as const },
    { text: "Verified Reviews", variant: "purple" as const },
    { text: "Easy Search", variant: "orange" as const },
  ];

  const stats = [
    { number: "500+", label: "Melbourne Businesses", color: "primary" as const },
    { number: "50+", label: "Suburbs Covered", color: "accent" as const },
    { number: "10,000+", label: "Connections Made", color: "success" as const },
  ];

  const trustIndicators = [
    { color: "bg-green-500", text: "Enterprise Security" },
    { color: "bg-blue-500", text: "ABN Verified" },
    { color: "bg-purple-500", text: "5‑Minute Setup" },
    { color: "bg-yellow-400", text: "Premium Support" },
  ];

  // Exit intent
  useEffect(() => {
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        setShowExitIntent(true);
        setExitIntentShown(true);
      }
    };
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, [exitIntentShown]);

  return (
    <>
      <style jsx global>{floatingKeyframes}</style>

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection
        badge="Melbourne's Premier Business Network"
        title="Elevate Your"
        subtitle="Local Presence"
        description="Connect with Melbourne's most discerning customers through our exclusive business network. Join 500+ premium businesses already growing their local market share."
        primaryCTA={{
          text: "Start Your Premium Journey",
          href: "/signup",
          ariaLabel: "Start your premium journey"
        }}
        secondaryCTA={{
          text: "👀 Preview Your Business Profile",
          onClick: () => window.open("/business/preview-demo", "_blank"),
          ariaLabel: "Preview your business profile"
        }}
        trustIndicators={trustIndicators}
        showScrollIndicator={true}
      />

      {/* VALUE PROPS */}
       <section className="py-20 bg-gray-50" aria-labelledby="value-props">
         <h2 id="value-props" className="sr-only">Choose your experience</h2>
         <div className="container mx-auto px-4">
           <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
             {/* Business Owners */}
             <ValuePropositionCard
               icon={TrendingUp}
               iconColor="bg-primary/10"
               title="For Melbourne Business Owners"
               subtitle="Most Popular Choice"
               benefits={businessBenefits}
               trustBadges={businessTrustBadges}
               cta={{
                 text: "🚀 Start Getting Leads Today — FREE",
                 href: "/signup",
                 ariaLabel: "Start getting leads",
                 color: "primary"
               }}
               footerText="Join before your competitors do"
               borderColor="border-primary/20"
               checkIconColor="text-success"
               animationDirection="left"
             />

             {/* Residents */}
             <ValuePropositionCard
               icon={MapPin}
               iconColor="bg-accent/10"
               title="For Local Residents"
               subtitle="Discover & Connect"
               benefits={residentBenefits}
               trustBadges={residentTrustBadges}
               cta={{
                 text: "🔍 Browse Local Businesses",
                 href: "/search",
                 ariaLabel: "Browse local businesses",
                 color: "accent"
               }}
               footerText="Discover quality businesses near you"
               borderColor="border-accent/20"
               checkIconColor="text-accent"
               animationDirection="right"
               searchInput={true}
             />
           </div>
         </div>
       </section>

      {/* SOCIAL PROOF */}
       <section className="py-20 bg-white overflow-hidden" aria-labelledby="social-proof">
         <div className="container mx-auto px-4">
           <div className="text-center mb-12">
              <h2 id="social-proof" className="text-4xl font-bold text-gray-900">Trusted by 500+ Melbourne Businesses</h2>
              <p className="text-lg text-gray-600">See what local business owners are saying</p>
            </div>
           <div className="relative">
             <Marquee className="py-4" pauseOnHover aria-label="testimonials carousel">
               {testimonials.map((testimonial, i) => (
                 <TestimonialCard key={i} {...testimonial} />
               ))}
             </Marquee>
           </div>
         </div>
       </section>

       {/* STATS */}
       <StatsSection stats={stats} />

       {/* FOOTER */}
       <footer className="border-t bg-gray-50 py-10" aria-labelledby="footer">
         <div className="container mx-auto px-4 text-center space-y-4">
           <h2 id="footer" className="sr-only">Footer</h2>
           <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
             <span className="text-sm">Powered by</span>
             <SuburbMatesLogo variant="FooterLogo" size="xs" />
           </div>
           <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
             Connecting Melbourne's business community. Building trust through verification and local focus.
           </p>
           
           {/* Footer Links */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-sm">
             <div className="space-y-2">
               <h3 className="font-semibold text-gray-900">Platform</h3>
               <Link href="/search" className="block text-gray-600 hover:text-primary transition-colors">
                 Find Businesses
               </Link>
               <Link href="/register-business" className="block text-gray-600 hover:text-primary transition-colors">
                 List Your Business
               </Link>
               <Link href="/claim" className="block text-gray-600 hover:text-primary transition-colors">
                 Claim Business
               </Link>
               <Link href="/pricing" className="block text-gray-600 hover:text-primary transition-colors">
                 Pricing
               </Link>
             </div>
             <div className="space-y-2">
               <h3 className="font-semibold text-gray-900">Company</h3>
               <Link href="/about" className="block text-gray-600 hover:text-primary transition-colors">
                 About Us
               </Link>
               <Link href="/contact" className="block text-gray-600 hover:text-primary transition-colors">
                 Contact
               </Link>
               <Link href="/help" className="block text-gray-600 hover:text-primary transition-colors">
                 Help Center
               </Link>
               <Link href="/status" className="block text-gray-600 hover:text-primary transition-colors">
                 System Status
               </Link>
             </div>
             <div className="space-y-2">
               <h3 className="font-semibold text-gray-900">Legal</h3>
               <Link href="/terms" className="block text-gray-600 hover:text-primary transition-colors">
                 Terms of Service
               </Link>
               <Link href="/privacy" className="block text-gray-600 hover:text-primary transition-colors">
                 Privacy Policy
               </Link>
             </div>
             <div className="space-y-2">
               <h3 className="font-semibold text-gray-900">Account</h3>
               <Link href="/login" className="block text-gray-600 hover:text-primary transition-colors">
                 Sign In
               </Link>
               <Link href="/signup" className="block text-gray-600 hover:text-primary transition-colors">
                 Sign Up
               </Link>
               <Link href="/dashboard" className="block text-gray-600 hover:text-primary transition-colors">
                 Dashboard
               </Link>
             </div>
           </div>
           
           <div className="pt-6 border-t border-gray-200 text-xs text-gray-500">
             © 2024 SuburbMates. All rights reserved. Made with ❤️ in Melbourne.
           </div>
         </div>
       </footer>

      {/* EXIT INTENT */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/80 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Join today for free leads" onClick={() => setShowExitIntent(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full grid place-items-center mx-auto mb-4 text-2xl" aria-hidden>🎁</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Wait! Don't Miss Out!</h3>
              <p className="text-gray-600 mb-6">Get your first 5 leads absolutely free when you join today.</p>
              <Link href="/signup">
                <Button className="bg-red-600 hover:bg-red-700 text-white w-full mb-3">🎁 Claim My Free Leads Now</Button>
              </Link>
              <button className="text-gray-500 hover:text-gray-700 text-sm" onClick={() => setShowExitIntent(false)}>No thanks, I don't want free leads</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}