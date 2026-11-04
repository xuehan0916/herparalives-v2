import { z } from "zod";
import type { Story, StoryOption } from "./story-schema.ts";
import { earnedFragments } from "./journey.ts";
import { DIMENSIONS, type Dimension } from "./dimensions.ts";

export const LIBRARY_KEY = "herparalives-v2-library";
const recordSchema = z.object({
  id: z.string().min(1).max(100),
  storyId: z.string().min(1).max(100),
  choiceIds: z.array(z.string().max(100)).max(15),
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
  const forks = story.chapters.flatMap((c) => c.forks);
  if (record.choiceIds.length > forks.length) return undefined;
  const choices: StoryOption[] = [];
  for (const [index, id] of record.choiceIds.entries()) {
    const option = forks[index].options.find((o) => o.id === id);
    if (!option) return undefined;
    choices.push(option);
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
    const dropped = earnedFragments(restored.choices);
    for (const d of dropped) fragments[d]++;
    return [
      {
        ...restored,
        record,
        complete:
          restored.choices.length ===
          restored.story.chapters.flatMap((c) => c.forks).length,
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
