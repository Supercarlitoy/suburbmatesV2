"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Users, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Business, Lead } from "@prisma/client";

interface DashboardStats {
  business: Business | null;
  leadsCount: number;
  recentLeads: Lead[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const business = stats?.business;
  const hasProfile = !!business;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user.email}!
        </p>
      </div>

      {!hasProfile ? (
        // No business profile - show setup card
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Set Up Your Business Profile
            </CardTitle>
            <CardDescription>
              Create your business profile to start connecting with Melbourne customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Add your business information
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Verify your ABN (optional)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Start receiving leads
              </div>
              <Link href="/dashboard/profile">
                <Button className="w-full mt-4">
                  Create Business Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Has business profile - show stats
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={business.approvalStatus === 'APPROVED' ? 'default' : 'secondary'}
                  >
                    {business.approvalStatus}
                  </Badge>
                  {business.approvalStatus === 'APPROVED' && (
                    <span className="text-sm text-green-600">✓ Live</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {business.name}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.leadsCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time inquiries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.recentLeads?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  New leads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Leads
              </CardTitle>
              <CardDescription>
                Latest inquiries from potential customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentLeads && stats.recentLeads.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{lead.name}</h4>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                          {lead.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={lead.status === 'NEW' ? 'default' : 'secondary'}>
                        {lead.status}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/dashboard/leads">
                    <Button variant="outline" className="w-full">
                      View All Leads
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No leads yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share your profile to start receiving inquiries
                  </p>
                  <Link href={`/business/${business.slug}`}>
                    <Button variant="outline">
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Link href="/dashboard/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Manage Profile</h3>
              <p className="text-sm text-gray-600 mt-1">
                Edit business details
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leads">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">View Leads</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage inquiries
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/content">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Content</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage posts
              </p>
            </CardContent>
          </Card>
        </Link>

        {hasProfile && (
          <Link href={`/business/${business.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-medium">Public Profile</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View as customer
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}