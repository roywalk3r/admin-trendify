"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, Loader, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ProductDescriptionData {
  description: string;
  shortDescription: string;
  bulletPoints: string[];
  seoTitle: string;
  metaDescription: string;
}

interface ProductDescriptionGeneratorProps {
  onGenerated?: (data: ProductDescriptionData) => void;
  initialData?: {
    name?: string;
    category?: string;
    features?: string[];
    price?: number;
    targetAudience?: string;
  };
}

export default function AIProductDescriptionGenerator({ 
  onGenerated, 
  initialData 
}: ProductDescriptionGeneratorProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    features: initialData?.features?.join(", ") || "",
    price: initialData?.price || "",
    targetAudience: initialData?.targetAudience || "",
  });
  
  const [generatedContent, setGeneratedContent] = useState<ProductDescriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Product name and category are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/ai/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
          price: formData.price ? parseFloat(formData.price.toString()) : undefined,
          targetAudience: formData.targetAudience || undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description");
      }

      setGeneratedContent(data.data);
      onGenerated?.(data.data);
      toast.success("Product description generated successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to generate description");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Product Description Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Electronics, Clothing"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Key Features</Label>
            <Input
              id="features"
              value={formData.features}
              onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
              placeholder="Comma-separated features (e.g., Wireless, Waterproof, 24hr battery)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="e.g., Tech enthusiasts, Professionals"
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !formData.name || !formData.category}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Description
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Product Description</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.description, "Description")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={generatedContent.description}
                readOnly
                className="min-h-[120px] bg-muted"
              />
            </div>

            <Separator />

            {/* Short Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Short Description</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.shortDescription, "Short Description")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={generatedContent.shortDescription}
                readOnly
                className="bg-muted"
                rows={2}
              />
            </div>

            <Separator />

            {/* Bullet Points */}
            {generatedContent.bulletPoints && generatedContent.bulletPoints.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Key Features</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.bulletPoints.join("\n"), "Features")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {generatedContent.bulletPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">•</Badge>
                      <span className="text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* SEO Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">SEO Title</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.seoTitle, "SEO Title")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  value={generatedContent.seoTitle}
                  readOnly
                  className="bg-muted text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Meta Description</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.metaDescription, "Meta Description")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Textarea
                  value={generatedContent.metaDescription}
                  readOnly
                  className="bg-muted text-sm"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
