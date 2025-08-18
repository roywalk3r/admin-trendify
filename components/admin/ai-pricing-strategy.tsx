"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  BarChart3,
  Loader,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface PricingAnalysis {
  optimalPrice: number;
  profitMargin: string;
  competitivePosition: string;
  dynamicPricing: string;
  promotionalOpportunities: string;
}

interface CurrentData {
  currentPrice: number;
  costPrice: number;
  totalSales: number;
  recentSales: number;
  competitorCount: number;
  averageCompetitorPrice: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: {
    name: string;
  };
}

export default function AIPricingStrategy() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [currentData, setCurrentData] = useState<CurrentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch products for selection
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.data || []);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAnalyzePricing = async () => {
    if (!selectedProductId) {
      toast.error("Please select a product to analyze");
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    setCurrentData(null);

    try {
      const response = await fetch("/api/admin/ai/pricing-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze pricing");
      }

      setAnalysis(data.data.analysis);
      setCurrentData(data.data.currentData);
      toast.success("Pricing analysis completed!");
    } catch (error: any) {
      toast.error("Failed to analyze pricing: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionColor = (position: string) => {
    const lowerPosition = position.toLowerCase();
    if (lowerPosition.includes("premium")) return "default";
    if (lowerPosition.includes("competitive")) return "secondary";
    return "outline";
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            AI Pricing Strategy Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-select">Select Product *</Label>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              disabled={isLoadingProducts}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Choose a product to analyze"} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ${product.price} ({product.category.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAnalyzePricing} 
            disabled={isLoading || !selectedProductId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Pricing Strategy...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Pricing Strategy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {currentData && selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Current Product Data - {selectedProduct.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${currentData.currentPrice.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Cost Price</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${currentData.costPrice.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentData.totalSales.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Recent Sales (30d)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentData.recentSales.toLocaleString()}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Competitors Analyzed</p>
                <p className="text-xl font-bold">{currentData.competitorCount}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Competitor Price</p>
                <p className="text-xl font-bold">
                  {currentData.averageCompetitorPrice > 0 
                    ? `$${currentData.averageCompetitorPrice.toFixed(2)}` 
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI Pricing Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Optimal Price Recommendation */}
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold">Recommended Price</h3>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-2">
                ${analysis.optimalPrice.toFixed(2)}
              </p>
              {currentData && (
                <p className="text-sm text-muted-foreground">
                  {analysis.optimalPrice > currentData.currentPrice ? "+" : ""}
                  {((analysis.optimalPrice - currentData.currentPrice) / currentData.currentPrice * 100).toFixed(1)}% 
                  {analysis.optimalPrice > currentData.currentPrice ? " increase" : " decrease"} from current price
                </p>
              )}
            </div>

            <Separator />

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Profit Margin</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {analysis.profitMargin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expected margin with recommended price
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold">Market Position</h4>
                  </div>
                  <Badge variant={getPositionColor(analysis.competitivePosition)} className="mb-2">
                    {analysis.competitivePosition}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Position relative to competitors
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Detailed Analysis */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  Dynamic Pricing Insights
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
                  {analysis.dynamicPricing}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Promotional Opportunities
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
                  {analysis.promotionalOpportunities}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="default" className="flex-1">
                Apply Recommended Price
              </Button>
              <Button variant="outline" className="flex-1">
                Schedule Price Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
