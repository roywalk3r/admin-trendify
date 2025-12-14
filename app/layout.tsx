import type React from "react"
import type { Metadata } from "next"
import {Bruno_Ace, Poppins} from "next/font/google"
import "./globals.css"

const brunoAce = Bruno_Ace({
    weight: "400",
    style: "normal",
    subsets: ["latin"],
    preload: true,
    variable: "--font-bruno"
})

const poppins = Poppins({
    weight: "400",
    style: "normal",
    subsets: ["latin"],
    preload: true,
    variable: "--font-poppins"
})

// Add or edit your "generateMetadata" to include the Sentry trace data:
export function generateMetadata(): Metadata {
    return {
        title: "Trendify",
        description: "Your one stop shop for all things fashion",
    };
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning
              className={`${brunoAce.variable} ${poppins.variable} antialiased `}>
                <body className={"bg-[#f6f3f3]"}>
                  {children}
                </body>
        </html>
    )
}
