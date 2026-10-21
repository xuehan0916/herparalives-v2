"use client";
import { useState } from "react";
import { sampleStory as story } from "@/content/stories/sample";
import { DIMENSIONS, DIMENSION_INFO as info } from "@/lib/dimensions";
import type { StoryOption } from "@/lib/story-schema";
import { chooseEnding, earnedFragments, journeyState } from "@/lib/journey";

type View =
  | "home"
  | "situation"
  | "read"
  | "chapter"
  | "ending"
  | "collection"
  | "personal";
function Radar({ choices }: { choices: StoryOption[] }) {
  const state = journeyState(choices);
  const point = (i: number, r: number) =>
    `${110 + Math.sin((i * Math.PI * 2) / 5) * r},${110 - Math.cos((i * Math.PI * 2) / 5) * r}`;
  return (
    <svg
      viewBox="0 0 220 220"
      className="radar"
      role="img"
      aria-label="林遥的五维处境示意，无数字评分"
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
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState("");
  const ci = Math.min(4, Math.floor(choices.length / 3));
  const fork = story.chapters[ci].forks[choices.length % 3];
  const chapter =
    story.chapters[Math.max(0, Math.ceil(choices.length / 3) - 1)];
  const fragments = earnedFragments(choices);
  const flags = new Set(choices.flatMap((c) => c.sets));
  const go = (v: View) => {
    setView(v);
    window.scrollTo(0, 0);
  };
  const start = () => {
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
      if (!raw) { setSaved("这台设备还没有保存记录"); return; }
      const record = JSON.parse(raw);
      if (!Array.isArray(record.choices) || record.choices.length > 15) throw new Error();
      const forks = story.chapters.flatMap(c => c.forks);
      const restored: StoryOption[] = record.choices.map((id: unknown, i: number) => {
        const option = forks[i].options.find(o => o.id === id);
        if (!option) throw new Error();
        return option;
      });
      setChoices(restored); setFeedback(null); setSaved("已读取本地记录");
      go(restored.length === 15 ? "ending" : restored.length > 0 && restored.length % 3 === 0 ? "chapter" : restored.length === 0 ? "situation" : "read");
    } catch { setSaved("本地记录无法读取，请重新体验"); }
  };
  return (
    <main className="museum">
      <nav className="topbar">
        <button className="brand" onClick={() => go("home")}>
          HerParaLives<small>她的平行人生</small>
        </button>
        <div>
          <button onClick={() => go("home")}>故事馆</button>
          <button onClick={() => go("collection")}>我的图鉴</button>
          <button onClick={() => go("personal")}>我的平行人生 ↗</button>
        </div>
        <span className="tag">本地预览 · 开发样篇</span>
      </nav>
      {view === "home" && (
        <>
          <section className="hero">
            <div>
              <p className="eyebrow">A MUSEUM OF POSSIBLE LIVES</p>
              <h1>
                人生不止一种
                <br />
                她，<em>也可以是你。</em>
              </h1>
              <p className="lead">
                走进她们的人生，在岔路口停一停。
                <br />
                看见每一种选择的获得、代价，和自己的心意。
              </p>
              <button className="primary" onClick={start}>
                翻开一段人生 ↗
              </button>
              <p className="hero-note">
                不替你选择人生，陪你把每种人生多走一段。
              </p>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit" />
              <div className="arch">
                <div className="sun" />
                <div className="hill back" />
                <div className="hill" />
                <div className="path" />
              </div>
              <span className="star">✦</span>
              <span className="art-note">
                另一种可能，
                <br />
                从这里开始。
              </span>
            </div>
          </section>
          <section className="gallery">
            <p className="eyebrow">THEIR LIVES, YOUR CHOICES</p>
            <div className="section-title">
              <h2>她们的人生</h2>
              <p>没有标准答案，只有不同的风景。</p>
            </div>
            <div className="story-grid">
              <article className="story-card">
                <button
                  className="cover"
                  onClick={() => setFlipped(!flipped)}
                  aria-label="翻看故事卡"
                >
                  <small>01 / 创作与生活</small>
                  {flipped ? (
                    <div className="card-back">
                      <h3>{story.card.question}</h3>
                      <p>
                        约 15 分钟 · 情绪强度：轻
                        <br />
                        原创虚构 · AI 辅助开发样篇
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="window-art">✦</div>
                      <div className="cover-title">
                        <small>林遥 · 32 岁</small>
                        <h3>
                          给自己，
                          <br />
                          留一扇窗
                        </h3>
                      </div>
                    </>
                  )}
                  <span className="flip-hint">↻ 翻看故事</span>
                </button>
                <div className="card-bottom">
                  <p>在生活的缝隙里，找回自己的创作。</p>
                  <button onClick={start}>走进她的人生 →</button>
                </div>
              </article>
              <article className="coming-card">
                <span>✳</span>
                <p className="eyebrow">MORE LIVES TO COME</p>
                <h3>
                  还有很多种她，
                  <br />
                  正在走来。
                </h3>
                <p>
                  新的故事将在制作与审校后，
                  <br />
                  陆续进入故事馆。
                </p>
                <small className="tag">故事筹备中</small>
              </article>
              <aside className="invitation">
                <p className="eyebrow">A LETTER TO YOU</p>
                <h3>
                  有些答案，
                  <br />
                  在别人的故事里
                  <br />
                  慢慢变清晰。
                </h3>
                <p>
                  你可以只是来读一个好故事。
                  <br />
                  也可以带着还没想好的问题，
                  <br />
                  借她的人生，多走一小段。
                </p>
                <p>愿你在这里，听见自己。 ✧</p>
              </aside>
            </div>
          </section>
          <section className="personal-banner">
            <span>✦</span>
            <div>
              <p className="eyebrow">YOUR PARALLEL LIFE</p>
              <h2>下一段故事，来自你的生活。</h2>
              <p>收集五种人生碎片，开启「我的平行人生」。</p>
            </div>
            <button className="secondary" onClick={() => go("personal")}>
              了解我的平行人生 ↗
            </button>
          </section>
        </>
      )}
      {view === "situation" && (
        <section className="reader">
          <p className="eyebrow">BEFORE THE STORY BEGINS</p>
          <h1>先认识一下，林遥。</h1>
          <p className="notice">
            原创虚构开发样篇 · AI 辅助起草 · 尚未内容审校
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
              第 {ci + 1} 章 / 共 5 章 · 岔路 {(choices.length % 3) + 1} / 3
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
            <i style={{ width: `${(choices.length / 15) * 100}%` }} />
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
          <Radar choices={choices} />
          <p className="muted center small">
            五维描述林遥的处境，不是你的分数。
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
            onClick={() => go(choices.length === 15 ? "ending" : "read")}
          >
            {choices.length === 15 ? "走向结局与回望" : "翻开下一章"} →
          </button>
        </section>
      )}
      {view === "ending" && (
        <section className="reader">
          <p className="eyebrow">AN ENDING, AND A BEGINNING</p>
          <h1>{chooseEnding(story, choices).title}</h1>
          <p className="prose">{chooseEnding(story, choices).text}</p>
          <Radar choices={choices} />
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
            <button className="secondary" onClick={start}>
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
              {choices.length === 15 ? "已走完 · 给自己，留一扇窗" : "还在路上"}
            </h3>
            <p>
              完成章节后，这里会出现你的碎片。正式账户与跨设备同步尚未接入，开发样篇不发放正式权益。
            </p>
          </div>
          <div className="actions">
            <button className="primary" onClick={save}>
              保存本地体验记录
            </button>
            <button className="secondary" onClick={restore}>读取本地记录</button>
            <button className="secondary" onClick={start}>
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
          <button className="primary" onClick={() => go("home")}>
            先去她们的人生看看 →
          </button>
        </section>
      )}
      <footer>
        <span>
          HerParaLives <small>她的平行人生</small>
        </span>
        <p>
          人物和未来都是虚构的，不预测现实人生。
          <br />
          在她们的人生岔路里，看见自己会如何选择。
        </p>
        <small>本地开发预览 · 2026</small>
      </footer>
    </main>
  );
}
