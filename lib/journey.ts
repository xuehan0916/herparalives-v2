import type { Fork, Story, StoryOption } from "./story-schema.ts";
import { emptyDimensionState, type DimensionState } from "./dimensions.ts";
import { chapterFragment } from "./fragments.ts";

export type ForkRef = { chapterIndex: number; forkIndex: number; fork: Fork };

/** 沿路径发生过的事：当前在哪、是否走完、刚刚是否收尾了一章、各章做了几次选择。 */
export type Traversal = {
  current: ForkRef | null;
  finished: boolean;
  /** 最后一个选择正好结束了本章（应显示章末回望）。 */
  chapterJustCompleted: boolean;
  completedChapterIndex: number | null;
  /** 每次走完一章时的累计选择数，升序。 */
  boundaries: number[];
  /** 沿路径每章做了几次选择（未进入的章为 0）。 */
  chapterCounts: number[];
};

const refOf = (story: Story, ci: number, fi: number): ForkRef | null => {
  const chapter = story.chapters[ci];
  const fork = chapter?.forks[fi];
  return fork ? { chapterIndex: ci, forkIndex: fi, fork } : null;
};

/** 故事的第一屏岔路。 */
export function firstFork(story: Story): ForkRef | null {
  return refOf(story, 0, 0);
}

/** 用岔路 id 找一个岔路（用于 option.next 的分支与汇合）。 */
export function findFork(story: Story, forkId: string): ForkRef | null {
  for (let ci = 0; ci < story.chapters.length; ci += 1) {
    const fi = story.chapters[ci].forks.findIndex((fork) => fork.id === forkId);
    if (fi >= 0) return refOf(story, ci, fi);
  }
  return null;
}

/** 没有写 next 时的默认推进：本章下一个岔路，没有就进入下一章第一屏。 */
export function linearNext(story: Story, ref: ForkRef): ForkRef | null {
  const chapter = story.chapters[ref.chapterIndex];
  if (ref.forkIndex + 1 < chapter.forks.length) {
    return refOf(story, ref.chapterIndex, ref.forkIndex + 1);
  }
  return refOf(story, ref.chapterIndex + 1, 0);
}

/** 按玩家的选择序列走一遍故事图：支持 option.next 的分叉与汇合。 */
export function traverse(story: Story, choices: StoryOption[]): Traversal {
  const chapterCounts = story.chapters.map(() => 0);
  const boundaries: number[] = [];
  let current = firstFork(story);
  let chapterJustCompleted = false;
  let completedChapterIndex: number | null = null;

  for (let index = 0; index < choices.length; index += 1) {
    if (!current) break; // 故事已结束，多余的选择忽略
    chapterCounts[current.chapterIndex] += 1;
    const option = choices[index];
    const nextRef = option.next
      ? findFork(story, option.next)
      : linearNext(story, current);
    const chapterChanged =
      !nextRef || nextRef.chapterIndex !== current.chapterIndex;
    if (chapterChanged) {
      boundaries.push(index + 1);
      completedChapterIndex = current.chapterIndex;
      chapterJustCompleted = index === choices.length - 1;
    }
    current = nextRef;
  }

  return {
    current,
    finished: current === null,
    chapterJustCompleted,
    completedChapterIndex,
    boundaries,
    chapterCounts,
  };
}

export function isJourneyFinished(story: Story, choices: StoryOption[]) {
  return traverse(story, choices).finished;
}

/** 每章有几个岔路（仅用于估算总选择数；实际路径可能因分支而更短）。 */
export function chapterChoiceCounts(story: Story): number[] {
  return story.chapters.map((chapter) => chapter.forks.length);
}

/** 当前进度落在第几章、章内第几个岔路。 */
export function progressOf(choiceCount: number, counts: number[]) {
  let start = 0;
  for (let index = 0; index < counts.length; index += 1) {
    const end = start + counts[index];
    if (choiceCount < end) {
      return { chapterIndex: index, forkIndex: choiceCount - start };
    }
    start = end;
  }
  const last = counts.length - 1;
  return { chapterIndex: last, forkIndex: Math.max(0, counts[last] - 1) };
}

export function journeyState(choices: StoryOption[]): DimensionState {
  return choices.reduce((state, option) => {
    for (const [dim, delta] of Object.entries(option.deltas))
      state[dim as keyof DimensionState] += delta ?? 0;
    return state;
  }, emptyDimensionState());
}

/** 每完成一章得 1 枚碎片，类型取该章多数维度（并列取最后一次）。 */
export function earnedFragments(story: Story, choices: StoryOption[]) {
  // boundaries 只记录"真正走完"的章，进行中的章不结算。
  const { boundaries } = traverse(story, choices);
  const fragments: ReturnType<typeof chapterFragment>[] = [];
  let start = 0;
  for (const boundary of boundaries) {
    fragments.push(
      chapterFragment(
        choices.slice(start, boundary).map((option) => option.dimension),
      ),
    );
    start = boundary;
  }
  return fragments;
}

export function chooseEnding(story: Story, choices: StoryOption[]) {
  const flags = new Set(choices.flatMap((o) => o.sets));
  return (
    story.endings.find(
      (e) => !e.fallback && e.requires.every((f) => flags.has(f)),
    ) ?? story.endings.find((e) => e.fallback)!
  );
}
