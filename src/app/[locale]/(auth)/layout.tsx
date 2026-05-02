import Image from "next/image";
import { useTranslations } from "next-intl";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations("HomePage");
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md">
            <Image
              src="/logo.png"
              alt="Forge Builder Logo"
              width={24}
              height={24}
              className="rounded-sm"
            />
          </div>
          {t("title")}
        </a>
        {children}
      </div>
    </div>
  );
}
