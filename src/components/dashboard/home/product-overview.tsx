import Link from "next/link";
import { ExternalLink, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/types/database";

export function ProductOverviewCard({ products }: { products: Product[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Recent Products</CardTitle>
        <CardDescription>Latest products added to your store.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">View all</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No products yet.</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/dashboard/products/new">Add first product</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/15">
                <TableRow>
                  <TableHead className="h-10 p-3">Product</TableHead>
                  <TableHead className="h-10 p-3">Category</TableHead>
                  <TableHead className="h-10 p-3">Price</TableHead>
                  <TableHead className="h-10 p-3">Status</TableHead>
                  <TableHead className="h-10 w-10 p-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const thumb =
                    product.images.find((i) => i.is_primary)?.url ??
                    product.images[0]?.url;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt={product.title}
                              className="size-9 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                              <Package className="size-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="max-w-[200px] truncate font-medium text-sm">
                            {product.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 text-muted-foreground text-sm">
                        {product.category ?? "—"}
                      </TableCell>
                      <TableCell className="p-3 font-medium text-sm">
                        {product.price != null
                          ? formatCurrency(product.price, { currency: product.currency })
                          : "—"}
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge
                          variant={product.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3">
                        <Button variant="ghost" size="icon" className="size-7" asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
