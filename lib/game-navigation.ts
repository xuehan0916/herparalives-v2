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

// 浏览器返回只切换屏幕，不撤销已经做出的选择。历史屏幕必须匹配当前体验进度。
export function resolveGameScreen(
  value: string,
  choices: number,
  total: number,
): GameScreen {
  if (!GAME_SCREENS.includes(value as GameScreen)) return "home";
  const screen = value as GameScreen;
  if (["read", "chapter", "ending"].includes(screen)) {
    if (choices === 0) return "situation";
    if (choices >= total) return "ending";
    if (screen === "chapter" && choices % 3 !== 0) return "read";
    if (screen === "ending") return choices % 3 === 0 ? "chapter" : "read";
  }
  return screen;
}
