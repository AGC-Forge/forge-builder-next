"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Breadcrumb } from "./common-sections";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function ApiDocsPage() {
  return (
    <div className="relative">
      <Breadcrumb
        pageName="API Docs"
        description="Explore the SnapLand API documentation to build custom integrations and enhance your business operations."
      />
      <section
        id="api-docs"
        className="overflow-hidden py-16 md:py-20 lg:py-28"
      >
        <div className="container"></div>
      </section>
    </div>
  );
}
