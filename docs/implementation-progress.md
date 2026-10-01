# Implementation Progress: AdvanceGuitar Stage 1

## Completed Tasks

- **Task 1:** React、TypeScript、Vite 静态网站基底，响应式侧栏/底部导航与 focused-product 视觉令牌。
- **Task 2:** 音乐模型、离线 Web Audio 合成、麦克风本地音高检测、版本化本机进度和薄弱项算法。
- **Task 3:** 28 天 Markdown 课程、112 组每日练习、300 条短句题库、每日补弱和阶段验收判断。
- **Task 4:** 首页、课程总览、每日课程、专项练习、练习库、进度与设置页面。

## Implementation Summary

- 每条课程由 Markdown frontmatter 绑定四个固定练习：指板、单音、短句、和弦。
- 短句题库按 30/50/80/80/60 分布，其中 240 条用于日常、60 条保留给周测和最终验收。
- 完成一天要求四个固定练习整组提交、完成一组当日补弱，并填写复盘。
- 单音、短句、指板和和弦都支持手动答题；单音与短句支持麦克风逐音识别。
- 进度保存在 localStorage，可导出和恢复 JSON；导入失败不会覆盖现有数据。

## Developer Self-Check

| Check | Command or inspection | Result |
|---|---|---|
| 课程结构 | `npm run validate:content` | 28 天，每天 60 分钟，112 个练习 ID 有效 |
| 静态质量 | `npm run lint` | 通过 |
| 单元测试 | `npm run test` | 8 个测试通过 |
| 生产构建 | `npm run build` | 通过 |
| 端到端测试 | `npm run test:e2e` | 桌面与移动 Chrome，6 / 6 通过 |
| 视觉检查 | 1440px 首页、390px 每日课程截图 | 层级、导航和 320px 规则未见阻断问题 |

## Approved Deviations

- 二音短句若只用 C、D、E、G、A 五个音高，最多只有 20 种不重复排列，无法满足计划的 30 条。短句唯一性因此按“音高序列 + 节奏模板”定义，保持 300 条不重复和 80/20 分区不变。

## Remaining Work / Risks

- 麦克风识别以单音和逐音短句为边界，不识别连续节奏；真实环境中的八度误判仍需通过校准和手动模式兜底。
- 第二至第五阶段只展示路线，不在本次交付中制作课程。
- Playwright 使用本机 Chrome 通道，避免在验证阶段额外下载浏览器二进制。
