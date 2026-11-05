// "她们的人生"策展故事的数据格式。故事全部预制并审校，上线后不实时生成。
//
// 结构可配置（《故事架构确认稿 v1》，见 docs/STORY_ARCHITECTURE.md）：
//   章节 3–8 章 · 每章 1–4 个岔路 · 每个岔路 2–4 个选项
//   目标预算：8–12 次选择、2–3 条主路线、3 个以上结局
// 旧的固定结构是"5 章 × 3 岔路 × 3 选项"，现改为上下限约束，仍兼容该写法。
import { z } from "zod";
import { DIMENSIONS } from "./dimensions.ts";

const dimension = z.enum(DIMENSIONS);
const flag = z.string().regex(/^[a-z0-9_]+$/);

export const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  // 选择意图（内部标注：这个选项在保护什么），不直接展示给用户。
  intent: z.string().optional(),
  // 预期得失：可能获得 / 需要付出的代价 / 仍未可知。
  gain: z.string().optional(),
  cost: z.string(),
  unknown: z.string().optional(),
  // 即时后果：选后立刻发生的一屏剧情。省略时由下一场景承接。
  outcome: z.string().optional(),
  // 本次选择变化最大的维度：即时反馈只展示这一维，章末碎片也按它统计。
  dimension,
  direction: z.enum(["up", "down"]),
  // 即时反馈卡：原因和代价，例如"你接受了母亲的支持 / 代价：下个月的决定要和她商量"。
  reason: z.string(),
  // 不展示给用户的内部变化量，用于雷达图形状和结局轨迹。
  deltas: z.partialRecord(dimension, z.number().int().min(-3).max(3)).default({}),
  // 记下这个选择，供后面章节的"因为你曾……"和结局判定使用。
  sets: z.array(flag).default([]),
  // 下一步：可指向任意岔路 id，用来表达分叉与汇合；省略时按顺序进入下一岔路。
  next: z.string().optional(),
});

export const forkSchema = z.object({
  id: z.string(),
  // 一屏一个场景。
  scenes: z.array(z.string()).min(1),
  // "因为你曾……"：早先的选择在这里兑现（定义在哪个岔路，就在哪里出现）。
  echoes: z.array(z.object({ ifFlag: flag, text: z.string() })).default([]),
  prompt: z.string(),
  options: z.array(optionSchema).min(2).max(4),
});

export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  forks: z.array(forkSchema).min(1).max(4),
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
  // 收益 / 损失 / 未解决问题：保证"没有正确组合"。
  losses: z.array(z.string()).default([]),
  unresolved: z.array(z.string()).default([]),
});

export const storySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  // 故事版本号：重走与存档需要按版本匹配；结构变化时必须升版本。
  version: z.string().default("1.0.0"),
  // placeholder：仅用来跑通流程，不对外上线。
  status: z.enum(["placeholder", "draft", "reviewed", "published"]),
  kind: z.enum(["inspired", "ordinary"]),
  inspiredBy: z
    .object({
      person: z.string(),
      note: z.string(),
      sources: z.array(z.string()),
    })
    .optional(),
  // 展示用虚构声明：开头、结尾、关键节点都要能让用户看到。
  disclaimer: z
    .object({
      text: z.string(),
      virtualInstitutions: z.boolean().default(false),
    })
    .optional(),
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
  // 人物：年龄 / 人生阶段 / 职业 / 主要关系 / 不可推翻的事实。
  person: z
    .object({
      ageRange: z.string().optional(),
      stage: z.string().optional(),
      occupation: z.string().optional(),
      relations: z.array(z.string()).default([]),
      fixedFacts: z.array(z.string()).default([]),
    })
    .optional(),
  situation: z.object({
    who: z.string(),
    wants: z.string(),
    resources: z.array(z.string()),
    constraints: z.array(z.string()),
  }),
  chapters: z.array(chapterSchema).min(3).max(8),
  endings: z
    .array(endingSchema)
    .min(1)
    .refine((list) => list.some((e) => e.fallback), "needs one fallback ending"),
  // 结局 Coach 整局回望的开放问题。
  closingQuestion: z.string(),
  aiAssisted: z.boolean(),
  // 权益（预留，首发不启用）。
  access: z.enum(["free", "unlock", "paid"]).default("free"),
  // 审校与反例检查记录。
  qa: z
    .object({
      testCriteria: z.array(z.string()).default([]),
      counterExamples: z.array(z.string()).default([]),
      reviewer: z.string().optional(),
      date: z.string().optional(),
    })
    .optional(),
});

export type Story = z.infer<typeof storySchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Fork = z.infer<typeof forkSchema>;
export type StoryOption = z.infer<typeof optionSchema>;
export type Ending = z.infer<typeof endingSchema>;
