(function () {
  const header = document.querySelector(".post-header");
  if (!header) return;

  const REVEAL_ZONE = 10;
  const THRESHOLD = 4;
  let lastY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const diff = y - lastY;

      if (y < REVEAL_ZONE) {
        header.classList.remove("header-hidden");
      } else if (diff > THRESHOLD) {
        header.classList.add("header-hidden");
      } else if (diff < -THRESHOLD) {
        header.classList.remove("header-hidden");
      }

      lastY = y;
    },
    { passive: true }
  );
})();
