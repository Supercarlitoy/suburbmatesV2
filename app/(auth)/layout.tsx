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
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}