export type UserRole = "miembro" | "lider" | "cocina" | "admin";

export type UserRoleRecord = {
  rol?: string | null;
  roles?: string[] | null;
} | null | undefined;

export const PROTECTED_ROUTES = [
  "/devocionales",
  "/galeria",
  "/equipos",
  "/ministerios",
  "/oraciones",
  "/recursos",
  "/perfil",
  "/anuncios",
];

export const ROLE_ROUTE_PREFIXES = {
  admin: ["/admin"],
  lider: ["/lider"],
  cocina: ["/cocina"],
} as const;

export function matchesRoutePrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAuthProtectedPath(pathname: string) {
  return matchesRoutePrefix(pathname, PROTECTED_ROUTES);
}

export function getRequiredRole(pathname: string): UserRole | null {
  if (matchesRoutePrefix(pathname, ROLE_ROUTE_PREFIXES.admin)) return "admin";
  if (matchesRoutePrefix(pathname, ROLE_ROUTE_PREFIXES.lider)) return "lider";
  if (matchesRoutePrefix(pathname, ROLE_ROUTE_PREFIXES.cocina)) return "cocina";
  return null;
}

export function roleAllowsPath(requiredRole: UserRole | null, roles: string[]) {
  if (!requiredRole) return true;
  if (!Array.isArray(roles) || roles.length === 0) return false;
  if (roles.includes("admin")) return true;
  return roles.includes(requiredRole);
}

export function normalizeRoles(userRecord: UserRoleRecord): string[] {
  if (!userRecord) return [];
  if (Array.isArray(userRecord.roles) && userRecord.roles.length > 0) return userRecord.roles;
  if (typeof userRecord.rol === "string" && userRecord.rol.length > 0) return [userRecord.rol];
  return [];
}
