import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: "NodeFlow",
  description:
    "Visual builder for conditional node-based workflows. Build, share, and export flows in the browser.",
  keywords: [
    "workflow builder",
    "flow builder",
    "node editor",
    "automation",
    "visual programming",
  ],
  authors: [{ name: "Abhi Varde", url: "https://abhivarde.in" }],
  creator: "Abhi Varde",
  publisher: "Abhi Varde",

  metadataBase: new URL("https://nodeflow.abhivarde.in"),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "NodeFlow",
    description:
      "Visual builder for conditional node-based workflows. Build, share, and export flows in the browser.",
    url: "https://nodeflow.abhivarde.in",
    siteName: "NodeFlow",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "NodeFlow - Visual workflow builder",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "NodeFlow",
    description:
      "Visual builder for conditional node-based workflows. Build, share, and export flows in the browser.",
    creator: "@abhivarde",
    images: ["/og.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://nodeflow.abhivarde.in" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
