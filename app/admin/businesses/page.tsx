"use client";

import React from 'react';
import AdminBusinessDashboard from '@/components/admin/AdminBusinessDashboard';

// Disable prerendering for admin pages
export const dynamic = 'force-dynamic';

export default function AdminBusinessesPage() {
  return <AdminBusinessDashboard />;
}
