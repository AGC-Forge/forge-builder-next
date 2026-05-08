"use server";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { getConfiguredPublicBaseUrl, getPublicUrl } from "@/lib/url/public-url";

function getAuthCallbackUrl(next = "/dashboard") {
  const baseUrl = getConfiguredPublicBaseUrl();
  if (!baseUrl) {
    if (process.env.NODE_ENV === "production") {
      const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snapland.agcforge.com";
      console.warn(`Using fallback URL: ${fallbackUrl}`);
      return `${fallbackUrl}/auth/confirm?next=${encodeURIComponent(next)}`;
    }
    throw new Error("NEXT_PUBLIC_APP_URL must be set to the public HTTPS URL");
  }

  const callbackUrl = getPublicUrl(
    `/auth/confirm?next=${encodeURIComponent(next)}`,
  ).toString();

  if (process.env.NODE_ENV === "production") {
    console.log("Auth callback URL:", callbackUrl);
  }
  return callbackUrl;
}

function forceOAuthRedirectTo(url: string, redirectTo: string) {
  const authUrl = new URL(url);
  authUrl.searchParams.set("redirect_to", redirectTo);

  const finalUrl = authUrl.toString();
  if (process.env.NODE_ENV === "production") {
    return finalUrl.replace(/:3000/g, "");
  }

  return finalUrl;
}

export async function getOAuthRedirectUrl(
  provider: "github" | "google",
  next = "/dashboard",
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient();
    const callbackUrl = getAuthCallbackUrl(next);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        queryParams: { access_type: "offline", prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return { success: false, error: error?.message ?? "Failed to get OAuth URL" };
    }
    return {
      success: true,
      data: { url: forceOAuthRedirectTo(data.url, callbackUrl) },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate OAuth",
    };
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: raw.email,
      password: raw.password,
    });
    if (authError) {
      return {
        success: false,
        message: "Login failed.",
        fieldErrors: {
          email: [authError.message],
        },
      };
    }
    return {
      success: true,
      message: "Login successful.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Login failed.",
      fieldErrors: {
        email: ["Login failed."],
      },
    };
  }
}
export async function registerAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const supabase = await createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: raw.email,
      password: raw.password,
      options: {
        emailRedirectTo: getAuthCallbackUrl("/dashboard"),
        data: {
          name: raw.name,
        },
      },
    });
    if (signUpError) {
      return {
        success: false,
        message: "Register failed.",
        fieldErrors: {
          email: [signUpError.message],
        },
      };
    }
    return {
      success: true,
      message: "Register successful.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Register failed.",
      fieldErrors: {
        email: ["Register failed."],
      },
    };
  }
}
export async function forgotAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
  };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const supabase = await createClient();
    const { error: forgotPasswordError } =
      await supabase.auth.resetPasswordForEmail(raw.email, {
        redirectTo: getAuthCallbackUrl("/reset-password"),
      });
    if (forgotPasswordError) {
      return {
        success: false,
        message: "Failed to send password reset email.",
        fieldErrors: {
          email: [forgotPasswordError.message],
        },
      };
    }
    return {
      success: true,
      message: "Password reset email sent.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send password reset email.",
      fieldErrors: {
        email: ["Failed to send password reset email."],
      },
    };
  }
}
export async function resetAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  try {
    const supabase = await createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: raw.token,
      type: "recovery",
    });

    if (verifyError) {
      return { success: false, message: "Invalid or expired token." };
    }

    const { error: resetPasswordError } = await supabase.auth.updateUser({
      password: raw.password,
    });
    if (resetPasswordError) {
      return {
        success: false,
        message: "Failed to reset password.",
        fieldErrors: {
          token: [resetPasswordError.message],
        },
      };
    }
    return {
      success: true,
      message: "Password reset successful.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to reset password.",
      fieldErrors: {
        token: ["Failed to reset password."],
      },
    };
  }
}
