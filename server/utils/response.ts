import type { Response, ResponseCode } from "#shared/types";

export function createResponse<T>(
  status: { code: ResponseCode; message?: string },
  data: T,
  meta?: { total: number; limit: number; offset: number },
): Response<T> {
  return {
    status: {
      code: status.code,
      message: status.message ?? "",
      requestId: crypto.randomUUID(),
      requestTime: Date.now(),
    },
    data,
    meta,
  };
}
