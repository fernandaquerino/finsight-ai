import { NextResponse } from "next/server";

import { auth } from "@/../auth";
import {
  getLoginRedirectUrl,
  isProtectedPath,
} from "@/server/auth/protected-routes";

export default auth((request) => {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (request.auth?.user?.id) {
    return NextResponse.next();
  }

  return NextResponse.redirect(getLoginRedirectUrl(request.nextUrl));
});

export const config = {
  matcher: ["/"],
};
