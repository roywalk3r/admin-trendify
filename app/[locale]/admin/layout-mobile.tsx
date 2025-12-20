import { AdminSidebar } from "@/components/admin/admin-sidebar";
import  GeminiPopover  from "@/components/gemini-popover";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
 import { UserRole } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
 import { redirect } from "next/navigation";

export default async function AdminLayoutMobile({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Server-side admin/staff protection
  const { userId } = await auth();
  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || (user.role as unknown as string) === UserRole.CUSTOMER) {
    redirect(`/${locale}`);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {/* Mobile layout without SidebarProvider to avoid space reservation */}
      <div className="flex min-h-screen w-full overflow-x-hidden bg-background md:hidden">
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
