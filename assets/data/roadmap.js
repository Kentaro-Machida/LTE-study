/* =========================================================
   開発ロードマップのフェーズ定義（第12章 と tools/roadmap.html で共用）
   - 週数・費用はすべて「目安（要見積）」。モジュール採用・輸出先1か国・
     中国なし・キャリア認証なし を基準ケースとした値です。
   - startWeek は基準ケースで deps/lag から計算した開始週（検算済み）。
   - deps: [{ id, lag }] … 依存フェーズ終了週 + lag 週 で開始（lag<0 は前倒しで並行）。
   - adj: 条件による週数の増分
       perCountry … 輸出先が1か国増えるごと
       china      … 中国を含む場合
       carrier    … キャリア認証（相互接続試験・OTA要件など）ありの場合
       chipdown   … モジュールを使わずチップダウン設計する場合
   - optional: "carrier" のフェーズはキャリア認証ありのときだけ実施。
   - cost: 外部費用の目安（万円）。社内人件費は含まない。
   ========================================================= */
window.LTE_ROADMAP = {
  version: "2026-09",
  unit: "week",
  baseCase: "LTEモジュール採用・輸出先1か国（日本以外）・中国なし・キャリア認証なし",
  phases: [
    {
      id: "req", name: "要件定義", short: "要件", color: "--c6", stage: "企画",
      startWeek: 0, weeks: 4, min: 3, max: 6,
      deps: [], adj: { perCountry: 0.5, china: 1, carrier: 0, chipdown: 0 },
      summary: "対象国・用途・通信量・消費電力・コスト・量産数量を数字で決め、後工程の判断基準にします。",
      deliverables: ["製品要求仕様書（PRD）", "対象国・地域リストと優先順位", "通信要件（上り/下り帯域・遅延・月間データ量）", "消費電力・電源方式の目標値", "目標BOMコスト・量産数量・発売時期"],
      risks: ["対象国があいまいでバンド・認証が決まらない", "映像の画質要件が未定で上り帯域が見積もれない", "中国向けを後から追加して別SKUが必要になる"],
      owners: ["PM", "事業企画", "HW", "SW"],
      gate: ["対象国・地域と優先順位が合意されている", "上り帯域・月間データ量が数値で決まっている", "電源方式と許容消費電力が決まっている", "目標コストと量産数量のレンジが決まっている"],
      chapters: [{ file: "chapters/05-categories.html", title: "05 LTEカテゴリ" }, { file: "chapters/10-asia.html", title: "10 アジア各国" }],
      cost: { min: 0, max: 50, note: "主に社内工数。市場調査を外注する場合" },
      robot: "遠隔操作映像を送るのか、状態データだけなのかで、以降の選定がすべて変わります。"
    },
    {
      id: "select", name: "方式・カテゴリ・モジュール選定", short: "選定", color: "--c2", stage: "企画",
      startWeek: 3, weeks: 4, min: 2, max: 8,
      deps: [{ id: "req", lag: -1 }], adj: { perCountry: 0.5, china: 1, carrier: 0.5, chipdown: 4 },
      summary: "カテゴリ（Cat-1/Cat-4/LTE-M等）、対応バンド、モジュール型番、SKU構成を決めます。",
      deliverables: ["カテゴリ比較表と選定理由", "対象国のバンド一覧と対応表", "モジュール候補2〜3機種の比較（認証取得状況・EOL予定・価格）", "SKU構成案（グローバル1機種か、地域別か）", "SIM/回線方式の方針（ローカルSIM・ローミング・eSIM）"],
      risks: ["必要バンドの取りこぼし", "モジュールの認証（技適・各国・キャリア）未取得", "モジュールの供給期間が短くEOLが早い", "中国向けに別モジュールが必要"],
      owners: ["HW", "SW", "調達", "PM"],
      gate: ["全対象国の必要バンドをカバーするSKU構成が決まっている", "モジュールの取得済み認証を一覧で確認済み", "モジュールの供給保証期間・PCN通知方法を確認済み", "SIM/回線方針が決まっている"],
      chapters: [{ file: "chapters/05-categories.html", title: "05 LTEカテゴリ" }, { file: "chapters/11-commonization.html", title: "11 部品共通化" }, { file: "tools/band-checker.html", title: "バンドチェッカー" }, { file: "tools/module-selector.html", title: "カテゴリ選定ウィザード" }],
      cost: { min: 0, max: 30, note: "サンプル購入・技術相談" },
      robot: "移動ロボットは走行中の基地局切替（ハンドオーバー）が前提。NB-IoTは不向きです。"
    },
    {
      id: "evb", name: "評価ボード（EVB）で実網検証", short: "EVB", color: "--c1", stage: "検証",
      startWeek: 6, weeks: 6, min: 4, max: 8,
      deps: [{ id: "select", lag: -1 }], adj: { perCountry: 0.5, china: 1, carrier: 0, chipdown: 2 },
      summary: "モジュールメーカーの評価ボードで、実際の回線につないで通信・電流・ソフト連携を確かめます。",
      deliverables: ["実網でのアタッチ・通信速度・遅延の測定記録", "送信時ピーク電流・平均電流の波形", "ホスト（ロボットのCPU）との接続方式の確定（USB/UART/PCIe）", "ATコマンド・ドライバの動作確認", "FOTA（モジュールFW更新）の手順確認"],
      risks: ["実験室では出るが実網で速度が出ない", "ピーク電流を見落として電源設計が不足", "ホストOSのドライバが無い・不安定"],
      owners: ["HW", "SW"],
      gate: ["目標の上り帯域が実網で出ることを確認", "ピーク電流の実測値が電源設計に反映されている", "ホストとの接続・再接続・異常復帰が動く"],
      chapters: [{ file: "chapters/03-attach.html", title: "03 アタッチ" }, { file: "chapters/06-hardware.html", title: "06 ハードウェア" }, { file: "chapters/08-software.html", title: "08 ソフトウェア" }],
      cost: { min: 10, max: 60, note: "EVB・SIM・電流測定器（電源アナライザ等）" },
      robot: "モーター駆動とLTE送信が同時に起きたときの電源電圧の落ち込みまで見ておくと安心です。"
    },
    {
      id: "design", name: "回路・基板・アンテナ設計", short: "設計", color: "--c1", stage: "設計",
      startWeek: 10, weeks: 8, min: 6, max: 12,
      deps: [{ id: "evb", lag: -2 }], adj: { perCountry: 0.5, china: 1, carrier: 0, chipdown: 12 },
      summary: "モジュール周辺回路・電源・SIM回路・RF配線を設計し、筐体と一緒にアンテナ位置を決めます。",
      deliverables: ["回路図・基板レイアウト（RF配線50Ω、GND設計）", "電源設計（ピーク電流・バルクコンデンサ）", "アンテナ仕様・配置図（筐体・金属部品との距離）", "アンテナメーカーとのチューニング計画", "EVT試作の手配"],
      risks: ["アンテナ配置を後回しにして金属筐体・モーター近くに置く", "RF配線のインピーダンス不整合", "DC-DC・モーターのノイズで受信感度が劣化（デセンス）"],
      owners: ["HW", "機構", "アンテナメーカー"],
      gate: ["モジュールメーカーの回路設計レビューを受けた", "アンテナ位置が筐体設計と合意済み", "RF配線・電源のデザインルールチェック完了"],
      chapters: [{ file: "chapters/06-hardware.html", title: "06 ハードウェア" }],
      cost: { min: 50, max: 300, note: "基板設計外注・アンテナ設計/チューニング費" },
      robot: "ロボットは金属フレーム・モーター・バッテリーが多く、アンテナにとって厳しい環境です。"
    },
    {
      id: "evt", name: "EVT試作・評価", short: "EVT", color: "--c2", stage: "EVT",
      startWeek: 18, weeks: 8, min: 6, max: 10,
      deps: [{ id: "design", lag: 0 }], adj: { perCountry: 0, china: 0, carrier: 0, chipdown: 4 },
      summary: "初回の実機試作。基本動作、RF導通試験、アンテナ単体の受動測定（効率・VSWR）を行います。",
      deliverables: ["EVT試作機（数台〜数十台）", "基本動作確認記録（起動・アタッチ・通信・FOTA）", "RF導通試験（送信電力・受信感度）結果", "アンテナ受動測定（効率・VSWR）結果", "不具合リストと設計変更案"],
      risks: ["基板の作り直し（リスピン）", "アンテナ効率が目標未達", "ノイズによる受信感度劣化"],
      owners: ["HW", "SW", "アンテナメーカー"],
      gate: ["全機能が一通り動く（性能未達は許容し、対策案がある）", "RF導通でモジュール仕様どおりの送信電力・感度が出る", "アンテナ効率・VSWRが目標値またはその見込みがある", "重大不具合の対策方針が決まっている"],
      chapters: [{ file: "chapters/06-hardware.html", title: "06 ハードウェア" }],
      cost: { min: 100, max: 500, note: "試作基板・筐体（数十台規模）" },
      robot: "EVTは「設計が正しいか」を見る段階。見た目や量産性より、まず電波と電源です。"
    },
    {
      id: "ota", name: "OTA測定・アンテナ改善", short: "OTA", color: "--c2", stage: "EVT",
      startWeek: 22, weeks: 6, min: 4, max: 10,
      deps: [{ id: "evt", lag: -4 }], adj: { perCountry: 0.5, china: 0, carrier: 2, chipdown: 2 },
      summary: "電波暗室で製品まるごとの送信性能（TRP）・受信性能（TIS）を測り、キャリア要件と比較します。",
      deliverables: ["TRP/TIS測定結果（バンドごと）", "キャリアOTA要件との比較表", "アンテナ再チューニング結果", "ノイズ対策（シールド・配線変更）"],
      risks: ["TISがノイズで劣化し要件未達", "特定バンド（低い周波数帯）だけ効率が出ない", "暗室の予約が取れず遅延"],
      owners: ["HW", "アンテナメーカー", "試験所"],
      gate: ["全対象バンドでTRP/TISが目標値（キャリア要件がある場合はそれ）を満たす", "ロボットの姿勢・アーム位置違いでも大きな劣化がない"],
      chapters: [{ file: "chapters/09-certification.html", title: "09 規格と認証" }],
      cost: { min: 50, max: 300, note: "電波暗室使用料・測定費（回数による）" },
      robot: "アームや扉の開閉など形が変わるロボットは、代表的な姿勢を複数測っておきます。"
    },
    {
      id: "dvt", name: "DVT（設計検証）", short: "DVT", color: "--c3", stage: "DVT",
      startWeek: 28, weeks: 10, min: 8, max: 14,
      deps: [{ id: "ota", lag: 0 }], adj: { perCountry: 0, china: 1, carrier: 0, chipdown: 4 },
      summary: "量産に近い部品・筐体で、EMC/RF事前試験、環境試験、ソフト機能完成を確認します。",
      deliverables: ["DVT試作機（数十〜百台規模）", "EMC・RF事前試験（プリスキャン）結果", "環境試験（温度・湿度・振動・落下・防水）結果", "ソフト機能完成版（通信復帰・FOTA・ログ）", "認証用サンプル・技術資料一式"],
      risks: ["EMC事前試験で不合格→対策で設計変更", "高温でモジュールが熱保護・速度低下", "振動でアンテナケーブル・コネクタが外れる"],
      owners: ["HW", "SW", "品証", "機構"],
      gate: ["全製品要件（機能・性能・信頼性）を満たす構成が1つに決まった", "EMC/RF事前試験で本試験に通る見込み", "環境試験で重大不具合なし", "認証サンプルと資料が揃った"],
      chapters: [{ file: "chapters/09-certification.html", title: "09 規格と認証" }, { file: "chapters/08-software.html", title: "08 ソフトウェア" }],
      cost: { min: 200, max: 800, note: "DVT試作・EMC事前試験・環境試験" },
      robot: "走行振動と長時間稼働の発熱は、ロボット特有の信頼性リスクです。"
    },
    {
      id: "cert", name: "法規認証（技適・各国）", short: "認証", color: "--c5", stage: "認証",
      startWeek: 34, weeks: 12, min: 8, max: 20,
      deps: [{ id: "dvt", lag: -4 }], adj: { perCountry: 2, china: 8, carrier: 0, chipdown: 8 },
      summary: "日本の技適、輸出先各国の無線・EMC・安全認証を、認証代行・試験所と並行して進めます。",
      deliverables: ["技適（認証済みモジュールの表示確認、または工事設計認証）", "各国の無線認証（例：中国SRRC/CTA、韓国KC、台湾NCC、インドWPC/TEC等）", "EMC・安全規格の試験報告書", "ラベル・マニュアル記載事項", "現地代理人・輸入者の手配"],
      risks: ["国ごとの書類要件の差で差戻し", "現地試験が必要な国でサンプル輸送・通関に時間", "認証取得前に仕様変更して再試験"],
      owners: ["認証代行", "品証", "HW", "PM"],
      gate: ["出荷する全ての国で認証（または届出）が完了、証明書を保管", "ラベル・表示が各国要件どおり", "認証後の設計変更管理ルールが決まっている"],
      chapters: [{ file: "chapters/09-certification.html", title: "09 規格と認証" }, { file: "chapters/10-asia.html", title: "10 アジア各国" }],
      cost: { min: 100, max: 1500, note: "国数・モジュール認証の流用可否で大きく変動" },
      robot: "中国は無線（SRRC）と網接続（CTA/NAL）が別で、時間がかかりがち。早めに計画します。"
    },
    {
      id: "carrier", name: "キャリア認証・GCF等", short: "キャリア", color: "--c5", stage: "認証", optional: "carrier",
      startWeek: 36, weeks: 10, min: 6, max: 16,
      deps: [{ id: "dvt", lag: -2 }], adj: { perCountry: 1, china: 0, carrier: 0, chipdown: 8 },
      summary: "採用キャリアの相互接続試験・OTA要件、必要に応じてGCF等の業界認証を取得します。",
      deliverables: ["キャリアの試験申込・試験計画", "相互接続（IOT）試験結果", "キャリアOTA試験結果", "GCF/PTCRB等の認証（チップダウンや要求がある場合）", "キャリアの承認通知"],
      risks: ["キャリアの試験枠待ち", "モジュールFW版数が承認版と違い再試験", "OTA不合格でアンテナやり直し"],
      owners: ["キャリア", "認証代行", "HW", "SW"],
      gate: ["採用キャリアの承認を取得", "承認されたモジュールFW版数を量産で固定"],
      chapters: [{ file: "chapters/09-certification.html", title: "09 規格と認証" }],
      cost: { min: 100, max: 800, note: "キャリア・試験範囲によって大きく変動" },
      robot: "モジュールがキャリア認証済みでも、製品として別途試験が求められることがあります。"
    },
    {
      id: "field", name: "フィールド試験（現地走行・ローミング）", short: "現地試験", color: "--c4", stage: "DVT",
      startWeek: 38, weeks: 6, min: 4, max: 10,
      deps: [{ id: "dvt", lag: 0 }], adj: { perCountry: 1, china: 2, carrier: 0, chipdown: 0 },
      summary: "実際の輸出先で、ロボットを走らせて通信品質・ハンドオーバー・ローミングを確認します。",
      deliverables: ["国・キャリアごとの走行試験ログ（電波強度・速度・切断回数）", "ローミング・ネットワーク選択の確認", "屋内（倉庫・工場）での電波状況記録", "問題点と対策（アンテナ・ソフト・回線）"],
      risks: ["現地で未認証機器を使えない（試験の許可・認証済みモジュールの確認が必要）", "ローミング先でデータが止まる（契約・APN・バンド）", "現地の屋内は想定より電波が弱い"],
      owners: ["SW", "HW", "現地パートナー", "キャリア"],
      gate: ["全対象国で目標の通信品質を確認", "切断からの自動復帰を確認", "回線契約・ローミング条件が確定"],
      chapters: [{ file: "chapters/07-sim.html", title: "07 SIMと回線" }, { file: "chapters/10-asia.html", title: "10 アジア各国" }],
      cost: { min: 50, max: 400, note: "渡航・現地SIM・現地パートナー費" },
      robot: "倉庫の奥・エレベーター・地下など、ロボットが実際に行く場所で試します。"
    },
    {
      id: "pvt", name: "PVT（量産検証）", short: "PVT", color: "--c3", stage: "PVT",
      startWeek: 44, weeks: 6, min: 4, max: 10,
      deps: [{ id: "field", lag: 0 }, { id: "cert", lag: -4 }], adj: { perCountry: 0, china: 1, carrier: 0, chipdown: 2 },
      summary: "量産工場・量産治具・量産部品で作り、工程・検査・歩留まりが安定するかを検証します。",
      deliverables: ["PVTロット（量産工程で数百台規模）", "工程表・作業標準書・検査規格書", "RF最終検査・書込み工程の治具とソフト", "歩留まり・不良解析レポート", "量産判定（MP移行判定）記録"],
      risks: ["RF検査の合否しきい値が甘い/厳しすぎる", "治具のシールド不足で検査が不安定", "歩留まりが目標未達"],
      owners: ["製造", "品証", "HW", "SW", "調達"],
      gate: ["量産治具・量産部品で歩留まり目標を達成（例：直行率95%以上）", "全検査工程の手順と合否基準が文書化", "不良の原因と対策がすべてクローズ"],
      chapters: [{ file: "chapters/06-hardware.html", title: "06 ハードウェア" }],
      cost: { min: 100, max: 600, note: "PVTロット・検査治具・無線機テスター" },
      robot: "PVTの台数は、そのまま初期出荷品になる場合もあります。"
    },
    {
      id: "mp", name: "量産立上げ", short: "量産", color: "--c3", stage: "MP",
      startWeek: 50, weeks: 4, min: 3, max: 8,
      deps: [{ id: "pvt", lag: 0 }, { id: "cert", lag: 0 }, { id: "carrier", lag: 0 }], adj: { perCountry: 0, china: 1, carrier: 0, chipdown: 0 },
      summary: "FW書込み、IMEI/シリアル紐付け、RF最終検査、SIM/eSIMプロビジョニングを行い出荷します。",
      deliverables: ["量産出荷品", "IMEI・ICCID/EID・シリアルの紐付けデータ", "出荷時の回線状態（休止・テスト・開通）の定義", "トレーサビリティ記録", "初期流動管理の結果"],
      risks: ["IMEI・ICCIDの紐付け間違い", "出荷時点で回線が課金状態になっている", "モジュールFW版数の混在"],
      owners: ["製造", "品証", "SW", "調達", "キャリア"],
      gate: ["初期流動の不良率が目標内", "出荷データ（IMEI等）が回線管理システムに正しく登録"],
      chapters: [{ file: "chapters/07-sim.html", title: "07 SIMと回線" }],
      cost: { min: 50, max: 300, note: "工程立上げ・初期流動（部材費は別）" },
      robot: "顧客先に届いた瞬間に回線がつながる状態にしておくのか、現地で開通するのかを決めます。"
    },
    {
      id: "ops", name: "運用（FOTA・回線管理・EOL対応）", short: "運用", color: "--c4", stage: "運用", ongoing: true,
      startWeek: 54, weeks: 8, min: 8, max: 8,
      deps: [{ id: "mp", lag: 0 }], adj: { perCountry: 0, china: 0, carrier: 0, chipdown: 0 },
      summary: "出荷後もFOTA、回線管理、モジュールEOL/PCN対応、証明書更新、停波への追従が続きます。",
      deliverables: ["FOTA運用手順（ホストFW・モジュールFW）", "回線管理（開通・休止・解約・通信量監視）", "PCN/EOL受信時の影響評価手順", "証明書・鍵の更新計画", "各国の停波・周波数再編の監視"],
      risks: ["モジュールEOLで代替品の再認証が必要", "キャリアの停波で通信不能", "証明書期限切れでクラウドに接続不能"],
      owners: ["SW", "品証", "調達", "CS（サポート）"],
      gate: ["（継続）通信品質・通信量・FOTA成功率を定期レビュー"],
      chapters: [{ file: "chapters/08-software.html", title: "08 ソフトウェア" }, { file: "chapters/07-sim.html", title: "07 SIMと回線" }],
      cost: { min: 0, max: 0, note: "回線費・クラウド費など継続費用（本表では集計外）" },
      robot: "ロボットは5〜10年使われることも。通信の寿命（停波・EOL）が製品寿命より短くないか確認します。"
    }
  ]
};

