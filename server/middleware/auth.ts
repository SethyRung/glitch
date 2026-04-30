export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname;

  if (!url.startsWith("/api/") || url.startsWith("/api/_") || isPublicRoute(url, event.method))
    return;

  const config = useRuntimeConfig();
  const token = getCookie(event, CookieName.AccessToken);
  const payload = verifyToken<AccessTokenPayload>(token ?? "", config.jwt.access);

  if (!payload) {
    const refreshed = await refreshToken(event);

    if (!isSuccessResponse(refreshed)) {
      deleteCookie(event, CookieName.AccessToken);
      deleteCookie(event, CookieName.RefreshToken);
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Invalid or expired token" },
        null,
      );
    }

    const { user } = refreshed.data;
    event.context.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  } else {
    event.context.user = payload;
  }
});

declare module "h3" {
  interface H3EventContext {
    user?: AccessTokenPayload;
  }
}
