// acid-base.js - 整合版

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
  1:'#ee2d22', 2:'#f54b41', 3:'#fb6222', 4:'#ffd10a',
  5:'#ffe600', 6:'#75cc20', 7:'#3fa142', 8:'#0ee479',
  9:'#48c2f9', 10:'#0086d4', 11:'#0755aa', 12:'#4904d0',
  13:'#7809a4', 14:'#3e0576'
};

// 待測液體：pH + icon
const LIQUIDS = {
  '檸檬汁': { ph: 2.5, icon: 'lemon.svg' },
  '可樂':   { ph: 3,   icon: 'cola.svg' },
  '啤酒':   { ph: 4.5, icon: 'beer.svg' },
  '咖啡':   { ph: 5,   icon: 'coffee.svg' },
  '牛奶':   { ph: 6.5, icon: 'milk.svg' },
  '純水':   { ph: 7,   icon: 'water.svg' },
  '沐浴乳': { ph: 6,   icon: 'bodyWash.svg' },
  '肥皂水': { ph: 9,   icon: 'soap.svg' },
  '洗衣精': { ph: 9.5, icon: 'detergent.svg' },
  '漂白水': { ph: 11,  icon: 'bleach.svg' },
  '通樂':   { ph: 13,  icon: 'drainClean.svg' }
};

// 7 個指示劑資料
const INDICATOR_DATA = {
  thymolBlue: {
    name: '瑞香草酚藍',
    ranges: [
      {type:'gradient', from:1.2, to:2.9, colors:['#ee2d22','#fb6222'], note:'酸段變色'},
      {type:'solid',    from:3,   to:8.1,   color:'#ffd10a',             note:'中性：黃'},
      {type:'gradient', from:8.2, to:9.7, colors:['#ffd10a','#4ebe7b','#48c2f9'], note:'鹼段變色'},
      {type:'solid',    from:9.7, to:14,  color:'#48c2f9'}
    ]
  },
  bromothymolBlue: {
    name: '溴瑞香草酚藍',
    ranges: [
      {type:'solid',    from:1, to:5.9, color:'#ffd10a', note:'酸～弱酸：黃'},
      {type:'gradient', from:6, to:7.5, colors:['#ffd10a','#4ebe7b','#48c2f9'], note:'黃綠→綠→青藍'},
      {type:'solid',    from:7.6, to:14, color:'#48c2f9', note:'中性偏鹼：藍'}
    ]
  },
  methylOrange: {
    name: '甲基橙',
    ranges: [
      {type:'solid',    from:1, to:3.1, color:'#fb6222', note:'酸：橘紅'},
      {type:'gradient', from:3.2, to:4.4, colors:['#fb6222','#ffe600'], note:'橘紅→黃'},
      {type:'solid',    from:4.4, to:14, color:'#ffe600', note:'中性以上：黃'}
    ]
  },
  methylRed: {
    name: '甲基紅',
    ranges: [
      {type:'solid',    from:1, to:4.7, color:'#fb6222', note:'酸：紅橙'},
      {type:'gradient', from:4.8, to:6.0, colors:['#ffd10a','#ffe600','#75cc20'], note:'黃→黃綠'},
      {type:'solid',    from:6.0, to:14, color:'#75cc20', note:'中性以上：黃綠'}
    ]
  },
  phenolphthalein: {
    name: '酚酞',
    ranges: [
      {type:'solid',    from:1, to:8.1, color:'#ffffff', note:'無色'},
      {type:'gradient', from:8.2, to:10.0, colors:['#f3a6c9','#e988b2','#dd6da1'], note:'淡粉→粉紅'},
      {type:'solid',    from:10.0, to:14, color:'#dd6da1', note:'鹼：粉紅'}
    ]
  },
  redCabbage: {
    name: '紫甘藍汁',
    ranges: [
      {type:'solid',    from:1, to:2, color:'#ee2d22', note:'紅'},
      {type:'gradient', from:3, to:4, colors:['#fb6222','#ffd10a'], note:'橘紅→黃'},
      {type:'gradient', from:5, to:6, colors:['#ffd10a','#3fa142'], note:'黃→綠'},
      {type:'gradient', from:7, to:8, colors:['#0ee479','#0086d4'], note:'青綠→青藍'},
      {type:'solid',    from:9, to:10, color:'#4904d0', note:'紫藍'},
      {type:'solid',    from:11, to:12, color:'#7809a4', note:'紫'},
      {type:'solid',    from:13, to:14, color:'#3e0576', note:'深紫'}
    ]
  },
  butterflyPea: {
    name: '蝶豆花',
    ranges: [
      {type:'solid',    from:1, to:1.9, color:'#fb6222', note:'橘紅（強酸）'},
      {type:'gradient', from:2, to:4, colors:['#fb6222','#ff8ad6'], note:'→粉紅紫'},
      {type:'solid',    from:5, to:6, color:'#4904d0', note:'藍紫'},
      {type:'solid',    from:7, to:8, color:'#3e0576', note:'深紫（中性）'},
      {type:'solid',    from:9, to:10, color:'#0086d4', note:'藍（弱鹼）'},
      {type:'solid',    from:11, to:12, color:'#0ee479', note:'藍綠（鹼）'},
      {type:'solid',    from:13, to:14, color:'#3fa142', note:'綠藍'}
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
      btn.textContent = '✔️ 已在燒杯';
      btn.classList.add('indicator-add-btn--active');
    } else {
      // 沒有被選中
      btn.textContent = '➕ 燒杯';
      btn.classList.remove('indicator-add-btn--active');
    }
  });
}


