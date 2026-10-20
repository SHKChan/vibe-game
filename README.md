# Vibe Game

www.vibe-game.com 的总页面和全站外壳（顶栏：游戏列表、版本号、问题反馈、定时提醒）。

**线上地址：https://www.vibe-game.com/**

| 游戏 | 线上地址 | 仓库 |
|---|---|---|
| 浮生录（十四亿分之一、江湖一梦、群侠） | https://www.vibe-game.com/life-sim/ | [SHKChan/life-sim](https://github.com/SHKChan/life-sim) |
| 打字游戏 | https://www.vibe-game.com/typing-game/ | [SHKChan/typing-game](https://github.com/SHKChan/typing-game) |
| 像素水族箱 | https://www.vibe-game.com/aquarium/ | [SHKChan/aquairum](https://github.com/SHKChan/aquairum) |
| 逍遥客栈 | https://www.vibe-game.com/xiaoyao-inn/ | [SHKChan/xiaoyao-inn](https://github.com/SHKChan/xiaoyao-inn) |

- `docs/GUIDE.md`：**系列规范**。各游戏仓库的 `CLAUDE.md` 都指向它，做新游戏、改部署和顶栏前先读
- `docs/template/`：新游戏仓库的模板（`CLAUDE.md`、`tools/build.js`、页面骨架、`.gitignore`）
- `public/nav.js`：全站顶栏和游戏登记表 `GAMES`，每个游戏页面用 `<script src="/nav.js" defer></script>` 引用。新增游戏只改这里的 `GAMES`
- `public/index.html`：游戏列表页（游戏卡由 `GAMES` 生成，版本号从各游戏页面读）
- `public/_redirects`：旧网址跳转（`/arthur/` → `/typing-game/`）
- `.claude/agents/`：设计子代理（game / narrative / economy / level designer），只放在这里

部署：Cloudflare Worker `vibe-game`，静态资源目录 `public/`，自定义域名 www.vibe-game.com。推送到 main 自动部署。
