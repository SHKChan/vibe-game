/* Vibe Game 全站外壳：顶栏 + 底栏 + 定时提醒 + 游戏登记表
 * 每个游戏页面的 <head> 里加：
 *   <meta name="vg:version" content="1.0.0">          版本号，有它才显示底栏（面包屑、版本号、问题反馈）
 *   <meta name="vg:layout" content="fullscreen">      可选：铺满屏幕的游戏，不加底栏，版本号放进顶栏；顶栏高度写在 CSS 变量 --vg-nav-h
 *   <script src="/nav.js" defer></script>
 * 顶栏不吸顶，跟着页面滚走。新增游戏只改这个文件的 GAMES：顶栏、首页游戏卡、底栏面包屑都从这里来。
 * 颜色读宿主页面的 CSS 变量（--bg --panel --fg --line --muted --brand），没有就用自己的默认值，深浅主题都能看。
 * 语言存在 localStorage 的 vibe.lang（各游戏共用）；页面里有 JY.setLang 就交给它，没有就自己存了刷新。
 * 定时提醒存在 localStorage 的 vibe.reminder（各游戏共用），换游戏、刷新都接着倒计时；多个标签页只响一次。
 */
(function () {
  'use strict';
  if (window.__vgNav || window.top !== window.self) return; // 只装一次；嵌在 iframe 里（截图、预览）不显示
  window.__vgNav = true;

  // 游戏登记表：path 是网址路径（目录名），repo 是 GitHub 仓库（问题反馈用），color 是首页卡片的主色
  // name / tags / desc 按语言写，缺的语言先用英文、再用中文
  const GAMES = [
    { path: '/life-sim/', repo: 'SHKChan/life-sim', color: '#c9a24a',
      name: { zh: '浮生录', en: 'Floating Lives', ja: '浮生録', es: 'Vidas Flotantes' },
      tags: { zh: ['人生模拟器', '文字', '一局一生'], en: ['Life sim', 'Text', 'One life per run'] },
      desc: { zh: '投一次胎，从出生活到离世。可以随机投胎到现代中国的某个家庭，也可以重生成射雕三部曲里有名有姓的人物。',
        en: 'Be born once and live until the end: into a random family in modern China, or as a named hero of the Condor trilogy.' } },
    { path: '/arthur/', repo: 'SHKChan/typing-game', color: '#89b4fa',
      name: { zh: 'Arthur 的打字游戏', en: "Arthur's Typing Game", ja: 'Arthurのタイピングゲーム', es: 'Mecanografía de Arthur' },
      tags: { zh: ['打字', '像素', '打怪'], en: ['Typing', 'Pixel', 'Battle'] },
      desc: { zh: '看词打词，打对一个就砍史莱姆一刀。五关越来越长，打错会掉血，挑战最快通关时间。',
        en: 'Type the word to strike the slime. Five stages of longer words; mistakes cost hearts. Beat your best time.' } },
    { path: '/aquarium/', repo: 'SHKChan/aquairum', color: '#5ab0e8',
      name: { zh: '像素水族箱', en: 'Pixel Aquarium', ja: 'ピクセル水族館', es: 'Acuario Pixel' },
      tags: { zh: ['养成', '像素', '放置'], en: ['Pet sim', 'Pixel', 'Idle'] },
      desc: { zh: '孵一颗鱼卵，喂食、治病，看它长大。照顾得好不好，会长成不同的样子。',
        en: 'Hatch an egg, feed it, cure it and watch it grow. How well you care decides what it becomes.' } },
    { path: '/xiaoyao-inn/', repo: 'SHKChan/xiaoyao-inn', color: '#d0794a',
      name: { zh: '逍遥客栈', en: 'Xiaoyao Inn', ja: '逍遥客桟', es: 'Posada Xiaoyao' },
      tags: { zh: ['经营', '像素', '仙剑同人'], en: ['Management', 'Pixel', 'Fan game'] },
      desc: { zh: '没出门闯江湖的小伙，留在余杭镇和掌柜一起经营客栈。白天看客人来来往往，夜里研发菜谱、雇伙计、扩建店面。',
        en: 'Stay home in Yuhang and run the family inn: watch guests by day, plan recipes, staff and upgrades by night.' } },
  ];
  const LANGS = [['zh', '中', '中文'], ['en', 'EN', 'English'], ['ja', '日', '日本語'], ['es', 'ES', 'Español']];
  let lang = 'zh';
  try { lang = localStorage.getItem('vibe.lang') || ''; } catch (e) { /* 忽略 */ }
  if (!LANGS.some((l) => l[0] === lang)) {
    const n = (navigator.language || '').toLowerCase();
    lang = /^ja/.test(n) ? 'ja' : /^es/.test(n) ? 'es' : /^en/.test(n) ? 'en' : 'zh';
  }
  const TX = {
    home: { zh: '全部游戏', en: 'All games', ja: 'すべてのゲーム', es: 'Todos los juegos' },
    lang: { zh: '语言', en: 'Language', ja: '言語', es: 'Idioma' },
    ver: { zh: '版本', en: 'Version', ja: 'バージョン', es: 'Versión' },
    feedback: { zh: '问题反馈', en: 'Feedback', ja: 'フィードバック', es: 'Comentarios' },
    go: { zh: '进入', en: 'Play', ja: 'プレイ', es: 'Jugar' },
    remind: { zh: '定时提醒', en: 'Reminder', ja: 'リマインダー', es: 'Recordatorio' },
    remindMe: { zh: '提醒我', en: 'Remind me to', ja: 'お知らせ内容', es: 'Recuérdame' },
    every: { zh: '时间（分钟）', en: 'Every (minutes)', ja: '間隔（分）', es: 'Cada (minutos)' },
    repeat: { zh: '到点后自动重新计时', en: 'Repeat', ja: '繰り返す', es: 'Repetir' },
    notify: { zh: '浏览器通知（切到别的页面也能看到）', en: 'Browser notification (works in other tabs)', ja: 'ブラウザ通知（他のタブでも表示）', es: 'Notificación del navegador (también en otras pestañas)' },
    start: { zh: '开始', en: 'Start', ja: '開始', es: 'Iniciar' },
    stop: { zh: '停止', en: 'Stop', ja: '停止', es: 'Detener' },
    ok: { zh: '知道了', en: 'Got it', ja: 'OK', es: 'Entendido' },
    snooze: { zh: '5 分钟后再提醒', en: 'Snooze 5 min', ja: '5分後に再通知', es: 'Posponer 5 min' },
    left: { zh: '后提醒', en: 'left', ja: '後に通知', es: 'restante' },
    custom: { zh: '自己写', en: 'Custom', ja: '自由入力', es: 'Otro' },
    customPh: { zh: '例如：收衣服', en: 'e.g. check the oven', ja: '例：洗濯物', es: 'p. ej. revisar el horno' },
    late: { zh: '（刚才不在的时候到点了）', en: '(was due while you were away)', ja: '（離れている間に時間になりました）', es: '(venció mientras no estabas)' },
    nextIn: { zh: '下次提醒：{n} 分钟后', en: 'Next in {n} min', ja: '次は{n}分後', es: 'Próximo en {n} min' },
  };
  // 提醒的预设：id 存进 localStorage，文字按语言显示
  const PRESETS = [
    { id: 'drink', icon: '💧', label: { zh: '喝水', en: 'Drink water', ja: '水を飲む', es: 'Beber agua' }, msg: { zh: '该喝水了', en: 'Time to drink some water', ja: '水を飲みましょう', es: 'Hora de beber agua' } },
    { id: 'walk', icon: '🚶', label: { zh: '起来走走', en: 'Stand up & walk', ja: '立って歩く', es: 'Levántate y camina' }, msg: { zh: '起来走动一下吧', en: 'Stand up and move around', ja: '立ち上がって少し歩きましょう', es: 'Levántate y muévete un poco' } },
    { id: 'eyes', icon: '👀', label: { zh: '护眼', en: 'Rest eyes', ja: '目を休める', es: 'Descansa la vista' }, msg: { zh: '看看远处，让眼睛歇一会儿', en: 'Look far away and rest your eyes', ja: '遠くを見て目を休めましょう', es: 'Mira a lo lejos y descansa la vista' } },
  ];
  const MINUTES = [20, 30, 45, 60];
  const tx = (o) => o[lang] || (lang !== 'zh' && o.en) || o.zh;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const meta = (n) => { const m = document.querySelector('meta[name="' + n + '"]'); return m ? m.content.trim() : ''; };
  const here = location.pathname;
  const game = GAMES.find((g) => here.indexOf(g.path) === 0 || here === g.path.slice(0, -1));

  const css = `
.vg-bar{all:initial;display:block;font:14px/1.4 "Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  background:var(--panel,var(--bg,#121619));color:var(--fg,#e6eae8);border-bottom:1px solid var(--line,#2a3236);position:relative;z-index:1000;flex:none}
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
.vg-ver{font:11px/1 ui-monospace,Consolas,monospace;color:var(--muted,#97a3a0);opacity:.7;white-space:nowrap}
.vg-lang{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 4px 0 10px;border:1px solid var(--line,#2a3236);border-radius:999px;color:var(--muted,#97a3a0);background:transparent;cursor:pointer;flex:none}
.vg-lang:hover{border-color:var(--muted,#97a3a0);color:var(--fg,#e6eae8)}
.vg-lang svg,.vg-bar .vg-rem svg{width:15px;height:15px;flex:0 0 auto}
.vg-lang select{all:unset;cursor:pointer;color:var(--fg,#e6eae8);padding:0 8px 0 0;font-size:13px}
.vg-lang option{color:#111;background:#fff}
.vg-bar .vg-rem{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:1px solid var(--line,#2a3236);border-radius:999px;
  color:var(--muted,#97a3a0);cursor:pointer;font:13px/1 ui-monospace,Consolas,monospace;flex:none}
.vg-bar .vg-rem:hover,.vg-bar .vg-rem[aria-expanded="true"]{border-color:var(--muted,#97a3a0);color:var(--fg,#e6eae8)}
.vg-bar .vg-rem.on{color:var(--fg,#e6eae8);border-color:var(--brand,#c9a24a)}
.vg-bar .vg-rem.on svg{color:var(--brand,#c9a24a)}
.vg-pop{position:absolute;right:20px;top:calc(100% + 6px);width:300px;max-width:calc(100vw - 16px);box-sizing:border-box;padding:14px;
  background:var(--panel,var(--bg,#121619));color:var(--fg,#e6eae8);border:1px solid var(--line,#2a3236);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.35);
  display:flex;flex-direction:column;gap:10px;font-size:13px}
.vg-pop[hidden]{display:none}
.vg-pop h4{all:unset;display:block;font-weight:700;color:var(--muted,#97a3a0);font-size:12px}
.vg-row{display:flex;flex-wrap:wrap;gap:6px}
.vg-bar .vg-chip{all:unset;box-sizing:border-box;padding:5px 10px;border:1px solid var(--line,#2a3236);border-radius:999px;cursor:pointer;color:var(--fg,#e6eae8);font-size:13px;line-height:1.3}
.vg-bar .vg-chip:hover{border-color:var(--muted,#97a3a0)}
.vg-bar .vg-chip[aria-pressed="true"]{border-color:var(--brand,#c9a24a);background:color-mix(in srgb,var(--brand,#c9a24a) 18%,transparent)}
.vg-bar input.vg-txt{all:unset;box-sizing:border-box;padding:5px 10px;border:1px solid var(--line,#2a3236);border-radius:6px;color:var(--fg,#e6eae8);font-size:13px;line-height:1.3;
  -webkit-user-select:text;user-select:text;cursor:text}
.vg-bar input.vg-txt:focus{border-color:var(--brand,#c9a24a)}
.vg-bar input.vg-num{width:64px;text-align:center}
.vg-bar input.vg-custom{width:100%}
.vg-bar label.vg-ck{display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--fg,#e6eae8);font-size:13px}
.vg-bar label.vg-ck input{all:revert;margin:0;accent-color:var(--brand,#c9a24a)}
.vg-acts{display:flex;gap:8px;justify-content:flex-end}
.vg-bar .vg-btn{all:unset;box-sizing:border-box;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;border:1px solid var(--line,#2a3236);color:var(--fg,#e6eae8)}
.vg-bar .vg-btn.pri{background:var(--brand,#c9a24a);border-color:var(--brand,#c9a24a);color:var(--bg,#121619)}
.vg-bar .vg-btn:hover{filter:brightness(1.1)}
.vg-bar .vg-btn[hidden]{display:none}
.vg-toast{all:initial;position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483000;width:max-content;max-width:calc(100vw - 24px);box-sizing:border-box;
  display:flex;align-items:center;flex-wrap:wrap;gap:10px 14px;padding:12px 14px 12px 16px;border-radius:12px;border:1px solid var(--brand,#c9a24a);
  background:var(--panel,var(--bg,#121619));color:var(--fg,#e6eae8);box-shadow:0 12px 40px rgba(0,0,0,.45);
  font:15px/1.4 "Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif;animation:vg-in .25s ease-out}
.vg-toast b{font-weight:800}
.vg-toast small{display:block;color:var(--muted,#97a3a0);font-size:12px}
.vg-toast .vg-btn{all:unset;box-sizing:border-box;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;border:1px solid var(--line,#2a3236);color:var(--fg,#e6eae8)}
.vg-toast .vg-btn.pri{background:var(--brand,#c9a24a);border-color:var(--brand,#c9a24a);color:var(--bg,#121619)}
@keyframes vg-in{from{opacity:0;transform:translate(-50%,-12px)}}
.vg-foot{all:initial;display:block;flex:none;font:12px/1.5 "Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:var(--muted,var(--dim,#97a3a0));
  border-top:1px solid var(--line,#2a3236);margin-top:24px}
.vg-foot .vg-fin{max-width:1440px;margin:0 auto;padding:12px 20px calc(12px + env(safe-area-inset-bottom));box-sizing:border-box;display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap}
.vg-foot a{color:inherit;text-decoration:none}
.vg-foot a:hover{color:var(--fg,#e6eae8);text-decoration:underline}
.vg-foot .vg-cur{color:var(--fg,#e6eae8)}
.vg-foot .vg-ver{font-size:11px}
@media (max-width:600px){.vg-in{padding:0 12px;height:40px}.vg-logo span{display:none}.vg-logo{margin-right:4px}.vg-pop{right:8px}
  .vg-lang{padding:0 2px 0 8px}.vg-lang select{font-size:12px;padding-right:4px}.vg-bar .vg-rem{padding:0 8px}.vg-in>.vg-ver{display:none}.vg-foot .vg-fin{padding-left:12px;padding-right:12px}}
`;
  const globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>';
  const clock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M5 3 2 6M19 3l3 3"/></svg>';

  // ---------- 定时提醒 ----------
  // vibe.reminder = { preset, text, min, repeat, notify, due }，due 是到点时间戳（毫秒），0 表示没在计时
  // vibe.reminder.fired = 最近一次已经响过的 due，用来让多个标签页只响一次
  const RK = 'vibe.reminder', FK = 'vibe.reminder.fired';
  const STALE = 12 * 3600e3; // 过点超过 12 小时就不补提醒了，直接排下一次
  const load = () => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(RK)); } catch (e) { /* 忽略 */ }
    s = Object.assign({ preset: 'drink', text: '', min: 30, repeat: true, notify: false, due: 0 }, s && typeof s === 'object' ? s : {});
    s.min = Math.min(600, Math.max(1, Math.round(+s.min) || 30));
    return s;
  };
  const save = (s) => { try { localStorage.setItem(RK, JSON.stringify(s)); } catch (e) { /* 忽略 */ } };
  const fired = () => { try { return +localStorage.getItem(FK) || 0; } catch (e) { return 0; } };
  const preset = (s) => PRESETS.find((p) => p.id === s.preset);
  const message = (s) => (preset(s) ? preset(s).icon + ' ' + tx(preset(s).msg) : '⏰ ' + (s.text || tx(TX.remind)));
  const fmtLeft = (ms) => {
    const t = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, sec = t % 60;
    const p = (n) => (n < 10 ? '0' : '') + n;
    return (h ? h + ':' + p(m) : m) + ':' + p(sec);
  };

  let audio = null;
  function unlockAudio() { // 在点击里建 AudioContext，之后到点才能出声
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { audio = null; }
  }
  function ding() {
    unlockAudio();
    if (!audio) return;
    const t = audio.currentTime;
    [[880, 0], [1320, 0.18], [880, 0.5], [1320, 0.68]].forEach(([f, d]) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.25, t + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.3);
      o.connect(g); g.connect(audio.destination);
      o.start(t + d); o.stop(t + d + 0.32);
    });
  }

  let flashTimer = 0, flashTitle = '';
  function flash(text) {
    stopFlash();
    flashTitle = document.title;
    let on = false;
    flashTimer = setInterval(() => { on = !on; document.title = on ? text : flashTitle; }, 1000);
  }
  function stopFlash() {
    if (!flashTimer) return;
    clearInterval(flashTimer); flashTimer = 0;
    document.title = flashTitle;
  }

  let toast = null;
  function closeToast() { if (toast) { toast.remove(); toast = null; } stopFlash(); }
  function showToast(s, late) {
    closeToast();
    toast = document.createElement('div');
    toast.className = 'vg-toast notranslate';
    toast.setAttribute('translate', 'no');
    toast.setAttribute('role', 'alert');
    const next = s.repeat && s.due ? tx(TX.nextIn).replace('{n}', s.min) : '';
    toast.innerHTML = '<div><b></b><small></small></div><span style="flex:1"></span>'
      + '<button type="button" class="vg-btn" data-a="snooze">' + esc(tx(TX.snooze)) + '</button>'
      + '<button type="button" class="vg-btn pri" data-a="ok">' + esc(tx(TX.ok)) + '</button>';
    toast.querySelector('b').textContent = message(s);
    toast.querySelector('small').textContent = [late ? tx(TX.late) : '', next].filter(Boolean).join(' ');
    toast.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]');
      if (!a) return;
      if (a.dataset.a === 'snooze') { const r = load(); r.due = Date.now() + 5 * 60e3; save(r); refresh(); }
      closeToast();
    });
    document.body.appendChild(toast);
  }

  function notify(s) {
    if (!s.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification(message(s), { tag: 'vibe-reminder', body: 'Vibe Game', renotify: true }); } catch (e) { /* 部分手机浏览器只能在 Service Worker 里发通知 */ }
  }

  // 到点了：抢到 fired 的标签页负责出声、发通知；其他标签页收到 storage 事件只弹提示条
  let dueSeen = 0;
  function check() {
    const s = load(), now = Date.now();
    if (!s.due || now < s.due || fired() >= s.due) { dueSeen = 0; return; }
    // 前台标签页优先；后台标签页晚 2 秒再抢，免得前台的提示条没人响
    if (document.hidden && now - s.due < 60e3) {
      if (!dueSeen) dueSeen = now;
      if (now - dueSeen < 2000) return;
    }
    dueSeen = 0;
    try { localStorage.setItem(FK, String(s.due)); } catch (e) { /* 忽略 */ }
    const late = now - s.due > 90e3, stale = now - s.due > STALE;
    if (s.repeat) { const step = s.min * 60e3; s.due += Math.ceil((now - s.due + 1) / step) * step; } else s.due = 0;
    save(s);
    if (!stale) { showToast(s, late); ding(); notify(s); if (document.hidden) flash(message(s)); }
    refresh();
  }

  let remBtn = null, pop = null;
  function refresh() {
    if (!remBtn) return;
    const s = load(), on = s.due > 0;
    remBtn.classList.toggle('on', on);
    remBtn.querySelector('span').textContent = on ? fmtLeft(s.due - Date.now()) : '';
    remBtn.title = on ? message(s) + ' · ' + fmtLeft(s.due - Date.now()) + ' ' + tx(TX.left) : tx(TX.remind);
    if (pop && !pop.hidden) {
      pop.querySelector('[data-a="start"]').textContent = tx(TX.start) + (on ? ' ↻' : '');
      pop.querySelector('[data-a="stop"]').hidden = !on;
    }
  }

  function buildPop() {
    pop = document.createElement('div');
    pop.className = 'vg-pop';
    pop.hidden = true;
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', tx(TX.remind));
    pop.innerHTML = '<h4>' + esc(tx(TX.remindMe)) + '</h4>'
      + '<div class="vg-row" data-g="preset">' + PRESETS.map((p) => '<button type="button" class="vg-chip" data-v="' + p.id + '">' + p.icon + ' ' + esc(tx(p.label)) + '</button>').join('')
      + '<button type="button" class="vg-chip" data-v="custom">✏️ ' + esc(tx(TX.custom)) + '</button></div>'
      + '<input class="vg-txt vg-custom" maxlength="40" placeholder="' + esc(tx(TX.customPh)) + '" hidden>'
      + '<h4>' + esc(tx(TX.every)) + '</h4>'
      + '<div class="vg-row" data-g="min">' + MINUTES.map((m) => '<button type="button" class="vg-chip" data-v="' + m + '">' + m + '</button>').join('')
      + '<input class="vg-txt vg-num" type="number" min="1" max="600" inputmode="numeric" aria-label="' + esc(tx(TX.every)) + '"></div>'
      + '<label class="vg-ck"><input type="checkbox" data-k="repeat">' + esc(tx(TX.repeat)) + '</label>'
      + ('Notification' in window ? '<label class="vg-ck"><input type="checkbox" data-k="notify">' + esc(tx(TX.notify)) + '</label>' : '')
      + '<div class="vg-acts"><button type="button" class="vg-btn" data-a="stop">' + esc(tx(TX.stop)) + '</button>'
      + '<button type="button" class="vg-btn pri" data-a="start">' + esc(tx(TX.start)) + '</button></div>';
    const custom = pop.querySelector('.vg-custom'), num = pop.querySelector('.vg-num');
    let draft = load();
    const paint = () => {
      pop.querySelectorAll('[data-g="preset"] .vg-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === (preset(draft) ? draft.preset : 'custom'))));
      pop.querySelectorAll('[data-g="min"] .vg-chip').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === draft.min)));
      custom.hidden = !!preset(draft);
      if (document.activeElement !== num) num.value = MINUTES.indexOf(draft.min) < 0 ? draft.min : '';
      pop.querySelectorAll('[data-k]').forEach((c) => { c.checked = !!draft[c.dataset.k]; });
    };
    pop.open = () => { draft = load(); custom.value = draft.text || ''; paint(); pop.hidden = false; remBtn.setAttribute('aria-expanded', 'true'); refresh(); };
    pop.close = () => { pop.hidden = true; remBtn.setAttribute('aria-expanded', 'false'); };
    pop.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const g = b.parentNode.dataset.g;
      if (g === 'preset') { draft.preset = b.dataset.v; paint(); if (b.dataset.v === 'custom') custom.focus(); }
      else if (g === 'min') { draft.min = +b.dataset.v; num.value = ''; paint(); }
      else if (b.dataset.a === 'start') {
        unlockAudio();
        draft.text = custom.value.trim();
        draft.due = Date.now() + draft.min * 60e3;
        save(draft);
        if (draft.notify && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
        pop.close(); refresh();
      } else if (b.dataset.a === 'stop') { const s = load(); s.due = 0; save(s); pop.close(); refresh(); }
    });
    num.addEventListener('input', () => { const v = Math.round(+num.value); if (v >= 1 && v <= 600) { draft.min = v; paint(); } });
    pop.addEventListener('change', (e) => { if (e.target.dataset.k) draft[e.target.dataset.k] = e.target.checked; });
    // 宿主游戏可能监听键盘（打字游戏、快捷键），面板里的按键不往外传
    pop.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') { pop.close(); remBtn.focus(); } });
    pop.addEventListener('keyup', (e) => e.stopPropagation());
    pop.addEventListener('keypress', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target) && !remBtn.contains(e.target)) pop.close(); });
    return pop;
  }

  // ---------- 顶栏、底栏、首页游戏卡 ----------
  function cards(box) {
    box.insertAdjacentHTML('afterbegin', GAMES.map((g) => '<a class="game" href="' + g.path + '" style="--c:' + g.color + '">'
      + '<div class="nm">' + esc(tx(g.name)) + '</div>'
      + '<div class="tags">' + tx(g.tags).map((t) => '<span>' + esc(t) + '</span>').join('') + '</div>'
      + '<div class="d">' + esc(tx(g.desc)) + '</div>'
      + '<span class="go">' + esc(tx(TX.go)) + '</span></a>').join(''));
  }

  function mount() {
    if (document.querySelector('.vg-bar')) return;
    const version = meta('vg:version').replace(/^v/i, ''), full = meta('vg:layout') === 'fullscreen';
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    const bar = document.createElement('nav');
    bar.className = 'vg-bar notranslate'; // 自己已经按语言写好了，不让网页翻译再动
    bar.setAttribute('translate', 'no');
    bar.setAttribute('aria-label', 'Vibe Game');
    bar.innerHTML = '<div class="vg-in">'
      + '<a class="vg-logo" href="/" title="' + esc(tx(TX.home)) + '"><i></i><span>Vibe Game</span></a>'
      + '<div class="vg-games">' + GAMES.map((g) => '<a href="' + g.path + '"' + (g === game ? ' aria-current="page"' : '') + '>' + esc(tx(g.name)) + '</a>').join('') + '</div>'
      + '<span class="vg-sp"></span>'
      + (full && version ? '<span class="vg-ver" title="' + esc(tx(TX.ver)) + '">v' + esc(version) + '</span>' : '')
      + '<button type="button" class="vg-rem" aria-haspopup="dialog" aria-expanded="false" aria-label="' + esc(tx(TX.remind)) + '">' + clock + '<span></span></button>'
      + '<label class="vg-lang" title="' + esc(tx(TX.lang)) + '">' + globe + '<select aria-label="' + esc(tx(TX.lang)) + '">'
      + LANGS.map((l) => '<option value="' + l[0] + '"' + (l[0] === lang ? ' selected' : '') + '>' + l[2] + '</option>').join('') + '</select></label>'
      + '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('select').addEventListener('change', (e) => {
      const l = e.target.value;
      if (window.JY && window.JY.setLang) { window.JY.setLang(l); return; }
      try { localStorage.setItem('vibe.lang', l); } catch (err) { /* 忽略 */ }
      location.reload();
    });

    remBtn = bar.querySelector('.vg-rem');
    bar.appendChild(buildPop());
    remBtn.addEventListener('click', () => (pop.hidden ? pop.open() : pop.close()));
    window.addEventListener('storage', (e) => {
      if (e.key === FK && e.newValue) { const s = load(); showToast(s, false); } // 别的标签页到点了，这里只弹提示条，不出声
      if (e.key === RK || e.key === FK) refresh();
    });
    window.addEventListener('focus', stopFlash);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { stopFlash(); check(); refresh(); } });
    setInterval(() => { check(); refresh(); }, 1000);
    check(); refresh();

    // 铺满屏幕的游戏用 --vg-nav-h 给顶栏让位置
    const setH = () => document.documentElement.style.setProperty('--vg-nav-h', bar.offsetHeight + 'px');
    setH();
    window.addEventListener('resize', setH);
    if (full) window.dispatchEvent(new Event('resize'));

    if (version && !full) {
      const foot = document.createElement('div');
      foot.className = 'vg-foot notranslate';
      foot.setAttribute('translate', 'no');
      foot.setAttribute('role', 'contentinfo');
      foot.innerHTML = '<div class="vg-fin"><a href="/">Vibe Game</a>'
        + (game ? '<span aria-hidden="true">›</span><span class="vg-cur">' + esc(tx(game.name)) + '</span>' : '')
        + '<span class="vg-sp"></span><span class="vg-ver" title="' + esc(tx(TX.ver)) + '">v' + esc(version) + '</span>'
        + (game ? '<a href="https://github.com/' + game.repo + '/issues/new" target="_blank" rel="noopener">' + esc(tx(TX.feedback)) + '</a>' : '')
        + '</div>';
      document.body.appendChild(foot);
    }

    const box = document.getElementById('vg-games');
    if (box) cards(box);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
