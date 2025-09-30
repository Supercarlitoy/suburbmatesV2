"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SuburbMatesLogo } from '@/components/ui/SuburbMatesLogo';
import { glass } from '@/lib/design-system';

interface MainLayoutProps {
  children: ReactNode;
  showCTA?: boolean;
}

export default function MainLayout({ children, showCTA = true }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Find Businesses', href: '/search' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Help', href: '/help' },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className={`min-h-screen ${glass.heroBg}`}>
      {/* Navigation */}
      <nav className={`border-b ${glass.navBar} sticky top-0 z-50`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <SuburbMatesLogo variant="NavigationLogo" size="sm" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              {showCTA && (
                <Link href="/signup">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className={`md:hidden border-t ${glass.navBar}`}>
              <div className="px-4 py-4 space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? 'text-primary'
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-3 border-t space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  {showCTA && (
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/">
                <SuburbMatesLogo variant="NavigationLogo" size="sm" />
              </Link>
              <p className="text-gray-600 text-sm">
                Connecting Melbourne's business community through verified profiles and local focus.
              </p>
            </div>

            {/* Platform Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Platform</h3>
              <div className="space-y-2">
                <Link href="/search" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  Find Businesses
                </Link>
                <Link href="/register-business" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  List Your Business
                </Link>
                <Link href="/claim" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  Claim Business
                </Link>
                <Link href="/pricing" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Company</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  Contact
                </Link>
                <Link href="/help" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  Help Center
                </Link>
                <Link href="/status" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  System Status
                </Link>
              </div>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Legal</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="block text-gray-600 hover:text-primary text-sm transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 SuburbMates. All rights reserved. Made with ❤️ in Melbourne.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}