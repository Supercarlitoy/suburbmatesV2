import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard - Suburbmates",
  description: "Manage your business profile and leads",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              Suburbmates
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <Link href="/dashboard/content">
                <Button variant="ghost" size="sm">
                  Content
                </Button>
              </Link>
              <Link href="/dashboard/leads">
                <Button variant="ghost" size="sm">
                  Leads
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" size="sm">
                  Search
                </Button>
              </Link>
              <Link href="/feed">
                <Button variant="ghost" size="sm">
                  Feed
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}