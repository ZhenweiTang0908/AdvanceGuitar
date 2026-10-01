# AdvanceGuitar

一个中文吉他练耳与指板训练网站。第一阶段用 28 天把声音、指板位置、短句复现和 E/Em 型移动和弦连接起来，每天约 60 分钟。

## 开始使用

```bash
npm install
npm run dev
```

打开终端显示的本地地址。麦克风识别需要在 `localhost` 或 HTTPS 下运行，并且只在用户主动授权后开启。

## 质量检查

```bash
npm run check
npm run test:e2e
```

`npm run check` 会依次验证 28 份课程 Markdown、ESLint、单元测试和生产构建。端到端测试覆盖桌面与移动视口下的主要路径。

## 项目结构

- `content/stage-1/`：28 天课程 Markdown 与 frontmatter 练习绑定
- `src/audio/`：离线 Web Audio 合成、定调、节拍器与本地音高检测
- `src/data/`：确定性题库与 300 条短句题库
- `src/progress/`：本机进度、导入导出、补弱选择和阶段验收
- `src/pages/`：首页、课程、每日页面、练习、题库、进度和设置

真实歌曲由用户自己选择。网站不提供、不下载也不保存受版权保护的录音，只记录歌曲位置、找到的音和复盘。
