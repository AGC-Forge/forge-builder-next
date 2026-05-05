"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItem {
  product_id?: string;
  title: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  province?: string;
  postal_code?: string;
}

export interface Order {
  id: string;
  user_id: string;
  landing_page_id: string | null;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  payment_method: string | null;
  payment_proof_url: string | null;
  payment_status: PaymentStatus;
  status: OrderStatus;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  landing_page?: { title: string; slug: string } | null;
}

export interface CreateOrderInput {
  landing_page_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost?: number;
  total_amount: number;
  payment_method?: string;
  notes?: string;
}

/**
 * Get paginated orders (dashboard).
 * @param opts Optional query parameters.
 * @returns Action result.
 * */
export async function getOrders(opts: {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
  landing_page_id?: string;
} = {}): Promise<ActionResult<{ data: Order[]; count: number; pageCount: number }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { page = 1, pageSize = 20, status, search, landing_page_id } = opts;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("orders")
      .select(`
        *,
        landing_page:landing_pages(title, slug)
      `, { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);
    if (landing_page_id) query = query.eq("landing_page_id", landing_page_id);
    if (search) query = query.or(
      `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`,
    );

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        data: (data ?? []) as Order[],
        count: count ?? 0,
        pageCount: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get single order.
 * @param id Order ID.
 * @returns Action result.
 * */
export async function getOrder(id: string): Promise<ActionResult<Order>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("orders")
      .select(`*, landing_page:landing_pages(title, slug)`)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Order };
  } catch {
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Create order (called from public LP checkout).
 * @param input Order input data.
 * @returns Action result.
 * */
export async function createOrder(input: CreateOrderInput & { user_id: string }): Promise<ActionResult<Order>> {
  try {
    const supabase = createAdminClient(); // Use admin for public checkout

    if (!input.customer_name?.trim()) return { success: false, error: "Name is required." };
    if (!input.customer_phone?.trim()) return { success: false, error: "Phone is required." };
    if (!input.items?.length) return { success: false, error: "Order items required." };

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: input.user_id,
        landing_page_id: input.landing_page_id ?? null,
        customer_name: input.customer_name.trim(),
        customer_phone: input.customer_phone.trim(),
        customer_email: input.customer_email?.trim() ?? null,
        shipping_address: input.shipping_address,
        items: input.items,
        subtotal: input.subtotal,
        shipping_cost: input.shipping_cost ?? 0,
        total_amount: input.total_amount,
        payment_method: input.payment_method ?? null,
        notes: input.notes?.trim() ?? null,
        status: "pending",
        payment_status: "unpaid",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as unknown as Order, message: "Order placed successfully!" };
  } catch {
    return { success: false, error: "Failed to create order" };
  }
}

/**
 * Update order status.
 * @param id Order ID.
 * @param status New order status.
 * @param notes Optional notes.
 * @returns Action result.
 * */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  notes?: string,
): Promise<ActionResult<Order>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const updates: Record<string, unknown> = { status };
    if (notes) updates.notes = notes;
    if (status === "completed") updates.payment_status = "paid";
    if (status === "cancelled") updates.payment_status = "unpaid";

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
    return { success: true, data: data as Order, message: `Order ${status}.` };
  } catch {
    return { success: false, error: "Failed to update order" };
  }
}

/**
 * Confirm payment for an order.
 * @param id Order ID.
 * @param proofUrl Optional payment proof URL.
 * @returns Action result.
 * */
export async function confirmOrderPayment(
  id: string,
  proofUrl?: string,
): Promise<ActionResult<Order>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_proof_url: proofUrl ?? null,
        status: "processing",
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/orders");
    return { success: true, data: data as Order, message: "Payment confirmed." };
  } catch {
    return { success: false, error: "Failed to confirm payment" };
  }
}

/**
 * Delete   an order.
 * @param id Order ID.
 * @returns Action result.
 * */
export async function deleteOrder(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/orders");
    return { success: true, message: "Order deleted." };
  } catch {
    return { success: false, error: "Failed to delete order" };
  }
}

/**
 * Get order stats.
 * @returns Action result.
 * */
export async function getOrderStats(): Promise<ActionResult<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  todayRevenue: number;
}>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from("orders")
      .select("status, total_amount, created_at")
      .eq("user_id", user.id);

    const all = orders ?? [];
    const todayOrders = all.filter(o => new Date(o.created_at) >= todayStart);

    return {
      success: true,
      data: {
        total: all.length,
        pending: all.filter(o => o.status === "pending").length,
        processing: all.filter(o => o.status === "processing").length,
        completed: all.filter(o => o.status === "completed").length,
        cancelled: all.filter(o => o.status === "cancelled").length,
        totalRevenue: all.filter(o => o.status === "completed").reduce((s, o) => s + (o.total_amount || 0), 0),
        todayRevenue: todayOrders.filter(o => o.status === "completed").reduce((s, o) => s + (o.total_amount || 0), 0),
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch order stats" };
  }
}

/**
 * Export orders CSV.
 * @returns Action result.
 * */
export async function exportOrdersCSV(): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5000);

    const lines = [
      "Order Number,Date,Customer,Phone,Status,Payment Status,Total,Notes",
      ...(data ?? []).map(o =>
        `"${o.order_number}","${new Date(o.created_at).toLocaleDateString("id-ID")}","${o.customer_name}","${o.customer_phone}","${o.status}","${o.payment_status}",${o.total_amount},"${o.notes ?? ""}"`,
      ),
    ];

    return { success: true, data: lines.join("\n") };
  } catch {
    return { success: false, error: "Failed to export orders" };
  }
}
