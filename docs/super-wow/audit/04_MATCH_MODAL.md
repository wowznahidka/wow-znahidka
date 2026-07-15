# AUDIT: js/match.js & js/modal.js

## js/match.js
**Overview:**
Core engine for the "WOW Match" Tinder-style card stack. Manages the UX of discovering sneakers via swiping, including filtering, session management, and "match" results.

**Key Logic:**
- **Session Management:** Cards are processed in sessions of 20. At the end of each session, a results screen is shown.
- **Onboarding Quiz:** A 3-step quiz (gender, size, budget) determines the initial `matchFullPool` filters.
- **Filtering:** `_applyMatchFilters` dynamically filters `S.matchFullPool` based on `S.matchSizeFilter`, `S.matchBudget`, and user-selected filters.
- **Swipe Actions:** `swipeCard` handles 'right' (like) and 'left' (nope). Likes are stored in `_sessionLikes` and added to `S.favs` (permanent).
- **Result Screen:** Shows summary of liked items in the current session with a "Checkout" button that opens the cart sheet.
- **TG Share:** `_matchTgShare` generates a text request for items liked during the session.

**Facts:**
- `MATCH_SESSION_LEN` is hardcoded to 20.
- `_spawnHearts` uses `position: fixed` for visual effects.
- `_matchTgShare` limits the share to the first 10 items.

## js/modal.js
**Overview:**
Handles interactive UI components for product selection, including the size picker, product detail view, and stock notifications.

**Key Logic:**
- **Size Picker:** `openSizePicker` dynamically builds a size grid. It includes logic for "Last Pair" (scarcity) and "Notify Me" for out-of-stock sizes.
- **Auto-Select:** A 80ms timer (`_autoSelectTimer`) tries to auto-select the user's remembered size if it's available in the current product.
- **Product Detail:** `openProductDetail` renders a comprehensive view including a gallery with horizontal scroll, brand chip, price, and "Similar Products".
- **Cart Integration:** `confirmSize` validates the selected size and adds the product to `S.cart` with quantity 1 (or incrementing if exists).
- **Gallery Sync:** `_initGallerySync` uses `requestAnimationFrame` to sync the active thumbnail/dot with the scroll position of the gallery.

**Facts:**
- `pdSelectSize` updates `S.pdSize` and reflects changes in the "Select Size" text.
- `pdMainCta` prevents adding to cart if a size isn't selected (unless it's a "ONE SIZE" product).
- `_pdSimilarHtml` filters similar products by the same brand.
- `_copyText` handles clipboard access for various browser types.

**Observations:**
- The 80ms timer in `openSizePicker` is very short; might be missed on slower devices.
- `_spawnHearts` relies on `fixed` positioning, which could behave unexpectedly in some webviews.
- `pdMainCta` has a manual check for `S.pdSize`, but `confirmSize` also performs validation.
