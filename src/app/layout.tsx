import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ding's PDF",
  description: "Create PDFs with ease, using html and css.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased text-[11px] bg-[#E5E5E5] text-[#333333]`}
      >
        {children}
      </body>
    </html>
  );
}
