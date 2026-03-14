import type { ResponseCode } from "#shared/types";
import { createResponse } from "#server/utils/response";
import { verifyAccessToken, type AccessTokenPayload } from "#server/utils/auth";
import type { H3Event } from "h3";

interface PublicRoute {
  path: string;
  methods: string[];
}

const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/api/auth/login", methods: ["POST"] },
  { path: "/api/auth/register", methods: ["POST"] },
  { path: "/api/auth/refresh", methods: ["POST"] },
  { path: "/api/games", methods: ["GET"] },
  { path: "/api/games/[id]", methods: ["GET"] },
];

function matchesPublicRoute(path: string, routePath: string): boolean {
  if (routePath.startsWith("^")) {
    const regex = new RegExp(routePath.replace("^", ""));
    return regex.test(path);
  }
  return path === routePath;
}

function findPublicRoute(path: string, method: string | undefined): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      matchesPublicRoute(path, route.path) &&
      (!route.methods.length || (method && route.methods.includes(method))),
  );
}

export default defineEventHandler((event: H3Event) => {
  const url = getRequestURL(event).pathname;

  // Skip non-API routes
  if (!url.startsWith("/api/")) {
    return;
  }

  // Check if route is public
  if (findPublicRoute(url, event.method)) {
    return;
  }

  // Extract and verify Bearer token
  const authHeader = getHeader(event, "authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return createResponse(
      { code: "Unauthorized" as ResponseCode, message: "Missing authorization header" },
      null,
    );
  }

  const config = useRuntimeConfig();
  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token, config.jwt.access);

  if (!payload) {
    return createResponse(
      { code: "Unauthorized" as ResponseCode, message: "Invalid or expired token" },
      null,
    );
  }

  // Attach user to event context
  event.context.user = payload;
});

declare module "h3" {
  interface H3EventContext {
    user?: AccessTokenPayload;
  }
}
