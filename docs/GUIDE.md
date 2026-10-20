# Vibe Game 系列规范

www.vibe-game.com 下所有游戏共同遵守的规范。**跨仓库的规则只写在这里**；各游戏仓库的 `CLAUDE.md` 只写本仓库自己的参数、玩法细节和明确标出的“例外”。

## 〇、给 agent：怎么用这份规范

- 在任何一个游戏仓库里开始工作前，先读完本文件。本地一般在 `../vibe-game/docs/GUIDE.md`（各仓库放在同一个父目录下），线上原文：https://raw.githubusercontent.com/SHKChan/vibe-game/main/docs/GUIDE.md
- **两处都读不到时，先停下来问用户要这份规范。** 不要凭记忆或猜测去动顶栏、部署、版本号、存档键、网址路径这些跨仓库的东西。
- 优先级：本文件 > 游戏仓库 `CLAUDE.md` 里写明的“例外” > 游戏仓库的其他文档。游戏文档和本文件冲突又没写成例外的，按本文件改，并顺手把游戏文档改对。
- 规范要变（新约定、新例外）时，改本文件；游戏仓库的 `CLAUDE.md` 不重复写规范的内容，只链接过来。

## 一、网站结构

```
www.vibe-game.com/              总页面（仓库 vibe-game，public/）
www.vibe-game.com/nav.js        全站顶栏和游戏登记表 GAMES，所有游戏页面都引用
www.vibe-game.com/life-sim/     浮生录（仓库 life-sim）：大厅 + 十四亿分之一 + 江湖一梦 + 群侠
www.vibe-game.com/typing-game/  打字游戏（仓库 typing-game；旧网址 /arthur/ 由 vibe-game 的 public/_redirects 跳转）
www.vibe-game.com/aquarium/     像素水族箱（仓库 aquarium）
www.vibe-game.com/xiaoyao-inn/  逍遥客栈（仓库 xiaoyao-inn）
www.vibe-game.com/<路径>/        以后的游戏：一个游戏 = 一个仓库 = 一个 Cloudflare Worker = 一条路由
```

- 每个游戏的 Worker 用路由 `www.vibe-game.com/<路径>*` 挂在总域名下；总页面的 Worker 用自定义域名接住其余路径。路由比自定义域名先匹配，互不干扰。
- 只用 Cloudflare 上线，不维护其他部署方式。推送到仓库的生产分支 `main` 就会自动构建部署，所以只推送检查过的版本。
- 所有仓库的生产分支都是 `main`。GitHub 网页上建仓库默认就是 `main`；本地 `git init` 在没设置时默认 `master`，所以本机先设好 `git config --global init.defaultBranch main`。

## 二、Cloudflare 设置

| Worker | 仓库 | Build command | Deploy command | 挂法 |
|---|---|---|---|---|
| `vibe-game` | vibe-game | 无 | `npx wrangler deploy`（读 `wrangler.jsonc`，上传 `public/`） | 自定义域名 `www.vibe-game.com` |
| `life-sim` | life-sim | `node tools/build.js` | `npx wrangler deploy --name life-sim --assets ./dist --compatibility-date=2025-06-01` | 路由 `www.vibe-game.com/life-sim*` |
| `typing-game` | typing-game | `node tools/build.js` | `npx wrangler deploy --name typing-game --assets ./dist --compatibility-date=2025-06-01` | 路由 `www.vibe-game.com/typing-game*` |
| `aquarium` | aquarium | `node tools/build.js` | `npx wrangler deploy --name aquarium --assets ./dist --compatibility-date=2025-06-01` | 路由 `www.vibe-game.com/aquarium*` |
| `xiaoyao-inn` | xiaoyao-inn | `node tools/build.js` | `npx wrangler deploy --name xiaoyao-inn --assets ./dist --compatibility-date=2025-06-01` | 路由 `www.vibe-game.com/xiaoyao-inn*` |

游戏全部是同一个格式（Root directory `/`，Zone 选 `vibe-game.com`）：

```
Build command:  node tools/build.js
Deploy command: npx wrangler deploy --name <路径> --assets ./dist --compatibility-date=2025-06-01
Route:          www.vibe-game.com/<路径>*
```

