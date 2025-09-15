"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  checkIntervalSeconds: number;
  maxDevices: number;
}

interface DeviceInfo {
  id: string;
  userAgent: string;
  ipAddress?: string;
  lastActivity: Date;
  location?: string;
}

interface SessionSecurityState {
  isActive: boolean;
  timeRemaining: number;
  showWarning: boolean;
  devices: DeviceInfo[];
  suspiciousActivity: boolean;
}

const DEFAULT_CONFIG: SessionConfig = {
  timeoutMinutes: 30,
  warningMinutes: 5,
  checkIntervalSeconds: 60,
  maxDevices: 3
};

export function useSessionSecurity(config: Partial<SessionConfig> = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const router = useRouter();
  
  const [sessionState, setSessionState] = useState<SessionSecurityState>({
    isActive: true,
    timeRemaining: fullConfig.timeoutMinutes * 60,
    showWarning: false,
    devices: [],
    suspiciousActivity: false
  });
  
  const lastActivityRef = useRef<Date>(new Date());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Activity tracking events
  const activityEvents = [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];
  
  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    
    // Reset session if it was inactive
    if (!sessionState.isActive) {
      setSessionState(prev => ({
        ...prev,
        isActive: true,
        timeRemaining: fullConfig.timeoutMinutes * 60,
        showWarning: false
      }));
    }
    
    // Store activity in localStorage for cross-tab sync
    localStorage.setItem('lastActivity', lastActivityRef.current.toISOString());
    
    // Send activity to server for device tracking
    trackDeviceActivity();
  }, [sessionState.isActive, fullConfig.timeoutMinutes]);
  
  // Track device activity
  const trackDeviceActivity = useCallback(async () => {
    try {
      const deviceId = getDeviceId();
      const deviceInfo = {
        id: deviceId,
        userAgent: navigator.userAgent,
        lastActivity: new Date(),
        location: await getLocationInfo()
      };
      
      // In production, send to your API
      // await fetch('/api/auth/track-device', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(deviceInfo)
      // });
      
      // For demo, store in localStorage
      const devices = JSON.parse(localStorage.getItem('userDevices') || '[]');
      const existingIndex = devices.findIndex((d: DeviceInfo) => d.id === deviceId);
      
      if (existingIndex >= 0) {
        devices[existingIndex] = deviceInfo;
      } else {
        devices.push(deviceInfo);
        
        // Check for suspicious activity (too many devices)
        if (devices.length > fullConfig.maxDevices) {
          setSessionState(prev => ({ ...prev, suspiciousActivity: true }));
          
          toast({
            title: "Security Alert",
            description: `Your account is active on ${devices.length} devices. If this wasn't you, please secure your account.`,
            variant: "destructive"
          });
        }
      }
      
      localStorage.setItem('userDevices', JSON.stringify(devices));
      setSessionState(prev => ({ ...prev, devices }));
      
    } catch (error) {
      console.error('Device tracking error:', error);
    }
  }, [fullConfig.maxDevices]);
  
  // Get or generate device ID
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }, []);
  
  // Get location info (simplified)
  const getLocationInfo = useCallback(async (): Promise<string> => {
    try {
      // In production, use a proper geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.region}, ${data.country_name}`;
    } catch {
      return 'Unknown Location';
    }
  }, []);
  
  // Check session timeout
  const checkTimeout = useCallback(() => {
    const now = new Date();
    const timeSinceActivity = (now.getTime() - lastActivityRef.current.getTime()) / 1000;
    const timeRemaining = Math.max(0, (fullConfig.timeoutMinutes * 60) - timeSinceActivity);
    
    setSessionState(prev => ({ ...prev, timeRemaining }));
    
    // Show warning
    if (timeRemaining <= fullConfig.warningMinutes * 60 && timeRemaining > 0) {
      if (!sessionState.showWarning) {
        setSessionState(prev => ({ ...prev, showWarning: true }));
        
        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${Math.ceil(timeRemaining / 60)} minutes due to inactivity. Click to stay active.`
        });
        
        // Auto-update activity to prevent expiration
        updateActivity();
      }
    }
    
    // Session expired
    if (timeRemaining <= 0) {
      handleSessionExpiry();
    }
  }, [fullConfig.timeoutMinutes, fullConfig.warningMinutes, sessionState.showWarning, updateActivity]);
  
  // Handle session expiry
  const handleSessionExpiry = useCallback(async () => {
    setSessionState(prev => ({
      ...prev,
      isActive: false,
      showWarning: false,
      timeRemaining: 0
    }));
    
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    
    // Clear sensitive data
    localStorage.removeItem('lastActivity');
    
    // Sign out user
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Signout error:', error);
    }
    
    toast({
      title: "Session Expired",
      description: "You've been signed out due to inactivity for security reasons.",
      variant: "destructive"
    });
    
    // Redirect to login
    router.push('/login?reason=timeout');
  }, [router]);
  
  // Extend session
  const extendSession = useCallback(() => {
    updateActivity();
    setSessionState(prev => ({
      ...prev,
      timeRemaining: fullConfig.timeoutMinutes * 60,
      showWarning: false
    }));
    
    toast({
      title: "Session Extended",
      description: "Your session has been extended for another 30 minutes."
    });
  }, [updateActivity, fullConfig.timeoutMinutes]);
  
  // Manual logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      
      // Clear device tracking
      localStorage.removeItem('userDevices');
      localStorage.removeItem('deviceId');
      localStorage.removeItem('lastActivity');
      
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out."
      });
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive"
      });
    }
  }, [router]);
  
  // Detect suspicious activity
  const checkSuspiciousActivity = useCallback(() => {
    const devices = JSON.parse(localStorage.getItem('userDevices') || '[]');
    
    // Check for multiple simultaneous logins
    const recentDevices = devices.filter((device: DeviceInfo) => {
      const deviceTime = new Date(device.lastActivity);
      const timeDiff = (new Date().getTime() - deviceTime.getTime()) / 1000 / 60; // minutes
      return timeDiff < 5; // Active within last 5 minutes
    });
    
    if (recentDevices.length > 2) {
      setSessionState(prev => ({ ...prev, suspiciousActivity: true }));
      
      toast({
        title: "Suspicious Activity Detected",
        description: "Multiple devices are accessing your account simultaneously. Please verify this is you.",
        variant: "destructive"
      });
    }
  }, [router]);
  
  // Initialize session security
  useEffect(() => {
    // Set up activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Set up periodic checks
    checkIntervalRef.current = setInterval(() => {
      checkTimeout();
      checkSuspiciousActivity();
    }, fullConfig.checkIntervalSeconds * 1000);
    
    // Initial device tracking
    trackDeviceActivity();
    
    // Check for existing activity from other tabs
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      lastActivityRef.current = new Date(lastActivity);
    }
    
    return () => {
      // Cleanup
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [updateActivity, checkTimeout, checkSuspiciousActivity, trackDeviceActivity, fullConfig.checkIntervalSeconds]);
  
  return {
    sessionState,
    extendSession,
    logout,
    updateActivity,
    timeRemaining: Math.ceil(sessionState.timeRemaining / 60), // in minutes
    isWarning: sessionState.showWarning,
    isActive: sessionState.isActive,
    devices: sessionState.devices,
    hasSuspiciousActivity: sessionState.suspiciousActivity
  };
}

// Session warning component is available in @/components/auth/SessionWarning