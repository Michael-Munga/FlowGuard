export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/omc/orders");
}