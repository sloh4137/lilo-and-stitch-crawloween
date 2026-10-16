import type { Metadata, Viewport } from "next";
import { Creepster, Lilita_One, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const lilita = Lilita_One({
  variable: "--font-lilita",
  weight: "400",
  subsets: ["latin"],
});

const creepster = Creepster({
  variable: "--font-creepster",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lilo & Stitch Crawl-o-ween",
  description: "Find every Stitch hiding around the house!",
};

export const viewport: Viewport = {
  themeColor: "#140b2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${lilita.variable} ${creepster.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
