# Weather Vision — Deploy Source
This directory is auto-generated from `../dist/` and is published via GitHub Pages (`main /docs`).

**Live URL:** https://iceferryling.github.io/weather-vision/
**Source repo:** https://github.com/IceFerryLing/weather-vision

To re-publish after modifying `src/`:

```bash
npm run build
rm -rf docs && cp -R dist docs && touch docs/.nojekyll
git add docs && git commit -m "deploy: publish" && git push
```
