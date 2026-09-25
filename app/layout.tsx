import type { Metadata } from "next";
import { Titillium_Web, Inter, Roboto_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";

const titilliumWeb = Titillium_Web({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-telemetry",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paddock — F1 Analytics & Race Tracker",
  description: "Paddock — an F1 analytics dashboard: live standings, race & qualifying replay, driver profiles, teammate battles, and a pit-strategy simulator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${titilliumWeb.variable} ${inter.variable} ${robotoCondensed.variable} ${jetbrainsMono.variable} min-h-full antialiased`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
