import { OpenRouter } from "@openrouter/sdk";
import type { ChatRequest } from "@openrouter/sdk/models";

export interface AnalyzeProductInput {
  title: string;
  imageBase64?: string;
  imageUrl?: string;
  marketplaceUrl?: string;
  category?: string;
  apiKey: string;
  modelId: string;
}

export interface AnalyzeProductOutput {
  subtitle?: string;
  description?: string;
  price?: number;
  original_price?: number;
  discount_label?: string;
  shop_name?: string;
  product_rating?: number;
  review_count?: number;
  sold_count?: number;
  tags?: string[];
  features?: { title: string; description?: string }[];
  specifications?: { name: string; value: string }[];
  badges?: { text: string; color?: string; bgColor?: string }[];
  currency?: string;
  error?: string;
}

export async function analyzeProduct(
  input: AnalyzeProductInput,
): Promise<AnalyzeProductOutput> {
  const client = new OpenRouter({
    apiKey: input.apiKey,
    appTitle: process.env.APP_NAME ?? "Snapland",
    appCategories: "product-analysis",
    httpReferer: process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost",
  });

  const textContent = `Analyze this product and return a JSON object with EXACTLY these fields:
- subtitle: catchy tagline max 100 chars
- description: compelling product description 200-400 words (no HTML)
- price: selling price as number (no currency symbol)
- original_price: original/before-discount price as number (null if no discount)
- discount_label: promo label e.g. "FLASH SALE", "DISKON 20%" (null if none)
- shop_name: seller or brand name if identifiable (null if unknown)
- product_rating: estimated rating 1.0-5.0 (null if not applicable)
- review_count: estimated review count as integer (0 if unknown)
- sold_count: estimated sold count as integer (0 if unknown)
- tags: array of 5-10 relevant search keyword tags (lowercase)
- features: array of {title, description} product benefits — 5-8 items
- specifications: array of {name, value} technical specs — 3-8 items (empty array if not applicable)
- badges: array of {text, color, bgColor} labels e.g. {"text":"Free Shipping","color":"#ffffff","bgColor":"#22c55e"}
- currency: ISO currency code e.g. "IDR", "USD"

Product Title: ${input.title}
${input.category ? `Category: ${input.category}` : ""}
${input.marketplaceUrl ? `Marketplace URL (reference only): ${input.marketplaceUrl}` : ""}

IMPORTANT: Return ONLY raw JSON — no markdown, no code block, no explanation.`;

  const userContent: ChatRequest["messages"][0]["content"][] = [
    { type: "text", text: textContent },
  ];

  if (input.imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${input.imageBase64}` },
    });
  } else if (input.imageUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: input.imageUrl },
    });
  }

  try {
    const response = await client.chat.send({
      chatRequest: {
        model: input.modelId,
        messages: [
          {
            role: "system",
            content:
              "You are an expert e-commerce product analyst. Analyze product information and return structured JSON data that will be used to populate a product listing. Be precise, market-aware, and focus on Indonesian/Asian e-commerce conventions when relevant.",
          },
          { role: "user", content: userContent },
        ],
        maxTokens: 2500,
        temperature: 0.4,
      },
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned) as AnalyzeProductOutput;
    } catch {
      return { error: "AI returned invalid JSON — please try again." };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI analysis failed";
    return { error: msg };
  }
}
