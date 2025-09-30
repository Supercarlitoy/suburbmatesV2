import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

// Disable prerendering for admin pages due to auth requirements
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and admin access
  let user = null;
  let error = null;
  
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data?.user;
    error = result.error;
  } catch (e) {
    console.error('Admin layout auth error:', e);
    error = e;
  }

  if (error || !user) {
    redirect('/auth/signin?redirectTo=/admin');
  }

  // Check admin permissions (this should match your checkAdminAccess function)
  const isAdmin = await checkAdminAccess(user.id);
  if (!isAdmin) {
    redirect('/dashboard'); // Redirect to user dashboard if not admin
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper function to check admin access (reused from API routes)
async function checkAdminAccess(userId: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/database/prisma');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    if (!user) return false;

    // Check if user has admin role
    if (user.role === 'ADMIN') return true;

    // Check against admin email list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    return adminEmails.includes(user.email);

  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}