/* 条件に応じた計画を計算する共通関数
   opts: { countries: 1.., china: bool, carrier: bool, chipdown: bool }
   戻り値: [{ ...phase, start, dur, end, skipped }] と total（運用を除く最終週） */
window.LTE_ROADMAP.plan = function (opts) {
  const o = Object.assign({ countries: 1, china: false, carrier: false, chipdown: false }, opts || {});
  const out = {}, list = [];
  this.phases.forEach((p) => {
    const skipped = p.optional === "carrier" && !o.carrier;
    let dur = p.weeks;
    if (!p.ongoing) {
      dur += (p.adj.perCountry || 0) * Math.max(0, o.countries - 1);
      if (o.china) dur += p.adj.china || 0;
      if (o.carrier) dur += p.adj.carrier || 0;
      if (o.chipdown) dur += p.adj.chipdown || 0;
    }
    dur = Math.round(dur * 2) / 2;
    let start = 0;
    p.deps.forEach((d) => {
      const dep = out[d.id];
      if (!dep || dep.skipped) return;
      start = Math.max(start, dep.end + d.lag);
    });
    start = Math.max(0, start);
    const r = Object.assign({}, p, { start, dur: skipped ? 0 : dur, end: skipped ? start : start + dur, skipped });
    out[p.id] = r; list.push(r);
  });
  const total = Math.max.apply(null, list.filter((r) => !r.ongoing && !r.skipped).map((r) => r.end));
  return { phases: list, total, months: total / 4.345 };
};
