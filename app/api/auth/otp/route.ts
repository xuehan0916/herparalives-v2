import { authConfigured, authRequest } from "@/server/auth";
import { otpRequestSchema } from "@/lib/auth-contract";
export async function POST(request: Request) {
  if (!authConfigured())
    return Response.json(
      { message: "短信登录暂未开放，你可以继续以游客身份体验。" },
      { status: 503 },
    );
  const parsed = otpRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json({ message: "请检查手机号。" }, { status: 400 });
  try {
    const response = await authRequest("otp", {
      phone: parsed.data.phone,
      channel: "sms",
      create_user: true,
    });
    if (!response?.ok)
      return Response.json(
        {
          message:
            response?.status === 429
              ? "请求太频繁，请稍后再试。"
              : "验证码暂时未能发送，请稍后再试。",
        },
        { status: response?.status === 429 ? 429 : 502 },
      );
    return Response.json({ sent: true });
  } catch {
    return Response.json(
      { message: "暂时无法连接登录服务，请稍后再试。" },
      { status: 502 },
    );
  }
}
