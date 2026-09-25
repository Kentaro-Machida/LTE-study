/* =========================================================
   LTE Study — 共通スクリプト
   - ヘッダー / サイドナビ / ページャーの自動生成
   - 進捗・クイズ結果・チェックリストの保存 (localStorage)
   - 汎用コンポーネント: hotspots / stepper / tabs / checklist / quiz
   外部依存なし。file:// でそのまま動く。
   ========================================================= */
(function () {
  "use strict";

  // ---------- サイト構成 ----------
  const PARTS = [
    { id: "I", title: "仕組みを知る" },
    { id: "II", title: "技術要素を知る" },
    { id: "III", title: "輸出と認証" },
    { id: "IV", title: "開発の進め方" },
  ];
  const CHAPTERS = [
    { id: "01", part: "I", file: "chapters/01-basics.html", title: "無線通信の基礎", desc: "電波・周波数・変調。Wi-Fi/Bluetooth/LTEは何が違う？" },
    { id: "02", part: "I", file: "chapters/02-network.html", title: "LTEネットワークの全体像", desc: "端末→基地局→コア網→インターネット。登場人物を覚える" },
    { id: "03", part: "I", file: "chapters/03-attach.html", title: "接続の流れ（アタッチ）", desc: "電源ONから通信できるまでに裏で何が起きているか" },
    { id: "A1", num: "A", appendix: true, part: "I", file: "chapters/A1-modulation-vectors.html", title: "変調をベクトル空間で理解する", desc: "波を矢印として扱う。I/Q・内積・最小距離・OFDMの直交性" },
    { id: "04", part: "II", file: "chapters/04-bands.html", title: "周波数バンドとFDD/TDD", desc: "「バンド」とは何か。国ごとに違う理由と読み方" },
    { id: "05", part: "II", file: "chapters/05-categories.html", title: "LTEカテゴリとIoT向け規格", desc: "Cat-1 / Cat-4 / LTE-M / NB-IoT / 5G RedCap の選び方" },
    { id: "06", part: "II", file: "chapters/06-hardware.html", title: "ハードウェア構成", desc: "モジュール・アンテナ・SIM・電源。基板に何が必要か" },
    { id: "07", part: "II", file: "chapters/07-sim.html", title: "SIMの種類と回線", desc: "物理SIM / チップSIM / eSIM、ローカル回線とローミング" },
    { id: "08", part: "II", file: "chapters/08-software.html", title: "ソフトウェアと制御", desc: "ATコマンド、ホストとの接続方式、FOTA" },
    { id: "09", part: "III", file: "chapters/09-certification.html", title: "規格と認証の全体像", desc: "3GPP・GCF/PTCRB・電波法・キャリア認証の関係" },
    { id: "10", part: "III", file: "chapters/10-asia.html", title: "アジア各国の認証とバンド", desc: "中国・韓国・台湾・東南アジア・インドの要点" },
    { id: "11", part: "III", file: "chapters/11-commonization.html", title: "国ごとの部品共通化戦略", desc: "1機種で何か国まで行けるか。SKU設計の考え方" },
    { id: "12", part: "IV", file: "chapters/12-roadmap.html", title: "試作から量産までのロードマップ", desc: "要件定義→EVT/DVT/PVT→認証→量産→運用" },
  ];
  const TOOLS = [
    { file: "tools/band-checker.html", title: "バンド共通化チェッカー", desc: "輸出先を選ぶと必要バンドとモジュール対応を表示" },
    { file: "tools/module-selector.html", title: "LTEカテゴリ選定ウィザード", desc: "用途を答えると推奨カテゴリと理由を提示" },
    { file: "tools/roadmap.html", title: "開発ロードマップ（ガント）", desc: "試作→量産の工程と成果物・リスク" },
  ];
  const EXTRA = [
    { file: "glossary.html", title: "用語集" },
    { file: "quiz.html", title: "総合クイズ" },
  ];

  const root = document.body.dataset.root || "";
  const here = location.pathname.split("/").slice(-2).join("/");
  const isHere = (file) => here.endsWith(file) || location.pathname.endsWith("/" + file);

  // ---------- Storage ----------
  const KEY = "lte-study-v1";
  const store = {
    _read() {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    },
    _write(d) {
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* 保存不可でも動作は継続 */ }
    },
    get(path, fallback) {
      const d = this._read();
      const v = path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), d);
      return v === undefined ? fallback : v;
    },
    set(path, value) {
      const d = this._read();
      const keys = path.split(".");
      let o = d;
      keys.slice(0, -1).forEach((k) => { if (typeof o[k] !== "object" || o[k] === null) o[k] = {}; o = o[k]; });
      o[keys[keys.length - 1]] = value;
      this._write(d);
    },
    clear() { try { localStorage.removeItem(KEY); } catch (e) { } },
  };

  const label = (c) => (c.appendix ? `付録${c.num}` : `第${c.id}章`);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- Theme ----------
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }
  applyTheme(store.get("theme"));
  function currentTheme() {
    const t = document.documentElement.dataset.theme;
    if (t) return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  // ---------- Header / Nav ----------
  const LOGO = `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="20" width="5" height="9" rx="1.5" fill="var(--c1)"/><rect x="10.5" y="14" width="5" height="15" rx="1.5" fill="var(--c2)"/><rect x="18" y="8" width="5" height="21" rx="1.5" fill="var(--c3)"/><rect x="25.5" y="2" width="5" height="27" rx="1.5" fill="var(--c4)"/></svg>`;

  function buildHeader() {
    const header = h(`
      <header class="site-header"><div class="inner">
        <button class="icon-btn nav-toggle" aria-label="目次を開く" aria-expanded="false">☰</button>
        <a class="brand" href="${root}index.html">${LOGO}<span>LTE Study <span class="muted small">ロボット輸出編</span></span></a>
        <span class="header-spacer"></span>
        <nav class="header-links" aria-label="サイト">
          <a href="${root}index.html">目次</a>
          ${TOOLS.map((t) => `<a href="${root}${t.file}">${esc(t.title.replace(/（.*）/, ""))}</a>`).join("")}
          ${EXTRA.map((t) => `<a href="${root}${t.file}">${esc(t.title)}</a>`).join("")}
        </nav>
        <button class="icon-btn theme-toggle" aria-label="テーマ切替"></button>
      </div></header>`);
    header.querySelectorAll(".header-links a").forEach((a) => {
      if (isHere(a.getAttribute("href").replace(root, ""))) a.setAttribute("aria-current", "page");
    });
    const tbtn = header.querySelector(".theme-toggle");
    const label = () => { tbtn.textContent = currentTheme() === "dark" ? "☀︎ ライト" : "☾ ダーク"; };
    label();
    tbtn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next); store.set("theme", next); label();
    });
    const nbtn = header.querySelector(".nav-toggle");
    nbtn.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      nbtn.setAttribute("aria-expanded", String(open));
    });
    document.body.prepend(header);
  }

  function buildSideNav(page) {
    const done = store.get("done", {});
    let html = `<nav class="side-nav" aria-label="章一覧"><a href="${root}index.html"><span class="num">⌂</span>目次・進捗</a>`;
    PARTS.forEach((p) => {
      html += `<div class="part">PART ${p.id}｜${esc(p.title)}</div>`;
      CHAPTERS.filter((c) => c.part === p.id).forEach((c) => {
        html += `<a href="${root}${c.file}" class="${done[c.id] ? "done" : ""}" ${isHere(c.file) ? 'aria-current="page"' : ""}><span class="num">${c.num || c.id}</span><span>${c.appendix ? "付録 " : ""}${esc(c.title)}</span></a>`;
      });
    });
    html += `<div class="part">TOOLS</div>`;
    TOOLS.concat(EXTRA).forEach((t) => {
      html += `<a href="${root}${t.file}" ${isHere(t.file) ? 'aria-current="page"' : ""}><span class="num">▸</span><span>${esc(t.title)}</span></a>`;
    });
    html += `</nav>`;
    page.prepend(h(html));
  }

  function buildChapterFooter(main, chId) {
    const idx = CHAPTERS.findIndex((c) => c.id === chId);
    if (idx < 0) return;
    const box = h(`<div class="chapter-complete"><p class="msg"></p><button class="btn primary"></button></div>`);
    const render = () => {
      const d = store.get("done." + chId, false);
      box.classList.toggle("is-done", d);
      box.querySelector(".msg").textContent = d ? "この章は学習済みです 🎉" : "読み終えたら「学習済み」にしましょう";
      box.querySelector("button").textContent = d ? "未学習に戻す" : "✓ この章を学習済みにする";
      const link = document.querySelector(`.side-nav a[href$="${CHAPTERS[idx].file}"]`);
      if (link) link.classList.toggle("done", d);
    };
    box.querySelector("button").addEventListener("click", () => { store.set("done." + chId, !store.get("done." + chId, false)); render(); });
    render();
    main.append(box);
    const prev = CHAPTERS[idx - 1], next = CHAPTERS[idx + 1];
    main.append(h(`<div class="pager">
      ${prev ? `<a class="prev" href="${root}${prev.file}"><small>← 前へ ${label(prev)}</small>${esc(prev.title)}</a>` : `<a class="prev" href="${root}index.html"><small>←</small>目次へ</a>`}
      ${next ? `<a class="next" href="${root}${next.file}"><small>次へ ${label(next)} →</small>${esc(next.title)}</a>` : `<a class="next" href="${root}quiz.html"><small>仕上げ →</small>総合クイズ</a>`}
    </div>`));
  }

  // ---------- Hotspots ----------
  // <div data-hotspots> ... <g data-hs="key">...</g> ... <div class="hs-panel"></div> </div>
  // <template data-hs-content="key"><h4>..</h4><p>..</p></template>
  function initHotspots(scope) {
    scope.querySelectorAll("[data-hotspots]").forEach((box) => {
      let panel = box.querySelector(".hs-panel");
      if (!panel) { panel = h(`<div class="hs-panel" aria-live="polite"></div>`); box.append(panel); }
      const emptyText = box.dataset.hotspots || "図の要素をクリック（タップ）すると解説が表示されます。";
      const items = box.querySelectorAll("[data-hs]");
      const show = (key) => {
        const tpl = box.querySelector(`template[data-hs-content="${key}"]`) || document.querySelector(`template[data-hs-content="${key}"]`);
        items.forEach((el) => el.classList.toggle("is-active", el.dataset.hs === key));
        box.classList.add("has-active");
        panel.classList.remove("empty");
        panel.innerHTML = "";
        if (tpl) panel.append(tpl.content.cloneNode(true));
        else panel.textContent = key;
        box.dispatchEvent(new CustomEvent("hotspot", { detail: { key } }));
      };
      items.forEach((el) => {
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.addEventListener("click", () => show(el.dataset.hs));
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(el.dataset.hs); } });
      });
      const def = box.dataset.hsDefault;
      if (def) show(def);
      else { panel.classList.add("empty"); panel.textContent = emptyText; }
    });
  }

  // ---------- Stepper ----------
  // <div data-stepper [data-interval="3500"]>
  //   <svg> <g data-show-at="2,3"> / <g data-show-from="3"> / <g data-dim-at="1"> </svg>
  //   <div class="step" data-title="...">...</div> × N
  // </div>
  // step番号は1始まり。変化時に "stepchange" イベント (detail.step) を発火。
  function initSteppers(scope) {
    scope.querySelectorAll("[data-stepper]").forEach((box) => {
      const steps = Array.from(box.querySelectorAll(".step"));
      if (!steps.length) return;
      const n = steps.length;
      let cur = 1, timer = null;
      const ctr = h(`<div class="stepper-controls">
        <button class="btn prev" aria-label="前のステップ">◀</button>
        <button class="btn next primary" aria-label="次のステップ">次へ ▶</button>
        <button class="btn play">⏵ 自動再生</button>
        <div class="dots"></div>
      </div>`);
      const dots = ctr.querySelector(".dots");
      steps.forEach((s, i) => {
        const d = h(`<button class="dot" title="${esc(s.dataset.title || "Step " + (i + 1))}">${i + 1}</button>`);
        d.addEventListener("click", () => { stop(); go(i + 1); });
        dots.append(d);
      });
      const slot = box.querySelector(".stepper-controls-slot");
      if (slot) slot.replaceWith(ctr); else steps[0].before(ctr);
      const parseList = (s) => s.split(",").map((x) => parseInt(x, 10));
      function go(k) {
        cur = Math.max(1, Math.min(n, k));
        box.dataset.step = cur;
        steps.forEach((s, i) => s.classList.toggle("is-active", i + 1 === cur));
        dots.querySelectorAll(".dot").forEach((d, i) => { d.classList.toggle("is-active", i + 1 === cur); d.classList.toggle("is-past", i + 1 < cur); });
        box.querySelectorAll("[data-show-at]").forEach((el) => el.classList.toggle("is-on", parseList(el.dataset.showAt).includes(cur)));
        box.querySelectorAll("[data-dim-at]").forEach((el) => el.classList.toggle("is-on", !parseList(el.dataset.dimAt).includes(cur)));
        box.querySelectorAll("[data-show-from]").forEach((el) => el.classList.toggle("is-on", cur >= parseInt(el.dataset.showFrom, 10)));
        ctr.querySelector(".prev").disabled = cur === 1;
        ctr.querySelector(".next").disabled = cur === n && !timer;
        box.dispatchEvent(new CustomEvent("stepchange", { detail: { step: cur, total: n } }));
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; ctr.querySelector(".play").textContent = "⏵ 自動再生"; go(cur); } }
      ctr.querySelector(".prev").addEventListener("click", () => { stop(); go(cur - 1); });
      ctr.querySelector(".next").addEventListener("click", () => { stop(); go(cur + 1); });
      ctr.querySelector(".play").addEventListener("click", () => {
        if (timer) return stop();
        if (cur === n) go(1);
        ctr.querySelector(".play").textContent = "⏸ 停止";
        timer = setInterval(() => { if (cur >= n) stop(); else go(cur + 1); }, parseInt(box.dataset.interval || "3500", 10));
      });
      go(1);
    });
  }

  // ---------- Tabs ----------
  // <div data-tabs><div class="tab-list"><button data-tab="a">A</button>…</div><div data-tab-panel="a">…</div>…</div>
  function initTabs(scope) {
    scope.querySelectorAll("[data-tabs]").forEach((box) => {
      const btns = Array.from(box.querySelectorAll("[data-tab]")).filter((b) => b.closest("[data-tabs]") === box);
      const panels = Array.from(box.querySelectorAll("[data-tab-panel]")).filter((p) => p.closest("[data-tabs]") === box);
      const show = (k) => {
        btns.forEach((b) => { b.classList.toggle("is-active", b.dataset.tab === k); b.setAttribute("aria-selected", String(b.dataset.tab === k)); });
        panels.forEach((p) => p.classList.toggle("is-active", p.dataset.tabPanel === k));
      };
      btns.forEach((b) => { b.setAttribute("role", "tab"); b.addEventListener("click", () => show(b.dataset.tab)); });
      if (btns[0]) show(btns[0].dataset.tab);
    });
  }

  // ---------- Checklist ----------
  // <ul data-checklist="unique-id"><li>項目</li>…</ul>  (チェック状態を保存)
  function initChecklists(scope) {
    scope.querySelectorAll("ul[data-checklist]").forEach((ul) => {
      const id = ul.dataset.checklist;
      const items = Array.from(ul.children);
      const prog = h(`<div class="checklist-progress"><div class="progress"><span></span></div><span class="txt"></span></div>`);
      ul.before(prog);
      const update = () => {
        const c = items.filter((li) => li.querySelector("input").checked).length;
        prog.querySelector(".progress span").style.width = (100 * c / items.length) + "%";
        prog.querySelector(".txt").textContent = `${c} / ${items.length} 完了`;
      };
      items.forEach((li, i) => {
        const cid = `cl-${id}-${i}`;
        const inner = li.innerHTML;
        li.innerHTML = `<input type="checkbox" id="${cid}"><label for="${cid}">${inner}</label>`;
        const cb = li.querySelector("input");
        cb.checked = !!store.get(`checks.${id}.${i}`, false);
        li.classList.toggle("checked", cb.checked);
        cb.addEventListener("change", () => { store.set(`checks.${id}.${i}`, cb.checked); li.classList.toggle("checked", cb.checked); update(); });
      });
      update();
    });
  }

  // ---------- Quiz ----------
  // 問題データ: window.QUIZ に push (assets/data/quiz/chXX.js)
  // { id, ch, type: "single"|"tf"|"order", q, choices?, answer, explain }
  //  single: answer = 正解のchoicesインデックス
  //  tf    : answer = true(正しい) / false(誤り)
  //  order : choices を「正しい順」で書く。画面ではシャッフル表示
  // <div class="quiz" data-quiz="01"></div>  (カンマ区切りで複数章可, "all" で全章)
  // data-limit="10" data-random で出題数制限・ランダム化
  function renderQuiz(el, questions, opts = {}) {
    el.innerHTML = "";
    if (!questions.length) { el.innerHTML = `<p class="muted">問題はまだありません。</p>`; return; }
    let answered = 0, correct = 0;
    const score = h(`<div class="quiz-score" hidden><span class="big"></span><span class="msg"></span><button class="btn retry">もう一度解く</button></div>`);
    const record = (q, ok) => {
      answered++; if (ok) correct++;
      store.set(`quiz.${q.id}`, { ok, t: Date.now() });
      if (answered === questions.length) {
        score.hidden = false;
        score.querySelector(".big").textContent = `${correct} / ${questions.length}`;
        const r = correct / questions.length;
        score.querySelector(".msg").textContent = r === 1 ? "全問正解！完璧です 🎉" : r >= .7 ? "よくできました。間違えた問題の解説を確認しましょう。" : "もう一度本文を読み直してから挑戦しましょう。";
        if (opts.onFinish) opts.onFinish({ correct, total: questions.length });
      }
    };
    const explain = (q, ok) => h(`<div class="quiz-explain"><span class="verdict ${ok ? "ok" : "ng"}">${ok ? "正解！" : "不正解"}</span> ${q.explain || ""}</div>`);

    questions.forEach((q, qi) => {
      const typeLabel = { single: "択一", tf: "○×", order: "並べ替え" }[q.type] || "択一";
      const box = h(`<div class="quiz-q" data-qid="${esc(q.id)}"><div class="q-head"><span class="q-num">Q${qi + 1}</span><span class="q-text">${q.q}</span><span class="badge q-type">${typeLabel}</span></div></div>`);
      if (q.type === "order") {
        const pool = h(`<div class="quiz-order-pool"></div>`);
        const ans = h(`<div class="quiz-order-answer" aria-label="あなたの回答"></div>`);
        const ctl = h(`<div class="btn-row"><button class="btn primary check" disabled>答え合わせ</button><button class="btn reset">リセット</button></div>`);
        const hint = h(`<p class="small muted" style="margin:6px 0 0">項目を正しい順にクリックしてください。</p>`);
        const items = shuffle(q.choices.map((c, i) => ({ c, i })));
        let done = false;
        const refresh = () => { ctl.querySelector(".check").disabled = ans.children.length !== q.choices.length || done; };
        items.forEach((it) => {
          const b = h(`<button class="quiz-order-item" data-i="${it.i}">${it.c}</button>`);
          b.addEventListener("click", () => { if (done) return; (b.parentElement === pool ? ans : pool).append(b); refresh(); });
          pool.append(b);
        });
        ctl.querySelector(".reset").addEventListener("click", () => { if (done) return; Array.from(ans.children).forEach((b) => pool.append(b)); refresh(); });
        ctl.querySelector(".check").addEventListener("click", () => {
          done = true;
          const order = Array.from(ans.children).map((b) => +b.dataset.i);
          const ok = order.every((v, i) => v === i);
          ans.classList.add(ok ? "correct" : "wrong");
          ctl.remove();
          const ex = explain(q, ok);
          if (!ok) ex.insertAdjacentHTML("beforeend", `<div class="small" style="margin-top:6px"><b>正しい順：</b>${q.choices.map((c, i) => `${i + 1}. ${c}`).join(" → ")}</div>`);
          box.append(ex);
          record(q, ok);
        });
        box.append(hint, pool, ans, ctl);
      } else {
        // 択一は表示順をシャッフル（正解位置の偏りを防ぐ）
        let choices, ansIdx;
        if (q.type === "tf") { choices = ["○ 正しい", "× 誤り"]; ansIdx = q.answer ? 0 : 1; }
        else {
          const order = shuffle(q.choices.map((_, i) => i));
          choices = order.map((i) => q.choices[i]);
          ansIdx = order.indexOf(q.answer);
        }
        const wrap = h(`<div class="quiz-choices ${q.type === "tf" ? "quiz-tf" : ""}"></div>`);
        choices.forEach((c, i) => {
          const b = h(`<button class="quiz-choice">${c}</button>`);
          b.addEventListener("click", () => {
            const ok = i === ansIdx;
            wrap.querySelectorAll("button").forEach((x, j) => { x.disabled = true; if (j === ansIdx) x.classList.add("correct"); });
            if (!ok) b.classList.add("wrong");
            box.append(explain(q, ok));
            record(q, ok);
          });
          wrap.append(b);
        });
        box.append(wrap);
      }
      el.append(box);
    });
    score.querySelector(".retry").addEventListener("click", () => renderQuiz(el, opts.reshuffle ? opts.reshuffle() : questions, opts));
    el.append(score);
  }

  function selectQuestions(spec, { limit, random } = {}) {
    const all = window.QUIZ || [];
    let qs = spec === "all" ? all.slice() : all.filter((q) => spec.split(",").includes(q.ch));
    if (random) qs = shuffle(qs);
    if (limit) qs = qs.slice(0, limit);
    return qs;
  }

  function initQuizzes(scope) {
    scope.querySelectorAll("[data-quiz]").forEach((el) => {
      const opts = { limit: el.dataset.limit ? parseInt(el.dataset.limit, 10) : 0, random: "random" in el.dataset };
      const pick = () => selectQuestions(el.dataset.quiz, opts);
      renderQuiz(el, pick(), { reshuffle: opts.random ? pick : null });
    });
  }

  function initAll(scope) {
    initHotspots(scope); initSteppers(scope); initTabs(scope); initChecklists(scope); initQuizzes(scope);
  }

  // ---------- Boot ----------
  function boot() {
    buildHeader();
    const page = document.querySelector(".page");
    const main = document.querySelector("main");
    if (page && document.body.dataset.layout !== "wide") buildSideNav(page);
    else if (page) page.classList.add("no-side");
    if (main && document.body.dataset.chapter) buildChapterFooter(main, document.body.dataset.chapter);
    initAll(document);
    document.querySelectorAll(".side-nav a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
  }

  window.LTE = { store, label, CHAPTERS, PARTS, TOOLS, EXTRA, root, esc, h, shuffle, renderQuiz, selectQuestions, initAll };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
