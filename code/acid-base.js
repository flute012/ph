// acid-base.js - 整合版（修正拖曳功能）

const state = {
  currentPH: 7,
  currentIndicatorKey: null,
  currentLiquidName: '純水',
  hasLiquidInBeaker: true,
  hasIndicatorInBeaker: false,
  scaleDoc: null,
  potDoc: null,
  indicatorScaleDocs: []
};

// 廣用試紙固定色帶(1~14)
const UNIVERSAL_PAPER_COLORS = {
  1: '#ee2d22', 2: '#f54b41', 3: '#fb6222', 4: '#ffd10a',
  5: '#ffe600', 6: '#75cc20', 7: '#3fa142', 8: '#0ee479',
  9: '#48c2f9', 10: '#0086d4', 11: '#0755aa', 12: '#4904d0',
  13: '#7809a4', 14: '#3e0576'
};

// 待測液體：pH + icon + 液體本身顏色 + 深色程度（0=透明, 1=完全不透光）
const LIQUIDS = {
  '檸檬汁': { ph: 2.5, icon: 'lemon.svg', color: '#f5e6a3', opacity: 0.7, darkness: 0.35 },
  '可樂': { ph: 3, icon: 'cola.svg', color: '#3d1c02', opacity: 0.85, darkness: 0.8 },
  '啤酒': { ph: 4.5, icon: 'beer.svg', color: '#d4a017', opacity: 0.6, darkness: 0.3 },
  '咖啡': { ph: 5, icon: 'coffee.svg', color: '#331e0fff', opacity: 0.85, darkness: 0.75 },
  '牛奶': { ph: 6.5, icon: 'milk.svg', color: '#fdfff5', opacity: 0.95, darkness: 0.1 },
  '純水': { ph: 7, icon: 'water.svg', color: 'rgba(255,255,255,0.3)', opacity: 0.3, darkness: 0 },
  '沐浴乳': { ph: 6, icon: 'bodyWash.svg', color: '#e8f4f8', opacity: 0.8, darkness: 0.1 },
  '肥皂水': { ph: 9, icon: 'soap.svg', color: '#f5f5f5', opacity: 0.9, darkness: 0.05 },
  '洗衣精': { ph: 9.5, icon: 'detergent.svg', color: '#a8d8ea', opacity: 0.75, darkness: 0.15 },
  '漂白水': { ph: 11, icon: 'bleach.svg', color: '#fffde7', opacity: 0.6, darkness: 0.05 },
  '通樂': { ph: 13, icon: 'drainClean.svg', color: '#1a237e', opacity: 0.85, darkness: 0.2 }
};

