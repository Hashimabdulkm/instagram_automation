export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|privacy-policy|terms-of-service|help-center|about|contact|features|pricing|integrations|status|blog|careers|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp|.*\\.avif).+)",
  ],
};


