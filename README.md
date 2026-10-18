# Vibe Game

www.vibe-game.com 的总页面和全站顶栏。

- `public/index.html`：游戏列表页
- `public/nav.js`：全站顶栏，每个游戏页面用 `<script src="/nav.js" defer></script>` 引用；新增游戏只改这里的 `GAMES`
- `docs/GUIDE.md`：所有游戏共同的约定（网站结构、命名、版本号、主题、语言、画风、检查、部署），做新游戏前先读

部署：Cloudflare Worker `vibe-game`，静态资源目录 `public/`，自定义域名 www.vibe-game.com。推送到 main 自动部署。
