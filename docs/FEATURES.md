# Deepcut Enhancer Feature Direction

Deepcut Enhancer starts with the recognizable Turnstyles-style utilities and adds a few opinionated upgrades that make the extension and bookmarklet feel like one polished tool.

## Baseline parity

- Autobop with a per-track cooldown so it does not spam the same button.
- Auto Queue with a configurable chat trigger.
- Next DJ and Escort deck helpers.
- Always-visible volume styling.
- Temporary mute that restores on the next detected track change.
- Desktop and chat keyword notifications. Chrome extension song notifications include Bop and Dislike actions; bookmarklet notifications use the browser's standard notification fallback.
- AFK auto-reply for mentions and idle-to-AFK.
- Quick replies for common chat messages.
- Built-in themes, color style presets, accent color, and custom CSS.
- Visual toggles for audience, video screens, compact chat, and chat timestamps.
- Settings import/export.

## Standout additions

- One shared runtime for Chrome and bookmarklet, so both versions behave the same.
- Local-only settings with export support; no analytics or remote storage.
- Smart action guards that avoid clicking disabled or already-active controls.
- Runtime activity log inside the panel for debugging what the enhancer did.
- Portable DOM heuristics so Deepcut markup changes are easier to adapt to than hard-coded selectors.
- Native Deepcut embedding through the right sidebar tab strip instead of a detached floating widget.
- Modern dark Enhancer panel UI with pill toggles and a floating quick hotbar.
- Turnstyles-plus chat alerts (snag, join, leave) and safer panel containment to avoid page interaction freezes.
- ttTools-inspired vote tracker via deepcut.live room `update_votes` / `votelog` with switch detection.
- Site UI fixes for profile modals (large DJ point counts), about sections, and chat overflow.

## Next high-impact ideas

- Room presets: save per-room theme, queue, notification, and keyword profiles.
- DJ guardrails: warn before leaving the deck, losing audio, or sitting muted while DJing.
- Set recap: local summary of songs played, bops, snags, mentions, and DJ changes.
- Command palette: quick search for enhancer actions without opening the full panel.
- Cloud-free backup: import/export a signed settings bundle users can share.
