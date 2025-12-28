import type { Metadata, Viewport } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A7F7A",
};

export const metadata: Metadata = {
  title: "ParentGlue - Your Child's Journey, Organized",
  description:
    "Navigate your child's autism services with confidence. Find providers, track IEPs, therapy schedules, and important deadlines—all 50 states.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ParentGlue",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: "ParentGlue",
    description: "Never miss a deadline. Never miss a resource.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${outfit.variable} ${sourceSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
