"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Compass, Home, Sparkles, Wand2 } from "lucide-react"

import { SearchAutocomplete } from "@/components/search/search-autocomplete"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/I18nProvider"

export default function NotFound() {
  const { t } = useI18n()
  const params = useParams<{ locale?: string }>()
  const router = useRouter()
  const localePrefix = params?.locale ? `/${params.locale}` : ""

  const quickLinks = [
    { label: t("nav.newArrivals"), href: `${localePrefix}/new-arrivals`, tag: "Fresh drop" },
    { label: t("nav.men"), href: `${localePrefix}/men`, tag: "Layering staples" },
    { label: t("nav.women"), href: `${localePrefix}/women`, tag: "Soft tailoring" },
    { label: t("nav.accessories"), href: `${localePrefix}/accessories`, tag: "Finish the look" },
    { label: t("nav.sale"), href: `${localePrefix}/sale`, tag: "Limited markdowns" },
  ]

  return (
    <div className="relative isolate overflow-hidden min-h-[80vh] px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-12 top-[-10%] h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[22rem] w-[22rem] rounded-full bg-muted/70 blur-[130px]" />
        <div className="absolute inset-x-10 top-32 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.08),transparent_32%)]" />
      </div>

      <div className="container mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-card/90 px-4 py-2 shadow-sm backdrop-blur">
            <Badge variant="secondary" className="px-2 py-1 text-xs">404</Badge>
            <span className="text-sm font-medium text-foreground/90">We lost the thread for a second</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{t("error.notFoundTitle")}</h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("error.notFoundText")}
            </p>
            <p className="text-sm text-muted-foreground">
              Let&apos;s stitch you back into the right collection—search, jump to a lane, or head home.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={localePrefix || "/"}>
                <Home className="mr-2 h-4 w-4" />
                {t("error.goHome")}
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to previous page
            </Button>
          </div>

          <div className="rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Search the catalog</p>
                <p className="text-sm text-muted-foreground">Instant suggestions across categories.</p>
              </div>
              <Badge variant="outline" className="text-xs">Live search</Badge>
            </div>
            <div className="max-w-xl">
              <SearchAutocomplete />
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-background to-muted/60 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_36%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,0.14),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.08),transparent_30%)]" />
            <div className="absolute left-10 top-10 h-24 w-24 rounded-full border border-primary/30" />
            <div className="absolute right-16 bottom-12 h-16 w-16 rounded-full border border-muted-foreground/20" />

            <div className="relative space-y-6 p-8 sm:p-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Navigate back</p>
                    <p className="text-sm text-muted-foreground">Pick a lane or ride the shortcuts.</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Curated
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border bg-background/80 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.tag}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-primary opacity-80 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-dashed bg-background/70 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Wand2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Style radar</span>
                  </div>
                  <p className="text-sm font-medium">Need direction?</p>
                  <p className="text-sm text-muted-foreground">
                    Browse new arrivals or jump into Sale to catch the latest drops with a markdown.
                  </p>
                </div>
                <div className="rounded-2xl border bg-background/75 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Still stuck?</p>
                  <p className="text-sm text-foreground">Go home or hit back—your cart and favorites stay with you.</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={localePrefix || "/"}>
                        <Home className="mr-2 h-3.5 w-3.5" />
                        Home
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.back()}>
                      <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
