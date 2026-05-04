"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { registerAction, getOAuthRedirectUrl } from "@/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
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
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  User2Icon,
  CheckCircleIcon,
} from "lucide-react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const locale = useLocale();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSocialLogin = async (provider: "github" | "google") => {
    setIsSocialLoading(provider);
    try {
      const result = await getOAuthRedirectUrl(provider, "/dashboard");
      if (result.success && result.data) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error ?? `Failed to register with ${provider}`);
        setIsSocialLoading(null);
      }
    } catch {
      toast.error(`Failed to register with ${provider}`);
      setIsSocialLoading(null);
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsSuccess(false);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      const result = await registerAction(formData);
      if (result.success) {
        toast.success(result.message);
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          router.push("/login?registered=true");
        }, 5000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Register failed.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {isSuccess && (
        <Alert className="max-w-md border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50">
          <CheckCircleIcon />
          <AlertTitle>Registration successful.</AlertTitle>
          <AlertDescription>
            We have sent a verification link to your email. Please check your
            inbox and click the link to verify your email address. You will be
            redirected to login page shortly.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Register</CardTitle>
          <CardDescription>Create a Free Account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  disabled={isSubmitting || isSocialLoading !== null}
                  onClick={() => handleSocialLogin("github")}
                >
                  {isSocialLoading === "github" ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="256"
                        height="250"
                        viewBox="0 0 256 250"
                      >
                        <path
                          fill="#fffffe"
                          d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46c6.397 1.185 8.746-2.777 8.746-6.158c0-3.052-.12-13.135-.174-23.83c-35.61 7.742-43.124-15.103-43.124-15.103c-5.823-14.795-14.213-18.73-14.213-18.73c-11.613-7.944.876-7.78.876-7.78c12.853.902 19.621 13.19 19.621 13.19c11.417 19.568 29.945 13.911 37.249 10.64c1.149-8.272 4.466-13.92 8.127-17.116c-28.431-3.236-58.318-14.212-58.318-63.258c0-13.975 5-25.394 13.188-34.358c-1.329-3.224-5.71-16.242 1.24-33.874c0 0 10.749-3.44 35.21 13.121c10.21-2.836 21.16-4.258 32.038-4.307c10.878.049 21.837 1.47 32.066 4.307c24.431-16.56 35.165-13.12 35.165-13.12c6.967 17.63 2.584 30.65 1.255 33.873c8.207 8.964 13.173 20.383 13.173 34.358c0 49.163-29.944 59.988-58.447 63.157c4.591 3.972 8.682 11.762 8.682 23.704c0 17.126-.148 30.91-.148 35.126c0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002C256 57.307 198.691 0 128.001 0m-80.06 182.34c-.282.636-1.283.827-2.194.39c-.929-.417-1.45-1.284-1.15-1.922c.276-.655 1.279-.838 2.205-.399c.93.418 1.46 1.293 1.139 1.931m6.296 5.618c-.61.566-1.804.303-2.614-.591c-.837-.892-.994-2.086-.375-2.66c.63-.566 1.787-.301 2.626.591c.838.903 1 2.088.363 2.66m4.32 7.188c-.785.545-2.067.034-2.86-1.104c-.784-1.138-.784-2.503.017-3.05c.795-.547 2.058-.055 2.861 1.075c.782 1.157.782 2.522-.019 3.08m7.304 8.325c-.701.774-2.196.566-3.29-.49c-1.119-1.032-1.43-2.496-.726-3.27c.71-.776 2.213-.558 3.315.49c1.11 1.03 1.45 2.505.701 3.27m9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033c-1.448-.439-2.395-1.613-2.103-2.626c.301-1.01 1.747-1.484 3.207-1.028c1.446.436 2.396 1.602 2.095 2.622m10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95c-1.53.034-2.769-.82-2.786-1.86c0-1.065 1.202-1.932 2.733-1.958c1.522-.03 2.768.818 2.768 1.868m10.555-.405c.182 1.03-.875 2.088-2.387 2.37c-1.485.271-2.861-.365-3.05-1.386c-.184-1.056.893-2.114 2.376-2.387c1.514-.263 2.868.356 3.061 1.403"
                        />
                      </svg>
                      Sign up with GitHub
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  disabled={isSubmitting || isSocialLoading !== null}
                  onClick={() => handleSocialLogin("google")}
                >
                  {isSocialLoading === "google" ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="256"
                        height="262"
                        viewBox="0 0 256 262"
                      >
                        <path
                          fill="#4285f4"
                          d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                        />
                        <path
                          fill="#34a853"
                          d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                        />
                        <path
                          fill="#fbbc05"
                          d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                        />
                        <path
                          fill="#eb4335"
                          d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                        />
                      </svg>
                      Sign up with Google
                    </>
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with your email
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <InputGroup className="w-full py-4">
                  <InputGroupInput
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register("name")}
                    className="ps-9 pe-10"
                    disabled={isSubmitting || isSocialLoading !== null}
                  />
                  <InputGroupAddon>
                    <User2Icon className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup className="w-full py-4">
                  <InputGroupInput
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="ps-9 pe-10"
                    disabled={isSubmitting || isSocialLoading !== null}
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup className="w-full py-4">
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="ps-9 pe-10"
                    placeholder="Your password"
                    disabled={isSubmitting || isSocialLoading !== null}
                  />
                  <InputGroupAddon>
                    <LockIcon className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      disabled={isSubmitting || isSocialLoading !== null}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <InputGroup className="w-full py-4">
                  <InputGroupInput
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="ps-9 pe-10"
                    placeholder="Confirm your password"
                    disabled={isSubmitting || isSocialLoading !== null}
                  />
                  <InputGroupAddon>
                    <LockIcon className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                      disabled={isSubmitting || isSocialLoading !== null}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                )}
              </Field>
              <Field>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || isSocialLoading !== null}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href="/login" locale={locale}>
                    Log in
                  </Link>
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
