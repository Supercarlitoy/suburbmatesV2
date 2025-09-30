import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SuburbMatesLogo } from "@/components/ui/SuburbMatesLogo";
import { glass } from "@/lib/design-system";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = {
  title: "Admin Dashboard - Suburbmates",
  description: "Manage business approvals and platform administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <nav className={`border-b ${glass.navBar} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <SuburbMatesLogo variant="NavigationLogo" size="sm" />
              </Link>
              <StatusBadge variant="red" size="sm">
                ADMIN
              </StatusBadge>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/approve">
                <Button variant="ghost" size="sm">
                  Approvals
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage business approvals and platform administration
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}