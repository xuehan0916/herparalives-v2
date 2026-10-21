// "她们的人生"策展故事的数据格式。故事全部预制并审校，上线后不实时生成。
// 结构（10/20 产品团队）：1 条故事 5 章，每章 3 个岔路，每个岔路 3 个选项。
import { z } from "zod";
import { DIMENSIONS } from "./dimensions.ts";

const dimension = z.enum(DIMENSIONS);
const flag = z.string().regex(/^[a-z0-9_]+$/);

export const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  // 本次选择变化最大的维度：即时反馈只展示这一维，章末碎片也按它统计。
  dimension,
  direction: z.enum(["up", "down"]),
  // 即时反馈卡：原因和代价，例如"你接受了母亲的支持 / 代价：下个月的决定要和她商量"。
  reason: z.string(),
  cost: z.string(),
  // 不展示给用户的内部变化量，用于雷达图形状和结局轨迹。
  deltas: z.partialRecord(dimension, z.number().int().min(-3).max(3)).default({}),
  // 记下这个选择，供后面章节的"因为你曾……"和结局判定使用。
  sets: z.array(flag).default([]),
});

export const forkSchema = z.object({
  id: z.string(),
  // 一屏一个场景。
  scenes: z.array(z.string()).min(1),
  // "因为你曾……"：早先的选择在这里兑现。
  echoes: z.array(z.object({ ifFlag: flag, text: z.string() })).default([]),
  prompt: z.string(),
  options: z.array(optionSchema).length(3),
});

export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  forks: z.array(forkSchema).length(3),
  // 章末 Coach 两三句话：按本章碎片维度选一条，只引用发生过的事。
  coach: z.partialRecord(dimension, z.string()),
  coachDefault: z.string(),
});

export const endingSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  // 满足所有 flag 的结局优先；都不满足时用 fallback。
  requires: z.array(flag).default([]),
  fallback: z.boolean().default(false),
});

export const storySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  // placeholder：仅用来跑通流程，不对外上线。
  status: z.enum(["placeholder", "draft", "reviewed", "published"]),
  kind: z.enum(["inspired", "ordinary"]),
  inspiredBy: z.object({ person: z.string(), note: z.string(), sources: z.array(z.string()) }).optional(),
  card: z.object({
    name: z.string(),
    portrait: z.string().optional(),
    tagline: z.string(),
    // 卡牌背面
    theme: z.string(),
    minutes: z.number().int(),
    intensity: z.enum(["轻", "中", "重"]),
    question: z.string(),
  }),
  situation: z.object({
    who: z.string(),
    wants: z.string(),
    resources: z.array(z.string()),
    constraints: z.array(z.string()),
  }),
  chapters: z.array(chapterSchema).length(5),
  endings: z.array(endingSchema).min(1).refine((list) => list.some((e) => e.fallback), "needs one fallback ending"),
  // 结局 Coach 整局回望的开放问题。
  closingQuestion: z.string(),
  aiAssisted: z.boolean(),
});

export type Story = z.infer<typeof storySchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Fork = z.infer<typeof forkSchema>;
export type StoryOption = z.infer<typeof optionSchema>;
export type Ending = z.infer<typeof endingSchema>;
