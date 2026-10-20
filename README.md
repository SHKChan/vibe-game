# Vibe Game

www.vibe-game.com 的总页面和全站外壳（顶栏、底栏、定时提醒）。

**线上地址：https://www.vibe-game.com/**

| 游戏 | 线上地址 | 仓库 |
|---|---|---|
| 浮生录（十四亿分之一、江湖一梦） | https://www.vibe-game.com/life-sim/ | [SHKChan/life-sim](https://github.com/SHKChan/life-sim) |
| Arthur 的打字游戏 | https://www.vibe-game.com/arthur/ | [SHKChan/typing-game](https://github.com/SHKChan/typing-game) |
| 像素水族箱 | https://www.vibe-game.com/aquarium/ | [SHKChan/aquairum](https://github.com/SHKChan/aquairum) |
| 逍遥客栈 | https://www.vibe-game.com/xiaoyao-inn/ | [SHKChan/xiaoyao-inn](https://github.com/SHKChan/xiaoyao-inn) |

- `public/index.html`：游戏列表页（游戏卡由 `nav.js` 的 `GAMES` 生成）
- `public/nav.js`：全站外壳，每个游戏页面用 `<script src="/nav.js" defer></script>` 引用。顶栏（游戏列表、定时提醒、语言），加了 `<meta name="vg:version">` 的页面还有底栏（面包屑、版本号、问题反馈）。新增游戏只改这里的 `GAMES`
- `docs/template/`：新游戏仓库的模板（打包脚本、部署说明、CLAUDE.md、页面骨架）
- `docs/GUIDE.md`：所有游戏共同的约定（网站结构、命名、版本号、主题、语言、画风、检查、部署），做新游戏前先读

部署：Cloudflare Worker `vibe-game`，静态资源目录 `public/`，自定义域名 www.vibe-game.com。推送到 main 自动部署。
