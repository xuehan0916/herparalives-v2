import { useRef, useState } from "react";
import { storyCatalog } from "@/content/stories/catalog";
import {
  drawStory,
  filterCatalog,
  STORY_CATEGORIES,
  type CatalogEntry,
} from "@/lib/story-catalog";
import type { Story } from "@/lib/story-schema";
import TarotDraw from "./tarot-draw";

function StoryCard({
  entry,
  drawn,
  onStart,
  index,
}: {
  entry: CatalogEntry;
  drawn: boolean;
  onStart: (story: Story) => void;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const { story, categories } = entry;
  return (
    <article
      className={[
        "story-card hall-card relic-card",
        drawn ? "drawn-card" : "",
      ].join(" ")}
      aria-label={story.card.tagline}
    >
      {drawn && (
        <p className="drawn-label" role="status">
          ✧ 这一次，她与你相遇
        </p>
      )}
      <button
        className={["cover relic-cover", flipped ? "is-flipped" : ""].join(" ")}
        aria-label={(flipped ? "翻回" : "翻看") + story.card.name + "的故事卡"}
        aria-pressed={flipped}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="relic-inner">
          <div className="relic-front" aria-hidden={flipped}>
            <span className="relic-corner top-left" />
            <span className="relic-corner top-right" />
            <span className="relic-serial">
              LIFE / {(index + 1).toString().padStart(2, "0")}
            </span>
            <div className="portrait-halo" />
            {story.card.portrait ? (
              <div
                className="story-specific-portrait"
                style={{ backgroundImage: `url("${story.card.portrait}")` }}
              />
            ) : (
              <svg
                className="story-card-concept"
                viewBox="0 0 160 200"
                aria-hidden="true"
              >
                <path fill="#9fae8d15" stroke="#cbbc8a" d="M36 36h88v132H36z" />
                <path
                  fill="#cbbb8a22"
                  stroke="#d7cca1"
                  d="M36 36l47 17v132l-47-17z"
                />
                <path
                  fill="none"
                  stroke="#d7cca1"
                  d="M44 52l30 11m-30 3l30 11m-30 3l30 11m-30 3l30 11M76 121v10M83 150l41-35"
                />
                <circle cx="107" cy="73" r="8" fill="#d7cca1" />
                <path
                  stroke="#b6c49b"
                  fill="none"
                  d="M90 100h25m-25 5h25m-25 5h25"
                />
              </svg>
            )}
            <div className="portrait-floor" />
            <span className="relic-theme">{story.card.theme}</span>
            <div className="cover-title">
              <small>{story.card.name}</small>
              {!story.card.portrait && (
                <span className="story-character-pending">
                  角色待建立 · 封面示意
                </span>
              )}
              <h3>{story.card.tagline}</h3>
            </div>
            <span className="relic-star">✧</span>
          </div>
          <div
            className={
              "relic-back" + (story.card.portrait ? " has-character" : "")
            }
            aria-hidden={!flipped}
          >
            {story.card.portrait && (
              <div
                className="character-card-back"
                style={{ backgroundImage: `url("${story.card.portrait}")` }}
                aria-hidden="true"
              />
            )}
            <span className="relic-star">✧</span>
            <small>她将如何选择？</small>
            <h3>{story.card.question}</h3>
            <p>{story.card.theme}</p>
            <p>
              约 {story.card.minutes} 分钟 · 情绪强度 {story.card.intensity}
            </p>
            <p>
              {story.inspiredBy
                ? "灵感人物：" + story.inspiredBy.person
                : "原创虚构人物"}
            </p>
            {story.inspiredBy && <small>{story.inspiredBy.note}</small>}
          </div>
        </div>
        <span className="flip-hint">
          {flipped ? "↶ 翻回人物" : "轻触，翻开她的处境"}
        </span>
      </button>
      <div className="card-bottom">
        <div className="story-tags">
          {categories.map((id) => (
            <span key={id}>
              {STORY_CATEGORIES.find((c) => c.id === id)?.label}
            </span>
          ))}
        </div>
        <button className="card-play" onClick={() => onStart(story)}>
          体验这一段人生 <span>→</span>
        </button>
        <div className="story-card-meta">
          <small>
            {story.status === "placeholder"
              ? "体验样篇 · AI 辅助 · 未审校"
              : story.aiAssisted
                ? "AI 辅助创作"
                : "策展故事"}
          </small>
          <span>约 {story.card.minutes} 分钟</span>
        </div>
      </div>
    </article>
  );
}

export default function StoryHall({
  onStart,
  onRequestDraw,
}: {
  onStart: (story: Story) => void;
  onRequestDraw: (action: () => void) => void;
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Story["kind"]>("all");
  const [drawnId, setDrawnId] = useState<string>();
  const [drawing, setDrawing] = useState<{
    story: Story;
    poolCount: number;
  } | null>(null);
  const deck = useRef<HTMLDivElement>(null);
  const drawTrigger = useRef<HTMLButtonElement>(null);
  const selectedCategory = STORY_CATEGORIES.find((c) => c.id === category);
  const visible = filterCatalog(storyCatalog, { category, query, kind });
  const reset = () => {
    setCategory("all");
    setQuery("");
    setKind("all");
    setDrawnId(undefined);
  };
  const draw = () =>
    onRequestDraw(() => {
      const entry = drawStory(visible);
      if (entry) {
        setDrawnId(entry.story.id);
        setDrawing({ story: entry.story, poolCount: visible.length });
      }
    });
  return (
    <section className="story-hall" aria-label="故事馆">
      {drawing && (
        <TarotDraw
          story={drawing.story}
          poolCount={drawing.poolCount}
          onClose={() => {
            setDrawing(null);
            requestAnimationFrame(() =>
              drawTrigger.current?.focus({ preventScroll: true }),
            );
            deck.current?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
              block: "center",
            });
          }}
          onStart={(story) => {
            setDrawing(null);
            onStart(story);
          }}
        />
      )}
      <header className="hall-heading">
        <p className="eyebrow">THE HALL OF OTHER LIVES</p>
        <h1>故事馆</h1>
        <p>
          有些岔路，你还没走过。
          <br />
          有些心意，等一个她来唤醒。
        </p>
      </header>
      <div className="hall-categories" aria-label="按处境分类">
        <button
          aria-pressed={category === "all"}
          className={category === "all" ? "selected" : ""}
          onClick={() => {
            setCategory("all");
            setDrawnId(undefined);
          }}
        >
          全部人生
        </button>
        {STORY_CATEGORIES.map((c) => (
          <button
            key={c.id}
            aria-pressed={category === c.id}
            className={category === c.id ? "selected" : ""}
            onClick={() => {
              setCategory(c.id);
              setDrawnId(undefined);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="category-intro">
        <p>{selectedCategory?.description ?? "此刻的你，想靠近哪一种人生？"}</p>
      </div>
      <div className="hall-tools">
        <label className="story-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="搜索故事、人物或处境"
            placeholder="寻找一个她，或一种处境"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDrawnId(undefined);
            }}
          />
        </label>
        <div className="source-filters" aria-label="故事来源">
          {(
            [
              { id: "all", label: "全部人物" },
              { id: "inspired", label: "人物启发" },
              { id: "ordinary", label: "原创女性" },
            ] as const
          ).map((k) => (
            <button
              key={k.id}
              aria-pressed={kind === k.id}
              className={kind === k.id ? "selected" : ""}
              onClick={() => {
                setKind(k.id);
                setDrawnId(undefined);
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <div className="hall-deck" ref={deck}>
        {visible.length ? (
          [...visible]
            .sort(
              (a, b) =>
                Number(b.story.id === drawnId) - Number(a.story.id === drawnId),
            )
            .map((entry, i) => (
              <StoryCard
                key={entry.story.id}
                entry={entry}
                drawn={entry.story.id === drawnId}
                onStart={onStart}
                index={i}
              />
            ))
        ) : (
          <div className="hall-empty">
            <span aria-hidden="true">✧</span>
            <h3>
              {query || kind !== "all"
                ? "换个线索，寻找另一个她。"
                : "这一种人生，还在慢慢写成。"}
            </h3>
            <p>也许，另一个岔路口已有故事在等你。</p>
            <button className="secondary" onClick={reset}>
              看看全部人生
            </button>
          </div>
        )}
      </div>
      <div className="hall-draw">
        <span aria-hidden="true" className="draw-sigil">
          ✧
        </span>
        <div>
          <p>不如，让一段人生先遇见你。</p>
          <small>从当前故事中，抽一张与你相遇的卡。</small>
        </div>
        <button
          ref={drawTrigger}
          className="secondary"
          disabled={!visible.length}
          onClick={draw}
        >
          替我抽一张 <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className="hall-result-count" role="status">
        {visible.length
          ? visible.length + " 段人生，静候翻开"
          : "这里暂时没有故事"}
        {query.trim() ? " · " + query.trim() : ""}
      </p>
    </section>
  );
}
