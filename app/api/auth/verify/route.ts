import { authConfigured, authRequest, saveAuthSession } from "@/server/auth";
import { otpVerifySchema } from "@/lib/auth-contract";
export async function POST(request: Request) {
  if (!authConfigured())
    return Response.json(
      { message: "短信登录暂未开放，你可以继续以游客身份体验。" },
      { status: 503 },
    );
  const parsed = otpVerifySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { message: "请检查手机号与六位验证码。" },
      { status: 400 },
    );
  try {
    const response = await authRequest("verify", {
      ...parsed.data,
      type: "sms",
    });
    if (!response?.ok)
      return Response.json(
        { message: "验证码不正确或已过期，请重新获取。" },
        { status: 400 },
      );
    const session = await response.json();
    if (!session.access_token || !session.refresh_token)
      return Response.json(
        { message: "登录未完成，请重试。" },
        { status: 502 },
      );
    await saveAuthSession(session);
    return Response.json({
      userLabel:
        parsed.data.phone.slice(0, -8) + " ···· " + parsed.data.phone.slice(-4),
    });
  } catch {
    return Response.json(
      { message: "暂时无法连接登录服务，请稍后再试。" },
      { status: 502 },
    );
  }
}
