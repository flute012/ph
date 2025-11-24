// ./code/abneut.js
document.addEventListener('DOMContentLoaded', () => {
  const IMAGE_BASE = './icons/ABNeut/';

  const progressEl = document.getElementById('abneut-progress');
  const imageEl    = document.getElementById('abneut-image');
  const scenarioEl = document.getElementById('abneut-scenario');
  const questionEl = document.getElementById('abneut-question');
  const optionsEl  = document.getElementById('abneut-options');
  const feedbackEl = document.getElementById('abneut-feedback');
  const confirmBtn = document.getElementById('abneut-confirm-btn');

  // 固定選項
  const FIXED_OPTIONS = [
    { value: 'acid', label: '酸性' },
    { value: 'base', label: '鹼性' }
  ];

  let questions = [];
  let currentIndex = 0;
  let answered = false;
  let correctCount = 0;   // 🔹 計算答對題數

  fetch('./code/abneut-q.json')
    .then(res => res.json())
    .then(data => {
      questions = data;
      if (questions.length > 0) {
        showQuestion(0);
      }
    })
    .catch(err => {
      feedbackEl.textContent = '題庫載入失敗，請稍後再試。';
    });

  function showQuestion(index) {
    const q = questions[index];
    currentIndex = index;
    answered = false;

    progressEl.textContent = `第 ${index + 1} / ${questions.length} 題`;

    imageEl.src = IMAGE_BASE + q.image;
    imageEl.alt = '情境圖示';

    scenarioEl.textContent = q.scenario || '';
    questionEl.textContent = q.question || '';

    optionsEl.innerHTML = '';
    FIXED_OPTIONS.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'abneut-option-btn';

      if (opt.value === 'acid') btn.classList.add('abneut-option-btn--acid');
      if (opt.value === 'base') btn.classList.add('abneut-option-btn--base');

      btn.textContent = opt.label;
      btn.dataset.value = opt.value;

      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const isCorrect = opt.value === q.correct;
        if (isCorrect) correctCount++;    // 🔹 答對就累加

        document.querySelectorAll('.abneut-option-btn').forEach(b => {
          b.disabled = true;
          b.classList.toggle('abneut-option-btn--selected', b === btn);
        });

        feedbackEl.textContent =
          (isCorrect ? '✅ 答對了！' : '❌') +
          (q.explanation ? ' ' + q.explanation : '');

        feedbackEl.className = 'abneut-feedback';
        feedbackEl.classList.add(isCorrect ? 'abneut-feedback--correct' : 'abneut-feedback--wrong');

        confirmBtn.disabled = false;

        if (currentIndex >= questions.length - 1) {
          confirmBtn.textContent = '完成 ✔';
        } else {
          confirmBtn.textContent = '下一題 ▶';
        }
      });

      optionsEl.appendChild(btn);
    });

    feedbackEl.textContent = '';
    feedbackEl.className = 'abneut-feedback';
    confirmBtn.disabled = true;
  }

  // [確認]：下一題或顯示總結
  confirmBtn.addEventListener('click', () => {
    if (!questions.length) return;

    // 🔹 最後一題 → 顯示成績總結
    if (currentIndex >= questions.length - 1) {
      showResultSummary();
      return;
    }

    // 下一題
    showQuestion(currentIndex + 1);
  });

  /* 🔹 顯示最後成績 */
  function showResultSummary() {
    const total = questions.length;
    const percent = Math.round((correctCount / total) * 100);

    // 清空整個題卡內容，只保留一個總結畫面
    const card = document.getElementById('abneut-card');
    card.innerHTML = `
      <div class="abneut-summary">
        <h2 class="abneut-summary-title">🎉 完成挑戰！</h2>
        <p class="abneut-summary-score">答對：<strong>${correctCount}</strong> / ${total} 題</p>
        <p class="abneut-summary-percent">正確率：<strong>${percent}%</strong></p>
      </div>
    `;
  }
});