// 7 個指示劑資料
const INDICATOR_DATA = {
  thymolBlue: {
    name: '瑞香草酚藍',
    ranges: [
      { type: 'solid', from: 1, to: 1.1, color: '#e84784', note: '強酸：粉紅' },
      { type: 'gradient', from: 1.2, to: 2.8, colors: ['#e84784', '#f58a5e', '#f9b700'], note: '粉紅→橙→黃' },
      { type: 'solid', from: 2.9, to: 8.1, color: '#ffe947', note: '中性：黃' },
      { type: 'gradient', from: 8.2, to: 9.7, colors: ['#ffe947', '#c6dd7c', '#8bc77e', '#2a9d8f', '#065dac'], note: '黃→黃綠→綠→藍' },
      { type: 'solid', from: 9.8, to: 11.5, color: '#065dac', note: '鹼：藍' },
      { type: 'gradient', from: 11.6, to: 14, colors: ['#065dac', '#044a8a', '#03316b'], note: '強鹼：深藍' }
    ]
  },
  bromothymolBlue: {
    name: '溴瑞香草酚藍',
    ranges: [
      { type: 'solid', from: 1, to: 5.9, color: '#ffe947', note: '酸～弱酸：黃' },
      { type: 'gradient', from: 6.0, to: 7.6, colors: ['#ffe947', '#a8d44a', '#6bb92d', '#2a9d8f', '#007f95', '#065dac'], note: '黃→綠→青→藍' },
      { type: 'solid', from: 7.7, to: 11.5, color: '#065dac', note: '中性和鹼：藍' },
      { type: 'gradient', from: 11.6, to: 14, colors: ['#065dac', '#044a8a', '#03316b'], note: '強鹼：深藍' }
    ]
  },
  methylOrange: {
    name: '甲基橙',
    ranges: [
      { type: 'solid', from: 1, to: 3.1, color: '#ee8384', note: '酸：粉紅' },
      { type: 'gradient', from: 3.2, to: 4.4, colors: ['#ee8384', '#f39500', '#fcc800', '#ffe947'], note: '粉紅→橙→黃' },
      { type: 'solid', from: 4.5, to: 14, color: '#ffe947', note: '中性以上：黃' }
    ]
  },
  methylRed: {
    name: '甲基紅',
    ranges: [
      { type: 'solid', from: 1, to: 4.7, color: '#f09abf', note: '酸：粉紅' },
      { type: 'gradient', from: 4.8, to: 6.0, colors: ['#f09abf', '#f5b88d', '#fdd35c', '#ffe947'], note: '粉紅→橙黃→黃' },
      { type: 'solid', from: 6.1, to: 14, color: '#ffe947', note: '中性以上：黃' }
    ]
  },
  phenolphthalein: {
    name: '酚酞',
    ranges: [
      { type: 'solid', from: 1, to: 8.1, color: '#f4f4f4', note: '無色' },
      { type: 'gradient', from: 8.2, to: 10.0, colors: ['#f4f4f4', '#F1D1DD', '#EAB5CB', '#E58EB2', '#E8538C'], note: '無色→淡粉→粉紅' },
      { type: 'solid', from: 10.1, to: 14, color: '#E8538C', note: '鹼：粉紅' }
    ]
  },
  redCabbage: {
    name: '紫甘藍汁',
    ranges: [
      { type: 'solid', from: 1, to: 2, color: '#e8284b', note: '強酸：紅' },
      { type: 'gradient', from: 2, to: 4, colors: ['#e8284b', '#d93a6e', '#c94d8a'], note: '紅→紫紅' },
      { type: 'gradient', from: 4, to: 8, colors: ['#c94d8a', '#a855a4', '#8b5bb5', '#7b5fbd'], note: '紫紅→紫' },
      { type: 'gradient', from: 8, to: 10, colors: ['#7b5fbd', '#5a7bbf', '#3a9ac0', '#2ab5b0'], note: '紫→藍→青' },
      { type: 'gradient', from: 10, to: 12, colors: ['#2ab5b0', '#4dc47a', '#7bd145'], note: '青→藍綠→綠' },
      { type: 'gradient', from: 12, to: 14, colors: ['#7bd145', '#b8d930', '#e8e020'], note: '綠→黃綠→黃' }
    ]
  },
  butterflyPea: {
    name: '蝶豆花',
    ranges: [
      {
        type: 'gradient',
        from: 1,
        to: 2,
        colors: ['#e91b5f', '#ec4a8b'],
        note: '深玫紅（強酸）'
      },
      { type: 'gradient', from: 2, to: 4, colors: ['#ec4a8b', '#a2489f'], note: '粉紅→紫紅' },
      { type: 'gradient', from: 4, to: 6, colors: ['#a2489f', '#7155cc'], note: '紫紅→藍紫' },
      { type: 'gradient', from: 6, to: 8, colors: ['#7155cc', '#3f51b5', '#2a9fd6'], note: '藍紫→藍→藍綠' },
      {
        type: 'gradient',
        from: 8,
        to: 9,
        colors: ['#2a9fd6', '#1db49f'],
        note: '藍綠→青綠'
      },
      {
        type: 'gradient',
        from: 9,
        to: 10,
        colors: ['#1db49f', '#00a859'],
        note: '青綠→深綠'
      },
      { type: 'gradient', from: 10, to: 12, colors: ['#00a859', '#c6d400'], note: '綠→黃綠' },
      { type: 'gradient', from: 12, to: 14, colors: ['#c6d400', '#f1e000'], note: '黃綠→鮮黃' }
    ]
  }
};

function applyIndicatorToBeaker(key) {
  if (!INDICATOR_DATA[key]) return;

  // ⭐ 如果現在燒杯裡就是這個指示劑 → 取消
  if (state.currentIndicatorKey === key) {
    state.currentIndicatorKey = null;
    state.hasIndicatorInBeaker = false;
  } else {
    // ⭐ 否則 → 換成這個指示劑
    state.currentIndicatorKey = key;
    state.hasIndicatorInBeaker = true;
  }

  updateBeakerLiquidColor();
  triggerLiquidAnim();
  updateSolutionLabel();
  updateIndicatorAddButtons();
}

