"use client";
import { useEffect, useRef, useState } from "react";
import { sampleStory } from "@/content/stories/sample";
import { storyCatalog } from "@/content/stories/catalog";
import GameMenu from "./game-menu";
import StoryHall from "./story-hall";
import VortexScene from "./vortex-scene";
import MySpace from "./my-space";
import LoginOverlay from "./login-overlay";
import type { AuthStatus } from "@/lib/auth-contract";
import {
  LIBRARY_KEY,
  parseLibrary,
  restoreJourney,
  upsertJourney,
  type JourneyRecord,
} from "@/lib/local-library";
import { DIMENSIONS, DIMENSION_INFO as info } from "@/lib/dimensions";
import type { Story, StoryOption } from "@/lib/story-schema";
import {
  chooseEnding,
  earnedFragments,
  journeyState,
  traverse,
} from "@/lib/journey";
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
  const [library, setLibrary] = useState<JourneyRecord[]>([]);
  const [auth, setAuth] = useState<AuthStatus>({ configured: false });
  const [login, setLogin] = useState<"draw" | "account" | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const pendingDraw = useRef<(() => void) | null>(null);
  const guestDrawAllowed = useRef(false);
  const runId = useRef<string | null>(null);
  useEffect(() => {
    setLogin(null);
    pendingDraw.current = null;
  }, [view]);
  useEffect(() => {
    try {
      let records = parseLibrary(localStorage.getItem(LIBRARY_KEY));
      if (!records.length) {
        const raw = localStorage.getItem("herparalives-v2-sample");
        if (raw) {
          const legacy = JSON.parse(raw);
          records = parseLibrary(
            JSON.stringify([
              {
                id: "legacy-record",
                storyId: legacy.storyId ?? sampleStory.id,
                choiceIds: legacy.choices,
                updatedAt: legacy.completedAt,
              },
            ]),
          );
        }
      }
      setLibrary(records);
    } catch {
      /* 存储不可用时仍允许游玩。 */
    }
    const controller = new AbortController();
    fetch("/api/auth/status", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then(setAuth)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const totalChoices = story.chapters.reduce(
    (sum, c) => sum + c.forks.length,
    0,
  );
  // 按故事图逐屏推进：选项可以用 next 跳支线或汇合，不能只看选择次数算位置。
  const path = traverse(story, choices);
  // 阅读页永远显示"当前所在"的章；章末页才显示刚走完的那一章。
  const readerChapterIndex =
    path.current?.chapterIndex ?? Math.max(0, story.chapters.length - 1);
  const readerChapter = story.chapters[readerChapterIndex];
  const forkIndex = path.current?.forkIndex ?? Math.max(0, readerChapter.forks.length - 1);
  const fork = path.current?.fork ?? readerChapter.forks[forkIndex];
  const chapter = path.chapterJustCompleted
    ? story.chapters[path.completedChapterIndex ?? 0]
    : readerChapter;
  const fragments = earnedFragments(story, choices);
  const flags = new Set(choices.flatMap((c) => c.sets));
  const choiceCount = useRef(choices.length);
  choiceCount.current = choices.length;
  const totalCount = useRef(totalChoices);
  totalCount.current = totalChoices;
  const boundariesRef = useRef(path.boundaries);
  boundariesRef.current = path.boundaries;
  useEffect(() => {
    const syncScreen = () => {
      const screen = window.location.hash.slice(1);
      setView(
        resolveGameScreen(
          screen,
          choiceCount.current,
          totalCount.current,
          boundariesRef.current,
        ),
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
  const persistJourney = (updated: StoryOption[]) => {
    if (!runId.current) runId.current = crypto.randomUUID();
    const record: JourneyRecord = {
      id: runId.current,
      storyId: story.id,
      choiceIds: updated.map((o) => o.id),
      updatedAt: new Date().toISOString(),
    };
    const records = upsertJourney(library, record);
    setLibrary(records);
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(records));
    } catch {
      setSaved("这台设备暂时无法保存记录，请保持当前页面打开。");
    }
  };
  const resumeRecord = (record: JourneyRecord) => {
    const restored = restoreJourney(
      record,
      storyCatalog.map((e) => e.story),
    );
    if (!restored) return;
    setStory(restored.story);
    setChoices(restored.choices);
    setFeedback(null);
    runId.current = record.id;
    const restoredPath = traverse(restored.story, restored.choices);
    go(
      restored.choices.length === 0
        ? "situation"
        : restoredPath.chapterJustCompleted
          ? "chapter"
          : restoredPath.finished
            ? "ending"
            : "read",
    );
  };
  const requestDraw = (action: () => void) => {
    if (auth.userLabel || guestDrawAllowed.current) {
      action();
      return;
    }
    pendingDraw.current = action;
    setLogin("draw");
  };
  const closeLogin = () => {
    setLogin(null);
    pendingDraw.current = null;
  };
  const continueGuest = () => {
    guestDrawAllowed.current = true;
    setLogin(null);
    const action = pendingDraw.current;
    pendingDraw.current = null;
    action?.();
  };
  const signedIn = (label: string) => {
    setAuth({ ...auth, userLabel: label });
    setLogin(null);
    const action = pendingDraw.current;
    pendingDraw.current = null;
    action?.();
  };
  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) setAuth({ configured: auth.configured });
    } catch {
      setSaved("暂时无法退出登录，请稍后再试。");
    }
  };
  const start = (selected: Story = story) => {
    runId.current = crypto.randomUUID();
    setStory(selected);
    setChoices([]);
    setFeedback(null);
    setSaved("");
    go("situation");
  };
  const next = () => {
    if (!feedback) return;
    const updated = [...choices, feedback];
    persistJourney(updated);
    setChoices(updated);
    setFeedback(null);
    const after = traverse(story, updated);
    go(after.chapterJustCompleted ? "chapter" : after.finished ? "ending" : "read");
  };
  return (
    <main
      className={
        "museum immersive screen-" +
        view +
        (motionPaused ? " motion-paused" : "")
      }
    >
      <VortexScene active={view === "home"} paused={motionPaused} />
      <header className={"game-hud" + (view === "home" ? " home-hud" : "")}>
        {view === "home" ? (
          <button className="game-wordmark" onClick={() => go("home")}>
            H
            <span>
              HERPARALIVES<small>她的平行人生</small>
            </span>
          </button>
        ) : (
          <>
            <button
              className="game-back"
              onClick={() =>
                go(
                  view === "hall" ||
                    view === "personal" ||
                    view === "collection"
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
                  ? "我的 · 人生收藏"
                  : view === "personal"
                    ? "我的平行人生"
                    : story.card.tagline}
            </span>
          </>
        )}
        <div className="hud-tools">
          <button
            className="motion-toggle"
            aria-label={motionPaused ? "开启动效" : "暂停动效"}
            aria-pressed={motionPaused}
            onClick={() => setMotionPaused(!motionPaused)}
          >
            {motionPaused ? "▷" : "Ⅱ"}
            <span>动效</span>
          </button>
          <button
            className="my-entry"
            onClick={() => go("collection")}
            aria-label="我的"
          >
            <span className="my-avatar" aria-hidden="true">
              ✧
            </span>
            <span>我的</span>
            {auth.userLabel && <i className="signed-in-dot" />}
          </button>
        </div>
      </header>
      {view === "home" && (
        <GameMenu
          onEnter={() => go("hall")}
          onPersonal={() => go("personal")}
          onContinue={
            choices.length
              ? () =>
                  go(
                    path.chapterJustCompleted
                      ? "chapter"
                      : path.finished
                        ? "ending"
                        : "read",
                  )
              : library[0]
                ? () => resumeRecord(library[0])
                : undefined
          }
        />
      )}
      {view === "hall" && (
        <StoryHall onStart={start} onRequestDraw={requestDraw} />
      )}
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
              第 {readerChapterIndex + 1} 章 / 共 {story.chapters.length} 章 · 岔路{" "}
              {forkIndex + 1}
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
            <i
              style={{
                width: `${(path.boundaries.length / story.chapters.length) * 100}%`,
              }}
            />
          </div>
          <h1>{readerChapter.title}</h1>
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
              go(path.finished ? "ending" : "read")
            }
          >
            {path.finished ? "走向结局与回望" : "翻开下一章"}{" "}
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
        <MySpace
          records={library}
          userLabel={auth.userLabel}
          onLogin={() => setLogin("account")}
          onLogout={logout}
          onResume={resumeRecord}
          onExplore={() => go("hall")}
        />
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
      {saved && (
        <p className="storage-status" role="status">
          {saved}
        </p>
      )}
      {login && (
        <LoginOverlay
          reason={login}
          auth={auth}
          onClose={closeLogin}
          onGuest={continueGuest}
          onSuccess={signedIn}
        />
      )}
    </main>
  );
}
