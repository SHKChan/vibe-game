# Vibe Game 系列：做新游戏前先读

这份文档记录 www.vibe-game.com 下所有游戏共同遵守的约定，以及做《浮生录》（十四亿分之一、江湖一梦）和《孤城尸潮》时踩过的坑。新游戏照这里做，老游戏改动时也按这里对齐。

各游戏仓库自己的 `CLAUDE.md` / `SPEC.md` 写本游戏的细节；这里只写跨项目的规则。

## 一、网站结构

```
www.vibe-game.com/            总页面（本仓库 vibe-game，public/ 下）
www.vibe-game.com/nav.js      全站顶栏，所有游戏页面都引用
www.vibe-game.com/life-sim/   浮生录（仓库 life-sim）：大厅 + 十四亿分之一 + 江湖一梦
www.vibe-game.com/arthur/     Arthur 的打字游戏（仓库 arthur-vibe-game）
www.vibe-game.com/<游戏>/      以后的游戏，每个一个仓库、一个 Cloudflare Worker、一条路由
```

- 每个游戏是独立仓库、独立 Worker。Worker 用路由 `www.vibe-game.com/<路径>*` 挂在总域名下，总页面的 Worker 用自定义域名接住其余路径。路由比自定义域名先匹配，所以互不干扰。
- 游戏打包时把文件放进 `dist/<路径>/`（浮生录用 `node share/tools/build.js --base=life-sim`），页面里的链接一律用相对路径。
- 推送到 GitHub 的 `main` 就会自动部署。只推送检查过的版本。

### Cloudflare 设置（新游戏照抄）

| Worker | 仓库 | 挂法 | Build command | Deploy command |
|---|---|---|---|---|
| `vibe-game` | vibe-game | 自定义域名 `www.vibe-game.com` | 无 | `npx wrangler deploy`（读 `wrangler.jsonc`，上传 `public/`） |
| `life-sim` | life-sim | 路由 `www.vibe-game.com/life-sim*` | `node share/tools/build.js --base=life-sim` | `npx wrangler deploy --name life-sim --assets ./dist --compatibility-date=…` |
| `arthur-vibe-game` | arthur-vibe-game | 路由 `www.vibe-game.com/arthur*` | `node tools/build.js` | `npx wrangler deploy --name arthur-vibe-game --assets ./dist --compatibility-date=2025-06-01` |

新游戏的模板（`<路径>` 是网址路径，`<worker>` 是 Worker 名）：

```
Build command:  （把运行时文件拷到 dist/<路径>/ 的打包脚本）
Deploy command: npx wrangler deploy --name <worker> --assets ./dist --compatibility-date=2025-06-01
Root directory: /
Route:          www.vibe-game.com/<路径>*   （Zone 选 vibe-game.com）
```

规则：

- **Worker 收到的是完整路径。** 请求 `/<路径>/index.html` 时，它会在上传的目录里找 `<路径>/index.html`。所以打包结果必须是 `dist/<路径>/...`，多套一层目录。直接上传仓库根目录会 404。
- **三处名字对上**：`--name` = Cloudflare 里的 Worker 名（不一致会报 name mismatch）；打包脚本的路径 = 路由路径；`--assets` = 打包输出目录。
- 游戏仓库里**不放** `wrangler.jsonc` / `wrangler.toml`，参数都写在 Cloudflare 的命令里。只有总页面仓库用 `wrangler.jsonc`。
- 路径不能是另一个路径的前缀（路由是 `/<路径>*` 通配，`life` 会吃掉 `life-sim`）。
- 本游戏的文件一律用**相对路径**；只有全站共用的 `/nav.js` 用 `/` 开头（它归总页面的 Worker）。写成 `/game.js` 会去找总页面，结果是 404。
- `localStorage` 键名加游戏前缀（整个域名共用一个 localStorage），全站共用的只有 `vibe.lang`。
- 上线新游戏：本仓库 `public/nav.js` 的 `GAMES` 和 `public/index.html` 各加一项，README 的表格加一行。
- 本地检查：`npx wrangler dev --assets ./dist --compatibility-date=2025-06-01`，打开 `http://localhost:8787/<路径>/`。本地 `/nav.js` 是 404，这是正常的。

### 命名

- **只有古风（古代中国背景）的项目，仓库名、目录名用拼音**，例如 `jianghuyimeng`。其他项目一律用英文，例如 `life-sim`、`1in1.4b`。游戏里显示的名字照样用中文。
- 目录名就是网址路径，也是存档前缀的一部分，上线后不要改。
- 《孤城尸潮》不是古风，上线时仓库和路径用英文名（例如 `zombie-siege`），不要用 `gucheng-shichao`。

## 二、每个游戏都要有的

