# Colorado Cathedral

A mobile-first blog homepage: a Tinder-style swipeable card carousel for recent
posts, an archive for everything older, and individual post pages. Static
HTML/CSS/JS, no build step, no framework.

## Running it locally

The site fetches JSON at runtime, so it needs to be served over HTTP — opening
`index.html` directly via `file://` will not work (fetch is blocked on the
`file://` origin).

```bash
python3 -m http.server 8420
```

Then open `http://localhost:8420`.

## How pages fit together

| File | Purpose |
|---|---|
| `index.html` / `app.js` | Homepage carousel of recent posts |
| `archive.html` / `archive.js` | List of posts older than a week |
| `post.html` / `post.js` | Single post view |
| `data.js` | Shared data-loading helpers (fetches from `posts/`) |
| `transitions.js` | Page-to-page fade/slide transitions |
| `styles.css` | All styles for every page |

## Adding a post

Posts live in `posts/`, one JSON file per post, plus `posts/index.json` which
lists lightweight metadata (no body text) for the carousel and archive.

1. Add an entry to `posts/index.json`:

   ```json
   {
     "slug": "my-new-post",
     "title": "My New Post",
     "author": "Your Name",
     "date": "2026-09-20",
     "image": "images/my-new-post/hero.jpg",
     "excerpt": "One sentence describing the post."
   }
   ```

2. Create `posts/my-new-post.json` with the same fields plus a `body`:

   ```json
   {
     "slug": "my-new-post",
     "title": "My New Post",
     "author": "Your Name",
     "date": "2026-09-20",
     "image": "images/my-new-post/hero.jpg",
     "excerpt": "One sentence describing the post.",
     "body": "First paragraph.\n\nSecond paragraph."
   }
   ```

`slug` must be unique and match the filename. `date` is `YYYY-MM-DD`.

### Recent vs. archived

A post appears in the homepage carousel if it was published within the last
7 days (computed against the visitor's current system time); otherwise it
shows up in the archive. This is fully dynamic — nothing is hardcoded, so a
post moves from the carousel to the archive on its own once a week has
passed.

### Images

Store a post's own images under `images/<slug>/` and reference them with a
relative path (e.g. `images/my-new-post/hero.jpg`) instead of hotlinking to an
external URL. Both remote URLs and local files work identically, since it's
just an `<img src>` under the hood. JPG, PNG, WebP, and SVG are all fine.

To add an inline image inside the body text (not just the hero image at the
top), put it on its own line surrounded by blank lines, markdown-style:

```
First paragraph.

![Caption text](images/my-new-post/detail.jpg)

More text after the image.
```

### Text formatting

The `body` field supports basic inline styling:

| Syntax | Result |
|---|---|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `__underline__` | underline |
| `~~strikethrough~~` | ~~strikethrough~~ |

Paragraphs are separated by a blank line (`\n\n` in the JSON string).

## Notes

- There's no backend or upload form — adding a post or image means editing
  files directly in this repo.
- `sessionStorage` is used to remember which carousel card you were on and
  which direction you navigated in (for matching page transition animations),
  not for anything that needs to persist across browser sessions.
