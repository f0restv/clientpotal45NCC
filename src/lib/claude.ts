import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MarketAnalysisResult {
  estimatedValue: {
    low: number;
    mid: number;
    high: number;
  };
  marketTrend: "rising" | "stable" | "declining";
  avgDaysToSell: number;
  demandLevel: "high" | "medium" | "low";
  recommendedPrice: number;
  pricingStrategy: string;
  keyFactors: string[];
  comparableDescription: string;
  confidence: number;
}

export interface CoinAnalysisInput {
  title: string;
  description?: string;
  year?: number;
  mint?: string;
  grade?: string;
  certification?: string;
  metalType?: string;
  metalWeight?: number;
  category?: string;
  imageUrls?: string[];
}

export async function analyzeMarketValue(
  input: CoinAnalysisInput,
  recentComparables?: Array<{ title: string; soldPrice: number; soldDate: string }>
): Promise<MarketAnalysisResult> {
  const comparablesText = recentComparables?.length
    ? `\n\nRecent comparable sales:\n${recentComparables
        .map((c) => `- ${c.title}: $${c.soldPrice} (${c.soldDate})`)
        .join("\n")}`
    : "";

  const prompt = `You are an expert numismatist and coin market analyst. Analyze the following coin/collectible and provide market valuation insights.

Item Details:
- Title: ${input.title}
- Description: ${input.description || "Not provided"}
- Year: ${input.year || "Unknown"}
- Mint: ${input.mint || "Unknown"}
- Grade: ${input.grade || "Ungraded"}
- Certification: ${input.certification || "Uncertified"}
- Metal Type: ${input.metalType || "Unknown"}
- Metal Weight: ${input.metalWeight ? `${input.metalWeight} oz` : "Unknown"}
- Category: ${input.category || "General"}
${comparablesText}

Please provide a detailed market analysis in the following JSON format:
{
  "estimatedValue": {
    "low": <number>,
    "mid": <number>,
    "high": <number>
  },
  "marketTrend": "<rising|stable|declining>",
  "avgDaysToSell": <number>,
  "demandLevel": "<high|medium|low>",
  "recommendedPrice": <number>,
  "pricingStrategy": "<brief recommendation for pricing approach>",
  "keyFactors": ["<factor 1>", "<factor 2>", ...],
  "comparableDescription": "<brief description of what comparables were considered>",
  "confidence": <0.0-1.0 representing confidence in this analysis>
}

Consider:
1. Current market conditions for this type of item
2. Rarity and population data if applicable
3. Grade significance and price jumps between grades
4. Historical price trends
5. Seasonal demand patterns
6. Certification premium if applicable

Respond ONLY with the JSON object, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = JSON.parse(content.text) as MarketAnalysisResult;
    return result;
  } catch (error) {
    console.error("Claude analysis error:", error);
    // Return default analysis on error
    return {
      estimatedValue: { low: 0, mid: 0, high: 0 },
      marketTrend: "stable",
      avgDaysToSell: 30,
      demandLevel: "medium",
      recommendedPrice: 0,
      pricingStrategy: "Unable to analyze - please review manually",
      keyFactors: ["Analysis unavailable"],
      comparableDescription: "No comparables analyzed",
      confidence: 0,
    };
  }
}

export async function generateProductDescription(
  input: CoinAnalysisInput
): Promise<string> {
  const prompt = `Write a compelling, professional product description for an online coin/collectibles shop. The description should be informative yet engaging, suitable for collectors.

Item Details:
- Title: ${input.title}
- Year: ${input.year || "Unknown"}
- Mint: ${input.mint || "Unknown"}
- Grade: ${input.grade || "Ungraded"}
- Certification: ${input.certification || "Uncertified"}
- Metal Type: ${input.metalType || "Unknown"}
- Metal Weight: ${input.metalWeight ? `${input.metalWeight} oz` : "Unknown"}
- Category: ${input.category || "General"}
- Additional Info: ${input.description || "None"}

Write a 2-3 paragraph description that:
1. Highlights the key features and appeal of this item
2. Mentions any historical significance
3. Notes the condition/grade benefits
4. Appeals to both new and experienced collectors

Keep it professional, accurate, and under 200 words.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return content.text;
  } catch (error) {
    console.error("Claude description error:", error);
    return input.description || "";
  }
}

export async function identifyCoin(imageBase64: string): Promise<{
  possibleIdentification: string;
  confidence: number;
  suggestedCategory: string;
  additionalNotes: string;
}> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Analyze this coin/collectible image and identify it. Provide your analysis in JSON format:
{
  "possibleIdentification": "<your best identification of this item>",
  "confidence": <0.0-1.0>,
  "suggestedCategory": "<category like 'US Coins', 'World Coins', 'Bullion', etc.>",
  "additionalNotes": "<any observations about condition, authenticity concerns, or notable features>"
}

Respond ONLY with the JSON object.`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return JSON.parse(content.text);
  } catch (error) {
    console.error("Claude identification error:", error);
    return {
      possibleIdentification: "Unable to identify",
      confidence: 0,
      suggestedCategory: "Unknown",
      additionalNotes: "Image analysis failed",
    };
  }
}
