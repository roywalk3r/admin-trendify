import type React from "react"
import type { Metadata } from "next"
import {Bruno_Ace, Poppins, Luxurious_Script} from "next/font/google"
import localFont from 'next/font/local'
import "./globals.css"


const luxuriousScript = Luxurious_Script({
    weight: "400",
    style: "normal",
    subsets: ["latin"],
    preload: true,
    variable: "--font-lux"
})
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
              className={`${luxuriousScript.variable} ${brunoAce.variable} ${poppins.variable} antialiased `}>
                <body className={"bg-[#f6f3f3]"}>
                  {children}
                </body>
        </html>
    )
}