- **仓库名 = Worker 名 = 网址路径**，三者一致。
- **Worker 收到的是完整路径**：请求 `/<路径>/index.html` 时，它在上传目录里找 `<路径>/index.html`。所以 `tools/build.js` 必须输出到 `dist/<路径>/...`。直接上传仓库根目录会 404。
- **三处对上**：`--name` = Worker 名（不一致报 name mismatch）；`tools/build.js` 的路径 = 路由路径；`--assets ./dist` = 打包输出目录。
- 游戏仓库**不放** `wrangler.jsonc` / `wrangler.toml`，参数都在 Cloudflare 的命令里。只有 vibe-game 用 `wrangler.jsonc`。
- 用构建器的游戏（逍遥客栈的 Vite）也一样：`tools/build.js` 里调用构建器，输出到 `dist/<路径>/`。
- 缓存头放在 `dist/_headers`（打包时生成）：页面和 `config.js` 不缓存，带内容哈希的文件长期缓存。

## 三、每个游戏仓库的样子

```
<仓库>/
├── CLAUDE.md        开头一段“系列规范”（固定写法，见 docs/template/CLAUDE.md）+ 本仓库参数表 + 玩法和代码说明 + 例外
├── index.html       游戏页面（或多个页面）
├── tools/build.js   Cloudflare 的打包入口：把上线需要的文件放进 dist/<路径>/
└── .gitignore       至少有 dist/ node_modules/ .wrangler/
```

- 新游戏直接拷 `vibe-game/docs/template/`，把里面的 `<repo>` `<slug>` `<游戏名>` 换掉。
- `CLAUDE.md` 的参数表写清：网址、路径（slug）、Worker、生产分支、版本号写在哪、存档键前缀。部署的通用规则不要抄进去，链接本文件即可。

## 四、页面接入

| 项 | 做法 |
|---|---|
| 全站顶栏 | `<head>` 里加 `<meta name="vg:version" content="1.0.0">` 和 `<script src="/nav.js" defer></script>`。顶栏不吸顶，跟着页面滚走。左边是游戏列表，右边依次是问题反馈、定时提醒、版本号（最右、最淡）。游戏自己的操作栏放在它下面，可以吸顶 |
| 不做底栏 | 屏幕留给游戏。版本号和问题反馈都在顶栏 |
| 问题反馈 | 顶栏的“问题反馈”默认打开本游戏仓库的 GitHub Issues（仓库写在 `GAMES` 的 `repo`）。游戏有自己的反馈框（例如浮生录会附上当前进度）时，在页面里定义 `window.VG_FEEDBACK = () => …`，顶栏就改为打开它 |
| 定时提醒 | `/nav.js` 提供，游戏不用写。喝水、起来走走、护眼或自定义，20/30/45/60 分钟或自定义，可重复、可开浏览器通知；换游戏、刷新都接着倒计时，多个标签页只响一次 |
| 铺满屏幕的游戏 | 顶栏高度在 CSS 变量 `--vg-nav-h`，容器用 `top: var(--vg-nav-h, 0px)` 让位置；顶栏装好后会触发一次 `resize`（例：逍遥客栈的 `fit()`） |
| 标题 | `<title>游戏名 · Vibe Game</title>`（页面里改标题时也带上后缀） |
| 路径 | 本游戏的文件一律用**相对路径**；只有 `/nav.js` 用 `/` 开头（它归 vibe-game 的 Worker）。写成 `/game.js` 会去找总页面，结果 404 |
| localStorage | 键名加本游戏前缀（整个域名共用一个 localStorage），存档用 `<前缀>.save.v<版本>`，结构改了就升版本。全站共用、游戏不要动的键：`vibe.lang`、`vibe.reminder`、`vibe.reminder.fired` |
| 语言 | **暂时只开中文**：`nav.js` 的 `LANG_OPEN = false`，顶栏没有语言选择，`vibe.lang` 固定 `zh`；游戏也只显示中文（浮生录在 `share/i18n.js` 有同名开关）。已有的翻译留着，开放时两处开关一起改。**例外**：打字游戏（typing-game）界面是英文，见它的 `CLAUDE.md` |
| 主题 | 有主题切换的游戏：暗（默认）、灰、白三种，点一下换下一种，记在 `localStorage`；颜色全部用 CSS 变量，三套都要好看。顶栏会读页面的 `--bg --panel --fg --line --muted --brand`。游戏有特殊显示模式（例如逍遥客栈的纯文字模式）时，在 `body` 上把这几个变量设成那个模式的颜色，顶栏自动跟着变；不要用 `* { color: … !important }` 这类全局规则，会把顶栏一起染掉，限定在游戏自己的容器里 |
| 手机 | 820px 以下单栏，最重要的内容排最上面；按钮区横向滑动，不换行；390px 宽不能有横向滚动 |

