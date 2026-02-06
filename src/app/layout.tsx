import "~/styles/globals.css";

import { type Metadata } from "next";
import { Abril_Fatface, Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Disco Soulstice",
  description: "Good time grooves, funk, soul & disco. Join the movement.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  variable: "--font-art-nuvo",
  weight: ["400"],
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
    <html lang="en" className={`${abrilFatface.variable} ${inter.variable}`}>
      <body className="noise-overlay">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
