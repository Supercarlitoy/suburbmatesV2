'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [notifications] = useState([
    {
      id: '1',
      type: 'claim',
      message: 'New business claim requires review',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: '2',
      type: 'ai',
      message: 'AI verification completed 5 claims',
      time: '10 minutes ago',
      unread: true,
    },
    {
      id: '3',
      type: 'system',
      message: 'Daily backup completed successfully',
      time: '1 hour ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSignOut = async () => {
    // You can implement sign out logic here
    window.location.href = '/auth/signout';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Search */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search businesses, users, or claims..."
              className="pl-10 w-80"
            />
          </div>
          
          {/* Refresh Button */}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center space-x-4">
          {/* AI Status */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">AI Active</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 px-1 min-w-0 h-5 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary">{unreadCount} new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className={`flex flex-col items-start p-3 cursor-pointer ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-sm ${notification.unread ? 'font-medium' : ''}`}>
                        {notification.message}
                      </span>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-purple-600 hover:text-purple-700">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Admin Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}