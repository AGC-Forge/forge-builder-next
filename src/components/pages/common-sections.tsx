"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" />
  </svg>
);

export const SectionTitle = ({
  title,
  paragraph,
  width = "570px",
  center,
  mb = "100px",
}: {
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
  mb?: string;
}) => {
  return (
    <div
      className={`w-full ${center ? "mx-auto text-center" : ""}`}
      style={{ maxWidth: width, marginBottom: mb }}
    >
      <h2 className="mb-4 text-3xl font-bold leading-tight! text-black dark:text-white sm:text-4xl md:text-[45px]">
        {title}
      </h2>
      <p className="text-base leading-relaxed! text-muted-foreground md:text-lg">
        {paragraph}
      </p>
    </div>
  );
};

export const List = ({ text }: { text: string }) => (
  <p className="mb-5 flex items-center text-lg font-medium">
    <span className="bg-primary/10 text-blue-500 dark:text-blue-600 mr-4 flex h-7.5 w-7.5 items-center justify-center rounded-md">
      {checkIcon}
    </span>
    {text}
  </p>
);

export const Breadcrumb = ({
  pageName,
  description,
}: {
  pageName: string;
  description: string;
}) => {
  const locale = useLocale();
  return (
    <>
      <section className="relative z-10 overflow-hidden pt-28 lg:pt-37.5">
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 md:w-8/12 lg:w-7/12">
              <div className="mb-8 max-w-142.5 md:mb-0 lg:mb-12">
                <h1 className="mb-5 text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  {pageName}
                </h1>
                <p className="text-base font-medium leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            <div className="w-full px-4 md:w-4/12 lg:w-5/12">
              <div className="text-end">
                <ul className="flex items-center md:justify-end">
                  <li className="flex items-center">
                    <Link
                      href="/"
                      locale={locale}
                      className="pr-1 text-base font-medium text-blue-500 dark:text-blue-600 hover:text-primary"
                    >
                      Home
                    </Link>
                    <span className="mr-3 block h-2 w-2 rotate-45 border-r-2 border-t-2 border-blue-500 dark:border-blue-600"></span>
                  </li>
                  <li className="text-base font-medium text-primary">
                    {pageName}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
