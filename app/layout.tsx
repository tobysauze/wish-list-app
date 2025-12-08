import type { Metadata } from "next";
import "./globals.css";
import { SkimlinksScript } from "@/components/skimlinks-script";

export const metadata: Metadata = {
  title: "Wish List App",
  description: "Create and share your wish lists with friends and family",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SkimlinksScript />
      </body>
    </html>
  );
}


