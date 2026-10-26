"use client";
import { useEffect, useRef, useState } from "react";
import { sampleStory } from "@/content/stories/sample";
import { storyCatalog } from "@/content/stories/catalog";
import GameMenu from "./game-menu";
import StoryHall from "./story-hall";
import { DIMENSIONS, DIMENSION_INFO as info } from "@/lib/dimensions";
import type { Story, StoryOption } from "@/lib/story-schema";
import { chooseEnding, earnedFragments, journeyState } from "@/lib/journey";
import { resolveGameScreen, type GameScreen } from "@/lib/game-navigation";

type View = GameScreen;
function Radar({ choices, name }: { choices: StoryOption[]; name: string }) {
  const state = journeyState(choices);
  const point = (i: number, r: number) =>
    `${110 + Math.sin((i * Math.PI * 2) / 5) * r},${110 - Math.cos((i * Math.PI * 2) / 5) * r}`;
  return (
    <svg
      viewBox="0 0 220 220"
      className="radar"
      role="img"
      aria-label={name + "的五维处境示意，无数字评分"}
    >
      {[35, 60, 85].map((r) => (
        <polygon
          key={r}
          points={DIMENSIONS.map((_, i) => point(i, r)).join(" ")}
          fill="none"
          stroke="#ddd8df"
        />
      ))}
      <polygon
        points={DIMENSIONS.map((d, i) =>
          point(i, 35 + Math.min(50, state[d] * 5)),
        ).join(" ")}
        fill="#9d8eb642"
        stroke="#88749f"
        strokeWidth="2"
      />
      {DIMENSIONS.map((d, i) => {
        const [x, y] = point(i, 100).split(",");
        return (
          <text
            key={d}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={info[d].color}
            fontSize="12"
          >
            {info[d].label}
          </text>
        );
      })}
    </svg>
  );
}
export default function Experience() {
  const [view, setView] = useState<View>("home");
  const [choices, setChoices] = useState<StoryOption[]>([]);
  const [feedback, setFeedback] = useState<StoryOption | null>(null);
  const [font, setFont] = useState(18);
  const [story, setStory] = useState<Story>(sampleStory);
  const [saved, setSaved] = useState("");
  const totalChoices = story.chapters.reduce(
    (sum, c) => sum + c.forks.length,
    0,
  );
  const ci = Math.min(
    story.chapters.length - 1,
    Math.floor(choices.length / 3),
  );
  const fork = story.chapters[ci].forks[choices.length % 3];
  const chapter =
    story.chapters[Math.max(0, Math.ceil(choices.length / 3) - 1)];
  const fragments = earnedFragments(choices);
  const flags = new Set(choices.flatMap((c) => c.sets));
  const choiceCount = useRef(choices.length);
  choiceCount.current = choices.length;
  const totalCount = useRef(totalChoices);
  totalCount.current = totalChoices;
  useEffect(() => {
    const syncScreen = () => {
      const screen = window.location.hash.slice(1);
      setView(
        resolveGameScreen(screen, choiceCount.current, totalCount.current),
      );
      window.scrollTo(0, 0);
    };
    syncScreen();
    window.addEventListener("popstate", syncScreen);
    window.addEventListener("hashchange", syncScreen);
    return () => {
      window.removeEventListener("popstate", syncScreen);
      window.removeEventListener("hashchange", syncScreen);
    };
  }, []);
  const go = (v: View) => {
    if (window.location.hash !== "#" + v)
      window.history.pushState(null, "", "#" + v);
    setView(v);
    window.scrollTo(0, 0);
  };
  const start = (selected: Story = story) => {
    setStory(selected);
    setChoices([]);
    setFeedback(null);
    setSaved("");
    go("situation");
  };
  const next = () => {
    if (!feedback) return;
    const updated = [...choices, feedback];
    setChoices(updated);
    setFeedback(null);
    go(updated.length % 3 === 0 ? "chapter" : "read");
  };
  const save = () => {
    try {
      localStorage.setItem(
        "herparalives-v2-sample",
        JSON.stringify({
          storyId: story.id,
          choices: choices.map((c) => c.id),
          completedAt: new Date().toISOString(),
        }),
      );
      setSaved("已保存在这台设备");
    } catch {
      setSaved("浏览器无法保存，请检查存储设置");
    }
  };
  const restore = () => {
    try {
      const raw = localStorage.getItem("herparalives-v2-sample");
      if (!raw) {
        setSaved("这台设备还没有保存记录");
        return;
      }
      const record = JSON.parse(raw);
      if (!Array.isArray(record.choices) || record.choices.length > 15)
        throw new Error();
      const savedStory = storyCatalog.find(
        (e) => e.story.id === (record.storyId ?? sampleStory.id),
      )?.story;
      if (!savedStory) throw new Error();
      const forks = savedStory.chapters.flatMap((c) => c.forks);
      const restored: StoryOption[] = record.choices.map(
        (id: unknown, i: number) => {
          const option = forks[i].options.find((o) => o.id === id);
          if (!option) throw new Error();
          return option;
        },
      );
      setStory(savedStory);
      setChoices(restored);
      setFeedback(null);
      setSaved("已读取本地记录");
      go(
        restored.length === 15
          ? "ending"
          : restored.length > 0 && restored.length % 3 === 0
            ? "chapter"
            : restored.length === 0
              ? "situation"
              : "read",
      );
    } catch {
      setSaved("本地记录无法读取，请重新体验");
    }
  };
  return (
    <main className="museum">
      {view !== "home" && (
        <header className="game-hud">
          <button
            className="game-back"
            onClick={() =>
              go(
                view === "hall" || view === "personal" || view === "collection"
                  ? "home"
                  : "hall",
              )
            }
          >
            ←{" "}
            {view === "hall" || view === "personal" || view === "collection"
              ? "主界面"
              : "故事馆"}
          </button>
          <span className="game-location">
            {view === "hall"
              ? "她们的平行人生 / 故事馆"
              : view === "collection"
                ? "我的人生图鉴"
                : view === "personal"
                  ? "我的平行人生"
                  : story.card.tagline}
          </span>
          <button
            className="game-inventory"
            onClick={() => go(view === "collection" ? "hall" : "collection")}
          >
            ✦ {view === "collection" ? "故事馆" : "图鉴 · " + fragments.length}
          </button>
        </header>
      )}
      {view === "home" && (
        <GameMenu
          onEnter={() => go("hall")}
          onPersonal={() => go("personal")}
          onCollection={() => go("collection")}
          onContinue={
            choices.length
              ? () =>
                  go(
                    choices.length === totalChoices
                      ? "ending"
                      : choices.length % 3 === 0
                        ? "chapter"
                        : "read",
                  )
              : undefined
          }
        />
      )}
      {view === "hall" && <StoryHall onStart={start} />}
      {view === "situation" && (
        <section className="reader">
          <p className="eyebrow">BEFORE THE STORY BEGINS</p>
          <h1>先认识一下，{story.card.name}。</h1>
          <p className="notice">
            {story.status === "placeholder"
              ? "原创虚构开发样篇 · AI 辅助起草 · 尚未内容审校"
              : story.inspiredBy
                ? "灵感来自 " +
                  story.inspiredBy.person +
                  " · " +
                  story.inspiredBy.note
                : "原创虚构人物"}
            {story.aiAssisted && story.status !== "placeholder"
              ? " · AI 辅助创作"
              : ""}
          </p>
          <p className="prose">{story.situation.who}</p>
          <h3>她想要什么</h3>
          <p className="prose">{story.situation.wants}</p>
          <div className="situation-grid">
            <div>
              <h3>手里的资源</h3>
              {story.situation.resources.map((s) => (
                <p key={s}>＋ {s}</p>
              ))}
            </div>
            <div>
              <h3>现实的限制</h3>
              {story.situation.constraints.map((s) => (
                <p key={s}>· {s}</p>
              ))}
            </div>
          </div>
          <button className="primary" onClick={() => go("read")}>
            故事从这里开始 →
          </button>
        </section>
      )}
      {view === "read" && (
        <section className="reader">
          <div className="reader-meta">
            <span>
              第 {ci + 1} 章 / 共 {story.chapters.length} 章 · 岔路{" "}
              {(choices.length % 3) + 1} / 3
            </span>
            <div>
              <button
                aria-label="减小字号"
                onClick={() => setFont(Math.max(16, font - 2))}
              >
                A−
              </button>
              <button
                aria-label="增大字号"
                onClick={() => setFont(Math.min(26, font + 2))}
              >
                A＋
              </button>
            </div>
          </div>
          <div className="progress">
            <i style={{ width: `${(choices.length / totalChoices) * 100}%` }} />
          </div>
          <h1>{story.chapters[ci].title}</h1>
          {fork.echoes
            .filter((e) => flags.has(e.ifFlag))
            .map((e) => (
              <p key={e.ifFlag} className="echo">
                ↳ {e.text}
              </p>
            ))}
          <div className="prose" style={{ fontSize: font }}>
            {fork.scenes.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </div>
          {!feedback ? (
            <>
              <p className="choice-prompt">{fork.prompt}</p>
              <div className="options">
                {fork.options.map((o, i) => (
                  <button key={o.id} onClick={() => setFeedback(o)}>
                    <span>0{i + 1}</span>
                    {o.text}
                    <b>↗</b>
                  </button>
                ))}
              </div>
              <p className="muted small">每个选择都有获得，也有代价。</p>
            </>
          ) : (
            <div className="coach" aria-live="polite">
              <p className="eyebrow">
                选择之后 · {info[feedback.dimension].label}
              </p>
              <h3>{feedback.text}</h3>
              <p>{feedback.reason}</p>
              <p className="muted">代价：{feedback.cost}</p>
              <button className="primary" onClick={next}>
                继续这段人生 →
              </button>
            </div>
          )}
        </section>
      )}
      {view === "chapter" && (
        <section className="reader">
          <p className="eyebrow">A MOMENT TO LOOK BACK</p>
          <h1>{chapter.title} · 章末回望</h1>
          <Radar choices={choices} name={story.card.name} />
          <p className="muted center small">
            五维描述{story.card.name}的处境，不是你的分数。
          </p>
          <div className="coach">
            <span>✧ 一点回望</span>
            <p>{chapter.coachDefault}</p>
          </div>
          <p className="fragment-earned">
            ✦ 收集到一枚「{info[fragments[fragments.length - 1]].label}」碎片
          </p>
          <p className="muted small">
            取本章最常出现的维度；三次各不同时，以最后一次为准。
          </p>
          <button
            className="primary"
            onClick={() =>
              go(choices.length === totalChoices ? "ending" : "read")
            }
          >
            {choices.length === totalChoices ? "走向结局与回望" : "翻开下一章"}{" "}
            →
          </button>
        </section>
      )}
      {view === "ending" && (
        <section className="reader">
          <p className="eyebrow">AN ENDING, AND A BEGINNING</p>
          <h1>{chooseEnding(story, choices).title}</h1>
          <p className="prose">{chooseEnding(story, choices).text}</p>
          <Radar choices={choices} name={story.card.name} />
          <h3>这一路，你替她做过的选择</h3>
          <ol className="choice-history">
            {choices.map((c, i) => (
              <li key={c.id}>
                <small>
                  第 {Math.floor(i / 3) + 1} 章 · {info[c.dimension].label}
                </small>
                {c.text}
              </li>
            ))}
          </ol>
          <div className="coach">
            <span>✧ 留给自己的问题</span>
            <p>{story.closingQuestion}</p>
          </div>
          <div className="actions">
            <button className="primary" onClick={() => go("collection")}>
              看看收集的碎片 →
            </button>
            <button className="secondary" onClick={() => start()}>
              再走一次岔路
            </button>
          </div>
        </section>
      )}
      {view === "collection" && (
        <section className="reader">
          <p className="eyebrow">PIECES OF A LIFE</p>
          <h1>我的人生图鉴</h1>
          <p className="muted">每一种选择，都留下了一点回响。</p>
          <div className="fragment-grid">
            {DIMENSIONS.map((d) => (
              <div key={d} style={{ color: info[d].color }}>
                <span>✦</span>
                <strong>{info[d].label}</strong>
                <small>{fragments.filter((f) => f === d).length} 枚</small>
              </div>
            ))}
          </div>
          <div className="coach">
            <h3>
              {choices.length === totalChoices
                ? "已走完 · " + story.card.tagline
                : "还在路上"}
            </h3>
            <p>
              完成章节后，这里会出现你的碎片。正式账户与跨设备同步尚未接入，开发样篇不发放正式权益。
            </p>
          </div>
          <div className="actions">
            <button className="primary" onClick={save}>
              保存本地体验记录
            </button>
            <button className="secondary" onClick={restore}>
              读取本地记录
            </button>
            <button className="secondary" onClick={() => start()}>
              重新体验
            </button>
          </div>
          <p role="status">{saved}</p>
        </section>
      )}
      {view === "personal" && (
        <section className="reader">
          <p className="eyebrow">YOUR PARALLEL LIFE</p>
          <h1>
            把现实里的问号，
            <br />
            放进另一段人生。
          </h1>
          <p className="prose">
            你的困惑将被改写为虚构角色，经过角色确认后，再走过 3–5 个关键岔路。
          </p>
          <div className="coach">
            <h3>这扇门，还在准备中。</h3>
            <p>
              个人故事生成、脱敏处理和账号权益尚未接入，因此这里暂不收集你的现实困惑。
            </p>
            <p className="muted">
              正式版五种碎片各一枚可兑换一次体验；每完成四条故事提供一次保底解锁。开发样篇不发放正式权益。
            </p>
          </div>
          <button className="primary" onClick={() => go("hall")}>
            去故事馆，体验她的人生 →
          </button>
        </section>
      )}
      {view !== "home" && (
        <p className="game-endnote">人物与未来均为虚构 · 不替你选择人生</p>
      )}
    </main>
  );
}
