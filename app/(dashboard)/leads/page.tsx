"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  MessageCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Lead } from "@prisma/client";

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  QUALIFIED: "bg-purple-100 text-purple-800",
  CONVERTED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800"
};

const sourceIcons = {
  PROFILE: MessageSquare,
  SEARCH: Search,
  FEED: TrendingUp,
  SHARE: Users
};

export default function LeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/leads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data: LeadsResponse = await response.json();
      setLeads(data.leads);
    } catch (err) {
      console.error('Fetch leads error:', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const filterLeads = useCallback(() => {
    let filtered = leads;

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  }, [leads, statusFilter, searchQuery]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, fetchLeads]);

  useEffect(() => {
    filterLeads();
  }, [filterLeads]);

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      setUpdating(leadId);
      
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lead');
      }
      
      const updatedLead = await response.json();
      
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        )
      );
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(updatedLead);
      }
      
      toast({
        title: "Lead Updated",
        description: `Lead status changed to ${newStatus.toLowerCase()}.`,
      });
    } catch (err) {
      console.error('Update lead error:', err);
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      setUpdating(leadId);
      
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
      
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
      
      toast({
        title: "Lead Deleted",
        description: "The lead has been removed from your list.",
      });
    } catch (err) {
      console.error('Delete lead error:', err);
      toast({
        title: "Error",
        description: "Failed to delete lead.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'NEW').length,
      contacted: leads.filter(l => l.status === 'CONTACTED').length,
      qualified: leads.filter(l => l.status === 'QUALIFIED').length,
      converted: leads.filter(l => l.status === 'CONVERTED').length,
    };
    return stats;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  const stats = getStatusStats();

  const LeadCard = ({ lead }: { lead: Lead }) => {
    const SourceIcon = sourceIcons[lead.source];
    const isUpdating = updating === lead.id;
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" 
            onClick={() => setSelectedLead(lead)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{lead.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-3 w-3" />
                {lead.email}
                {lead.phone && (
                  <>
                    <span>•</span>
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[lead.status]}>
                {lead.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'CONTACTED')}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mark as Contacted
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteLead(lead.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-3 line-clamp-2">{lead.message}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <SourceIcon className="h-4 w-4" />
              <span>From {lead.source.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(lead.createdAt.toString())}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
        <p className="text-gray-600">Track and manage customer inquiries</p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-purple-600">{stats.qualified}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Leads List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leads Grid */}
          <div className="space-y-4">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No leads found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery || statusFilter 
                      ? "Try adjusting your filters" 
                      : "New leads will appear here when customers contact you"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Lead Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedLead ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
                <CardDescription>
                  Manage this customer inquiry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedLead.name}</h3>
                  <p className="text-sm text-gray-600">{selectedLead.email}</p>
                  {selectedLead.phone && (
                    <p className="text-sm text-gray-600">{selectedLead.phone}</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                  <p className="text-sm text-gray-600">{selectedLead.message}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <Select 
                    value={selectedLead.status} 
                    onValueChange={(value) => updateLeadStatus(selectedLead.id, value as Lead['status'])}
                    disabled={updating === selectedLead.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="QUALIFIED">Qualified</SelectItem>
                      <SelectItem value="CONVERTED">Converted</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <a href={`mailto:${selectedLead.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                  {selectedLead.phone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${selectedLead.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Customer
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => deleteLead(selectedLead.id)}
                    disabled={updating === selectedLead.id}
                  >
                    {updating === selectedLead.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Lead
                  </Button>
                </div>
                
                <Separator />
                
                <div className="text-xs text-gray-500">
                  <p>Source: {selectedLead.source}</p>
                  <p>Created: {formatDate(selectedLead.createdAt.toString())}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Lead
                </h3>
                <p className="text-gray-600">
                  Click on a lead to view details and manage the inquiry
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}