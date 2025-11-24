// ./code/knowledge.js
document.addEventListener('DOMContentLoaded', () => {
  const progressTextEl = document.getElementById('know-progress-text');
  const progressFillEl = document.getElementById('know-progress-bar-fill');
  const questionTextEl = document.getElementById('know-question-text');
  const optionsEl      = document.getElementById('know-options');
  const feedbackEl     = document.getElementById('know-feedback');
  const nextBtn        = document.getElementById('know-next-btn');
  const cardEl         = document.getElementById('know-card');

  let questions = [];
  let currentIndex = 0;
  let answered = false;
  let correctCount = 0;

  // 讀取題庫 JSON
  fetch('./code/knowledge-questions.json')
    .then(res => res.json())
    .then(data => {
      questions = data;
      if (questions.length > 0) {
        showQuestion(0);
      }
    })
    .catch(err => {
      console.error('載入題庫失敗：', err);
      feedbackEl.textContent = '題庫載入失敗，請稍後再試。';
    });

  function showQuestion(index) {
    const q = questions[index];
    currentIndex = index;
    answered = false;

    // 進度文字與進度條
    const total = questions.length;
    const current = index + 1;
    progressTextEl.textContent = `第 ${current} / ${total} 題`;
    const percent = Math.round((current - 1) / total * 100);
    progressFillEl.style.width = `${percent}%`;

    // 題目文字
    questionTextEl.textContent = q.question || '';

    // 選項按鈕
    optionsEl.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'know-option-btn';
      btn.dataset.optionId = opt.id;

      // 按鈕文字格式：A. 文字
      btn.innerHTML = `
        <span class="know-option-id">${opt.id}.</span>
        <span class="know-option-text">${opt.text}</span>
      `;


      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        handleAnswer(q, opt, btn);
      });

      optionsEl.appendChild(btn);
    });

    // 重置解析 & 按鈕狀態
    feedbackEl.innerHTML = '';
    feedbackEl.className = 'know-feedback';
    nextBtn.disabled = true;
    nextBtn.textContent = (currentIndex >= total - 1) ? '看結果 ▶' : '下一題 ▶';
  }

  function handleAnswer(question, selectedOption, selectedBtn) {
    const correctOption = question.options.find(o => o.isCorrect);
  
    const isCorrect = !!selectedOption.isCorrect;
    if (isCorrect) {
      correctCount++;
    }
  
    // 🔒 鎖住所有按鈕並標色 + 放 O/X
    document.querySelectorAll('.know-option-btn').forEach(btn => {
      btn.disabled = true;
  
      const id = btn.dataset.optionId;
      const mark = document.createElement('div');
      mark.classList.add('know-option-mark');
  
      // 正確選項 → 顯示 O
      if (id === correctOption.id) {
        btn.classList.add('know-option-btn--correct');
        mark.textContent = '⭕';
        mark.classList.add('correct');
      }
  
      // 使用者選錯的選項 → 顯示 X
      if (id === selectedOption.id && !isCorrect) {
        btn.classList.add('know-option-btn--wrong');
        mark.textContent = '✖️';
        mark.classList.add('wrong');
      }
  
      // 若使用者答對 → 只有正確選項有 O
      btn.appendChild(mark);
    });
  
    // 🔹 下方解析<p class="know-feedback-correct-title">答案解析</p>
    let html = '';
    if (isCorrect) {
      html += `<p class="know-feedback-status">⭕ 回答正確！</p>`;
      html += `<p class="know-feedback-correct-explain">${selectedOption.explanation}</p>`;
    } else {
    //   html += `<p class="know-feedback-status">❌ 回答錯誤！</p>`;
      html += `

        <p class="know-feedback-correct-explain">${correctOption.explanation}</p>
      `;
    }
  
    feedbackEl.innerHTML = html;
  
    nextBtn.disabled = false;
  }
  
  

  nextBtn.addEventListener('click', () => {
    if (!questions.length) return;

    if (currentIndex >= questions.length - 1) {
      showSummary();
    } else {
      showQuestion(currentIndex + 1);
    }
  });

  function showSummary() {
    const total = questions.length;
    const percent = Math.round((correctCount / total) * 100);

    cardEl.innerHTML = `
      <div class="know-summary">
        <h2 class="know-summary-title">🎉 完成知識王測驗！</h2>
        <p class="know-summary-score">
          答對題數：<strong>${correctCount}</strong> / ${total} 題
        </p>
        <p class="know-summary-percent">
          正確率：<strong>${percent}%</strong>
        </p>
        <p class="know-summary-tip">
          可以重新整理頁面，再挑戰一次，看看能不能更進步！
        </p>
      </div>
    `;
  }
});
