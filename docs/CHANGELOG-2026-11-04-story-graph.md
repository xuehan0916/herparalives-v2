# 改动说明：故事结构可配置 + 分叉/汇合 + 标杆故事

> 分支：`feat/configurable-story-graph`
> 日期：2026-11-04
> 目标：把"固定 5 章 × 3 岔路 × 3 选项"改成**可配置的故事图**，并接通 `option.next` 的分叉与汇合；同时落地一条标杆故事验证字段是否够用。

---

## 一、这次改了什么（一句话版）

1. **结构可配置**：章节 3–8 章、每章 1–4 个岔路、每岔 2–4 个选项（不再写死 5×3×3）。
2. **分叉与汇合可跑**：选项可写 `next` 指向任意岔路；页面按故事图逐屏推进，不再靠"选择次数 ÷ 3"推算位置。
3. **标杆故事落地**：新增受林巧稚启发的虚构故事《陈映真》，用它验证分叉→汇合→组合结局。
4. **修了一个显示 bug**：从章末点"翻开下一章"后，标题曾停留在上一章。

---

## 二、四条冲突的决议（本次实现前提）

| # | 冲突 | 决议 | 本次是否改动 |
|---|---|---|---|
| 1 | 碎片机制 | 按仓库现状（一类碎片、按五维、每章 1 枚、五维各 1 枚兑换、每 4 篇保底） | 未改规则，只把"每章"改成按可配置章节结算 |
| 2 | 五维名称 | 按仓库现状（安稳 / 自由 / 成就 / 关系 / 自我） | 未改 |
| 3 | 分支预算 | 按方案 v2.3（8–12 次选择 / 2–3 条主路线 / 3+ 结局） | **改成可配置**（见下） |
| 4 | 个人入口门槛 | 按仓库现状（碎片兑换 + 4 篇保底） | 未改 |

---

## 三、逐文件改动

### 1. `lib/story-schema.ts`（数据结构）
- **放宽结构**：`chapters` 由 `length(5)` 改为 `min(3).max(8)`；`forks` 由 `length(3)` 改为 `min(1).max(4)`；`options` 由 `length(3)` 改为 `min(2).max(4)`。
- **选项新增字段**：`intent`（选择意图）、`gain`（可能获得）、`unknown`（仍未可知）、`outcome`（选后即时后果）、`next`（下一岔路 id，用于分叉/汇合）——均为可选，旧故事不受影响。
- **故事新增字段**：`version`（默认 `1.0.0`，重走/存档要按版本匹配）、`disclaimer`（展示用虚构声明 + 是否虚构机构）、`person`（年龄/人生阶段/职业/主要关系/不可推翻的事实）、`access`（权益，默认 `free`）、`qa`（检验标准 / 反例检查 / 审校人 / 日期）。
- **结局新增字段**：`losses`（损失）、`unresolved`（未解决问题），保证"没有正确组合"。

### 2. `lib/journey.ts`（推进逻辑，改动最大）
- 新增故事图遍历：
  - `firstFork()` / `findFork(id)` / `linearNext()`：定位与默认推进。
  - **`traverse(story, choices)`**：按选择序列走图，返回 `current`（当前岔路）、`finished`（是否走完）、`chapterJustCompleted`（最后一步是否收尾一章）、`completedChapterIndex`、`boundaries`（各章结束时的累计选择数）、`chapterCounts`（沿路径每章做了几次选择）。
  - `isJourneyFinished()`。
- `earnedFragments(story, choices)`：**改为按 `boundaries` 结算**——只有真正走完的章才掉碎片（进行中的章不掉），避免"2 次选择就发碎片"的误判。
- `journeyState` / `chooseEnding` 逻辑不变（结局仍按 `sets` 旗标匹配 + fallback）。
- 保留 `chapterChoiceCounts()` / `progressOf()` 作为通用工具。

### 3. `lib/game-navigation.ts`（浏览器前进/后退）
- 章末判定改为**实际边界数组** `boundaries`（默认值 `[3,6,9,12,15]`，兼容旧的固定结构），不再用 `% 3`。

### 4. `lib/local-library.ts`（本地存档）
- 还原路径改为**按故事图逐屏还原**（选项可能通过 `next` 跳到别的岔路，不能再按顺序平铺取）。
- 完结判定改用 `isJourneyFinished()`。
- 存档里 `choiceIds` 上限由 15 提到 40（可配置结构下选择数可能更多）。

### 5. `app/experience.tsx`（页面）
- 阅读页、章末页、结局页的推进全部改为 `traverse()` 驱动：
  - 阅读页显示**当前所在**的章；章末页显示**刚走完**的那一章。
  - 继续/续玩/存档恢复的落点统一用 `chapterJustCompleted / finished` 判定。
