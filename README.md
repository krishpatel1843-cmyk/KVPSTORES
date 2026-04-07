# KP Stores — Custom Print-on-Demand Shop

A fully functional e-commerce website for **kp-stores.printify.me** built with Hono + TypeScript + TailwindCSS on Cloudflare Pages.

## Live Preview
- **Dev Server**: http://localhost:3000
- **Printify Store**: https://kp-stores.printify.me

## Features Implemented
- ✅ **Homepage** — Hero banner, category grid, bestsellers, new arrivals, testimonials, sale banner
- ✅ **Product Listing** — Filter by category, badge (Sale/New/Bestseller), sort by price/rating, search
- ✅ **Product Detail** — Image gallery, size/color selector, quantity, tabs (description, reviews, shipping)
- ✅ **Shopping Cart** — Slide-out sidebar, add/remove/update quantity, subtotal calculation
- ✅ **Wishlist** — Save/remove items, persisted in localStorage
- ✅ **Live Search** — Autocomplete search with product thumbnails
- ✅ **FAQ Page** — Accordion-style FAQ
- ✅ **Toast Notifications** — "Added to cart", "Added to wishlist", etc.
- ✅ **Responsive Design** — Mobile-friendly with hamburger nav
- ✅ **Promo Bar** — Animated gradient with promo code
- ✅ **Newsletter Signup** — In footer

## Pages / Routes
| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, featured products |
| `/products` | All products listing |
| `/products?category=men` | Filter by Men category |
| `/products?category=women` | Filter by Women category |
| `/products?category=kids` | Filter by Kids category |
| `/products?category=home-living` | Filter by Home & Living |
| `/products?category=accessories` | Filter by Accessories |
| `/products?badge=SALE` | Sale items only |
| `/products?badge=NEW` | New arrivals only |
| `/products?sort=price-asc` | Sort by price |
| `/products?q=hoodie` | Search products |
| `/product/:id` | Product detail page |
| `/wishlist` | Wishlist page |
| `/faq` | FAQ page |
| `/api/products` | JSON API for products |
| `/api/products/:id` | JSON API for single product |

## Tech Stack
- **Framework**: Hono v4 (TypeScript)
- **Build**: Vite + @hono/vite-build
- **Runtime**: Cloudflare Pages / Workers
- **Styling**: TailwindCSS (CDN) + Custom CSS
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)
- **Data**: Static TypeScript data (16 products, 5 categories)

## Categories
- 👕 Men (4 items)
- 👗 Women (3 items)
- 🧒 Kids (2 items)
- 🏠 Home & Living (3 items)
- 🎒 Accessories (4 items)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Start dev server (PM2)
pm2 start ecosystem.config.cjs

# Or directly
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

## Deployment to Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name kp-stores
```

## Data Architecture
- **Storage**: Static TypeScript data (no database required)
- **Cart/Wishlist**: Browser localStorage
- **Products**: 16 products across 5 categories with pricing, ratings, badges, sizes, colors

## Last Updated: 2026-04-07
