const { createApp, ref, onMounted, watch, nextTick } = Vue;

createApp({
  setup() {
    const showModal = ref(true);

    const closeModal = () => { showModal.value = false; };

    // 初始渲染與自動關閉設定
    onMounted(() => {
      // 初始 typeset LaTeX
      if (window.MathJax) nextTick(() => window.MathJax.typeset());
      // 自動關閉 Modal
      setTimeout(() => { showModal.value = false; }, 30000);
    });

    // 當 Modal 重新打開時重新渲染 LaTeX
    watch(showModal, (val) => {
      if (val && window.MathJax) nextTick(() => window.MathJax.typeset());
    });

    return { showModal, closeModal };
  }
}).mount('#app');
