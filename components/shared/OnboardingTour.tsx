"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { glass } from '@/lib/design-system';
import { useStandardAnimations } from '@/lib/design-system';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Lightbulb,
  Target,
  Users,
  Settings,
  BarChart3,
  HelpCircle
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  target?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SuburbMates! 🎉',
    description: 'Let\'s get your business profile set up and ready to attract Melbourne customers. This quick tour will show you the key features.',
    icon: Target,
    position: 'center'
  },
  {
    id: 'profile-completion',
    title: 'Complete Your Profile',
    description: 'A complete profile gets 3x more leads! Add your business details, photos, and services to stand out.',
    icon: Settings,
    target: '[data-onboarding="profile-section"]',
    position: 'right',
    action: {
      text: 'Complete Profile',
      href: '/dashboard/profile'
    }
  },
  {
    id: 'verification',
    title: 'Get Verified',
    description: 'Verify your ABN to build trust with customers. Verified businesses get a trust badge and higher visibility.',
    icon: CheckCircle,
    target: '[data-onboarding="verification-section"]',
    position: 'left',
    action: {
      text: 'Verify ABN'
    }
  },
  {
    id: 'content',
    title: 'Share Your Story',
    description: 'Post updates, showcase your work, and engage with the Melbourne community to attract more customers.',
    icon: Users,
    target: '[data-onboarding="content-section"]',
    position: 'top',
    action: {
      text: 'Create First Post',
      href: '/dashboard/content'
    }
  },
  {
    id: 'leads',
    title: 'Track Your Leads',
    description: 'Monitor inquiries from potential customers and track your business growth with our analytics.',
    icon: BarChart3,
    target: '[data-onboarding="leads-section"]',
    position: 'bottom',
    action: {
      text: 'View Leads',
      href: '/dashboard/leads'
    }
  },
  {
    id: 'help',
    title: 'Get Support',
    description: 'Need help? Our support team and help centre are always available to assist you.',
    icon: HelpCircle,
    position: 'center',
    action: {
      text: 'Visit Help Centre',
      href: '/help'
    }
  }
];

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ isVisible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { fadeInUp } = useStandardAnimations();
  
  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleAction = () => {
    if (currentStepData.action?.href) {
      window.open(currentStepData.action.href, '_blank');
    }
    if (currentStepData.action?.onClick) {
      currentStepData.action.onClick();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 bg-black/50 ${glass.overlay}`}>
        {/* Highlight Target Element */}
        {currentStepData.target && (
          <div 
            className="absolute border-4 border-primary rounded-lg shadow-lg pointer-events-none"
            style={{
              // This would be calculated based on the target element's position
              // For demo purposes, we'll use placeholder positioning
            }}
          />
        )}
        
        {/* Tour Card */}
        <div className="fixed inset-0 flex items-centre justify-centre p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: isAnimating ? 0.5 : 1, 
              scale: isAnimating ? 0.95 : 1,
              y: isAnimating ? 10 : 0
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="shadow-2xl border-2 border-primary/20">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-centre gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-centre justify-centre">
                    <currentStepData.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary" className="text-xs mb-2">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </Badge>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-900">
                  {currentStepData.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {currentStepData.description}
                </p>
                
                {/* Action Button */}
                {currentStepData.action && (
                  <div className="mb-6">
                    <Button 
                      onClick={handleAction}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {currentStepData.action.text}
                    </Button>
                  </div>
                )}
                
                {/* Navigation */}
                <div className="flex items-centre justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-centre gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {onboardingSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep 
                            ? 'bg-primary' 
                            : index < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    onClick={nextStep}
                    className="flex items-centre gap-2 bg-primary hover:bg-primary/90"
                  >
                    {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep === onboardingSteps.length - 1 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* Skip Option */}
                <div className="text-centre mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onSkip}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

// Tooltip component for individual feature highlights
interface TooltipProps {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss: () => void;
}

export function FeatureTooltip({ target, title, description, position = 'top', onDismiss }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed z-40 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-lg border-2 border-primary/20 p-4 max-w-xs pointer-events-auto"
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="h-6 w-6 p-0 -mt-1 -mr-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
        
        {/* Arrow pointer */}
        <div className={`absolute w-3 h-3 bg-white border-primary/20 transform rotate-45 ${
          position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r' :
          position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l' :
          position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2 border-t border-r' :
          'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l'
        }`} />
      </motion.div>
    </div>
  );
}