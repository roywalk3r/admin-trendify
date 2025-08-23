import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Inter, Bruno_Ace } from "next/font/google"
import AppShell from "@/components/app-shell"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Providers from "@/components/providers"

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
})

const bruno = Bruno_Ace({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-bruno-ace",
    display: "swap",
})

export const metadata: Metadata = {
    title: "Trendify",
    description: "Your one stop shop for all things fashion",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
        <body className={`${poppins.className}   ${inter.variable} ${bruno.variable} antialiased`}>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </Providers>
        </body>
        </html>
    )
}
