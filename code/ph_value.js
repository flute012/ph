document.addEventListener('DOMContentLoaded', () => {
  const liquidSelect = document.getElementById('liquidSelect');
  const resetBtn = document.getElementById('resetBtn');
  const sampleIcon = document.getElementById('sampleIcon');

  const liquid = document.getElementById('liquid');
  const liquidShadow = document.getElementById('Liquid_Shadow');
  const liquidBright = document.getElementById('Liquid_bright_part');
  const phText = document.getElementById('phText');

  const indicatorPointer = document.getElementById('indicatorPointer');
  const pointerLabel = document.getElementById('pointerLabel');
  const indicatorCells = document.querySelectorAll('.indicator-cell');

  const BASE_LIQUID_COLOR = '#6dc1b4';

  // ========== 廣用試紙 pH 顏色色票（用於試紙指示） ==========
  const phColors = {
    1: "#ee2d22",
    2: "#f54b41",
    3: "#fb6222",
    4: "#ffd10a",
    5: "#ffe600",
    6: "#75cc20",
    7: "#3fa142",
    8: "#0ee479",
    9: "#48c2f9",
    10: "#0086d4",
    11: "#0755aa",
    12: "#4904d0",
    13: "#7809a4",
    14: "#3e0576"
  };

  // ========== 燒杯中溶液的真實顏色（與試紙分開） ==========
  const liquidColors = {
    "胃液": "#adbf88",      // 淡黃綠色
    "檸檬汁": "#f5e6a3'",    // 淡黃色
    "可樂": "#611b00",      // 深棕色（可樂色）
    "啤酒": "#f0a830",      // 金黃色
    "咖啡": "#401d04",      // 深咖啡色
    "牛奶": "#fdfff5",      // 乳白色
    "水": "#a8d8ea",        // 淡藍透明感
    "血液": "#8b0000",      // 深紅色
    "沐浴乳": "#f8e0e8",    // 淡粉色
    "清潔劑": "#7ec8e3",    // 淡藍色
    "洗衣精": "#4a90d9",    // 藍色
    "通樂": "#2e5090"       // 深藍色
  };

  // 各液體對應大致 pH 值
  const samplePh = {
    "胃液": 1,
    "檸檬汁": 2,
    "可樂": 3,
    "啤酒": 4,
    "咖啡": 5,
    "牛奶": 6,
    "水": 7,
    "血液": 8,
    "沐浴乳": 10,
    "清潔劑": 11,
    "洗衣精": 12,
    "通樂": 14
  };

  // 圖示路徑
  const sampleIcons = {
    "胃液": "icons/gastric.svg",
    "檸檬汁": "icons/lemon.svg",
    "可樂": "icons/cola.svg",
    "啤酒": "icons/beer.svg",
    "咖啡": "icons/coffee.svg",
    "牛奶": "icons/milk.svg",
    "水": "icons/water.svg",
    "血液": "icons/blood.svg",
    "沐浴乳": "icons/bodyWash.svg",
    "清潔劑": "icons/cleaner.svg",
    "洗衣精": "icons/detergent.svg",
    "通樂": "icons/drainClean.svg"
  };

  // 顏色微調：amt > 0 變亮，amt < 0 變暗
  function adjustColor(hex, amt) {
    let usePound = false;
    if (hex[0] === '#') {
      hex = hex.slice(1);
      usePound = true;
    }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00ff) + amt;
    let b = (num & 0x0000ff) + amt;

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return (usePound ? '#' : '') +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // 初始化 pH 色條（廣用試紙顏色）
  indicatorCells.forEach(cell => {
    const ph = Number(cell.dataset.ph);
    const color = phColors[ph];
    if (color) {
      cell.style.background = color;
    }
  });

  function setLiquidColor(color) {
    if (!liquid || !liquidShadow || !liquidBright) return;
    liquid.style.fill = color;
    liquidShadow.style.fill = adjustColor(color, -25);
    liquidBright.style.fill = adjustColor(color, 40);
  }

  function resetAll() {
    liquidSelect.value = '';
    sampleIcon.src = 'icons/Q.svg';
    sampleIcon.alt = '請選擇液體';

    setLiquidColor(BASE_LIQUID_COLOR);
    phText.textContent = '--';

    indicatorPointer.style.opacity = '0';
    pointerLabel.textContent = 'pH ?';
    indicatorCells.forEach(c => c.classList.remove('active'));
  }

  function updateUI() {
    const name = liquidSelect.value;

    if (!name || !samplePh[name]) {
      resetAll();
      return;
    }

    const ph = samplePh[name];

    // ✅ 燒杯溶液使用「真實液體顏色」
    const realColor = liquidColors[name] || BASE_LIQUID_COLOR;
    setLiquidColor(realColor);

    // 更新儀器螢幕數字
    phText.textContent = ph.toFixed(1);

    // 更新圖示
    const iconPath = sampleIcons[name] || 'icons/Q.svg';
    sampleIcon.src = iconPath;
    sampleIcon.alt = name;

    // ✅ 廣用試紙高亮對應色塊（使用 phColors）
    indicatorCells.forEach(cell => {
      const cellPh = Number(cell.dataset.ph);
      cell.classList.toggle('active', cellPh === ph);
    });

    // 調整指標位置
    const percent = (ph - 0.5) / 14 * 100;
    indicatorPointer.style.left = `${percent}%`;
    indicatorPointer.style.opacity = '1';
    pointerLabel.textContent = `pH ${ph}`;
  }

  liquidSelect.addEventListener('change', updateUI);
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAll);
  }

  // 展開/收合廣用試紙區塊
  const toggleBtn = document.getElementById('toggleIndicatorBtn');
  const toggleArrow = document.getElementById('toggleArrow');
  const indicatorContent = document.getElementById('indicatorContent');

  if (toggleBtn && indicatorContent) {
    toggleBtn.addEventListener('click', function () {
      const isHidden = indicatorContent.style.display === 'none';

      if (isHidden) {
        indicatorContent.style.display = 'block';
        toggleArrow.classList.add('open');
      } else {
        indicatorContent.style.display = 'none';
        toggleArrow.classList.remove('open');
      }
    });
  }

  // 初始狀態
  resetAll();
});