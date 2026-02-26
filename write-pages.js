/**
 * One-time script: writes all dynamic HTML pages.
 * Run with: node write-pages.js
 * Delete after use.
 */
const fs = require("fs");
const path = require("path");
const P = (f) => path.join(__dirname, "pages", f);

// ─── shared nav/footer snippets ────────────────────────────────────────────

const CSS = `    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/components.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">`;

const NAV = (active) => `    <header class="header">
        <div class="container">
            <nav class="navbar">
                <div class="logo"><a href="/">CampusCart</a></div>
                <div class="search-bar">
                    <input type="text" id="searchInput" placeholder="Search for products...">
                    <button class="search-btn" onclick="goSearch()">&#128269;</button>
                </div>
                <div class="nav-icons">
                    <a href="/wishlist" class="icon-link"><span class="icon">&#10084;&#65039;</span><span class="badge" id="wishlistBadge">0</span></a>
                    <a href="/cart"     class="icon-link"><span class="icon">&#128722;</span><span class="badge" id="cartBadge">0</span></a>
                    <a href="/profile"  class="icon-link" id="profileLink"><span class="icon">&#128100;</span></a>
                    <a href="/admin" class="admin-login-btn">ADMIN LOGIN</a>
                </div>
            </nav>
            <nav class="main-nav">
                <ul>
                    <li><a href="/"${active === "home" ? ' class="active"' : ""}>Home</a></li>
                    <li><a href="/shop"${active === "shop" ? ' class="active"' : ""}>Shop</a></li>
                    <li><a href="/about"${active === "about" ? ' class="active"' : ""}>About</a></li>
                    <li><a href="/contact"${active === "contact" ? ' class="active"' : ""}>Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>`;

const FOOTER = `    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column"><h3>CampusCart</h3><p>Your one-stop shop for all campus needs.</p></div>
                <div class="footer-column"><h4>Shop</h4><ul>
                    <li><a href="/shop">All Products</a></li>
                    <li><a href="/shop-fashion">Fashion</a></li>
                    <li><a href="/shop-stationery">Stationery</a></li>
                    <li><a href="/shop-backpacks">Backpacks</a></li>
                </ul></div>
                <div class="footer-column"><h4>Help</h4><ul>
                    <li><a href="/contact">Contact Us</a></li>
                    <li><a href="/about">About Us</a></li>
                </ul></div>
            </div>
            <div class="footer-bottom"><p>&copy; 2026 CampusCart. All rights reserved.</p></div>
        </div>
    </footer>`;

const APP_JS = `    <script src="/js/app.js"></script>`;

