import { MousePointerClick, Package } from "lucide-react";
import type { TopProduct } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopProductsTable({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Package className="size-9 mb-2 opacity-30" />
            <p className="text-sm">No product clicks yet for this period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const max = products[0]?.click_count ?? 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MousePointerClick className="size-4" />
          Top Products by Clicks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((p, i) => {
          const thumb =
            p.images.find((img) => img.is_primary)?.url ?? p.images[0]?.url;
          const pct = Math.round((p.click_count / max) * 100);

          return (
            <div key={p.id} className="flex items-center gap-3">
              {/* Rank */}
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                {i + 1}
              </span>

              {/* Thumbnail */}
              <div className="size-9 shrink-0 overflow-hidden rounded-md border bg-muted">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={p.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <Package className="size-full p-1.5 text-muted-foreground/40" />
                )}
              </div>

              {/* Title + bar */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Count */}
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {p.click_count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
