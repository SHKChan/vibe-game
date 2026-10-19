# vibe-game

www.vibe-game.com 的总页面（游戏列表）和全站顶栏 `/nav.js`。Cloudflare Worker `vibe-game`，静态资源目录 `public/`，推送到 main 自动部署。

- 先读 `docs/GUIDE.md`：所有游戏共同的约定，包括网站结构、Cloudflare 设置、命名、版本号、主题、语言和画风。
- 上线新游戏时，要改 `public/nav.js` 的 `GAMES`、`public/index.html` 的游戏卡片，以及 `README.md` 的表格。
- `.claude/agents/` 里有 4 个设计用的子代理：game / narrative / economy / level designer。每个游戏仓库里都有一份相同的副本，改的话要同步。
