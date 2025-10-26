"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, CheckCircle, X, RefreshCw, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  title: string
  comment?: string
  images: string[]
  isVerified: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
  }
  product: {
    id: string
    name: string
    images: string[]
    slug: string
  }
}

interface ReviewModerationProps {
  initialStatus?: 'pending' | 'approved' | 'all'
}

export function ReviewModeration({ initialStatus = 'pending' }: ReviewModerationProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 })
  const [status, setStatus] = useState(initialStatus)
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reviews/pending?page=${page}&limit=20&status=${status}`)
      const data = await response.json()
      
      if (response.ok && data.data) {
        setReviews(data.data.reviews)
        setStats(data.data.stats)
      } else {
        toast.error(data.error || "Failed to load reviews")
      }
    } catch (error) {
      toast.error("Failed to load reviews")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [status, page])

  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(reviewId)
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message || "Review approved successfully")
        fetchReviews() // Refresh list
      } else {
        toast.error(data.error || "Failed to approve review")
      }
    } catch (error) {
      toast.error("Failed to approve review")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      setActionLoading(reviewId)
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message || "Review rejected successfully")
        fetchReviews() // Refresh list
      } else {
        toast.error(data.error || "Failed to reject review")
      }
    } catch (error) {
      toast.error("Failed to reject review")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={status === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatus('pending')}
            size="sm"
          >
            Pending ({stats.pending})
          </Button>
          <Button
            variant={status === 'approved' ? 'default' : 'outline'}
            onClick={() => setStatus('approved')}
            size="sm"
          >
            Approved ({stats.approved})
          </Button>
          <Button
            variant={status === 'all' ? 'default' : 'outline'}
            onClick={() => setStatus('all')}
            size="sm"
          >
            All ({stats.total})
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchReviews}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No {status !== 'all' ? status : ''} reviews found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{review.user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{review.user.name}</span>
                        <span className="text-sm text-muted-foreground">({review.user.email})</span>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {renderStars(review.rating)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-6">
                {/* Product Info */}
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                  {review.product.images[0] && (
                    <img
                      src={review.product.images[0]}
                      alt={review.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Product:</div>
                    <div className="font-medium">{review.product.name}</div>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h4 className="font-semibold text-lg">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                )}

                {/* Review Images */}
                {review.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-border"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
