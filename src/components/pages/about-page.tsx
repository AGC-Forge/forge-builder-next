"use client";

import Image from "next/image";
import { SectionTitle, List, Breadcrumb } from "./common-sections";

export function AboutPage() {
  return (
    <div className="relative">
      <Breadcrumb
        pageName="About Page"
        description="Learn more about SnapLand and our mission to help you grow your business."
      />
      <section id="about" className="pt-16 md:pt-20 lg:pt-28">
        <div className="container">
          <div className="border-b border-blue-500/15 pb-16 dark:border-white/15 md:pb-20 lg:pb-28">
            <div className="-mx-4 flex flex-wrap items-center">
              <div className="w-full px-4 lg:w-1/2">
                <SectionTitle
                  title="Crafted for Startup, SaaS and Business Sites."
                  paragraph="The main ‘thrust’ is to focus on educating attendees on how to best protect highly vulnerable business applications with interactive panel discussions and roundtables."
                  mb="44px"
                />

                <div
                  className="mb-12 max-w-142.5 lg:mb-0"
                  data-wow-delay=".15s"
                >
                  <div className="-mx-3 flex flex-wrap">
                    <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                      <List text="Premium quality" />
                      <List text="Tailwind CSS" />
                      <List text="Use for lifetime" />
                    </div>

                    <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                      <List text="Next.js" />
                      <List text="Rich documentation" />
                      <List text="Developer friendly" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full px-4 lg:w-1/2">
                <div className="relative mx-auto aspect-25/24 max-w-125 lg:mr-0">
                  <Image
                    src="/images/about/about-image.svg"
                    alt="about-image"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="mx-auto max-w-full drop-shadow-three dark:hidden dark:drop-shadow-none lg:mr-0"
                  />
                  <Image
                    src="/images/about/about-image-dark.svg"
                    alt="about-image"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="mx-auto hidden max-w-full drop-shadow-three dark:block dark:drop-shadow-none lg:mr-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <div
                className="relative mx-auto mb-12 aspect-25/24 max-w-125 text-center lg:m-0"
                data-wow-delay=".15s"
              >
                <Image
                  src="/images/about/about-image-2.svg"
                  alt="about image"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="drop-shadow-three dark:hidden dark:drop-shadow-none"
                />
                <Image
                  src="/images/about/about-image-2-dark.svg"
                  alt="about image"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="hidden drop-shadow-three dark:block dark:drop-shadow-none"
                />
              </div>
            </div>
            <div className="w-full px-4 lg:w-1/2">
              <div className="max-w-117.5">
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Bug free code
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Premier support
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt.
                  </p>
                </div>
                <div className="mb-1">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Next.js
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
                    Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt
                    consectetur adipiscing elit setim.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
