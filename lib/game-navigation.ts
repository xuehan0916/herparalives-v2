export const GAME_SCREENS = [
  "home",
  "hall",
  "situation",
  "read",
  "chapter",
  "ending",
  "collection",
  "personal",
] as const;
export type GameScreen = (typeof GAME_SCREENS)[number];

/** 旧版固定 5 章 × 3 岔路的章末位置；真实故事用 traverse().boundaries 传入。 */
export const DEFAULT_CHAPTER_BOUNDARIES = [3, 6, 9, 12, 15];

// 浏览器返回只切换屏幕，不撤销已经做出的选择。历史屏幕必须匹配当前体验进度。
export function resolveGameScreen(
  value: string,
  choices: number,
  total: number,
  boundaries: number[] = DEFAULT_CHAPTER_BOUNDARIES,
): GameScreen {
  if (!GAME_SCREENS.includes(value as GameScreen)) return "home";
  const screen = value as GameScreen;
  if (["read", "chapter", "ending"].includes(screen)) {
    if (choices === 0) return "situation";
    if (choices >= total) return "ending";
    const atChapterEnd = boundaries.includes(choices);
    if (screen === "chapter" && !atChapterEnd) return "read";
    if (screen === "ending") return atChapterEnd ? "chapter" : "read";
  }
  return screen;
}
