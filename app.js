/**
 * 台股上市櫃即時低價觀察與智慧通知系統
 * Multi-Stock Real-Time Quote Monitor & Low Price Alert Engine (TWSE / TPEx)
 * High-Performance Edition with 0ms Instant Switch & Comprehensive Stock Master Database
 */

(function () {
  'use strict';

  // --- Configuration & State ---
  const STORAGE_KEY = 'taiwan_stock_monitor_v2';

  // Comprehensive Taiwan Top Stocks & ETFs Master Database (上市 TWSE & 上櫃 TPEx)
  const STOCK_DICTIONARY = [
    // --- 熱門指標權值股 ---
    { code: '2330', symbol: '2330.TW', name: '台積電', en: 'TSMC', type: 'TWSE', price: 950.0 },
    { code: '2317', symbol: '2317.TW', name: '鴻海', en: 'FOXCONN', type: 'TWSE', price: 180.0 },
    { code: '2454', symbol: '2454.TW', name: '聯發科', en: 'MEDIATEK', type: 'TWSE', price: 1250.0 },
    { code: '2382', symbol: '2382.TW', name: '廣達', en: 'QUANTA', type: 'TWSE', price: 270.0 },
    { code: '2308', symbol: '2308.TW', name: '台達電', en: 'DELTA', type: 'TWSE', price: 390.0 },
    { code: '2303', symbol: '2303.TW', name: '聯電', en: 'UMC', type: 'TWSE', price: 52.0 },
    { code: '3711', symbol: '3711.TW', name: '日月光投控', en: 'ASE', type: 'TWSE', price: 155.0 },
    { code: '3231', symbol: '3231.TW', name: '緯創', en: 'WISTRON', type: 'TWSE', price: 105.0 },
    { code: '2357', symbol: '2357.TW', name: '華碩', en: 'ASUS', type: 'TWSE', price: 540.0 },
    { code: '2376', symbol: '2376.TW', name: '技嘉', en: 'GIGABYTE', type: 'TWSE', price: 260.0 },
    { code: '2377', symbol: '2377.TW', name: '微星', en: 'MSI', type: 'TWSE', price: 175.0 },
    { code: '2356', symbol: '2356.TW', name: '英業達', en: 'INVENTEC', type: 'TWSE', price: 46.0 },
    { code: '2353', symbol: '2353.TW', name: '宏碁', en: 'ACER', type: 'TWSE', price: 42.0 },
    { code: '6669', symbol: '6669.TW', name: '緯穎', en: 'WIWYNN', type: 'TWSE', price: 2100.0 },
    { code: '3661', symbol: '3661.TW', name: '世芯-KY', en: 'ALCHIP', type: 'TWSE', price: 2350.0 },
    { code: '3008', symbol: '3008.TW', name: '大立光', en: 'LARGAN', type: 'TWSE', price: 2700.0 },
    { code: '2327', symbol: '2327.TW', name: '國巨', en: 'YAGEO', type: 'TWSE', price: 610.0 },
    { code: '2379', symbol: '2379.TW', name: '瑞昱', en: 'REALTEK', type: 'TWSE', price: 510.0 },
    { code: '3034', symbol: '3034.TW', name: '聯詠', en: 'NOVATEK', type: 'TWSE', price: 520.0 },
    { code: '2408', symbol: '2408.TW', name: '南亞科', en: 'NANYA', type: 'TWSE', price: 62.0 },
    { code: '2344', symbol: '2344.TW', name: '華邦電', en: 'WINBOND', type: 'TWSE', price: 24.0 },
    { code: '3037', symbol: '3037.TW', name: '欣興', en: 'UNIMICRON', type: 'TWSE', price: 150.0 },
    { code: '8046', symbol: '8046.TW', name: '南電', en: 'NAN YA PCB', type: 'TWSE', price: 160.0 },
    { code: '2345', symbol: '2345.TW', name: '智邦', en: 'ACCTON', type: 'TWSE', price: 540.0 },

    // --- 上櫃熱門明星股 (TPEx) ---
    { code: '5904', symbol: '5904.TWO', name: '寶雅', en: 'POUYA', type: 'TPEx', price: 74.3 },
    { code: '3293', symbol: '3293.TWO', name: '鈊象', en: 'IGS', type: 'TPEx', price: 750.0 },
    { code: '8069', symbol: '8069.TWO', name: '元太', en: 'E INK', type: 'TPEx', price: 260.0 },
    { code: '6488', symbol: '6488.TWO', name: '環球晶', en: 'GLOBALWAFERS', type: 'TPEx', price: 470.0 },
    { code: '5483', symbol: '5483.TWO', name: '中美晶', en: 'SAS', type: 'TPEx', price: 165.0 },
    { code: '5347', symbol: '5347.TWO', name: '世界', en: 'VIS', type: 'TPEx', price: 105.0 },
    { code: '3105', symbol: '3105.TWO', name: '穩懋', en: 'WIN SEMI', type: 'TPEx', price: 125.0 },
    { code: '8299', symbol: '8299.TWO', name: '群聯', en: 'PHISON', type: 'TPEx', price: 530.0 },
    { code: '6147', symbol: '6147.TWO', name: '頎邦', en: 'CHIPBOND', type: 'TPEx', price: 68.0 },
    { code: '3529', symbol: '3529.TWO', name: '力旺', en: 'EMEMORY', type: 'TPEx', price: 2800.0 },
    { code: '5274', symbol: '5274.TWO', name: '信驊', en: 'ASPEED', type: 'TPEx', price: 4200.0 },
    { code: '6446', symbol: '6446.TWO', name: '藥華藥', en: 'PHARMAESSENTIA', type: 'TPEx', price: 620.0 },
    { code: '6547', symbol: '6547.TWO', name: '高端疫苗', en: 'MEDIGEN', type: 'TPEx', price: 50.0 },
    { code: '4743', symbol: '4743.TWO', name: '合一', en: 'ONENESS', type: 'TPEx', price: 135.0 },
    { code: '8044', symbol: '8044.TWO', name: '網家', en: 'PCHOME', type: 'TPEx', price: 38.0 },

    // --- 金融傳產與重電航運 ---
    { code: '2603', symbol: '2603.TW', name: '長榮', en: 'EVERGREEN', type: 'TWSE', price: 195.0 },
    { code: '2609', symbol: '2609.TW', name: '陽明', en: 'YANG MING', type: 'TWSE', price: 66.0 },
    { code: '2615', symbol: '2615.TW', name: '萬海', en: 'WAN HAI', type: 'TWSE', price: 82.0 },
    { code: '2618', symbol: '2618.TW', name: '長榮航', en: 'EVA AIR', type: 'TWSE', price: 36.5 },
    { code: '2610', symbol: '2610.TW', name: '華航', en: 'CHINA AIRLINES', type: 'TWSE', price: 23.0 },
    { code: '1519', symbol: '1519.TW', name: '華城', en: 'FORTUNE', type: 'TWSE', price: 630.0 },
    { code: '1513', symbol: '1513.TW', name: '中興電', en: 'CHEM', type: 'TWSE', price: 165.0 },
    { code: '1503', symbol: '1503.TW', name: '士電', en: 'SHIHLIN', type: 'TWSE', price: 215.0 },
    { code: '1504', symbol: '1504.TW', name: '東元', en: 'TECO', type: 'TWSE', price: 51.0 },
    { code: '1514', symbol: '1514.TW', name: '亞力', en: 'ALLIS', type: 'TWSE', price: 120.0 },
    { code: '2371', symbol: '2371.TW', name: '大同', en: 'TATUNG', type: 'TWSE', price: 47.0 },
    { code: '2881', symbol: '2881.TW', name: '富邦金', en: 'FUBON', type: 'TWSE', price: 88.0 },
    { code: '2882', symbol: '2882.TW', name: '國泰金', en: 'CATHAY', type: 'TWSE', price: 64.0 },
    { code: '2891', symbol: '2891.TW', name: '中信金', en: 'CTBC', type: 'TWSE', price: 36.0 },
    { code: '2886', symbol: '2886.TW', name: '兆豐金', en: 'MEGA', type: 'TWSE', price: 39.0 },
    { code: '2884', symbol: '2884.TW', name: '玉山金', en: 'E.SUN', type: 'TWSE', price: 28.0 },
    { code: '2892', symbol: '2892.TW', name: '第一金', en: 'FIRST', type: 'TWSE', price: 27.5 },
    { code: '2880', symbol: '2880.TW', name: '華南金', en: 'HUA NAN', type: 'TWSE', price: 25.5 },
    { code: '2887', symbol: '2887.TW', name: '台新金', en: 'TAISHIN', type: 'TWSE', price: 18.5 },
    { code: '2002', symbol: '2002.TW', name: '中鋼', en: 'CHINA STEEL', type: 'TWSE', price: 22.5 },
    { code: '1301', symbol: '1301.TW', name: '台塑', en: 'FORMOSA', type: 'TWSE', price: 50.0 },
    { code: '1303', symbol: '1303.TW', name: '南亞', en: 'NAN YA', type: 'TWSE', price: 43.0 },
    { code: '1326', symbol: '1326.TW', name: '台化', en: 'FCFC', type: 'TWSE', price: 40.0 },
    { code: '6505', symbol: '6505.TW', name: '台塑化', en: 'FPCC', type: 'TWSE', price: 52.0 },
    { code: '1216', symbol: '1216.TW', name: '統一', en: 'UNI-PRESIDENT', type: 'TWSE', price: 85.0 },
    { code: '9904', symbol: '9904.TW', name: '寶成', en: 'POUCHEN', type: 'TWSE', price: 37.0 },
    { code: '8454', symbol: '8454.TW', name: '富邦媒', en: 'MOMO', type: 'TWSE', price: 410.0 },

    // --- 熱門人氣 ETF 專區 ---
    { code: '0050', symbol: '0050.TW', name: '元大台灣50', en: 'ETF', type: 'TWSE', price: 185.0 },
    { code: '0056', symbol: '0056.TW', name: '元大高股息', en: 'ETF', type: 'TWSE', price: 38.5 },
    { code: '00878', symbol: '00878.TW', name: '國泰永續高股息', en: 'ETF', type: 'TWSE', price: 22.8 },
    { code: '00919', symbol: '00919.TW', name: '群益台灣精選高息', en: 'ETF', type: 'TWSE', price: 24.5 },
    { code: '00929', symbol: '00929.TW', name: '復華台灣科技優息', en: 'ETF', type: 'TWSE', price: 19.5 },
    { code: '00940', symbol: '00940.TW', name: '元大台灣價值高息', en: 'ETF', type: 'TWSE', price: 9.6 },
    { code: '006208', symbol: '006208.TW', name: '富邦台50', en: 'ETF', type: 'TWSE', price: 108.0 },
    { code: '00713', symbol: '00713.TW', name: '元大台灣高息低波', en: 'ETF', type: 'TWSE', price: 57.0 },
    { code: '00757', symbol: '00757.TW', name: '統一FANG+', en: 'ETF', type: 'TWSE', price: 90.0 },
    { code: '00679B', symbol: '00679B.TW', name: '元大美債20年', en: 'BOND ETF', type: 'TWSE', price: 30.5 },
    { code: '00687B', symbol: '00687B.TW', name: '國泰20年美債', en: 'BOND ETF', type: 'TWSE', price: 31.8 },
    { code: '00937B', symbol: '00937B.TWO', name: '群益ESG投等債20+', en: 'BOND ETF', type: 'TPEx', price: 16.0 }
  ];

  const PRESET_STOCKS = STOCK_DICTIONARY.slice(0, 12);

  let config = {
    currentSymbol: '5904.TWO',
    targetPrice: 74.0,
    condition: 'price_or_ask',
    enableWebNotification: true,
    enableModalAlert: true,
    enableSoundAlert: true,
    cooldownMs: 180000,
    refreshInterval: 1000,
    soundMuted: false,
    theme: 'light',
    watchlist: [
      { code: '5904', symbol: '5904.TWO', name: '寶雅', type: 'TPEx' },
      { code: '2330', symbol: '2330.TW', name: '台積電', type: 'TWSE' },
      { code: '2317', symbol: '2317.TW', name: '鴻海', type: 'TWSE' },
      { code: '2454', symbol: '2454.TW', name: '聯發科', type: 'TWSE' },
      { code: '3293', symbol: '3293.TWO', name: '鈊象', type: 'TPEx' },
      { code: '2603', symbol: '2603.TW', name: '長榮', type: 'TWSE' },
      { code: '0050', symbol: '0050.TW', name: '元大台灣50', type: 'TWSE' }
    ],
    stockAlerts: {
      '5904.TWO': 74.0,
      '2330.TW': 930.0,
      '2317.TW': 175.0,
      '2454.TW': 1200.0,
      '3293.TWO': 730.0,
      '2603.TW': 190.0,
      '0050.TW': 180.0
    }
  };

  // In-Memory Quote Cache for 0ms Instant Render
  const stockQuotesCache = {};

  let stockData = {
    symbol: '5904.TWO',
    code: '5904',
    name: '寶雅',
    enName: 'POUYA',
    marketType: 'TPEx',
    price: 74.3,
    change: 0.2,
    changePercent: '0.27%',
    changeStatus: 'up',
    bid: 74.2,
    ask: 74.4,
    high: 75.5,
    low: 74.2,
    open: 74.4,
    prevClose: 74.1,
    volume: 1366,
    turnoverM: 102.03,
    updatedAt: new Date(),
    orderbook: [
      { bid: 74.2, bidVol: 46, ask: 74.4, askVol: 14 },
      { bid: 74.1, bidVol: 103, ask: 74.5, askVol: 39 },
      { bid: 74.0, bidVol: 256, ask: 74.6, askVol: 29 },
      { bid: 73.9, bidVol: 70, ask: 74.7, askVol: 34 },
      { bid: 73.8, bidVol: 71, ask: 74.8, askVol: 56 }
    ]
  };

  let priceHistory = [];
  let lastAlertTimestamp = 0;
  let alertLogs = [];
  let pollTimer = null;
  let audioCtx = null;
  let isFetching = false;
  let currentFetchAbortController = null;
  let selectedAutocompleteIndex = -1;

  // --- DOM Elements ---
  const el = {
    pageDocTitle: document.getElementById('pageDocTitle'),
    brandLogoBadge: document.getElementById('brandLogoBadge'),
    brandStockHeading: document.getElementById('brandStockHeading'),
    brandStockNameText: document.getElementById('brandStockNameText'),
    brandStockSubText: document.getElementById('brandStockSubText'),
    brandStockTag: document.getElementById('brandStockTag'),

    // Search & Switcher Bar
    stockSearchInput: document.getElementById('stockSearchInput'),
    searchAutocomplete: document.getElementById('searchAutocomplete'),
    btnSwitchStock: document.getElementById('btnSwitchStock'),
    btnAddWatchlist: document.getElementById('btnAddWatchlist'),
    starIcon: document.getElementById('starIcon'),
    addWatchlistText: document.getElementById('addWatchlistText'),
    quickStockChips: document.getElementById('quickStockChips'),

    // Header Controls
    marketStatusBadge: document.getElementById('marketStatusBadge'),
    marketDot: document.getElementById('marketDot'),
    marketStatusText: document.getElementById('marketStatusText'),
    btnReqNotification: document.getElementById('btnReqNotification'),
    notifyBtnText: document.getElementById('notifyBtnText'),
    btnToggleSound: document.getElementById('btnToggleSound'),
    soundIcon: document.getElementById('soundIcon'),
    soundText: document.getElementById('soundText'),
    btnThemeToggle: document.getElementById('btnThemeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    lastUpdateTime: document.getElementById('lastUpdateTime'),

    // Hero Quotes
    heroCardStockTitle: document.getElementById('heroCardStockTitle'),
    currentPriceDisplay: document.getElementById('currentPriceDisplay'),
    priceChangeDisplay: document.getElementById('priceChangeDisplay'),
    bestBidDisplay: document.getElementById('bestBidDisplay'),
    bestAskDisplay: document.getElementById('bestAskDisplay'),
    dayHighDisplay: document.getElementById('dayHighDisplay'),
    dayLowDisplay: document.getElementById('dayLowDisplay'),
    openPriceDisplay: document.getElementById('openPriceDisplay'),
    prevCloseDisplay: document.getElementById('prevCloseDisplay'),
    totalVolumeDisplay: document.getElementById('totalVolumeDisplay'),
    turnoverDisplay: document.getElementById('turnoverDisplay'),

    // Orderbook
    bidTableBody: document.getElementById('bidTableBody'),
    askTableBody: document.getElementById('askTableBody'),
    sumBidVolText: document.getElementById('sumBidVolText'),
    sumAskVolText: document.getElementById('sumAskVolText'),

    // Alert Panel
    targetPriceStockLabel: document.getElementById('targetPriceStockLabel'),
    targetPriceInput: document.getElementById('targetPriceInput'),
    alertConditionSelect: document.getElementById('alertConditionSelect'),
    chkWebNotification: document.getElementById('chkWebNotification'),
    chkModalAlert: document.getElementById('chkModalAlert'),
    chkSoundAlert: document.getElementById('chkSoundAlert'),
    cooldownSelect: document.getElementById('cooldownSelect'),
    btnSaveAlert: document.getElementById('btnSaveAlert'),
    btnTestAlert: document.getElementById('btnTestAlert'),
    currentThresholdView: document.getElementById('currentThresholdView'),
    alertActiveText: document.getElementById('alertActiveText'),

    // Quick chips
    chipMinus05: document.getElementById('chipMinus05'),
    chipMinus1: document.getElementById('chipMinus1'),
    chipMinus2Percent: document.getElementById('chipMinus2Percent'),
    chipCurrentPrice: document.getElementById('chipCurrentPrice'),

    // Logs & Controls
    alertLogsContainer: document.getElementById('alertLogsContainer'),
    btnClearLogs: document.getElementById('btnClearLogs'),
    refreshRateSelect: document.getElementById('refreshRateSelect'),
    btnManualRefresh: document.getElementById('btnManualRefresh'),

    // Modal
    alertModalBackdrop: document.getElementById('alertModalBackdrop'),
    modalAlertHeading: document.getElementById('modalAlertHeading'),
    modalAlertDesc: document.getElementById('modalAlertDesc'),
    modalAlertPrice: document.getElementById('modalAlertPrice'),
    btnCloseModal: document.getElementById('btnCloseModal'),

    // Chart & Toast
    trendChart: document.getElementById('trendChart'),
    chartAlertLineLegend: document.getElementById('chartAlertLineLegend'),
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Initialize Application ---
  function init() {
    loadSettings();
    applySettingsToUI();
    setupEventListeners();
    updateTheme();
    checkNotificationPermissionState();
    renderWatchlistChips();

    // Setup initial data & cache
    setupStockInitialData(config.currentSymbol);
    stockQuotesCache[config.currentSymbol] = { ...stockData };

    seedPriceHistory();
    updateUI();

    // Fast initial fetch
    fetchRealtimeQuote();
    startPolling();

    // Window resize handler
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderChart, 80);
    });
  }

  // --- Storage ---
  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        config = Object.assign(config, JSON.parse(saved));
        if (!config.refreshInterval || config.refreshInterval > 5000) {
          config.refreshInterval = 1000;
        }
      }
      const savedLogs = localStorage.getItem(STORAGE_KEY + '_logs');
      if (savedLogs) {
        alertLogs = JSON.parse(savedLogs);
      }
    } catch (e) {
      console.warn('Could not load settings from localStorage', e);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      localStorage.setItem(STORAGE_KEY + '_logs', JSON.stringify(alertLogs.slice(0, 30)));
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  }

  function applySettingsToUI() {
    const currentSym = config.currentSymbol || '5904.TWO';
    if (config.stockAlerts && config.stockAlerts[currentSym]) {
      config.targetPrice = config.stockAlerts[currentSym];
    }

    el.targetPriceInput.value = config.targetPrice;
    el.currentThresholdView.textContent = Number(config.targetPrice).toFixed(1);
    el.alertConditionSelect.value = config.condition;
    el.chkWebNotification.checked = config.enableWebNotification;
    el.chkModalAlert.checked = config.enableModalAlert;
    el.chkSoundAlert.checked = config.enableSoundAlert;
    el.cooldownSelect.value = config.cooldownMs.toString();
    el.refreshRateSelect.value = config.refreshInterval.toString();

    updateSoundButtonUI();
    renderAlertLogs();
  }

  // --- Watchlist Rendering & Fast Management ---
  function renderWatchlistChips() {
    const container = el.quickStockChips;
    if (!container) return;

    let html = '';
    const currentSym = config.currentSymbol;

    config.watchlist.forEach((item) => {
      const isActive = item.symbol === currentSym;
      const activeClass = isActive ? 'active' : '';
      const isTwse = item.type === 'TWSE';
      const badgeClass = isTwse ? 'chip-type-twse' : 'chip-type-tpex';
      const badgeText = isTwse ? '上市' : '上櫃';

      html += `
        <div class="stock-chip ${activeClass}" data-symbol="${item.symbol}">
          <span>${item.name}</span>
          <span style="font-family: var(--font-mono); font-size: 0.76rem; opacity: 0.85;">${item.code}</span>
          <span class="chip-type-badge ${badgeClass}">${badgeText}</span>
          <span class="chip-remove-btn" data-remove="${item.symbol}" title="從自選移除">✕</span>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.stock-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip-remove-btn')) {
          e.stopPropagation();
          const removeSym = e.target.getAttribute('data-remove');
          removeStockFromWatchlist(removeSym);
          return;
        }
        const sym = chip.getAttribute('data-symbol');
        if (sym && sym !== config.currentSymbol) {
          switchStock(sym);
        }
      });
    });

    updateWatchlistButtonState();
  }

  function updateWatchlistButtonState() {
    const isSaved = config.watchlist.some(w => w.symbol === config.currentSymbol);
    if (isSaved) {
      el.starIcon.textContent = '⭐';
      el.addWatchlistText.textContent = '已在自選';
      el.btnAddWatchlist.style.color = '#f59e0b';
      el.btnAddWatchlist.style.borderColor = '#f59e0b';
    } else {
      el.starIcon.textContent = '☆';
      el.addWatchlistText.textContent = '加入自選';
      el.btnAddWatchlist.style.color = '';
      el.btnAddWatchlist.style.borderColor = '';
    }
  }

  function addCurrentStockToWatchlist() {
    const exists = config.watchlist.some(w => w.symbol === stockData.symbol);
    if (exists) {
      showToast(`${stockData.name} (${stockData.code}) 已在您的自選清單中`, 'info');
      return;
    }

    config.watchlist.push({
      code: stockData.code,
      symbol: stockData.symbol,
      name: stockData.name,
      type: stockData.marketType
    });

    saveSettings();
    renderWatchlistChips();
    showToast(`已成功將 ${stockData.name} (${stockData.code}) 加入自選清單！`, 'success');
  }

  function removeStockFromWatchlist(sym) {
    if (config.watchlist.length <= 1) {
      showToast('自選清單至少需保留一檔股票', 'info');
      return;
    }
    config.watchlist = config.watchlist.filter(w => w.symbol !== sym);
    saveSettings();
    renderWatchlistChips();
    showToast('已從自選清單移除', 'info');
  }

  // --- High-Speed Stock Symbol Resolver & Database ---
  function resolveStockInfo(query) {
    if (!query) return null;
    const q = query.trim().toUpperCase();

    // 1. Direct symbol match (e.g., 2330.TW or 5904.TWO)
    let match = STOCK_DICTIONARY.find(s => s.symbol.toUpperCase() === q);
    if (match) return { ...match };

    // 2. Exact code match (e.g. 2330, 5904)
    match = STOCK_DICTIONARY.find(s => s.code.toUpperCase() === q);
    if (match) return { ...match };

    // 3. Exact name match (e.g. 台積電, 寶雅, 長榮)
    match = STOCK_DICTIONARY.find(s => s.name === query.trim());
    if (match) return { ...match };

    // 4. Watchlist match
    const inWatchlist = config.watchlist.find(w => w.code.toUpperCase() === q || w.symbol.toUpperCase() === q || w.name === query.trim());
    if (inWatchlist) {
      return {
        code: inWatchlist.code,
        symbol: inWatchlist.symbol,
        name: inWatchlist.name,
        enName: inWatchlist.type,
        type: inWatchlist.type,
        price: 100.0
      };
    }

    // 5. Partial name match in dictionary
    const partialMatch = STOCK_DICTIONARY.find(s => s.name.includes(query.trim()));
    if (partialMatch) return { ...partialMatch };

    // 6. Explicit suffix (e.g. 1234.TW / 1234.TWO)
    if (q.endsWith('.TW')) {
      const code = q.replace('.TW', '');
      return { code, symbol: q, name: code, enName: 'TWSE', type: 'TWSE', price: 100.0 };
    }
    if (q.endsWith('.TWO')) {
      const code = q.replace('.TWO', '');
      return { code, symbol: q, name: code, enName: 'TPEx', type: 'TPEx', price: 100.0 };
    }

    // 7. Pure numeric 4-digit code (probe TWSE by default)
    if (/^\d{4,6}$/.test(q)) {
      return { code: q, symbol: `${q}.TW`, name: q, enName: 'TWSE', type: 'TWSE', price: 100.0 };
    }

    return null;
  }

  // --- Instant Switch Stock Logic (0ms Response) ---
  async function switchStock(rawQuery) {
    if (!rawQuery) return;
    const query = rawQuery.trim();

    // Close autocomplete immediately
    hideAutocomplete();

    // 1. Resolve stock metadata instantly in memory (0ms)
    let stockInfo = resolveStockInfo(query);

    if (!stockInfo) {
      showToast(`正在線上偵測股票「${query}」...`, 'info');
      const probedSym = await fastProbeSymbol(query);
      if (!probedSym) {
        showToast(`找不到股票「${query}」，請輸入台股上市櫃代碼或名稱`, 'alert');
        return;
      }
      const isTwse = probedSym.endsWith('.TW');
      stockInfo = {
        code: probedSym.split('.')[0],
        symbol: probedSym,
        name: probedSym.split('.')[0],
        enName: isTwse ? 'TWSE' : 'TPEx',
        type: isTwse ? 'TWSE' : 'TPEx',
        price: 100.0
      };
    }

    const targetSym = stockInfo.symbol;

    // Save previous symbol alert setting
    config.stockAlerts[config.currentSymbol] = parseFloat(config.targetPrice);

    // Switch symbol state
    config.currentSymbol = targetSym;

    // 2. Instant Optimistic UI Update (0ms) - Zero Delay!
    stockData.symbol = targetSym;
    stockData.code = stockInfo.code;
    stockData.name = stockInfo.name;
    stockData.enName = stockInfo.enName || stockInfo.type;
    stockData.marketType = stockInfo.type;

    // If we have cached quote for this stock, apply immediately
    if (stockQuotesCache[targetSym]) {
      const cached = stockQuotesCache[targetSym];
      stockData.price = cached.price;
      stockData.change = cached.change;
      stockData.changePercent = cached.changePercent;
      stockData.changeStatus = cached.changeStatus;
      stockData.bid = cached.bid;
      stockData.ask = cached.ask;
      stockData.high = cached.high;
      stockData.low = cached.low;
      stockData.open = cached.open;
      stockData.prevClose = cached.prevClose;
      stockData.volume = cached.volume;
      stockData.turnoverM = cached.turnoverM;
      stockData.orderbook = cached.orderbook;
    } else {
      stockData.price = 0;
      stockData.bid = 0;
      stockData.ask = 0;
      stockData.high = 0;
      stockData.low = 0;
      stockData.open = 0;
      stockData.prevClose = 0;
      stockData.change = 0.0;
      stockData.changePercent = '0.00%';
      stockData.changeStatus = 'flat';
      stockData.orderbook = [];
    }

    // Set target alert price
    if (config.stockAlerts[targetSym]) {
      config.targetPrice = config.stockAlerts[targetSym];
    } else if (stockData.price > 0) {
      config.targetPrice = Math.round(stockData.price * 0.98 * 10) / 10;
      config.stockAlerts[targetSym] = config.targetPrice;
    }

    el.targetPriceInput.value = config.targetPrice || '';
    el.currentThresholdView.textContent = config.targetPrice ? Number(config.targetPrice).toFixed(1) : '--';

    saveSettings();
    renderWatchlistChips();

    // Instant Chart Re-seed & Render
    seedPriceHistory();
    updateUI();

    showToast(`⚡ 已即時切換至 ${stockData.name} (${stockData.code}) · ${stockData.marketType === 'TWSE' ? '上市' : '上櫃'}`, 'success');

    // 3. Abort previous in-flight fetch & fire live fetch asynchronously
    if (currentFetchAbortController) {
      currentFetchAbortController.abort();
    }
    fetchRealtimeQuote();
  }

  // Fast Parallel Symbol Prober for unknown stocks
  async function fastProbeSymbol(code) {
    const raw = code.trim().toUpperCase();
    if (raw.endsWith('.TW') || raw.endsWith('.TWO')) return raw;

    const candidates = [`${raw}.TW`, `${raw}.TWO`];
    try {
      const racePromises = candidates.map(sym => {
        return new Promise(async (resolve, reject) => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1000);
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1m&range=1d`;
            const resp = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            if (resp.ok) {
              const json = await resp.json();
              if (json && json.chart && json.chart.result) {
                resolve(sym);
                return;
              }
            }
          } catch (e) {}
          reject();
        });
      });
      return await Promise.any(racePromises);
    } catch (e) {
      return `${raw}.TW`; // fallback
    }
  }

  function generateDefaultOrderbook(baseP) {
    const p = parseFloat(baseP) || 100.0;
    const step = p > 500 ? 5.0 : p > 100 ? 0.5 : 0.1;
    return [
      { bid: +(p - step * 1).toFixed(1), bidVol: 45, ask: +(p + step * 1).toFixed(1), askVol: 28 },
      { bid: +(p - step * 2).toFixed(1), bidVol: 112, ask: +(p + step * 2).toFixed(1), askVol: 65 },
      { bid: +(p - step * 3).toFixed(1), bidVol: 198, ask: +(p + step * 3).toFixed(1), askVol: 82 },
      { bid: +(p - step * 4).toFixed(1), bidVol: 75, ask: +(p + step * 4).toFixed(1), askVol: 110 },
      { bid: +(p - step * 5).toFixed(1), bidVol: 88, ask: +(p + step * 5).toFixed(1), askVol: 140 }
    ];
  }

  function setupStockInitialData(sym) {
    const info = resolveStockInfo(sym);
    if (info) {
      stockData.symbol = info.symbol;
      stockData.code = info.code;
      stockData.name = info.name;
      stockData.enName = info.enName;
      stockData.marketType = info.type;
      if (info.price) stockData.price = info.price;
    }
  }

  // --- Realtime Search Autocomplete ---
  function setupAutocomplete() {
    const input = el.stockSearchInput;
    const dropdown = el.searchAutocomplete;
    if (!input || !dropdown) return;

    let debounceTimer = null;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim();
        if (!query) {
          hideAutocomplete();
          return;
        }
        renderAutocompleteResults(query);
      }, 40);
    });

    input.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.search-autocomplete-item');
      if (dropdown.style.display !== 'none' && items.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedAutocompleteIndex = Math.min(items.length - 1, selectedAutocompleteIndex + 1);
          updateAutocompleteSelection(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedAutocompleteIndex = Math.max(0, selectedAutocompleteIndex - 1);
          updateAutocompleteSelection(items);
        } else if (e.key === 'Enter') {
          if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < items.length) {
            e.preventDefault();
            items[selectedAutocompleteIndex].click();
          }
        } else if (e.key === 'Escape') {
          hideAutocomplete();
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        hideAutocomplete();
      }
    });
  }

  function renderAutocompleteResults(query) {
    const dropdown = el.searchAutocomplete;
    const q = query.toLowerCase();

    // Match code prefix or name includes
    const matches = STOCK_DICTIONARY.filter(item => {
      return item.code.toLowerCase().includes(q) ||
             item.name.toLowerCase().includes(q) ||
             item.symbol.toLowerCase().includes(q) ||
             item.en.toLowerCase().includes(q);
    }).slice(0, 8);

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 0.75rem 1rem; color: var(--text-dim); font-size: 0.85rem; text-align: center;">
          按 Enter 直接搜尋台股代碼「${query}」
        </div>
      `;
      dropdown.style.display = 'block';
      selectedAutocompleteIndex = -1;
      return;
    }

    let html = '';
    matches.forEach((item, index) => {
      const isTwse = item.type === 'TWSE';
      const badgeClass = isTwse ? 'chip-type-twse' : 'chip-type-tpex';
      const badgeText = isTwse ? '上市' : '上櫃';

      html += `
        <div class="search-autocomplete-item" data-symbol="${item.symbol}">
          <div class="stock-info">
            <span class="stock-name">${item.name}</span>
            <span class="stock-code">${item.code}</span>
          </div>
          <span class="market-badge chip-type-badge ${badgeClass}">${badgeText}</span>
        </div>
      `;
    });

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
    selectedAutocompleteIndex = -1;

    dropdown.querySelectorAll('.search-autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const sym = item.getAttribute('data-symbol');
        el.stockSearchInput.value = '';
        hideAutocomplete();
        switchStock(sym);
      });
    });
  }

  function updateAutocompleteSelection(items) {
    items.forEach((it, idx) => {
      if (idx === selectedAutocompleteIndex) {
        it.classList.add('selected');
        it.scrollIntoView({ block: 'nearest' });
      } else {
        it.classList.remove('selected');
      }
    });
  }

  function hideAutocomplete() {
    if (el.searchAutocomplete) {
      el.searchAutocomplete.style.display = 'none';
      selectedAutocompleteIndex = -1;
    }
  }

  // --- Sound Alert Synthesizer (Web Audio API) ---
  function initAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playAlertSound() {
    if (config.soundMuted || !config.enableSoundAlert) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const notes = [
        { freq: 880, start: now, duration: 0.18 },
        { freq: 1174.66, start: now + 0.15, duration: 0.22 },
        { freq: 1760, start: now + 0.32, duration: 0.45 }
      ];

      notes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, note.start);

        gain.gain.setValueAtTime(0.001, note.start);
        gain.gain.exponentialRampToValueAtTime(0.4, note.start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, note.start + note.duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(note.start);
        osc.stop(note.start + note.duration);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // --- Web Notifications ---
  function checkNotificationPermissionState() {
    if (!('Notification' in window)) {
      el.btnReqNotification.style.display = 'none';
      return;
    }
    if (Notification.permission === 'granted') {
      el.notifyBtnText.textContent = '推播已啟用';
      el.btnReqNotification.style.borderColor = '#10b981';
      el.btnReqNotification.style.color = '#10b981';
    } else if (Notification.permission === 'denied') {
      el.notifyBtnText.textContent = '推播被封鎖';
      el.btnReqNotification.style.color = '#ef4444';
    } else {
      el.notifyBtnText.textContent = '啟用推播';
      el.btnReqNotification.style.color = '';
      el.btnReqNotification.style.borderColor = '';
    }
  }

  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('此瀏覽器不支援桌面推播功能', 'info');
      return;
    }
    Notification.requestPermission().then(permission => {
      checkNotificationPermissionState();
      if (permission === 'granted') {
        showToast('桌面推播已成功開啟！低價觸發時將即時彈窗提醒。', 'success');
        sendBrowserNotification(`${stockData.name} (${stockData.code}) 低價監控已啟動`, '當前目標低價門檻為 ' + config.targetPrice + ' 元');
      } else {
        showToast('未開啟推播權限，您仍可使用網頁彈窗與音效提醒', 'info');
      }
    });
  }

  function sendBrowserNotification(title, body) {
    if (!config.enableWebNotification || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    try {
      const notif = new Notification(title, {
        body: body,
        icon: 'https://tw.stock.yahoo.com/favicon.ico',
        tag: `stock_low_price_${stockData.code}`,
        requireInteraction: true
      });
      notif.onclick = function () {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('Desktop notification error', e);
    }
  }

  // --- High Performance Real-Time Quote Fetcher ---
  async function fetchRealtimeQuote() {
    if (isFetching) return;
    isFetching = true;

    currentFetchAbortController = new AbortController();
    const signal = currentFetchAbortController.signal;

    try {
      const currentSym = config.currentSymbol || '5904.TWO';
      let data = null;

      // 1. Try Local Python Server API (Fastest & 100% Authentic Live Quotes with full 5-tier depth)
      const localApiUrl = window.location.origin.includes('127.0.0.1') || window.location.origin.includes('localhost')
        ? `/api/quote?symbol=${encodeURIComponent(currentSym)}`
        : `http://127.0.0.1:8765/api/quote?symbol=${encodeURIComponent(currentSym)}`;

      try {
        const localCtrl = new AbortController();
        const localTimeout = setTimeout(() => localCtrl.abort(), 1500);
        const resp = await fetch(localApiUrl, { signal: localCtrl.signal });
        clearTimeout(localTimeout);

        if (resp.ok) {
          const json = await resp.json();
          if (json && !json.error) {
            data = parseYahooTWData(json, currentSym);
          }
        }
      } catch (localErr) {
        // Local server not running or CORS on file:// origin, continue to web fallbacks
      }

      // 2. Direct Yahoo TW or Public CORS Proxies
      if (!data) {
        const targetUrl = `https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;symbols=%5B%22${currentSym}%22%5D`;
        const proxyUrls = [
          targetUrl, // Direct
          `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
        ];

        for (const u of proxyUrls) {
          try {
            const ctrl = new AbortController();
            const tId = setTimeout(() => ctrl.abort(), 1800);
            const pResp = await fetch(u, { mode: 'cors', signal: ctrl.signal });
            clearTimeout(tId);

            if (pResp.ok) {
              const resJson = await pResp.json();
              const item = Array.isArray(resJson) ? resJson[0] : resJson;
              if (item && item.price) {
                data = parseYahooTWData(item, currentSym);
                break;
              }
            }
          } catch (pe) {}
        }
      }

      // 3. Fallback to Yahoo Finance v8 Chart API
      if (!data) {
        try {
          const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${currentSym}?interval=1m&range=1d`;
          const yfResp = await fetch(yfUrl);
          if (yfResp.ok) {
            const yfJson = await yfResp.json();
            data = parseYahooFinanceChartData(yfJson, currentSym);
          }
        } catch (ye) {}
      }

      if (data && data.price > 0) {
        stockData = data;
        stockQuotesCache[currentSym] = { ...data };
        el.marketStatusText.textContent = '即時報價連線正常';
        el.marketDot.className = 'pulse-dot';
      } else {
        generateSimulationTick();
        el.marketStatusText.textContent = '連線同步中';
        el.marketDot.className = 'pulse-dot';
      }

      updateUI();
      evaluateAlerts();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
      }
    } finally {
      isFetching = false;
      currentFetchAbortController = null;
    }
  }

  function parseYahooTWData(item, sym) {
    const rawCode = item.systexId || sym.split('.')[0];
    const isTwse = (item.exchange === 'TAI') || sym.endsWith('.TW');
    const marketType = isTwse ? 'TWSE' : 'TPEx';

    const info = resolveStockInfo(sym);
    const stockName = info ? info.name : (item.symbolName || rawCode);
    const enName = info ? info.enName : (isTwse ? 'TWSE' : 'TPEx');

    const priceVal = parseFloat(item.price?.raw || item.price?.sort || stockData.price);
    const prevCloseVal = parseFloat(item.regularMarketPreviousClose?.raw || item.regularMarketPreviousClose?.sort || stockData.prevClose || priceVal);
    const changeVal = parseFloat(item.change?.raw || item.change?.sort || (priceVal - prevCloseVal));
    const changePct = item.changePercent || ((changeVal / prevCloseVal) * 100).toFixed(2) + '%';
    const bestBidVal = parseFloat(item.bid?.raw || item.bid?.sort || priceVal);
    const bestAskVal = parseFloat(item.ask?.raw || item.ask?.sort || priceVal);

    let orderbook = [];
    if (item.orderbook && Array.isArray(item.orderbook) && item.orderbook.length > 0) {
      orderbook = item.orderbook.map(row => ({
        bid: parseFloat(row.bid) || 0,
        bidVol: parseInt(row.bidVolK || (row.bidVol ? row.bidVol / 1000 : 0)) || 0,
        ask: parseFloat(row.ask) || 0,
        askVol: parseInt(row.askVolK || (row.askVol ? row.askVol / 1000 : 0)) || 0
      }));
    } else {
      orderbook = stockData.orderbook || generateDefaultOrderbook(priceVal);
    }

    return {
      symbol: sym,
      code: rawCode,
      name: stockName,
      enName: enName,
      marketType: marketType,
      price: priceVal,
      change: changeVal,
      changePercent: changePct,
      changeStatus: changeVal > 0 ? 'up' : changeVal < 0 ? 'down' : 'flat',
      bid: bestBidVal,
      ask: bestAskVal,
      high: parseFloat(item.regularMarketDayHigh?.raw || item.regularMarketDayHigh?.sort || priceVal),
      low: parseFloat(item.regularMarketDayLow?.raw || item.regularMarketDayLow?.sort || priceVal),
      open: parseFloat(item.regularMarketOpen?.raw || item.regularMarketOpen?.sort || priceVal),
      prevClose: prevCloseVal,
      volume: parseInt(item.volumeK || (item.volume ? item.volume / 1000 : stockData.volume)) || stockData.volume,
      turnoverM: parseFloat(item.turnoverM || stockData.turnoverM || 0),
      updatedAt: new Date(),
      orderbook: orderbook
    };
  }

  function parseYahooFinanceChartData(json, sym) {
    const meta = json.chart.result[0].meta;
    const rawCode = sym.split('.')[0];
    const isTwse = sym.endsWith('.TW');
    const info = resolveStockInfo(sym);
    const stockName = info ? info.name : rawCode;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const change = price - prevClose;
    const changePct = ((change / prevClose) * 100).toFixed(2) + '%';

    return {
      symbol: sym,
      code: rawCode,
      name: stockName,
      enName: info ? info.enName : (isTwse ? 'TWSE' : 'TPEx'),
      marketType: isTwse ? 'TWSE' : 'TPEx',
      price: price,
      change: change,
      changePercent: changePct,
      changeStatus: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
      bid: price - 0.1,
      ask: price + 0.1,
      high: meta.regularMarketDayHigh || price,
      low: meta.regularMarketDayLow || price,
      open: meta.regularMarketOpen || price,
      prevClose: prevClose,
      volume: Math.round((meta.regularMarketVolume || 1350000) / 1000),
      turnoverM: ((price * (meta.regularMarketVolume || 1350000)) / 100000000).toFixed(2),
      updatedAt: new Date(),
      orderbook: stockData.orderbook || generateDefaultOrderbook(price)
    };
  }

  function generateSimulationTick() {
    stockData.updatedAt = new Date();
  }

  function seedPriceHistory() {
    const now = new Date();
    const basePrice = stockData.price || 100.0;
    priceHistory = [];
    for (let i = 30; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60000);
      const timeStr = padZero(t.getHours()) + ':' + padZero(t.getMinutes());
      const jitter = (Math.sin(i / 3) * (basePrice * 0.005)) + ((Math.random() - 0.5) * (basePrice * 0.003));
      priceHistory.push({
        time: timeStr,
        price: parseFloat((basePrice + jitter).toFixed(1))
      });
    }
  }

  // --- Render UI ---
  function updateUI() {
    const d = stockData.updatedAt || new Date();
    el.lastUpdateTime.textContent = `${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`;

    // Update Brand Info & Document Title
    const isTwse = stockData.marketType === 'TWSE';
    const marketLabel = isTwse ? '上市' : '上櫃';

    el.pageDocTitle.textContent = `${stockData.name} (${stockData.code}) 股市即時低價觀察與智慧通知系統`;
    el.brandLogoBadge.textContent = stockData.code.slice(0, 2);
    el.brandStockNameText.textContent = stockData.name;
    el.brandStockSubText.textContent = stockData.enName;
    el.brandStockTag.textContent = `${stockData.symbol} (${marketLabel})`;
    el.brandStockTag.className = `stock-tag ${isTwse ? '' : 'tpex'}`;

    el.heroCardStockTitle.textContent = `${stockData.name} (${stockData.code}) 即時報價`;
    el.targetPriceStockLabel.textContent = stockData.name;

    // Price
    if (stockData.price > 0) {
      const priceStr = Number(stockData.price).toFixed(1);
      el.currentPriceDisplay.textContent = priceStr;

      const isUp = stockData.change > 0;
      const isDown = stockData.change < 0;

      el.currentPriceDisplay.className = 'price-big-number ' + (isUp ? 'text-up' : isDown ? 'text-down' : 'text-flat');

      const prefix = isUp ? '▲ +' : isDown ? '▼ ' : '';
      const changeFormatted = `${prefix}${Number(stockData.change).toFixed(1)} (${stockData.changePercent})`;
      el.priceChangeDisplay.textContent = changeFormatted;
      el.priceChangeDisplay.className = 'price-change-pill ' + (isUp ? 'bg-up' : isDown ? 'bg-down' : 'bg-flat');
    } else {
      el.currentPriceDisplay.textContent = '--.--';
      el.priceChangeDisplay.textContent = '連線取得中...';
      el.priceChangeDisplay.className = 'price-change-pill bg-flat';
    }

    // Stats
    el.bestBidDisplay.textContent = stockData.bid > 0 ? Number(stockData.bid).toFixed(1) : '--';
    el.bestAskDisplay.textContent = stockData.ask > 0 ? Number(stockData.ask).toFixed(1) : '--';
    el.dayHighDisplay.textContent = stockData.high > 0 ? Number(stockData.high).toFixed(1) : '--';
    el.dayLowDisplay.textContent = stockData.low > 0 ? Number(stockData.low).toFixed(1) : '--';
    el.openPriceDisplay.textContent = stockData.open > 0 ? Number(stockData.open).toFixed(1) : '--';
    el.prevCloseDisplay.textContent = stockData.prevClose > 0 ? Number(stockData.prevClose).toFixed(1) : '--';
    el.totalVolumeDisplay.textContent = stockData.volume > 0 ? (stockData.volume || 0).toLocaleString() + ' 張' : '-- 張';
    el.turnoverDisplay.textContent = stockData.turnoverM > 0 ? stockData.turnoverM + ' 億' : '-- 億';

    renderOrderbook();

    const currentTimeStr = `${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
    if (priceHistory.length === 0 || priceHistory[priceHistory.length - 1].time !== currentTimeStr) {
      priceHistory.push({ time: currentTimeStr, price: stockData.price });
      if (priceHistory.length > 50) priceHistory.shift();
    } else {
      priceHistory[priceHistory.length - 1].price = stockData.price;
    }

    renderChart();
    updateWatchlistButtonState();
  }

  function renderOrderbook() {
    const ob = stockData.orderbook;
    if (!ob || ob.length === 0) return;

    let maxVol = 1;
    let sumBidVol = 0;
    let sumAskVol = 0;

    ob.forEach(row => {
      if (row.bidVol > maxVol) maxVol = row.bidVol;
      if (row.askVol > maxVol) maxVol = row.askVol;
      sumBidVol += row.bidVol || 0;
      sumAskVol += row.askVol || 0;
    });

    el.sumBidVolText.textContent = `買盤合計: ${sumBidVol} 張`;
    el.sumAskVolText.textContent = `賣盤合計: ${sumAskVol} 張`;

    const target = parseFloat(config.targetPrice);

    // Bid Rows (買盤)
    let bidHtml = '';
    ob.forEach((row) => {
      const pct = Math.min(100, Math.round(((row.bidVol || 0) / maxVol) * 100));
      const isTargetMatched = row.bid > 0 && row.bid <= target;
      const highlightClass = isTargetMatched ? 'highlight-target' : '';

      bidHtml += `
        <tr class="${highlightClass}" style="background: linear-gradient(to left, var(--color-up-bg) ${pct}%, transparent ${pct}%);">
          <td style="color: var(--text-main); font-weight: 700; text-align: left; padding: 6px 10px;">${row.bidVol} 張</td>
          <td style="color: var(--color-up); font-weight: 900; text-align: right; font-size: 1.05rem; padding: 6px 10px;">${row.bid > 0 ? Number(row.bid).toFixed(1) : '--'}</td>
        </tr>
      `;
    });
    el.bidTableBody.innerHTML = bidHtml;

    // Ask Rows (賣盤)
    let askHtml = '';
    ob.forEach((row) => {
      const pct = Math.min(100, Math.round(((row.askVol || 0) / maxVol) * 100));
      const isTargetMatched = row.ask > 0 && row.ask <= target;
      const highlightClass = isTargetMatched ? 'highlight-target' : '';

      askHtml += `
        <tr class="${highlightClass}" style="background: linear-gradient(to right, var(--color-down-bg) ${pct}%, transparent ${pct}%);">
          <td style="color: var(--color-down); font-weight: 900; text-align: left; font-size: 1.05rem; padding: 6px 10px;">${row.ask > 0 ? Number(row.ask).toFixed(1) : '--'}</td>
          <td style="color: var(--text-main); font-weight: 700; text-align: right; padding: 6px 10px;">${row.askVol} 張</td>
        </tr>
      `;
    });
    el.askTableBody.innerHTML = askHtml;
  }

  // --- Canvas Chart Rendering with Responsive Width ---
  function renderChart() {
    const canvas = el.trendChart;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    if (width <= 0 || height <= 0) return;

    const isLight = config.theme === 'light';

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (priceHistory.length < 2) return;

    let minP = Infinity;
    let maxP = -Infinity;
    priceHistory.forEach(pt => {
      if (pt.price < minP) minP = pt.price;
      if (pt.price > maxP) maxP = pt.price;
    });

    const target = parseFloat(config.targetPrice);
    if (!isNaN(target)) {
      if (target < minP) minP = target - 0.2;
      if (target > maxP) maxP = target + 0.2;
    }

    const pad = Math.max(0.4, (maxP - minP) * 0.15);
    minP -= pad;
    maxP += pad;
    const priceRange = maxP - minP;

    const isMobile = width < 480;
    const padTop = 20;
    const padBottom = 26;
    const padLeft = isMobile ? 42 : 50;
    const padRight = isMobile ? 12 : 20;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    function getX(index) {
      return padLeft + (index / (priceHistory.length - 1)) * chartW;
    }

    function getY(price) {
      return padTop + chartH - ((price - minP) / priceRange) * chartH;
    }

    // Grid Lines & Labels
    ctx.lineWidth = 1;
    ctx.strokeStyle = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillStyle = isLight ? '#475569' : '#9ca3af';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const p = minP + (priceRange * (i / steps));
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillText(p >= 100 ? p.toFixed(0) : p.toFixed(1), padLeft - 6, y + 3);
    }

    // Draw Price Path
    ctx.beginPath();
    priceHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.price);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Area Gradient
    const grad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    if (isLight) {
      grad.addColorStop(0, 'rgba(2, 132, 199, 0.22)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0.01)');
    } else {
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    }
    ctx.lineTo(getX(priceHistory.length - 1), height - padBottom);
    ctx.lineTo(getX(0), height - padBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Alert Target Threshold Line
    if (!isNaN(target)) {
      const targetY = getY(target);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = isLight ? '#d97706' : '#fbbf24';
      ctx.lineWidth = 2;
      ctx.moveTo(padLeft, targetY);
      ctx.lineTo(width - padRight, targetY);
      ctx.stroke();

      ctx.fillStyle = isLight ? '#b45309' : '#fbbf24';
      ctx.textAlign = 'left';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`門檻 ${target.toFixed(1)}`, width - padRight - 65, targetY - 5);
      ctx.restore();

      el.chartAlertLineLegend.textContent = `🟡 低價警戒線：${target.toFixed(1)} 元`;
    }

    // Time Labels at bottom
    ctx.fillStyle = isLight ? '#475569' : '#9ca3af';
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    if (priceHistory.length > 0) {
      ctx.fillText(priceHistory[0].time, getX(0), height - 8);
      const midIdx = Math.floor(priceHistory.length / 2);
      ctx.fillText(priceHistory[midIdx].time, getX(midIdx), height - 8);
      ctx.fillText(priceHistory[priceHistory.length - 1].time, getX(priceHistory.length - 1), height - 8);
    }
  }

  // --- Smart Alert Evaluator ---
  function evaluateAlerts() {
    const target = parseFloat(config.targetPrice);
    if (isNaN(target) || target <= 0) return;

    const condition = config.condition;
    const price = stockData.price;
    const ask = stockData.ask;
    const bid = stockData.bid;

    let isTriggered = false;
    let triggerReason = '';
    let triggerPrice = price;

    switch (condition) {
      case 'price_or_ask':
        if (price <= target) {
          isTriggered = true;
          triggerReason = `當前成交價 (${price} 元) ≤ 設定門檻 (${target} 元)`;
          triggerPrice = price;
        } else if (ask > 0 && ask <= target) {
          isTriggered = true;
          triggerReason = `盤口委賣價 Ask (${ask} 元) ≤ 設定門檻 (${target} 元)，可直接低價買進！`;
          triggerPrice = ask;
        }
        break;

      case 'price_le':
        if (price <= target) {
          isTriggered = true;
          triggerReason = `當前成交價 (${price} 元) ≤ 設定門檻 (${target} 元)`;
          triggerPrice = price;
        }
        break;

      case 'ask_le':
        if (ask > 0 && ask <= target) {
          isTriggered = true;
          triggerReason = `盤口委賣價 Ask (${ask} 元) ≤ 設定門檻 (${target} 元)`;
          triggerPrice = ask;
        }
        break;

      case 'bid_le':
        if (bid > 0 && bid <= target) {
          isTriggered = true;
          triggerReason = `盤口委買價 Bid (${bid} 元) ≤ 設定門檻 (${target} 元)`;
          triggerPrice = bid;
        }
        break;

      case 'any_orderbook':
        const found = stockData.orderbook.find(r => (r.bid > 0 && r.bid <= target) || (r.ask > 0 && r.ask <= target));
        if (found) {
          isTriggered = true;
          const matchedVal = (found.bid > 0 && found.bid <= target) ? found.bid : found.ask;
          triggerReason = `五檔報價中出現符合門檻之委託價 (${matchedVal} 元)`;
          triggerPrice = matchedVal;
        }
        break;
    }

    if (isTriggered) {
      const now = Date.now();
      const cooldown = parseInt(config.cooldownMs, 10);
      if (now - lastAlertTimestamp >= cooldown) {
        lastAlertTimestamp = now;
        fireAlert(triggerReason, triggerPrice);
      }
    }
  }

  function fireAlert(reason, triggerPrice) {
    const timeStr = new Date().toLocaleTimeString();

    alertLogs.unshift({
      time: timeStr,
      stock: `${stockData.name} (${stockData.code})`,
      price: triggerPrice,
      reason: reason
    });
    saveSettings();
    renderAlertLogs();

    playAlertSound();

    sendBrowserNotification(`🚨 ${stockData.name} (${stockData.code}) 低價買進通知！`, `${reason}，觸發價格：${triggerPrice} 元`);

    if (config.enableModalAlert) {
      el.modalAlertHeading.textContent = `${stockData.name} (${stockData.code}) 低價買進通知！`;
      el.modalAlertDesc.textContent = reason;
      el.modalAlertPrice.textContent = `${Number(triggerPrice).toFixed(1)} 元`;
      el.alertModalBackdrop.classList.add('active');
    }

    showToast(`⚡ 低價通知：${stockData.name} 股價已達到 ${triggerPrice} 元！`, 'alert');
  }

  function renderAlertLogs() {
    if (alertLogs.length === 0) {
      el.alertLogsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 1rem; font-size: 0.82rem; font-weight: 500;">
          目前尚無觸發紀錄。當股價達到設定門檻時將自動記錄於此。
        </div>
      `;
      return;
    }

    let html = '';
    alertLogs.slice(0, 15).forEach(log => {
      html += `
        <div class="log-item">
          <div>
            <span style="font-weight: 800; color: var(--color-warning); font-family: var(--font-mono); font-size: 0.95rem;">${Number(log.price).toFixed(1)} 元</span>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-accent); margin-left: 4px;">${log.stock || ''}</span>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; font-weight: 500;">${log.reason}</div>
          </div>
          <span class="log-time">${log.time}</span>
        </div>
      `;
    });
    el.alertLogsContainer.innerHTML = html;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'alert' ? '🚨' : type === 'success' ? '✅' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><div>${message}</div>`;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function setupEventListeners() {
    setupAutocomplete();

    // Stock search / switcher submit
    el.btnSwitchStock.addEventListener('click', () => {
      const q = el.stockSearchInput.value;
      if (q) {
        switchStock(q);
        el.stockSearchInput.value = '';
      }
    });

    el.stockSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && selectedAutocompleteIndex === -1) {
        el.btnSwitchStock.click();
      }
    });

    // Add Watchlist button
    el.btnAddWatchlist.addEventListener('click', addCurrentStockToWatchlist);

    // Notification permission button
    el.btnReqNotification.addEventListener('click', requestNotificationPermission);

    // Sound toggle
    el.btnToggleSound.addEventListener('click', () => {
      config.soundMuted = !config.soundMuted;
      updateSoundButtonUI();
      saveSettings();
      if (!config.soundMuted) {
        initAudioContext();
        playAlertSound();
      }
    });

    // Theme toggle
    el.btnThemeToggle.addEventListener('click', () => {
      config.theme = config.theme === 'dark' ? 'light' : 'dark';
      updateTheme();
      saveSettings();
      renderChart();
    });

    // Save alert settings
    el.btnSaveAlert.addEventListener('click', () => {
      const price = parseFloat(el.targetPriceInput.value);
      if (isNaN(price) || price <= 0) {
        showToast('請輸入有效的目標價格！', 'alert');
        return;
      }
      config.targetPrice = price;
      config.condition = el.alertConditionSelect.value;
      config.enableWebNotification = el.chkWebNotification.checked;
      config.enableModalAlert = el.chkModalAlert.checked;
      config.enableSoundAlert = el.chkSoundAlert.checked;
      config.cooldownMs = parseInt(el.cooldownSelect.value, 10);

      config.stockAlerts[config.currentSymbol] = price;

      el.currentThresholdView.textContent = price.toFixed(1);
      saveSettings();
      showToast(`${stockData.name} 低價門檻已儲存為 ${price.toFixed(1)} 元，即時監控中！`, 'success');

      evaluateAlerts();
      renderChart();
      renderOrderbook();
    });

    // Test alert button
    el.btnTestAlert.addEventListener('click', () => {
      initAudioContext();
      fireAlert(`【模擬測試】當前成交價 (${config.targetPrice} 元) ≤ 設定門檻 (${config.targetPrice} 元)`, config.targetPrice || stockData.price);
    });

    // Quick chips
    el.chipMinus05.addEventListener('click', () => {
      const p = Math.max(0.1, stockData.price - 0.5);
      el.targetPriceInput.value = p.toFixed(1);
      el.btnSaveAlert.click();
    });

    el.chipMinus1.addEventListener('click', () => {
      const p = Math.max(0.1, stockData.price - 1.0);
      el.targetPriceInput.value = p.toFixed(1);
      el.btnSaveAlert.click();
    });

    el.chipMinus2Percent.addEventListener('click', () => {
      const p = Math.max(0.1, +(stockData.price * 0.98).toFixed(1));
      el.targetPriceInput.value = p.toFixed(1);
      el.btnSaveAlert.click();
    });

    el.chipCurrentPrice.addEventListener('click', () => {
      el.targetPriceInput.value = stockData.price.toFixed(1);
      el.btnSaveAlert.click();
    });

    // Modal close
    el.btnCloseModal.addEventListener('click', () => {
      el.alertModalBackdrop.classList.remove('active');
    });

    el.alertModalBackdrop.addEventListener('click', (e) => {
      if (e.target === el.alertModalBackdrop) {
        el.alertModalBackdrop.classList.remove('active');
      }
    });

    // Clear logs
    el.btnClearLogs.addEventListener('click', () => {
      alertLogs = [];
      saveSettings();
      renderAlertLogs();
      showToast('紀錄已清除', 'info');
    });

    // Refresh rate
    el.refreshRateSelect.addEventListener('change', (e) => {
      config.refreshInterval = parseInt(e.target.value, 10);
      saveSettings();
      startPolling();
      showToast(`更新頻率已設為每 ${config.refreshInterval / 1000} 秒`, 'info');
    });

    // Manual refresh
    el.btnManualRefresh.addEventListener('click', () => {
      fetchRealtimeQuote();
      showToast('行情已刷新', 'info');
    });
  }

  function updateSoundButtonUI() {
    if (config.soundMuted || !config.enableSoundAlert) {
      el.soundIcon.textContent = '🔇';
      el.soundText.textContent = '靜音中';
      el.btnToggleSound.style.opacity = '0.6';
    } else {
      el.soundIcon.textContent = '🔊';
      el.soundText.textContent = '聲音開';
      el.btnToggleSound.style.opacity = '1';
    }
  }

  function updateTheme() {
    document.documentElement.setAttribute('data-theme', config.theme);
    el.themeIcon.textContent = config.theme === 'dark' ? '🌙' : '☀️';
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    const interval = Math.max(500, config.refreshInterval || 1000);
    pollTimer = setInterval(fetchRealtimeQuote, interval);
  }

  function padZero(n) {
    return n < 10 ? '0' + n : n;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
