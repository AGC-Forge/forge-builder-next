import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (claimsData?.claims) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");

  return NextResponse.redirect(new URL(`/${locale}/login`, req.url), { status: 302 });
}
