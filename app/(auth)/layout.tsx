import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Suburbmates",
  description: "Sign in or create your business profile on Suburbmates",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
