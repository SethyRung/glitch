import type { games, purchases, refreshTokens, users } from "hub:db:schema";

export type User = Omit<typeof users.$inferSelect, "passwordHash" | "createdAt" | "updatedAt">;
export type Game = Omit<typeof games.$inferSelect, "createdAt" | "updatedAt">;
export type Purchase = Omit<typeof purchases.$inferSelect, "createdAt" | "updatedAt">;
export type RefreshToken = Omit<
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

export interface ApiResponseStatus {
  code: ApiResponseCode;
  message: string;
  requestId: string;
  requestTime: number;
}

export type ApiResponseSuccess<T> = {
  status: ApiResponseStatus & { code: ApiResponseCode.Success };
  data: T;
  meta?: { total: number; limit: number; offset: number };
};

export type ApiResponseError = {
  status: ApiResponseStatus & { code: Exclude<ApiResponseCode, ApiResponseCode.Success> };
  data: null;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export function isSuccessResponse<T>(res: ApiResponse<T>): res is ApiResponseSuccess<T> {
  return res.status.code === ApiResponseCode.Success;
}

export enum CookieName {
  AccessToken = "access_token",
  RefreshToken = "refresh_token",
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  name: string;
}
