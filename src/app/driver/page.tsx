import { Metadata } from "next";
import { DriverAppShell } from "@/components/Driver/DriverAppShell";

export const metadata: Metadata = {
  title: "FlowGuard Driver — KPC Collection Companion",
  description: "Mobile-first operational companion for KPC road tanker collection drivers.",
};

export default function DriverPage() {
  return <DriverAppShell />;
}
