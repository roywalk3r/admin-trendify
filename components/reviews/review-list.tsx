"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, Flag, CheckCircle, MessageSquare, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { ReviewForm } from "./review-form"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  title: string
  comment?: string
  images: string[]
  isVerified: boolean
  createdAt: string
  isHelpful: number
  user: {
    id: string
    name: string
    avatar?: string | null
  }
}

interface ReviewListProps {
  productId: string
  currentUserId?: string
}

export function ReviewList({ productId, currentUserId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
  }>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}&page=1&limit=10`)
      const json = await response.json()
      const items: Review[] = json?.data?.items ?? []
      setReviews(items)
      const total = json?.data?.total ?? items.length
      const average = items.length ? items.reduce((s, r) => s + (r.rating || 0), 0) / items.length : 0
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      items.forEach((r) => {
        const key = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5
        dist[key] = (dist[key] || 0) + 1
      })
      setStats({ averageRating: Number(average.toFixed(1)), totalReviews: total, ratingDistribution: dist })
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        fetchReviews() // Refresh to get updated counts
      }
    } catch (error) {
      console.error("Error voting on review:", error)
    }
  }

  const renderStars = (rating: number, size = "h-4 w-4") => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Review Summary with gradient background */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-2xl p-6 lg:p-8 border border-primary/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="flex flex-col items-center justify-center text-center lg:border-r lg:border-border/50">
            <div className="mb-2">
              <div className="text-6xl lg:text-7xl font-black bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {stats.averageRating}
              </div>
            </div>
            <div className="mb-3">
              {renderStars(Math.round(stats.averageRating), "h-6 w-6")}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Based on <span className="font-bold text-foreground">{stats.totalReviews}</span> reviews
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Highly rated by customers</span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg mb-4">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating]
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3 group">
                  <span className="text-sm font-medium w-8">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 group-hover:scale-105"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium w-12 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs for Reviews and Write Review */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            All Reviews ({stats.totalReviews})
          </TabsTrigger>
          <TabsTrigger value="write" className="gap-2">
            <Star className="h-4 w-4" />
            Write a Review
          </TabsTrigger>
        </TabsList>

        {/* Reviews List Tab */}
        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to share your experience!</p>
                <Button variant="default" onClick={() => {
                  const tabButton = document.querySelector('[value="write"]') as HTMLButtonElement
                  tabButton?.click()
                }}>
                  <Star className="mr-2 h-4 w-4" />
                  Write the First Review
                </Button>
              </div>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border/50">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                            {review.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-base">{review.user.name}</span>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {renderStars(review.rating)}
                            <span className="text-xs text-muted-foreground font-medium">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {review.title && (
                      <h4 className="font-semibold text-lg">{review.title}</h4>
                    )}
                    {review.comment && (
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}

                    {review.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Review image ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-border hover:border-primary transition-all cursor-pointer group-hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulVote(review.id)}
                        disabled={!currentUserId}
                        className="gap-2 hover:bg-primary/10 hover:text-primary"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-medium">Helpful ({review.isHelpful || 0})</span>
                      </Button>
                      {!currentUserId && (
                        <span className="text-xs text-muted-foreground">Sign in to vote</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Write Review Tab */}
        <TabsContent value="write" className="mt-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <h3 className="text-xl font-bold">Share Your Experience</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your feedback helps other customers make informed decisions
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {currentUserId ? (
                <ReviewForm
                  productId={productId}
                  onSubmitted={() => {
                    fetchReviews()
                    toast.success("Review submitted successfully!", {
                      description: "Thank you for sharing your feedback.",
                    })
                    // Switch back to reviews tab
                    const reviewsTab = document.querySelector('[value="reviews"]') as HTMLButtonElement
                    reviewsTab?.click()
                  }}
                />
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Sign in to leave a review</h4>
                    <p className="text-muted-foreground text-sm mb-6">
                      Share your experience with this product
                    </p>
                    <Button onClick={() => window.location.href = '/sign-in'}>
                      Sign In to Review
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
