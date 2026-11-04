import { useEffect, useRef, useState } from "react";

type Props = {
  onEnter: () => void;
  onPersonal: () => void;
  onContinue?: () => void;
};

export default function GameMenu({ onEnter, onPersonal, onContinue }: Props) {
  const [entering, setEntering] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const enter = () => {
    if (entering) return;
    setEntering(true);
    timer.current = setTimeout(
      onEnter,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
    );
  };
  return (
    <section
      className={"game-menu" + (entering ? " is-entering" : "")}
      aria-label="游戏主界面"
    >
      <div className="menu-content">
        <p className="eyebrow">
          <span />
          万千人生 · 一次相遇
          <span />
        </p>
        <h1>
          <small>她的</small>平行人生
        </h1>
        <p className="menu-subtitle">
          在她们的人生岔路里，看见自己会如何选择。
        </p>
        <div className="menu-actions">
          <button
            className="primary menu-start"
            onClick={enter}
            disabled={entering}
          >
            <i aria-hidden="true">✧</i>
            <span>{entering ? "正在走近她…" : "体验她的平行人生"}</span>
            <span aria-hidden="true">→</span>
          </button>
          {onContinue && (
            <button className="menu-resume" onClick={onContinue}>
              继续这一段人生
            </button>
          )}
        </div>
        <button className="menu-personal" onClick={onPersonal}>
          <span aria-hidden="true">✧</span>
          <span>
            <strong>也想走进自己的平行人生？</strong>
            <small>收集故事里的碎片，开启属于你的另一种可能。</small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
        <p className="menu-whisper">每个未曾选择的岔路，都有一个她在继续。</p>
      </div>
      <p className="menu-promise">
        不替你选择人生，陪你把每种人生多走一段。<span>人物与未来均为虚构</span>
      </p>
    </section>
  );
}
