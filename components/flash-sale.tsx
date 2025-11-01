import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"

async function getFlashSale() {
  try {
    const hdrs = headers()
    const host = hdrs.get("host")
    const proto = process.env.VERCEL_URL ? "https" : "http"
    const url = host ? `${proto}://${host}/api/public/settings` : `/api/public/settings`
    const res = await fetch(url, {
      // no-store to always reflect current countdown
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data?.flashSale || null
  } catch (e) {
    return null
  }
}

function timeLeft(endsAt?: string) {
  if (!endsAt) return null
  const end = new Date(endsAt).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export default async function FlashSale() {
  const flash = await getFlashSale()
  if (!flash || !flash.enabled) return null

  const t = timeLeft(flash.endsAt)

  return (
    <section className="container my-8">
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Banner */}
          {flash.bannerImage ? (
            <div className="relative w-full md:w-1/2 h-48 md:h-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={flash.bannerImage} alt={flash.title} fill className="object-cover" />
            </div>
          ) : null}
          {/* Content */}
          <div className="flex-1 p-6 md:p-10 grid gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{flash.title}</h2>
              {flash.subtitle && (
                <p className="text-muted-foreground mt-1">{flash.subtitle}</p>
              )}
            </div>

            {/* Countdown */}
            {t && (
              <div className="flex flex-wrap gap-3 md:gap-4">
                {[{k:"Days", v:t.days},{k:"Hours", v:t.hours},{k:"Minutes", v:t.minutes},{k:"Seconds", v:t.seconds}].map((item) => (
                  <div key={item.k} className="min-w-[70px] text-center">
                    <div className="text-2xl md:text-3xl font-bold tabular-nums">{item.v}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.k}</div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-2">
              {typeof flash.discountPercent === 'number' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary font-medium">
                  Save {flash.discountPercent}%
                </span>
              )}
              <Link href="/sale" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                Shop Flash Sale
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
