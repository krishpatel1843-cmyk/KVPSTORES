import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { products, categories, getProductsByCategory, getProductById, getFeaturedProducts } from './data/products'

const app = new Hono()

// ===================== SECURITY MIDDLEWARE =====================

// 1. Force HTTPS redirect
app.use('*', async (c, next) => {
  const proto = c.req.header('x-forwarded-proto') || c.req.header('cf-visitor') || ''
  if (proto.includes('http:')) {
    return c.redirect(c.req.url.replace(/^http:\/\//, 'https://'), 301)
  }
  await next()
})

// 2. Hono built-in secure headers (HSTS, X-Frame-Options, X-Content-Type, etc.)
app.use('*', secureHeaders({
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    paymentRequest: [],
  },
}))

// 3. Full Content Security Policy + extra hardening headers
app.use('*', async (c, next) => {
  await next()
  c.res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https://sspark.genspark.ai https://*.genspark.ai",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://kpstores.online https://www.kpstores.online https://kp-stores.printify.me",
    "upgrade-insecure-requests",
  ].join('; '))
  c.res.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  c.res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  c.res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  c.res.headers.set('X-DNS-Prefetch-Control', 'off')
})

// 4. CORS — restrict API to known origins only
app.use('/api/*', cors({
  origin: [
    'https://kpstores.online',
    'https://www.kpstores.online',
    'https://kp-stores.krishpatel1843.workers.dev',
    'https://kp-stores.printify.me',
  ],
  allowMethods: ['GET'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}))

// 5. Rate limiting — 120 requests / minute per IP
const _rl = new Map<string, { n: number; t: number }>()
app.use('*', async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const win = 60_000; const lim = 120
  const e = _rl.get(ip)
  if (e && now - e.t < win) {
    if (++e.n > lim) return c.text('Too Many Requests', 429)
  } else {
    _rl.set(ip, { n: 1, t: now })
    if (_rl.size > 5000) for (const [k, v] of _rl) if (now - v.t > win) _rl.delete(k)
  }
  await next()
})

// 6. Block common attack patterns (SQLi, XSS, path traversal, etc.)
app.use('*', async (c, next) => {
  const url = c.req.url.toLowerCase()
  const bad = ['../', '.env', 'wp-admin', 'phpinfo', '/.git', '/etc/passwd',
    'select%20', 'union%20select', '<script', 'javascript:', 'onerror=', 'onload=']
  if (bad.some(p => url.includes(p))) return c.text('Forbidden', 403)
  await next()
})

