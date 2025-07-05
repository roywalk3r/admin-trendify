"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, Loader2 } from "lucide-react"
import { useApiMutation } from "@/lib/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

export default function AdminSeedPage() {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)

  // Seed database mutation
  const {
    mutate: seedDatabase,
    isLoading,
    error,
    isSuccess,
  } = useApiMutation("/api/admin/seed", "POST", {
    onSuccess: () => {
      toast.error("Database seeded successfully", {
        description: "Sample data has been added to your database.",
      })
    },
    onError: (error) => {
      toast.error("Error seeding database", {
        description: error,
      })
    },
  })

  const handleSeed = () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    seedDatabase({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Seed Database</h1>
      </div>

      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This action will delete existing products, categories, orders, reviews, wishlist items, and other data. User
          accounts linked to Clerk will be preserved. This is intended for development and testing purposes only.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Database Seeder</CardTitle>
          <CardDescription>
            Populate your database with sample data including categories, products, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This will create:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            <li>4 product categories</li>
            <li>12+ sample products</li>
            <li>Sample orders with different statuses</li>
            <li>User addresses and shipping information</li>
            <li>Product reviews and ratings</li>
            <li>Wishlist items</li>
          </ul>

          {isSuccess && (
            <Alert className="mt-4" variant="success">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Database has been successfully seeded with sample data.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Cancel
          </Button>
          <Button onClick={handleSeed} disabled={isLoading} variant={isConfirming ? "destructive" : "default"}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Seeding..." : isConfirming ? "Are you sure? Click again to confirm" : "Seed Database"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
