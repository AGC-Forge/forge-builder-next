import z from "zod";

export const recentProductsSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    plan: z.string(),
    status: z.string(),
    billing: z.string(),
    joined: z.string(),
});

export type RecentProductRow = z.infer<typeof recentProductsSchema>;
