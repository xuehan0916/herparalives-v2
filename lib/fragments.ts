// 碎片规则（产品方案 10/14 图 3，10/16 会议确认）：
// - 每章结束掉 1 枚，类型是本章 3 次选择里出现最多的维度；没有唯一最多时以最后一次为准。
// - 五种各 1 枚，兑换 1 次"我的平行人生"。
// - 每玩完 4 条故事，即使没集齐也解锁 1 次。
// - 和 Life Coach 无关。
import type { Dimension } from "./dimensions.ts";

const ALL: Dimension[] = ["stability", "freedom", "achievement", "relationship", "self"];
export const GUARANTEE_EVERY = 4;

export function chapterFragment(choiceDimensions: Dimension[]): Dimension {
  if (choiceDimensions.length === 0) throw new Error("a chapter needs at least one choice");
  const counts = new Map<Dimension, number>();
  for (const dim of choiceDimensions) counts.set(dim, (counts.get(dim) ?? 0) + 1);
  const max = Math.max(...counts.values());
  const leaders = [...counts].filter(([, n]) => n === max);
  return leaders.length === 1 ? leaders[0][0] : choiceDimensions[choiceDimensions.length - 1];
}

export type FragmentWallet = {
  fragments: Record<Dimension, number>;
  // 可用的"我的平行人生"次数：碎片兑换、保底和分享赠送统一计入。
  credits: number;
  // 上次获得解锁以来玩完的故事数，用于保底。
  storiesSinceUnlock: number;
};

export const emptyWallet = (): FragmentWallet => ({
  fragments: { stability: 0, freedom: 0, achievement: 0, relationship: 0, self: 0 },
  credits: 0,
  storiesSinceUnlock: 0,
});

export const canExchange = (wallet: FragmentWallet) => ALL.every((dim) => wallet.fragments[dim] > 0);

export function addFragment(wallet: FragmentWallet, dim: Dimension): FragmentWallet {
  return { ...wallet, fragments: { ...wallet.fragments, [dim]: wallet.fragments[dim] + 1 } };
}

// 五种各扣 1 枚，换 1 次体验。多出来的同类碎片保留。
export function exchange(wallet: FragmentWallet): FragmentWallet {
  if (!canExchange(wallet)) return wallet;
  const fragments = { ...wallet.fragments };
  for (const dim of ALL) fragments[dim] -= 1;
  return { fragments, credits: wallet.credits + 1, storiesSinceUnlock: 0 };
}

// 一条故事玩完时调用：记入该故事掉落的碎片，并检查保底。
export function completeStory(wallet: FragmentWallet, dropped: Dimension[]): { wallet: FragmentWallet; guaranteed: boolean } {
  let next = dropped.reduce(addFragment, wallet);
  const played = next.storiesSinceUnlock + 1;
  if (played >= GUARANTEE_EVERY) {
    return { wallet: { ...next, credits: next.credits + 1, storiesSinceUnlock: 0 }, guaranteed: true };
  }
  next = { ...next, storiesSinceUnlock: played };
  return { wallet: next, guaranteed: false };
}

export function spendCredit(wallet: FragmentWallet): FragmentWallet {
  if (wallet.credits <= 0) throw new Error("no credits left");
  return { ...wallet, credits: wallet.credits - 1 };
}

// 生成失败时退回已扣的次数。
export const refundCredit = (wallet: FragmentWallet): FragmentWallet => ({ ...wallet, credits: wallet.credits + 1 });
