import { GeistSans } from "geist/font/sans";

import { Toaster } from "@/components/ui/sonner";
import ReactQueryClientProvider from "@/providers/ReactQueryClientProvider";
import SupabaseAuthListener from "../providers/SupabaseAuthListener";
import "../styles/globals.css";

export const metadata = {
  title: "SportWise | Youth Sports Management Platform",
  description:
    "SportWise simplifies youth sports management with smart check-ins, player registration, parent portals, and real-time attendance tracking.",
  keywords: [
    "youth sports management",
    "attendance tracking",
    "check-in system",
    "parent portal",
    "skill development",
    "sports coaching software",
    "club management",
  ],
  authors: [{ name: "SportWise" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SportWise | Youth Sports Management Platform",
    description:
      "Smart attendance tracking and player management for youth sports organizations.",
    url: "https://sportwise.net",
    siteName: "SportWise",
    locale: "en_UK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <SupabaseAuthListener>
        <html lang="en" className={`${GeistSans.variable}`}>
          <body className={"min-h-screen bg-background antialiased"}>
            {children}
            <Toaster />
          </body>
        </html>
      </SupabaseAuthListener>
    </ReactQueryClientProvider>
  );
}
