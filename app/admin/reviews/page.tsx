import { ReviewModeration } from "@/components/admin/review-moderation"

export default function AdminReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Approve or reject customer reviews before they appear on your store
        </p>
      </div>

      <ReviewModeration />
    </div>
  )
}
