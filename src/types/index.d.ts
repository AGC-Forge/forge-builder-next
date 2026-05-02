declare global {
  // ── API / Server Action ───────────────────────────────────────────────────
  interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }

  interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    fieldErrors?: Record<string, string[]>;
  }

  type AIModelType =
    | "CLAUDE"
    | "OPENAI"
    | "GEMINI"
    | "DEEPSEEK"
    | "X-AI"
    | "OTHER";
  interface AIModelProvider {
    value: AIModelType;
    label: string;
    defaultModelId: string;
    models: Array<{
      value: string;
      label: string;
    }>;
  }

  type InputProductMode = "auto" | "manual";
  type LandingPageType = "linktree" | "website";

  type ProductCategoryKey =
    | "female-fashion"
    | "male-fashion"
    | "child-fashion"
    | "accessories"
    | "electronics"
    | "shoes"
    | "cosmetics"
    | "mobile"
    | "computers"
    | "digital-products"
    | "others";

  type ProductSubcategory = {
    value: string;
    label: string;
  };

  interface ImageRef {
    id: string;
    type: "upload" | "url";
    url: string;
    name: string;
    scope: "global" | "scene";
    sceneNum?: number;
    base64?: string;
    mediaType?: string;
    aiDescription?: string;
    status: "pending" | "analyzing" | "done" | "failed";
  }

  export type AnalyzeProductRequest = {
    base64?: string;
    mediaType?: string;
    url?: string;
    model: ModelType;
    modelId?: string;
    productName?: string;
    productCategory?: string;
  };

  export type AnalyzeProductResponse = {
    description?: string;
    error?: string;
  };
}

export {};
