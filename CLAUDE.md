# vibe-game

www.vibe-game.com 的总页面（游戏列表）和全站外壳 `/nav.js`（顶栏：游戏列表、版本号、问题反馈、定时提醒；游戏登记表 `GAMES`）。Cloudflare Worker `vibe-game`，静态资源目录 `public/`，推送到 main 自动部署。

- 先读 `docs/GUIDE.md`：所有游戏共同的约定，包括网站结构、Cloudflare 设置、命名、版本号、主题、语言和画风。
- 上线新游戏时，改 `public/nav.js` 的 `GAMES`（顶栏、首页游戏卡都从这里生成；版本号不写这里，从游戏页面的 `vg:version` 读）和 `README.md` 的表格。新游戏仓库从 `docs/template/` 拷。
- `nav.js` 会被所有游戏页面加载：样式全部加 `vg-` 前缀并重置继承，不要依赖宿主页面的样式；改完要在各游戏页面（含手机宽度）检查。
- `.claude/agents/` 里有 4 个设计用的子代理：game / narrative / economy / level designer。每个游戏仓库里都有一份相同的副本，改的话要同步。
