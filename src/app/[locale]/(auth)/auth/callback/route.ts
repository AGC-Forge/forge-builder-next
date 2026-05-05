import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/url/public-url";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  if (token_hash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "recovery",
    });
    if (!error) {
      return NextResponse.redirect(getPublicUrl("/reset-password", request.headers));
    }
    return NextResponse.redirect(
      getPublicUrl("/forgot-password?error=link_expired", request.headers),
    );
  }

  if (token_hash && type === "email") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "email",
    });
    if (!error) {
      return NextResponse.redirect(getPublicUrl(next, request.headers));
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(getPublicUrl(next, request.headers));
    }
  }

  return NextResponse.redirect(
    getPublicUrl("/login?error=auth_callback_failed", request.headers),
  );
}
