"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { forgotAction } from "@/actions/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { MailIcon, CheckCircleIcon } from "lucide-react";

export function ForgotForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [submittedEmail, setSubmittedEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSuccessMessage(null);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      const result = await forgotAction(formData);
      if (result.success) {
        setSubmittedEmail(data.email);
        setSuccessMessage(
          result?.message || "Password reset email sent successfully.",
        );
      } else {
        toast.error(result.message || "Failed to send password reset email.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send password reset email.",
      );
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {successMessage && (
        <Alert className="max-w-md border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50">
          <CheckCircleIcon />
          <AlertTitle>{successMessage}</AlertTitle>
          <AlertDescription>
            If <span className="text-white font-medium">{submittedEmail}</span>{" "}
            is registered with us, we have sent a link to reset your password.
            Link expires in 1 hour.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </AlertAction>
        </Alert>
      )}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we will send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup className="w-full py-4">
                  <InputGroupInput
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="ps-9 pe-10"
                    disabled={isSubmitting}
                  />
                  <InputGroupAddon>
                    <MailIcon className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>
              <Field>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Send Password Reset Email"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?, Back to{" "}
                  <Link href="/login">Log in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
