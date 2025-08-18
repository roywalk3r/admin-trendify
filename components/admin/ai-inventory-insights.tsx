"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  BarChart3, 
  Sparkles,
  RefreshCw,
  Loader
} from "lucide-react";
import { toast } from "sonner";

interface InventoryAnalysis {
  restockingRecommendations: string;
  categoryAnalysis: string;
  seasonalOpportunities: string;
  riskAssessment: string;
  revenueOptimization: string;
}

interface InventoryData {
  lowStockItems: Array<{ name: string; stock: number; category: string }>;
  topSellingItems: Array<{ name: string; sales: number; category: string }>;
  seasonalTrends: string;
}

export default function AIInventoryInsights() {
  const [analysis, setAnalysis] = useState<InventoryAnalysis | null>(null);
  const [rawData, setRawData] = useState<InventoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInventoryAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/admin/ai/inventory-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze inventory");
      }

      setAnalysis(data.data.analysis);
      setRawData(data.data.rawData);
      setLastUpdated(new Date());
      toast.success("Inventory analysis updated!");
    } catch (error: any) {
      toast.error("Failed to analyze inventory: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAnalysis();
  }, []);

  const getRiskColor = (risk: string) => {
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes("high")) return "destructive";
    if (lowerRisk.includes("medium")) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Inventory Insights
            </CardTitle>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInventoryAnalysis}
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
        </CardHeader>
        <CardContent>
          {isLoading && !analysis ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                <p className="text-sm text-muted-foreground">Analyzing inventory data...</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Quick Stats */}
              {rawData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Low Stock Items</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {rawData.lowStockItems.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Top Sellers</p>
                          <p className="text-2xl font-bold text-green-600">
                            {rawData.topSellingItems.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Risk Level</p>
                          <Badge variant={getRiskColor(analysis.riskAssessment)}>
                            {analysis.riskAssessment.split(' ')[0]}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Separator />

              {/* AI Analysis Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Restocking Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Restocking Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.restockingRecommendations}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Category Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      Category Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.categoryAnalysis}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Seasonal Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Seasonal Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.seasonalOpportunities}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Revenue Optimization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Revenue Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.revenueOptimization}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Low Stock Items Detail */}
              {rawData && rawData.lowStockItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Items Requiring Immediate Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rawData.lowStockItems.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <Badge variant="destructive">
                            {item.stock} left
                          </Badge>
                        </div>
                      ))}
                      {rawData.lowStockItems.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{rawData.lowStockItems.length - 5} more items need attention
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Click refresh to analyze your inventory</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
