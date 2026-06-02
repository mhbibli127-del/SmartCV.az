/**
 * Backup for Google Search Console HTML-file verification.
 * Primary file: /public/google750ae19981486b4c.html
 * Serves plain text (no HTML wrapper) at /google750ae19981486b4c.html
 */
export const dynamic = "force-static";

const BODY = "google-site-verification: google750ae19981486b4c.html";

export function GET() {
  return new Response(BODY, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
