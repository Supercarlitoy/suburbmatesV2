"use client";

import React, { useState } from 'react';
import CLIOperationsDashboard from '@/components/admin/CLIOperationsDashboard';
import AdvancedJobDashboard from '@/components/admin/cli/AdvancedJobDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Terminal } from 'lucide-react';

// Disable prerendering for admin pages with real-time data
export const dynamic = 'force-dynamic';

export default function AdminCLIPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              CLI Operations Management
            </h1>
            <p className="mt-2 text-gray-600">
              Advanced monitoring and management of directory CLI operations with real-time insights.
            </p>
          </div>
          
          {/* Main Interface Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Advanced Dashboard
              </TabsTrigger>
              <TabsTrigger value="operations" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Quick Operations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <AdvancedJobDashboard />
            </TabsContent>
            
            <TabsContent value="operations" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Quick Operations
                </h2>
                <p className="mt-2 text-gray-600">
                  Submit new CLI jobs and perform administrative tasks.
                </p>
              </div>
              <CLIOperationsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
