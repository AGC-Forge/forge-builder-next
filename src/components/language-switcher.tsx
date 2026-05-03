"use client";

import { Languages } from "lucide-react";
import { useParams } from "next/navigation";
import { type Locale, useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();

  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    startTransition(() => {
      const { locale: _locale, ...restParams } = params as Record<
        string,
        unknown
      >;

      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params: restParams },
        { locale: nextLocale },
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem] active:scale-95" />
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => handleChange(value as Locale)}
        >
          {routing.locales.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} disabled={isPending}>
              {t("locale", { locale: l })}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
