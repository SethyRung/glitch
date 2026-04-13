export function createResponse<T>(
  status: { code: ApiResponseCode; message?: string },
  data: T,
  meta?: { total: number; limit: number; offset: number },
): ApiResponse<T> {
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
