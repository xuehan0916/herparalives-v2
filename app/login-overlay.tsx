import { useEffect, useRef, useState } from "react";
import type { AuthStatus } from "@/lib/auth-contract";
import FragmentGem from "./fragment-gem";

export default function LoginOverlay({
  reason,
  auth,
  onClose,
  onGuest,
  onSuccess,
}: {
  reason: "draw" | "account";
  auth: AuthStatus;
  onClose: () => void;
  onGuest: () => void;
  onSuccess: (label: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [stage, setStage] = useState<"invite" | "phone">(
    reason === "draw" ? "invite" : "phone",
  );
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const validPhone = /^1\d{10}$/.test(phone);
  const send = async () => {
    if (!validPhone || busy || countdown) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: "+86" + phone }),
      });
      const data = await response.json();
      if (!response.ok || !data.sent) {
        setMessage(data.message ?? "验证码未能发送。");
        return;
      }
      setSent(true);
      setCountdown(60);
      setMessage("验证码已发送，请留意手机短信。");
    } catch {
      setMessage("网络暂时未连接，请稍后再试。");
    } finally {
      setBusy(false);
    }
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPhone || !/^\d{6}$/.test(code) || !sent || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: "+86" + phone, token: code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "登录未完成，请重试。");
        return;
      }
      onSuccess(data.userLabel);
    } catch {
      setMessage("网络暂时未连接，请稍后再试。");
    } finally {
      setBusy(false);
    }
  };
  return (
    <dialog
      ref={dialog}
      className="login-dialog"
      aria-labelledby="login-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <div className="login-surface">
        <button
          className="dialog-close"
          aria-label="关闭登录提示"
          onClick={onClose}
        >
          ×
        </button>
        <div className="login-gem">
          <FragmentGem />
        </div>
        <p className="eyebrow">A PLACE FOR YOUR OTHER LIVES</p>
        <h2 id="login-title">
          {stage === "invite" ? (
            <>
              让这次相遇，
              <br />
              有一个归处。
            </>
          ) : (
            <>
              欢迎回来，
              <br />
              走过人生的你。
            </>
          )}
        </h2>
        {stage === "invite" ? (
          <>
            <p className="login-copy">
              一段人生即将向你展开。
              <br />
              登录后，以自己的账号继续相遇。
            </p>
            <button
              className="primary login-main"
              onClick={() => setStage("phone")}
            >
              登录，继续抽卡 <span>→</span>
            </button>
            <button className="login-guest" onClick={onGuest}>
              先以游客抽一张
            </button>
            <small className="login-note">
              游客也可体验完整样篇，记录暂存在本机。
            </small>
          </>
        ) : (
          <form onSubmit={verify}>
            <p className="login-copy">用手机号，开启你的旅人身份。</p>
            <label className="login-field">
              <span>手机号</span>
              <div>
                <i>+86</i>
                <input
                  aria-label="手机号"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="tel"
                  maxLength={11}
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ""));
                    setSent(false);
                    setCode("");
                    setCountdown(0);
                  }}
                />
              </div>
            </label>
            <label className="login-field">
              <span>短信验证码</span>
              <div>
                <input
                  aria-label="短信验证码"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="六位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  type="button"
                  className="send-code"
                  disabled={
                    !auth.configured || !validPhone || busy || countdown > 0
                  }
                  onClick={send}
                >
                  {countdown ? countdown + " 秒后重发" : "获取验证码"}
                </button>
              </div>
            </label>
            {!auth.configured && (
              <p className="login-availability">
                短信登录暂未开放。你可以先以游客身份体验，碎片与图鉴仍会留在本机。
              </p>
            )}
            <p className="login-message" role="status">
              {message}
            </p>
            <button
              className="primary login-main"
              disabled={!auth.configured || !sent || busy || code.length !== 6}
              type="submit"
            >
              {busy ? "正在连接…" : reason === "draw" ? "登录并抽卡" : "登录"}{" "}
              <span>→</span>
            </button>
            <button
              className="login-guest"
              type="button"
              onClick={reason === "draw" ? onGuest : onClose}
            >
              {reason === "draw" ? "稍后登录，先抽卡" : "先以游客身份继续"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
