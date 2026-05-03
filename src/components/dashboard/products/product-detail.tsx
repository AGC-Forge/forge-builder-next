"use client";

import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types/database";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ProductDetail({ product }: { product: Product }) {
  const primaryImage =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
  const cat = product.category
    ? PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Images */}
      <div className="space-y-3 lg:col-span-1">
        <div className="overflow-hidden rounded-xl border bg-muted">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.title}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="aspect-square rounded-lg border object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Info */}
      <div className="space-y-4 lg:col-span-2">
        {/* Header */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {product.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="rounded px-2 py-0.5 text-xs font-medium"
                      style={{
                        color: badge.color ?? "#fff",
                        backgroundColor: badge.bgColor ?? "#6366f1",
                      }}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
                <h2 className="mt-1 text-xl font-semibold">{product.title}</h2>
                {product.subtitle && (
                  <p className="text-muted-foreground text-sm">
                    {product.subtitle}
                  </p>
                )}
              </div>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Separator className="my-3" />

            <div className="flex flex-wrap items-center gap-4">
              {product.price != null && (
                <div>
                  <p className="font-bold text-2xl text-primary">
                    {formatCurrency(product.price, {
                      currency: product.currency,
                    })}
                  </p>
                  {product.original_price &&
                    product.original_price > product.price && (
                      <p className="text-muted-foreground text-sm line-through">
                        {formatCurrency(product.original_price, {
                          currency: product.currency,
                        })}
                      </p>
                    )}
                </div>
              )}
              {product.discount_label && (
                <Badge variant="destructive">{product.discount_label}</Badge>
              )}
              {product.product_rating != null && (
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">
                    {product.product_rating.toFixed(1)}
                  </span>
                  {product.review_count > 0 && (
                    <span className="text-muted-foreground text-sm">
                      ({product.review_count.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}
              {product.sold_count > 0 && (
                <span className="text-muted-foreground text-sm">
                  {product.sold_count.toLocaleString()}+ sold
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.affiliate_url && (
                <Button asChild size="sm">
                  <Link href={product.affiliate_url} target="_blank">
                    <ExternalLink className="mr-1.5 size-4" />
                    Affiliate Link
                  </Link>
                </Button>
              )}
              {product.marketplace_url && (
                <Button asChild size="sm" variant="outline">
                  <Link href={product.marketplace_url} target="_blank">
                    <ExternalLink className="mr-1.5 size-4" />
                    Marketplace
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {cat && (
              <div>
                <p className="text-muted-foreground">Category</p>
                <p>
                  {cat.emoji} {cat.label}
                </p>
              </div>
            )}
            {product.shop_name && (
              <div>
                <p className="text-muted-foreground">Shop</p>
                <p>{product.shop_name}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Input Mode</p>
              <p className="capitalize">{product.input_mode}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Added</p>
              <p>{format(new Date(product.created_at), "dd MMM yyyy")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {product.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {product.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {product.features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <div>
                      <span className="font-medium">{f.title}</span>
                      {f.description && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {f.description}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Specs */}
        {product.specifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-muted/40" : ""}>
                      <td className="rounded-l py-1.5 pl-2 font-medium text-muted-foreground">
                        {spec.name}
                      </td>
                      <td className="rounded-r py-1.5 pr-2">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
