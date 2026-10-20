# vibe-game

www.vibe-game.com 的总页面和全站顶栏 `/nav.js`，也是整个系列的**规范所在地**。Cloudflare Worker `vibe-game`，静态资源目录 `public/`，推送到 main 自动部署。

- `docs/GUIDE.md` 是系列规范，所有游戏仓库的 agent 都按它做，各游戏的 `CLAUDE.md` 开头会指过来。先读它。
  - 跨仓库的规则（部署、顶栏、版本号、存档键、语言、画风、文风、协作习惯）只写在 GUIDE，不要再抄进游戏仓库；游戏仓库只写参数和例外。
  - 改了规范（尤其是新增“例外”或改了游戏要做的事），检查各游戏仓库的 `CLAUDE.md` 和 `docs/template/CLAUDE.md` 是否要跟着改参数表或例外说明。
- `public/nav.js`：所有游戏页面都加载它。样式全部加 `vg-` 前缀并重置继承，不依赖宿主页面；改完要在每个游戏页面（含 390px 手机宽度）检查（GUIDE 第七节）。
- 上线新游戏、改路径：按 GUIDE 第六节（`GAMES` 加一项、README 表格、GUIDE 的表、`_redirects`）。
- `.claude/agents/` 的 4 个设计子代理只放在这里，游戏仓库不放副本（用法见 GUIDE 第十三节）。
