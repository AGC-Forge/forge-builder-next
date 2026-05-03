import Link from "next/link";
import { Eye, MousePointerClick, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Page {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  click_count: number;
  is_published: boolean;
}

export function TopPagesTable({ pages }: { pages: Page[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Landing Pages</CardTitle>
        <CardDescription>Ranked by total views</CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            No landing pages yet.
          </p>
        ) : (
          <div className="space-y-2">
            {pages.map((page, i) => {
              const ctr =
                page.view_count > 0
                  ? ((page.click_count / page.view_count) * 100).toFixed(1)
                  : "0.0";
              return (
                <div
                  key={page.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="w-5 shrink-0 text-center text-muted-foreground text-sm font-medium">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{page.title}</p>
                      <Badge
                        variant={page.is_published ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {page.is_published ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="size-3.5" />
                      {page.view_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MousePointerClick className="size-3.5" />
                      {page.click_count.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs">{ctr}%</span>
                    <Link
                      href={`/dashboard/landing-page/${page.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
