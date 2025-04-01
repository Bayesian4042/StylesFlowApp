'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { ProtectedNavSidebar } from '@/components/nav-sidebar';
import AuthCheck from '@/components/auth/AuthCheck';

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck>
      <SidebarProvider>
        <div className='group/sidebar flex h-screen overflow-hidden bg-background'>
          <ProtectedNavSidebar />
          <main className='flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 group-data-[collapsible=icon]/sidebar:pl-[48px]'>
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AuthCheck>
  );
}
