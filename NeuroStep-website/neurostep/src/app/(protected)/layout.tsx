'use client';

import { Sidebar } from '@/components/Nav/Sidebar';
import { Topbar } from '@/components/Nav/Topbar';
import ChatbotWidget from '@/components/ui/chatbot';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Topbar */}
            <Topbar />

            {/* Page content */}
            <main className="flex-1 overflow-auto bg-background relative">
              {/* Content container with proper spacing */}
              <div className="h-full p-6 lg:p-8">
                <div className="max-w-7xl mx-auto h-full">
                  <div className="relative z-10 h-full">
                    {children}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Chat Widget */}
        <ChatbotWidget />
      </div>
    </RouteGuard>
  );
}