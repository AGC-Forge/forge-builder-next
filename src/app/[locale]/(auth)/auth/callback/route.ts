import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const redirectTo = searchParams.get("redirectTo") ?? "/login";

  const supabase = await createClient();

  if (token_hash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "recovery",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
    return NextResponse.redirect(
      `${origin}/forgot-password?error=link_expired`,
    );
  }

  if (token_hash && type === "email") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "email",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
