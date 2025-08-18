"use client"

import { useGeneralSettings, useSocialSettings } from "@/contexts/settings-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Linkedin, PinIcon as Pinterest } from "lucide-react"

export function SiteHeader() {
  const generalSettings = useGeneralSettings()
  const socialSettings = useSocialSettings()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">{generalSettings.storeName}</h1>
            <Badge variant="outline">{generalSettings.currencyCode}</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {socialSettings.facebook && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={socialSettings.facebook} target="_blank">
                    <Facebook className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {socialSettings.twitter && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={socialSettings.twitter} target="_blank">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {socialSettings.instagram && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={socialSettings.instagram} target="_blank">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {socialSettings.youtube && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={socialSettings.youtube} target="_blank">
                    <Youtube className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {socialSettings.linkedin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={socialSettings.linkedin} target="_blank">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {socialSettings.pinterest && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={socialSettings.pinterest} target="_blank">
                    <Pinterest className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {generalSettings.storeEmail && <span>{generalSettings.storeEmail}</span>}
              {generalSettings.storePhone && <span className="ml-2">{generalSettings.storePhone}</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
