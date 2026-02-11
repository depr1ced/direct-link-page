document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".card");

  /* ===== Автоцентрирование если мало контента ===== */
  function checkHeight() {
    if (card.scrollHeight <= window.innerHeight) {
      card.classList.add("center");
    } else {
      card.classList.remove("center");
    }
  }

  checkHeight();
  window.addEventListener("resize", checkHeight);

  /* ===== HAPTIC TAP ===== */
  const clickableElements = document.querySelectorAll("a");

  clickableElements.forEach(el => {
    el.addEventListener("click", () => {
      if (navigator.vibrate) {
        navigator.vibrate(10); // лёгкий тап 10ms
      }
    });
  });
});