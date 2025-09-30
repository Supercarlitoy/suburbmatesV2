'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building,
  Users,
  FileCheck,
  MessageSquare,
  BarChart3,
  Settings,
  Bot,
  CheckCircle,
  AlertTriangle,
  Terminal,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and metrics',
  },
  {
    name: 'Businesses',
    href: '/admin/businesses',
    icon: Building,
    description: 'Manage business listings',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management',
  },
  {
    name: 'Claims',
    href: '/admin/claims',
    icon: FileCheck,
    description: 'Ownership verification',
    badge: 'pending',
  },
  {
    name: 'Inquiries',
    href: '/admin/inquiries',
    icon: MessageSquare,
    description: 'Customer inquiries',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics',
  },
  {
    name: 'CLI Operations',
    href: '/admin/cli',
    icon: Terminal,
    description: 'Command-line tools via web',
  },
  {
    name: 'AI Automation',
    href: '/admin/ai',
    icon: Bot,
    description: 'AI tools and settings',
    badge: 'new',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System settings',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SM</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">SuburbMates</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
                        item.badge === 'pending' && 'bg-yellow-100 text-yellow-800',
                        item.badge === 'new' && 'bg-green-100 text-green-800'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* AI Status Indicator */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">AI Automation</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            3 automation rules active
          </p>
          <div className="flex items-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Processing claims</span>
          </div>
        </div>
      </div>
    </div>
  );
}