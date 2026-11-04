# 塔罗式抽卡与故事专属人物牌背 · 2026-11-04

保持第一版故事馆和宇宙开屏的整体风格，本轮只增加抽卡演出与角色牌面。

- 完成抽卡登录提示或选择游客后，打开独立抽卡画面：约 0.95 秒洗牌、聚拢至 1.8 秒，再自动翻出故事。可跳过、关闭或按 Escape 返回。
- 背面采用故事自己的角色剪影；正面揭示人物姓名、标题、处境和时长。揭牌后可直接开始故事，或收好卡牌留在故事馆。
- 两侧牌影仅表示洗牌动势，不是伪造的额外故事或可选条目；明确显示当前分类真实故事数量。选择逻辑继续使用原来的 drawStory，保持优先正式内容的规则。
- 系统减少动态效果时直接揭牌；弹层使用原生 dialog，锁定背景滚动，关闭时清理定时器、恢复背景与焦点。
- 当前只为林遥开发样篇建立角色剪影。其 32 岁排版员、版画创作者愿望通过工作衬衫、围裙、试印稿和滚筒体现，未借用首页人物，也未改变样篇未审校状态。
- 普通卡片翻面同样显示专属人物剪影。未来条目通过既有 card.portrait 接入各自的虚构人物形象。

## 素材

采用内置 image_gen 生成，无 CLI 回退。保留工具原图，项目副本：`public/images/linyao-tarot-silhouette.png`，在 `content/stories/sample.ts` 的 card.portrait 登记。角色为故事开发示意，不是已定稿真实人物肖像。

## 最终生成提示词

Use case: stylized-concept. Asset: a single character silhouette illustration for the BACK of a tarot-like narrative game card. Fictional Chinese woman Lin Yao, 32, modern printing-factory typesetter who longs to become a woodcut print artist. Single full-body figure centered, generous transparent margins around all hair arms feet. Contemporary short slightly tousled bob hair, loose rolled-sleeve practical indigo work shirt, plain dark straight trousers, canvas sneakers, a small work apron tied at waist with faint ink marks. Three-quarter side profile looking down at a small stack of printmaking proofs held naturally in one hand; other hand holds a slim brayer printmaking roller. Grounded ordinary working woman, thoughtful and quietly determined, not glamorous, no traditional costume, no flowing gown. Bold opaque silhouette in deep forest green with restrained warm antique-gold engraved contour lines and flat sage highlights suggesting hands, clothing folds and printmaking tools. Elegant modern linocut / woodcut illustration, rich solid shapes rather than photorealism, fine gold etched detail compatible with an atmospheric sage-green and muted-gold tarot card. Face mostly in profile shadow, no direct gaze. No card border, no typography, no symbols, no text, no stars, no surrounding scene, no glow, no haze, no floating cloth. Genuine transparent alpha background. Tall portrait composition.
