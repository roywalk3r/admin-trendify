"use client"

import { useState } from "react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Star, Loader2, ImagePlus } from "lucide-react"
import { toast } from "sonner"

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
    <div className="space-y-6">
      {/* Rating Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Your Rating *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className="group p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
              onClick={() => setRating(n)}
              aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-8 w-8 transition-all duration-200 ${
                  n <= rating
                    ? "fill-yellow-400 text-yellow-400 scale-110"
                    : "text-muted-foreground group-hover:text-yellow-400/50 group-hover:scale-105"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {rating === 0 && "Select a rating to continue"}
          {rating === 1 && "Poor - Not satisfied"}
          {rating === 2 && "Fair - Below expectations"}
          {rating === 3 && "Good - Met expectations"}
          {rating === 4 && "Very Good - Exceeded expectations"}
          {rating === 5 && "Excellent - Highly recommend!"}
        </p>
      </div>

      {/* Review Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-semibold">
          Review Title <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Input
          id="title"
          placeholder="Summarize your experience..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">{title.length}/255 characters</p>
      </div>

      {/* Review Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-base font-semibold">
          Your Review <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="comment"
          placeholder="Share details about your experience with this product. What did you like or dislike? How does it perform?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[120px] resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">{comment.length}/1000 characters</p>
      </div>

      {/* Image URLs */}
      <div className="space-y-2">
        <Label htmlFor="images" className="text-base font-semibold flex items-center gap-2">
          <ImagePlus className="h-4 w-4" />
          Add Photos <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Input
          id="images"
          placeholder="Enter image URLs separated by commas"
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Add photos to help others see your experience
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={submit}
          disabled={submitting || rating < 1}
          size="lg"
          className="flex-1 h-12 text-base font-semibold gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Star className="h-5 w-5" />
              Submit Review
            </>
          )}
        </Button>
      </div>

      {rating < 1 && (
        <p className="text-sm text-muted-foreground text-center">
          Please select a rating before submitting
        </p>
      )}
    </div>
  )
}
