import { z } from "zod";
import type { Story, StoryOption } from "./story-schema.ts";
import {
  earnedFragments,
  findFork,
  firstFork,
  isJourneyFinished,
  linearNext,
} from "./journey.ts";
import { DIMENSIONS, type Dimension } from "./dimensions.ts";

export const LIBRARY_KEY = "herparalives-v2-library";
const recordSchema = z.object({
  id: z.string().min(1).max(100),
  storyId: z.string().min(1).max(100),
  choiceIds: z.array(z.string().max(100)).max(40),
  updatedAt: z.string().datetime(),
});
export type JourneyRecord = z.infer<typeof recordSchema>;

export function parseLibrary(raw: string | null): JourneyRecord[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.slice(0, 100).flatMap((item) => {
      const parsed = recordSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
  } catch {
    return [];
  }
}

export function upsertJourney(records: JourneyRecord[], record: JourneyRecord) {
  return [record, ...records.filter((r) => r.id !== record.id)].slice(0, 100);
}

export function restoreJourney(
  record: JourneyRecord,
  stories: Story[],
): { story: Story; choices: StoryOption[] } | undefined {
  const story = stories.find((s) => s.id === record.storyId);
  if (!story) return undefined;
  const choices: StoryOption[] = [];
  // 按故事图逐屏还原：选项可能通过 next 跳到别的岔路，不能假设顺序线性。
  let current = firstFork(story);
  for (const id of record.choiceIds) {
    if (!current) return undefined;
    const option = current.fork.options.find((o) => o.id === id);
    if (!option) return undefined;
    choices.push(option);
    current = option.next ? findFork(story, option.next) : linearNext(story, current);
  }
  return { story, choices };
}

export function summarizeLibrary(records: JourneyRecord[], stories: Story[]) {
  const fragments = Object.fromEntries(DIMENSIONS.map((d) => [d, 0])) as Record<
    Dimension,
    number
  >;
  const journeys = records.flatMap((record) => {
    const restored = restoreJourney(record, stories);
    if (!restored || restored.choices.length === 0) return [];
    const dropped = earnedFragments(restored.story, restored.choices);
    for (const d of dropped) fragments[d]++;
    return [
      {
        ...restored,
        record,
        complete: isJourneyFinished(restored.story, restored.choices),
      },
    ];
  });
  return {
    fragments,
    journeys,
    totalFragments: Object.values(fragments).reduce((a, b) => a + b, 0),
    completed: journeys.filter((j) => j.complete).length,
  };
}
