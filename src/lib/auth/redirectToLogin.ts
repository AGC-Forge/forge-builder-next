export function redirectToLogin(overrideRedirectTo?: string) {
  if (typeof window === "undefined") return;
  const redirectTo =
    overrideRedirectTo ?? window.location.pathname + window.location.search;
  window.location.href = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}