// ─── index.html ─────────────────────────────────────────────────────────────
fs.writeFileSync(
  P("index.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampusCart - Your Campus, Your Cart</title>
${CSS}
</head>
<body>
${NAV("home")}

    <section class="hero">
        <div class="container">
            <div class="hero-wrapper">
                <div class="hero-content">
                    <div class="hero-badge">New Collection</div>
                    <h1 class="hero-title"><span class="hero-discount">50% OFF</span> On Your Campus Essentials</h1>
                    <p class="hero-description">Discover our exclusive collection of fashion, stationery, and backpacks designed for students.</p>
                    <div class="hero-buttons">
                        <a href="/shop" class="btn btn-primary btn-large">Explore Collection</a>
                        <a href="/shop" class="btn btn-outline btn-large">Browse Accessories</a>
                    </div>
                    <div class="hero-stats">
                        <div class="stat-item"><h3 id="statProducts">--</h3><p>Products</p></div>
                        <div class="stat-item"><h3>500+</h3><p>Happy Students</p></div>
                        <div class="stat-item"><h3 id="statCategories">--</h3><p>Categories</p></div>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="hero-image-wrapper">
                        <img src="/assets/Bag.jpg" alt="Campus Collection" class="hero-main-image" id="heroImage" style="transition:opacity .5s">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="categories">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Explore Popular Categories</h2>
                <p class="section-subtitle">Find everything you need for your campus life</p>
            </div>
            <div class="category-grid">
                <a href="/shop-fashion" class="category-card">
                    <div class="category-image"><img src="/assets/Women's Formal Shirt.jpg" alt="Fashion" onerror="this.style.display='none'"></div>
                    <div class="category-info"><h3>&#128081; Fashion</h3><p>Formal wear &amp; casual styles</p><span class="category-count" id="countFashion">Loading...</span></div>
                </a>
                <a href="/shop-stationery" class="category-card">
                    <div class="category-image"><img src="/assets/Highlighter.jpg" alt="Stationery" onerror="this.style.display='none'"></div>
                    <div class="category-info"><h3>&#9999;&#65039; Stationery</h3><p>Notes, pens &amp; organizers</p><span class="category-count" id="countStationery">Loading...</span></div>
                </a>
                <a href="/shop-backpacks" class="category-card">
                    <div class="category-image"><img src="/assets/Bag.jpg" alt="Backpacks" onerror="this.style.display='none'"></div>
                    <div class="category-info"><h3>&#127890; Backpacks</h3><p>Durable &amp; stylish bags</p><span class="category-count" id="countBackpacks">Loading...</span></div>
                </a>
            </div>
        </div>
    </section>

    <section class="trending-products">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Trending This Week</h2>
                <p class="section-subtitle">Most popular items among students</p>
            </div>
            <div class="product-grid" id="trendingGrid">
                <div style="grid-column:1/-1;text-align:center;padding:2rem;color:#6B7280">Loading products...</div>
            </div>
            <div class="section-cta"><a href="/shop" class="btn btn-outline">View All Products</a></div>
        </div>
    </section>

    <section class="special-offers">
        <div class="container">
            <div class="offer-banner">
                <h2>&#127881; Flash Sale! Up to 50% Off</h2>
                <p>Limited time offer on selected items. Use code <strong>CAMPUS10</strong> for extra 10% off.</p>
                <a href="/shop" class="btn btn-secondary">Shop Deals</a>
            </div>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <h2 class="section-title">Why Choose CampusCart?</h2>
            <div class="features-grid">
                <div class="feature-card"><div class="feature-icon">&#128666;</div><h3>Free Shipping</h3><p>On orders over &#8377;999</p></div>
                <div class="feature-card"><div class="feature-icon">&#128176;</div><h3>Student Discounts</h3><p>Exclusive deals for students</p></div>
                <div class="feature-card"><div class="feature-icon">&#8617;&#65039;</div><h3>Easy Returns</h3><p>30-day return policy</p></div>
                <div class="feature-card"><div class="feature-icon">&#128222;</div><h3>24/7 Support</h3><p>We're here to help</p></div>
            </div>
        </div>
    </section>

    <section class="newsletter">
        <div class="container">
            <h2>Stay Updated!</h2>
            <p>Subscribe to get special offers and updates</p>
            <form class="newsletter-form" onsubmit="subscribeNewsletter(event)">
                <input type="email" placeholder="Enter your email" required>
                <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
        </div>
    </section>

${FOOTER}
${APP_JS}
    <script>
    let heroImages = [], heroIdx = 0;
    function cycleHero() {
        if (!heroImages.length) return;
        const img = document.getElementById('heroImage');
        img.style.opacity = '0';
        setTimeout(function() { heroIdx = (heroIdx+1)%heroImages.length; img.src = heroImages[heroIdx]; img.style.opacity='1'; }, 500);
    }
    async function loadHomepage() {
        try {
            const [pr, cr] = await Promise.all([fetch('/api/v1/products/featured?limit=9'), fetch('/api/v1/products/categories/count')]);
            const pd = await pr.json().catch(()=>({}));
            const cd = await cr.json().catch(()=>({}));
            if (cd.data && cd.data.counts) {
                let total = 0;
                cd.data.counts.forEach(function(c){
                    total += c.count;
                    if(c.category==='fashion')    document.getElementById('countFashion').textContent    = c.count+' items';
                    if(c.category==='stationery') document.getElementById('countStationery').textContent = c.count+' items';
                    if(c.category==='backpacks')  document.getElementById('countBackpacks').textContent  = c.count+' items';
                });
                document.getElementById('statProducts').textContent   = total+'+';
                document.getElementById('statCategories').textContent = cd.data.counts.length;
            }
            const grid = document.getElementById('trendingGrid');
            const products = (pd.data && pd.data.products) ? pd.data.products : [];
            if (products.length) {
                heroImages = products.filter(function(p){return p.image;}).map(function(p){return imgSrc(p.image);});
                if (heroImages.length) setInterval(cycleHero, 3000);
                grid.innerHTML = products.map(productCardHtml).join('');
            } else {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#6B7280">No products yet. Add products via the admin panel.</div>';
            }
        } catch(e){ console.error(e); }
    }
    function subscribeNewsletter(e) { e.preventDefault(); showToast('Thanks for subscribing! &#127881;'); e.target.reset(); }
    loadHomepage();
    </script>
</body>
</html>
`,
  "utf8",
);

// ─── shop.html ───────────────────────────────────────────────────────────────
fs.writeFileSync(
  P("shop.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop All Products - CampusCart</title>
${CSS}
</head>
<body>
${NAV("shop")}

    <div class="breadcrumb"><div class="container"><a href="/">Home</a> / <span>Shop</span></div></div>

    <section class="shop-page">
        <div class="container">
            <h1 class="section-title">All Products</h1>
            <div class="shop-layout">
                <aside class="shop-sidebar">
                    <div class="filter-section">
                        <h3>Categories</h3>
                        <div class="filter-group">
                            <label><input type="checkbox" class="cat-filter" value="fashion"> Fashion</label>
                            <label><input type="checkbox" class="cat-filter" value="stationery"> Stationery</label>
                            <label><input type="checkbox" class="cat-filter" value="backpacks"> Backpacks</label>
                        </div>
                    </div>
                    <div class="filter-section">
                        <h3>Price Range</h3>
                        <div style="display:flex;gap:.5rem">
                            <input type="number" id="minPrice" placeholder="Min" style="width:50%;padding:.4rem;border:1px solid #ddd;border-radius:6px">
                            <input type="number" id="maxPrice" placeholder="Max" style="width:50%;padding:.4rem;border:1px solid #ddd;border-radius:6px">
                        </div>
                    </div>
                    <button class="btn btn-secondary" style="width:100%;margin-top:1rem" onclick="applyFilters()">Apply Filters</button>
                    <button class="btn btn-outline"    style="width:100%;margin-top:.5rem" onclick="clearFilters()">Clear All</button>
                </aside>
                <div class="shop-main">
                    <div class="shop-header">
                        <p class="product-count" id="productCount">Loading...</p>
                        <div class="sort-options">
                            <label>Sort by:
                            <select id="sort" onchange="loadProducts(1)">
                                <option value="created_at|DESC">Newest</option>
                                <option value="rating|DESC">Top Rated</option>
                                <option value="price|ASC">Price: Low to High</option>
                                <option value="price|DESC">Price: High to Low</option>
                                <option value="review_count|DESC">Most Reviewed</option>
                            </select></label>
                        </div>
                    </div>
                    <div class="product-grid" id="productGrid">
                        <div style="grid-column:1/-1;text-align:center;padding:3rem;color:#6B7280">Loading...</div>
                    </div>
                    <div class="pagination" id="pagination"></div>
                </div>
            </div>
        </div>
    </section>

${FOOTER}
${APP_JS}
    <script>
    const LIMIT = 12;
    function loadProducts(page) {
        page = page || 1;
        const search   = (document.getElementById('searchInput').value||'').trim();
        const cats     = [...document.querySelectorAll('.cat-filter:checked')].map(function(c){return c.value;});
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        const sortVal  = document.getElementById('sort').value;
        const [sortField, sortOrder] = sortVal.split('|');
        const category = cats.length === 1 ? cats[0] : '';
        const params   = new URLSearchParams({page:page, limit:LIMIT, sort:sortField, order:sortOrder});
        if (search)   params.set('search', search);
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        document.getElementById('productGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#6B7280">Loading...</div>';
        fetch('/api/v1/products?' + params)
            .then(function(r){ return r.json(); })
            .then(function(data){
                const products = data.products || (data.data && data.data.products) || [];
                const total    = data.total    || (data.data && data.data.total)    || products.length;
                const pages    = data.pages    || (data.data && data.data.pages)    || 1;
                document.getElementById('productCount').textContent =
                    total ? 'Showing '+(((page-1)*LIMIT)+1)+'\\u2013'+Math.min(page*LIMIT,total)+' of '+total+' products' : 'No products found';
                document.getElementById('productGrid').innerHTML =
                    products.length ? products.map(productCardHtml).join('') :
                    '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#6B7280">No products found. Try different filters.</div>';
                renderPagination(page, pages);
            }).catch(function(e){ console.error(e); });
    }
    function renderPagination(cur, total) {
        const pg = document.getElementById('pagination');
        if (total <= 1) { pg.innerHTML = ''; return; }
        let h = '';
        if (cur > 1)       h += '<button class="page-btn" onclick="loadProducts('+(cur-1)+')">Prev</button>';
        for (var i=1;i<=total;i++) h += '<button class="page-btn'+(i===cur?' active':'')+'" onclick="loadProducts('+i+')">'+i+'</button>';
        if (cur < total)   h += '<button class="page-btn" onclick="loadProducts('+(cur+1)+')">Next</button>';
        pg.innerHTML = h;
    }
    function applyFilters()  { loadProducts(1); }
    function clearFilters()  {
        document.querySelectorAll('.cat-filter').forEach(function(c){c.checked=false;});
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('searchInput').value = '';
        loadProducts(1);
    }
    // Pre-fill from URL params
    (function(){
        const qs = new URLSearchParams(window.location.search);
        if (qs.get('search'))   document.getElementById('searchInput').value = qs.get('search');
        if (qs.get('category')) document.querySelectorAll('.cat-filter').forEach(function(c){if(c.value===qs.get('category'))c.checked=true;});
        loadProducts(1);
    })();
    </script>
</body>
</html>
`,
  "utf8",
);

// ─── shop-fashion.html ───────────────────────────────────────────────────────
const categoryPage = (title, category, label) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - CampusCart</title>
${CSS}
</head>
<body>
${NAV("shop")}
    <div class="breadcrumb"><div class="container"><a href="/">Home</a> / <a href="/shop">Shop</a> / <span>${label}</span></div></div>
    <section class="shop-page">
        <div class="container">
            <div class="section-header">
                <h1 class="section-title">${label}</h1>
                <p class="section-subtitle" id="productCount">Loading...</p>
            </div>
            <div class="product-grid" id="productGrid">
                <div style="grid-column:1/-1;text-align:center;padding:3rem;color:#6B7280">Loading...</div>
            </div>
        </div>
    </section>
${FOOTER}
${APP_JS}
    <script>
    fetch('/api/v1/products/category/${category}?limit=50')
        .then(function(r){ return r.json(); })
        .then(function(data){
            const products = data.products || (data.data && data.data.products) || [];
            document.getElementById('productCount').textContent = products.length + ' products';
            document.getElementById('productGrid').innerHTML = products.length
                ? products.map(productCardHtml).join('')
                : '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#6B7280">No products in this category yet.</div>';
        }).catch(function(e){ console.error(e); });
    </script>
</body>
</html>`;

fs.writeFileSync(
  P("shop-fashion.html"),
  categoryPage("Fashion", "fashion", "Fashion"),
  "utf8",
);
fs.writeFileSync(
  P("shop-stationery.html"),
  categoryPage("Stationery", "stationery", "Stationery"),
  "utf8",
);
fs.writeFileSync(
  P("shop-backpacks.html"),
  categoryPage("Backpacks", "backpacks", "Backpacks"),
  "utf8",
);

// ─── cart.html ───────────────────────────────────────────────────────────────
fs.writeFileSync(
  P("cart.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Cart - CampusCart</title>
${CSS}
</head>
<body>
${NAV("")}
    <div class="breadcrumb"><div class="container"><a href="/">Home</a> / <span>Cart</span></div></div>

    <section class="cart-page">
        <div class="container">
            <h1 class="section-title">&#128722; Your Cart</h1>
            <div id="cartContent">
                <div style="text-align:center;padding:3rem;color:#6B7280">Loading your cart...</div>
            </div>
        </div>
    </section>

${FOOTER}
${APP_JS}
    <script>
    requireAuth();

    let cartItems = [];

    async function loadCart() {
        const data = await apiFetch('/api/v1/cart').catch(function(){ return {}; });
        cartItems = (data.data && data.data.items) ? data.data.items : (data.items || []);
        renderCart();
    }

    function renderCart() {
        const el = document.getElementById('cartContent');
        if (!cartItems.length) {
            el.innerHTML = \`<div class="empty-cart" style="text-align:center;padding:4rem">
                <div style="font-size:4rem">&#128722;</div>
                <h2>Your cart is empty</h2>
                <p style="color:#6B7280;margin:1rem 0">Looks like you haven't added anything yet.</p>
                <a href="/shop" class="btn btn-primary">Start Shopping</a>
            </div>\`;
            return;
        }
        let subtotal = 0;
        const rows = cartItems.map(function(item) {
            const price = parseFloat(item.price);
            const qty   = item.quantity;
            subtotal += price * qty;
            return \`<div class="cart-item" data-id="\${item.id || item.product_id}">
                <div class="cart-item-image"><img src="\${imgSrc(item.image)}" alt="\${item.name}" onerror="this.src='/assets/placeholder.jpg'"></div>
                <div class="cart-item-info">
                    <h3><a href="/product-details?id=\${item.product_id || item.id}">\${item.name}</a></h3>
                    <p class="item-price">&#8377;\${price.toLocaleString('en-IN')}</p>
                </div>
                <div class="cart-item-qty">
                    <button onclick="changeQty(\${item.product_id || item.id}, -1)" \${qty<=1?'disabled':''}>&#8722;</button>
                    <span>\${qty}</span>
                    <button onclick="changeQty(\${item.product_id || item.id}, 1)">&#43;</button>
                </div>
                <div class="cart-item-total">&#8377;\${(price*qty).toLocaleString('en-IN')}</div>
                <button class="remove-btn" onclick="removeItem(\${item.product_id || item.id})">&#128465;&#65039;</button>
            </div>\`;
        }).join('');

        const shipping = subtotal >= 999 ? 0 : 49;
        const total = subtotal + shipping;

        el.innerHTML = \`<div class="cart-layout">
            <div class="cart-items">\${rows}</div>
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row"><span>Subtotal</span><span>&#8377;\${subtotal.toLocaleString('en-IN')}</span></div>
                <div class="summary-row"><span>Shipping</span><span>\${shipping === 0 ? '<span style="color:#10B981">FREE</span>' : '&#8377;'+shipping}</span></div>
                <div class="coupon-section" style="margin:1rem 0">
                    <input type="text" id="couponCode" placeholder="Coupon code" style="padding:.5rem;border:1px solid #ddd;border-radius:6px;width:60%">
                    <button class="btn btn-outline" style="padding:.5rem 1rem" onclick="applyCoupon()">Apply</button>
                    <p id="couponMsg" style="font-size:.85rem;margin-top:.3rem"></p>
                </div>
                <div class="summary-row summary-total"><span><strong>Total</strong></span><span id="grandTotal"><strong>&#8377;\${total.toLocaleString('en-IN')}</strong></span></div>
                <button class="btn btn-primary" style="width:100%;margin-top:1rem;padding:1rem" onclick="checkout()">Proceed to Checkout</button>
                <p style="font-size:.8rem;color:#6B7280;text-align:center;margin-top:.5rem">\${shipping===0?'You qualify for free shipping!':'Add &#8377;'+(999-subtotal).toLocaleString('en-IN')+' more for free shipping'}</p>
            </div>
        </div>\`;
    }

    async function changeQty(productId, delta) {
        const item = cartItems.find(function(i){ return (i.product_id||i.id) == productId; });
        if (!item) return;
        const newQty = item.quantity + delta;
        if (newQty < 1) return;
        await apiFetch('/api/v1/cart', { method:'PATCH', body: JSON.stringify({ productId: productId, quantity: newQty }) }).catch(function(){});
        await loadCart();
    }

    async function removeItem(productId) {
        await apiFetch('/api/v1/cart/' + productId, { method:'DELETE' }).catch(function(){});
        await loadCart();
        showToast('Item removed from cart');
    }

    let discountAmount = 0;
    async function applyCoupon() {
        const code = document.getElementById('couponCode').value.trim();
        if (!code) return;
        const data = await apiFetch('/api/v1/orders/coupon', { method:'POST', body: JSON.stringify({ code: code }) }).catch(function(){ return {error:'Invalid coupon'}; });
        const msg  = document.getElementById('couponMsg');
        if (data.discount) {
            discountAmount = data.discount;
            msg.style.color = '#10B981';
            msg.textContent = 'Coupon applied! You save &#8377;' + data.discount;
            document.getElementById('grandTotal').innerHTML = '<strong>&#8377;' + (parseFloat(document.getElementById('grandTotal').textContent.replace(/[^0-9.]/g,'')) - discountAmount).toLocaleString('en-IN') + '</strong>';
        } else {
            msg.style.color = '#EF4444';
            msg.textContent = data.message || 'Invalid coupon code';
        }
    }

    async function checkout() {
        const address = prompt('Enter your delivery address:');
        if (!address) return;
        const coupon = document.getElementById('couponCode') ? document.getElementById('couponCode').value.trim() : '';
        const data = await apiFetch('/api/v1/orders', {
            method: 'POST',
            body: JSON.stringify({ shippingAddress: address, couponCode: coupon || undefined })
        }).catch(function(){ return null; });
        if (data && (data.orderId || (data.data && data.data.orderId))) {
            showToast('Order placed successfully!');
            setTimeout(function(){ window.location.href = '/profile'; }, 1500);
        } else {
            showToast(data && data.message ? data.message : 'Failed to place order. Please try again.', 'error');
        }
    }

    loadCart();
    </script>
</body>
</html>
`,
  "utf8",
);

