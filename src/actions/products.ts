"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/actions/activity-logs";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import type { Product, PaginatedResult } from "@/types/database";

export async function getProducts(opts: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
} = {}): Promise<ActionResult<PaginatedResult<Product>>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { page = 1, pageSize = 20, search, category, isActive } = opts;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) query = query.ilike("title", `%${search}%`);
    if (category) query = query.eq("category", category);
    if (isActive !== undefined) query = query.eq("is_active", isActive);

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        data: data as Product[],
        count: count ?? 0,
        page,
        pageSize,
        pageCount: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch (err) {
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProduct(
  id: string,
): Promise<ActionResult<Product>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Product };
  } catch {
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult<Product>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Check quota
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("max_products")
      .eq("id", user.id)
      .single();

    if (count !== null && profile && count >= profile.max_products) {
      return {
        success: false,
        error: `Product limit reached (${profile.max_products}). Contact admin to increase.`,
      };
    }

    const { data, error } = await supabase
      .from("products")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/products");

    await logActivity("product.created", {
      resource: "product",
      resourceId: data.id,
      metadata: { title: data.title },
    });

    return { success: true, data: data as Product, message: "Product created." };
  } catch (err) {
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<ActionResult<Product>> {
  const parsed = productSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("products")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${id}`);

    await logActivity("product.updated", {
      resource: "product",
      resourceId: id,
    });

    return { success: true, data: data as Product, message: "Product updated." };
  } catch {
    return { success: false, error: "Failed to update product" };
  }
}

export async function toggleProductStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/products");
    return { success: true, message: `Product ${isActive ? "activated" : "deactivated"}.` };
  } catch {
    return { success: false, error: "Failed to update product status" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/products");

    await logActivity("product.deleted", {
      resource: "product",
      resourceId: id,
    });

    return { success: true, message: "Product deleted." };
  } catch {
    return { success: false, error: "Failed to delete product" };
  }
}

export async function getActiveProducts(): Promise<ActionResult<Product[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("products")
      .select("id, title, subtitle, price, currency, images, is_active, category")
      .eq("is_active", true)
      .order("title");

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Product[] };
  } catch {
    return { success: false, error: "Failed to fetch products" };
  }
}
