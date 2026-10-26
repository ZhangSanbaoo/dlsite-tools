# DLsite userscripts

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

Both scripts need [Tampermonkey](https://www.tampermonkey.net/). The UI follows the DLsite page language (zh / en / ja).

## DLsite Wishlist: Sort by Discount

Adds a "Sort by discount" bar under the native sort controls on your wishlist page.

- **Enable** fetches every page of the wishlist under your current filters (100 per page; ~40 requests for 4,000 items, a dozen seconds the first time), then verifies discount rate / price / end date via DLsite's product-info API and replaces the native list. Results are cached for 15 minutes; **Refresh** forces a re-fetch.
- Sort: discount (ties broken by lower sale price) / sale price / amount saved / list price.
- **Discount** dropdown lists the discount rates found in this fetch (e.g. `90% OFF (12)`) — pick one to show only those works.
- Scope: all pages / this page only. View: grid / list. Results are paginated (30 / 50 / 100 per page).
- Local filters: on-sale only, keyword (title / circle). Native DLsite filters (folder, category, hide purchased…) still apply because the script fetches your current URL.
- **Hide purchased** (default on) adds DLsite's own "hide purchased" condition; the status line shows how many purchased items were hidden.
- **Clean up purchased** finds purchased works still in your wishlist (by diffing the full list against the unpurchased list) and removes them after a confirmation dialog, using DLsite's own removal endpoint. **Auto clean-up after fetch** does it automatically (off by default, double confirmation to enable).
- **Add to cart** uses the native button when the work is on the current native page, otherwise DLsite's own method, otherwise falls back to opening the work page.
- **Exit** restores the native list. The enabled state is remembered.

## DLsite Cart Savings Planner

Adds a collapsible "Cart savings planner" panel above the cart list.

How it computes — all rules are taken verbatim from DLsite's own cart page code (`PaymentSummary` component and the `Bulkbuy` object):
- One coupon per order; "unlimited use" coupons can be reused across orders.
- **"Specific work / specific circle" coupons apply to only the most expensive eligible item in an order** — that's why several such items bought together get only one discount. They should be bought in separate orders.
- Multi-item coupons discount the sum of eligible items, subject to caps, minimum spend and "N items or more" conditions.
- Bundle ("volume set") discounts depend on how many eligible items are in the same order; the planner never breaks a bundle that's already satisfied.
- Your coupons are read live from `/mypage/coupon/list/ajax`, so the script needs no updates when your coupons change.

A local search finds the cheapest split within "at most N orders" and compares it with "checkout now as one order" (what DLsite recommends by default).

Panel:
- **Split into at most N orders** (default 8). **Include "Buy later"** adds those items to the calculation.
- Each order shows item count, subtotal, **the coupon to pick at checkout**, bundle status and the amount to pay; expand to see each item with its bundle / coupon tags.
- **Keep only this order** moves everything else to "Buy later" (reversible, nothing is deleted). Check out, come back, click **Move all back to cart**, and the panel recomputes for the remainder. When the cart is empty the panel offers the same button.
- "Add a little more to save more" lists bundles / multi-item coupons that are just short of their threshold.
- Each item in the native list gets small tags: red = usable coupons ("single" = applies to the most expensive item only; "N+" = needs N items), purple = bundle status.

Notes: the script only moves items between cart and "Buy later"; it never places orders or deletes anything. Payment-method minimums and point redemption are not modelled. Pick the coupon on the next "Confirm purchase" page as indicated.
