/* =========================================================
   LTE Study — バンド／国別事業者／モジュール データセット
   // モジュールの認証一覧に、その国の制度名が含まれるか（目安）
  const CERT_KEYS = {
    JP: ["JATE", "TELEC", "技適", "GITEKI"], CN: ["CCC", "SRRC"], KR: ["KC"], TW: ["NCC"], SG: ["IMDA"],
    AU: ["RCM"], US: ["FCC", "PTCRB"], DE: ["CE", "RED"], HK: ["HKCA", "OFCA"], TH: ["NBTC"], VN: ["MIC"],
    ID: ["SDPPI"], MY: ["SIRIM"], PH: ["NTC"], IN: ["TEC", "MTCTE", "WPC"],
  };
  function certListed(m, code) {
    const keys = CERT_KEYS[code] || [];
    return (m.certifications || []).some((c) => keys.some((k) => c.indexOf(k) >= 0));
  }

  window.LTE_BANDS = { bands, countries, modules, util, updated }
   - bands    : 3GPP TS 36.101 の E-UTRA 運用バンド（本サイトで使うもの）
   - countries: 国ごとの主要事業者と LTE バンド（core = カバレッジの要となるバンド）
   - modules  : 代表的なモジュールの対応バンド（データシート／製品ページ記載値）
   注意: 事業者の運用バンドは再編・停波・合併で変わります。量産前に必ず最新の公式情報で再確認してください。
   iot: LTE-M/NB-IoT の運用バンドが分かっている場合のみ記載（無ければ core で近似）
   ltem / nbiot: true=商用提供あり, false=提供なし（公表ベース）, null=不明・未確認
   ========================================================= */
