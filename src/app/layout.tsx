import type { Metadata, Viewport } from "next";
import { Creepster, Lilita_One, Nunito } from "next/font/google";
import Lightning from "@/components/Lightning";
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
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
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
      <body className="min-h-full flex flex-col font-sans">
        <Lightning />
        <div aria-hidden className="moon" />
        {children}
      </body>
    </html>
  );
}
