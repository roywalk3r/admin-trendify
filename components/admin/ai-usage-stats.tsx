"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Package, 
  Shield, 
  BarChart3, 
  TrendingUp,
  RefreshCw,
  Loader,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface AIUsageData {
  usage: {
    aiRequestsToday: number;
    descriptionsGenerated: number;
    reviewsModerated: number;
    insightsGenerated: number;
  };
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    popularFeatures: Array<{
      name: string;
      usage: number;
    }>;
  };
  systemHealth: {
    apiResponseTime: string;
    successRate: string;
    errorRate: string;
  };
}

export default function AIUsageStats() {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAIUsageData = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/admin/analytics/ai-usage");
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch AI usage data");
      }

      setData(result.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      toast.error("Failed to fetch AI usage statistics: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIUsageData();
  }, []);

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load AI usage statistics</p>
          <Button variant="outline" onClick={fetchAIUsageData} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Usage Stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Usage Statistics</h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAIUsageData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">AI Requests Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.usage.aiRequestsToday.toLocaleString()}
                </p>
                <Badge variant="secondary" className="mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{data.trends.weeklyGrowth}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Descriptions Generated</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.usage.descriptionsGenerated.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Reviews Moderated</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.usage.reviewsModerated.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Auto-processed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Insights Generated</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.usage.insightsGenerated.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Business insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">System Health</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {data.systemHealth.apiResponseTime}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {data.systemHealth.successRate}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {data.systemHealth.errorRate}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">Popular Features</h4>
            </div>
            <div className="space-y-3">
              {data.trends.popularFeatures.map((feature, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{feature.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((feature.usage / Math.max(...data.trends.popularFeatures.map(f => f.usage))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{feature.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h4 className="font-semibold">Growth Trends</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Weekly Growth</p>
              <p className="text-2xl font-bold text-emerald-600">+{data.trends.weeklyGrowth}%</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Growth</p>
              <p className="text-2xl font-bold text-emerald-600">+{data.trends.monthlyGrowth}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
