import type { games, purchases, refreshTokens, users } from "hub:db:schema";

type DateFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: string | null;
};

export type User = DateFields<typeof users.$inferSelect, "createdAt" | "updatedAt">;
export type Game = DateFields<typeof games.$inferSelect, "createdAt" | "updatedAt">;
export type Purchase = DateFields<typeof purchases.$inferSelect, "createdAt" | "updatedAt">;
export type RefreshToken = DateFields<
  typeof refreshTokens.$inferSelect,
  "createdAt" | "expiresAt" | "revokedAt"
>;

export enum ApiResponseCode {
  Success = "SUCCESS",
  Error = "ERROR",
  NotFound = "NOT_FOUND",
  ValidationError = "VALIDATION_ERROR",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  InvalidRequest = "INVALID_REQUEST",
  InternalError = "INTERNAL_ERROR",
}

export interface ApiResponse<T> {
  status: {
    code: ApiResponseCode;
    message: string;
    requestId: string;
    requestTime: number;
  };
  data: T;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export enum CookieName {
  AccessToken = "access_token",
  RefreshToken = "refresh_token",
}