以后开放翻译时的做法：界面文字预先翻译（代码写 `t('中文')`，词表按中文原文做键）；剧情、长文本不预先翻译，载入谷歌网页翻译（写 `googtrans=/zh-CN/en` cookie，再载入 `translate.google.com/translate_a/element.js`，藏掉横幅；已按语言写好的元素加 `class="notranslate"`）；钱在中文下显示人民币，其他语言换算成美元。

## 五、版本号和更新日志

**给 agent：每次推送会改变玩家看到的东西（新内容、修 bug、调数值、改界面），都要做两件事：改版本号，写一条更新日志。** 用户不会每次提醒。

- 写在页面的 `vg:version`，格式 `1.5.0`（显示成 `v1.5.0`）。加内容改中间位，修 bug 改末位，大改玩法改首位；每次发布新内容都要改。
- 顶栏和首页游戏卡都从游戏页面读这一行，**发版不用改 vibe-game**。
- 版本号也可以写在游戏设定里、由打包脚本写进 `vg:version`（浮生录：`game.js` 的 `version`，群侠：`qunxia/ui.js` 的 `VERSION`，逍遥客栈：`package.json` 的 `version`）。合集在首页卡片上按 `GAMES` 的 `parts` 分别显示各游戏的版本号。
- **更新日志**：每个游戏仓库根目录放 `CHANGELOG.md`（已有进度文档的写在那里，在本仓库 `CLAUDE.md` 的参数表里注明，例如逍遥客栈的 `docs/progress.md`）。每个版本一节，最新的在最上面：标题写 `## v1.5.0（2026-10-20）`，下面用白话列出玩家能感觉到的变化，数值改动写改前改后。版本号和日志里的标题要对得上。
- 只改文档、注释、测试、打包配置这类玩家看不到的东西，可以不改版本号、不写日志。

## 六、上线新游戏、改路径

1. 拷 `docs/template/`，写好游戏和 `CLAUDE.md` 的参数表。
2. 路径只用小写英文和连字符（古风项目用拼音），不能是别的路径的前缀（路由 `/<路径>*` 是通配，`life` 会吃掉 `life-sim`）。路径就是存档前缀的一部分，上线后不要改。
3. 在 vibe-game 的 `public/nav.js` 给 `GAMES` 加一项（顶栏、首页游戏卡都从这里生成），README 表格加一行，本文件第一、二节的表各加一行。
4. 请用户在 Cloudflare 建 Worker、填第二节的命令和路由（agent 没有 Dashboard 权限，把要填的值整理给用户）。
5. 非改不可的路径变更：vibe-game 的 `public/_redirects` 加旧路径到新路径的 301；游戏的 localStorage 前缀一起改，第一次打开时把旧键拷过来；请用户删掉旧路由。

## 七、推送前检查

- [ ] `node tools/build.js` 成功，生成 `dist/<路径>/index.html`
- [ ] 本地预览：`npx wrangler dev --assets ./dist --compatibility-date=2025-06-01`，打开 `http://localhost:8787/<路径>/`，没有 404（本地看不到顶栏，`/nav.js` 是 404，正常）。要看顶栏，就把 vibe-game 的 `public/` 和各游戏的 `dist/*/` 拼到一个目录里一起预览
- [ ] 代码里没有以 `/` 开头的本游戏资源路径（`/nav.js` 除外）
- [ ] 改了玩家看得到的东西：版本号改了，更新日志写了，两边版本号对得上
- [ ] 游戏自己的检查（模拟器、测试）全过；改了界面就截图看电脑和 390px 手机宽度
- [ ] 推送后在 Cloudflare 的 Deployments 页面确认构建成功，再打开线上地址看一眼
- [ ] 改了 vibe-game 的 `nav.js`：它会被所有游戏加载，要在每个游戏页面（含手机宽度）检查

## 八、技术约定

- 默认纯静态：原生 JavaScript、普通 `<script>`，不用构建器、不用 npm 包，双击 `index.html` 也能玩（`file://`）。例外：逍遥客栈用 Vite + TypeScript（已有项目，不改）。新游戏要用构建器先问用户。
- 不依赖境外资源：不引 Google 字体（或做成可关闭、异步加载）、不引外部 CDN。页面尽量小（浮生录打包后约 2.3 MB）。
- `config.js` 放部署相关的值（网址、站名、反馈仓库），不缓存，改完推送就生效。
- 要后端时（排行榜、不要账号的反馈）用本游戏的 Worker 加 `/api/*`，密钥只放 Worker 的密钥里。

