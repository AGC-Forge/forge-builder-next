"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Breadcrumb } from "./common-sections";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function ChangelogPage() {
  return (
    <div className="relative">
      <Breadcrumb
        pageName="Changelog"
        description="View the latest updates and improvements to SnapLand."
      />
      <section
        id="changelog"
        className="overflow-hidden py-16 md:py-20 lg:py-28"
      >
        <div className="container"></div>
      </section>
    </div>
  );
}
