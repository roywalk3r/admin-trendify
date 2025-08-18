"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Star,
  Loader,
  ThumbsUp,
  ThumbsDown,
  Flag
} from "lucide-react";
import { toast } from "sonner";

interface ModerationResult {
  appropriateness: string;
  authenticity: string;
  helpfulness: number;
  sentiment: string;
  topics: string[];
  recommendation: "approve" | "reject" | "flag";
  reasoning: string;
}

interface ReviewModerationProps {
  reviewId?: string;
  initialReview?: {
    rating: number;
    title?: string;
    comment: string;
    productName: string;
  };
  onModerationComplete?: (result: ModerationResult) => void;
}

export default function AIReviewModerator({ 
  reviewId, 
  initialReview, 
  onModerationComplete 
}: ReviewModerationProps) {
  const [reviewData, setReviewData] = useState({
    rating: initialReview?.rating || 5,
    title: initialReview?.title || "",
    comment: initialReview?.comment || "",
    productName: initialReview?.productName || "",
  });
  
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleModerate = async () => {
    if (!reviewData.comment || !reviewData.productName) {
      toast.error("Comment and product name are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/ai/review-moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to moderate review");
      }

      setModerationResult(data.data);
      onModerationComplete?.(data.data);
      toast.success("Review moderation completed!");
    } catch (error: any) {
      toast.error("Failed to moderate review: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "approve":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "reject":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "flag":
        return <Flag className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "approve":
        return "default";
      case "reject":
        return "destructive";
      case "flag":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            AI Review Moderator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={reviewData.productName}
                onChange={(e) => setReviewData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewData.rating}
                  onChange={(e) => setReviewData(prev => ({ ...prev, rating: parseInt(e.target.value) || 1 }))}
                  className="w-20"
                />
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= reviewData.rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title (optional)</Label>
            <Input
              id="title"
              value={reviewData.title}
              onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Review title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Review Comment *</Label>
            <Textarea
              id="comment"
              value={reviewData.comment}
              onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Enter the review comment to moderate..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleModerate} 
            disabled={isLoading || !reviewData.comment || !reviewData.productName}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Review...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Moderate Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {moderationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getRecommendationIcon(moderationResult.recommendation)}
              Moderation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Recommendation */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getRecommendationIcon(moderationResult.recommendation)}
                <Badge variant={getRecommendationColor(moderationResult.recommendation)} className="text-lg px-4 py-1">
                  {moderationResult.recommendation.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{moderationResult.reasoning}</p>
            </div>

            <Separator />

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Appropriateness</h4>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {moderationResult.appropriateness}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Authenticity</h4>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {moderationResult.authenticity}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold">Helpfulness Score</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-600">
                      {moderationResult.helpfulness}/10
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${moderationResult.helpfulness * 10}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getSentimentIcon(moderationResult.sentiment)}
                    <h4 className="font-semibold">Sentiment</h4>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {moderationResult.sentiment}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Topics */}
            {moderationResult.topics && moderationResult.topics.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Key Topics Mentioned</h4>
                <div className="flex flex-wrap gap-2">
                  {moderationResult.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
