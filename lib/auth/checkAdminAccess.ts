import { prisma } from '@/lib/database/prisma';

export async function checkAdminAccess(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    if (!user) return false;

    if (user.role === 'ADMIN') return true;

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    return adminEmails.includes(user.email);
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}
