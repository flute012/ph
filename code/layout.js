/**
 * layout.js - 負責全站共用的導覽列與頁腳渲染
 */

console.log("layout.js (無切換版) 正在載入...");

// 1. 判斷目前的層級，決定路徑前綴
const isPagesDir = window.location.pathname.includes("/pages/");
const basePath = isPagesDir ? "../" : "./";

// 2. 定義導覽列 HTML 模板
const navTemplate = `
<nav class="fixed w-full z-50 transition-all duration-300 py-4 px-6 nav-glass">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <!-- Logo 區塊 -->
    <div class="flex items-center gap-3">
      <img
        src="${basePath}images/logo.png"
        alt="Logo"
        class="h-6 md:h-10 w-auto object-contain"
        onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='flex'"
      />
      <div id="logo-fallback" class="hidden items-center gap-2">
        <div class="w-5 h-5 md:w-8 md:h-8 rounded-full bg-red-600 border-2 border-red-400 shadow-[0_0_10px_rgba(255,0,0,0.5)]"></div>
        <span class="text-lg md:text-2xl font-bold tracking-widest text-lab-cyan">龍騰文化</span>
      </div>
    </div>

    <!-- 選單連結區塊 -->
    <div class="flex items-center gap-6">
      <div class="hidden md:flex gap-8 text-sm tracking-wide font-light text-gray-300" id="nav-links">
        <a href="#" class="hover:text-lab-cyan transition-colors">範例</a>
        <a href="#" class="hover:text-lab-cyan transition-colors">範例</a>
      </div>

      <button class="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm transition-colors text-gray-300 border border-white/10 hover:border-lab-cyan/50 hover:text-lab-cyan group">
        <span class="material-symbols-outlined text-base group-hover:animate-pulse">contact_support</span>
        問題回報
      </button>
    </div>

    <!-- 手機版漢堡選單按鈕 -->
    <button class="md:hidden text-white">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</nav>
`;

// 3. 定義頁腳 HTML 模板
const footerTemplate = `
<footer class="w-full bg-[#05080a] border-t border-gray-800 text-gray-300 py-12 relative z-10">
  <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-8">
    
    <!-- 第一欄：版權資訊 -->
    <div class="flex flex-col gap-6 md:border-r border-gray-800 md:pr-12">
       <div class="mb-2 self-start">
         <img src="${basePath}images/logo_footer_white.svg" alt="龍騰文化" class="footer-logo-dark h-10 md:h-12 w-auto object-contain" />
         <img src="${basePath}images/logo_footer_black.svg" alt="龍騰文化" class="footer-logo-light h-10 md:h-16   w-auto object-contain" />
       </div>

       <div class="space-y-2 text-xs leading-relaxed text-gray-200">
         <p class="font-medium text-gray-200">Longteng Education Co., Ltd. All rights reserved</p>
         <p class="font-medium text-gray-200">版權所有龍騰文化事業股份有限公司</p>
         <p class="mt-2 text-left">
           本網站（含其程式架構、動畫、影音與所有設計）由龍騰文化事業股份有限公司製作，依法享有著作權及相關智慧財產權，受中華民國著作權法及相關法律保護。
         </p>
         <p class="text-left">
           未經本公司書面同意，不得以任何形式重製、修改、散布、公開傳輸、改作、或用於商業用途。違者依法追究。
         </p>
       </div>
    </div>

    <!-- 第二欄：製作團隊 -->
    <div class="flex flex-col md:pl-12 md:border-r border-gray-800">
      <h4 class="text-white font-bold mb-6 text-base tracking-wider">　製作團隊</h4>
      
      <!-- 手機版: grid (雙欄), 桌機版: block (單欄堆疊) -->
      <ul class="grid grid-cols-2 gap-y-2 gap-x-2 md:block md:space-y-3 text-sm">
         <li class="flex items-start gap-2 md:gap-4">
           <span class="text-gray-400 w-[4.5em] shrink-0">企劃統籌</span> 
           <span class="text-gray-200">劉碩儒</span>
         </li>
         <li class="flex items-start gap-2 md:gap-4">
           <span class="text-gray-400 w-[4.5em] shrink-0">數位編輯</span> 
           <span class="text-gray-200">賴姿琳</span>
         </li>
         <li class="flex items-start gap-2 md:gap-4">
           <span class="text-gray-400 w-[4.5em] shrink-0">責任編輯</span> 
           <span class="text-gray-200">陳宣羽</span>
         </li>
         <li class="flex items-start gap-2 md:gap-4">
           <span class="text-gray-400 w-[4.5em] shrink-0">程式開發</span> 
           <span class="text-gray-200">賴姿琳</span>
         </li>
      </ul>
    </div>

    <!-- 第三欄：內容團隊 -->
    <div class="flex flex-col md:pl-12">
       <h4 class="text-white font-bold mb-6 text-base tracking-wider">　內容團隊</h4>
       <ul class="space-y-3 text-sm">
         <li class="flex items-start gap-4">
           <span class="text-gray-400 w-[6em] shrink-0">網站內容作者</span> 
           <span class="text-gray-200">柯紀萱</span>
         </li>
      </ul>
    </div>
  </div>
</footer>
`;

// 4. 渲染函數
function renderLayout(activePageName) {
  // 注入導覽列
  const navRoot = document.getElementById("navbar-root");
  if (navRoot) {
    navRoot.innerHTML = navTemplate;
  } else {
    console.warn("找不到 navbar-root 元素");
  }

  // 注入頁腳
  const footerRoot = document.getElementById("footer-root");
  if (footerRoot) {
    footerRoot.innerHTML = footerTemplate;
  } else {
    console.warn("找不到 footer-root 元素");
  }

  // 處理導覽列高亮 (Active State)
  if (activePageName) {
    const links = document.querySelectorAll("#nav-links a");
    links.forEach((link) => {
      if (link.dataset.page === activePageName) {
        link.classList.add("text-lab-cyan", "font-bold", "border-b", "border-lab-cyan", "pb-1");
        link.classList.remove("hover:text-lab-cyan", "text-gray-300");
      }
    });
  }
}

// 將函式綁定到 window，確保 HTML 可以呼叫
window.renderLayout = renderLayout;