"use client"

import { useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

export default function DebugPage() {
  const { data, isLoading, error, refetch } = useApi<any>("/api/admin/debug")
  const [showRaw, setShowRaw] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Fetching system information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : data?.data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>Status of the database connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {data.data.dbConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Disconnected</span>
                  </>
                )}
              </div>

              {data.data.dbInfo && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium">Database Version</h3>
                  <pre className="mt-1 rounded bg-muted p-2 text-xs">{JSON.stringify(data.data.dbInfo, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings Data</CardTitle>
              <CardDescription>Information about settings in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Settings Count</h3>
                  <p className="text-2xl font-bold">{data.data.settingsCount}</p>
                </div>

                {data.data.settingsData && (
                  <div>
                    <h3 className="text-sm font-medium">Settings Records</h3>
                    <pre className="mt-1 rounded bg-muted p-2 text-xs">
                      {JSON.stringify(data.data.settingsData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
              <CardDescription>System environment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Node Environment</h3>
                  <p className="text-lg font-medium">{data.data.environment}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Server Time</h3>
                  <p className="text-lg font-medium">{new Date(data.data.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button variant="outline" onClick={() => setShowRaw(!showRaw)}>
              {showRaw ? "Hide" : "Show"} Raw Response
            </Button>

            {showRaw && (
              <pre className="mt-4 rounded bg-muted p-4 text-xs overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
