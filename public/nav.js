/* Vibe Game 全站顶栏
 * 每个游戏的页面里加一行 <script src="/nav.js" defer></script>，页面最上面就会出现这条导航（不吸顶，跟着页面滚走）。
 * 新增游戏只改这个文件的 GAMES，所有页面一起更新。
 * 颜色读宿主页面的 CSS 变量（--bg --fg --line --muted --brand），没有就用自己的默认值，深浅主题都能看。
 * 语言存在 localStorage 的 vibe.lang（各游戏共用）；页面里有 JY.setLang 就交给它，没有就自己存了刷新。
 */
(function () {
  'use strict';
  if (window.__vgNav || window.top !== window.self) return; // 只装一次；嵌在 iframe 里（截图、预览）不显示
  window.__vgNav = true;

  // 游戏列表：path 是网址路径（目录名），name 按语言
  const GAMES = [
    { path: '/life-sim/', name: { zh: '浮生录', en: 'Floating Lives', ja: '浮生録', es: 'Vidas Flotantes' } },
  ];
  const LANGS = [['zh', '中', '中文'], ['en', 'EN', 'English'], ['ja', '日', '日本語'], ['es', 'ES', 'Español']];
  let lang = 'zh';
  try { lang = localStorage.getItem('vibe.lang') || ''; } catch (e) { /* 忽略 */ }
  if (!LANGS.some((l) => l[0] === lang)) {
    const n = (navigator.language || '').toLowerCase();
    lang = /^ja/.test(n) ? 'ja' : /^es/.test(n) ? 'es' : /^en/.test(n) ? 'en' : 'zh';
  }
  const TX = { home: { zh: '全部游戏', en: 'All games', ja: 'すべてのゲーム', es: 'Todos los juegos' }, lang: { zh: '语言', en: 'Language', ja: '言語', es: 'Idioma' } };
  const tx = (o) => o[lang] || o.zh;
  const here = location.pathname;

  const css = `
.vg-bar{all:initial;display:block;font:14px/1.4 "Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  background:var(--panel,var(--bg,#121619));color:var(--fg,#e6eae8);border-bottom:1px solid var(--line,#2a3236);position:relative;z-index:6}
.vg-in{max-width:1440px;margin:0 auto;padding:0 20px;height:44px;display:flex;align-items:center;gap:6px;box-sizing:border-box}
.vg-logo{display:inline-flex;align-items:center;gap:8px;margin-right:10px;color:inherit;text-decoration:none;font-weight:800;letter-spacing:.02em;white-space:nowrap}
.vg-logo i{width:10px;height:10px;border-radius:3px;background:var(--brand,#c9a24a);display:inline-block;transform:rotate(45deg)}
.vg-logo:hover{opacity:.85}
.vg-games{display:flex;align-items:center;gap:2px;min-width:0;overflow-x:auto;scrollbar-width:none}
.vg-games::-webkit-scrollbar{display:none}
.vg-games a{color:var(--muted,#97a3a0);text-decoration:none;padding:6px 10px;border-radius:6px;white-space:nowrap}
.vg-games a:hover{color:var(--fg,#e6eae8);background:color-mix(in srgb,var(--fg,#e6eae8) 8%,transparent)}
.vg-games a[aria-current="page"]{color:var(--fg,#e6eae8);background:color-mix(in srgb,var(--fg,#e6eae8) 10%,transparent)}
.vg-sp{flex:1}
.vg-lang{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 4px 0 10px;border:1px solid var(--line,#2a3236);border-radius:999px;color:var(--muted,#97a3a0);background:transparent;cursor:pointer}
.vg-lang:hover{border-color:var(--muted,#97a3a0);color:var(--fg,#e6eae8)}
.vg-lang svg{width:15px;height:15px;flex:0 0 auto}
.vg-lang select{all:unset;cursor:pointer;color:var(--fg,#e6eae8);padding:0 8px 0 0;font-size:13px}
.vg-lang option{color:#111;background:#fff}
@media (max-width:600px){.vg-in{padding:0 12px;height:40px}.vg-logo span{display:none}.vg-logo{margin-right:4px}}
`;
  const globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>';

  function mount() {
    if (document.querySelector('.vg-bar')) return;
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    const bar = document.createElement('nav');
    bar.className = 'vg-bar notranslate'; // 自己已经按语言写好了，不让网页翻译再动
    bar.setAttribute('translate', 'no');
    bar.setAttribute('aria-label', 'Vibe Game');
    bar.innerHTML = '<div class="vg-in">'
      + '<a class="vg-logo" href="/" title="' + tx(TX.home) + '"><i></i>Vibe Game</a>'
      + '<div class="vg-games">' + GAMES.map((g) => '<a href="' + g.path + '"' + (here.indexOf(g.path) === 0 ? ' aria-current="page"' : '') + '>' + tx(g.name) + '</a>').join('') + '</div>'
      + '<span class="vg-sp"></span>'
      + '<label class="vg-lang" title="' + tx(TX.lang) + '">' + globe + '<select aria-label="' + tx(TX.lang) + '">'
      + LANGS.map((l) => '<option value="' + l[0] + '"' + (l[0] === lang ? ' selected' : '') + '>' + l[2] + '</option>').join('') + '</select></label>'
      + '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('select').addEventListener('change', (e) => {
      const l = e.target.value;
      if (window.JY && window.JY.setLang) { window.JY.setLang(l); return; }
      try { localStorage.setItem('vibe.lang', l); } catch (err) { /* 忽略 */ }
      location.reload();
    });
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
