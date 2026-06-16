# Deepcut Enhancer

Deepcut Enhancer is a Chrome extension and bookmarklet for `deepcut.live`. It is inspired by the utility shape of turnStyles, but the code here is its own shared runtime built around portability, local-only settings, and safer automation.

## Features

- Autobop with cooldown protection, random delay, and skip-while-DJ guard.
- Auto Queue with a configurable mention trigger (chat-only, no polling spam).
- Next DJ, which tries to take the next open deck and then disables itself.
- Escort, which leaves the deck after your current song changes.
- Always-visible volume controls.
- Temporary mute until the next detected track.
- Desktop notifications for songs and keyword matches. Extension song notifications include Bop and Dislike actions.
- Chat event alerts for snags, joins, and leaves.
- AFK auto-reply for mentions, plus idle-to-AFK.
- Quick reply buttons for common chat lines.
- Floating quick hotbar for one-click toggles.
- ttTools-style vote tracker: see who bopped or lamed, including bop→lame switches.
- Site UI fixes for profile stats clipping, lobby long room names, buddy list, and chat/layout polish.
- Built-in themes, Turnstyles-inspired color presets, accent color, and custom CSS.
- Visual toggles for audience, video screens, compact chat, and chat timestamps.
- Settings import and export.
- One Enhancer sidebar tab (gold record icon next to Chat) shared by the Chrome extension and bookmarklet.

## Project Layout

- `manifest.json` - Chrome extension manifest.
- `src/deepcut-enhancer.js` - Shared injected runtime for extension and bookmarklet.
- `src/popup.html` - Extension popup controls.
- `bookmarklet/loader.template.js` - Bookmarklet loader template.
- `scripts/build-bookmarklet.mjs` - Copies the shared runtime and generates hosted and inline bookmarklet files.
- `docs/FEATURES.md` - Feature parity and standout roadmap.
- `docs/INSTALL.md` - Extension and bookmarklet install steps.
- `docs/DEEPCUT_DOM.md` - Live Deepcut markup and selector map.
- `docs/TURNSTYLES_NOTES.md` - Reference notes for Turnstyles-inspired behavior.

## Development

```sh
npm run check
npm run build:bookmarklet -- https://your-host.example/deepcut-enhancer.js
```

Load the project folder as an unpacked extension in Chrome, then open `https://deepcut.live` and click the gold record icon in the header or the **Enhancer** tab beside Chat.

## Privacy

Settings are stored in browser local storage on `deepcut.live`. The current runtime does not send analytics, call third-party APIs, or store settings remotely.
