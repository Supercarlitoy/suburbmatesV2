"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, MapPin, Phone, Globe, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MELBOURNE_SUBURBS } from "@/lib/melbourne-suburbs";
import { BUSINESS_CATEGORIES } from "@/lib/business-categories";

interface BusinessProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  suburb: string;
  postcode: string;
  category: string;
  serviceAreas: string[];
  abn?: string;
  status: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<BusinessProfile>({
    name: "",
    email: "",
    phone: "",
    website: "",
    bio: "",
    suburb: "",
    postcode: "",
    category: "",
    serviceAreas: [],
    abn: "",
    status: "PENDING"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      loadProfile();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/business/profile');
      
      if (response.ok) {
        const business = await response.json();
        if (business) {
          setProfile({
            id: business.id,
            name: business.name || "",
            email: business.email || "",
            phone: business.phone || "",
            website: business.website || "",
            bio: business.bio || "",
            suburb: business.suburb || "",
            postcode: business.postcode || "",
            category: business.category || "",
            serviceAreas: business.serviceAreas ? JSON.parse(business.serviceAreas) : [],
            abn: business.abn || "",
            status: business.status || "PENDING"
          });
        }
      } else if (response.status !== 404) {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const businessData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        bio: profile.bio,
        suburb: profile.suburb,
        postcode: profile.postcode,
        category: profile.category,
        serviceAreas: JSON.stringify(profile.serviceAreas),
        abn: profile.abn,
      };

      const response = await fetch('/api/business/profile', {
        method: profile.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      
      toast({
        title: "Success!",
        description: profile.id ? "Profile updated successfully" : "Profile created successfully",
      });

      // Update the profile state with the returned data
      setProfile(prev => ({
        ...prev,
        id: result.id,
        status: result.status
      }));
      
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save profile');
      toast({
        title: "Error",
        description: err.message || 'Failed to save profile',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleServiceAreaToggle = (suburb: string) => {
    setProfile(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(suburb)
        ? prev.serviceAreas.filter(s => s !== suburb)
        : [...prev.serviceAreas, suburb]
    }));
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Business Profile
        </h1>
        <p className="text-gray-600 mt-2">
          {profile.id ? 'Update your business information' : 'Create your business profile to start connecting with customers'}
        </p>
        {profile.status && (
          <div className="mt-4">
            <Badge 
              variant={profile.status === 'APPROVED' ? 'default' : 'secondary'}
              className="text-sm"
            >
              Status: {profile.status}
            </Badge>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Business Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={profile.category}
                  onValueChange={(value: string) => setProfile(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((category) => (
                       <SelectItem key={category.id} value={category.name}>
                         {category.name}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Business Description</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Describe your business, services, and what makes you unique..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How customers can reach you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="business@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0412 345 678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                value={profile.website}
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Service Areas
            </CardTitle>
            <CardDescription>
              Where you're located and which areas you serve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suburb">Primary Suburb *</Label>
                <Select
                  value={profile.suburb}
                  onValueChange={(value: string) => setProfile(prev => ({ ...prev, suburb: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select suburb" />
                  </SelectTrigger>
                  <SelectContent>
                    {MELBOURNE_SUBURBS.map((suburb: string) => (
                      <SelectItem key={suburb} value={suburb}>
                        {suburb}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={profile.postcode}
                  onChange={(e) => setProfile(prev => ({ ...prev, postcode: e.target.value }))}
                  placeholder="3000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service Areas</Label>
              <p className="text-sm text-gray-600 mb-3">
                Select the Melbourne suburbs where you provide services
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                 {MELBOURNE_SUBURBS.map((suburb: string) => (
                  <label key={suburb} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.serviceAreas.includes(suburb)}
                      onChange={() => handleServiceAreaToggle(suburb)}
                      className="rounded"
                    />
                    <span className="text-sm">{suburb}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Selected: {profile.serviceAreas.length} suburbs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ABN Verification */}
        <Card>
          <CardHeader>
            <CardTitle>ABN Verification (Optional)</CardTitle>
            <CardDescription>
              Add your ABN to build trust with customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="abn">Australian Business Number</Label>
              <Input
                id="abn"
                value={profile.abn}
                onChange={(e) => setProfile(prev => ({ ...prev, abn: e.target.value }))}
                placeholder="12 345 678 901"
                maxLength={14}
              />
              <p className="text-xs text-gray-500">
                Your ABN will be verified automatically to build customer trust
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {profile.id ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}