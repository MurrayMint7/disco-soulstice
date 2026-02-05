import "~/styles/globals.css";

import { type Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Disco Soulstice",
  description: "Good time grooves, funk, soul & disco. Join the movement.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-art-nuvo",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="noise-overlay">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
