# HerParaLives v2

可玩的女性人生故事馆。按《HerParaLives 产品方案（10/14 版）》重建，旧版代码（xuehan0916/herparalives）只作参考。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # 碎片规则等纯逻辑测试
pnpm lint       # 类型检查
```

"我的平行人生"需要服务端环境变量，见 `.env.example`。

## 结构

| 路径 | 内容 |
|-|-|
| `lib/dimensions.ts` | 五维：安稳、自由、成就、关系、自我（10/20 定稿） |
| `lib/fragments.ts` | 碎片掉落、兑换、保底规则 |
| `lib/story-schema.ts` | 策展故事数据格式：5 章 × 3 岔路 × 3 选项 |
| `content/stories/` | 审校后的故事 JSON |
| `server/llm.ts` | 通义千问（DashScope）调用，沿用旧版 |

## 搭建计划

1. 仓库与脚手架（当前）
2. "她们的人生"主流程：卡牌首页、处境卡、阅读与选择、即时反馈、"因为你曾……"、章末雷达图与 Coach、结局轨迹与回望
3. 五维与碎片、图鉴
4. 我的平行人生：输入困惑、脱敏改写、角色确认、3–5 节点短篇
5. 账号：游客完整体验一篇样篇，存档和兑换时引导登录