function updateIndicatorAddButtons() {
  document.querySelectorAll('.indicator-card').forEach(card => {
    const key = card.dataset.indicatorKey;
    const btn = card.querySelector('.indicator-add-btn');
    if (!btn) return;

    if (state.currentIndicatorKey === key) {
      // 這張卡片的指示劑正在燒杯裡
      btn.textContent = '✔️ 已在燒杯中';
      btn.classList.add('indicator-add-btn--active');
    } else {
      // 沒有被選中
      btn.textContent = '➕ 加入燒杯';
      btn.classList.remove('indicator-add-btn--active');
    }
  });
}


// ===== 顏色小工具 =====
function hexToRgb(hex) {
  let clean = hex.replace('#', '');

  // 如果是 8 位 hex（RGBA），只取前 6 位（RGB）
  if (clean.length === 8) {
    clean = clean.substring(0, 6);
  }

  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = v => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustLightness(hex, percent) {
  const rgb = hexToRgb(hex);
  const factor = (100 + percent) / 100;
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  return rgbToHex({
    r: clamp(rgb.r * factor),
    g: clamp(rgb.g * factor),
    b: clamp(rgb.b * factor)
  });
}

function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const mix = (x, y) => Math.round(x + (y - x) * t);
  return rgbToHex({ r: mix(a.r, b.r), g: mix(a.g, b.g), b: mix(a.b, b.b) });
}

// 指示劑在某 pH 的顏色
function getIndicatorColorAtPH(key, ph) {
  const data = INDICATOR_DATA[key];
  if (!data) return null;
  const p = Math.max(1, Math.min(14, ph));

  let inRange = null;
  let closest = null;
  let minDist = Infinity;

  for (const r of data.ranges) {
    const mid = (r.from + r.to) / 2;
    const dist = Math.abs(p - mid);
    if (p >= r.from && p <= r.to) {
      inRange = r;
      break;
    }
    if (dist < minDist) {
      minDist = dist;
      closest = r;
    }
  }
  const r = inRange || closest;
  if (!r) return null;

  if (r.type === 'solid') {
    return r.color || '#ffffff';
  }

  const colors = (r.colors && r.colors.length >= 2)
    ? r.colors
    : [UNIVERSAL_PAPER_COLORS[Math.round(r.from)] || '#aaa',
    UNIVERSAL_PAPER_COLORS[Math.round(r.to)] || '#bbb'];

  const tNorm = (p - r.from) / (r.to - r.from || 1);
  const t = Math.max(0, Math.min(1, tNorm));
  const segCount = colors.length - 1;
  const segIndex = Math.min(segCount - 1, Math.floor(t * segCount));
  const localT = (t * segCount) - segIndex;
  const c1 = colors[segIndex];
  const c2 = colors[segIndex + 1] || c1;
  return lerpColor(c1, c2, localT);
}

// 通用 pH 色帶（廣用試紙）
function getUniversalColor(p) {
  const idx = Math.max(1, Math.min(14, Math.round(p)));
  return UNIVERSAL_PAPER_COLORS[idx] || '#48c2f9';
}

// ===== scale-Ai：讓指標移動到對應 pH（以 pointer 為主） =====
function updateScalePointer(doc, pH) {
  if (!doc) return;

  const bar = doc.getElementById('slider bar') ||
    doc.getElementById('slider_bar') ||
    doc.getElementById('sliderBar');

  const knob = doc.getElementById('pointer') ||
    doc.getElementById('slider_button') ||
    doc.getElementById('slider button');

  if (!bar || !knob) return;

  const barBox = bar.getBBox();

  // ⭐ 改成 0～14 的刻度
  const pClamp = Math.max(0, Math.min(14, pH));
  const t = pClamp / 14;          // 0 → 最左，14 → 最右
  const targetX = barBox.x + barBox.width * t;

  if (!knob.dataset.baseCenterX) {
    const box = knob.getBBox();
    const baseCenterX = box.x + box.width / 2;
    knob.dataset.baseCenterX = String(baseCenterX);
  }

  const baseCenterX = parseFloat(knob.dataset.baseCenterX);
  const dx = targetX - baseCenterX;

  knob.setAttribute('transform', `translate(${dx}, 0)`);
}


// 更新所有指示劑卡片內 scale 的指標
function updateAllIndicatorScalePointers(pH) {
  state.indicatorScaleDocs.forEach(doc => {
    updateScalePointer(doc, pH);
  });
}

