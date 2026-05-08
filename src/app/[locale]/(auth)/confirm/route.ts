import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  const supabase = await createClient();

  if (token_hash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "recovery",
    });
    if (!error) {
      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }
    return NextResponse.redirect("/forgot-password?error=link_expired");
  }

  if (token_hash && type === "email") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "email",
    });
    if (!error) {
      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.searchParams.delete('next')
  return NextResponse.redirect("/login?error=auth_callback_failed")
}
