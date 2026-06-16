# Turnstyles Reference Notes

Deepcut Enhancer uses Turnstyles as product/architecture reference material, not as copied source.

Useful patterns adopted in our own implementation:

- Defaults plus option lists from `config/configs.json`.
- Theme and style as separate concepts from `plugin/themes.js` and `styles/*.sass`.
- Delayed/guarded autobop behavior from `plugin/autobop.js`.
- One-song mute and visible volume ideas from `plugin/volume.js`.
- AFK and idle-away behavior from `plugin/away.js`.
- Chat timestamps and quick text concepts from `plugin/chat.js`.
- Next-DJ and escort concepts from `plugin/ondeck.js`.
- Settings import/export/reset from `config/control.js`.
- Body-class visual toggles from `plugin/visual.js`.

Deepcut-specific differences:

- The UI embeds into Deepcut's right sidebar tab strip with internal section tabs (Now, Votes, Auto, Chat, Look, Tools).
- Settings remain local to `deepcut.live` and can be exported/imported as JSON.
- Style presets are generated from local tokens and CSS variables so the bookmarklet and extension share one runtime.
- Automation uses conservative visible-DOM guards so hidden Deepcut controls are not clicked.