// ===== 主控：所有改 pH 的入口 =====
function setPHValue(pH, source = 'liquid') {  // ← 加參數，預設 'liquid'
  const clamped = Math.max(0, Math.min(14, pH));
  state.currentPH = clamped;

  updateBeakerLiquidColor();
  updateUniversalScale();

  // ⭐ 只有來自神秘液體時才更新 pot 和滑桿
  if (source === 'unknown' || source === 'reset') {
    setPotColor(clamped);

    const slider = document.getElementById('ph-slider');
    const valSpan = document.getElementById('ph-slider-value');
    if (slider && !slider.matches(':focus')) {
      slider.value = clamped.toFixed(1);
    }
    if (valSpan) {
      valSpan.textContent = clamped.toFixed(1);
    }
  }

  updateAllIndicatorScalePointers(clamped);
  triggerLiquidAnim();
}

// ===== 混合兩個顏色（用於深色液體 + 指示劑） =====
function blendColors(color1, color2, ratio) {
  // ratio: 0 = 全是 color1, 1 = 全是 color2
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return rgbToHex({ r, g, b });
}

// ===== 讓顏色變暗（模擬深色液體吸收光線） =====
function darkenColor(hex, amount) {
  const rgb = hexToRgb(hex);
  const factor = 1 - amount;
  return rgbToHex({
    r: Math.round(rgb.r * factor),
    g: Math.round(rgb.g * factor),
    b: Math.round(rgb.b * factor)
  });
}

// ===== 右側燒杯顏色：液體 + 指示劑混色邏輯 =====
function updateBeakerLiquidColor() {
  const root = document.getElementById('beaker-svg-root');
  if (!root) return;

  let mainColor;
  let light, dark;
  let liquidOpacity = 0.7;

  const liquidData = LIQUIDS[state.currentLiquidName];
  const darkness = liquidData?.darkness || 0;

  // 有指示劑
  if (state.currentIndicatorKey) {
    let indicatorColor = getIndicatorColorAtPH(state.currentIndicatorKey, state.currentPH);
    if (!indicatorColor) {
      indicatorColor = getUniversalColor(state.currentPH);
    }

    // 根據液體深色程度混色
    if (darkness > 0.3 && liquidData && liquidData.color && !liquidData.color.startsWith('rgba')) {
      // 深色液體：混合液體顏色和指示劑顏色，並整體變暗
      const blended = blendColors(indicatorColor, liquidData.color, darkness * 0.6);
      mainColor = darkenColor(blended, darkness * 0.4);
      liquidOpacity = liquidData.opacity || 0.85;
    } else if (darkness > 0) {
      // 中等深度液體：指示劑顏色略微變暗
      mainColor = darkenColor(indicatorColor, darkness * 0.3);
      liquidOpacity = liquidData?.opacity || 0.7;
    } else {
      // 透明/淺色液體：直接顯示指示劑顏色
      mainColor = indicatorColor;
    }

    light = adjustLightness(mainColor, 25);
    dark = adjustLightness(mainColor, -20);
  } else {
    // 沒指示劑 → 用液體本身的顏色
    if (liquidData && liquidData.color) {
      mainColor = liquidData.color;
      liquidOpacity = liquidData.opacity || 0.7;

      // 處理 rgba 格式的顏色（如純水）
      if (mainColor.startsWith('rgba')) {
        light = 'rgba(255,255,255,0.5)';
        dark = 'rgba(200,200,200,0.3)';
      } else {
        light = adjustLightness(mainColor, 35);
        dark = adjustLightness(mainColor, -20);
      }
    } else if (state.currentLiquidName && state.currentLiquidName.startsWith('神秘液體')) {
      // 神秘液體 → 用通用試紙色
      mainColor = getUniversalColor(state.currentPH);
      light = adjustLightness(mainColor, 30);
      dark = adjustLightness(mainColor, -25);
    } else {
      // 預設純水
      mainColor = 'rgba(255,255,255,0.3)';
      light = 'rgba(255,255,255,0.5)';
      dark = 'rgba(230,230,230,0.2)';
    }
  }

  const liquid = root.querySelector('#liquid');
  const shadow = root.querySelector('#Liquid_Shadow');
  const bright = root.querySelector('#Liquid_bright_part');
  const phText = root.querySelector('#phText');

  if (liquid) {
    liquid.style.fill = mainColor;
    // 如果不是 rgba 格式，手動設定透明度
    if (!mainColor.startsWith('rgba')) {
      liquid.style.opacity = liquidOpacity;
    }
  }
  if (shadow) shadow.style.fill = dark;
  if (bright) bright.style.fill = light;
  if (phText) phText.textContent = state.currentPH.toFixed(1);
}

