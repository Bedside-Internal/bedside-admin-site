import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dmSans, instrumentSerif, poppins } from "@/lib/fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bedside Admin Site",
  robots: {
    index: false,
    follow: false,
  },
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable} ${poppins.variable}`}>
        <body className="font-dm bg-cream text-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
