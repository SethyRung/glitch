const PUBLIC_ROUTES = ["/auth", "/games"];

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === "/" || PUBLIC_ROUTES.some((route) => to.path.startsWith(route))) {
    return;
  }

  const user = useUser();

  if (!user.value) {
    return navigateTo("/auth");
  }
});
