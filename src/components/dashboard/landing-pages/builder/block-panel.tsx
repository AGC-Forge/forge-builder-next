"use client";

import { nanoid } from "nanoid";
import {
  ImageIcon,
  Layout,
  MessageSquare,
  MousePointerClick,
  Share2,
  Minus,
  Clock,
  Star,
  HelpCircle,
  Code2,
  AlignJustify,
  Grid2X2,
  ShoppingCart,
  List,
  Video,
} from "lucide-react";
import type { LandingBlock, BlockType, Product } from "@/types/database";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlockDef {
  type: BlockType;
  label: string;
  icon: React.ElementType;
  defaultContent: Record<string, unknown>;
}

const BLOCK_DEFS: BlockDef[] = [
  {
    type: "hero",
    label: "Hero",
    icon: Layout,
    defaultContent: {
      headline: "Your Headline Here",
      subheadline: "A compelling subheadline that describes your product.",
      ctaText: "Shop Now",
      ctaUrl: "",
      backgroundImageUrl: "",
    },
  },
  {
    type: "product-single",
    label: "Product Card",
    icon: ShoppingCart,
    defaultContent: { productId: null, showRating: true, showBadges: true },
  },
  {
    type: "product-grid",
    label: "Product Grid",
    icon: Grid2X2,
    defaultContent: {
      productIds: [],
      columns: 2,
      showPrice: true,
      showRating: true,
    },
  },
  {
    type: "product-list",
    label: "Product List",
    icon: List,
    defaultContent: { productIds: [], showPrice: true, showRating: true },
  },
  {
    type: "text",
    label: "Text",
    icon: MessageSquare,
    defaultContent: { text: "Add your text content here…" },
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    defaultContent: { url: "", alt: "", link: "" },
  },
  {
    type: "video",
    label: "Video",
    icon: Video,
    defaultContent: {
      platform: "youtube",
      url: "",
      videoId: "",
      caption: "",
      autoplay: false,
    },
  },
  {
    type: "cta-button",
    label: "CTA Button",
    icon: MousePointerClick,
    defaultContent: {
      text: "Click Here",
      url: "",
      style: "filled",
      size: "lg",
    },
  },
  {
    type: "social-links",
    label: "Social Links",
    icon: Share2,
    defaultContent: {
      links: [
        { platform: "instagram", url: "", label: "Instagram" },
        { platform: "tiktok", url: "", label: "TikTok" },
      ],
    },
  },
  {
    type: "divider",
    label: "Divider",
    icon: Minus,
    defaultContent: { style: "solid", color: "#e2e8f0" },
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: AlignJustify,
    defaultContent: { height: 32 },
  },
  {
    type: "countdown",
    label: "Countdown",
    icon: Clock,
    defaultContent: {
      targetDate: "",
      label: "Offer ends in:",
      showDays: true,
    },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    icon: Star,
    defaultContent: {
      items: [{ name: "Customer Name", text: "Great product!", rating: 5 }],
    },
  },
  {
    type: "faq",
    label: "FAQ",
    icon: HelpCircle,
    defaultContent: {
      items: [{ question: "How does it work?", answer: "It works great!" }],
    },
  },
  {
    type: "custom-html",
    label: "Custom HTML",
    icon: Code2,
    defaultContent: { html: "<!-- your HTML here -->" },
  },
];

interface Props {
  onAddBlock: (block: LandingBlock) => void;
  availableProducts: Product[];
}

export function BlockPanel({ onAddBlock }: Props) {
  function handleAdd(def: BlockDef) {
    const block: LandingBlock = {
      id: nanoid(10),
      type: def.type,
      visible: true,
      settings: {},
      content: def.defaultContent,
    };
    onAddBlock(block);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <p className="font-medium text-sm">Add Blocks</p>
        <p className="text-muted-foreground text-xs">Click to add to canvas</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-1.5 p-3">
          {BLOCK_DEFS.map((def) => (
            <Button
              key={def.type}
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3 text-center"
              onClick={() => handleAdd(def)}
            >
              <def.icon className="size-5 text-muted-foreground" />
              <span className="text-xs">{def.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
