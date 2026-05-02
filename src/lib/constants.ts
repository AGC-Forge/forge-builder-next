export const PRODUCT_CATEGORIES: Record<
  ProductCategoryKey,
  {
    label: string;
    emoji: string;
    isFashion: boolean;
    subcategories: ProductSubcategory[];
  }
> = {
  "female-fashion": {
    label: "Female Fashion",
    emoji: "👗",
    isFashion: true,
    subcategories: [
      { value: "clothes", label: "Clothes / Tops" },
      { value: "pants", label: "Pants" },
      { value: "one-set", label: "One Set (Clothes & Pants)" },
      { value: "bag", label: "Bag" },
      { value: "sandals", label: "Sandals" },
      { value: "hijab", label: "Hijab / Hijab" },
      { value: "gamis", label: "Gamis / Muslim Dress" },
      { value: "shirt", label: "Women's Shirt" },
      { value: "skirt", label: "Skirt / Skirt" },
      { value: "dress", label: "Dress / Gown" },
      { value: "cardigan", label: "Cardigan / Outerwear" },
      { value: "other", label: "Other" },
    ],
  },
  "male-fashion": {
    label: "Male Fashion",
    emoji: "👕",
    isFashion: true,
    subcategories: [
      { value: "shirt", label: "shirt / t-shirt" },
      { value: "pants", label: "pants" },
      { value: "one-set", label: "One Set (Shirt & Pants)" },
      { value: "bag", label: "bag / backpack" },
      { value: "sandal", label: "sandal" },
      { value: "muslim-clothes", label: "koko / muslim shirt" },
      { value: "shirt", label: "men's shirt" },
      { value: "jacket", label: "jacket / hoodie" },
      { value: "polo", label: "polo shirt" },
      { value: "formal-suit", label: "formal suit / suit" },
      { value: "other", label: "other" },
    ],
  },
  "child-fashion": {
    label: "Child Fashion",
    emoji: "🧒",
    isFashion: true,
    subcategories: [
      { value: "clothes", label: "Children's Clothes" },
      { value: "pants", label: "Children's Pants" },
      { value: "one-set", label: "Children's One Set" },
      { value: "dress", label: "Children's Dress / Skirt" },
      { value: "uniform", label: "School Uniform" },
      { value: "pajamas", label: "Pajamas / Sleepwear" },
      { value: "baby", label: "Baby Clothes" },
      { value: "other", label: "Other" },
    ],
  },
  accessories: {
    label: "Accessories",
    emoji: "⌚",
    isFashion: true,
    subcategories: [
      { value: "hat", label: "hat / cap" },
      { value: "watch", label: "watch" },
      { value: "belt", label: "belt" },
      { value: "glasses", label: "glasses" },
      { value: "bracelet", label: "bracelet / bracelet" },
      { value: "necklace", label: "necklace" },
      { value: "ring", label: "ring" },
      { value: "wallet", label: "wallet" },
      { value: "scarf", label: "scarf / scarf" },
      { value: "other", label: "other" },
    ],
  },
  electronics: {
    label: "Electronics",
    emoji: "🔊",
    isFashion: false,
    subcategories: [
      { value: "speaker", label: "Bluetooth Speaker" },
      { value: "headset", label: "Headset / Earphone" },
      { value: "television", label: "Television / Smart TV" },
      { value: "power bank", label: "Power bank" },
      { value: "audio", label: "Audio Device" },
      { value: "fan", label: "Fan / Portable AC" },
      { value: "lamp", label: "Lamp / Smart Light" },
      { value: "camera", label: "Camera / Action Cam" },
      { value: "drone", label: "Drone" },
      { value: "robot", label: "Robot / Smart Device" },
      { value: "other", label: "Other" },
    ],
  },
  shoes: {
    label: "Shoes & Footwear",
    emoji: "👟",
    isFashion: true,
    subcategories: [
      { value: "sneakers", label: "Sneakers" },
      { value: "formal", label: "Formal Shoes / Loafers" },
      { value: "boot", label: "Boot / Ankle Boot" },
      { value: "heels", label: "High Heels" },
      { value: "flat", label: "Flat Shoes" },
      { value: "sports", label: "Sports Shoes" },
      { value: "flip-flops", label: "Sandals / Slippers" },
      { value: "other", label: "Other" },
    ],
  },
  cosmetics: {
    label: "Cosmetics & Skincare",
    emoji: "💄",
    isFashion: false,
    subcategories: [
      { value: "lipstick", label: "Lipstick / Lip Cream" },
      { value: "foundation", label: "Foundation / BB Cream" },
      { value: "skincare", label: "Skincare / Serum" },
      { value: "perfume", label: "Perfume / Body Mist" },
      { value: "mascara", label: "Mascara / Eye Shadow" },
      { value: "blush", label: "Blush On / Highlighter" },
      { value: "soap", label: "Soap / Body Wash" },
      { value: "shampoo", label: "Shampoo / Conditioner" },
      { value: "sunscreen", label: "Sunscreen / SPF" },
      { value: "other", label: "Other" },
    ],
  },
  mobile: {
    label: "Handphone & Accessories",
    emoji: "📱",
    isFashion: false,
    subcategories: [
      { value: "smartphone", label: "Smartphone / HP" },
      { value: "case", label: "Case / Cover HP" },
      { value: "charger", label: "Charger / Data Cable" },
      { value: "screen-protector", label: "Screen Protector / Tempered Glass" },
      { value: "holder", label: "HP Holder / Stand" },
      { value: "ring-light", label: "Ring Light / Lighting Selfie" },
      { value: "other", label: "Other" },
    ],
  },
  computers: {
    label: "Computers & Accessories",
    emoji: "💻",
    isFashion: false,
    subcategories: [
      { value: "laptop", label: "Laptop / Notebook" },
      { value: "pc", label: "Desktop PC" },
      { value: "monitor", label: "Monitor / Display" },
      { value: "keyboard", label: "Keyboard / Mouse" },
      { value: "webcam", label: "Webcam / PC Headset" },
      { value: "hard disk", label: "Hard disk / SSD" },
      { value: "cooling", label: "Cooling Pad / Fan" },
      { value: "laptop-bag", label: "Laptop Bag / Sleeve" },
      { value: "other", label: "Other" },
    ],
  },
  "digital-products": {
    label: "Digital Products & Services",
    emoji: "📦",
    isFashion: false,
    subcategories: [
      { value: "social-account", label: "Social Account" },
      { value: "social-follow", label: "Social Follow" },
    ],
  },
  others: {
    label: "Others",
    emoji: "📦",
    isFashion: false,
    subcategories: [
      { value: "food-drink", label: "Food & Drink" },
      { value: "health", label: "Health Products" },
      { value: "sports", label: "Sports Equipment" },
      { value: "toys", label: "Toys / Hobbies" },
      { value: "home-wares", label: "Household Equipment" },
      { value: "plants", label: "Plants & Gardening" },
      { value: "pets", label: "Pet Products" },
      { value: "books", label: "Books & Stationery" },
      { value: "others", label: "Others" },
    ],
  },
};
export const AI_MODELS_PROVIDER: AIModelProvider[] = [
  {
    value: "CLAUDE",
    label: "Claude (Anthropic)",
    defaultModelId: "claude-sonnet-4-20250514",
    models: [
      { value: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
      { value: "anthropic/claude-opus-4.6", label: "Claude Opus 4.6" },
      { value: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5" },
      { value: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
      { value: "anthropic/claude-opus-4.7", label: "Claude Opus 4.7" },
      { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
      { value: "anthropic/claude-opus-4.5", label: "Claude Opus 4.5" },
    ],
  },
  {
    value: "OPENAI",
    label: "OpenAI",
    defaultModelId: "gpt-5.4-mini",
    models: [
      { value: "openai/gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
      { value: "openai/gpt-5-mini", label: "OpenAI GPT-5 Mini" },
      { value: "openai/gpt-4.1-mini", label: "OpenAI GPT-4.1 Mini" },
      { value: "openai/gpt-5.4-mini", label: "OpenAI GPT-5.4 Mini" },
      { value: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B (Free)" },
      { value: "openai/gpt-5-chat", label: "GPT-5 Chat" },
      { value: "openai/gpt-5.3-codex", label: "GPT-5.3 Codex" },
    ],
  },
  {
    value: "GEMINI",
    label: "Google Gemini",
    defaultModelId: "gemini-2.5-flash",
    models: [
      { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
      { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      {
        value: "google/gemini-2.5-flash-lite-preview-09-2025",
        label: "Gemini 2.5 Flash Lite Preview",
      },
      {
        value: "google/gemini-3-flash-preview",
        label: "Gemini 3 Flash Preview",
      },
      {
        value: "google/gemini-3.1-flash-lite-preview",
        label: "Gemini 3.1 Flash Lite Preview",
      },
    ],
  },
  {
    value: "X-AI",
    label: "X-AI",
    defaultModelId: "x-ai/grok-4.1-fast",
    models: [
      { value: "x-ai/grok-4.1-fast", label: "Grok 4.1 Fast" },
      { value: "x-ai/grok-4-fast", label: "Grok 4 Fast" },
      { value: "x-ai/grok-4.20", label: "Grok 4.20" },
      { value: "x-ai/grok-code-fast-1", label: "Grok Code Fast" },
      { value: "x-ai/grok-4", label: "Grok 4" },
      { value: "x-ai/grok-3-mini", label: "Grok 3 Mini" },
      { value: "x-ai/grok-4.20-multi-agent", label: "Grok 4.20 Multi-Agent" },
      { value: "x-ai/grok-3", label: "Grok 3" },
      { value: "x-ai/grok-3-mini-beta", label: "Grok 3 Mini Beta" },
      { value: "x-ai/grok-3-beta", label: "Grok 3 Beta" },
      {
        value: "x-ai/grok-4.20-multi-agent-beta",
        label: "Grok 4.20 Multi-Agent Beta",
      },
      { value: "x-ai/grok-4.20-beta", label: "Grok 4.20 Beta" },
    ],
  },
  {
    value: "DEEPSEEK",
    label: "DeepSeek",
    defaultModelId: "deepseek/deepseek-v3.2",
    models: [
      { value: "deepseek/deepseek-v3.2", label: "DeepSeek V3.2" },
      { value: "deepseek/deepseek-chat-v3-0324", label: "DeepSeek Chat V3" },
      { value: "deepseek/deepseek-chat-v3.1", label: "DeepSeek Chat V3.1" },
      {
        value: "deepseek/deepseek-v3.1-terminus",
        label: "DeepSeek V3.1 Terminus",
      },
      { value: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
      {
        value: "deepseek/deepseek-v3.2-speciale",
        label: "DeepSeek V3.2 Speciale",
      },
    ],
  },
  {
    value: "OTHER",
    label: "Auto (Best Available)",
    defaultModelId: "openrouter/auto",
    models: [{ value: "openrouter/auto", label: "Auto (Best Available)" }],
  },
];

export function getProviderInfo(provider: string) {
  return (
    AI_MODELS_PROVIDER.find((p) => p.value === provider) ??
    AI_MODELS_PROVIDER[0]
  );
}

export function getProviderLabel(provider: string) {
  return getProviderInfo(provider)?.label ?? String(provider);
}

export function getDefaultModelId(provider: string) {
  return getProviderInfo(provider)?.defaultModelId ?? "";
}

export function getModelOptions(provider: string) {
  const p = getProviderInfo(provider);
  return p?.models ?? [];
}
