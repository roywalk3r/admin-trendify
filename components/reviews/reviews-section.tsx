"use client"

import { useCallback, useState } from "react"
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Separator } from "@/components/ui/separator"
import { ReviewList } from "./review-list"
import { ReviewForm } from "./review-form"
import { Button } from "@/components/ui/button"

export function ReviewsSection({ productId }: { productId: string }) {
  const { user } = useUser()
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-2">Customer Reviews</h2>
      <p className="text-sm text-muted-foreground mb-6">Share your experience with this product.</p>

      <SignedOut>
        <div className="mb-6">
          <SignInButton mode="modal">
            <Button>Sign in to write a review</Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="mb-6">
          <ReviewForm productId={productId} onSubmitted={refresh} />
        </div>
      </SignedIn>

      <Separator className="my-6" />

      {/* key forces list to refetch after submission */}
      <ReviewList key={refreshKey} productId={productId} currentUserId={user?.id || undefined} />
    </section>
  )
}
