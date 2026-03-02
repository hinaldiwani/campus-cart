/**
 * public/js/app.js — CampusCart shared frontend utilities
 * Included on every page via <script src="/js/app.js"></script>
 */

const API = "/api/v1";

/* ── Auth helpers ─────────────────────────────────── */
function getToken() {
  return localStorage.getItem("cc_token");
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("cc_user"));
  } catch {
    return null;
  }
}
function isLoggedIn() {
  return !!getToken();
}
function setAuth(token, user) {
  localStorage.setItem("cc_token", token);
  localStorage.setItem("cc_user", JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem("cc_token");
  localStorage.removeItem("cc_user");
}

function requireAuth(redirect = "/login") {
  if (!isLoggedIn()) {
    window.location.href =
      redirect + "?next=" + encodeURIComponent(window.location.pathname);
  }
}

/* ── Fetch wrapper ────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearAuth();
    window.location.href =
      "/login?next=" + encodeURIComponent(window.location.pathname);
  }
  return { ok: res.ok, status: res.status, data };
}

/* ── Navbar badge updater ─────────────────────────── */
async function updateNavBadges() {
  const cartBadges = document.querySelectorAll(
    '.icon-link[href="/cart"] .badge',
  );
  const wishlistBadges = document.querySelectorAll(
    '.icon-link[href="/wishlist"] .badge',
  );

  if (!isLoggedIn()) {
    cartBadges.forEach((b) => (b.textContent = "0"));
    wishlistBadges.forEach((b) => (b.textContent = "0"));
    return;
  }
  try {
    const [cartRes, wlRes] = await Promise.all([
      apiFetch("/cart"),
      apiFetch("/wishlist"),
    ]);
    cartBadges.forEach(
      (b) =>
        (b.textContent = cartRes.ok
          ? (cartRes.data.data?.itemCount ?? 0)
          : "0"),
    );
    wishlistBadges.forEach(
      (b) => (b.textContent = wlRes.ok ? (wlRes.data.results ?? 0) : "0"),
    );
  } catch {
    /* silent */
  }
}

/* ── Product image helper ─────────────────────────── */
function imgSrc(image) {
  if (!image) return "/assets/placeholder.jpg";
  if (image.startsWith("/") || image.startsWith("http")) return image;
  return "/assets/" + image;
}

/* ── Render star rating ──────────────────────────── */
function starsHtml(rating = 5) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "⭐".repeat(full) + (half ? "✨" : "") + "☆".repeat(empty);
}

function ratingStars(r) {
  const filled = Math.round(r);
  return "⭐".repeat(filled) + "☆".repeat(5 - filled);
}

/* ── Product card HTML ────────────────────────────── */
function productCardHtml(p) {
  const badge = p.badge ? `<div class="product-badge">${p.badge}</div>` : "";
  const origPx = p.original_price
    ? `<span class="original-price">₹${p.original_price}</span>`
    : "";
  const outStock =
    p.stock < 1 ? ' style="opacity:.55;pointer-events:none"' : "";
  return `
<div class="product-card" data-id="${p.id}">
  ${badge}
  <div class="product-image">
    <img src="${imgSrc(p.image)}" alt="${p.name}" onerror="this.src='/assets/placeholder.jpg'">
    <button class="wishlist-btn" onclick="toggleWishlist(${p.id},this)" title="Add to Wishlist">❤️</button>
  </div>
  <div class="product-info">
    <h3><a href="/product-details?id=${p.id}">${p.name}</a></h3>
    <div class="rating">
      <span>${ratingStars(p.rating || 5)}</span>
      <span>(${p.review_count || 0})</span>
    </div>
    <div class="price">
      <span class="current-price">₹${p.price}</span>
      ${origPx}
    </div>
    <button class="btn btn-primary btn-small"${outStock} onclick="addToCart(${p.id},this)">
      ${p.stock < 1 ? "Out of Stock" : "Add to Cart"}
    </button>
  </div>
</div>`;
}

/* ── Add to Cart ──────────────────────────────────── */
async function addToCart(productId, btn, quantity) {
  quantity = quantity || 1;
  if (!isLoggedIn()) {
    window.location.href =
      "/login?next=" + encodeURIComponent(window.location.pathname);
    return;
  }
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Adding…";
  const { ok, data } = await apiFetch("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity: quantity }),
  });
  btn.disabled = false;
  if (ok) {
    btn.textContent = "✓ Added!";
    updateNavBadges();
    setTimeout(() => (btn.textContent = origText), 1500);
  } else {
    btn.textContent = origText;
    alert(data.message || "Could not add to cart.");
  }
}

/* ── Toggle Wishlist ──────────────────────────────── */
async function toggleWishlist(productId, btn) {
  if (!isLoggedIn()) {
    window.location.href =
      "/login?next=" + encodeURIComponent(window.location.pathname);
    return;
  }
  const { ok, data } = await apiFetch("/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
  if (ok) {
    btn.style.opacity = data.data.wishlisted ? "1" : "0.4";
    updateNavBadges();
  }
}

/* ── Toast notification ───────────────────────────── */
function showToast(msg, type = "success") {
  let t = document.getElementById("cc-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cc-toast";
    t.style.cssText =
      "position:fixed;bottom:1.5rem;right:1.5rem;padding:.75rem 1.25rem;border-radius:8px;font-weight:600;font-size:.9rem;z-index:9999;transition:opacity .3s;box-shadow:0 4px 16px rgba(0,0,0,.18)";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = type === "error" ? "#EF4444" : "#10B981";
  t.style.color = "#fff";
  t.style.opacity = "1";
  clearTimeout(t._tid);
  t._tid = setTimeout(() => (t.style.opacity = "0"), 3000);
}

/* ── Global search helper (used by inline onclick) ── */
function goSearch() {
  const inp =
    document.getElementById("searchInput") ||
    document.querySelector(".search-bar input");
  const q = inp ? inp.value.trim() : "";
  if (q) window.location.href = "/shop?search=" + encodeURIComponent(q);
}

/* ── Navbar auth state ────────────────────────────── */
function syncAuthNav() {
  const user = getUser();
  const profileLinks = document.querySelectorAll('.icon-link[href="/profile"]');
  if (user) {
    profileLinks.forEach((a) => (a.title = user.name || "Profile"));
  }
}

/* ── Run on every page ────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  syncAuthNav();
  updateNavBadges();

  // Search bar
  const searchBtn = document.querySelector(".search-btn");
  const searchInput = document.querySelector(".search-bar input");
  if (searchBtn && searchInput) {
    const doSearch = () => {
      const q = searchInput.value.trim();
      if (q) window.location.href = "/shop?search=" + encodeURIComponent(q);
    };
    searchBtn.addEventListener("click", doSearch);
    searchInput.addEventListener(
      "keydown",
      (e) => e.key === "Enter" && doSearch(),
    );
  }
});
