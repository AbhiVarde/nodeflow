import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

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
  metadataBase: new URL("https://nodeflow.abhivarde.in"),
  openGraph: {
    title: "NodeFlow",
    description:
      "Visual builder for conditional node-based workflows. Build, share, and export flows in the browser.",
    url: "https://nodeflow.abhivarde.in",
    siteName: "NodeFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NodeFlow",
    description:
      "Visual builder for conditional node-based workflows. Build, share, and export flows in the browser.",
    creator: "@abhivarde",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
