import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { RoleProvider } from "@/context/RoleContext";

export const metadata: Metadata = {
  title: "KPC FlowGuard — Autonomous Control Plane",
  description: "Kenya Pipeline Company SCADA Command Centre & Autonomous Dispatch Sub-System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFBFC] text-[#0F1B2B]">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
