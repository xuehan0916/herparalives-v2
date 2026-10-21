// 五维（10/20 定稿）：描述主角此刻的处境，不给用户打分，界面上不显示数字。
export const DIMENSIONS = ["stability", "freedom", "achievement", "relationship", "self"] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export type DimensionInfo = {
  label: string;
  meaning: string;
  tension: Dimension[];
  // 颜色只用来区分维度，不表示好坏。
  color: string;
};

export const DIMENSION_INFO: Record<Dimension, DimensionInfo> = {
  stability: { label: "安稳", meaning: "经济、安全感、可预期的生活", tension: ["freedom"], color: "#6f8f9e" },
  freedom: { label: "自由", meaning: "自主、探索、换一种活法的可能", tension: ["stability"], color: "#d08a5c" },
  achievement: { label: "成就", meaning: "事业、学业、作品，想做成的事", tension: ["relationship"], color: "#5f8f6a" },
  relationship: { label: "关系", meaning: "家人、伴侣、朋友，对他人的承诺与照顾", tension: ["achievement", "self"], color: "#c46f7c" },
  self: { label: "自我", meaning: "身心、边界、内心真正想要的", tension: ["relationship"], color: "#7d64a3" },
};

export type DimensionState = Record<Dimension, number>;

export const emptyDimensionState = (): DimensionState => ({ stability: 0, freedom: 0, achievement: 0, relationship: 0, self: 0 });
