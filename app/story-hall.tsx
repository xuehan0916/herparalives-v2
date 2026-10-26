import { useState } from "react";
import { storyCatalog } from "@/content/stories/catalog";
import {
  drawStory,
  filterCatalog,
  STORY_CATEGORIES,
  type CatalogEntry,
} from "@/lib/story-catalog";
import type { Story } from "@/lib/story-schema";

function StoryCard({
  entry,
  drawn,
  onStart,
}: {
  entry: CatalogEntry;
  drawn: boolean;
  onStart: (story: Story) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const { story, categories } = entry;
  return (
    <article
      className={`story-card hall-card${drawn ? " drawn-card" : ""}`}
      aria-label={story.card.tagline}
    >
      {drawn && (
        <p className="drawn-label" role="status">
          ✧ 为你抽到的这一段人生
        </p>
      )}
      <button
        className="cover"
        onClick={() => setFlipped(!flipped)}
        aria-label={`${flipped ? "翻回" : "翻看"}${story.card.name}的故事卡`}
        aria-pressed={flipped}
      >
        <small>{story.card.theme}</small>
        {flipped ? (
          <div className="card-back">
            <h3>{story.card.question}</h3>
            <p>
              约 {story.card.minutes} 分钟 · 情绪强度：{story.card.intensity}
            </p>
            <p>
              {story.inspiredBy
                ? `灵感人物：${story.inspiredBy.person}`
                : "原创虚构人物"}
            </p>
            {story.inspiredBy && <small>{story.inspiredBy.note}</small>}
          </div>
        ) : (
          <>
            <div className="window-art" aria-hidden="true">
              ✦
            </div>
            <div className="cover-title">
              <small>{story.card.name}</small>
              <h3>{story.card.tagline}</h3>
            </div>
          </>
        )}
        <span className="flip-hint">
          {flipped ? "↶ 翻回人物" : "↻ 翻看议题与时长"}
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
        <p>{story.card.question}</p>
        <div className="story-card-meta">
          <small>
            {story.status === "placeholder"
              ? "开发样篇 · AI 辅助 · 未审校"
              : story.aiAssisted
                ? "AI 辅助创作"
                : "策展故事"}
          </small>
          <span>约 {story.card.minutes} 分钟</span>
        </div>
        <button className="card-play" onClick={() => onStart(story)}>
          体验这一段人生 <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

export default function StoryHall({
  onStart,
}: {
  onStart: (story: Story) => void;
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Story["kind"]>("all");
  const [drawnId, setDrawnId] = useState<string>();
  const selectedCategory = STORY_CATEGORIES.find((c) => c.id === category);
  const visible = filterCatalog(storyCatalog, { category, query, kind });
  const draw = () => {
    const entry = drawStory(visible);
    if (entry) setDrawnId(entry.story.id);
  };
  const reset = () => {
    setCategory("all");
    setQuery("");
    setKind("all");
    setDrawnId(undefined);
  };
  return (
    <section className="story-hall" aria-label="故事馆">
      <header className="hall-heading">
        <p className="eyebrow">她们的平行人生</p>
        <h1>故事馆</h1>
        <p>先选一种处境，再走进一个她的人生。</p>
      </header>
      <div className="hall-layout">
        <aside className="hall-categories" aria-label="按处境分类">
          <p className="category-heading">她正在经历什么？</p>
          <button
            className={category === "all" ? "selected" : ""}
            aria-pressed={category === "all"}
            onClick={() => {
              setCategory("all");
              setDrawnId(undefined);
            }}
          >
            <span>全部人生</span>
            <small>{storyCatalog.length}</small>
          </button>
          {STORY_CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={category === c.id ? "selected" : ""}
              aria-pressed={category === c.id}
              onClick={() => {
                setCategory(c.id);
                setDrawnId(undefined);
              }}
            >
              <span>{c.label}</span>
              <small>
                {filterCatalog(storyCatalog, { category: c.id }).length}
              </small>
            </button>
          ))}
        </aside>
        <div className="hall-main">
          <div className="category-intro">
            <h2>{selectedCategory?.label ?? "每一种处境，都有不同的走法。"}</h2>
            <p>
              {selectedCategory?.description ??
                "可以从熟悉的处境开始，也可以去看看从未想过的生活。"}
            </p>
          </div>
          <div className="hall-tools">
            <label className="story-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="搜索故事、人物或处境"
                placeholder="寻找故事、人物或处境"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDrawnId(undefined);
                }}
              />
            </label>
            <label className="story-kind">
              <span className="sr-only">故事来源</span>
              <select
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value as typeof kind);
                  setDrawnId(undefined);
                }}
              >
                <option value="all">所有人物</option>
                <option value="inspired">人物启发</option>
                <option value="ordinary">原创女性</option>
              </select>
            </label>
          </div>
          <div className="hall-draw">
            <div>
              <span aria-hidden="true">✧</span>
              <p>
                还没想好从谁开始？<small>让一段人生，先与你相遇。</small>
              </p>
            </div>
            <button
              className="secondary"
              disabled={visible.length === 0}
              onClick={draw}
            >
              替我抽一张
            </button>
          </div>
          <p className="hall-result-count" role="status">
            {visible.length
              ? `${visible.length} 段可体验的人生`
              : "暂时没有符合条件的故事"}
            {query.trim() && ` · 搜索「${query.trim()}」`}
          </p>
          {visible.length ? (
            <div className="hall-deck">
              {[...visible]
                .sort(
                  (a, b) =>
                    Number(b.story.id === drawnId) -
                    Number(a.story.id === drawnId),
                )
                .map((entry) => (
                  <StoryCard
                    key={entry.story.id}
                    entry={entry}
                    drawn={entry.story.id === drawnId}
                    onStart={onStart}
                  />
                ))}
            </div>
          ) : (
            <div className="hall-empty">
              <span aria-hidden="true">✧</span>
              <h3>
                {query || kind !== "all"
                  ? "换个线索，再找找看。"
                  : "这一类人生，正在慢慢写成。"}
              </h3>
              <p>
                {query || kind !== "all"
                  ? "试试其他人物、处境，或放宽筛选条件。"
                  : "故事完成制作与审校后，会出现在这里。先去看看其他处境中的她。"}
              </p>
              <button className="secondary" onClick={reset}>
                看看全部人生
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