| 项 | 做法 |
|---|---|
| 全站顶栏 | `<head>` 里加 `<script src="/nav.js" defer></script>`。不吸顶，跟着页面滚走。新增游戏只改本仓库 `public/nav.js` 的 `GAMES`，所有页面一起更新。游戏自己的操作栏放在它下面，可以吸顶 |
| 底部栏 | 每一页底部：面包屑（Vibe Game › 合集 › 本游戏）、**版本号**、语言、问题反馈 |
| 版本号 | 显示在底部，用不显眼的小号等宽字（灰色、偏透明），格式 `v1.5.0`。写在游戏设定里（浮生录是 `game.js` 的 `version`），每次发布新内容时改：加内容改中间位，修 bug 改末位，大改玩法改首位 |
| 主题 | 暗（默认）、灰、白三种，点一下换下一种，记在 `localStorage`。颜色全部用 CSS 变量，三套都要好看 |
| 语言 | 中文、English、日本語、Español。选择存在 `localStorage` 的 `vibe.lang`，同一个网站下所有游戏共用；第一次按浏览器语言选 |
| 问题反馈 | 弹框：分类、正文、可选附上当前进度；“提交到 GitHub”（预填 Issues 链接）和“复制内容”。地址写在 `config.js`（`feedbackRepo`、以后有后端填 `feedbackApi`） |
| 手机 | 820px 以下单栏，最重要的内容排最上面；按钮区横向滑动，不换行；右下角“回到顶部” |

### 语言怎么做（省额度的做法）

- **界面文字**（按钮、标题、提示）预先翻译：代码里写 `t('中文')`，词表按中文原文做键。字少、准确。
- **剧情、长文本**不预先翻译：选了其他语言时，载入谷歌网页翻译，自动翻页面上剩下的中文。剧情改了也不用重翻。
  - 原理：写 `googtrans=/zh-CN/en` 这个 cookie，再载入 `translate.google.com/translate_a/element.js`。把谷歌的横幅藏掉。
  - 国内玩家用中文，谷歌打不开没有影响。
  - 已经按语言写好的元素（例如顶栏）加 `class="notranslate"`。
- 钱：中文显示人民币（¥3,200、¥12.5 万），其他语言换算成美元显示。

## 三、画风

| 画风 | 状态 | 说明 |
|---|---|---|
| **像素风** | 系列统一风格，默认用这个 | 全部用代码在 Canvas 上画，不用美术素材。场景约 240×110 像素放大显示，人物十几个像素高，头像 20×24。暗、灰、白主题下都要看得清 |
| 水墨 | 《孤城尸潮》做过，已存档 | 适合古风；可以做成皮肤 |
| 扁平 | 已存档 | 色块干净，适合信息多的画面 |
| 战术（雷达） | 已存档 | 深底亮线，适合策略、塔防的俯视图 |

- 换画风只换一套绘制函数，规则和数据不动。存档的画风代码留着，以后做皮肤切换。
- 截图里的装饰性乱码（“机读码”那种）不要加。
- 场景框画“你此刻在哪儿、和谁在一起”：在家就画家和家里人（还有宠物），出门上班、看病、旅行的那一年画那个地方和陪着的人。

## 四、技术约定

- 纯静态：原生 JavaScript、普通 `<script>`，不用构建器、不用 npm 包。双击 `index.html` 就能玩，`file://` 也能跑。
- 不依赖境外资源：不引 Google 字体（或做成可关闭、异步加载）、不引外部 CDN。页面尽量小（浮生录打包后约 1.4 MB）。
- 存档在 `localStorage`，键名 `<游戏 id>.save.v<版本>`。存档结构改了就升版本号，旧存档自然作废。
- `config.js` 放部署相关的值（网址、站名、导航、反馈），不缓存；其他文件带内容哈希长期缓存（Cloudflare 用 `_headers`）。
- 要后端时（排行榜、反馈不要账号）用同一个 Cloudflare Worker 加 `/api/*`，密钥只放 Worker 里。

## 五、内容和检查

- 剧情文字预先写好，不调用 AI 生成。
- 文风：中文、第二人称“你”、短句白描、每段 1–4 句；不用“——”插入语、不用“不是……而是……”、不用表情符号；不写政治、不写真实品牌和名人；死亡一句带过。
- 基调：日子有难处也有盼头，难处后面给一点暖意或转机，别一路灰到底。
- **每个抉择的选项都要有后果**，而且后面读得到；选项数按情节定 2–4 个。
- **前后要对得上**：已婚不能写成单身，和爸妈同住了不能再问要不要接来，一岁不吃牛肉面，九十岁不领舞。做一个“逻辑检查”（lint）规则表，模拟时逐行检查，报出来必须清零。
- **随机性**：同类事件要有足够大的池子、按人物处境筛选，文字里的地点、人名、金额随机取，否则几局下来都是同一批事。
- 写一个无界面的模拟器（浮生录的 `share/tools/simulate.js`），一次跑几百局，检查运行错误、死节点、选项数、后果、逻辑矛盾，并打印分布（寿命、学历、婚姻……）看像不像真的。
- 改界面后截图检查电脑和 390px 手机宽度（浮生录的 `share/tools/shot.js`）。

## 六、部署和传播

- 必须用自己的域名。`*.workers.dev`、`*.pages.dev` 在国内被污染，打不开。
- 用 itdog.cn / boce.com 测国内各地能不能打开。
- 社交分享以**图片**为主：图片不会被当成外链拦截。小红书、抖音正文不放链接；不用短链接；文案别像广告。
- 准备一个备用域名，微信拦了就换，改 `config.js` 的网址即可。

## 七、和 Claude 协作的经验

- 大改动先搭好“工具层”（数据接口、检查工具），写进 SPEC，再把内容按文件分给多个助手并行写，每个助手只改自己的文件，避免互相覆盖。
- 并行助手太多会撞上用量上限；四五个是上限，长任务要能从中断处接着做。
- 模拟器的检查规则就是给助手的“验收标准”，规则越具体，返工越少。
- 用户偏好：用中文交流；改完检查通过后直接提交、推送，不用等审阅代码；最后用白话总结改了什么。
