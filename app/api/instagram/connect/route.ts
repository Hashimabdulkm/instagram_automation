import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL!;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?connect=error&reason=no-session`
    );
  }

  // Get NextAuth's CSRF token so the form POST is accepted
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
  });
  const { csrfToken } = await csrfRes.json();

  const callbackUrl = `${baseUrl}/dashboard/settings?connect=success`;

  // Return a minimal HTML page that:
  //  1. Sets an HTTP-only-equivalent cookie via Set-Cookie header (server-side, secure)
  //  2. Auto-POSTs to NextAuth's Instagram sign-in (which uses the already-registered redirect_uri)
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Connecting…</title></head>
<body>
<form id="f" method="POST" action="/api/auth/signin/instagram">
  <input type="hidden" name="csrfToken" value="${csrfToken}" />
  <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
</form>
<script>document.getElementById('f').submit();</script>
</body>
</html>`;

  const secure = baseUrl.startsWith("https");
  const cookieHeader = [
    `ig_connect_uid=${userId}`,
    "Path=/",
    "Max-Age=600",
    "SameSite=Lax",
    "HttpOnly",
    ...(secure ? ["Secure"] : []),
  ].join("; ");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Set-Cookie": cookieHeader,
    },
  });
}
