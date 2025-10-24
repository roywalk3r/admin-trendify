"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Package, 
  BarChart3, 
  Shield, 
  Search, 
  TrendingUp,
  Brain,
  Zap
} from "lucide-react";
import AIProductDescriptionGenerator from "@/components/admin/ai-product-description-generator";
import AIInventoryInsights from "@/components/admin/ai-inventory-insights";
import AIReviewModerator from "@/components/admin/ai-review-moderator";
import AIUsageStats from "@/components/admin/ai-usage-stats";
import AIPricingStrategy from "@/components/admin/ai-pricing-strategy";

export default function AIDashboardPage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const aiFeatures = [
    {
      id: "product-description",
      title: "Product Description Generator",
      description: "Generate compelling product descriptions, SEO content, and marketing copy using AI",
      icon: Package,
      color: "bg-blue-500",
      status: "active",
    },
    {
      id: "inventory-insights",
      title: "Inventory Intelligence",
      description: "Get AI-powered insights on stock levels, restocking recommendations, and sales trends",
      icon: BarChart3,
      color: "bg-green-500",
      status: "active",
    },
    {
      id: "review-moderation",
      title: "Review Moderation",
      description: "Automatically analyze and moderate customer reviews for appropriateness and authenticity",
      icon: Shield,
      color: "bg-purple-500",
      status: "active",
    },
    {
      id: "seo-optimization",
      title: "SEO Optimization",
      description: "Generate SEO-friendly titles, meta descriptions, and keywords for better search rankings",
      icon: Search,
      color: "bg-orange-500",
      status: "active",
    },
    {
      id: "pricing-strategy",
      title: "Smart Pricing",
      description: "AI-powered pricing recommendations based on market analysis and competitor data",
      icon: TrendingUp,
      color: "bg-emerald-500",
      status: "active",
    },
    {
      id: "customer-insights",
      title: "Customer Behavior Analysis",
      description: "Understand customer patterns and get personalized marketing recommendations",
      icon: Brain,
      color: "bg-pink-500",
      status: "coming-soon",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            AI Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Harness the power of AI to optimize your e-commerce operations
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
          <Zap className="h-4 w-4 mr-1" />
          Powered by Gemini AI
        </Badge>
      </div>

      {/* AI Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFeature === feature.id ? "ring-2 ring-purple-500" : ""
            }`}
            onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <Badge 
                    variant={feature.status === "active" ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {feature.status === "active" ? "Available" : "Coming Soon"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Tools Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Tools & Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="product-description" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="product-description" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product
              </TabsTrigger>
              <TabsTrigger value="inventory-insights" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="pricing-strategy" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="seo-optimization" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="review-moderation" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="product-description" className="mt-6">
              <AIProductDescriptionGenerator />
            </TabsContent>

            <TabsContent value="inventory-insights" className="mt-6">
              <AIInventoryInsights />
            </TabsContent>

            <TabsContent value="pricing-strategy" className="mt-6">
              <AIPricingStrategy />
            </TabsContent>

            <TabsContent value="seo-optimization" className="mt-6">
              <AIProductDescriptionGenerator />
            </TabsContent>

            <TabsContent value="review-moderation" className="mt-6">
              <AIReviewModerator />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Usage Statistics */}
      <AIUsageStats />

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiFeatures.filter(f => f.status === "coming-soon").map((feature) => (
              <div key={feature.id} className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold text-muted-foreground">{feature.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
