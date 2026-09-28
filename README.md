# Understand your letter

Mobile-first prototype for Service Design (HSLU). Plain-language guidance for official letters.

**Example case:** Rent increase (simulated detection)

## Simple version (3 files, no build)

Upload the **`site/`** folder to GitHub. It contains everything you need:

```
site/
  index.html
  style.css
  app.js
```

### GitHub Pages setup

1. Copy the 3 files from `site/` to your repository root (or upload only the `site/` folder)
2. GitHub → **Settings → Pages**
3. Source: **Deploy from a branch** → branch `main` → folder **`/ (root)`** or **`/site`**
4. Open: `https://your-username.github.io/your-repo/`

No npm, no build step. Works immediately.

### Local test

Open `site/index.html` in your browser, or:

```bash
cd site
npx serve .
```

## React version (optional, for development)

The `src/` folder contains the React/Vite version for further development.

```bash
npm install
npm run dev
```

## Note

This prototype offers guidance, not legal advice.
