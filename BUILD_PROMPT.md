# Borderless: merged build prompt

Paste everything below the line into Claude Code (or a design tool).

---

Design and build **Borderless**, an intelligent global shopping website. Tagline: **"Everything you desire. Anywhere in the world."** Sub-line: **"Shop the world, in English."**

Borderless unifies international marketplaces in one place. A shopper searches in English and sees the true price to their door, an honest verdict on whether a listing looks risky, translated seller chat, and a safe way to pay. Taobao is the hero story; the other stores are shown in search.

This is for the DubHacks 2026 **Visa "Reimagine Shopping"** track (plus one side track). All code is written during the event. It is a **website** (not a phone app), because Devpost needs a link.

Judging rubric: Innovation 25%, User Experience 25%, Technical Execution 20%, Commerce Impact 15%, Trust and Responsibility 15%. Usability always beats aesthetics.

## 1. Visual direction

A luxury digital magazine, not a typical store. Minimalist, architectural, editorial.

- Background: warm ivory `#F7F5F0`
- Text: near-black `#1C1C1C`
- Accent: deep forest green `#234C3B`
- Secondary: muted gold `#C3A77A`
- Type: an elegant serif for headlines (for example Fraunces or Cormorant Garamond) with a clean sans-serif for body text (for example DM Sans). Keep a clear type scale.
- Generous whitespace, architectural grid layouts, minimal navigation.
- Large editorial photography. Use free-licence photos or neutral placeholders, never scraped store images.
- Refined motion: subtle hover lifts, smooth image transitions, elegant skeleton loading states, animated search suggestions, polished modal windows. Respect `prefers-reduced-motion`.
- Light mode is primary. Add a considered dark variant (deep green-black, ivory text, same gold).
- Touch targets at least 44px, visible keyboard focus, readable contrast, responsive down to phone width.
- No emoji. No real brand logos: use flags plus a neutral monogram tile for each store.

## 2. Stack

React, TypeScript, Tailwind CSS, Framer Motion. A small Node (Express) backend for the API and LLM calls. Realistic demo data in local JSON, clearly labelled as sample data. The Anthropic API key goes in `.env` and is never committed.

## 3. Hero

Headline and sub-line as above. Under them, an elegant conversational shopping box: "Tell us what you are looking for." It accepts English text, voice, a photo, or a pasted link. Animated suggestions such as "an oversized linen shirt", "a low oak side table", "ceramic dinnerware". It shows the translated search term (for example 亚麻衬衫 宽松) so the shopper sees what we searched.

## 4. Homepage sections

1. **Curated global discoveries**: an editorial, magazine-style spread.
2. **Shop by destination**: Tokyo, Seoul, Shanghai, Mumbai, Buenos Aires, Vilnius. Each opens that country's stores.
3. **Stores we search**: Taobao (China), Rakuten (Japan), Coupang and Naver Shopping (South Korea), Flipkart (India), Mercado Libre (Argentina), Vinted (Lithuania). Each has a flag and a monogram tile. Taobao is fully built; the rest return sample results.
4. **For you**: AI-personalised picks (size, budget, deadline, taste) with a one-line reason each.
5. **Compare across marketplaces**: the same item priced across stores at the true price to your door.
6. **Group buys**: shoppers pool an order to split shipping. Demo-level only.
7. **Secondhand and vintage**: curated resale, mainly Vinted and Rakuten.
8. **Transparent shipping**: a visual showing item price, shipping, duty and delivery date.
9. **One checkout**: the unified safe checkout (section 6).

Demo categories throughout: **furniture, homegoods, clothing**.

## 5. Product cards

Every card shows: photography, title, country of origin with flag, original marketplace, transparent total price to your door, estimated delivery, and seller trust indicators (a verdict badge: Looks good, Pre-order, Skip, or Not enough info). Cards open a modal or page with the full detail.

## 6. Core features (the trust layer)

Build these in this order. The first five are the must-haves for the demo.

1. **Search in English** with the generated Chinese term shown.
2. **Landed cost**: item + shipping + duty (flat 15%) + estimated tax, with the assumptions visible. A simple stacked bar, not a table.
3. **Trust verdict**: scored from public signals only (price vs the category median, the same photo reused across listings, seller age and reviews, certification). Output is Looks good, Pre-order, Skip, or **Not enough info** when unsure.
4. **"Why we'd skip this"** page: price-vs-usual-range gauge, plain reasons, and the line "A guide from public signals, not proof."
5. **LLM explanation**: one plain sentence per verdict, written **only from the structured scored signals**, never from raw listing text. This is the defence against prompt injection from listings.
6. **Product page extras**: translated jargon badges (现货 in stock, 包邮 free China shipping, 预售 pre-order), size conversion (US M, order L), review summary ("runs small"), a returns warning because returns are hard from the US.
7. **Seller chat helper**: the shopper writes in English, it is sent as Chinese, and the seller's Chinese reply is shown translated. Quick prompts: "Can I return it?", "Is it real linen?".
8. **Hype Check**: a trending item against its usual price range, reviews and cost per use, plus a cheaper similar option (for example a $289 cloud chair vs a $165 similar chair).
9. **Deinfluence me**: a fun text box. The shopper types what the internet is making them want; the reply is a funny verdict, the cost per use, one tip, and a smarter alternative. Never shaming, and it always ends with "You may still buy it. Now you know why." It is an LLM call fed only structured inputs (price, usual range, cost per use).
10. **Learn as you shop**: one short lesson on each screen (for example "Pay by card, never a bank transfer. Cards let you dispute a charge.").
11. **Checkout rewards optimiser**: three made-up demo cards (Everyday: 2% back, 3% foreign fee. Voyager: 1% back, no fee. Points: 1.5% value, 3% fee). Show each card's net cost after fees and rewards, pre-select the best, let the shopper switch, and show Borderless points earned.
12. **Safe checkout**: a mocked single-use virtual card capped at the order total, and a downloadable evidence file (search, price, verdict, chat, promised date) for disputes. Mark it clearly as a sandbox with no real payment.

## 7. Honesty rules (Trust and Responsibility)

- Label every mock or sample piece of data: listings, card names, reward rates, group buys.
- Verdicts are a guide, not proof. Say "Not enough info" rather than guessing.
- Card issuing is mocked. A live version needs a licensed card partner and a buying-agent partner for Taobao payment and forwarding.
- Do not scrape real store content or reproduce real brand logos.

## 8. Build order and scope

If time runs short, cut from the bottom: group buys and secondhand are visual-only, the other stores return sample results, and only Taobao needs the full flow. Build and confirm in this order:

1. Project setup, design tokens, routing, light and dark themes.
2. Homepage with the hero and the conversational search.
3. Search API, Chinese term generation, and results with product cards.
4. Landed cost and trust scoring, then the LLM explanation.
5. Product page and "Why we'd skip this".
6. Seller chat helper.
7. Checkout optimiser and safe checkout with the evidence file.
8. Hype Check, Deinfluence me, and "Learn as you shop".
9. Remaining homepage sections, polish, motion, README with run steps.

Finish with a short README: what it does, how to run it, what is mocked, and which parts are real.
