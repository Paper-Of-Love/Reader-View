(function () {
  const NAV_DIR_KEY = "pageNavDirection";
  const ENTER_CLASS = { back: "enter-back", up: "enter-up", down: "enter-down" };
  const LEAVE_CLASS = {
    forward: "page-leaving-forward",
    back: "page-leaving-back",
    up: "page-leaving-up",
    down: "page-leaving-down",
  };

  let direction = "forward";
  try {
    direction = sessionStorage.getItem(NAV_DIR_KEY) || "forward";
    sessionStorage.removeItem(NAV_DIR_KEY);
  } catch (e) {}

  const enterClass = ENTER_CLASS[direction];
  if (enterClass) {
    document.body.classList.add(enterClass);
  }

  function reveal() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("page-visible");
        if (enterClass) document.body.classList.remove(enterClass);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reveal);
  } else {
    reveal();
  }

  function navigate(url, navDirection) {
    try {
      sessionStorage.setItem(NAV_DIR_KEY, navDirection);
    } catch (e) {}
    document.body.classList.remove("page-visible");
    document.body.classList.add(LEAVE_CLASS[navDirection] || LEAVE_CLASS.forward);
    setTimeout(() => {
      window.location.href = url;
    }, 180);
  }

  window.pageNavigate = function (url, navDirection) {
    navigate(url, navDirection || "forward");
  };

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      link.target === "_blank"
    ) {
      return;
    }
    e.preventDefault();
    const navDirection =
      link.dataset.navDir || (link.classList.contains("back-button") ? "back" : "forward");
    navigate(href, navDirection);
  });
})();
