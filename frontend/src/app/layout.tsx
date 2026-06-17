import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Suspense } from "react";
import { GoogleAnalyticsTracker } from "@/components/layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HerbalDB - Indonesian Herbal Plants Database",
  description: "Comprehensive database of Indonesian herbal plants and their bioactive compounds for research and traditional medicine preservation.",
  keywords: ["herbal", "plants", "Indonesia", "database", "compounds", "traditional medicine"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5526288161802891"
          crossOrigin="anonymous"
        ></script>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZVY9ES3XP0"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZVY9ES3XP0', { send_page_view: false });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <GoogleAnalyticsTracker gaId="G-ZVY9ES3XP0" />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
