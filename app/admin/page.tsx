import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Building, 
  FileCheck, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bot,
  ArrowRight,
  Activity,
  Calendar,
  Eye,
  Copy
} from 'lucide-react';

// Disable prerendering for admin pages
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  // Mock data - in production, fetch from your database
  const stats = {
    totalUsers: 2847,
    totalBusinesses: 1523,
    pendingClaims: 23,
    newInquiries: 156,
    monthlyGrowth: {
      users: 12.3,
      businesses: 8.7,
      claims: -15.2, // Negative due to faster processing
      inquiries: 23.1,
    },
    aiAutomation: {
      active: true,
      claimsProcessed: 89,
      accuracyRate: 94.2,
      timeSaved: '47 hours',
    },
  };

  const recentActivity = [
    {
      id: 1,
      type: 'ai_approval',
      message: 'AI auto-approved claim for "Melbourne Plumbing Co"',
      time: '2 minutes ago',
      icon: Bot,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'new_business',
      message: 'New business registered: "Garden Design Studios"',
      time: '15 minutes ago',
      icon: Building,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'high_priority_lead',
      message: 'High-priority lead identified for "Tech Solutions Ltd"',
      time: '23 minutes ago',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      id: 4,
      type: 'claim_submitted',
      message: 'New ownership claim submitted for review',
      time: '1 hour ago',
      icon: FileCheck,
      color: 'text-purple-600',
    },
    {
      id: 5,
      type: 'spam_filtered',
      message: 'AI filtered 12 spam inquiries automatically',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  const quickActions = [
    {
      title: 'Review Claims',
      description: '23 claims awaiting review',
      href: '/admin/claims',
      icon: FileCheck,
      color: 'bg-yellow-500',
      urgent: true,
    },
    {
      title: 'Manage Businesses',
      description: '1,523 total businesses',
      href: '/admin/businesses',
      icon: Building,
      color: 'bg-blue-500',
    },
    {
      title: 'View Inquiries',
      description: '156 new inquiries',
      href: '/admin/inquiries',
      icon: MessageSquare,
      color: 'bg-green-500',
    },
    {
      title: 'AI Settings',
      description: 'Configure automation',
      href: '/admin/ai',
      icon: Bot,
      color: 'bg-purple-500',
    },
    {
      title: 'Manage Duplicates',
      description: 'Review potential duplicates',
      href: '/admin/duplicates',
      icon: Copy,
      color: 'bg-orange-500',
    },
  ];

  const topBusinesses = [
    {
      id: 1,
      name: 'Melbourne Coffee Co',
      suburb: 'South Yarra',
      views: 2341,
      leads: 45,
      isVerified: true,
    },
    {
      id: 2,
      name: 'Garden Design Studios',
      suburb: 'Toorak',
      views: 1876,
      leads: 38,
      isVerified: true,
    },
    {
      id: 3,
      name: 'Tech Solutions Ltd',
      suburb: 'Richmond',
      views: 1654,
      leads: 29,
      isVerified: false,
    },
    {
      id: 4,
      name: 'Home Renovation Pro',
      suburb: 'Hawthorn',
      views: 1432,
      leads: 31,
      isVerified: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with SuburbMates today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* AI Status Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-green-900">AI Automation Active</h3>
              <p className="text-sm text-green-700">
                Processed {stats.aiAutomation.claimsProcessed} claims with {stats.aiAutomation.accuracyRate}% accuracy • Saved {stats.aiAutomation.timeSaved} this month
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/ai">
              <Bot className="h-4 w-4 mr-1" />
              Manage AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.monthlyGrowth.users}%
              </span>
              <span className="text-sm text-gray-500 ml-2">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.monthlyGrowth.businesses}%
              </span>
              <span className="text-sm text-gray-500 ml-2">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-yellow-600" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingClaims}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {Math.abs(stats.monthlyGrowth.claims)}% faster processing
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">New Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newInquiries}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.monthlyGrowth.inquiries}%
              </span>
              <span className="text-sm text-gray-500 ml-2">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${action.color} text-white mr-4`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      {action.urgent && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full bg-gray-100 ${activity.color}`}>
                    <activity.icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" size="sm">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Businesses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Performing Businesses
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/businesses">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topBusinesses.map((business, index) => (
              <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{business.name}</h3>
                      {business.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{business.suburb}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{business.views.toLocaleString()}</p>
                    <p className="text-gray-500 flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      Views
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{business.leads}</p>
                    <p className="text-gray-500 flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Leads
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}