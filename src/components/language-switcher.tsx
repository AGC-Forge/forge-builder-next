"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { useParams } from "next/navigation";
import { type Locale, useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageOptions = [
  {
    value: "en",
    label: "English",
    icon: "fi fi-us",
  },
  {
    value: "id",
    label: "Bahasa Indonesia",
    icon: "fi fi-id",
  },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");
  const [selectedLocale, setSelectedLocale] = useState(useLocale());

  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === selectedLocale) return;

    startTransition(() => {
      const { locale: _locale, ...restParams } = params as Record<
        string,
        unknown
      >;
      setSelectedLocale(nextLocale);

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
          {selectedLocale.trim() !== "" ? (
            <>
              <span
                className={
                  LanguageOptions.find(
                    (option) => option.value === selectedLocale,
                  )?.icon || ""
                }
              ></span>
              <span className="sr-only">
                {LanguageOptions.find(
                  (option) => option.value === selectedLocale,
                )?.label || ""}
              </span>
            </>
          ) : (
            <>
              <Languages className="h-[1.2rem] w-[1.2rem] active:scale-95" />
              <span className="sr-only">{t("label")}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-max">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={selectedLocale}
            onValueChange={handleChange}
          >
            {LanguageOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                disabled={isPending}
              >
                <span className={option.icon}></span>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
