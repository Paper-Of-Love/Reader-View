const API_BASE = "http://localhost:4000/api";
const API_ORIGIN = API_BASE.replace(/\/api$/, "");
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function resolveImageUrl(url) {
  if (!url) return url;
  return url.startsWith("/") ? `${API_ORIGIN}${url}` : url;
}

function normalizePost(post) {
  return {
    slug: post.slug,
    title: post.title,
    author: post.byline || post.author,
    date: post.publishedAt,
    image: resolveImageUrl(post.image),
    body: post.body,
  };
}

async function fetchPublishedPosts() {
  try {
    const res = await fetch(`${API_BASE}/posts`);
    if (!res.ok) return [];
    const posts = await res.json();
    return posts.map(normalizePost);
  } catch (e) {
    console.error("Failed to load posts from the server:", e);
    return [];
  }
}

function isPostFromLastWeek(post) {
  const postDate = new Date(post.date);
  const now = new Date();
  const diff = now - postDate;
  return diff >= 0 && diff <= ONE_WEEK_MS;
}

async function getRecentPosts() {
  const posts = await fetchPublishedPosts();
  return posts.filter(isPostFromLastWeek);
}

async function getArchivedPosts() {
  const posts = await fetchPublishedPosts();
  return posts.filter((post) => !isPostFromLastWeek(post));
}

async function loadPost(slug) {
  const posts = await fetchPublishedPosts();
  return posts.find((post) => post.slug === slug) || null;
}
