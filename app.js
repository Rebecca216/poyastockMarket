/**
 * 寶雅 (5904) 股市即時低價觀察與智慧通知系統
 * Poya Real-Time Stock Quote Monitor & Smart Low Price Alert Engine
 */

(function () {
  'use strict';

  // --- Configuration & State ---
  const STORAGE_KEY = 'pouya_stock_monitor_v1';

  let config = {
    targetPrice: 74.0,
    condition: 'price_or_ask', // 'price_or_ask', 'price_le', 'ask_le', 'bid_le', 'any_orderbook'
    enableWebNotification: true,
    enableModalAlert: true,
    enableSoundAlert: true,
    cooldownMs: 180000,
    refreshInterval: 1000,
    soundMuted: false,
    theme: 'light'
  };

  let stockData = {
    symbol: '5904.TWO',
    name: '寶雅',
    price: 74.3,
    change: 0.2,
    changePercent: '0.27%',
    changeStatus: 'up', // 'up', 'down', 'flat'
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

  // --- DOM Elements ---
  const el = {
    // Header & Status
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

    // Hero Card
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

    // Quick price chips
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

    // Initial price history seed
    seedPriceHistory();

    // First fetch
    fetchRealtimeQuote();

    // Start 1-second auto polling
    startPolling();

    // Responsive Chart Resize Handling
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderChart, 100);
    });
  }

  // --- Storage & Config ---
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

      // 3-tone pleasant high-priority chime (880Hz -> 1174Hz -> 1760Hz)
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
        sendBrowserNotification('寶雅 (5904) 低價監控已啟動', '當前目標低價門檻為 ' + config.targetPrice + ' 元');
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
        tag: 'pouya_low_price_alert',
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

  // --- Real-Time Data Fetching (Fast & Robust) ---
  async function fetchRealtimeQuote() {
    if (isFetching) return;
    isFetching = true;

    try {
      const targetUrl = 'https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;symbols=%5B%225904.TWO%22%5D';
      let data = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2200);
        const resp = await fetch(targetUrl, { mode: 'cors', signal: controller.signal });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const json = await resp.json();
          if (json && json.length > 0) {
            data = parseYahooTWData(json[0]);
          }
        }
      } catch (corsErr) {
        try {
          const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl);
          const proxyController = new AbortController();
          const pTimeoutId = setTimeout(() => proxyController.abort(), 2500);
          const proxyResp = await fetch(proxyUrl, { signal: proxyController.signal });
          clearTimeout(pTimeoutId);

          if (proxyResp.ok) {
            const json = await proxyResp.json();
            if (json && json.length > 0) {
              data = parseYahooTWData(json[0]);
            }
          }
        } catch (proxyErr) {
          try {
            const yfUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/5904.TWO?interval=1m&range=1d';
            const yfResp = await fetch(yfUrl);
            if (yfResp.ok) {
              const yfJson = await yfResp.json();
              data = parseYahooFinanceChartData(yfJson);
            }
          } catch (e) {}
        }
      }

      if (data) {
        stockData = data;
        el.marketStatusText.textContent = '連線正常';
        el.marketDot.className = 'pulse-dot';
      } else {
        generateSimulationTick();
        el.marketStatusText.textContent = '模擬即時中';
        el.marketDot.className = 'pulse-dot market-closed';
      }

      updateUI();
      evaluateAlerts();
    } catch (err) {
      console.error('Fetch error:', err);
      el.marketStatusText.textContent = '連線重試中';
    } finally {
      isFetching = false;
    }
  }

  function parseYahooTWData(item) {
    const priceVal = parseFloat(item.price?.raw || item.price?.sort || stockData.price);
    const prevCloseVal = parseFloat(item.regularMarketPreviousClose?.raw || item.regularMarketPreviousClose?.sort || stockData.prevClose);
    const changeVal = parseFloat(item.change?.raw || item.change?.sort || (priceVal - prevCloseVal));
    const changePct = item.changePercent || ((changeVal / prevCloseVal) * 100).toFixed(2) + '%';
    const bestBidVal = parseFloat(item.bid?.raw || item.bid?.sort || 74.2);
    const bestAskVal = parseFloat(item.ask?.raw || item.ask?.sort || 74.4);

    let orderbook = [];
    if (item.orderbook && Array.isArray(item.orderbook) && item.orderbook.length > 0) {
      orderbook = item.orderbook.map(row => ({
        bid: parseFloat(row.bid) || 0,
        bidVol: parseInt(row.bidVolK || (row.bidVol ? row.bidVol / 1000 : 0)) || 0,
        ask: parseFloat(row.ask) || 0,
        askVol: parseInt(row.askVolK || (row.askVol ? row.askVol / 1000 : 0)) || 0
      }));
    } else {
      orderbook = stockData.orderbook;
    }

    return {
      symbol: '5904.TWO',
      name: '寶雅',
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
      turnoverM: parseFloat(item.turnoverM || stockData.turnoverM),
      updatedAt: new Date(),
      orderbook: orderbook
    };
  }

  function parseYahooFinanceChartData(json) {
    const meta = json.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const change = price - prevClose;
    const changePct = ((change / prevClose) * 100).toFixed(2) + '%';

    return {
      symbol: '5904.TWO',
      name: '寶雅',
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
      orderbook: stockData.orderbook
    };
  }

  function generateSimulationTick() {
    stockData.updatedAt = new Date();
  }

  function seedPriceHistory() {
    const now = new Date();
    const basePrice = 74.3;
    priceHistory = [];
    for (let i = 30; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60000);
      const timeStr = padZero(t.getHours()) + ':' + padZero(t.getMinutes());
      const jitter = (Math.sin(i / 3) * 0.35) + ((Math.random() - 0.5) * 0.2);
      priceHistory.push({
        time: timeStr,
        price: parseFloat((basePrice + jitter).toFixed(1))
      });
    }
  }

  // --- Render UI ---
  function updateUI() {
    const d = stockData.updatedAt;
    el.lastUpdateTime.textContent = `${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`;

    // Price
    const priceStr = stockData.price.toFixed(1);
    el.currentPriceDisplay.textContent = priceStr;

    const isUp = stockData.change > 0;
    const isDown = stockData.change < 0;

    el.currentPriceDisplay.className = 'price-big-number ' + (isUp ? 'text-up' : isDown ? 'text-down' : 'text-flat');

    const prefix = isUp ? '▲ +' : isDown ? '▼ ' : '';
    const changeFormatted = `${prefix}${stockData.change.toFixed(1)} (${stockData.changePercent})`;
    el.priceChangeDisplay.textContent = changeFormatted;
    el.priceChangeDisplay.className = 'price-change-pill ' + (isUp ? 'bg-up' : isDown ? 'bg-down' : 'bg-flat');

    // Stats
    el.bestBidDisplay.textContent = stockData.bid ? stockData.bid.toFixed(1) : '--';
    el.bestAskDisplay.textContent = stockData.ask ? stockData.ask.toFixed(1) : '--';
    el.dayHighDisplay.textContent = stockData.high ? stockData.high.toFixed(1) : '--';
    el.dayLowDisplay.textContent = stockData.low ? stockData.low.toFixed(1) : '--';
    el.openPriceDisplay.textContent = stockData.open ? stockData.open.toFixed(1) : '--';
    el.prevCloseDisplay.textContent = stockData.prevClose ? stockData.prevClose.toFixed(1) : '--';
    el.totalVolumeDisplay.textContent = stockData.volume.toLocaleString() + ' 張';
    el.turnoverDisplay.textContent = stockData.turnoverM + ' 億';

    renderOrderbook();

    const currentTimeStr = `${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
    if (priceHistory.length === 0 || priceHistory[priceHistory.length - 1].time !== currentTimeStr) {
      priceHistory.push({ time: currentTimeStr, price: stockData.price });
      if (priceHistory.length > 50) priceHistory.shift();
    } else {
      priceHistory[priceHistory.length - 1].price = stockData.price;
    }

    renderChart();
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

    // Bid Rows (委買盤：量在左、價在右，深色文字高對比)
    let bidHtml = '';
    ob.forEach((row) => {
      const pct = Math.min(100, Math.round(((row.bidVol || 0) / maxVol) * 100));
      const isTargetMatched = row.bid > 0 && row.bid <= target;
      const highlightClass = isTargetMatched ? 'highlight-target' : '';

      bidHtml += `
        <tr class="${highlightClass}" style="background: linear-gradient(to left, var(--color-up-bg) ${pct}%, transparent ${pct}%);">
          <td style="color: var(--text-main); font-weight: 700; text-align: left; padding: 6px 10px;">${row.bidVol} 張</td>
          <td style="color: var(--color-up); font-weight: 900; text-align: right; font-size: 1.05rem; padding: 6px 10px;">${row.bid > 0 ? row.bid.toFixed(1) : '--'}</td>
        </tr>
      `;
    });
    el.bidTableBody.innerHTML = bidHtml;

    // Ask Rows (委賣盤：價在左、量在右，深色文字高對比)
    let askHtml = '';
    ob.forEach((row) => {
      const pct = Math.min(100, Math.round(((row.askVol || 0) / maxVol) * 100));
      const isTargetMatched = row.ask > 0 && row.ask <= target;
      const highlightClass = isTargetMatched ? 'highlight-target' : '';

      askHtml += `
        <tr class="${highlightClass}" style="background: linear-gradient(to right, var(--color-down-bg) ${pct}%, transparent ${pct}%);">
          <td style="color: var(--color-down); font-weight: 900; text-align: left; font-size: 1.05rem; padding: 6px 10px;">${row.ask > 0 ? row.ask.toFixed(1) : '--'}</td>
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

    const pad = Math.max(0.3, (maxP - minP) * 0.15);
    minP -= pad;
    maxP += pad;
    const priceRange = maxP - minP;

    const isMobile = width < 480;
    const padTop = 20;
    const padBottom = 26;
    const padLeft = isMobile ? 42 : 48;
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

      ctx.fillText(p.toFixed(1), padLeft - 6, y + 3);
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
      price: triggerPrice,
      reason: reason
    });
    saveSettings();
    renderAlertLogs();

    playAlertSound();

    sendBrowserNotification('🚨 寶雅 (5904) 低價買進通知！', `${reason}，觸發價格：${triggerPrice} 元`);

    if (config.enableModalAlert) {
      el.modalAlertDesc.textContent = reason;
      el.modalAlertPrice.textContent = `${triggerPrice.toFixed(1)} 元`;
      el.alertModalBackdrop.classList.add('active');
    }

    showToast(`⚡ 低價通知：寶雅股價已達到 ${triggerPrice} 元！`, 'alert');
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
            <span style="font-weight: 800; color: var(--color-warning); font-family: var(--font-mono); font-size: 0.95rem;">${log.price.toFixed(1)} 元</span>
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
    }, 4000);
  }

  function setupEventListeners() {
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

      el.currentThresholdView.textContent = price.toFixed(1);
      saveSettings();
      showToast(`低價門檻已儲存為 ${price.toFixed(1)} 元，即時監控中！`, 'success');

      evaluateAlerts();
      renderChart();
      renderOrderbook();
    });

    // Test alert button
    el.btnTestAlert.addEventListener('click', () => {
      initAudioContext();
      fireAlert(`【模擬測試】當前成交價 (${config.targetPrice} 元) ≤ 設定門檻 (${config.targetPrice} 元)`, config.targetPrice || 74.0);
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
