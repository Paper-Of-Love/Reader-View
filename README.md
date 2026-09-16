# Colorado Cathedral

A mobile-first blog homepage: a Tinder-style swipeable card carousel for recent
posts, an archive for everything older, and individual post pages. Static
HTML/CSS/JS, no build step, no framework — but it's no longer standalone: it
reads its posts live from the Backend Server.

## Running it locally

This site needs the **Backend Server** running (see `../Backend Server/README.md`)
— it has no local fallback data anymore. Start that first, then serve this
folder over HTTP (opening `index.html` directly via `file://` won't work,
since `fetch` is blocked on the `file://` origin):

```bash
python3 -m http.server 8420
```

Then open `http://localhost:8420`. `data.js` points at
`http://localhost:4000/api` by default — change `API_BASE` there if the
backend runs elsewhere. Make sure that backend's `.env` `ALLOWED_ORIGINS`
includes `http://localhost:8420`.

## How pages fit together

| File | Purpose |
|---|---|
| `index.html` / `app.js` | Homepage carousel of recent posts |
| `archive.html` / `archive.js` | List of posts older than a week |
| `post.html` / `post.js` | Single post view |
| `data.js` | Fetches published posts from the Backend Server's public API |
| `transitions.js` | Page-to-page fade/slide transitions |
| `scroll-header.js` | Auto-hides the post/archive header on scroll-down, reveals on scroll-up |
| `styles.css` | All styles for every page |

## Interactions

- **Swipe left/right** on the homepage carousel to move between recent posts.
- **Swipe up** on a carousel card to open that post (slides up; the post's
  back button then slides back down to return).
- **Swipe left** anywhere on a post page to go back, same as tapping the back
  arrow.
- **Scroll down** on a post or archive page to hide the header; scroll up (or
  reach the top) to bring it back.
- On screens 560px or wider (e.g. a laptop), the whole app scales down to a
  fixed phone-width column centered on the page, instead of stretching to
  fill the browser width.

## Where posts come from

There's no local post data or admin UI here anymore — this is a read-only
public view. Posts are written in the **Typewriter** app and go live once an
editor publishes them in the **Editor Controller**; this site just fetches
whatever is currently published from `GET /api/posts` on the backend and
renders it. See those two apps' READMEs for how content actually gets created.

`data.js` maps the backend's fields to what these pages expect:

- `byline` (falling back to `author`) → displayed as the post's author.
- `publishedAt` → the date used both for display and for the recent/archived
  split.
- An `image` path that starts with `/` (an upload, e.g. `/uploads/xyz.jpg`) is
  resolved against the backend's own origin, since uploaded files are served
  by the backend, not this site.

### Recent vs. archived

A post appears in the homepage carousel if it was published within the last
7 days (computed against the visitor's current system time, using the
backend's `publishedAt` timestamp); otherwise it shows up in the archive.
This is fully dynamic — nothing is hardcoded, so a post moves from the
carousel to the archive on its own once a week has passed.

### Text formatting

Post bodies support basic inline styling, written by the Typewriter and
rendered here:

| Syntax | Result |
|---|---|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `__underline__` | underline |
| `~~strikethrough~~` | ~~strikethrough~~ |
| `![caption](image url)` on its own line | an inline image with caption |

## Notes

- `sessionStorage` is used to remember which carousel card you were on and
  which direction you navigated in (for matching page transition animations),
  not for anything that needs to persist across browser sessions.
- If the backend is unreachable, `data.js` fails soft: the carousel and
  archive just render empty rather than throwing, and a post page shows its
  "couldn't be found" state.
