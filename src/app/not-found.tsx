import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import NotFoundPage from "@/components/not-found-page";
import { routing } from "@/i18n/routing";

export default async function GlobalNotFound() {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = routing.locales.includes(requestedLocale as never)
    ? (requestedLocale as (typeof routing.locales)[number])
    : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundPage />
    </NextIntlClientProvider>
  );
}
