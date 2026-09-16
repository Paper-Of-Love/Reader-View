(async function () {
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("dots");
  const carousel = document.getElementById("carousel");

  let current = 0;
  let didDrag = false;
  const recentPosts = await getRecentPosts();
  const total = recentPosts.length + 1;

  recentPosts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-image-wrap">
        <img class="img-cover" src="${post.image}" alt="${post.title}" draggable="false">
      </div>
      <h2 class="card-title">${post.title}</h2>
    `;
    card.addEventListener("click", () => {
      if (didDrag) return;
      window.pageNavigate(`post.html?slug=${encodeURIComponent(post.slug)}&entry=up`, "up");
    });
    track.appendChild(card);
  });

  const endCard = document.createElement("div");
  endCard.className = "card end-card";
  endCard.innerHTML = `
    <p class="end-message">That's all of the recent news.</p>
    <a class="archive-button" href="archive.html">Go to Archive</a>
  `;
  track.appendChild(endCard);

  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dotsWrap.appendChild(dot);
  }
  const dots = Array.from(dotsWrap.children);

  const STORAGE_KEY = "carouselIndex";

  function goTo(index, skipTransition) {
    current = Math.max(0, Math.min(total - 1, index));
    if (skipTransition) track.style.transition = "none";
    track.style.transform = `translateX(-${current * 100}%)`;
    if (skipTransition) track.offsetHeight, (track.style.transition = "");
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    try {
      sessionStorage.setItem(STORAGE_KEY, String(current));
    } catch (e) {}
  }

  function openCurrentPost() {
    if (current >= recentPosts.length) return false;
    const post = recentPosts[current];
    window.pageNavigate(`post.html?slug=${encodeURIComponent(post.slug)}&entry=up`, "up");
    return true;
  }

  function lockAxis(dx, dy) {
    return Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  }

  function applyDragTransform(dx) {
    const percent = (dx / carousel.clientWidth) * 100;
    track.style.transform = `translateX(calc(-${current * 100}% + ${percent}%))`;
  }

  function finishDrag(axis, dx, dy) {
    track.style.transition = "";
    if (axis === "x") {
      const threshold = carousel.clientWidth * 0.2;
      if (dx < -threshold) {
        goTo(current + 1);
      } else if (dx > threshold) {
        goTo(current - 1);
      } else {
        goTo(current);
      }
    } else if (axis === "y") {
      const threshold = carousel.clientHeight * 0.12;
      if (dy < -threshold) {
        if (!openCurrentPost()) goTo(current);
      } else {
        goTo(current);
      }
    } else {
      goTo(current);
    }
  }

  let deltaX = 0;
  let deltaY = 0;

  // Touch swipe
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let lockedAxis = null;

  carousel.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    deltaX = 0;
    deltaY = 0;
    dragging = true;
    lockedAxis = null;
    didDrag = false;
    track.style.transition = "none";
  }, { passive: true });

  carousel.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (lockedAxis === null) {
      lockedAxis = lockAxis(dx, dy);
    }
    if (lockedAxis === "y") {
      deltaY = dy;
      if (Math.abs(deltaY) > 8) didDrag = true;
      return;
    }

    e.preventDefault();
    deltaX = dx;
    if (Math.abs(deltaX) > 8) didDrag = true;
    applyDragTransform(deltaX);
  }, { passive: false });

  carousel.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;
    finishDrag(lockedAxis, deltaX, deltaY);
  });

  // Mouse drag support for desktop testing
  let mouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;
  let mouseAxis = null;

  carousel.addEventListener("mousedown", (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    mouseAxis = null;
    deltaX = 0;
    deltaY = 0;
    didDrag = false;
    track.style.transition = "none";
  });

  window.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;

    if (mouseAxis === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      mouseAxis = lockAxis(dx, dy);
    }
    if (mouseAxis === "y") {
      deltaY = dy;
      if (Math.abs(deltaY) > 8) didDrag = true;
      return;
    }

    deltaX = dx;
    if (Math.abs(deltaX) > 8) didDrag = true;
    applyDragTransform(deltaX);
  });

  window.addEventListener("mouseup", () => {
    if (!mouseDown) return;
    mouseDown = false;
    finishDrag(mouseAxis, deltaX, deltaY);
  });

  // Keyboard arrows for desktop testing
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(current + 1);
    if (e.key === "ArrowLeft") goTo(current - 1);
  });

  let restoredIndex = 0;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved !== null) restoredIndex = parseInt(saved, 10) || 0;
  } catch (e) {}

  const params = new URLSearchParams(window.location.search);
  if (params.get("advance") === "1") {
    restoredIndex += 1;
  }

  goTo(restoredIndex, true);
})();
