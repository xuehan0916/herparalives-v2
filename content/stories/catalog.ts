import { stories } from "./index";
import { sampleStory } from "./sample";
import { chenYingzhenStory } from "./chen-yingzhen";
import { chenYingzhenHalfStory } from "./chen-yingzhen-half";
import type { CatalogEntry } from "../../lib/story-catalog";

// 每条故事可以属于多个处境。添加正式故事时，在这里补充分类与推荐标记。
// 未审校故事不会自动进入目录；开发样篇单独、明确登记。
export const storyCatalog: CatalogEntry[] = [
  ...stories
    .filter(
      (story) => story.status === "published" || story.status === "reviewed",
    )
    .map((story) => ({ story, categories: [] }) satisfies CatalogEntry),
  { story: sampleStory, categories: ["work", "identity"], featured: false },
  // 标杆故事（草案）：验证分叉→汇合与组合结局，未经内容审校，排在样篇之后。
  { story: chenYingzhenStory, categories: ["work", "identity"], featured: false },
  // 正式标杆故事：5 章 × 每章 3 次选择（15 次选择），内容同学提供的正式稿。
  { story: chenYingzhenHalfStory, categories: ["work", "identity"], featured: true },
];
