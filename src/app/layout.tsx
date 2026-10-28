import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Lora, Archivo } from "next/font/google";
import "./globals.css";
import { THEME_INIT_SCRIPT, PRIMARY_INIT_SCRIPT } from "@/lib/theme";
import NavBar from "@/components/NavBar";
import SparkleEffects from "@/components/SparkleEffects";
import AppToaster from "@/components/AppToaster";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Svenska",
  description: "A personal Swedish learning app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-primary="carnelian"
      data-surface="sandstone"
      className={`${lora.variable} ${archivo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: PRIMARY_INIT_SCRIPT }} />
      </head>
      <body className="h-dvh overflow-hidden flex flex-col bg-background text-foreground font-sans">
        <Suspense fallback={<div className="h-[49px] shrink-0 border-b border-hairline" />}>
          <NavBar />
        </Suspense>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-14 sm:pb-0">{children}</div>
        <SparkleEffects />
        <AppToaster />
        <Analytics />
      </body>
    </html>
  );
}
