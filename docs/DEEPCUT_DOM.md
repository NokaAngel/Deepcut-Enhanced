# Deepcut.live DOM Map

Reference map for Deepcut Enhancer selectors, based on the live room markup and compiled CSS (`room.css`, `room-views.css`).

## Chrome / sidebars

- `.chrome` — top header + left/right tabbed panels
- `ul.tabbed-panel.left-panel` — Queue + Room tabs
- `ul.tabbed-panel.right-panel` — Chat tab; Enhancer injects here as a second tab
- `.tabbed-panel-tab.selected > .tab-pane` — visible sidebar content
- `.header-buttons .settings-dropdown` — settings menu with built-in volume slider

## Room / playback

- `#turntable` — Deepcut stage viewport root (legacy DOM id on deepcut.live)
- `.room-renderer.mouse-map` — interaction layer (do not overlay)
- `.mini-room-view` — compact always-visible songboard under the room
- `.awesome-button` / `.lame-button` — vote controls (`selected` = already voted)
- `.songboard-artist.songboard-main` / `.songboard-song.songboard-main` — now playing
- `.mini-room-current-dj-name` — current DJ display name
- `.mini-djs .become-dj-btn` — “Play Music” deck join control (hidden when no open spot)
- `window.turntable` — Deepcut room message bus on deepcut.live (`addEventListener("message", …)`)
- `window.turntablePlayer` / `window.util.getSetting("volume")` — Deepcut player volume API

## Chat

- `.chat .messages` — message feed (`MutationObserver` target)
- `.chat .messages .message` — one chat line
- `.message .subject` — speaker name
- `.message .text` — message body
- `#chat-form` + `#chat-input.message-input` — chat compose area
- Song system line format: `PEAK started playing "Bad (Official Music Video)" by Christopher`

## User identity

- `.chrome a.profile-link` — logged-in username in settings menu

## Profile modal fixes (Site UI Fixes)

Deepcut's compiled CSS (`room.css`) pins profile stats to `width: 25%` with `overflow-x: hidden`, and uses `font-size: 32px` on `.stat-number` — both clip large DJ point totals.

```css
.joined, .points, .fans, .fanofs { width: 25%; overflow-x: hidden; }
.stat-number { font-size: 32px; font-weight: bold; }
```

The enhancer overrides this with a responsive grid and `clamp()` font sizing.

## Lobby & room list fixes

```css
.roomListItem .roomListItemContent { overflow: hidden; }
.room-list .roomTheme { max-width: 300px; overflow: hidden; }
.room-list .roomName { display: inline; }
.buddyListRoom .buddyRoomName { float: left; }
```

Long names like `⚒️Metalcore/Deathcore/Slam/Nintendocore⚒️` now wrap instead of being clipped.

Target elements:

- `.room-list .roomName`, `.roomTheme`, `.roomListItemContent`
- `.buddyListRoom .buddyRoomName`
- `#myInfo .myName`, `.myStats`
- `.modal.profile` / `.content-container` profile stats


| turnStyles hook | Deepcut Enhancer equivalent |
| --- | --- |
| `.awesome-button` click | `clickControl(findAwesomeButton())` |
| `.become-dj` / `becomeDj()` | `.become-dj-btn` with retry |
| `.chat .messages .message` | same |
| `newsong` event | songboard polling + chat `started playing` parse |
| `speak` event | chat `MutationObserver` |
| `update_votes` / `votelog` | vote tracker panel + optional People Here highlights |
| `room.vote` via `ttObjects.api` | autobop/autolame + manual Bop/Lame buttons (ttTools-style) |
| `window.turntablePlayer.setVolume` | header volume + temp mute |
