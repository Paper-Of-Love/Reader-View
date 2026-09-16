const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isPostFromLastWeek(post) {
  const postDate = new Date(post.date + "T00:00:00");
  const now = new Date();
  const diff = now - postDate;
  return diff >= 0 && diff <= ONE_WEEK_MS;
}

async function loadPostsIndex() {
  const res = await fetch("posts/index.json");
  return res.json();
}

async function loadPost(slug) {
  const res = await fetch(`posts/${encodeURIComponent(slug)}.json`);
  if (!res.ok) return null;
  return res.json();
}

async function getRecentPosts() {
  const posts = await loadPostsIndex();
  return posts.filter(isPostFromLastWeek);
}

async function getArchivedPosts() {
  const posts = await loadPostsIndex();
  return posts.filter((post) => !isPostFromLastWeek(post));
}
