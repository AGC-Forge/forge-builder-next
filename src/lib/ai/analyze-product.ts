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

type TextPart = { type: "text"; text: string };
type ImageUrlPart = { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };
type ContentPart = TextPart | ImageUrlPart;

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

export async function analyzeProduct(
  input: AnalyzeProductInput,
): Promise<AnalyzeProductOutput> {
  const prompt = buildPrompt(input);

  // Build content parts for user message
  const userParts: ContentPart[] = [{ type: "text", text: prompt }];

  // Attach image if provided — only for vision-capable models
  const isVisionModel = isModelVisionCapable(input.modelId);

  if (isVisionModel) {
    if (input.imageBase64) {
      userParts.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${input.imageBase64}`,
          detail: "auto",
        },
      });
    } else if (input.imageUrl) {
      userParts.push({
        type: "image_url",
        image_url: { url: input.imageUrl, detail: "auto" },
      });
    }
  }

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content:
        "You are an expert e-commerce product analyst. Analyze product information and return structured JSON data for a product listing. Be precise, market-aware, and focus on Indonesian/Asian e-commerce conventions when relevant.",
    },
    {
      role: "user",
      // If no image → send plain string (wider model support)
      // If image → send array of content parts
      content: userParts.length === 1 ? prompt : userParts,
    },
  ];

  const body: OpenAIRequest = {
    model: input.modelId,
    messages,
    max_tokens: 2500,
    temperature: 0.4,
  };

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost",
        "X-Title": process.env.APP_NAME ?? "SnapLand",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg =
        errJson?.error?.message ??
        errJson?.message ??
        `OpenRouter error: HTTP ${res.status}`;
      return { error: msg };
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";

    if (!raw) {
      return { error: "AI returned empty response — please try again." };
    }

    // Strip markdown code block if model wrapped it
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned) as AnalyzeProductOutput;
    } catch {
      // Try to extract JSON substring
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as AnalyzeProductOutput;
        } catch {
          // fall through
        }
      }
      return { error: "AI returned invalid JSON. Try again or switch model." };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI analysis failed";
    return { error: msg };
  }
}

function buildPrompt(input: AnalyzeProductInput): string {
  return `Analyze this product and return a JSON object with EXACTLY these fields:
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
 
Product Title: ${input.title}${input.category ? `\nCategory: ${input.category}` : ""}${input.marketplaceUrl ? `\nMarketplace URL (reference only, do not scrape): ${input.marketplaceUrl}` : ""}
 
IMPORTANT: Return ONLY raw JSON — no markdown, no code block, no explanation.`;
}

/**
 * Returns true if the model is known to support image/vision input.
 * Text-only models get plain string content instead of array content parts
 * to avoid API validation errors on models that don't accept multimodal input.
 */
function isModelVisionCapable(modelId: string): boolean {
  const visionPatterns = [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4-vision",
    "claude-3",
    "claude-4",
    "gemini",
    "llava",
    "pixtral",
    "mistral-large",
    "qwen-vl",
    "qwen2-vl",
    "grok-vision",
    "grok-2-vision",
    "nova",
  ];
  const lower = modelId.toLowerCase();
  return visionPatterns.some((p) => lower.includes(p));
}