// ===== 右下廣用試紙 scale-Ai：通用色帶 + 指標 =====
function updateUniversalScale() {
  if (!state.scaleDoc) return;

  const grad = state.scaleDoc.getElementById('grad-indicator') ||
    state.scaleDoc.getElementById('colorBand') ||
    state.scaleDoc.getElementById('indicator-color');
  if (!grad) return;

  while (grad.firstChild) grad.removeChild(grad.firstChild);

  for (let p = 1; p <= 14; p++) {
    const offset = (p / 14) * 100;
    const c = UNIVERSAL_PAPER_COLORS[p];
    const stop = state.scaleDoc.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', `${offset}%`);
    stop.setAttribute('stop-color', c);
    grad.appendChild(stop);
  }

  // slider_bar：藏起來但保留幾何資訊
  const bar = state.scaleDoc.getElementById('slider bar') ||
    state.scaleDoc.getElementById('slider_bar') ||
    state.scaleDoc.getElementById('sliderBar');
  if (bar) {
    bar.style.opacity = '0';
    bar.style.pointerEvents = 'none';
  }

  // slider_button：也藏起來
  const sliderBtn = state.scaleDoc.getElementById('slider_button') ||
    state.scaleDoc.getElementById('slider button');
  if (sliderBtn) {
    sliderBtn.style.opacity = '0';
    sliderBtn.style.pointerEvents = 'none';
  }

  // pointer：唯一主角
  const pointer = state.scaleDoc.getElementById('pointer');
  if (pointer) {
    pointer.style.display = 'block';
    pointer.style.visibility = 'visible';
    pointer.style.opacity = '1';
    pointer.style.pointerEvents = 'none';
  }

  updateScalePointer(state.scaleDoc, state.currentPH);
}

// ===== pot 顏色（神秘液體的小燒杯） =====
function setPotColor(pH) {
  if (!state.potDoc) return;
  const main = getUniversalColor(pH);
  const light = adjustLightness(main, 30);
  const liquid = state.potDoc.getElementById('pot_liquid');
  const highlight = state.potDoc.getElementById('pot_liquid_light');
  if (liquid) liquid.style.fill = main;
  if (highlight) highlight.style.fill = light;
}

// ===== 左側每張指示劑卡裡的 scale-Ai：畫專屬色帶 + pointer =====
function configureIndicatorScale(doc, indicatorKey) {
  const data = INDICATOR_DATA[indicatorKey];
  if (!data) return;

  const grad = doc.getElementById('colorBand');
  if (!grad) return;

  // 把舊的 stop 清掉
  while (grad.firstChild) grad.removeChild(grad.firstChild);

  // 用 INDICATOR_DATA 的 ranges 來塞 stop
  data.ranges.forEach(r => {
    const fromOffset = (r.from / 14) * 100;
    const toOffset = (r.to / 14) * 100;

    if (r.type === 'solid') {
      const s1 = doc.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s1.setAttribute('offset', `${fromOffset}%`);
      s1.setAttribute('stop-color', r.color);
      grad.appendChild(s1);

      const s2 = doc.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s2.setAttribute('offset', `${toOffset}%`);
      s2.setAttribute('stop-color', r.color);
      grad.appendChild(s2);
    } else {
      const colors = (r.colors && r.colors.length >= 2)
        ? r.colors
        : [UNIVERSAL_PAPER_COLORS[Math.round(r.from)] || '#888',
        UNIVERSAL_PAPER_COLORS[Math.round(r.to)] || '#bbb'];

      const segCount = colors.length - 1;
      colors.forEach((c, idx) => {
        const t = idx / segCount;
        const off = fromOffset + (toOffset - fromOffset) * t;
        const stop = doc.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', `${off}%`);
        stop.setAttribute('stop-color', c);
        grad.appendChild(stop);
      });
    }
  });

  // 藏掉 slider_bar + slider_button，只留 pointer
  const bar = doc.getElementById('slider bar') ||
    doc.getElementById('slider_bar') ||
    doc.getElementById('sliderBar');
  if (bar) {
    bar.style.opacity = '0';
    bar.style.pointerEvents = 'none';
  }

  const sliderBtn = doc.getElementById('slider_button') ||
    doc.getElementById('slider button');
  if (sliderBtn) {
    sliderBtn.style.opacity = '0';
    sliderBtn.style.pointerEvents = 'none';
  }

  const pointer = doc.getElementById('pointer');
  if (pointer) {
    pointer.style.display = 'block';
    pointer.style.visibility = 'visible';
    pointer.style.opacity = '1';
    pointer.style.pointerEvents = 'none';
  }
}

