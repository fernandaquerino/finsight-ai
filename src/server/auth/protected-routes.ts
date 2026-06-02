const PROTECTED_PATHS = ["/"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export function getLoginRedirectUrl(requestUrl: URL): URL {
  const loginUrl = new URL("/login", requestUrl);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${requestUrl.pathname}${requestUrl.search}`,
  );

  return loginUrl;
}
