"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Clock, 
  CheckCircle, 
  Users, 
  Award,
  Share2,
  Heart,
  MessageCircle,
  Shield,
  Zap,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight,
  Eye,
  ThumbsUp,
  Calendar,
  ExternalLink,
  Navigation,
  Bookmark,
  Camera,
  Settings,
  Palette,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

// Apple.com inspired theme configurations with SF Pro font system
const THEMES = {
  classic: {
    name: "Classic",
    primary: "#007AFF", // iOS Blue
    secondary: "#34C759", // iOS Green
    background: "linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 100%)",
    cardBg: "rgba(255, 255, 255, 0.8)",
    textPrimary: "#1D1D1F",
    textSecondary: "#86868B",
    border: "rgba(0, 0, 0, 0.08)",
    accent: "rgba(0, 122, 255, 0.1)"
  },
  bold: {
    name: "Bold",
    primary: "#FF3B30", // iOS Red
    secondary: "#FF9500", // iOS Orange
    background: "linear-gradient(180deg, #000000 0%, #1C1C1E 100%)",
    cardBg: "rgba(28, 28, 30, 0.8)",
    textPrimary: "#F5F5F7",
    textSecondary: "#A1A1A6",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "rgba(255, 59, 48, 0.1)"
  },
  compact: {
    name: "Compact",
    primary: "#5856D6", // iOS Purple
    secondary: "#AF52DE", // iOS Purple Light
    background: "linear-gradient(180deg, #FBFBFD 0%, #F2F2F7 100%)",
    cardBg: "rgba(255, 255, 255, 0.9)",
    textPrimary: "#1D1D1F",
    textSecondary: "#6D6D70",
    border: "rgba(0, 0, 0, 0.06)",
    accent: "rgba(88, 86, 214, 0.1)"
  }
};