// ===== 液面動畫 =====
function triggerLiquidAnim() {
  const root = document.getElementById('beaker-svg-root');
  if (!root) return;
  const liquid = root.querySelector('#liquid');
  if (!liquid) return;
  liquid.classList.remove('ab-liquid-bump');
  void liquid.offsetWidth;
  liquid.classList.add('ab-liquid-bump');
}

// ===== 更新膠囊標示：顯示當前指示劑和液體 =====
function updateSolutionLabel() {
  const indicatorValue = document.getElementById('solution-indicator-value');
  const liquidValue = document.getElementById('solution-liquid-value');

  if (!indicatorValue || !liquidValue) return;

  // 指示劑
  if (state.currentIndicatorKey) {
    const indicatorData = INDICATOR_DATA[state.currentIndicatorKey];
    indicatorValue.textContent = indicatorData ? indicatorData.name : '未知指示劑';
    indicatorValue.className = 'solution-label-value';
  } else {
    indicatorValue.textContent = '無';
    indicatorValue.className = 'solution-label-empty';
  }

  // 液體
  if (state.currentLiquidName) {
    liquidValue.textContent = state.currentLiquidName;
    liquidValue.className = 'solution-label-value';
  } else {
    liquidValue.textContent = '純水';
    liquidValue.className = 'solution-label-value';
  }
}

