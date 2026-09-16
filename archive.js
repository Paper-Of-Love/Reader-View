(async function () {
  const main = document.getElementById("archiveMain");

  const archivedPosts = await getArchivedPosts();
  const items = archivedPosts.map((post) => {
    const formattedDate = new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return `
      <a class="archive-item" href="post.html?slug=${encodeURIComponent(post.slug)}&from=archive">
        <div class="archive-item-thumb">
          <img src="${post.image}" alt="${post.title}">
        </div>
        <div class="archive-item-text">
          <h2 class="archive-item-title">${post.title}</h2>
          <p class="archive-item-byline">By ${post.author} &middot; ${formattedDate}</p>
        </div>
      </a>
    `;
  }).join("");

  main.innerHTML = items;
})();