// Apple-style animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export default function BusinessProfilePreview() {
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [viewCount, setViewCount] = useState(1247);
  const [showCustomizer, setShowCustomizer] = useState(true); // Default open for visibility
  const [isScrolled, setIsScrolled] = useState(false);

  const theme = THEMES[currentTheme as keyof typeof THEMES];

  useEffect(() => {
    // Simulate view count increment with Apple-style animation
    const timer = setTimeout(() => setViewCount(prev => prev + 1), 2000);
    
    // Handle scroll for header blur effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const businessData = {
    name: "Melbourne Plumbing Pro",
    tagline: "Premium Plumbing Excellence Since 2008",
    category: "Plumbing Services",
    suburb: "Hawthorn, VIC",
    rating: 4.9,
    reviewCount: 127,
    owner: "Mike Thompson",
    phone: "(03) 9123 4567",
    email: "mike@melbourneplumbing.com.au",
    website: "www.melbourneplumbing.com.au",
    highlights: ["24/7 Emergency", "Licensed & Insured", "15+ Years Experience", "500+ Happy Customers", "Same Day Service"],
    services: ["Emergency Plumbing", "Bathroom Renovations", "Hot Water Systems", "Blocked Drains", "Leak Detection", "Gas Fitting", "Pipe Repairs", "Tap Installation"]
  };

  const reviews = [
    {
      name: "Sarah Mitchell",
      rating: 5,
      text: "Absolutely incredible service! Mike transformed our bathroom into a luxury spa. Professional and exceeded expectations.",
      date: "2 days ago",
      suburb: "Richmond",
      verified: true
    },
    {
      name: "David Chen",
      rating: 5,
      text: "Emergency call at 11PM and Mike was there within 30 minutes. Fixed our burst pipe professionally.",
      date: "1 week ago",
      suburb: "Hawthorn",
      verified: true
    },
    {
      name: "Emma Rodriguez",
      rating: 5,
      text: "Third time using Melbourne Plumbing Pro. Consistently excellent work and fair pricing.",
      date: "2 weeks ago",
      suburb: "Fitzroy",
      verified: true
    }
  ];

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${businessData.name} - ${businessData.tagline}`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
    setShareDialogOpen(false);
  };

  return (
    <div 
      className="min-h-screen transition-all duration-700 ease-out"
      style={{ 
        background: theme.background, 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif'
      }}
    >
      {/* Apple-style Header with Dynamic Blur */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          isScrolled ? 'backdrop-blur-xl' : 'backdrop-blur-sm'
        }`}
        style={{ 
          backgroundColor: isScrolled ? `${theme.cardBg}F0` : theme.cardBg,
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-semibold text-white shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                S
              </motion.div>
              <div>
                <span className="font-semibold text-lg" style={{ color: theme.textPrimary }}>SuburbMates</span>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>Profile Preview</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center space-x-2 px-3 py-2 rounded-full"
                style={{ backgroundColor: theme.accent }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="w-4 h-4" style={{ color: theme.primary }} />
                <motion.span 
                  className="text-sm font-semibold"
                  style={{ color: theme.primary }}
                  key={viewCount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewCount.toLocaleString()}
                </motion.span>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className="font-medium transition-all duration-200"
                  style={{ color: theme.textSecondary }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                  <motion.div
                    animate={{ rotate: showCustomizer ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </motion.div>
                </Button>
              </motion.div>
              
              <Link href="/">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="font-medium border transition-all duration-200"
                    style={{ 
                      borderColor: theme.border,
                      color: theme.textPrimary
                    }}
                  >
                    Back
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Enhanced Theme Customizer with Apple-style Design */}
        <AnimatePresence>
          {showCustomizer && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-8"
            >
              <Card 
                className="border-0 shadow-2xl overflow-hidden"
                style={{ 
                  backgroundColor: theme.cardBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <CardContent className="p-8">
                  <motion.div 
                    className="flex items-center justify-between mb-6"
                    variants={slideIn}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: theme.accent }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Palette className="w-6 h-6" style={{ color: theme.primary }} />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Theme Customization</h3>
                        <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>Choose your perfect style</p>
                      </div>
                    </div>
                    <motion.div
                      className="flex items-center space-x-2 px-4 py-2 rounded-full"
                      style={{ backgroundColor: theme.accent }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                      <span className="text-sm font-semibold" style={{ color: theme.primary }}>Live Preview</span>
                    </motion.div>
                  </motion.div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {Object.entries(THEMES).map(([key, themeOption], index) => (
                      <motion.button
                        key={key}
                        onClick={() => setCurrentTheme(key)}
                        className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
                          currentTheme === key ? 'scale-105 shadow-2xl' : 'hover:scale-102 shadow-lg'
                        }`}
                        style={{
                          backgroundColor: themeOption.cardBg,
                          borderColor: currentTheme === key ? themeOption.primary : themeOption.border,
                          backdropFilter: 'blur(20px)'
                        }}
                        variants={scaleIn}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Theme Preview */}
                        <div className="relative z-10">
                          <div className="flex items-center space-x-3 mb-4">
                            <motion.div 
                              className="w-8 h-8 rounded-full shadow-lg"
                              style={{ backgroundColor: themeOption.primary }}
                              whileHover={{ scale: 1.2 }}
                              transition={{ duration: 0.2 }}
                            />
                            <motion.div 
                              className="w-6 h-6 rounded-full shadow-md"
                              style={{ backgroundColor: themeOption.secondary }}
                              whileHover={{ scale: 1.2 }}
                              transition={{ duration: 0.2, delay: 0.05 }}
                            />
                          </div>
                          <h4 className="text-lg font-bold mb-2" style={{ color: themeOption.textPrimary }}>
                            {themeOption.name}
                          </h4>
                          <p className="text-sm font-medium" style={{ color: themeOption.textSecondary }}>
                            {key === 'classic' && 'Clean & Professional'}
                            {key === 'bold' && 'Modern & Dynamic'}
                            {key === 'compact' && 'Minimal & Efficient'}
                          </p>
                        </div>
                        
                        {/* Selection Indicator */}
                        <AnimatePresence>
                          {currentTheme === key && (
                            <motion.div
                              className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: themeOption.primary }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Background Gradient */}
                        <div 
                          className="absolute inset-0 opacity-20 rounded-3xl"
                          style={{ background: `linear-gradient(135deg, ${themeOption.primary}20, ${themeOption.secondary}20)` }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Profile Card with Enhanced Apple Styling */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Card 
            className="overflow-hidden border-0 shadow-2xl"
            style={{ 
              backgroundColor: theme.cardBg,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Hero Section with Apple-style Gradients */}
            <motion.div 
              className="relative h-64 overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <motion.div
                  className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20"
                  style={{ backgroundColor: theme.primary }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-20"
                  style={{ backgroundColor: theme.secondary }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <motion.div
                    variants={slideIn}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.4 }}
                  >
                    <Badge 
                      className="text-white border-0 font-semibold shadow-lg"
                      style={{ backgroundColor: theme.secondary }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      ABN Verified
                    </Badge>
                  </motion.div>
                  
                  <motion.div 
                    className="flex space-x-3"
                    variants={slideIn}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="backdrop-blur-md border font-semibold shadow-lg"
                        style={{ 
                          borderColor: theme.border,
                          backgroundColor: `${theme.cardBg}CC`,
                          color: theme.textPrimary
                        }}
                        onClick={() => setIsSaved(!isSaved)}
                      >
                        <motion.div
                          animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        </motion.div>
                        {isSaved ? 'Saved' : 'Save'}
                      </Button>
                    </motion.div>
                    
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                      <DialogTrigger asChild>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="backdrop-blur-md border font-semibold shadow-lg"
                            style={{ 
                              borderColor: theme.border,
                              backgroundColor: `${theme.cardBg}CC`,
                              color: theme.textPrimary
                            }}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent 
                        className="backdrop-blur-xl border-0 shadow-2xl"
                        style={{ 
                          backgroundColor: `${theme.cardBg}F0`,
                          backdropFilter: 'blur(20px)'
                        }}
                      >
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold" style={{ color: theme.textPrimary }}>Share this business</DialogTitle>
                        </DialogHeader>
                        <motion.div 
                          className="grid grid-cols-2 gap-4 mt-6"
                          variants={{
                            animate: {
                              transition: {
                                staggerChildren: 0.1
                              }
                            }
                          }}
                          initial="initial"
                          animate="animate"
                        >
                          {[
                            { platform: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600' },
                            { platform: 'facebook', icon: Facebook, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
                            { platform: 'twitter', icon: Twitter, label: 'X (Twitter)', color: 'bg-black hover:bg-gray-800' },
                            { platform: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800' },
                            { platform: 'email', icon: Mail, label: 'Email', color: 'border', style: { borderColor: theme.border, color: theme.textPrimary } },
                            { platform: 'copy', icon: Copy, label: 'Copy Link', color: 'border', style: { borderColor: theme.border, color: theme.textPrimary } }
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <motion.div
                                key={item.platform}
                                variants={scaleIn}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button 
                                  onClick={() => handleShare(item.platform)} 
                                  className={`w-full font-semibold ${item.color === 'border' ? 'border' : `${item.color} text-white`}`}
                                  style={item.style}
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  {item.label}
                                </Button>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                </div>
                
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.6 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                    {businessData.name}
                  </h1>
                  <p className="text-lg font-medium mb-4" style={{ color: theme.textSecondary }}>
                    {businessData.tagline}
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" style={{ color: theme.textSecondary }} />
                      <span className="font-medium" style={{ color: theme.textSecondary }}>{businessData.suburb}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </motion.div>
                        ))}
                      </div>
                      <span className="font-bold text-lg" style={{ color: theme.textPrimary }}>{businessData.rating}</span>
                      <span className="font-medium" style={{ color: theme.textSecondary }}>({businessData.reviewCount})</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <CardContent className="p-8">
              {/* Owner Info with Enhanced Animation */}
              <motion.div
                className="flex items-center space-x-6 mb-8 -mt-16 relative z-10"
                variants={slideIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.7 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Avatar className="w-20 h-20 border-4 border-white shadow-2xl">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback 
                      className="text-white font-bold text-xl"
                      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                    >
                      MT
                    </AvatarFallback>
                  </Avatar>
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                    style={{ backgroundColor: theme.secondary }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{businessData.owner}</h2>
                    <Badge 
                      className="text-white border-0 font-semibold"
                      style={{ backgroundColor: theme.secondary }}
                    >
                      Owner
                    </Badge>
                  </div>
                  <p className="text-lg font-medium" style={{ color: theme.textSecondary }}>{businessData.category}</p>
                </div>
              </motion.div>

              {/* Primary CTA Row with Apple-style Buttons */}
              <motion.div
                className="grid grid-cols-4 gap-4 mb-8"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="initial"
                animate="animate"
              >
                {[
                  { icon: Phone, label: 'Call', primary: true },
                  { icon: MessageCircle, label: 'Message' },
                  { icon: Navigation, label: 'Directions' },
                  { icon: Bookmark, label: 'Save', action: () => setIsSaved(!isSaved), active: isSaved }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      variants={scaleIn}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        className={`w-full h-14 font-semibold text-base shadow-lg ${
                          item.primary ? 'text-white' : 'border'
                        }`}
                        style={item.primary ? 
                          { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` } :
                          { borderColor: theme.border, color: theme.textPrimary }
                        }
                        onClick={item.action}
                      >
                        <Icon className={`w-5 h-5 mr-2 ${item.active ? 'fill-current' : ''}`} />
                        {item.label}
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Rest of the content with enhanced animations */}
              <motion.div
                className="space-y-8"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
                initial="initial"
                animate="animate"
              >
                {/* Highlights Strip */}
                <motion.div variants={fadeInUp}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.textPrimary }}>Known For</h3>
                  <div className="flex flex-wrap gap-3">
                    {businessData.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1, type: "spring", stiffness: 500, damping: 30 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        <Badge 
                          className="px-4 py-2 text-sm font-semibold border shadow-sm"
                          style={{ 
                            backgroundColor: theme.accent,
                            color: theme.primary,
                            borderColor: `${theme.primary}30`
                          }}
                        >
                          {highlight}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* About Section */}
                <motion.div variants={fadeInUp}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.textPrimary }}>About</h3>
                  <p className="text-lg leading-relaxed font-medium" style={{ color: theme.textSecondary }}>
                    With over 15 years of excellence serving Melbourne's eastern suburbs, 
                    we're your trusted plumbing partners. Our licensed team combines 
                    cutting-edge technology with reliable craftsmanship to deliver 
                    exceptional results every time.
                  </p>
                </motion.div>

                {/* Services Grid */}
                <motion.div variants={fadeInUp}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.textPrimary }}>Services</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {businessData.services.map((service, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center space-x-3 p-4 rounded-2xl border shadow-sm"
                        style={{ 
                          backgroundColor: theme.accent,
                          borderColor: theme.border
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <CheckCircle className="w-5 h-5" style={{ color: theme.secondary }} />
                        <span className="font-medium" style={{ color: theme.textPrimary }}>{service}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Contact Info */}
                <motion.div variants={fadeInUp}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.textPrimary }}>Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: Phone, text: businessData.phone },
                      { icon: Mail, text: businessData.email },
                      { icon: Globe, text: businessData.website },
                      { icon: Clock, text: 'Mon-Fri: 7AM-6PM, Sat: 8AM-4PM' }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div 
                          key={index}
                          className="flex items-center space-x-4 p-4 rounded-2xl"
                          style={{ backgroundColor: theme.accent }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <Icon className="w-5 h-5" style={{ color: theme.textSecondary }} />
                          <span className="font-medium" style={{ color: theme.textPrimary }}>{item.text}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Reviews Section */}
                <motion.div variants={fadeInUp}>
                  <h3 className="text-xl font-bold mb-6" style={{ color: theme.textPrimary }}>Recent Reviews</h3>
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <motion.div 
                        key={index}
                        className="p-6 rounded-3xl border shadow-sm"
                        style={{ 
                          backgroundColor: theme.accent,
                          borderColor: theme.border
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2 + index * 0.2 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12 shadow-lg">
                            <AvatarFallback 
                              className="text-white font-bold"
                              style={{ backgroundColor: theme.secondary }}
                            >
                              {review.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <span className="font-bold" style={{ color: theme.textPrimary }}>{review.name}</span>
                                {review.verified && (
                                  <Badge 
                                    className="text-xs text-white border-0 font-semibold"
                                    style={{ backgroundColor: theme.secondary }}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>• {review.suburb}</span>
                              </div>
                              <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>{review.date}</span>
                            </div>
                            <div className="flex items-center space-x-1 mb-3">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="leading-relaxed font-medium" style={{ color: theme.textSecondary }}>{review.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section with Apple-style Polish */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12"
        >
          <Card 
            className="text-center border-0 shadow-2xl overflow-hidden"
            style={{ 
              backgroundColor: theme.cardBg,
              backdropFilter: 'blur(20px)'
            }}
          >
            <CardContent className="p-12 relative">
              {/* Background Animation */}
              <div className="absolute inset-0">
                <motion.div
                  className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-10"
                  style={{ backgroundColor: theme.primary }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-10"
                  style={{ backgroundColor: theme.secondary }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="relative z-10">
                <motion.h3 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: theme.textPrimary }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 }}
                >
                  Ready to Create Your Profile?
                </motion.h3>
                <motion.p 
                  className="text-xl font-medium mb-8"
                  style={{ color: theme.textSecondary }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.7 }}
                >
                  Join 500+ Melbourne businesses growing with SuburbMates
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.9 }}
                >
                  <Link href="/signup" className="flex-1">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }} 
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        size="lg" 
                        className="w-full text-white font-bold text-lg py-6 shadow-2xl"
                        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                      >
                        Create Profile
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/" className="flex-1">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }} 
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="w-full font-bold text-lg py-6 border-2 shadow-lg"
                        style={{ 
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      >
                        Learn More
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
                
                {/* Footer watermark */}
                <motion.div 
                  className="mt-12 pt-6 border-t"
                  style={{ borderColor: theme.border }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.2 }}
                >
                  <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                    Powered by <span className="font-bold" style={{ color: theme.primary }}>SuburbMates</span>
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}