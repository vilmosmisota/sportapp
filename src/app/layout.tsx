import { GeistSans } from "geist/font/sans";
import { MainMenu } from "./components/menu/MainMenu";

import "../styles/globals.css";
import RootStyleLoader from "./components/RootStyleLoader";
import ReactQueryClientProvider from "@/providers/ReactQueryClientProvider";
import { Toaster } from "@/components/ui/sonner";

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
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className={"min-h-screen bg-background antialiased"}>
          <RootStyleLoader />

          <>{children}</>
          <Toaster />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
