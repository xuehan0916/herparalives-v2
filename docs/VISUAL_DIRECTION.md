# 女性人生漩涡与账号入口（2026-11-04）

## 本轮实现

开屏以不同年龄和身份的女性为主题，用绘制的螺旋场景、带透明通道的人物图集、Canvas 前景剪影与星尘组成向镜头展开的景深动效。主入口保持直接进入故事馆，点击时有短暂靠近场景的过渡。动效可暂停，尊重系统「减少动态效果」，页面隐藏时停止绘制。

故事馆延续深墨绿、暖金、暗紫的叙事空间；处境分类作为细线导航，故事以带人物剪影的立体翻转卡呈现。搜索、来源筛选、推荐抽卡与空状态保留，不用虚构故事填充目录。

右上角「我的」直接进入收藏空间，整合人生碎片和图鉴。第一次主动抽卡时提示登录，可跳过并继续游客抽卡；打开游戏和浏览故事不触发登录弹层。登录页面使用原生 dialog 的焦点与 Escape 关闭行为。

## 数据和登录的实际边界

- 每次人生体验分配一个旅程 ID，同一旅程逐次更新，避免自动保存多次发放章末碎片。
- 游客旅程、选择和碎片保存在当前浏览器；刷新后可从「我的图鉴」恢复。旧版手动保存记录在格式有效时迁入当前收藏视图。
- 本机记录不是服务端权益凭据，不代表已完成跨设备同步或正式兑换。
- 已实现短信登录的界面与服务端接口（Supabase Auth 适配）。只有配置 `SUPABASE_URL`、`SUPABASE_ANON_KEY`，并在服务方启用 SMS provider 后，才能真实收发验证码。未配置时禁用发送和验证，明确显示「短信登录暂未开放」，仍可游客体验。
- 会话使用 HttpOnly Cookie；前端不接触 access/refresh token。测试和视觉验收未发送真实短信。

## 素材

使用内置 `image_gen` 工具生成，未使用 CLI 回退。原始生成文件保留，项目使用以下副本：

- `public/images/lives-vortex.png`：开屏背景画。
- `public/images/women-silhouettes.png`：4 × 2 透明女性人物图集，供 Canvas 与卡牌复用。已检查 alpha 通道。

### 背景最终提示词

Use case: stylized-concept. Asset type: cinematic background illustration for an immersive Chinese narrative game, HerParaLives. Create a wide landscape 16:9 richly layered painterly illustration, NOT a UI mockup. A hypnotic spiral vortex of MANY WOMEN'S SILHOUETTES at different stages of life, twenty or more distinct figures: young adult with long hair, student holding books, professional woman in trousers, artist, mother walking beside daughter, middle-aged woman, elderly woman with a bun, woman with short hair, woman with walking stick. Human elegant realistic silhouette proportions, diverse everyday activities, ordinary women with dignity. Figures follow curved trails spiraling from a distant luminous oval portal at center (50% x, 47% y) toward the viewer in the outer edges, different scales, some large softly out-of-focus silhouettes cropped at edges. Poetic silk-like translucent fabric and wisps interweaving in a swirling galaxy of lives. Golden dust, very fine celestial orbits, deep volumetric atmospheric depth, exquisite textured hand-painted art direction, graceful and mysterious rather than horror, not a superhero film. Palette: very dark midnight forest teal and charcoal aubergine background, desaturated sage silhouettes, muted antique gold and warm cream rim light, a little dusty rose and slate lilac. Center 35% of frame relatively quiet and dark enough for cream Chinese title text to be overlaid by application; a gentle distant golden halo behind it. Make the silhouette spiral the dominant powerful composition, NOT generic galaxy scenery. No words, no type, no interface, no letters, no border, no watermarks. Wide high quality game key art.

### 人物图集最终提示词

Use case: illustration-story. Asset type: transparent game sprite atlas of female silhouette figures, for an animated spiral of women at different stages of life. Draw EIGHT individual FULL BODY figures arranged in an exact evenly spaced 4-column by 2-row grid (4 across, 2 down). Each woman centered entirely within her own equal rectangular tile, generous margin, figures do not overlap tiles, feet fully visible, no grounds or shadows, NO text, no captions, no tiles or border lines. All figures share one cohesive beautiful softly textured paper-cut silhouette style, colors dark desaturated sage green, smoky gray teal, a little pale antique gold rim light, details subtly visible like hair/clothing only, not cartoon flat featureless blobs. Top row left to right: 1 young adult woman with flowing long hair and long dress walking, 2 young adult student with backpack holding a book, 3 professional woman in trousers carrying satchel, 4 woman painter holding sketchbook at side. Bottom row left to right: 5 mother holding a small child's hand together as one silhouette, 6 middle-aged woman with bob hair and relaxed coat, 7 elderly woman with hair in bun holding a walking stick, 8 elderly woman with silver short hair, a long skirt and open relaxed arms. Elegant believable human anatomy and natural different poses, real adult woman proportions, dignified and warm. Transparent background outside the eight silhouettes. Composition ratio wide landscape, 4x2 contact sheet. No additional objects, text, scenery or glow outside the figures.
