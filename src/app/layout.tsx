import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "AforPrint | Campus Printing Platform",
  description: "High-fidelity campus printing and delivery engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,900&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet" />
        {/* Tailwind CDN as requested in the snippet */}
        <Script src="https://cdn.tailwindcss.com/3.4.17" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
