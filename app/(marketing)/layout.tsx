import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SuburbMatesLogo } from "@/components/ui/SuburbMatesLogo";
import { glass } from "@/lib/design-system";

export const metadata: Metadata = {
  title: "Suburbmates - Melbourne Business Network",
  description: "Connect with verified local businesses in Melbourne",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Marketing Navigation */}
      <nav className={`border-b ${glass.navBar} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <SuburbMatesLogo variant="NavigationLogo" size="sm" />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/about">
                <Button variant="ghost" size="sm">
                  About
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="ghost" size="sm">
                  FAQ
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" size="sm">
                  Search
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Marketing Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Suburbmates. Connecting Melbourne businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}