import type { Metadata } from "next";
import { Suspense } from "react";
import { Lora, Archivo } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

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
      className={`${lora.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Suspense fallback={<div className="h-[49px] border-b border-hairline" />}>
          <NavBar />
        </Suspense>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
