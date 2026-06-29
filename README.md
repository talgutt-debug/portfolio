# Tal Gutman — Portfolio

A static, single-page portfolio. No build step.

## Run locally
```bash
python3 -m http.server 8765
# then open http://localhost:8765/index.html
```

## Structure
- `index.html` — the page
- `styles.css` — editorial/typographic styles
- `main.js` — nav highlight, image lightbox, video facade, Studio prompt modal, mailto form
- `assets/img/` — campaign imagery (Boring Agents, Maestro, Jiminy)
- `studio/` — The Studio room system prompts (Markdown)

## Deploy (GitHub Pages)
Served from the `main` branch root. Live at:
`https://<user>.github.io/<repo>/`
