import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";
import GeminiPopover from "@/components/gemini-popover";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Trendify | Admin",
  description: "Manage Your store front",
};



export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Server-side admin/staff protection
  const { userId } = await auth();
  if (!userId) {
    redirect(`/${params.locale}/sign-in`);
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    redirect(`/${params.locale}`);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <div className="container p-6 mx-auto">{children}</div>
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
