import { authConfigured, currentUser } from "@/server/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const configured = authConfigured();
  try {
    const user = configured ? await currentUser() : undefined;
    return Response.json(
      { configured, ...user },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { configured },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
