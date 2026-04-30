export default defineEventHandler(async (event) => {
  const res = await refreshToken(event);

  if (!isSuccessResponse(res)) {
    deleteCookie(event, CookieName.AccessToken);
    deleteCookie(event, CookieName.RefreshToken);
  }

  return { ...res, data: null };
});
