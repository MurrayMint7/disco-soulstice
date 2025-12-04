import "~/styles/globals.css";

import { type Metadata } from "next";
import { Playfair_Display } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Disco Soulstice",
  description: "Events, gallery, and more for Disco Soulstice.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-art-nuvo",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
