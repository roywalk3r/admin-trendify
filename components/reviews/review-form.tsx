"use client"

import { useState } from "react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(255).optional(),
  comment: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

export function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted?: () => void }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [imageUrls, setImageUrls] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    const parsed = schema.safeParse({
      rating,
      title: title || undefined,
      comment: comment || undefined,
      images: imageUrls
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join("; "))
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...parsed.data }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Failed to submit review")
      }
      onSubmitted?.()
      // Reset
      setRating(0)
      setTitle("")
      setComment("")
      setImageUrls("")
    } catch (e: any) {
      setError(e.message || "Unexpected error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium">Your rating</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className="p-1"
              onClick={() => setRating(n)}
              aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            >
              <Star className={`h-6 w-6 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Textarea placeholder="Share your experience (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <div>
        <Input
          placeholder="Image URLs separated by commas (optional)"
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
        />
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <Button onClick={submit} disabled={submitting || rating < 1}>{submitting ? "Submitting..." : "Submit Review"}</Button>
    </div>
  )
}
