(async function () {
  const main = document.getElementById("postMain");
  const backButton = document.getElementById("backButton");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const post = slug ? await loadPost(slug) : null;

  backButton.href = params.get("from") === "archive" ? "archive.html" : "index.html";
  if (params.get("entry") === "up") {
    backButton.dataset.navDir = "down";
  }

  (function setupSwipeBack() {
    const SWIPE_THRESHOLD = 60;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (e) => {
        if (!tracking) return;
        tracking = false;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (dx < -SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          const backHref = backButton.getAttribute("href");
          const target =
            backHref === "index.html" ? "index.html?advance=1" : backHref;
          window.pageNavigate(target, "forward");
        }
      },
      { passive: true }
    );
  })();

  if (!post) {
    main.innerHTML = `
      <p class="post-not-found">That post couldn't be found.</p>
      <a class="archive-button back-button" href="index.html">Back to Home</a>
    `;
    return;
  }

  const IMAGE_LINE = /^!\[(.*?)\]\((.*?)\)$/;

  function formatInline(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/~~(.+?)~~/g, "<s>$1</s>")
      .replace(/__(.+?)__/g, "<u>$1</u>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  const paragraphs = post.body
    .split("\n\n")
    .map((block) => {
      const match = block.trim().match(IMAGE_LINE);
      if (match) {
        const [, alt, src] = match;
        return `
          <figure class="post-inline-image">
            <img src="${src}" alt="${alt}" loading="lazy">
            ${alt ? `<figcaption>${alt}</figcaption>` : ""}
          </figure>
        `;
      }
      return `<p class="post-paragraph">${formatInline(block)}</p>`;
    })
    .join("");

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  main.innerHTML = `
    <div class="post-image-wrap">
      <img class="img-cover" src="${post.image}" alt="${post.title}">
    </div>
    <h1 class="post-title">${post.title}</h1>
    <p class="post-byline">By ${post.author} &middot; ${formattedDate}</p>
    ${paragraphs}
  `;
})();
