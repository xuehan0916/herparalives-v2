import type { Story, StoryOption } from "./story-schema.ts";
import { emptyDimensionState, type DimensionState } from "./dimensions.ts";
import { chapterFragment } from "./fragments.ts";

export function journeyState(choices: StoryOption[]): DimensionState {
  return choices.reduce((state, option) => {
    for (const [dim, delta] of Object.entries(option.deltas))
      state[dim as keyof DimensionState] += delta ?? 0;
    return state;
  }, emptyDimensionState());
}
export function earnedFragments(choices: StoryOption[]) {
  return Array.from({ length: Math.floor(choices.length / 3) }, (_, i) =>
    chapterFragment(choices.slice(i * 3, i * 3 + 3).map((o) => o.dimension)),
  );
}
export function chooseEnding(story: Story, choices: StoryOption[]) {
  const flags = new Set(choices.flatMap((o) => o.sets));
  return (
    story.endings.find(
      (e) => !e.fallback && e.requires.every((f) => flags.has(f)),
    ) ?? story.endings.find((e) => e.fallback)!
  );
}
