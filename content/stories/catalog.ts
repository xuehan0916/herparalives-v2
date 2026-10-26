import { stories } from "./index";
import { sampleStory } from "./sample";
import type { CatalogEntry } from "../../lib/story-catalog";

// 每条故事可以属于多个处境。添加正式故事时，在这里补充分类与推荐标记。
// 未审校故事不会自动进入目录；开发样篇单独、明确登记。
export const storyCatalog: CatalogEntry[] = [
  ...stories
    .filter(
      (story) => story.status === "published" || story.status === "reviewed",
    )
    .map((story) => ({ story, categories: [] }) satisfies CatalogEntry),
  { story: sampleStory, categories: ["work", "identity"], featured: true },
];
