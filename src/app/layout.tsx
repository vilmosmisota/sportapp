import { GeistSans } from "geist/font/sans";
import { MainMenu } from "./components/menu/MainMenu";

import "../styles/globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Title",
  description: "description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className={"min-h-screen bg-background antialiased"}>
        <MainMenu />
        <div className="mx-auto max-w-screen-2xl my-5  px-5">{children}</div>
      </body>
    </html>
  );
}
