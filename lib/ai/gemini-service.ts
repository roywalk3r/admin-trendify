import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  model?: string;
}

export class GeminiService {
  private model = "gemini-2.0-flash-exp";

  async generateText(prompt: string): Promise<AIResponse> {
    try {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return {
        success: true,
        data: response.text,
        model: this.model,
      };
    } catch (error) {
      console.error("Gemini error:", error);
      return {
        success: false,
        error: "Failed to generate AI response",
      };
    }
  }

  async generateProductDescription(productData: {
    name: string;
    category: string;
    features?: string[];
    price?: number;
    targetAudience?: string;
  }): Promise<AIResponse> {
    const prompt = `Generate a compelling product description for an e-commerce store:

Product Name: ${productData.name}
Category: ${productData.category}
Features: ${productData.features?.join(", ") || "Not specified"}
Price: ${productData.price ? `$${productData.price}` : "Not specified"}
Target Audience: ${productData.targetAudience || "General consumers"}

Please create:
1. A compelling main description (2-3 paragraphs)
2. A short description (1-2 sentences)
3. Key bullet points highlighting main features
4. SEO-friendly title suggestion
5. Meta description for SEO

Format the response as JSON with keys: description, shortDescription, bulletPoints, seoTitle, metaDescription`;

    return this.generateText(prompt);
  }

  async analyzeInventory(inventoryData: {
    lowStockItems: Array<{ name: string; stock: number; category: string }>;
    topSellingItems: Array<{ name: string; sales: number; category: string }>;
    seasonalTrends?: string;
  }): Promise<AIResponse> {
    const prompt = `Analyze this inventory data and provide actionable insights:

Low Stock Items:
${inventoryData.lowStockItems.map(item => `- ${item.name}: ${item.stock} units (${item.category})`).join("\n")}

Top Selling Items:
${inventoryData.topSellingItems.map(item => `- ${item.name}: ${item.sales} sales (${item.category})`).join("\n")}

Seasonal Context: ${inventoryData.seasonalTrends || "No seasonal data provided"}

Please provide:
1. Immediate restocking recommendations
2. Category performance analysis
3. Seasonal opportunities
4. Risk assessment for stockouts
5. Revenue optimization suggestions

Format as JSON with keys: restockingRecommendations, categoryAnalysis, seasonalOpportunities, riskAssessment, revenueOptimization`;

    return this.generateText(prompt);
  }

  async generateSEOContent(contentData: {
    productName: string;
    category: string;
    description: string;
    targetKeywords?: string[];
  }): Promise<AIResponse> {
    const prompt = `Generate SEO-optimized content for this product:

Product: ${contentData.productName}
Category: ${contentData.category}
Description: ${contentData.description}
Target Keywords: ${contentData.targetKeywords?.join(", ") || "Generate relevant keywords"}

Please create:
1. SEO-optimized title (under 60 characters)
2. Meta description (under 160 characters)
3. H1 heading
4. 5-10 relevant keywords
5. Alt text for product images
6. URL slug suggestion

Format as JSON with keys: seoTitle, metaDescription, h1Heading, keywords, altText, urlSlug`;

    return this.generateText(prompt);
  }

  async moderateReview(reviewData: {
    rating: number;
    title?: string;
    comment: string;
    productName: string;
  }): Promise<AIResponse> {
    const prompt = `Analyze this product review for content moderation:

Product: ${reviewData.productName}
Rating: ${reviewData.rating}/5 stars
Title: ${reviewData.title || "No title"}
Comment: "${reviewData.comment}"

Please assess:
1. Appropriateness (profanity, offensive content)
2. Authenticity (spam, fake review indicators)
3. Helpfulness score (1-10)
4. Sentiment analysis
5. Key topics mentioned
6. Moderation recommendation (approve/reject/flag)

Format as JSON with keys: appropriateness, authenticity, helpfulness, sentiment, topics, recommendation, reasoning`;

    return this.generateText(prompt);
  }

  async analyzeCustomerBehavior(behaviorData: {
    purchaseHistory: Array<{ category: string; amount: number; date: string }>;
    browsing: Array<{ category: string; views: number }>;
    demographics?: { age?: number; location?: string };
  }): Promise<AIResponse> {
    const prompt = `Analyze customer behavior patterns:

Purchase History:
${behaviorData.purchaseHistory.map(p => `- ${p.category}: $${p.amount} on ${p.date}`).join("\n")}

Browsing Patterns:
${behaviorData.browsing.map(b => `- ${b.category}: ${b.views} views`).join("\n")}

Demographics: ${JSON.stringify(behaviorData.demographics || {})}

Please provide:
1. Customer segment classification
2. Purchase prediction likelihood
3. Recommended products/categories
4. Optimal marketing timing
5. Personalization suggestions

Format as JSON with keys: segment, purchaseLikelihood, recommendations, marketingTiming, personalization`;

    return this.generateText(prompt);
  }

  async generatePricingStrategy(pricingData: {
    productName: string;
    category: string;
    costPrice: number;
    competitorPrices?: number[];
    demandLevel?: "low" | "medium" | "high";
    seasonality?: string;
  }): Promise<AIResponse> {
    const prompt = `Analyze pricing strategy for this product:

Product: ${pricingData.productName}
Category: ${pricingData.category}
Cost Price: $${pricingData.costPrice}
Competitor Prices: ${pricingData.competitorPrices?.map(p => `$${p}`).join(", ") || "Not available"}
Demand Level: ${pricingData.demandLevel || "Unknown"}
Seasonality: ${pricingData.seasonality || "No seasonal data"}

Please recommend:
1. Optimal selling price
2. Profit margin analysis
3. Competitive positioning
4. Dynamic pricing suggestions
5. Promotional pricing opportunities

Format as JSON with keys: optimalPrice, profitMargin, competitivePosition, dynamicPricing, promotionalOpportunities`;

    return this.generateText(prompt);
  }

  async generateMarketingContent(marketingData: {
    productName: string;
    category: string;
    targetAudience: string;
    campaignType: "email" | "social" | "ads" | "blog";
    tone?: "professional" | "casual" | "luxury" | "playful";
  }): Promise<AIResponse> {
    const prompt = `Create marketing content for:

Product: ${marketingData.productName}
Category: ${marketingData.category}
Target Audience: ${marketingData.targetAudience}
Campaign Type: ${marketingData.campaignType}
Tone: ${marketingData.tone || "professional"}

Please create:
1. Compelling headline
2. Main marketing copy (2-3 paragraphs)
3. Call-to-action suggestions
4. Hashtags (for social media)
5. Email subject line (if email campaign)

Format as JSON with keys: headline, marketingCopy, callToAction, hashtags, emailSubject`;

    return this.generateText(prompt);
  }
}

export const geminiService = new GeminiService();
