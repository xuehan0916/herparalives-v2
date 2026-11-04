"use client";
import { useEffect, useRef, useState } from "react";
import type { Story } from "@/lib/story-schema";

type Phase = "shuffle" | "gather" | "reveal";
export default function TarotDraw({
  story,
  poolCount,
  onClose,
  onStart,
}: {
  story: Story;
  poolCount: number;
  onClose: () => void;
  onStart: (story: Story) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<Phase>("shuffle");
  const reveal = () => setPhase("reveal");
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (media.matches) setPhase("reveal");
    else {
      timers.push(
        setTimeout(
          () =>
            setPhase((current) => (current === "reveal" ? current : "gather")),
          950,
        ),
      );
      timers.push(setTimeout(() => setPhase("reveal"), 1800));
    }
    const reduce = () => {
      if (media.matches) setPhase("reveal");
    };
    media.addEventListener("change", reduce);
    return () => {
      timers.forEach(clearTimeout);
      media.removeEventListener("change", reduce);
      document.body.style.overflow = previousOverflow;
      element.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={"tarot-dialog phase-" + phase}
      aria-labelledby="tarot-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button className="tarot-close" onClick={onClose} aria-label="关闭抽卡">
        ×
      </button>
      <p className="tarot-eyebrow">A LIFE IS FINDING YOU</p>
      <h2 id="tarot-title">
        {phase === "reveal" ? "这一次，她与你相遇。" : "让一段人生，向你展开。"}
      </h2>
      <p className="tarot-pool">从当前分类的 {poolCount} 段人生中抽取</p>
      <div className="tarot-table" aria-hidden="true">
        <div className="tarot-orbit orbit-one" />
        <div className="tarot-orbit orbit-two" />
        {[-1, 1].map((side) => (
          <div
            key={side}
            className={
              "tarot-shadow-card side-" + (side < 0 ? "left" : "right")
            }
          >
            <span>✧</span>
          </div>
        ))}
        <div className="tarot-chosen">
          <div className="tarot-chosen-inner">
            <div className="tarot-card-back">
              <span className="tarot-card-seal">HER PARALLEL LIVES</span>
              {story.card.portrait && (
                <div
                  className="tarot-character"
                  style={{ backgroundImage: `url("${story.card.portrait}")` }}
                />
              )}
              <span className="tarot-card-name">{story.card.name}</span>
            </div>
            <div className="tarot-card-face">
              <span className="tarot-card-star">✧</span>
              <small>
                {story.card.name} / {story.card.theme}
              </small>
              <h3>{story.card.tagline}</h3>
              <p>{story.card.question}</p>
              <span className="tarot-card-duration">
                约 {story.card.minutes} 分钟
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="tarot-result" aria-live="polite">
        {phase === "reveal" ? (
          <>
            <span className="tarot-screen-reader">
              抽到{story.card.name}的故事：{story.card.tagline}。
              {story.card.question}
            </span>
            <p>
              {story.status === "placeholder"
                ? "体验样篇 · 虚构角色 · 尚未审校"
                : "一段人生，等待你的选择"}
            </p>
            <button
              className="primary tarot-start"
              onClick={() => onStart(story)}
            >
              走进她的人生 <span aria-hidden="true">→</span>
            </button>
            <button className="tarot-return" onClick={onClose}>
              收好这张卡，留在故事馆
            </button>
          </>
        ) : (
          <>
            <p>
              {phase === "shuffle"
                ? "人生交错，正在洗牌…"
                : "一段故事，正慢慢靠近…"}
            </p>
            <button className="tarot-skip" onClick={reveal}>
              跳过动效，直接揭牌
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
