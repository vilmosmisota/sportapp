import { GeistSans } from "geist/font/sans";

import "../styles/globals.css";
import ReactQueryClientProvider from "@/providers/ReactQueryClientProvider";
import { Toaster } from "@/components/ui/sonner";
import SupabaseAuthListener from "../providers/SupabaseAuthListener";

export const metadata = {
  title: "Title",
  description: "description",
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
