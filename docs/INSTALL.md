# Install Deepcut Enhancer

## Chrome extension

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this project folder.
5. Open `https://deepcut.live` and use the Enhancer tab beside Chat.

## Bookmarklet

1. Host `dist/deepcut-enhancer.js` somewhere you control.
2. Run `npm run build:bookmarklet -- https://your-host.example/deepcut-enhancer.js`.
3. Create a browser bookmark and paste the contents of `dist/bookmarklet.txt` as its URL.
4. Open `https://deepcut.live` and click the bookmark.

The bookmarklet loader refuses to run on other hosts.

`dist/bookmarklet-inline.txt` is also generated for quick tests without hosting. Prefer the hosted loader for real use because browser bookmark URL limits vary.
