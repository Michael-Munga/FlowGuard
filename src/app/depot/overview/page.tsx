export const dynamic = 'force-dynamic';

import { DepotOperationsView } from "@/components/DepotOperations/DepotOperationsView";

export default function Page() {
  return <DepotOperationsView subView="overview" />;
}