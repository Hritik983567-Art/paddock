import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Roboto+Condensed:wght@400;600;700;800;900&family=Titillium+Web:wght@400;600;700;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full antialiased font-sans">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}