// ===== 顏色小工具 =====
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
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
       UNIVERSAL_PAPER_COLORS[Math.round(r.to)]   || '#bbb'];

  const tNorm = (p - r.from) / (r.to - r.from || 1);
  const t = Math.max(0, Math.min(1, tNorm));
  const segCount  = colors.length - 1;
  const segIndex  = Math.min(segCount - 1, Math.floor(t * segCount));
  const localT    = (t * segCount) - segIndex;
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
  const t      = pClamp / 14;          // 0 → 最左，14 → 最右
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
  
  // ⭐ 只有來自未知溶液時才更新 pot 和滑桿
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

// ===== 右側燒杯顏色：液體 + 指示劑混色邏輯 =====
function updateBeakerLiquidColor() {
  const root = document.getElementById('beaker-svg-root');
  if (!root) return;

  let mainColor;

  // 有指示劑 → 依指示劑顏色

  if (state.currentIndicatorKey) {
    mainColor = getIndicatorColorAtPH(state.currentIndicatorKey, state.currentPH);
    if (!mainColor) {
      mainColor = getUniversalColor(state.currentPH);
    }
  } else {
    // 沒指示劑 → 通用試紙色
    mainColor = getUniversalColor(state.currentPH);
  }

  const isPureWater = state.currentLiquidName === '純水';
  const noIndicator = !state.currentIndicatorKey;
  let light, dark;

  // ⭐ 純水 + 沒有指示劑 → 白色透明水
  if (isPureWater && noIndicator) {
    mainColor = 'rgba(255,255,255,0.7)';
    light     = 'rgba(255,255,255,0.85)';
    dark      = 'rgba(230,230,230,0.45)';
  } else {
    light = adjustLightness(mainColor, 30);
    dark  = adjustLightness(mainColor, -25);
  }

  const liquid = root.querySelector('#liquid');
  const shadow = root.querySelector('#Liquid_Shadow');
  const bright = root.querySelector('#Liquid_bright_part');
  const phText = root.querySelector('#phText');

  if (liquid) liquid.style.fill = mainColor;
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

// ===== pot 顏色（未知溶液的小燒杯） =====
function setPotColor(pH) {
  if (!state.potDoc) return;
  const main  = getUniversalColor(pH);
  const light = adjustLightness(main, 30);
  const liquid    = state.potDoc.getElementById('pot_liquid');
  const highlight = state.potDoc.getElementById('pot_liquid_light');
  if (liquid)    liquid.style.fill = main;
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
    const toOffset   = (r.to   / 14) * 100;

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
           UNIVERSAL_PAPER_COLORS[Math.round(r.to)]   || '#bbb'];

      const segCount = colors.length - 1;
      colors.forEach((c, idx) => {
        const t  = idx / segCount;
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
  const testIcon   = document.getElementById('testLiquidIcon');
  const phSlider   = document.getElementById('ph-slider');
  const diceBtn    = document.getElementById('dice-btn');
  const resetBtn   = document.getElementById('reset-btn');
  const beakerDropZone = document.getElementById('beaker-drop-zone');

  // 說明彈窗
  const helpOverlay = document.getElementById('ab-help-overlay');
  const helpClose   = document.getElementById('ab-help-close');
  if (helpOverlay && helpClose) {
    helpClose.addEventListener('click', () => {
      helpOverlay.style.display = 'none';
    });
    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) helpOverlay.style.display = 'none';
    });
  }

  // 右下廣用試紙 scale-Ai
  const bottomScaleObj = document.getElementById('ph-scale-svg');
  if (bottomScaleObj) {
    bottomScaleObj.addEventListener('load', () => {
      state.scaleDoc = bottomScaleObj.contentDocument;
      updateUniversalScale();
    });
  }

  // pot.svg（未知溶液）
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
        state.currentLiquidName   = '純水';
        state.hasLiquidInBeaker   = true;
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

    testIcon.addEventListener('dragstart', (e) => {
      if (!state.currentLiquidName || !LIQUIDS[state.currentLiquidName]) {
        e.preventDefault();
        return;
      }
      const payload = { type: 'liquid', name: state.currentLiquidName };
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'copy';
    });
  }
  // 指示劑卡：展開、雙擊 / 手機 double tap、拖曳、scale-Ai 設色
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  document.querySelectorAll('.indicator-card').forEach(card => {
    const key  = card.dataset.indicatorKey;
    const chip = card.querySelector('.indicator-chip');
    const addBtn = card.querySelector('.indicator-add-btn'); // 如果有 +燒杯，可以綁這裡
    let lastTapTime = 0;

    // 點整張卡
    card.addEventListener('click', (e) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;
      lastTapTime = now;

      // 📱 手機 / 平板：短時間連點兩下 → 當成「把指示劑加到燒杯 / 取消」
      if (isTouchDevice && timeSinceLastTap < 400) {
        e.preventDefault();
        applyIndicatorToBeaker(key);  // 這裡用你前面定義好的 toggle 函式
        return;
      }

      // 🔽 到這裡是「單擊」：只管展開 / 收合說明

      const isMobileLayout = window.matchMedia('(max-width: 768px)').matches;

      if (isMobileLayout) {
        // ⭐ 手機版：先把其他卡片收起來，做成手風琴
        document.querySelectorAll('.indicator-card.expanded').forEach(other => {
          if (other !== card) {
            other.classList.remove('expanded');
          }
        });
      }

      // 自己的展開 / 收合
      card.classList.toggle('expanded');
    });

    // 💻 桌機雙擊：也視為加入 / 取消指示劑
    card.addEventListener('dblclick', (e) => {
      e.preventDefault();
      applyIndicatorToBeaker(key);
    });

    // 💻 桌機拖曳（手機不啟用，避免跟捲動打架）
    if (chip && !isTouchDevice) {
      chip.setAttribute('draggable', 'true');
      chip.addEventListener('dragstart', (e) => {
        const payload = { type: 'indicator', key };
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
      });
    }

    // 如果你有做 [+燒杯] 按鈕，就讓它也呼叫 applyIndicatorToBeaker
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();     // 避免同時觸發展開/收合
        applyIndicatorToBeaker(key);
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


  // 燒杯 drop 區：接受液體或指示劑
  if (beakerDropZone) {
    beakerDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      beakerDropZone.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'copy';
    });
    beakerDropZone.addEventListener('dragleave', () => {
      beakerDropZone.classList.remove('drag-over');
    });
    beakerDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      beakerDropZone.classList.remove('drag-over');
      let data = null;
      try {
        data = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
      } catch { data = null; }
      if (!data) return;

      if (data.type === 'liquid' && LIQUIDS[data.name]) {
        const meta = LIQUIDS[data.name];
        state.currentLiquidName   = data.name;
        state.hasLiquidInBeaker   = true;
        setPHValue(meta.ph, 'liquid');
        updateSolutionLabel();
      } else if (data.type === 'indicator' && INDICATOR_DATA[data.key]) {
        applyIndicatorToBeaker(data.key);
      }

    });
  }

  // pH 滑桿 & 骰子（未知溶液）
  if (phSlider) {
    phSlider.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const valSpan = document.getElementById('ph-slider-value');
      if (valSpan) valSpan.textContent = v.toFixed(1);
    });
    phSlider.addEventListener('change', (e) => {
      const v = parseFloat(e.target.value);
      state.currentLiquidName   = `未知溶液 pH ${v.toFixed(1)}`;
      state.hasLiquidInBeaker   = true;
      setPHValue(v, 'unknown');
      updateSolutionLabel();
    });
  }
  if (diceBtn) {
    diceBtn.addEventListener('click', () => {
      const rnd = Math.random() * 14;
      state.currentLiquidName   = `未知溶液 pH ${rnd.toFixed(1)}`;
      state.hasLiquidInBeaker   = true;
      setPHValue(rnd, 'unknown');
      updateSolutionLabel();
    });
  }

  // 重置：回到「純水、pH 7、沒有指示劑」
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.currentPH = 7;
      state.currentIndicatorKey = null;
      state.currentLiquidName   = '純水';
      state.hasIndicatorInBeaker = false;
      state.hasLiquidInBeaker    = true;

      const select = document.getElementById('testLiquidSelect');
      const icon   = document.getElementById('testLiquidIcon');
      const slider = document.getElementById('ph-slider');
      const valSpan = document.getElementById('ph-slider-value');

      if (select) select.value = '';
      if (icon)   icon.src = 'icons/Q.svg';
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

  setPHValue(7,'reset');
  updateSolutionLabel();
  updateIndicatorAddButtons();
});