(function () {
  "use strict";

  // ---------- バンド定義（MHz）。dl/ul は "下限–上限"。SDL=下りのみ ----------
  const bands = {
    1: { freq: "2100", dl: "2110–2170", ul: "1920–1980", duplex: "FDD", note: "IMT 2GHz。アジア・欧州で最も一般的" },
    2: { freq: "1900 (PCS)", dl: "1930–1990", ul: "1850–1910", duplex: "FDD", note: "北米・中南米" },
    3: { freq: "1800", dl: "1805–1880", ul: "1710–1785", duplex: "FDD", note: "世界で最も普及したLTEバンドの一つ" },
    4: { freq: "1700/2100 (AWS-1)", dl: "2110–2155", ul: "1710–1755", duplex: "FDD", note: "北米・中南米。B66の部分集合" },
    5: { freq: "850", dl: "869–894", ul: "824–849", duplex: "FDD", note: "韓国・インド・北米など。B26の部分集合" },
    7: { freq: "2600", dl: "2620–2690", ul: "2500–2570", duplex: "FDD", note: "都市部の容量用" },
    8: { freq: "900", dl: "925–960", ul: "880–915", duplex: "FDD", note: "旧GSM帯の転用が多い。郊外カバレッジ" },
    11: { freq: "1500 (下側)", dl: "1475.9–1495.9", ul: "1427.9–1447.9", duplex: "FDD", note: "日本固有（KDDI・ソフトバンク）" },
    12: { freq: "700 (Lower A/B/C)", dl: "729–746", ul: "699–716", duplex: "FDD", note: "米国。B85の部分集合" },
    13: { freq: "700 (Upper C)", dl: "746–756", ul: "777–787", duplex: "FDD", note: "米国Verizon" },
    14: { freq: "700 (PS)", dl: "758–768", ul: "788–798", duplex: "FDD", note: "米国FirstNet（公共安全）" },
    17: { freq: "700 (Lower B/C)", dl: "734–746", ul: "704–716", duplex: "FDD", note: "米国AT&T。B12の部分集合" },
    18: { freq: "800 (下側)", dl: "860–875", ul: "815–830", duplex: "FDD", note: "日本KDDI。B26対応端末はMFBIで利用可能な場合あり" },
    19: { freq: "800 (上側)", dl: "875–890", ul: "830–845", duplex: "FDD", note: "日本NTTドコモ。B26の部分集合" },
    20: { freq: "800 (EU DD)", dl: "791–821", ul: "832–862", duplex: "FDD", note: "欧州の主力ローバンド" },
    21: { freq: "1500 (上側)", dl: "1495.9–1510.9", ul: "1447.9–1462.9", duplex: "FDD", note: "日本固有（NTTドコモ）" },
    25: { freq: "1900+ (PCS拡張)", dl: "1930–1995", ul: "1850–1915", duplex: "FDD", note: "B2の上位集合" },
    26: { freq: "850+ (拡張)", dl: "859–894", ul: "814–849", duplex: "FDD", note: "B5/B18/B19を包含する上位集合" },
    27: { freq: "800 SMR", dl: "852–869", ul: "807–824", duplex: "FDD", note: "中南米の一部" },
    28: { freq: "700 (APT)", dl: "758–803", ul: "703–748", duplex: "FDD", note: "アジア太平洋の主力ローバンド" },
    29: { freq: "700 (SDL)", dl: "717–728", ul: "—", duplex: "SDL", note: "下りのみ（キャリアアグリゲーション専用）" },
    30: { freq: "2300 (WCS)", dl: "2350–2360", ul: "2305–2315", duplex: "FDD", note: "米国AT&T" },
    31: { freq: "450", dl: "462.5–467.5", ul: "452.5–457.5", duplex: "FDD", note: "一部の国の専用網" },
    32: { freq: "1500 L (SDL)", dl: "1452–1496", ul: "—", duplex: "SDL", note: "下りのみ（欧州）" },
    34: { freq: "2000 (TDD)", dl: "2010–2025", ul: "2010–2025", duplex: "TDD", note: "中国移動" },
    38: { freq: "2600 (TDD)", dl: "2570–2620", ul: "2570–2620", duplex: "TDD", note: "B41の部分集合" },
    39: { freq: "1900 (TDD)", dl: "1880–1920", ul: "1880–1920", duplex: "TDD", note: "中国移動" },
    40: { freq: "2300 (TDD)", dl: "2300–2400", ul: "2300–2400", duplex: "TDD", note: "中国・インド・東南アジアで多用" },
    41: { freq: "2500 (TDD)", dl: "2496–2690", ul: "2496–2690", duplex: "TDD", note: "日本（UQ/ソフトバンク系）・中国・米国" },
    42: { freq: "3500 (TDD)", dl: "3400–3600", ul: "3400–3600", duplex: "TDD", note: "容量用。IoT向けモジュールは非対応が多い" },
    43: { freq: "3700 (TDD)", dl: "3600–3800", ul: "3600–3800", duplex: "TDD", note: "容量用" },
    46: { freq: "5200 (LAA)", dl: "5150–5925", ul: "—", duplex: "TDD", note: "免許不要帯（LAA）。下りのみ" },
    48: { freq: "3600 (CBRS)", dl: "3550–3700", ul: "3550–3700", duplex: "TDD", note: "米国CBRS" },
    65: { freq: "2100+ (拡張)", dl: "2110–2200", ul: "1920–2010", duplex: "FDD", note: "B1の上位集合" },
    66: { freq: "1700/2100+ (AWS-3)", dl: "2110–2200", ul: "1710–1780", duplex: "FDD", note: "B4の上位集合（北米）" },
    71: { freq: "600", dl: "617–652", ul: "663–698", duplex: "FDD", note: "米国T-Mobile。アンテナが最も大きくなる" },
    72: { freq: "450 (PMR)", dl: "461–466", ul: "451–456", duplex: "FDD", note: "欧州の専用網" },
    73: { freq: "450 (APAC)", dl: "460–465", ul: "450–455", duplex: "FDD", note: "専用網" },
    85: { freq: "700 (Lower A拡張)", dl: "728–746", ul: "698–716", duplex: "FDD", note: "B12の上位集合" },
    87: { freq: "410", dl: "420–425", ul: "410–415", duplex: "FDD", note: "専用網" },
    88: { freq: "410+", dl: "422–427", ul: "412–417", duplex: "FDD", note: "専用網" },
  };

  // ---------- 国・事業者 ----------
  // main:false はサブブランド・小規模事業者（既定では判定対象外）
  const W = "https://en.wikipedia.org/wiki/List_of_LTE_networks_in_Asia";
  const countries = [
    {
      code: "JP", name: "日本", flag: "🇯🇵",
      operators: [
        { name: "NTTドコモ", lte: [1, 3, 19, 21, 28, 42], core: [1, 3, 19], ltem: true, nbiot: false, note: "B19(800MHz)が地方・屋内の要。B42(3.5GHz)は容量用。NB-IoTは2020年3月末で提供終了（LTE-M・Cat.1は継続）" },
        { name: "KDDI (au)", lte: [1, 3, 11, 18, 26, 28, 41, 42], core: [1, 18], ltem: true, nbiot: true, note: "B18はB26対応端末もMFBIで利用可。B41はUQ系" },
        { name: "ソフトバンク", lte: [1, 3, 8, 11, 28, 41, 42], core: [1, 3, 8], ltem: true, nbiot: true, note: "B8(900MHz)が要。B41はAXGP" },
        { name: "楽天モバイル", lte: [3, 18, 28], core: [3], ltem: null, nbiot: null, note: "B3が自社主力。B18はKDDIローミング（縮小中）、B28(700MHz)は2024年から" },
      ],
      notes: "技適（電波法）＋ JATE（電気通信事業法の端末機器技術基準）が必要。キャリアごとの相互接続性確認（キャリア認証）もあり。3Gは各社停波済み/停波予定。",
      sources: [W, "https://www.frequencycheck.com/countries/japan", "https://www.tele.soumu.go.jp/j/adm/freq/search/myuse/summary/index.htm"],
    },
    {
      code: "CN", name: "中国", flag: "🇨🇳",
      operators: [
        { name: "China Mobile", lte: [3, 8, 34, 38, 39, 40, 41], core: [39, 41], iot: [8], ltem: false, nbiot: true, note: "TD-LTE（B34/38/39/40/41）中心。FDDはB3/B8。NB-IoTはB8(900MHz)" },
        { name: "China Unicom", lte: [1, 3, 8, 40], core: [1, 3], iot: [8], ltem: false, nbiot: true, note: "NB-IoTはB8(900MHz)中心（要確認）" },
        { name: "China Telecom", lte: [1, 3, 5, 40], core: [3, 5], iot: [5], ltem: false, nbiot: true, note: "NB-IoTはB5(800MHz帯)で全国展開" },
      ],
      notes: "SRRC（型式認可）・NAL（ネットワーク接続許可）・CCC（強制製品認証）が必要。LTE-Mは主要事業者で商用展開されておらず、NB-IoTが中心。TDDバンドへの対応が必須。",
      sources: [W, "https://www.frequencycheck.com/countries/china", "https://en.wikipedia.org/wiki/LTE-M"],
    },
    {
      code: "KR", name: "韓国", flag: "🇰🇷",
      operators: [
        { name: "SK Telecom", lte: [1, 3, 5, 7], core: [3, 5], ltem: true, nbiot: null, note: "" },
        { name: "KT", lte: [1, 3, 8], core: [3, 8], ltem: true, nbiot: true, note: "" },
        { name: "LG U+", lte: [1, 5, 7], core: [1, 5], ltem: null, nbiot: true, note: "B5(850MHz)が要" },
      ],
      notes: "KC（電波法適合性評価）が必要。加えて各キャリアの端末認証（網接続試験）が実質必須。",
      sources: [W, "https://www.frequencycheck.com/countries/south-korea"],
    },
    {
      code: "TW", name: "台湾", flag: "🇹🇼",
      operators: [
        { name: "中華電信", lte: [1, 3, 7, 8], core: [3, 8], ltem: true, nbiot: true, note: "" },
        { name: "台湾大哥大", lte: [1, 3, 7, 8, 28], core: [3, 28], ltem: null, nbiot: true, note: "2023年に台湾之星を合併" },
        { name: "遠傳電信", lte: [1, 3, 7, 8, 28, 41], core: [3, 28], ltem: null, nbiot: true, note: "2023年に亜太電信を合併（B41は旧亜太）" },
      ],
      notes: "NCC認証が必要。3Gは停波済み。",
      sources: [W, "https://www.frequencycheck.com/countries/taiwan"],
    },
    {
      code: "HK", name: "香港", flag: "🇭🇰",
      operators: [
        { name: "csl (HKT)", lte: [1, 3, 7, 8, 28], core: [3, 7], ltem: false, nbiot: true, note: "B1/B8の運用状況は要確認" },
        { name: "3香港", lte: [1, 3, 7, 8, 28, 40], core: [3, 7], ltem: false, nbiot: null, note: "" },
        { name: "China Mobile HK", lte: [1, 3, 7, 28, 40], core: [3, 7], ltem: false, nbiot: null, note: "" },
        { name: "SmarTone", lte: [1, 3, 7, 8, 28], core: [3, 7], ltem: false, nbiot: null, note: "" },
      ],
      notes: "OFCA の規格適合（HKCA）。本土中国とは制度・バンドが別。LTE-Mは未展開、NB-IoTのみ。",
      sources: [W, "https://www.frequencycheck.com/countries/hong-kong"],
    },
    {
      code: "SG", name: "シンガポール", flag: "🇸🇬",
      operators: [
        { name: "Singtel", lte: [3, 7, 8, 28, 41], core: [3, 8], ltem: true, nbiot: true, note: "" },
        { name: "StarHub", lte: [1, 3, 7, 8, 28, 41], core: [3, 8], ltem: null, nbiot: true, note: "" },
        { name: "M1", lte: [3, 7, 8, 28], core: [3, 8], ltem: null, nbiot: true, note: "" },
        { name: "SIMBA", main: false, lte: [8, 38, 40], core: [8, 40], ltem: null, nbiot: null, note: "旧TPG Telecom" },
      ],
      notes: "IMDA の機器登録が必要。",
      sources: [W, "https://www.frequencycheck.com/countries/singapore"],
    },
    {
      code: "TH", name: "タイ", flag: "🇹🇭",
      operators: [
        { name: "AIS", lte: [1, 3, 8], core: [1, 3, 8], ltem: true, nbiot: true, note: "700MHz/2600MHzは主に5G NRで利用" },
        { name: "True (True+dtac)", lte: [1, 3, 8, 28, 40], core: [3, 8, 28], ltem: null, nbiot: true, note: "2023年にdtacと合併" },
      ],
      notes: "NBTC の型式認証が必要。",
      sources: [W, "https://www.frequencycheck.com/countries/thailand"],
    },
    {
      code: "VN", name: "ベトナム", flag: "🇻🇳",
      operators: [
        { name: "Viettel", lte: [1, 3], core: [3], ltem: null, nbiot: null, note: "B8の4G転用状況は要確認" },
        { name: "VinaPhone (VNPT)", lte: [1, 3], core: [3], ltem: null, nbiot: null, note: "" },
        { name: "MobiFone", lte: [1, 3], core: [3], ltem: null, nbiot: null, note: "" },
      ],
      notes: "情報通信省（MIC）の型式認証。2G停波・2G専用端末の制限が進行中。LTE-M/NB-IoTの提供状況は事業者に要確認。",
      sources: [W, "https://www.frequencycheck.com/countries/vietnam"],
    },
    {
      code: "ID", name: "インドネシア", flag: "🇮🇩",
      operators: [
        { name: "Telkomsel", lte: [1, 3, 8, 40], core: [3, 8], ltem: false, nbiot: true, note: "" },
        { name: "Indosat Ooredoo Hutchison", lte: [1, 3, 8], core: [3, 8], ltem: false, nbiot: null, note: "" },
        { name: "XL (XLSmart)", lte: [1, 3, 8], core: [3, 8], ltem: false, nbiot: null, note: "2025年にSmartfrenと統合" },
        { name: "Smartfren (XLSmart)", main: false, lte: [5, 40], core: [5, 40], ltem: false, nbiot: null, note: "統合後の網再編に注意" },
      ],
      notes: "SDPPI の機器認証に加え、4G機器には TKDN（国内調達率）要件がある。LTE-Mは主要事業者で未展開。",
      sources: [W, "https://www.frequencycheck.com/countries/indonesia", "https://en.wikipedia.org/wiki/LTE-M"],
    },
    {
      code: "MY", name: "マレーシア", flag: "🇲🇾",
      operators: [
        { name: "Maxis", lte: [1, 3, 7, 8, 28], core: [3, 28], ltem: null, nbiot: null, note: "" },
        { name: "CelcomDigi", lte: [1, 3, 7, 8, 28], core: [3, 28], ltem: null, nbiot: null, note: "2022年にCelcomとDigiが合併" },
        { name: "U Mobile", lte: [1, 3, 7, 8], core: [3, 8], ltem: null, nbiot: null, note: "" },
        { name: "Unifi Mobile (TM)", main: false, lte: [5, 40], core: [5], ltem: null, nbiot: null, note: "" },
      ],
      notes: "SIRIM/MCMC の型式認証（Certificate of Conformity）が必要。",
      sources: [W, "https://www.frequencycheck.com/countries/malaysia"],
    },
    {
      code: "PH", name: "フィリピン", flag: "🇵🇭",
      operators: [
        { name: "Smart (PLDT)", lte: [1, 3, 5, 28, 40, 41], core: [3, 28], ltem: null, nbiot: null, note: "" },
        { name: "Globe", lte: [3, 28, 40, 41], core: [28, 3], ltem: null, nbiot: null, note: "B1/B7/B8の一部運用は要確認" },
        { name: "DITO", lte: [1, 28, 41], core: [28], ltem: null, nbiot: null, note: "新規参入（2021年〜）" },
      ],
      notes: "NTC の型式認証が必要。",
      sources: [W, "https://www.frequencycheck.com/countries/philippines"],
    },
    {
      code: "IN", name: "インド", flag: "🇮🇳",
      operators: [
        { name: "Jio", lte: [3, 5, 40], core: [3, 5], ltem: false, nbiot: true, note: "4G専業（2G/3Gなし）。VoLTE前提" },
        { name: "Airtel", lte: [1, 3, 5, 8, 40], core: [3, 40], iot: [3, 8], ltem: false, nbiot: true, note: "B5は一部サークルのみ。NB-IoTの運用バンドは要確認" },
        { name: "Vi (Vodafone Idea)", lte: [1, 3, 8, 40, 41], core: [3, 40], iot: [3, 8], ltem: false, nbiot: true, note: "NB-IoTの運用バンドは要確認" },
        { name: "BSNL", main: false, lte: [1, 28], core: [28], ltem: false, nbiot: null, note: "4G展開中。バンドは要確認" },
      ],
      notes: "TEC の MTCTE（強制試験認証）、WPC の ETA、BIS 登録など複数制度。LTE-Mは未展開でNB-IoTのみ。",
      sources: [W, "https://www.frequencycheck.com/countries/india", "https://en.wikipedia.org/wiki/LTE-M"],
    },
    {
      code: "AU", name: "オーストラリア（比較）", flag: "🇦🇺",
      operators: [
        { name: "Telstra", lte: [1, 3, 7, 8, 28], core: [28, 3], iot: [28], ltem: true, nbiot: true, note: "LTE-M/NB-IoTはB28中心" },
        { name: "Optus", lte: [1, 3, 7, 28, 40], core: [28, 3], ltem: null, nbiot: null, note: "" },
        { name: "TPG (Vodafone)", lte: [1, 3, 5, 28], core: [5, 28], ltem: null, nbiot: true, note: "" },
      ],
      notes: "ACMA の RCM 表示が必要。3Gは停波済み。",
      sources: ["https://en.wikipedia.org/wiki/List_of_LTE_networks_in_Oceania", "https://www.frequencycheck.com/countries/australia"],
    },
    {
      code: "US", name: "米国（比較）", flag: "🇺🇸",
      operators: [
        { name: "AT&T", lte: [2, 4, 5, 12, 14, 17, 29, 30, 66], core: [2, 12, 66], ltem: true, nbiot: false, note: "NB-IoTは終了を発表済み（要確認）" },
        { name: "Verizon", lte: [2, 4, 5, 13, 48, 66], core: [4, 13, 66], ltem: true, nbiot: true, note: "" },
        { name: "T-Mobile", lte: [2, 4, 12, 41, 66, 71], core: [2, 12, 66, 71], iot: [2, 4, 12, 66], ltem: true, nbiot: true, note: "B71(600MHz)" },
      ],
      notes: "FCC（＋業界認証PTCRB）とキャリア認証が実質必須。",
      sources: ["https://en.wikipedia.org/wiki/List_of_LTE_networks_in_the_Americas", "https://www.frequencycheck.com/countries/united-states"],
    },
    {
      code: "DE", name: "EU代表：ドイツ（比較）", flag: "🇩🇪",
      operators: [
        { name: "Telekom", lte: [1, 3, 7, 8, 20, 28], core: [3, 20], ltem: true, nbiot: true, note: "" },
        { name: "Vodafone DE", lte: [1, 3, 7, 8, 20, 28, 32], core: [3, 20], ltem: true, nbiot: true, note: "" },
        { name: "O2 Telefónica", lte: [1, 3, 7, 8, 20, 28], core: [3, 20], ltem: null, nbiot: true, note: "" },
      ],
      notes: "CE（無線機器指令RED）。欧州はB20(800MHz)が要。",
      sources: ["https://en.wikipedia.org/wiki/List_of_LTE_networks_in_Europe", "https://www.frequencycheck.com/countries/germany"],
    },
  ];

  // ---------- モジュール ----------
  const Q25 = "https://www.muziot.com/wp-content/uploads/2022/08/Quectel_EC25_Series_Hardware_Design_V2.5.pdf";
  const modules = [
    {
      id: "eg25g", name: "EG25-G", vendor: "Quectel", category: "Cat-4",
      lte: [1, 2, 3, 4, 5, 7, 8, 12, 13, 18, 19, 20, 25, 26, 28, 38, 39, 40, 41],
      certifications: ["GCF", "CE", "UKCA", "PTCRB", "FCC", "IC", "Anatel", "IFETEL", "KC", "NCC", "JATE/TELEC", "RCM", "ICASA"],
      note: "グローバル版。WCDMA/GSMフォールバックあり。LCC 29×32mm（EC25系と互換）。中国向けCCC/SRRCは記載なし",
      source: "https://www.quectel.com/content/uploads/2024/03/Quectel_EG25-G_Mini_PCIe_LTE_Standard_Specification_V1.7-1-1.pdf",
    },
    {
      id: "ec25j", name: "EC25-J", vendor: "Quectel", category: "Cat-4",
      lte: [1, 3, 8, 18, 19, 26, 41],
      certifications: ["JATE/TELEC（要確認）"],
      note: "日本向け地域版。LCC 29×32mm",
      source: Q25,
    },
    {
      id: "ec25e", name: "EC25-E", vendor: "Quectel", category: "Cat-4",
      lte: [1, 3, 5, 7, 8, 20, 38, 40, 41],
      certifications: ["CE", "GCF（要確認）"],
      note: "欧州・中東・アジア一部向け地域版。B28非対応",
      source: Q25,
    },
    {
      id: "ec25eux", name: "EC25-EUX", vendor: "Quectel", category: "Cat-4",
      lte: [1, 3, 7, 8, 20, 28, 38, 40, 41],
      certifications: ["CE", "GCF（要確認）"],
      note: "EMEA/APAC向け地域版（B28対応）。B5非対応",
      source: Q25,
    },
    {
      id: "ec25au", name: "EC25-AU", vendor: "Quectel", category: "Cat-4",
      lte: [1, 2, 3, 4, 5, 7, 8, 28, 40],
      certifications: ["RCM（要確認）", "Anatel（要確認）"],
      note: "豪州・中南米・アジア向け地域版。B2はRxダイバーシティ非対応",
      source: Q25,
    },
    {
      id: "ec25af", name: "EC25-AF", vendor: "Quectel", category: "Cat-4",
      lte: [2, 4, 5, 12, 13, 14, 66, 71],
      certifications: ["FCC", "PTCRB（要確認）"],
      note: "北米向け地域版（比較用）",
      source: Q25,
    },
    {
      id: "eg915ueu", name: "EG915U-EU", vendor: "Quectel", category: "Cat-1",
      lte: [1, 3, 5, 7, 8, 20, 28],
      certifications: ["GCF", "CE", "KC（要確認）", "RCM（要確認）"],
      note: "Cat-1。LGA 23.6×19.9mm系（EG91/EG95/BG95と互換とメーカー記載）",
      source: "https://www.quectel.com/content/uploads/2024/03/Quectel_EG915U_Series_LTE_Standard_Module_Specification_V1.6.pdf",
    },
    {
      id: "eg915ucn", name: "EG915U-CN", vendor: "Quectel", category: "Cat-1",
      lte: [1, 3, 5, 8, 34, 38, 39, 40, 41],
      certifications: ["SRRC", "NAL", "CCC"],
      note: "中国向け。EG915U-EUと同じフットプリント",
      source: "https://www.quectel.com/content/uploads/2024/03/Quectel_EG915U_Series_LTE_Standard_Module_Specification_V1.6.pdf",
    },
    {
      id: "sim7600gh", name: "SIM7600G-H", vendor: "SIMCom", category: "Cat-4",
      lte: [1, 2, 3, 4, 5, 7, 8, 12, 13, 18, 19, 20, 25, 26, 28, 66, 34, 38, 39, 40, 41],
      certifications: ["GCF", "CE", "UKCA", "FCC", "IC", "PTCRB", "RCM", "IMDA", "JATE/TELEC", "SRRC", "CCC", "NCC", "KC", "Anatel", "ICASA"],
      note: "グローバル版Cat-4。認証一覧は販売代理店資料ベース（要確認）",
      source: "https://www.t-mobile.com/content/dam/tfb/pdf/tfb-iot/SIM7600G-H_R2_SPEC_202106-1.pdf",
    },
    {
      id: "a7672e", name: "A7672E", vendor: "SIMCom", category: "Cat-1",
      lte: [1, 3, 5, 7, 8, 20, 28],
      certifications: ["CE-RED", "RCM", "UKCA", "NCC", "GCF"],
      note: "欧州・アジア向けCat-1",
      source: "https://www.simcom.com/product/A7672X.html",
    },
    {
      id: "a7672sa", name: "A7672SA", vendor: "SIMCom", category: "Cat-1",
      lte: [1, 2, 3, 4, 5, 7, 8, 28, 66],
      certifications: ["CE-RED", "RCM", "NCC", "FCC", "Anatel"],
      note: "中南米・豪州・アジア向けCat-1",
      source: "https://www.simcom.com/product/A7672X.html",
    },
    {
      id: "a7672g", name: "A7672G", vendor: "SIMCom", category: "Cat-1",
      lte: [1, 2, 3, 4, 5, 7, 8, 12, 13, 17, 18, 19, 20, 25, 26, 28, 66, 38, 39, 40, 41],
      certifications: ["CE-RED", "FCC", "Anatel", "UKCA"],
      note: "グローバル版Cat-1（取得済み認証は地域版より少なめ）",
      source: "https://www.simcom.com/product/A7672X.html",
    },
    {
      id: "lara6001", name: "LARA-R6001", vendor: "u-blox", category: "Cat-1",
      lte: [1, 2, 3, 4, 5, 7, 8, 12, 13, 18, 19, 20, 26, 28, 38, 39, 40, 41],
      certifications: ["GCF", "PTCRB", "CE", "UKCA", "FCC", "ISED", "NCC", "RCM", "GITEKI(技適)", "Anatel"],
      note: "グローバル版Cat-1（18バンド＋3G/2G）",
      source: "https://docs.sparkfun.com/SparkFun_LTE_Stick_LARA_R6/assets/component_documentation/LARA-R6-Datasheet.pdf",
    },
    {
      id: "lara6801", name: "LARA-R6801", vendor: "u-blox", category: "Cat-1",
      lte: [1, 2, 3, 4, 5, 7, 8, 18, 19, 20, 26, 28],
      certifications: ["GCF", "CE", "UKCA", "NCC", "RCM", "GITEKI(技適)", "NTTドコモ/ソフトバンク/KDDI（01B版）"],
      note: "EMEA/APAC/日本/中南米向け。TDDバンド非対応",
      source: "https://docs.sparkfun.com/SparkFun_LTE_Stick_LARA_R6/assets/component_documentation/LARA-R6-Datasheet.pdf",
    },
    {
      id: "bg95m3", name: "BG95-M3", vendor: "Quectel", category: "LTE-M/NB-IoT",
      ltem: [1, 2, 3, 4, 5, 8, 12, 13, 18, 19, 20, 25, 26, 27, 28, 66, 85],
      nbiot: [1, 2, 3, 4, 5, 8, 12, 13, 18, 19, 20, 25, 28, 66, 71, 85],
      certifications: ["GCF", "CE", "PTCRB", "FCC", "UKCA", "IC", "Anatel", "IFETEL", "JATE/TELEC", "RCM", "CCC", "NCC"],
      note: "Cat-M1/NB2＋EGPRS。LGA 23.6×19.9mm（EG91/EG95とピン互換とメーカー記載）",
      source: "https://developer.quectel.com/en/wp-content/uploads/sites/2/2024/11/Quectel_BG95_Series_LPWA_Specification_V2.0.pdf",
    },
    {
      id: "me310g1ww", name: "ME310G1-WW", vendor: "Telit Cinterion", category: "LTE-M/NB-IoT",
      ltem: [1, 2, 3, 4, 5, 8, 12, 13, 14, 18, 19, 20, 25, 26, 27, 28, 66, 85],
      nbiot: [1, 2, 3, 4, 5, 8, 12, 13, 18, 19, 20, 25, 26, 28, 66, 85],
      certifications: ["GCF", "PTCRB", "RED", "FCC/IC", "RCM", "JATE/TELEC", "CCC", "SRRC", "NCC", "KC", "IMDA", "Anatel", "NTTドコモ", "KDDI", "SKT", "Telstra"],
      note: "NB-IoT側の対応バンドは要確認（製品ページはLTEバンドとして一括表記）",
      source: "https://www.telit.com/devices/me310g1/",
    },
    {
      id: "nrf9160", name: "nRF9160", vendor: "Nordic", category: "LTE-M/NB-IoT",
      ltem: [1, 2, 3, 4, 5, 8, 12, 13, 14, 17, 18, 19, 20, 25, 26, 28, 66],
      nbiot: [1, 2, 3, 4, 5, 8, 12, 13, 14, 17, 18, 19, 20, 25, 26, 28, 66],
      certifications: ["GCF", "PTCRB", "CE", "FCC", "他（Nordic認証ページ参照）"],
      note: "SiP（アプリMCU内蔵）。700–2200MHz",
      source: "https://www.nordicsemi.com/Products/nRF9160",
    },
    {
      id: "nrf9151", name: "nRF9151", vendor: "Nordic", category: "LTE-M/NB-IoT",
      ltem: [1, 2, 3, 4, 5, 8, 12, 13, 17, 18, 19, 20, 25, 26, 28, 65, 66, 85],
      nbiot: [1, 2, 3, 4, 5, 8, 12, 13, 17, 18, 19, 20, 25, 26, 28, 65, 66, 85],
      certifications: ["要確認（Nordic認証ページ参照）"],
      note: "nRF9160の後継。DECT NR+にも対応",
      source: "https://www.nordicsemi.com/Products/nRF9151",
    },
    {
      id: "rm520ngl", name: "RM520N-GL", vendor: "Quectel", category: "5G (LTEフォールバック)",
      lte: [1, 2, 3, 4, 5, 7, 8, 12, 13, 14, 17, 18, 19, 20, 25, 26, 28, 29, 30, 32, 66, 71, 34, 38, 39, 40, 41, 42, 43, 46, 48],
      certifications: ["GCF", "CE", "PTCRB", "FCC", "IC", "JATE/TELEC", "RCM"],
      note: "M.2 5G Sub-6。LTEはほぼ全バンド。高価・高消費電力（比較用）",
      source: "https://mc-technologies.com/wp-content/uploads/2023/11/Quectel_RM520N-GL_5G_Specification_V1.0.0_Preliminary_20210915.pdf",
    },
  ];

  // ---------- 判定ユーティリティ ----------
  // 上位集合バンド: キーのバンドは値のバンド対応端末でも（MFBI等により）使える可能性がある
  const SUPERSET = { 1: [65], 2: [25], 4: [66], 5: [26], 12: [85], 17: [12, 85], 18: [26], 19: [26], 38: [41] };

  function modBands(m, tech) {
    if (tech === "ltem") return m.ltem || [];
    if (tech === "nbiot") return m.nbiot || [];
    return m.lte || [];
  }
  function isIoT(m) { return !m.lte && (m.ltem || m.nbiot); }
  // "yes" | "alt"（上位集合バンドで代替可・要確認） | "no"
  function supports(list, b) {
    if (list.includes(b)) return "yes";
    if ((SUPERSET[b] || []).some((x) => list.includes(x))) return "alt";
    return "no";
  }
  function ops(country, includeSub) { return country.operators.filter((o) => includeSub || o.main !== false); }

  // モジュール × 国の判定
  function evaluate(m, country, opt) {
    opt = opt || {};
    const iot = isIoT(m);
    let list = modBands(m, "lte"), tech = "LTE";
    let targets = ops(country, opt.includeSub);
    let unknown = [];
    if (iot) {
      const lm = m.ltem || [], nb = m.nbiot || [];
      list = Array.from(new Set(lm.concat(nb)));
      tech = lm.length && nb.length ? "LTE-M/NB-IoT" : lm.length ? "LTE-M" : "NB-IoT";
      unknown = targets.filter((o) => !((lm.length && o.ltem === true) || (nb.length && o.nbiot === true)) && ((lm.length && o.ltem === null) || (nb.length && o.nbiot === null))).map((o) => o.name);
      targets = targets.filter((o) => (lm.length && o.ltem === true) || (nb.length && o.nbiot === true));
    }
    const res = { module: m, country, tech, iot, unknown, operators: [], covered: [], alt: [], missing: [], coverage: 0, verdict: "×" };
    if (!targets.length) { res.reason = iot ? "LTE-M/NB-IoTの商用網が確認できない" : "対象事業者なし"; return res; }
    const need = new Set();
    targets.forEach((o) => {
      // IoT: LTE-M/NB-IoTは主にカバレッジ用バンド(core)で運用されるとみなす（近似）
      const bl = iot ? (o.iot || o.core) : o.lte;
      bl.forEach((b) => need.add(b));
      const st = bl.map((b) => supports(list, b));
      const coreSt = o.core.map((b) => supports(list, b));
      res.operators.push({
        name: o.name, bands: bl,
        all: st.every((s) => s !== "no"),
        core: coreSt.every((s) => s !== "no"),
        any: st.some((s) => s !== "no"),
        missing: bl.filter((b, i) => st[i] === "no"),
      });
    });
    const needArr = Array.from(need).sort((a, b) => a - b);
    needArr.forEach((b) => { const s = supports(list, b); (s === "yes" ? res.covered : s === "alt" ? res.alt : res.missing).push(b); });
    res.need = needArr;
    res.coverage = needArr.length ? (res.covered.length + res.alt.length) / needArr.length : 0;
    const O = res.operators;
    if (O.every((o) => o.all)) res.verdict = "◎";
    else if (O.every((o) => o.core)) res.verdict = "○";
    else if (O.some((o) => o.any)) res.verdict = "△";
    else res.verdict = "×";
    return res;
  }

  const VERDICT = {
    "◎": { label: "全主要バンド対応", cls: "ok", rank: 3 },
    "○": { label: "主要バンドのみ", cls: "accent", rank: 2 },
    "△": { label: "一部の事業者・バンドのみ", cls: "warn", rank: 1 },
    "×": { label: "非対応", cls: "bad", rank: 0 },
  };

  // 周波数（MHz）: バンドの下りの中心・範囲を数値で
  function range(b, which) {
    const d = bands[b]; if (!d) return null;
    const s = (which === "ul" ? d.ul : d.dl);
    const m = /([\d.]+)\s*[–-]\s*([\d.]+)/.exec(s || "");
    return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
  }

  // モジュールの認証一覧に、その国の制度名が含まれるか（目安）
  const CERT_KEYS = {
    JP: ["JATE", "TELEC", "技適", "GITEKI"], CN: ["CCC", "SRRC"], KR: ["KC"], TW: ["NCC"], SG: ["IMDA"],
    AU: ["RCM"], US: ["FCC", "PTCRB"], DE: ["CE", "RED"], HK: ["HKCA", "OFCA"], TH: ["NBTC"], VN: ["MIC"],
    ID: ["SDPPI"], MY: ["SIRIM"], PH: ["NTC"], IN: ["TEC", "MTCTE", "WPC"],
  };
  function certListed(m, code) {
    const keys = CERT_KEYS[code] || [];
    return (m.certifications || []).some((c) => keys.some((k) => c.indexOf(k) >= 0));
  }

  window.LTE_BANDS = {
    bands, countries, modules, updated: "2026-09",
    util: { evaluate, supports, isIoT, modBands, ops, range, certListed, SUPERSET, VERDICT, CERT_KEYS },
  };
})();
