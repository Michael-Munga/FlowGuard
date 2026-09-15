import { redirect } from "next/navigation";

/**
 * Root route redirects to Demo Entry Gateway (/login) to establish the
 * role-based progressive disclosure hierarchy:
 * DEMO ENTRY -> ROLE -> WORKSPACE -> SCREEN -> DETAIL
 */
export default function RootPage() {
  redirect("/login");
}
