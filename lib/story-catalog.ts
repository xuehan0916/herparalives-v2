import type { Story } from "./story-schema.ts";

// 产品讨论确定按处境组织故事；具体名称仍是可调整的编辑分类，不等于五维。
export const STORY_CATEGORIES = [
  {
    id: "work",
    label: "工作与热爱",
    description: "当谋生、成就与真正想做的事，走向不同的方向。",
  },
  {
    id: "relationships",
    label: "关系与边界",
    description: "在亲近、承诺和自己的空间之间，寻找合适的距离。",
  },
  {
    id: "family",
    label: "家庭与照顾",
    description: "当家人的需要与自己的生活相遇，她会怎样安排？",
  },
  {
    id: "identity",
    label: "自我与成长",
    description: "面对期待与内心的声音，慢慢认识自己想成为的人。",
  },
  {
    id: "change",
    label: "人生转折",
    description: "离开熟悉的地方，在新的阶段重新安放自己。",
  },
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number]["id"];
export type CatalogEntry = {
  story: Story;
  categories: StoryCategory[];
  featured?: boolean;
};
export type CatalogFilter = {
  category?: string;
  query?: string;
  kind?: "all" | Story["kind"];
};

export function filterCatalog(
  entries: CatalogEntry[],
  { category = "all", query = "", kind = "all" }: CatalogFilter = {},
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(({ story, categories }) => {
    if (category !== "all" && !categories.some((c) => c === category))
      return false;
    if (kind !== "all" && story.kind !== kind) return false;
    const categoryNames = STORY_CATEGORIES.filter((c) =>
      categories.includes(c.id),
    ).map((c) => c.label);
    const searchable = [
      story.card.name,
      story.card.tagline,
      story.card.theme,
      story.card.question,
      story.situation.who,
      story.inspiredBy?.person ?? "",
      ...categoryNames,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return words.every((word) => searchable.includes(word));
  });
}

// 没有明确挑选方向时优先推荐成熟的策展故事；本地样篇仅在没有正式故事时回退。
export function drawStory(
  entries: CatalogEntry[],
  random = Math.random,
): CatalogEntry | undefined {
  const published = entries.filter((e) => e.story.status === "published");
  const reviewed = entries.filter((e) => e.story.status === "reviewed");
  const pool = published.length
    ? published
    : reviewed.length
      ? reviewed
      : entries;
  const featured = pool.filter((e) => e.featured);
  const candidates = featured.length ? featured : pool;
  return candidates[
    Math.min(
      candidates.length - 1,
      Math.max(0, Math.floor(random() * candidates.length)),
    )
  ];
}