// ===== DOM 綁定 =====
document.addEventListener('DOMContentLoaded', () => {
  const testSelect = document.getElementById('testLiquidSelect');
  const testIcon = document.getElementById('testLiquidIcon');
  const phSlider = document.getElementById('ph-slider');
  const diceBtn = document.getElementById('dice-btn');
  const resetBtn = document.getElementById('reset-btn');
  const beakerDropZone = document.getElementById('beaker-drop-zone');

  // 說明彈窗
  const helpOverlay = document.getElementById('ab-help-overlay');
  const helpClose = document.getElementById('ab-help-close');
  const helpClose2 = document.getElementById('ab-help-close-2');
  const helpNextPage = document.getElementById('ab-help-next-page');
  const helpPrevPage = document.getElementById('ab-help-prev-page');
  const helpPage1 = document.querySelector('.ab-help-page-1');
  const helpPage2 = document.querySelector('.ab-help-page-2');

  // 關閉彈窗
  function closeHelpModal() {
    helpOverlay.style.display = 'none';
    // 重置回第一頁
    if (helpPage1 && helpPage2) {
      helpPage1.classList.add('active');
      helpPage2.classList.remove('active');
    }
  }

  if (helpOverlay && helpClose) {
    helpClose.addEventListener('click', closeHelpModal);
    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) closeHelpModal();
    });
  }

  if (helpClose2) {
    helpClose2.addEventListener('click', closeHelpModal);
  }

  // 切換到第二頁（操作示範）
  if (helpNextPage && helpPage1 && helpPage2) {
    helpNextPage.addEventListener('click', () => {
      helpPage1.classList.remove('active');
      helpPage2.classList.add('active');
    });
  }

  // 返回第一頁
  if (helpPrevPage && helpPage1 && helpPage2) {
    helpPrevPage.addEventListener('click', () => {
      helpPage2.classList.remove('active');
      helpPage1.classList.add('active');
    });
  }

  // 🎬 GIF 輪播控制
  const carouselSlides = document.querySelectorAll('.ab-carousel-slide');
  const prevBtn = document.querySelector('.ab-carousel-prev');
  const nextBtn = document.querySelector('.ab-carousel-next');
  let currentSlide = 0;

  function showSlide(index) {
    // 循環處理
    if (index < 0) index = carouselSlides.length - 1;
    if (index >= carouselSlides.length) index = 0;
    currentSlide = index;

    // 更新 slide 顯示
    carouselSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
  }

  // 支援觸控滑動
  const carouselViewport = document.querySelector('.ab-carousel-viewport');
  if (carouselViewport) {
    let touchStartX = 0;
    let touchEndX = 0;

    carouselViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselViewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showSlide(currentSlide + 1); // 往左滑 → 下一張
        } else {
          showSlide(currentSlide - 1); // 往右滑 → 上一張
        }
      }
    }, { passive: true });
  }

  // 右下廣用試紙 scale-Ai
  const bottomScaleObj = document.getElementById('ph-scale-svg');
  if (bottomScaleObj) {
    bottomScaleObj.addEventListener('load', () => {
      state.scaleDoc = bottomScaleObj.contentDocument;
      updateUniversalScale();
    });
  }

  // pot.svg（神秘液體）
  const potObj = document.getElementById('pot-svg');
  if (potObj) {
    potObj.addEventListener('load', () => {
      state.potDoc = potObj.contentDocument;
      setPotColor(state.currentPH);
    });
  }

  // 待測液體：選單 + 拖曳
  if (testSelect && testIcon) {
    testSelect.addEventListener('change', (e) => {
      const name = e.target.value;
      if (!name || !LIQUIDS[name]) {
        // 回到「純水」狀態
        state.currentLiquidName = '純水';
        state.hasLiquidInBeaker = true;
        testIcon.src = 'icons/Q.svg';
        setPHValue(7, 'reset');
        updateSolutionLabel();
        return;
      }
      const meta = LIQUIDS[name];
      state.currentLiquidName = name;
      state.hasLiquidInBeaker = true;
      testIcon.src = `icons/${meta.icon}`;
      setPHValue(meta.ph, 'liquid');
      updateSolutionLabel();
    });

    // 待測液體圖示拖曳
    testIcon.setAttribute('draggable', 'true');
    testIcon.addEventListener('dragstart', (e) => {
      if (!state.currentLiquidName || !LIQUIDS[state.currentLiquidName]) {
        e.preventDefault();
        return;
      }
      const payload = { type: 'liquid', name: state.currentLiquidName };
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'copy';
      testIcon.classList.add('dragging');
      console.log('🧪 開始拖曳液體:', state.currentLiquidName);
    });
    testIcon.addEventListener('dragend', () => {
      testIcon.classList.remove('dragging');
    });
  }

  // ===== 🔧 修正：指示劑卡片拖曳（移除 isTouchDevice 限制） =====
  document.querySelectorAll('.indicator-card').forEach(card => {
    const key = card.dataset.indicatorKey;
    const chip = card.querySelector('.indicator-chip');
    const addBtn = card.querySelector('.indicator-add-btn');

    // 點整張卡片 → 展開/收合
    card.addEventListener('click', (e) => {
      // 如果點的是 chip 或 addBtn，不要觸發展開
      if (e.target.closest('.indicator-chip') || e.target.closest('.indicator-add-btn')) {
        return;
      }

      const isMobileLayout = window.matchMedia('(max-width: 600px)').matches;

      if (isMobileLayout) {
        // 手機版：手風琴效果
        document.querySelectorAll('.indicator-card.expanded').forEach(other => {
          if (other !== card) {
            other.classList.remove('expanded');
          }
        });
      }

      card.classList.toggle('expanded');
    });

    // 💻 桌機雙擊 chip：加入/取消指示劑
    if (chip) {
      chip.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyIndicatorToBeaker(key);
        console.log('🎯 雙擊加入指示劑:', key);
      });

      // ===== 🔧 關鍵修正：拖曳設定 =====
      chip.setAttribute('draggable', 'true');

      chip.addEventListener('dragstart', (e) => {
        // 阻止按鈕的預設行為
        e.stopPropagation();

        const payload = { type: 'indicator', key: key };
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';

        // 設定拖曳時的圖像（可選）
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(chip, 50, 20);
        }

        chip.classList.add('dragging');
        console.log('🧪 開始拖曳指示劑:', key);
      });

      chip.addEventListener('dragend', () => {
        chip.classList.remove('dragging');
        console.log('🧪 結束拖曳');
      });

      // 單擊 chip → 展開/收合
      chip.addEventListener('click', (e) => {
        e.stopPropagation();

        const isMobileLayout = window.matchMedia('(max-width: 600px)').matches;
        if (isMobileLayout) {
          document.querySelectorAll('.indicator-card.expanded').forEach(other => {
            if (other !== card) {
              other.classList.remove('expanded');
            }
          });
        }
        card.classList.toggle('expanded');
      });
    }

    // [+燒杯] 按鈕
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyIndicatorToBeaker(key);
        console.log('➕ 按鈕加入指示劑:', key);
      });
    }

    // 卡片內的 scale-Ai：載入後畫上專屬色帶 + 記錄 doc
    const scaleObj = card.querySelector('.indicator-scale');
    if (scaleObj) {
      scaleObj.addEventListener('load', () => {
        const doc = scaleObj.contentDocument;
        if (doc) {
          configureIndicatorScale(doc, key);
          state.indicatorScaleDocs.push(doc);
          updateScalePointer(doc, state.currentPH);
        }
      });
    }
  });


  // ===== 🔧 修正：燒杯 drop 區 =====
  if (beakerDropZone) {
    beakerDropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      beakerDropZone.classList.add('drag-over');
      console.log('📥 進入燒杯區域');
    });

    beakerDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    beakerDropZone.addEventListener('dragleave', (e) => {
      // 確保是真的離開，不是進入子元素
      if (!beakerDropZone.contains(e.relatedTarget)) {
        beakerDropZone.classList.remove('drag-over');
        console.log('📤 離開燒杯區域');
      }
    });

    beakerDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      beakerDropZone.classList.remove('drag-over');

      let data = null;
      try {
        const rawData = e.dataTransfer.getData('text/plain');
        console.log('📦 收到資料:', rawData);
        data = JSON.parse(rawData || '{}');
      } catch (err) {
        console.error('❌ 解析失敗:', err);
        data = null;
      }

      if (!data || !data.type) {
        console.log('⚠️ 無效資料');
        return;
      }

      if (data.type === 'liquid' && LIQUIDS[data.name]) {
        const meta = LIQUIDS[data.name];
        state.currentLiquidName = data.name;
        state.hasLiquidInBeaker = true;
        setPHValue(meta.ph, 'liquid');
        updateSolutionLabel();
        console.log('✅ 成功加入液體:', data.name);
      } else if (data.type === 'indicator' && INDICATOR_DATA[data.key]) {
        applyIndicatorToBeaker(data.key);
        console.log('✅ 成功加入指示劑:', data.key);
      }
    });
  } else {
    console.error('❌ 找不到 beaker-drop-zone 元素！');
  }

  // pH 滑桿 & 骰子（神秘液體）
  if (phSlider) {
    phSlider.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const valSpan = document.getElementById('ph-slider-value');
      if (valSpan) valSpan.textContent = v.toFixed(1);
    });
    phSlider.addEventListener('change', (e) => {
      const v = parseFloat(e.target.value);
      state.currentLiquidName = `神秘液體 pH ${v.toFixed(1)}`;
      state.hasLiquidInBeaker = true;
      setPHValue(v, 'unknown');
      updateSolutionLabel();
    });
  }
  if (diceBtn) {
    diceBtn.addEventListener('click', () => {
      const rnd = Math.random() * 14;
      state.currentLiquidName = `神秘液體 pH ${rnd.toFixed(1)}`;
      state.hasLiquidInBeaker = true;
      setPHValue(rnd, 'unknown');
      updateSolutionLabel();
    });
  }

  // 重置：回到「純水、pH 7、沒有指示劑」
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.currentPH = 7;
      state.currentIndicatorKey = null;
      state.currentLiquidName = '純水';
      state.hasIndicatorInBeaker = false;
      state.hasLiquidInBeaker = true;

      const select = document.getElementById('testLiquidSelect');
      const icon = document.getElementById('testLiquidIcon');
      const slider = document.getElementById('ph-slider');
      const valSpan = document.getElementById('ph-slider-value');

      if (select) select.value = '';
      if (icon) icon.src = 'icons/Q.svg';
      if (slider) slider.value = '7';
      if (valSpan) valSpan.textContent = '7.0';

      setPHValue(7, 'reset');
      updateSolutionLabel();
      updateIndicatorAddButtons();
    });
  }

  // ✅ 初始狀態：純水、pH 7、沒有指示劑
  const sliderInit = document.getElementById('ph-slider');
  const valSpanInit = document.getElementById('ph-slider-value');
  if (sliderInit) sliderInit.value = '7';
  if (valSpanInit) valSpanInit.textContent = '7.0';

  setPHValue(7, 'reset');
  updateSolutionLabel();
  updateIndicatorAddButtons();

  console.log('✅ acid-base.js 載入完成，拖曳功能已啟用');
});