// Layout renderer
app.use(
  '*',
  jsxRenderer(({ children, title }) => {
    return (
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title || 'KP Stores — Products You\'ll Love'}</title>
          <meta name="description" content="Explore KP Stores — curated custom print-on-demand products including apparel, mugs, accessories and more. Powered by Printify." />
          {/* Security meta tags */}
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          <meta http-equiv="X-Content-Type-Options" content="nosniff" />
          <meta name="robots" content="index, follow" />
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛍️</text></svg>" />
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
          <script dangerouslySetInnerHTML={{ __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: { DEFAULT: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
                    accent: { DEFAULT: '#F59E0B', light: '#FCD34D' }
                  },
                  fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif']
                  }
                }
              }
            }
          `}} />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <style dangerouslySetInnerHTML={{ __html: `
            * { font-family: 'Inter', sans-serif; }
            .hero-gradient { background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 40%, #1D4ED8 100%); }
            .card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
            .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
            .badge-sale { background: #EF4444; }
            .badge-new { background: #10B981; }
            .badge-bestseller { background: #F59E0B; }
            .cart-sidebar { transform: translateX(100%); transition: transform 0.3s ease; }
            .cart-sidebar.open { transform: translateX(0); }
            .overlay { opacity: 0; pointer-events: none; transition: opacity 0.3s; }
            .overlay.active { opacity: 1; pointer-events: auto; }
            .img-zoom { overflow: hidden; }
            .img-zoom img { transition: transform 0.4s ease; }
            .img-zoom:hover img { transform: scale(1.08); }
            .nav-link { position: relative; }
            .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:#7C3AED; transition:width 0.3s; }
            .nav-link:hover::after { width:100%; }
            .search-box { transition: all 0.3s; }
            .tab-active { border-bottom: 3px solid #7C3AED; color: #7C3AED; font-weight: 600; }
            .star-filled { color: #F59E0B; }
            .promo-bar { background: linear-gradient(90deg, #7C3AED, #4F46E5, #7C3AED); background-size: 200% 100%; animation: shimmer 3s linear infinite; }
            @keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
            .toast { transform: translateY(100px); opacity:0; transition: all 0.4s; }
            .toast.show { transform: translateY(0); opacity:1; }
            .qty-btn:hover { background: #7C3AED; color: white; }
            .filter-chip.active { background: #7C3AED; color: white; }
            .product-grid-item { animation: fadeIn 0.4s ease forwards; }
            @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
            ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #7C3AED; border-radius: 3px; }
          `}} />
          {/* Initialize cart/wishlist early so page scripts can reference them */}
          <script dangerouslySetInnerHTML={{ __html: `
            var cart = JSON.parse(localStorage.getItem('kp-cart') || '[]');
            var wishlist = JSON.parse(localStorage.getItem('kp-wishlist') || '[]');
          `}} />
        </head>
        <body class="bg-gray-50 text-gray-800 min-h-screen">
          {/* Promo Bar */}
          <div class="promo-bar text-white text-center py-2 text-sm font-medium">
            <span>🚀 Free shipping on orders over $50 · Use code </span>
            <span class="font-bold bg-white/20 px-2 py-0.5 rounded mx-1">KP10</span>
            <span> for 10% off your first order!</span>
          </div>

          {/* Navigation */}
          <nav class="bg-white shadow-sm sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex items-center justify-between h-16">
                {/* Logo */}
                <a href="/" class="flex items-center gap-3 group">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-300 transition-shadow">
                    <span class="text-white font-black text-lg">KP</span>
                  </div>
                  <div>
                    <div class="font-black text-xl text-gray-900 leading-none">KP Stores</div>
                    <div class="text-xs text-purple-600 font-medium">Powered by Printify</div>
                  </div>
                </a>

                {/* Desktop Nav */}
                <div class="hidden md:flex items-center gap-8">
                  {categories.slice(1).map(cat => (
                    <a href={`/products?category=${cat.id}`} class="nav-link text-gray-600 hover:text-purple-700 font-medium text-sm transition-colors">
                      {cat.name}
                    </a>
                  ))}
                </div>

                {/* Right Actions */}
                <div class="flex items-center gap-3">
                  {/* HTTPS Secure Badge */}
                  <div class="hidden sm:flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <i class="fas fa-lock text-green-600" style="font-size:10px"></i>
                    <span>Secure</span>
                  </div>
                  <button onclick="toggleSearch()" class="p-2 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all">
                    <i class="fas fa-search text-lg"></i>
                  </button>
                  <a href="/wishlist" class="p-2 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all relative">
                    <i class="fas fa-heart text-lg"></i>
                    <span id="wishlist-count" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center hidden">0</span>
                  </a>
                  <button onclick="openCart()" class="p-2 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all relative">
                    <i class="fas fa-shopping-bag text-lg"></i>
                    <span id="cart-count" class="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">0</span>
                  </button>
                  {/* Mobile Menu */}
                  <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-gray-500 hover:text-purple-700 rounded-lg">
                    <i class="fas fa-bars text-lg"></i>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div id="search-bar" class="hidden pb-3">
                <div class="relative">
                  <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    id="search-input"
                    placeholder="Search for t-shirts, hoodies, mugs..."
                    class="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm"
                    oninput="handleSearch(this.value)"
                    onkeydown="if(event.key==='Enter') window.location.href='/products?q='+this.value"
                  />
                  <div id="search-results" class="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 mt-1 z-50 hidden max-h-64 overflow-y-auto"></div>
                </div>
              </div>

              {/* Mobile Menu */}
              <div id="mobile-menu" class="hidden md:hidden pb-4">
                <div class="flex flex-col gap-2">
                  {categories.slice(1).map(cat => (
                    <a href={`/products?category=${cat.id}`} class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-medium">
                      <span class="text-lg">{cat.icon}</span> {cat.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            {children}
          </main>

          {/* Footer */}
          <footer class="bg-gray-900 text-gray-300 mt-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
                <div>
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <span class="text-white font-black text-lg">KP</span>
                    </div>
                    <span class="text-white font-bold text-xl">KP Stores</span>
                  </div>
                  <p class="text-sm leading-relaxed mb-4">Your one-stop shop for premium custom print-on-demand products. Quality you can wear, gifts they'll love.</p>
                  <div class="flex gap-3">
                    <a href="#" class="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"><i class="fab fa-instagram text-sm"></i></a>
                    <a href="#" class="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"><i class="fab fa-facebook text-sm"></i></a>
                    <a href="#" class="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors"><i class="fab fa-twitter text-sm"></i></a>
                    <a href="#" class="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"><i class="fab fa-tiktok text-sm"></i></a>
                  </div>
                </div>
                <div>
                  <h3 class="text-white font-bold mb-4">Shop</h3>
                  <ul class="space-y-2 text-sm">
                    {categories.map(cat => (
                      <li><a href={`/products?category=${cat.id}`} class="hover:text-purple-400 transition-colors">{cat.name}</a></li>
                    ))}
                    <li><a href="/products?badge=SALE" class="hover:text-purple-400 transition-colors">🔥 Sale Items</a></li>
                    <li><a href="/products?badge=NEW" class="hover:text-purple-400 transition-colors">✨ New Arrivals</a></li>
                  </ul>
                </div>
                <div>
                  <h3 class="text-white font-bold mb-4">Support</h3>
                  <ul class="space-y-2 text-sm">
                    <li><a href="/faq" class="hover:text-purple-400 transition-colors">FAQ</a></li>
                    <li><a href="/shipping" class="hover:text-purple-400 transition-colors">Shipping Info</a></li>
                    <li><a href="/returns" class="hover:text-purple-400 transition-colors">Returns & Exchanges</a></li>
                    <li><a href="/size-guide" class="hover:text-purple-400 transition-colors">Size Guide</a></li>
                    <li><a href="/contact" class="hover:text-purple-400 transition-colors">Contact Us</a></li>
                    <li><a href="https://kp-stores.printify.me" target="_blank" class="hover:text-purple-400 transition-colors flex items-center gap-1">Printify Store <i class="fas fa-external-link-alt text-xs"></i></a></li>
                  </ul>
                </div>
                <div>
                  <h3 class="text-white font-bold mb-4">Newsletter</h3>
                  <p class="text-sm mb-4">Get the latest products and exclusive deals delivered to your inbox.</p>
                  <div class="flex flex-col gap-2">
                    <input type="email" placeholder="your@email.com" class="px-4 py-2.5 bg-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:bg-white/20 border border-white/10" />
                    <button onclick="subscribeNewsletter()" class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Subscribe <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                  </div>
                  <div class="mt-6">
                    <p class="text-xs text-gray-500 mb-2">We accept</p>
                    <div class="flex gap-2">
                      <span class="bg-white/10 px-2 py-1 rounded text-xs"><i class="fab fa-cc-visa"></i> Visa</span>
                      <span class="bg-white/10 px-2 py-1 rounded text-xs"><i class="fab fa-cc-mastercard"></i> MC</span>
                      <span class="bg-white/10 px-2 py-1 rounded text-xs"><i class="fab fa-cc-paypal"></i> PayPal</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <p>© 2024 KP Stores. All rights reserved. Powered by <a href="https://printify.com" class="text-purple-400 hover:underline">Printify</a></p>
                {/* Security Trust Badges */}
                <div class="flex flex-wrap items-center gap-3 justify-center">
                  <span class="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-green-400">
                    <i class="fas fa-lock text-xs"></i> SSL / TLS Encrypted
                  </span>
                  <span class="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-blue-400">
                    <i class="fas fa-shield-alt text-xs"></i> Cloudflare Protected
                  </span>
                  <span class="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-purple-400">
                    <i class="fas fa-user-shield text-xs"></i> HTTPS Enforced
                  </span>
                </div>
                <div class="flex gap-4">
                  <a href="/privacy" class="hover:text-gray-300">Privacy Policy</a>
                  <a href="/terms" class="hover:text-gray-300">Terms of Service</a>
                  <a href="/cookies" class="hover:text-gray-300">Cookie Policy</a>
                </div>
              </div>
            </div>
          </footer>

          {/* Cart Sidebar */}
          <div id="cart-overlay" class="overlay fixed inset-0 bg-black/50 z-50" onclick="closeCart()"></div>
          <div id="cart-sidebar" class="cart-sidebar fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            <div class="flex items-center justify-between p-5 border-b">
              <h2 class="text-xl font-bold flex items-center gap-2">
                <i class="fas fa-shopping-bag text-purple-600"></i> My Cart
                <span id="cart-item-count" class="bg-purple-100 text-purple-700 text-sm px-2 py-0.5 rounded-full">0</span>
              </h2>
              <button onclick="closeCart()" class="p-2 hover:bg-gray-100 rounded-lg">
                <i class="fas fa-times text-gray-500"></i>
              </button>
            </div>
            <div id="cart-items" class="flex-1 overflow-y-auto p-5">
              <div id="empty-cart" class="text-center py-20">
                <div class="text-6xl mb-4">🛍️</div>
                <p class="text-gray-500 font-medium">Your cart is empty</p>
                <p class="text-gray-400 text-sm mt-1">Add some awesome products!</p>
                <a href="/products" class="inline-block mt-4 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors" onclick="closeCart()">
                  Browse Products
                </a>
              </div>
            </div>
            <div id="cart-footer" class="border-t p-5 hidden">
              <div class="flex justify-between mb-2 text-sm text-gray-600">
                <span>Subtotal</span>
                <span id="cart-subtotal" class="font-semibold">$0.00</span>
              </div>
              <div class="flex justify-between mb-2 text-sm text-gray-600">
                <span>Shipping</span>
                <span class="text-green-600 font-medium">FREE on orders $50+</span>
              </div>
              <div class="flex justify-between mb-4 font-bold text-lg border-t pt-3">
                <span>Total</span>
                <span id="cart-total" class="text-purple-700">$0.00</span>
              </div>
              <button onclick="checkout()" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <i class="fas fa-lock text-xs"></i> Secure Checkout
              </button>
              <p class="text-center text-xs text-gray-400 mt-2">Powered by Printify · Ships worldwide</p>
            </div>
          </div>

          {/* Toast Notification */}
          <div id="toast" class="toast fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 text-sm font-medium">
            <i class="fas fa-check-circle text-green-400"></i>
            <span id="toast-msg">Added to cart!</span>
          </div>

          <script dangerouslySetInnerHTML={{ __html: `
            // ===================== CART SYSTEM =====================
            // cart and wishlist are pre-initialized in <head> script
            // Re-read from localStorage to ensure fresh data
            cart = JSON.parse(localStorage.getItem('kp-cart') || '[]');
            wishlist = JSON.parse(localStorage.getItem('kp-wishlist') || '[]');

            function saveCart() {
              localStorage.setItem('kp-cart', JSON.stringify(cart));
              updateCartUI();
            }

            function saveWishlist() {
              localStorage.setItem('kp-wishlist', JSON.stringify(wishlist));
              updateWishlistUI();
            }

            function addToCart(id, name, price, image, size, color) {
              const key = id + '-' + (size||'') + '-' + (color||'');
              const existing = cart.find(i => i.key === key);
              if (existing) {
                existing.qty++;
              } else {
                cart.push({ key, id, name, price: parseFloat(price), image, size, color, qty: 1 });
              }
              saveCart();
              showToast('✅ Added to cart: ' + name);
              openCart();
            }

            function removeFromCart(key) {
              cart = cart.filter(i => i.key !== key);
              saveCart();
            }

            function updateQty(key, delta) {
              const item = cart.find(i => i.key === key);
              if (item) {
                item.qty = Math.max(1, item.qty + delta);
                saveCart();
              }
            }

            function toggleWishlist(id, name) {
              if (wishlist.includes(id)) {
                wishlist = wishlist.filter(i => i !== id);
                showToast('💔 Removed from wishlist');
              } else {
                wishlist.push(id);
                showToast('❤️ Added to wishlist: ' + name);
              }
              saveWishlist();
              document.querySelectorAll('.wish-btn-' + id).forEach(btn => {
                btn.classList.toggle('text-red-500', wishlist.includes(id));
                btn.classList.toggle('text-gray-400', !wishlist.includes(id));
              });
            }

            function updateCartUI() {
              const count = cart.reduce((s, i) => s + i.qty, 0);
              document.getElementById('cart-count').textContent = count;
              document.getElementById('cart-item-count').textContent = count;

              const container = document.getElementById('cart-items');
              const empty = document.getElementById('empty-cart');
              const footer = document.getElementById('cart-footer');

              if (cart.length === 0) {
                empty.classList.remove('hidden');
                footer.classList.add('hidden');
                container.innerHTML = '';
                container.appendChild(empty);
                return;
              }

              empty.classList.add('hidden');
              footer.classList.remove('hidden');

              let html = '';
              let subtotal = 0;
              cart.forEach(item => {
                subtotal += item.price * item.qty;
                html += \`
                  <div class="flex gap-3 mb-4 pb-4 border-b last:border-0" id="cart-item-\${item.key.replace(/[^a-z0-9]/gi,'_')}">
                    <img src="\${item.image}" alt="\${item.name}" class="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm text-gray-800 truncate">\${item.name}</p>
                      \${item.size ? '<p class="text-xs text-gray-500 mt-0.5">Size: '+item.size+'</p>' : ''}
                      \${item.color ? '<p class="text-xs text-gray-500">Color: '+item.color+'</p>' : ''}
                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center gap-1">
                          <button onclick="updateQty('\${item.key}', -1)" class="qty-btn w-6 h-6 border border-gray-300 rounded-md text-xs flex items-center justify-center hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all">-</button>
                          <span class="w-8 text-center text-sm font-medium">\${item.qty}</span>
                          <button onclick="updateQty('\${item.key}', 1)" class="qty-btn w-6 h-6 border border-gray-300 rounded-md text-xs flex items-center justify-center hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all">+</button>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-purple-700">\$\${(item.price * item.qty).toFixed(2)}</span>
                          <button onclick="removeFromCart('\${item.key}')" class="text-gray-300 hover:text-red-500 transition-colors">
                            <i class="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                \`;
              });

              container.innerHTML = html;

              const total = subtotal < 50 ? subtotal + 4.99 : subtotal;
              document.getElementById('cart-subtotal').textContent = '\$' + subtotal.toFixed(2);
              document.getElementById('cart-total').textContent = '\$' + total.toFixed(2);
            }

            function updateWishlistUI() {
              const count = wishlist.length;
              const el = document.getElementById('wishlist-count');
              if (count > 0) {
                el.textContent = count;
                el.classList.remove('hidden');
              } else {
                el.classList.add('hidden');
              }
              wishlist.forEach(id => {
                document.querySelectorAll('.wish-btn-' + id).forEach(btn => {
                  btn.classList.add('text-red-500');
                  btn.classList.remove('text-gray-400');
                });
              });
            }

            function openCart() {
              document.getElementById('cart-sidebar').classList.add('open');
              document.getElementById('cart-overlay').classList.add('active');
              document.body.style.overflow = 'hidden';
            }

            function closeCart() {
              document.getElementById('cart-sidebar').classList.remove('open');
              document.getElementById('cart-overlay').classList.remove('active');
              document.body.style.overflow = '';
            }

            function showToast(msg) {
              const t = document.getElementById('toast');
              document.getElementById('toast-msg').textContent = msg;
              t.classList.add('show');
              setTimeout(() => t.classList.remove('show'), 3000);
            }

            function checkout() {
              if (cart.length === 0) { showToast('Your cart is empty!'); return; }
              showToast('Redirecting to checkout...');
              setTimeout(() => {
                window.open('https://kp-stores.printify.me', '_blank');
              }, 1000);
            }

            // ===================== SEARCH =====================
            const allProductsData = ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, image: p.image, badge: p.badge })))};

            function toggleSearch() {
              const bar = document.getElementById('search-bar');
              bar.classList.toggle('hidden');
              if (!bar.classList.contains('hidden')) {
                document.getElementById('search-input').focus();
              }
            }

            function handleSearch(val) {
              const results = document.getElementById('search-results');
              if (!val.trim()) { results.classList.add('hidden'); return; }
              const filtered = allProductsData.filter(p => p.name.toLowerCase().includes(val.toLowerCase()) || p.category.includes(val.toLowerCase())).slice(0, 6);
              if (filtered.length === 0) { results.innerHTML = '<p class="p-4 text-gray-400 text-sm">No products found</p>'; results.classList.remove('hidden'); return; }
              results.innerHTML = filtered.map(p => \`
                <a href="/product/\${p.id}" class="flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors">
                  <img src="\${p.image}" class="w-10 h-10 rounded-lg object-cover" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">\${p.name}</p>
                    <p class="text-xs text-gray-400 capitalize">\${p.category.replace('-', ' & ')}</p>
                  </div>
                  <span class="text-purple-700 font-bold text-sm">\$\${p.price}</span>
                </a>
              \`).join('');
              results.classList.remove('hidden');
            }

            // ===================== MOBILE MENU =====================
            function toggleMobileMenu() {
              document.getElementById('mobile-menu').classList.toggle('hidden');
            }

            function subscribeNewsletter() {
              showToast('🎉 Thanks for subscribing!');
            }

            // Init
            updateCartUI();
            updateWishlistUI();

            // Close search on outside click
            document.addEventListener('click', (e) => {
              const searchBar = document.getElementById('search-bar');
              if (!searchBar.contains(e.target) && !e.target.closest('[onclick="toggleSearch()"]')) {
                document.getElementById('search-results').classList.add('hidden');
              }
            });
          `}} />
        </body>
      </html>
    )
  }, { docType: true })
)

// ===================== HOME PAGE =====================
app.get('/', (c) => {
  const featured = getFeaturedProducts()
  const newArrivals = products.filter(p => p.badge === 'NEW').slice(0, 4)

  return c.render(
    <div>
      {/* Hero */}
      <section class="hero-gradient text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                New collection just dropped ✨
              </div>
              <h1 class="text-5xl md:text-6xl font-black leading-tight mb-6">
                Products<br/>
                <span class="text-yellow-300">You'll Love</span>
              </h1>
              <p class="text-lg text-purple-100 mb-8 max-w-md">
                Explore our curated selection of custom print-on-demand products. 
                From apparel to home goods — designed for everyday life.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <a href="/products" class="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 hover:text-purple-900 transition-all inline-flex items-center gap-2 group shadow-lg">
                  Shop Now <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </a>
                <a href="/products?badge=SALE" class="bg-white/10 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all inline-flex items-center gap-2">
                  <i class="fas fa-tag"></i> View Sales
                </a>
              </div>
              <div class="flex items-center gap-6 mt-10">
                <div class="text-center">
                  <div class="text-2xl font-black">500+</div>
                  <div class="text-purple-200 text-xs">Products</div>
                </div>
                <div class="w-px h-10 bg-white/20"></div>
                <div class="text-center">
                  <div class="text-2xl font-black">120k+</div>
                  <div class="text-purple-200 text-xs">Happy Customers</div>
                </div>
                <div class="w-px h-10 bg-white/20"></div>
                <div class="text-center">
                  <div class="text-2xl font-black">4.8⭐</div>
                  <div class="text-purple-200 text-xs">Avg Rating</div>
                </div>
              </div>
            </div>
            <div class="hidden md:grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p, i) => (
                <a href={`/product/${p.id}`} class={`img-zoom rounded-2xl overflow-hidden shadow-2xl ${i === 1 ? 'mt-8' : ''} ${i === 3 ? '-mt-8' : ''}`}>
                  <img src={p.image} alt={p.name} class="w-full h-40 object-cover" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'fas fa-shipping-fast', title: 'Free Shipping', desc: 'Orders over $50' },
              { icon: 'fas fa-redo', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: 'fas fa-shield-alt', title: 'Secure Checkout', desc: 'SSL encrypted' },
              { icon: 'fas fa-star', title: 'Top Quality', desc: 'Premium print quality' },
            ].map(b => (
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class={`${b.icon} text-purple-600`}></i>
                </div>
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{b.title}</p>
                  <p class="text-xs text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-black text-gray-900">Shop By Category</h2>
            <p class="text-gray-500 mt-1">Find exactly what you're looking for</p>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(1).map(cat => (
            <a href={`/products?category=${cat.id}`} class="card-hover bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:border-purple-200 group">
              <div class="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{cat.icon}</div>
              <p class="font-bold text-gray-800 text-sm">{cat.name}</p>
              <p class="text-xs text-gray-400 mt-1">{getProductsByCategory(cat.id).length} items</p>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-black text-gray-900">⭐ Bestsellers</h2>
            <p class="text-gray-500 mt-1">Our most-loved products</p>
          </div>
          <a href="/products" class="hidden md:flex items-center gap-2 text-purple-700 font-semibold hover:gap-3 transition-all text-sm">
            View All <i class="fas fa-arrow-right"></i>
          </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.map(p => <ProductCard product={p} />)}
        </div>
      </section>

      {/* Banner */}
      <section class="bg-gradient-to-r from-amber-500 to-orange-500 mx-4 sm:mx-6 lg:mx-8 rounded-3xl mb-16 overflow-hidden">
        <div class="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-white">
            <p class="text-sm font-medium opacity-80 mb-1">Limited Time Offer</p>
            <h2 class="text-3xl font-black mb-2">🔥 Up to 30% Off Sale Items!</h2>
            <p class="opacity-90">Don't miss out on our best deals. Use code <strong>KP10</strong> for extra savings.</p>
          </div>
          <a href="/products?badge=SALE" class="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all whitespace-nowrap flex-shrink-0">
            Shop Sale <i class="fas fa-tag ml-2"></i>
          </a>
        </div>
      </section>

      {/* New Arrivals */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-black text-gray-900">✨ New Arrivals</h2>
            <p class="text-gray-500 mt-1">Fresh drops you'll want first</p>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newArrivals.map(p => <ProductCard product={p} />)}
        </div>
      </section>

      {/* Testimonials */}
      <section class="bg-purple-50 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-black text-center text-gray-900 mb-2">What Customers Say</h2>
          <p class="text-center text-gray-500 mb-10">Real reviews from happy shoppers</p>
          <div class="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', rating: 5, text: 'Absolutely love my custom hoodie! The print quality is amazing and it arrived faster than expected. Will definitely order again.', product: 'Premium Pullover Hoodie' },
              { name: 'Jake R.', rating: 5, text: 'Ordered the coffee mug as a gift and the recipient was thrilled. The colors are vibrant and the print hasn\'t faded after multiple washes.', product: 'Custom Print Coffee Mug' },
              { name: 'Maria L.', rating: 4, text: 'Great quality t-shirt! Sizing is accurate and the fabric is super soft. The graphic looks even better in person than in the photos.', product: 'Classic Graphic Tee' },
            ].map(review => (
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
                <div class="flex text-yellow-400 mb-3">
                  {Array.from({length: review.rating}).map(() => <i class="fas fa-star text-sm"></i>)}
                </div>
                <p class="text-gray-700 text-sm leading-relaxed mb-4">"{review.text}"</p>
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800 text-sm">{review.name}</p>
                    <p class="text-xs text-gray-400">Purchased: {review.product}</p>
                  </div>
                  <i class="fas fa-check-circle text-green-500 ml-auto text-sm"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>,
    { title: "KP Stores — Products You'll Love | Powered by Printify" }
  )
})

// ===================== PRODUCTS PAGE =====================
app.get('/products', (c) => {
  const category = c.req.query('category') || 'all'
  const badge = c.req.query('badge') || ''
  const q = c.req.query('q') || ''
  const sort = c.req.query('sort') || 'featured'

  let filtered = category === 'all' ? [...products] : products.filter(p => p.category === category)
  if (badge) filtered = filtered.filter(p => p.badge === badge)
  if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.tags.some(t => t.includes(q.toLowerCase())))

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating)
  else if (sort === 'newest') filtered.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0))

  const categoryName = categories.find(c => c.id === category)?.name || 'All Products'

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a href="/" class="hover:text-purple-700">Home</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-gray-800 font-medium">{categoryName}</span>
        {q && <><i class="fas fa-chevron-right text-xs"></i><span>"{q}"</span></>}
      </div>

      <div class="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside class="md:w-64 flex-shrink-0">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
            <h3 class="font-bold text-gray-800 mb-4">Categories</h3>
            <div class="space-y-1">
              {categories.map(cat => (
                <a href={`/products?category=${cat.id}${sort !== 'featured' ? '&sort='+sort : ''}`}
                  class={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${category === cat.id ? 'bg-purple-600 text-white font-semibold' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'}`}>
                  <span class="flex items-center gap-2"><span>{cat.icon}</span>{cat.name}</span>
                  <span class={`text-xs px-2 py-0.5 rounded-full ${category === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.id === 'all' ? products.length : getProductsByCategory(cat.id).length}
                  </span>
                </a>
              ))}
            </div>

            <div class="border-t pt-4 mt-4">
              <h3 class="font-bold text-gray-800 mb-3">Special</h3>
              <div class="space-y-1">
                {[{id:'SALE',label:'🔥 On Sale', color:'red'},{id:'NEW',label:'✨ New Arrivals', color:'green'},{id:'BESTSELLER',label:'⭐ Bestsellers', color:'yellow'}].map(b => (
                  <a href={`/products?badge=${b.id}&category=${category}`}
                    class={`flex items-center px-3 py-2 rounded-xl text-sm transition-all ${badge === b.id ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-purple-50'}`}>
                    {b.label}
                  </a>
                ))}
              </div>
            </div>

            <div class="border-t pt-4 mt-4">
              <h3 class="font-bold text-gray-800 mb-3">Price Range</h3>
              <div class="space-y-2">
                {[{label:'Under $20', min:0, max:20},{label:'$20 - $35', min:20, max:35},{label:'$35 - $50', min:35, max:50},{label:'Over $50', min:50, max:999}].map(r => (
                  <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-purple-700">
                    <input type="checkbox" class="accent-purple-600" />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div class="flex-1">
          {/* Toolbar */}
          <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 class="text-2xl font-black text-gray-900">{q ? `Results for "${q}"` : categoryName}</h1>
              <p class="text-gray-500 text-sm">{filtered.length} products found</p>
            </div>
            <div class="flex items-center gap-3">
              <select
                onchange={`window.location.href='/products?category=${category}&sort='+this.value`}
                class="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-purple-400 bg-white"
                value={sort}
              >
                <option value="featured" selected={sort==='featured'}>Featured</option>
                <option value="price-asc" selected={sort==='price-asc'}>Price: Low to High</option>
                <option value="price-desc" selected={sort==='price-desc'}>Price: High to Low</option>
                <option value="rating" selected={sort==='rating'}>Top Rated</option>
                <option value="newest" selected={sort==='newest'}>Newest</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div class="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div class="text-6xl mb-4">😕</div>
              <h3 class="text-xl font-bold text-gray-700">No products found</h3>
              <p class="text-gray-400 mt-2 mb-6">Try a different category or search term</p>
              <a href="/products" class="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                View All Products
              </a>
            </div>
          ) : (
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(p => <ProductCard product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>,
    { title: `${categoryName} — KP Stores` }
  )
})

// ===================== PRODUCT DETAIL PAGE =====================
app.get('/product/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const product = getProductById(id)

  if (!product) {
    return c.html('<div style="text-align:center;padding:100px;font-family:sans-serif"><h1>Product not found</h1><a href="/">← Back to Home</a></div>', 404)
  }

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return c.render(
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <a href="/" class="hover:text-purple-700">Home</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <a href={`/products?category=${product.category}`} class="hover:text-purple-700 capitalize">{product.category.replace('-', ' & ')}</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-gray-800 font-medium">{product.name}</span>
      </div>

      <div class="grid md:grid-cols-2 gap-10 mb-16">
        {/* Image Gallery */}
        <div>
          <div class="img-zoom rounded-3xl overflow-hidden shadow-xl mb-4 aspect-square">
            <img src={product.image} alt={product.name} class="w-full h-full object-cover" id="main-product-img" />
          </div>
          {product.images.length > 1 && (
            <div class="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button onclick={`document.getElementById('main-product-img').src='${img}'`}
                  class="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-400 transition-colors">
                  <img src={img} alt="" class="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div class="flex items-start justify-between mb-4">
            <div>
              {product.badge && (
                <span class={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                  product.badge === 'SALE' ? 'bg-red-500' :
                  product.badge === 'NEW' ? 'bg-green-500' :
                  'bg-amber-500'
                }`}>{product.badge}</span>
              )}
              <h1 class="text-3xl font-black text-gray-900">{product.name}</h1>
            </div>
            <button
              onclick={`toggleWishlist(${product.id}, '${product.name}')`}
              class={`wish-btn-${product.id} p-3 border-2 border-gray-200 rounded-xl hover:border-red-300 transition-colors text-gray-400 flex-shrink-0`}>
              <i class="fas fa-heart text-lg"></i>
            </button>
          </div>

          {/* Rating */}
          <div class="flex items-center gap-3 mb-4">
            <div class="flex text-yellow-400">
              {Array.from({length: 5}).map((_, i) => (
                <i class={`fas fa-star text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
              ))}
            </div>
            <span class="font-bold text-gray-800">{product.rating}</span>
            <span class="text-gray-400 text-sm">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div class="flex items-baseline gap-3 mb-6">
            <span class="text-4xl font-black text-purple-700">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span class="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span class="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <p class="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Size Selector */}
          {product.sizes && (
            <div class="mb-5">
              <div class="flex items-center justify-between mb-3">
                <p class="font-bold text-gray-800">Size</p>
                <button class="text-purple-600 text-sm hover:underline">Size Guide</button>
              </div>
              <div class="flex flex-wrap gap-2" id="size-options">
                {product.sizes.map((size, i) => (
                  <button
                    onclick="selectOption(this, 'size')"
                    class={`px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all ${i === 0 ? 'border-purple-600 bg-purple-600 text-white selected-size' : 'border-gray-200 text-gray-700 hover:border-purple-400'}`}
                    data-value={size}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && (
            <div class="mb-6">
              <p class="font-bold text-gray-800 mb-3">Color: <span id="selected-color" class="text-purple-600 font-normal">{product.colors[0]}</span></p>
              <div class="flex flex-wrap gap-2" id="color-options">
                {product.colors.map((color, i) => (
                  <button
                    onclick="selectOption(this, 'color')"
                    class={`px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all ${i === 0 ? 'border-purple-600 bg-purple-50 text-purple-700 selected-color' : 'border-gray-200 text-gray-700 hover:border-purple-400'}`}
                    data-value={color}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div class="flex items-center gap-4 mb-6">
            <p class="font-bold text-gray-800">Quantity</p>
            <div class="flex items-center gap-1 border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onclick="changeQty(-1)" class="px-4 py-2.5 hover:bg-gray-50 font-bold text-gray-600 text-lg">-</button>
              <span id="qty-display" class="px-4 py-2.5 font-bold text-gray-800 min-w-[3rem] text-center">1</span>
              <button onclick="changeQty(1)" class="px-4 py-2.5 hover:bg-gray-50 font-bold text-gray-600 text-lg">+</button>
            </div>
          </div>

          {/* Add to Cart */}
          <div class="flex gap-3">
            <button
              onclick={`addToCartFromPage(${product.id}, '${product.name.replace(/'/g,"\\'")}', ${product.price}, '${product.image}')`}
              class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:shadow-purple-300 active:scale-95">
              <i class="fas fa-shopping-bag"></i>
              Add to Cart
            </button>
            <button
              onclick={`checkout()`}
              class="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              <i class="fas fa-bolt"></i>
              Buy Now
            </button>
          </div>

          {/* Meta */}
          <div class="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-shipping-fast text-purple-500"></i>
              Ships in 3–7 business days
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-redo text-purple-500"></i>
              30-day easy returns
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-shield-alt text-purple-500"></i>
              Secure checkout
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-paint-brush text-purple-500"></i>
              Premium print quality
            </div>
          </div>

          {/* Tags */}
          <div class="mt-4 flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span class="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-16">
        <div class="flex border-b overflow-x-auto">
          {['Description', 'Reviews', 'Shipping & Returns'].map((tab, i) => (
            <button
              onclick={`switchTab(${i})`}
              id={`tab-${i}`}
              class={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${i === 0 ? 'tab-active' : 'text-gray-500 hover:text-gray-800'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div class="p-6">
          <div id="tab-content-0">
            <h3 class="font-bold mb-3">About This Product</h3>
            <p class="text-gray-600 leading-relaxed">{product.description}</p>
            <div class="mt-4 grid sm:grid-cols-2 gap-3">
              {['100% Premium Materials', 'Vibrant print that won\'t fade', 'Comfortable fit for all day wear', 'Environmentally conscious production'].map(feat => (
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <i class="fas fa-check text-green-500"></i> {feat}
                </div>
              ))}
            </div>
          </div>
          <div id="tab-content-1" class="hidden">
            <div class="flex items-center gap-6 mb-6 pb-6 border-b">
              <div class="text-center">
                <div class="text-5xl font-black text-purple-700">{product.rating}</div>
                <div class="flex text-yellow-400 justify-center my-1">
                  {Array.from({length: 5}).map((_, i) => (
                    <i class={`fas fa-star text-sm ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <div class="text-gray-400 text-sm">{product.reviews} reviews</div>
              </div>
              <div class="flex-1">
                {[5,4,3,2,1].map(star => (
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs w-4">{star}</span>
                    <i class="fas fa-star text-yellow-400 text-xs"></i>
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div class="bg-yellow-400 h-2 rounded-full" style={`width:${star===5?70:star===4?20:star===3?7:star===2?2:1}%`}></div>
                    </div>
                    <span class="text-xs text-gray-400">{star===5?70:star===4?20:star===3?7:star===2?2:1}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div class="space-y-4">
              {[
                {name:'Alex K.', rating:5, date:'2 days ago', text:'Great quality! Print is vibrant and the fabric is super comfortable. Already ordered 2 more.'},
                {name:'Jessica T.', rating:5, date:'1 week ago', text:'Fast shipping and perfect sizing. This is exactly what I was looking for. Highly recommend!'},
                {name:'Chris B.', rating:4, date:'2 weeks ago', text:'Very happy with my purchase. Good quality and nice design. Just wish there were more color options.'},
              ].map(review => (
                <div class="border rounded-xl p-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">{review.name[0]}</div>
                      <span class="font-medium text-sm">{review.name}</span>
                      <i class="fas fa-check-circle text-green-500 text-xs"></i>
                    </div>
                    <span class="text-xs text-gray-400">{review.date}</span>
                  </div>
                  <div class="flex text-yellow-400 mb-2">
                    {Array.from({length: review.rating}).map(() => <i class="fas fa-star text-xs"></i>)}
                  </div>
                  <p class="text-sm text-gray-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div id="tab-content-2" class="hidden">
            <div class="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 class="font-bold mb-3 flex items-center gap-2"><i class="fas fa-shipping-fast text-purple-500"></i> Shipping</h4>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Standard shipping: 3-7 business days</li>
                  <li>• Expedited shipping: 1-3 business days</li>
                  <li>• Free standard shipping on orders over $50</li>
                  <li>• Ships worldwide via USPS, FedEx, DHL</li>
                  <li>• Tracking provided for all orders</li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold mb-3 flex items-center gap-2"><i class="fas fa-redo text-purple-500"></i> Returns</h4>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 30-day return policy</li>
                  <li>• Items must be unworn and unwashed</li>
                  <li>• Free returns on defective items</li>
                  <li>• Exchanges available for different sizes</li>
                  <li>• Contact us at support@kpstores.com</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 class="text-2xl font-black mb-6">You May Also Like</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(p => <ProductCard product={p} />)}
          </div>
        </section>
      )}

      <script dangerouslySetInnerHTML={{ __html: `
        let selectedSize = '${product.sizes ? product.sizes[0] : ''}';
        let selectedColor = '${product.colors ? product.colors[0] : ''}';
        let qty = 1;

        function selectOption(btn, type) {
          const parent = btn.parentElement;
          parent.querySelectorAll('button').forEach(b => {
            b.classList.remove('border-purple-600', 'bg-purple-600', 'text-white', 'bg-purple-50', 'text-purple-700', 'selected-'+type);
            b.classList.add('border-gray-200', 'text-gray-700');
          });
          btn.classList.remove('border-gray-200', 'text-gray-700');
          if (type === 'size') {
            btn.classList.add('border-purple-600', 'bg-purple-600', 'text-white', 'selected-size');
            selectedSize = btn.dataset.value;
          } else {
            btn.classList.add('border-purple-600', 'bg-purple-50', 'text-purple-700', 'selected-color');
            selectedColor = btn.dataset.value;
            document.getElementById('selected-color').textContent = btn.dataset.value;
          }
        }

        function changeQty(delta) {
          qty = Math.max(1, qty + delta);
          document.getElementById('qty-display').textContent = qty;
        }

        function addToCartFromPage(id, name, price, image) {
          for (let i = 0; i < qty; i++) {
            addToCart(id, name, price, image, selectedSize, selectedColor);
          }
        }

        function switchTab(i) {
          for (let j = 0; j < 3; j++) {
            document.getElementById('tab-content-' + j).classList.add('hidden');
            const tabBtn = document.getElementById('tab-' + j);
            tabBtn.classList.remove('tab-active');
            tabBtn.classList.add('text-gray-500');
          }
          document.getElementById('tab-content-' + i).classList.remove('hidden');
          const active = document.getElementById('tab-' + i);
          active.classList.add('tab-active');
          active.classList.remove('text-gray-500');
        }

        // Mark wishlist items (defer until layout scripts are loaded)
        window.addEventListener('DOMContentLoaded', function() {
          if (typeof wishlist !== 'undefined') {
            wishlist.forEach(function(id) {
              document.querySelectorAll('.wish-btn-' + id).forEach(function(btn) {
                btn.classList.add('text-red-500');
                btn.classList.remove('text-gray-400');
              });
            });
          }
        });
      `}} />
    </div>,
    { title: `${product.name} — KP Stores` }
  )
})

// ===================== API ENDPOINTS =====================
app.get('/api/products', (c) => {
  const category = c.req.query('category') || 'all'
  const filtered = category === 'all' ? products : products.filter(p => p.category === category)
  return c.json({ products: filtered, total: filtered.length })
})

app.get('/api/products/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const product = getProductById(id)
  if (!product) return c.json({ error: 'Not found' }, 404)
  return c.json(product)
})

// ===================== STATIC PAGES =====================
app.get('/faq', (c) => c.render(
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-black mb-8">Frequently Asked Questions</h1>
    <div class="space-y-4">
      {[
        {q:'How long does shipping take?', a:'Standard shipping takes 3-7 business days. Expedited options available at checkout.'},
        {q:'What is your return policy?', a:'We offer 30-day returns for unworn, unwashed items. Defective items ship free returns.'},
        {q:'How do I track my order?', a:'Once shipped, you\'ll receive a tracking email with your shipment details.'},
        {q:'Are the prints durable?', a:'Yes! We use premium printing techniques that ensure vibrant colors that last through many washes.'},
        {q:'Do you ship internationally?', a:'Yes, we ship worldwide. International shipping times vary by destination.'},
        {q:'Can I customize a product?', a:'Visit kp-stores.printify.me for our full customization options powered by Printify.'},
      ].map(item => (
        <details class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
          <summary class="px-6 py-4 font-semibold cursor-pointer flex items-center justify-between">
            {item.q}
            <i class="fas fa-chevron-down text-purple-500 group-open:rotate-180 transition-transform"></i>
          </summary>
          <div class="px-6 pb-4 text-gray-600 text-sm">{item.a}</div>
        </details>
      ))}
    </div>
    <div class="mt-10 bg-purple-50 rounded-2xl p-6 text-center">
      <p class="text-gray-700 font-medium mb-3">Still have questions?</p>
      <a href="mailto:support@kpstores.com" class="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
        <i class="fas fa-envelope"></i> Contact Support
      </a>
    </div>
  </div>,
  { title: 'FAQ — KP Stores' }
))

// Wishlist page
app.get('/wishlist', (c) => c.render(
  <div class="max-w-7xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-black mb-2">My Wishlist ❤️</h1>
    <p class="text-gray-500 mb-8">Items you've saved for later</p>
    <div id="wishlist-grid" class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <div class="col-span-full text-center py-20">
        <div class="text-6xl mb-4">❤️</div>
        <p class="text-gray-500">Loading your wishlist...</p>
      </div>
    </div>
    <script dangerouslySetInnerHTML={{ __html: `
      const allProds = ${JSON.stringify(products)};
      function renderWishlist() {
        const grid = document.getElementById('wishlist-grid');
        const items = allProds.filter(p => wishlist.includes(p.id));
        if (items.length === 0) {
          grid.innerHTML = '<div class="col-span-full text-center py-20"><div class="text-6xl mb-4">❤️</div><p class="text-gray-500 font-medium">Your wishlist is empty</p><a href="/products" class="inline-block mt-4 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors">Browse Products</a></div>';
          return;
        }
        grid.innerHTML = items.map(p => \`
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <a href="/product/\${p.id}"><img src="\${p.image}" class="w-full h-48 object-cover" /></a>
            <div class="p-4">
              <a href="/product/\${p.id}" class="font-bold text-sm text-gray-800 hover:text-purple-700">\${p.name}</a>
              <p class="text-purple-700 font-black mt-1">\$\${p.price.toFixed(2)}</p>
              <div class="flex gap-2 mt-3">
                <button onclick="addToCart(\${p.id}, '\${p.name}', \${p.price}, '\${p.image}', '', '')" class="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors">Add to Cart</button>
                <button onclick="toggleWishlist(\${p.id}, '\${p.name}'); renderWishlist();" class="p-2 border border-gray-200 rounded-lg hover:border-red-300 text-red-500">
                  <i class="fas fa-heart text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        \`).join('');
      }
      renderWishlist();
    `}} />
  </div>,
  { title: 'Wishlist — KP Stores' }
))

// ===================== PRODUCT CARD COMPONENT =====================
function ProductCard({ product }: { product: any }) {
  return (
    <div class="card-hover bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 product-grid-item group">
      <a href={`/product/${product.id}`} class="img-zoom block relative">
        <div class="aspect-square overflow-hidden">
          <img src={product.image} alt={product.name} class="w-full h-full object-cover" loading="lazy" />
        </div>
        {product.badge && (
          <span class={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 ${
            product.badge === 'SALE' ? 'badge-sale' :
            product.badge === 'NEW' ? 'badge-new' :
            'badge-bestseller'
          }`}>{product.badge}</span>
        )}
        <button
          onclick={`event.preventDefault(); toggleWishlist(${product.id}, '${product.name.replace(/'/g, "\\'")}')`}
          class={`wish-btn-${product.id} absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors z-10`}>
          <i class="fas fa-heart text-sm"></i>
        </button>
      </a>
      <div class="p-4">
        <a href={`/product/${product.id}`}>
          <p class="text-xs text-purple-600 font-medium capitalize mb-1">{product.category.replace('-', ' & ')}</p>
          <h3 class="font-bold text-gray-800 text-sm leading-tight hover:text-purple-700 transition-colors line-clamp-2">{product.name}</h3>
        </a>
        <div class="flex items-center gap-1 mt-2 mb-3">
          <div class="flex text-yellow-400">
            {Array.from({length: 5}).map((_, i) => (
              <i class={`fas fa-star text-xs ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
            ))}
          </div>
          <span class="text-xs text-gray-500">({product.reviews})</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <span class="font-black text-purple-700">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span class="text-xs text-gray-400 line-through ml-1">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onclick={`addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}', '', '')`}
            class="bg-purple-600 hover:bg-purple-700 text-white w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm">
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default app
