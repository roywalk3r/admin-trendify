"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";
import GeminiPopover from "@/components/gemini-popover";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile layout without SidebarProvider to avoid space reservation
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background md:flex-row">
          <AdminSidebar />
          <div className="flex-1 min-w-0 w-full overflow-x-hidden">
            <div className="w-full max-w-full px-4 py-6 md:px-6">
              {children}
            </div>
          </div>
          <div className="fixed bottom-6 right-6">
            <GeminiPopover />
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Desktop layout with SidebarProvider
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background md:flex-row">
          <AdminSidebar />
          <SidebarInset className="flex-1 min-w-0 w-full overflow-x-hidden">
            <div className="w-full max-w-full px-4 py-6 md:px-6">
              {children}
            </div>
          </SidebarInset>
          <div className="fixed bottom-6 right-6">
            <GeminiPopover />
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
