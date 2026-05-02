"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import productsData from "./data.json";
import type { RecentProductRow } from "./recent-product-table/schema";
import { RecentProductsTable } from "./recent-product-table/table";

const products = productsData as RecentProductRow[];

export function ProductOverviewCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">18,426 products</CardTitle>
        <CardDescription>
          Recent product updates, analytics, and performance metrics.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <Download />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentProductsTable data={products} />
      </CardContent>
    </Card>
  );
}
