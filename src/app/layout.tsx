import type { Metadata } from "next";
import "./globals.css";

import { RoleProvider } from "@/context/RoleContext";
import { DataSourceProvider } from "@/context/DataSourceContext";

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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#FAFBFC] text-[#0F1B2B]">
        <DataSourceProvider>
          <RoleProvider>{children}</RoleProvider>
        </DataSourceProvider>
      </body>
    </html>
  );
}
