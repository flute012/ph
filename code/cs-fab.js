/*!
 * cs-fab-anchor.js — Floating Customer Service FAB (anchor-based, no window.open)
 * v1.3.0 | Opens once via <a target="_blank">, strong style isolation
 */
(() => {
  'use strict';

  const s = document.currentScript;
  const num = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };

  const cfg = {
    link:   s?.dataset.link || 'https://forms.gle/7BfJZGmSrmC9WJPk9',
    img:    s?.dataset.img  || '/index_pic/customer-service.png',
    pos:   (s?.dataset.position || 'right').toLowerCase(), // 'right' | 'left'
    ox:     num(s?.dataset.offsetX, 16),
    oy:     num(s?.dataset.offsetY, 16),
    min:    num(s?.dataset.min, 56),
    max:    num(s?.dataset.max, 64),
    vw:     s?.dataset.vw || '12vw',
    z:      num(s?.dataset.zIndex, 1100)
  };

  // 避免同頁重複插入
  if (document.getElementById('cs-fab')) return;

  // 樣式（隔離／強制）
  const css = `
  #cs-fab{position:fixed!important;display:flex!important;align-items:center!important;z-index:${cfg.z}!important}
  #cs-fab{bottom:calc(env(safe-area-inset-bottom,0px) + ${cfg.oy}px)!important;
          ${cfg.pos==='left' ? 'left' : 'right'}:calc(env(safe-area-inset-${cfg.pos==='left'?'left':'right'},0px) + ${cfg.ox}px)!important}
  #cs-fab .cs-link, #cs-fab .cs-close{all:initial; font-family:inherit; display:inline-block; cursor:pointer}
  #cs-fab .cs-link{
    width:clamp(${cfg.min}px, ${cfg.vw}, ${cfg.max}px)!important;
    height:clamp(${cfg.min}px, ${cfg.vw}, ${cfg.max}px)!important;
    border-radius:50%!important; background:#fff!important; overflow:hidden!important;
    box-shadow:0 6px 20px rgba(0,0,0,.25)!important; -webkit-tap-highlight-color:transparent;
    transition:transform .2s ease, box-shadow .2s ease!important; text-decoration:none!important;
  }
  #cs-fab .cs-link:hover{ transform:translateY(-1px)!important; box-shadow:0 12px 28px rgba(0,0,0,.28)!important }
  #cs-fab .cs-img{all:initial; display:block!important; width:100%!important; height:100%!important; object-fit:contain!important; border-radius:50%!important}
  #cs-fab .cs-close{
    position:absolute!important; right:-6px!important; top:-6px!important;
    width:24px!important; height:24px!important; border-radius:50%!important; border:0!important;
    background:rgba(0,0,0,.55)!important; color:#fff!important; font-size:16px!important; line-height:24px!important; text-align:center!important;
  }
  .cs-hide{transform:translateY(140%)!important; opacity:0!important; pointer-events:none!important; transition:transform .28s ease, opacity .2s ease!important}
  @media (prefers-reduced-motion: reduce){ #cs-fab .cs-link, .cs-hide{transition:none!important} }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // DOM（用 <a> 直接開新分頁，不寫任何 click/touch 事件）
  const box = document.createElement('div');
  box.id = 'cs-fab'; box.setAttribute('role','group'); box.setAttribute('aria-label','客服快捷按鈕');

  const link = document.createElement('a');
  link.className = 'cs-link';
  link.href = cfg.link;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.className = 'cs-img'; img.alt = ''; img.src = cfg.img;

  const close = document.createElement('button');
  close.type = 'button'; close.className = 'cs-close'; close.setAttribute('aria-label','關閉客服按鈕'); close.textContent = '×';

  link.appendChild(img); box.appendChild(link); box.appendChild(close); document.body.appendChild(box);

  // 關閉（本頁隱藏）
  close.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    box.classList.add('cs-hide');
    setTimeout(() => box.remove(), 320);
  });
})();
