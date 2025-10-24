import { LucideIcon, PackageOpen, ShoppingCart, Search, FileText, Inbox, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick}>{action.label}</Button>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Your cart is empty"
      description="Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
      action={{
        label: "Continue Shopping",
        onClick: () => window.location.href = "/products"
      }}
    />
  )
}

export function EmptyProducts() {
  return (
    <EmptyState
      icon={PackageOpen}
      title="No products found"
      description="We couldn't find any products matching your criteria. Try adjusting your filters or search query."
      action={{
        label: "Clear Filters",
        onClick: () => window.location.href = "/products"
      }}
    />
  )
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={FileText}
      title="No orders yet"
      description="You haven't placed any orders yet. Start shopping to see your order history here."
      action={{
        label: "Start Shopping",
        onClick: () => window.location.href = "/products"
      }}
    />
  )
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="We couldn't find any products matching your search. Try using different keywords or check out our popular products."
      action={{
        label: "View All Products",
        onClick: () => window.location.href = "/products"
      }}
    />
  )
}

export function ErrorState({ error, retry }: { error?: string; retry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description={error || "We encountered an error while loading this content. Please try again."}
      action={retry ? {
        label: "Try Again",
        onClick: retry
      } : undefined}
    />
  )
}

export function EmptyWishlist() {
  return (
    <EmptyState
      icon={PackageOpen}
      title="Your wishlist is empty"
      description="Save items you love to your wishlist so you can easily find them later."
      action={{
        label: "Explore Products",
        onClick: () => window.location.href = "/products"
      }}
    />
  )
}

export function EmptyReviews() {
  return (
    <EmptyState
      icon={FileText}
      title="No reviews yet"
      description="This product doesn't have any reviews yet. Be the first to share your experience!"
    />
  )
}
