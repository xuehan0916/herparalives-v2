import { clearAuthSession } from "@/server/auth";
export async function POST() {
  await clearAuthSession();
  return Response.json({ ok: true });
}