// ─── wishlist.html ───────────────────────────────────────────────────────────
fs.writeFileSync(
  P("wishlist.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wishlist - CampusCart</title>
${CSS}
</head>
<body>
${NAV("")}
    <div class="breadcrumb"><div class="container"><a href="/">Home</a> / <span>Wishlist</span></div></div>

    <section class="wishlist-page">
        <div class="container">
            <h1 class="section-title">&#10084;&#65039; My Wishlist</h1>
            <div class="product-grid" id="wishlistGrid">
                <div style="grid-column:1/-1;text-align:center;padding:3rem;color:#6B7280">Loading your wishlist...</div>
            </div>
        </div>
    </section>

${FOOTER}
${APP_JS}
    <script>
    requireAuth();

    async function loadWishlist() {
        const data = await apiFetch('/api/v1/wishlist').catch(function(){ return {}; });
        const items = (data.data && data.data.items) ? data.data.items : (data.items || []);
        const grid = document.getElementById('wishlistGrid');
        if (!items.length) {
            grid.innerHTML = \`<div style="grid-column:1/-1;text-align:center;padding:4rem">
                <div style="font-size:4rem">&#10084;&#65039;</div>
                <h2>Your wishlist is empty</h2>
                <p style="color:#6B7280;margin:1rem 0">Save items you love and shop them later.</p>
                <a href="/shop" class="btn btn-primary">Discover Products</a>
            </div>\`;
            return;
        }
        grid.innerHTML = items.map(function(item) {
            const p = {
                id: item.product_id || item.id,
                name: item.name,
                price: item.price,
                original_price: item.original_price,
                image: item.image,
                rating: item.rating,
                review_count: item.review_count,
            };
            return \`<div class="product-card" data-pid="\${p.id}">
                <div class="product-image-wrapper">
                    <img src="\${imgSrc(p.image)}" alt="\${p.name}" class="product-image" onerror="this.src='/assets/placeholder.jpg'">
                    <div class="product-actions">
                        <button class="wishlist-btn active" onclick="removeFromWishlist(\${p.id}, this)" title="Remove from wishlist">&#10084;&#65039;</button>
                        <a href="/product-details?id=\${p.id}" class="btn-icon" title="View details">&#128065;&#65039;</a>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name"><a href="/product-details?id=\${p.id}">\${p.name}</a></h3>
                    <div class="product-rating">\${starsHtml(p.rating)} <span>(\${p.review_count||0})</span></div>
                    <div class="product-pricing">
                        <span class="current-price">&#8377;\${parseFloat(p.price).toLocaleString('en-IN')}</span>
                        \${p.original_price && p.original_price > p.price ? '<span class="original-price">&#8377;'+parseFloat(p.original_price).toLocaleString('en-IN')+'</span>' : ''}
                    </div>
                    <div style="display:flex;gap:.5rem;margin-top:.75rem">
                        <button class="btn btn-primary" style="flex:1" onclick="moveToCart(\${p.id}, this)">Move to Cart</button>
                        <button class="btn btn-outline" onclick="removeFromWishlist(\${p.id}, this)">Remove</button>
                    </div>
                </div>
            </div>\`;
        }).join('');
    }

    async function removeFromWishlist(productId, btn) {
        btn.disabled = true;
        const data = await apiFetch('/api/v1/wishlist/toggle', { method:'POST', body: JSON.stringify({ productId: productId }) }).catch(function(){ return {}; });
        showToast('Removed from wishlist');
        const card = document.querySelector('[data-pid="'+productId+'"]');
        if (card) { card.style.opacity='0'; setTimeout(function(){ card.remove(); }, 300); }
        updateNavBadges();
    }

    async function moveToCart(productId, btn) {
        btn.disabled = true;
        btn.textContent = 'Adding...';
        const r = await apiFetch('/api/v1/cart', { method:'POST', body: JSON.stringify({ productId: productId, quantity: 1 }) }).catch(function(){ return {}; });
        if (!r.error) {
            await apiFetch('/api/v1/wishlist/toggle', { method:'POST', body: JSON.stringify({ productId: productId }) }).catch(function(){});
            showToast('Moved to cart!');
            const card = document.querySelector('[data-pid="'+productId+'"]');
            if (card) { card.style.opacity='0'; setTimeout(function(){ card.remove(); }, 300); }
            updateNavBadges();
        } else {
            btn.disabled = false; btn.textContent = 'Move to Cart';
            showToast(r.message || 'Failed to add to cart', 'error');
        }
    }

    loadWishlist();
    </script>
</body>
</html>
`,
  "utf8",
);

// ─── product-details.html ────────────────────────────────────────────────────
fs.writeFileSync(
  P("product-details.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Details - CampusCart</title>
${CSS}
</head>
<body>
${NAV("shop")}
    <div class="breadcrumb"><div class="container" id="breadcrumb"><a href="/">Home</a> / <a href="/shop">Shop</a> / <span>Loading...</span></div></div>

    <section class="product-details-page">
        <div class="container" id="productSection">
            <div style="text-align:center;padding:4rem;color:#6B7280">Loading product...</div>
        </div>
    </section>

    <section class="reviews-section">
        <div class="container">
            <h2>Customer Reviews</h2>
            <div id="reviewsContainer">
                <div style="color:#6B7280">Loading reviews...</div>
            </div>
            <div id="reviewFormSection" style="display:none;margin-top:2rem">
                <h3>Write a Review</h3>
                <form id="reviewForm" onsubmit="submitReview(event)">
                    <div style="margin-bottom:1rem">
                        <label>Rating:</label>
                        <select id="ratingInput" style="margin-left:.5rem;padding:.4rem;border:1px solid #ddd;border-radius:6px">
                            <option value="5">&#9733;&#9733;&#9733;&#9733;&#9733; (5)</option>
                            <option value="4">&#9733;&#9733;&#9733;&#9733; (4)</option>
                            <option value="3">&#9733;&#9733;&#9733; (3)</option>
                            <option value="2">&#9733;&#9733; (2)</option>
                            <option value="1">&#9733; (1)</option>
                        </select>
                    </div>
                    <textarea id="reviewComment" rows="4" placeholder="Share your experience with this product..." style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;resize:vertical" required></textarea>
                    <button type="submit" class="btn btn-primary" style="margin-top:.75rem">Submit Review</button>
                </form>
            </div>
        </div>
    </section>

${FOOTER}
${APP_JS}
    <script>
    const productId = new URLSearchParams(window.location.search).get('id');
    if (!productId) window.location.href = '/shop';

    let currentProduct = null;

    async function loadProduct() {
        const [pr, rr] = await Promise.all([
            fetch('/api/v1/products/' + productId),
            fetch('/api/v1/products/' + productId + '/reviews'),
        ]);
        const pd = await pr.json().catch(function(){ return {}; });
        const rd = await rr.json().catch(function(){ return {}; });

        const p = pd.product || pd.data || pd;
        if (!p || !p.id) {
            document.getElementById('productSection').innerHTML = '<div style="text-align:center;padding:4rem"><h2>Product not found</h2><a href="/shop" class="btn btn-primary">Back to Shop</a></div>';
            return;
        }
        currentProduct = p;
        document.title = p.name + ' - CampusCart';
        document.getElementById('breadcrumb').innerHTML = '<a href="/">Home</a> / <a href="/shop">Shop</a> / <a href="/shop?category='+(p.category||'')+'">'+ucfirst(p.category||'')+'</a> / <span>'+p.name+'</span>';

        const discount = p.original_price && p.original_price > p.price ? Math.round((1 - p.price/p.original_price)*100) : 0;
        const inStock  = p.stock > 0;

        document.getElementById('productSection').innerHTML = \`
            <div class="product-details-layout">
                <div class="product-gallery">
                    <div class="main-image-wrapper">
                        <img src="\${imgSrc(p.image)}" alt="\${p.name}" class="main-product-image" id="mainImage" onerror="this.src='/assets/placeholder.jpg'">
                        \${discount ? '<span class="discount-badge">-'+discount+'%</span>' : ''}
                        \${!inStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
                    </div>
                </div>
                <div class="product-info-panel">
                    <div class="product-category-tag">\${ucfirst(p.category||'')}</div>
                    <h1 class="product-title">\${p.name}</h1>
                    <div class="product-rating-row">
                        \${starsHtml(p.rating)}
                        <span class="rating-value">\${parseFloat(p.rating||0).toFixed(1)}</span>
                        <span class="review-count">(\${p.review_count||0} reviews)</span>
                    </div>
                    <div class="product-pricing large">
                        <span class="current-price">&#8377;\${parseFloat(p.price).toLocaleString('en-IN')}</span>
                        \${p.original_price && p.original_price > p.price ? '<span class="original-price">&#8377;'+parseFloat(p.original_price).toLocaleString('en-IN')+'</span><span class="savings-badge">Save '+discount+'%</span>' : ''}
                    </div>
                    <div class="stock-status \${inStock?'in-stock':'out-of-stock'}">\${inStock ? '&#10003; In Stock ('+p.stock+' available)' : '&#10007; Out of Stock'}</div>
                    <p class="product-description">\${p.description || ''}</p>
                    \${p.brand ? '<p class="product-brand"><strong>Brand:</strong> '+p.brand+'</p>' : ''}
                    <div class="quantity-selector" style="display:flex;align-items:center;gap:1rem;margin:1.5rem 0">
                        <label><strong>Qty:</strong></label>
                        <div style="display:flex;align-items:center;gap:.5rem">
                            <button onclick="changeDetailQty(-1)" style="width:2rem;height:2rem;border:1px solid #ddd;border-radius:4px;cursor:pointer">&#8722;</button>
                            <span id="qtyDisplay" style="font-size:1.1rem;min-width:2rem;text-align:center">1</span>
                            <button onclick="changeDetailQty(1)"  style="width:2rem;height:2rem;border:1px solid #ddd;border-radius:4px;cursor:pointer">&#43;</button>
                        </div>
                    </div>
                    <div class="product-actions-panel" style="display:flex;gap:1rem">
                        <button class="btn btn-primary" style="flex:1;padding:1rem" onclick="addToCartDetail()" \${!inStock?'disabled':''}>
                            &#128722; \${inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button class="btn btn-outline wishlist-btn" id="wishlistBtn" onclick="toggleWishlist(\${p.id}, this)" style="padding:1rem 1.5rem" title="Add to Wishlist">&#10084;&#65039;</button>
                    </div>
                </div>
            </div>
        \`;

        // Reviews
        const reviews = rd.reviews || (rd.data && rd.data.reviews) || [];
        renderReviews(reviews);
        if (isLoggedIn()) document.getElementById('reviewFormSection').style.display = 'block';
    }

    let detailQty = 1;
    function changeDetailQty(d) {
        detailQty = Math.max(1, detailQty + d);
        document.getElementById('qtyDisplay').textContent = detailQty;
    }
    function addToCartDetail() {
        addToCart(productId, document.querySelector('.product-actions-panel .btn-primary'), detailQty);
    }

    function ucfirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

    function renderReviews(reviews) {
        const el = document.getElementById('reviewsContainer');
        if (!reviews.length) {
            el.innerHTML = '<p style="color:#6B7280">No reviews yet. Be the first to review!</p>';
            return;
        }
        el.innerHTML = reviews.map(function(r) {
            const d = new Date(r.created_at).toLocaleDateString('en-IN', {year:'numeric',month:'short',day:'numeric'});
            return \`<div class="review-card" style="border:1px solid #e5e7eb;border-radius:10px;padding:1.25rem;margin-bottom:1rem">
                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
                    <div>
                        <strong>\${r.user_name || 'Anonymous'}</strong>
                        <span style="margin-left:.75rem;color:#F59E0B">\${starsHtml(r.rating)}</span>
                    </div>
                    <span style="color:#9CA3AF;font-size:.875rem">\${d}</span>
                </div>
                <p style="color:#374151;margin:0">\${r.comment || ''}</p>
            </div>\`;
        }).join('');
    }

    async function submitReview(e) {
        e.preventDefault();
        const rating  = parseInt(document.getElementById('ratingInput').value);
        const comment = document.getElementById('reviewComment').value.trim();
        const data = await apiFetch('/api/v1/products/'+productId+'/reviews', {
            method:'POST', body: JSON.stringify({ rating: rating, comment: comment })
        }).catch(function(){ return {}; });
        if (data.message && !data.error) {
            showToast('Review submitted!');
            document.getElementById('reviewForm').reset();
            loadProduct();
        } else {
            showToast(data.message || 'Failed to submit review', 'error');
        }
    }

    loadProduct();
    </script>
</body>
</html>
`,
  "utf8",
);

// ─── profile.html ────────────────────────────────────────────────────────────
fs.writeFileSync(
  P("profile.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - CampusCart</title>
${CSS}
</head>
<body>
${NAV("")}
    <section class="profile-page">
        <div class="container">
            <div class="profile-layout">
                <!-- Sidebar -->
                <aside class="profile-sidebar">
                    <div class="user-card">
                        <div class="user-avatar" id="userAvatar" style="width:80px;height:80px;border-radius:50%;background:#4F46E5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;margin:0 auto 1rem">&#128100;</div>
                        <h3 id="sidebarName">Loading...</h3>
                        <p id="sidebarEmail" style="color:#6B7280;font-size:.9rem"></p>
                    </div>
                    <nav class="profile-nav">
                        <a href="#" class="profile-nav-item active" data-tab="dashboard" onclick="switchTab('dashboard',this)">&#127968; Dashboard</a>
                        <a href="#" class="profile-nav-item" data-tab="orders" onclick="switchTab('orders',this)">&#128230; My Orders</a>
                        <a href="#" class="profile-nav-item" data-tab="addresses" onclick="switchTab('addresses',this)">&#128205; Addresses</a>
                        <a href="#" class="profile-nav-item" data-tab="settings" onclick="switchTab('settings',this)">&#9881;&#65039; Settings</a>
                        <a href="#" class="profile-nav-item" onclick="logout()" style="color:#EF4444">&#128274; Logout</a>
                    </nav>
                </aside>

                <!-- Content -->
                <div class="profile-content">
                    <!-- Dashboard Tab -->
                    <div class="tab-panel active" id="tab-dashboard">
                        <h2>Dashboard</h2>
                        <div class="stats-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:1.5rem 0">
                            <div class="stat-card" style="background:#F0FDF4;border-radius:12px;padding:1.5rem;text-align:center">
                                <div style="font-size:2rem;color:#10B981" id="statOrders">0</div>
                                <p style="color:#6B7280;margin:0">Total Orders</p>
                            </div>
                            <div class="stat-card" style="background:#FFF7ED;border-radius:12px;padding:1.5rem;text-align:center">
                                <div style="font-size:2rem;color:#F59E0B" id="statPending">0</div>
                                <p style="color:#6B7280;margin:0">Pending</p>
                            </div>
                            <div class="stat-card" style="background:#EFF6FF;border-radius:12px;padding:1.5rem;text-align:center">
                                <div style="font-size:2rem;color:#3B82F6" id="statSpent">&#8377;0</div>
                                <p style="color:#6B7280;margin:0">Total Spent</p>
                            </div>
                        </div>
                        <h3>Recent Orders</h3>
                        <div id="recentOrders"><div style="color:#6B7280">Loading...</div></div>
                    </div>

                    <!-- Orders Tab -->
                    <div class="tab-panel" id="tab-orders" style="display:none">
                        <h2>My Orders</h2>
                        <div id="allOrders"><div style="color:#6B7280">Loading...</div></div>
                    </div>

                    <!-- Addresses Tab -->
                    <div class="tab-panel" id="tab-addresses" style="display:none">
                        <h2>Saved Addresses</h2>
                        <div id="addressList"><div style="color:#6B7280">Loading...</div></div>
                    </div>

                    <!-- Settings Tab -->
                    <div class="tab-panel" id="tab-settings" style="display:none">
                        <h2>Account Settings</h2>
                        <form id="profileForm" onsubmit="saveProfile(event)" style="max-width:500px">
                            <div class="form-group" style="margin-bottom:1rem">
                                <label>Full Name</label>
                                <input type="text" id="settingsName" class="form-input" style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;margin-top:.3rem">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem">
                                <label>Email</label>
                                <input type="email" id="settingsEmail" class="form-input" style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;margin-top:.3rem">
                            </div>
                            <div class="form-group" style="margin-bottom:1.5rem">
                                <label>Phone</label>
                                <input type="tel" id="settingsPhone" class="form-input" style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;margin-top:.3rem">
                            </div>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </form>
                        <hr style="margin:2rem 0">
                        <h3>Change Password</h3>
                        <form id="passwordForm" onsubmit="changePassword(event)" style="max-width:500px">
                            <div class="form-group" style="margin-bottom:1rem">
                                <label>Current Password</label>
                                <input type="password" id="currentPass" class="form-input" style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;margin-top:.3rem" required>
                            </div>
                            <div class="form-group" style="margin-bottom:1rem">
                                <label>New Password</label>
                                <input type="password" id="newPass" class="form-input" style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;margin-top:.3rem" required>
                            </div>
                            <div class="form-group" style="margin-bottom:1.5rem">
                                <label>Confirm New Password</label>
                                <input type="password" id="confirmPass" class="form-input" style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;margin-top:.3rem" required>
                            </div>
                            <button type="submit" class="btn btn-secondary">Update Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

${FOOTER}
${APP_JS}
    <script>
    requireAuth();

    function switchTab(tabName, el) {
        document.querySelectorAll('.tab-panel').forEach(function(p){ p.style.display='none'; });
        document.getElementById('tab-'+tabName).style.display = 'block';
        document.querySelectorAll('.profile-nav-item').forEach(function(a){ a.classList.remove('active'); });
        if (el) el.classList.add('active');
    }

    function logout() {
        clearAuth();
        window.location.href = '/login';
    }

    function orderStatusBadge(status) {
        const colors = { pending:'#F59E0B', processing:'#3B82F6', shipped:'#8B5CF6', delivered:'#10B981', cancelled:'#EF4444' };
        const color  = colors[status] || '#6B7280';
        return '<span style="background:'+color+'20;color:'+color+';padding:.2rem .6rem;border-radius:20px;font-size:.8rem;font-weight:600">'+status.charAt(0).toUpperCase()+status.slice(1)+'</span>';
    }

    function renderOrders(orders, containerId) {
        const el = document.getElementById(containerId);
        if (!orders.length) { el.innerHTML = '<p style="color:#6B7280">No orders yet. <a href="/shop">Start shopping!</a></p>'; return; }
        el.innerHTML = '<table style="width:100%;border-collapse:collapse">' +
            '<thead><tr style="border-bottom:2px solid #e5e7eb">' +
            '<th style="text-align:left;padding:.75rem">Order ID</th>' +
            '<th style="text-align:left;padding:.75rem">Date</th>' +
            '<th style="text-align:right;padding:.75rem">Amount</th>' +
            '<th style="text-align:center;padding:.75rem">Status</th></tr></thead><tbody>' +
            orders.map(function(o) {
                const d = new Date(o.created_at).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'});
                return '<tr style="border-bottom:1px solid #f3f4f6">' +
                    '<td style="padding:.75rem"><a href="#" style="color:#4F46E5">#ORD-' + String(o.id).padStart(4,'0') + '</a></td>' +
                    '<td style="padding:.75rem">' + d + '</td>' +
                    '<td style="padding:.75rem;text-align:right">&#8377;' + parseFloat(o.total_amount||o.amount||0).toLocaleString('en-IN') + '</td>' +
                    '<td style="padding:.75rem;text-align:center">' + orderStatusBadge(o.status||'pending') + '</td></tr>';
            }).join('') + '</tbody></table>';
    }

    async function loadProfile() {
        const [userRes, ordersRes] = await Promise.all([
            apiFetch('/api/v1/users/profile').catch(function(){ return {}; }),
            apiFetch('/api/v1/orders').catch(function(){ return {}; }),
        ]);

        const user   = userRes.user || userRes.data || userRes;
        const orders = ordersRes.orders || (ordersRes.data && ordersRes.data.orders) || [];

        if (user && user.name) {
            document.getElementById('sidebarName').textContent  = user.name;
            document.getElementById('sidebarEmail').textContent = user.email || '';
            document.getElementById('settingsName').value  = user.name  || '';
            document.getElementById('settingsEmail').value = user.email || '';
            document.getElementById('settingsPhone').value = user.phone || '';
            document.title = user.name + ' - CampusCart';
        }

        const pending = orders.filter(function(o){ return o.status === 'pending' || o.status === 'processing'; });
        const spent   = orders.reduce(function(s,o){ return s + parseFloat(o.total_amount||o.amount||0); }, 0);
        document.getElementById('statOrders').textContent  = orders.length;
        document.getElementById('statPending').textContent = pending.length;
        document.getElementById('statSpent').textContent   = '&#8377;' + spent.toLocaleString('en-IN');

        renderOrders(orders.slice(0,5), 'recentOrders');
        renderOrders(orders, 'allOrders');

        // Addresses placeholder (no DB table shown in requirements but handle gracefully)
        const addrRes = await apiFetch('/api/v1/users/addresses').catch(function(){ return {}; });
        const addrs   = addrRes.addresses || (addrRes.data && addrRes.data.addresses) || [];
        const addrEl  = document.getElementById('addressList');
        if (addrs.length) {
            addrEl.innerHTML = addrs.map(function(a){
                return '<div style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem;margin-bottom:1rem"><p style="margin:0">'+a.address_line+'<br>'+a.city+', '+a.state+' '+a.pincode+'</p></div>';
            }).join('') + '<button class="btn btn-outline" style="margin-top:1rem" onclick="addAddress()">+ Add New Address</button>';
        } else {
            addrEl.innerHTML = '<p style="color:#6B7280">No saved addresses.</p><button class="btn btn-outline" onclick="addAddress()">+ Add Address</button>';
        }
    }

    function addAddress() {
        const addr = prompt('Enter your address:');
        if (!addr) return;
        apiFetch('/api/v1/users/addresses', { method:'POST', body: JSON.stringify({ address: addr }) }).then(function(){
            showToast('Address saved!'); loadProfile();
        }).catch(function(){});
    }

    async function saveProfile(e) {
        e.preventDefault();
        const data = await apiFetch('/api/v1/users/profile', {
            method:'PUT',
            body: JSON.stringify({
                name:  document.getElementById('settingsName').value.trim(),
                email: document.getElementById('settingsEmail').value.trim(),
                phone: document.getElementById('settingsPhone').value.trim(),
            })
        }).catch(function(){ return {}; });
        if (!data.error) { showToast('Profile updated!'); loadProfile(); }
        else showToast(data.message || 'Failed to update profile', 'error');
    }

    async function changePassword(e) {
        e.preventDefault();
        const np = document.getElementById('newPass').value;
        const cp = document.getElementById('confirmPass').value;
        if (np !== cp) { showToast('Passwords do not match', 'error'); return; }
        const data = await apiFetch('/api/v1/users/password', {
            method:'PATCH',
            body: JSON.stringify({ currentPassword: document.getElementById('currentPass').value, newPassword: np })
        }).catch(function(){ return {}; });
        if (!data.error) { showToast('Password updated!'); document.getElementById('passwordForm').reset(); }
        else showToast(data.message || 'Failed to update password', 'error');
    }

    // Handle tab from URL hash
    const hash = window.location.hash.replace('#','');
    if (hash && document.getElementById('tab-'+hash)) {
        const link = document.querySelector('[data-tab="'+hash+'"]');
        switchTab(hash, link);
    }

    loadProfile();
    </script>
</body>
</html>
`,
  "utf8",
);

// ─── login.html ──────────────────────────────────────────────────────────────
fs.writeFileSync(
  P("login.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CampusCart</title>
${CSS}
    <style>
    .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F9FAFB;padding:2rem}
    .auth-card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:2.5rem;width:100%;max-width:420px}
    .auth-logo{text-align:center;font-size:1.75rem;font-weight:700;color:#4F46E5;margin-bottom:.5rem}
    .auth-subtitle{text-align:center;color:#6B7280;margin-bottom:2rem}
    .form-group{margin-bottom:1.25rem}
    .form-group label{display:block;font-weight:600;margin-bottom:.4rem;color:#374151}
    .form-input{width:100%;padding:.75rem 1rem;border:1.5px solid #E5E7EB;border-radius:8px;font-size:1rem;outline:none;transition:border .2s}
    .form-input:focus{border-color:#4F46E5;box-shadow:0 0 0 3px #4F46E520}
    .auth-btn{width:100%;padding:.875rem;font-size:1rem;font-weight:600;margin-top:.5rem}
    .auth-links{text-align:center;margin-top:1.25rem;color:#6B7280}
    .auth-links a{color:#4F46E5;font-weight:600}
    .error-msg{background:#FEF2F2;color:#DC2626;border:1px solid #FCA5A5;border-radius:8px;padding:.75rem;margin-bottom:1rem;display:none}
    </style>
</head>
<body>
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-logo"><a href="/" style="text-decoration:none;color:inherit">&#127890; CampusCart</a></div>
            <p class="auth-subtitle">Welcome back! Sign in to your account</p>
            <div class="error-msg" id="errorMsg"></div>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" class="form-input" placeholder="you@example.com" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" class="form-input" placeholder="Enter your password" required autocomplete="current-password">
                </div>
                <button type="submit" class="btn btn-primary auth-btn" id="submitBtn">Sign In</button>
            </form>
            <div class="auth-links">
                <p>Don't have an account? <a href="/register">Create one</a></p>
            </div>
        </div>
    </div>

    <script src="/js/app.js"></script>
    <script>
    // Redirect if already logged in
    if (isLoggedIn()) {
        const next = new URLSearchParams(window.location.search).get('next') || '/profile';
        window.location.href = next;
    }

    async function handleLogin(e) {
        e.preventDefault();
        const btn  = document.getElementById('submitBtn');
        const err  = document.getElementById('errorMsg');
        btn.disabled = true; btn.textContent = 'Signing in...';
        err.style.display = 'none';

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const data = await fetch('/api/v1/auth/login', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ email, password })
        }).then(function(r){ return r.json(); }).catch(function(){ return {}; });

        if (data.token) {
            setAuth(data.token, data.user || { name: email.split('@')[0] });
            const next = new URLSearchParams(window.location.search).get('next') || '/';
            window.location.href = next;
        } else {
            err.textContent  = data.message || 'Invalid email or password. Please try again.';
            err.style.display = 'block';
            btn.disabled = false; btn.textContent = 'Sign In';
        }
    }
    </script>
</body>
</html>
`,
  "utf8",
);

// ─── register.html ───────────────────────────────────────────────────────────
fs.writeFileSync(
  P("register.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - CampusCart</title>
${CSS}
    <style>
    .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F9FAFB;padding:2rem}
    .auth-card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:2.5rem;width:100%;max-width:460px}
    .auth-logo{text-align:center;font-size:1.75rem;font-weight:700;color:#4F46E5;margin-bottom:.5rem}
    .auth-subtitle{text-align:center;color:#6B7280;margin-bottom:2rem}
    .form-group{margin-bottom:1.25rem}
    .form-group label{display:block;font-weight:600;margin-bottom:.4rem;color:#374151}
    .form-input{width:100%;padding:.75rem 1rem;border:1.5px solid #E5E7EB;border-radius:8px;font-size:1rem;outline:none;transition:border .2s}
    .form-input:focus{border-color:#4F46E5;box-shadow:0 0 0 3px #4F46E520}
    .auth-btn{width:100%;padding:.875rem;font-size:1rem;font-weight:600;margin-top:.5rem}
    .auth-links{text-align:center;margin-top:1.25rem;color:#6B7280}
    .auth-links a{color:#4F46E5;font-weight:600}
    .error-msg{background:#FEF2F2;color:#DC2626;border:1px solid #FCA5A5;border-radius:8px;padding:.75rem;margin-bottom:1rem;display:none}
    .success-msg{background:#F0FDF4;color:#16A34A;border:1px solid #86EFAC;border-radius:8px;padding:.75rem;margin-bottom:1rem;display:none}
    </style>
</head>
<body>
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-logo"><a href="/" style="text-decoration:none;color:inherit">&#127890; CampusCart</a></div>
            <p class="auth-subtitle">Create your account and start shopping</p>
            <div class="error-msg"   id="errorMsg"></div>
            <div class="success-msg" id="successMsg"></div>
            <form id="registerForm" onsubmit="handleRegister(event)">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" class="form-input" placeholder="John Doe" required>
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" class="form-input" placeholder="you@example.com" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" class="form-input" placeholder="At least 6 characters" required minlength="6" autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" class="form-input" placeholder="Repeat your password" required autocomplete="new-password">
                </div>
                <button type="submit" class="btn btn-primary auth-btn" id="submitBtn">Create Account</button>
            </form>
            <div class="auth-links">
                <p>Already have an account? <a href="/login">Sign in</a></p>
            </div>
        </div>
    </div>

    <script src="/js/app.js"></script>
    <script>
    if (isLoggedIn()) window.location.href = '/profile';

    async function handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const err = document.getElementById('errorMsg');
        const suc = document.getElementById('successMsg');
        err.style.display = 'none'; suc.style.display = 'none';
        btn.disabled = true; btn.textContent = 'Creating account...';

        const name     = document.getElementById('name').value.trim();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm  = document.getElementById('confirmPassword').value;

        if (password !== confirm) {
            err.textContent = 'Passwords do not match.'; err.style.display = 'block';
            btn.disabled = false; btn.textContent = 'Create Account'; return;
        }

        const data = await fetch('/api/v1/auth/register', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ name, email, password })
        }).then(function(r){ return r.json(); }).catch(function(){ return {}; });

        if (data.token) {
            setAuth(data.token, data.user || { name: name, email: email });
            suc.textContent = 'Account created! Redirecting...'; suc.style.display = 'block';
            setTimeout(function(){ window.location.href = '/'; }, 1000);
        } else {
            err.textContent = data.message || 'Registration failed. Please try again.';
            err.style.display = 'block';
            btn.disabled = false; btn.textContent = 'Create Account';
        }
    }
    </script>
</body>
</html>
`,
  "utf8",
);

console.log("All pages written successfully!");
console.log("Files updated:");
[
  "index.html",
  "shop.html",
  "shop-fashion.html",
  "shop-stationery.html",
  "shop-backpacks.html",
  "cart.html",
  "wishlist.html",
  "product-details.html",
  "profile.html",
  "login.html",
  "register.html",
].forEach(function (f) {
  console.log("  - pages/" + f);
});