## 九、画风

| 画风 | 状态 | 说明 |
|---|---|---|
| **像素风** | 系列统一风格，默认用这个 | 全部用代码在 Canvas 上画，不用美术素材。场景约 240×110 像素放大显示，人物十几个像素高，头像 20×24。暗、灰、白主题下都要看得清 |
| 水墨 | 《孤城尸潮》做过，已存档 | 适合古风；可以做成皮肤 |
| 扁平 | 已存档 | 色块干净，适合信息多的画面 |
| 战术（雷达） | 已存档 | 深底亮线，适合策略、塔防的俯视图 |

- 换画风只换一套绘制函数，规则和数据不动。存档的画风代码留着，以后做皮肤切换。
- 截图里的装饰性乱码（“机读码”那种）不要加。
- 场景框画“你此刻在哪儿、和谁在一起”：在家就画家和家里人（还有宠物），出门上班、看病、旅行的那一年画那个地方和陪着的人。

## 十、内容和检查

- 剧情文字预先写好，不调用 AI 生成。
- 文风：中文、第二人称“你”、短句白描、每段 1–4 句；不用“——”插入语、不用“不是……而是……”、不用表情符号；不写政治、不写真实品牌和名人；死亡一句带过。
- 基调：日子有难处也有盼头，难处后面给一点暖意或转机，别一路灰到底。
- **每个抉择的选项都要有后果**，而且后面读得到；选项数按情节定 2–4 个。
- **前后要对得上**：已婚不能写成单身，和爸妈同住了不能再问要不要接来，一岁不吃牛肉面，九十岁不领舞。做一个“逻辑检查”（lint）规则表，模拟时逐行检查，报出来必须清零。
- **随机性**：同类事件要有足够大的池子、按人物处境筛选，文字里的地点、人名、金额随机取，否则几局下来都是同一批事。
- 有剧情的游戏写一个无界面的模拟器（浮生录的 `share/tools/simulate.js`），一次跑几百局，检查运行错误、死节点、选项数、后果、逻辑矛盾，并打印分布看像不像真的。

## 十一、命名

- **只有古风（古代中国背景）的项目，仓库名、目录名用拼音**，例如 `jianghuyimeng`、`xiaoyao-inn`。其他一律用英文，例如 `life-sim`、`1in1.4b`。游戏里显示的名字照样用中文。
- 《孤城尸潮》不是古风，上线时仓库和路径用英文名（例如 `zombie-siege`），不要用 `gucheng-shichao`。

## 十二、传播

- 必须用自己的域名。`*.workers.dev`、`*.pages.dev` 在国内被污染，打不开。
- 用 itdog.cn / boce.com 测国内各地能不能打开。
- 社交分享以**图片**为主：图片不会被当成外链拦截。小红书、抖音正文不放链接；不用短链接；文案别像广告。
- 准备一个备用域名，微信拦了就换，改 `config.js` 的网址即可。

## 十三、和 Claude 协作

- 用户偏好：用中文交流；改完检查通过后直接提交、推送，不用等审阅代码；最后用白话总结改了什么。
- 大改动先搭好“工具层”（数据接口、检查工具），写进 SPEC，再把内容按文件分给多个助手并行写，每个助手只改自己的文件，避免互相覆盖。并行助手四五个是上限，长任务要能从中断处接着做。
- 模拟器的检查规则就是给助手的“验收标准”，规则越具体，返工越少。
- 设计子代理（game-designer、narrative-designer、economy-designer、level-designer）**只放在 vibe-game 的 `.claude/agents/`**，游戏仓库不放副本，免得各份改得不一样。
  - 在 vibe-game 里工作时它们直接可用。
  - 在游戏仓库里需要时，按需读取：本地 `../vibe-game/.claude/agents/<名字>.md`，或线上 `https://raw.githubusercontent.com/SHKChan/vibe-game/main/.claude/agents/<名字>.md`；把文件正文（frontmatter 以下）连同具体任务交给一个通用子代理去做。用不到就不用读。
  - 引擎类代理（Unity、Unreal、Godot、Roblox、Blender 等）和纯静态网页游戏无关，不要放进来。
