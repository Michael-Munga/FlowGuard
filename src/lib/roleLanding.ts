import { DemoRoleId, ROLES_CONFIG } from "@/types/navigation";

/** Map backend role string → frontend demo role id */
export function backendRoleToDemoRole(role: string): DemoRoleId {
  switch (role) {
    case "super_admin":
    case "manager":
      return "operations";
    case "kpc_depot_operator":
      return "depot";
    case "omc":
      return "omc";
    case "kpc_engineer":
      return "engineer";
    case "executive":
      return "executive";
    case "driver":
      return "driver";
    default:
      return "operations";
  }
}

export function landingRouteForBackendRole(role: string): string {
  return ROLES_CONFIG[backendRoleToDemoRole(role)].defaultRoute;
}