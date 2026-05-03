"use server";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

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
      await supabase.auth.resetPasswordForEmail(raw.email);
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
