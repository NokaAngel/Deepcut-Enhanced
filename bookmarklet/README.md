# Deepcut Enhancer Bookmarklet

The bookmarklet runs the same injected app as the Chrome extension. Host `src/deepcut-enhancer.js` somewhere you control, then create a bookmark whose URL is the generated line in `dist/bookmarklet.txt`.

Build it with:

```sh
npm run build:bookmarklet -- https://your-domain.example/deepcut-enhancer.js
```

For local testing, paste the contents of `src/deepcut-enhancer.js` into the browser console on `https://deepcut.live`.

The build also writes `dist/bookmarklet-inline.txt`. That file does not require hosting, but it may be too long for some browsers' bookmark URL limits.