- **修复**：从章末点"翻开下一章"后，标题曾停留在上一章（现在阅读页用当前章，章末页用完成章）。
- 阅读页的"岔路"指示改为只显示当前第几屏（分支章节里"每章几个岔路"不再有唯一分母）。

### 6. 新增 `content/stories/chen-yingzhen.ts`（标杆故事，draft）
- 受林巧稚启发的虚构女医生《陈映真》，3 章：
  - CH-01（不肯治疗的病人）→ **两条不同支线**：`CH-02-clinic`（继续劝说/尊重决定）或 `CH-02-public`（转介）
  - CH-02 两条支线**汇合**到 CH-03（关系选择）
  - 结局按 `sets` 旗标命中：`deep-clinic`（投入）/ `sustainable`（设边界）/ `collective`（寻求协作），另有 fallback
- 完整用上新增字段：`version`、`disclaimer`、`person`、`access`、`qa`（含反例检查）、选项的 `intent/gain/unknown/outcome/next`、结局的 `losses/unresolved`。
- **正文是研发用占位文本**，`status: "draft"`，正式文案待内容负责人重写与审校。

### 7. `content/stories/catalog.ts`
- 标杆故事以"开发样篇"身份登记（`featured: false`），**不会**因为 draft 状态进入正式目录逻辑。

### 8. 测试
- `lib/journey.test.ts`：更新签名；新增"可配置章长"用例（2+4+3=9 次/3 章）、"标杆故事分叉→汇合"、"三种旗标结局 + 3 枚碎片"。
- 新增 `lib/story-schema.test.ts`：验证 3 章×2 岔×2 选项可解析、新字段生效、超出上下限被拒。

---

## 四、验证结果

| 检查 | 结果 |
|---|---|
| `npm run lint`（tsc --noEmit） | ✅ 通过 |
| `npm test` | ✅ **22 个测试全过** |
| `npm run build`（Next 生产构建） | ✅ 通过 |
| 浏览器端到端（标杆故事实跑） | ✅ 第1章"继续劝说"→章末→**进入临床变体**的第2章→章末→第3章→章末（最后一步）→结局《她把能力压在一个人身上》 |

E2E 路径证明了：`next` 跳转生效、两条支线能分别进入不同情境、汇合到第 3 章、结局按旗标命中。

---

## 五、兼容性与风险

- **旧结构仍兼容**：`5 章 × 3 岔路 × 3 选项` 落在新的上下限内，现有 `sampleStory` 全部测试通过。
- **碎片数量会变**：只有"走完的章"才掉碎片。对于有分支、跳章的路径，一局碎片数可能少于章节总数（这是预期行为）。
- **存档上限变化**：`choiceIds` 15 → 40；旧存档（≤15 条）照常读取。
- **阅读页进度指示**：不再显示"岔路 x / 总数"，只显示当前第几屏——分支结构下没有唯一分母。
- **未做**：`option.next` 只在数据层与遍历层接通，**没有**做"从任意历史节点回跳"的分支管理 UI（重走仍走既有的截断逻辑）。
- **标杆故事未审校**：draft + 占位正文，不可作为正式内容上线。

---

## 六、如何回退（重要）

本次改动集中在一个独立分支 + 一个合并提交，回退很干净，三种方式任选：

1. **只回退代码、保留记录**（推荐）
   ```bash
   git revert -m 1 <本次的 merge commit>
   git push origin main
   ```
2. **把 main 指回改动前**
   ```bash
   git reset --hard 6013929   # 本次改动前的 main
   git push --force-with-lease origin main
   ```
   （`6013929` 是改动前的 HEAD：`Refine parallel-life atmosphere and add tarot story draws`）
3. **先只在分支上调试**：改动都在 `feat/configurable-story-graph` 分支，main 未受影响时可随时 `git checkout main` 回去。

**回退后需要确认**：`content/stories/chen-yingzhen.ts` 与 `lib/story-schema.test.ts` 是新增文件，`git revert` 会自动删除；`catalog.ts` 里的样篇登记也会一并撤销。

---

## 七、后续建议

1. 把标杆故事按方案 v2.3 扩到 **8–12 次选择、2–3 条主路线、3+ 结局**（现在是 3 次选择的最小切片）。
2. 补「角色确认页」与个人入口的生成链路（方案里仍缺）。
3. 故事版本号已进 schema，但**存档写入/校验还未用上**——需要在保存时记录 `story.version`，结构升级时做兼容。
4. 若要做"从任意节点重走"的分支管理，需在 `traverse` 之上加路径快照（当前是截断重放）。
