import { storySchema, type Story } from "@/lib/story-schema";

// 每条审校过的故事放一个 JSON 文件，并在这里登记。不再沿用旧版的 5 条故事。
const raw: unknown[] = [];

export const stories: Story[] = raw.map((item) => storySchema.parse(item));
