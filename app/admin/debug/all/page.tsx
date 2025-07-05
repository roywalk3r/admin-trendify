"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function AdminDebugPage() {
  const [activeTab, setActiveTab] = useState("routes")
  const [routeData, setRouteData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testRoutes = [
    { name: "Admin Check", path: "/api/admin/check" },
    { name: "Products List", path: "/api/admin/products" },
    { name: "Single Product", path: "/api/admin/products/cm8vkky97000a9ra5on690cxj" },
    { name: "Users List", path: "/api/admin/users" },
    { name: "Orders List", path: "/api/admin/orders" },
    { name: "Dashboard Stats", path: "/api/admin/dashboard" },
  ]

  const testRoute = async (path: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(path)
      const data = await response.json()
      setRouteData({
        status: response.status,
        statusText: response.statusText,
        data: data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setRouteData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel Debug Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="routes">API Routes</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="data">Data Structure</TabsTrigger>
            </TabsList>

            <TabsContent value="routes" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {testRoutes.map((route) => (
                  <Button key={route.path} variant="outline" onClick={() => testRoute(route.path)}>
                    Test {route.name}
                  </Button>
                ))}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {error && <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>}

              {routeData && (
                <div className="mt-4">
                  <div className="flex gap-2 mb-2">
                    <span className="font-semibold">Status:</span>
                    <span className={routeData.status >= 400 ? "text-red-500" : "text-green-500"}>
                      {routeData.status} {routeData.statusText}
                    </span>
                  </div>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre>{JSON.stringify(routeData.data, null, 2)}</pre>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="auth">
              <div className="space-y-4">
                <Button onClick={() => testRoute("/api/admin/check")}>Check Admin Status</Button>

                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                  <p className="font-medium">Authentication Troubleshooting:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Ensure you're logged in with a Clerk account</li>
                    <li>Check that your user has the "admin" role in the database</li>
                    <li>Verify that the Clerk webhook is properly configured</li>
                    <li>Check for CORS issues in the browser console</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => testRoute("/api/admin/products")}>Check Products Data</Button>
                  <Button onClick={() => testRoute("/api/admin/users")}>Check Users Data</Button>
                </div>

                <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
                  <p className="font-medium">Data Structure Notes:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>
                      API responses should follow the format: <code>{`{ data: {...}, error: null }`}</code>
                    </li>
                    <li>
                      Products data is nested under <code>data.products</code>
                    </li>
                    <li>Check for field name mismatches (e.g., snake_case vs. camelCase)</li>
                    <li>Verify that IDs are correctly formatted and referenced</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
