/**
 * fix-html.js - directly patches the generated HTML pages
 * Fixes: apiFetch('/api/v1/...') -> apiFetch('/...')
 * And fixes data access patterns for apiFetch response structure
 */
const fs = require("fs");
const path = require("path");
const PAGES = "c:/CLG ECOM WEB/campus-cart/pages";

const FILES = [
  "cart.html",
  "wishlist.html",
  "product-details.html",
  "profile.html",
];

FILES.forEach(function (fname) {
  const fpath = path.join(PAGES, fname);
  if (!fs.existsSync(fpath)) {
    console.log("SKIP:", fname);
    return;
  }

  let html = fs.readFileSync(fpath, "utf8");

  // Fix 1: Remove /api/v1 prefix from apiFetch calls
  html = html.replace(/apiFetch\('\/api\/v1\//g, "apiFetch('/");

  // Fix 2: Fix apiFetch response destructuring
  // apiFetch returns {ok,status,data} where data=parsedJSON={status,data:{...}}
  // Replace: const data = await apiFetch('/cart').catch(...)
  //   with: const {ok:_cok, data:_cd} = await apiFetch('/cart').catch(...)

  if (fname === "cart.html") {
    html = html.replace(
      `const data = await apiFetch('/cart').catch(function(){ return {}; });`,
      `const {ok:_ok, data:_resp} = await apiFetch('/cart').catch(function(){ return {ok:false,data:{}}; });\n        const _sum = (_resp && _resp.data) ? _resp.data : {};`,
    );
    html = html.replace(
      `cartItems = (data.data && data.data.items) ? data.data.items : (data.items || []);`,
      `cartItems = _sum.items || [];`,
    );
    html = html.replace(
      `const data = await apiFetch('/orders/coupon',`,
      `const {ok:_cok, data:_cdata} = await apiFetch('/orders/coupon',`,
    );
    html = html.replace(
      `}).catch(function(){ return {error:'Invalid coupon'}; });`,
      `}).catch(function(){ return {ok:false, data:{status:'fail',message:'Invalid coupon'}}; });`,
    );
    html = html.replace(
      `if (data.discount) {`,
      `const data = _cdata || {};\n        if (data.data && data.data.discount) { data.discount = data.data.discount; }\n        if (data.discount || (data.data && data.data.discount)) {`,
    );
    html = html.replace(
      `const data = await apiFetch('/orders', {\n            method: 'POST',`,
      `const {ok:_ook, data:_oresp} = await apiFetch('/orders', {\n            method: 'POST',`,
    );
    html = html.replace(
      `}).catch(function(){ return null; });`,
      `}).catch(function(){ return {ok:false, data:{}}; });`,
    );
    html = html.replace(
      `if (data && (data.orderId || (data.data && (data.data.orderId || data.data.id)))) {`,
      `const _od = (_oresp && _oresp.data) ? _oresp.data : (_oresp || {});\n        if (_ook && (_od.orderId || _od.id)) {`,
    );
    html = html.replace(
      `showToast('Order placed successfully!');\n            setTimeout(function(){ window.location.href = '/profile'; }, 1500);\n        } else {\n            showToast(data && data.message ? data.message : 'Failed to place order. Please try again.', 'error');`,
      `showToast('Order placed successfully!');\n            setTimeout(function(){ window.location.href = '/profile'; }, 1500);\n        } else {\n            showToast((_oresp && _oresp.message) || 'Failed to place order. Please try again.', 'error');`,
    );
  }

  if (fname === "wishlist.html") {
    html = html.replace(
      `const data = await apiFetch('/wishlist').catch(function(){ return {}; });`,
      `const {ok:_wok, data:_wr} = await apiFetch('/wishlist').catch(function(){ return {ok:false,data:{}}; });`,
    );
    html = html.replace(
      `const items = (_wl.data && _wl.data.data && _wl.data.data.items) ? _wl.data.data.items : [];`,
      `const items = (_wr && _wr.data && _wr.data.items) ? _wr.data.items : [];`,
    );
    // Already fixed by apiFetch path fix above
  }

  if (fname === "product-details.html") {
    html = html.replace(
      `const [pr, rr] = await Promise.all([\n            fetch('/api/v1/products/' + productId),\n            fetch('/api/v1/products/' + productId + '/reviews'),\n        ]);`,
      `const [pr, rr] = await Promise.all([\n            fetch('/api/v1/products/' + productId),\n            fetch('/api/v1/products/' + productId + '/reviews'),\n        ]);`,
    );
    // Fix review submit
    html = html.replace(
      `const _rev = await apiFetch('/products/'+productId+'/reviews', {`,
      `const _rev = await apiFetch('/products/'+productId+'/reviews', {`,
    );
    html = html.replace(
      `const _revData = _rev.data || {};\n        if (_rev.ok) {`,
      `const _revData = (_rev && _rev.data) ? _rev.data : {};\n        if (_rev && _rev.ok) {`,
    );
  }

  if (fname === "profile.html") {
    html = html.replace(
      `apiFetch('/users/profile').catch(function(){ return {ok:false,data:{}}; }),\n            apiFetch('/orders').catch(function(){ return {ok:false,data:{}}; }),`,
      `apiFetch('/users/profile').catch(function(){ return {ok:false,data:{}}; }),\n            apiFetch('/orders').catch(function(){ return {ok:false,data:{}}; }),`,
    );
    html = html.replace(
      `const user   = (userRes.user || userRes.data || userRes);`,
      `const _ur = userRes.data || {}; const user = (_ur.data && _ur.data.user) ? _ur.data.user : (_ur.user || {});`,
    );
    // Fix this too - the version written might have a different variant
    html = html.replace(
      `const user   = (userRes.data && userRes.data.data && userRes.data.data.user) ? userRes.data.data.user : {};`,
      `const _ur = userRes.data || {}; const user = (_ur.data && _ur.data.user) ? _ur.data.user : (_ur.user || {});`,
    );
    html = html.replace(
      `const orders = (ordersRes.data && ordersRes.data.data && ordersRes.data.data.orders) ? ordersRes.data.data.orders : (ordersRes.data && ordersRes.data.orders ? ordersRes.data.orders : []);`,
      `const _or = ordersRes.data || {}; const orders = (_or.data && _or.data.orders) ? _or.data.orders : (_or.orders || []);`,
    );
    html = html.replace(
      `const addrRes = await apiFetch('/users/addresses').catch(function(){ return {}; });`,
      `const {ok:_aok, data:_addrData} = await apiFetch('/users/addresses').catch(function(){ return {ok:false,data:{}}; });\n        const addrRes = _addrData || {};`,
    );
    html = html.replace(
      `const addrs   = (addrRes.data && addrRes.addresses) ? addrRes.data.addresses : (addrRes.addresses || []);`,
      `const addrs = (addrRes.data && addrRes.data.addresses) ? addrRes.data.addresses : (addrRes.addresses || []);`,
    );
    // Fix saveProfile
    html = html.replace(
      `const _pu = await apiFetch('/users/profile', {`,
      `const {ok:_puok,data:_pudata} = await apiFetch('/users/profile', {`,
    );
    html = html.replace(
      `}).catch(function(){ return {ok:false,data:{}}; });\n        if (_pu.ok) { showToast('Profile updated!'); loadProfile(); }\n        else showToast((_pu.data && _pu.data.message) || 'Failed to update profile', 'error');`,
      `}).catch(function(){ return {ok:false,data:{}}; });\n        if (_puok) { showToast('Profile updated!'); loadProfile(); }\n        else showToast((_pudata && _pudata.message) || 'Failed to update profile', 'error');`,
    );
    // Fix changePassword
    html = html.replace(
      `const _pw = await apiFetch('/users/password', {`,
      `const {ok:_pwok,data:_pwdata} = await apiFetch('/users/password', {`,
    );
    html = html.replace(
      `}).catch(function(){ return {ok:false,data:{}}; });\n        if (_pw.ok) { showToast('Password updated!'); document.getElementById('passwordForm').reset(); }\n        else showToast((_pw.data && _pw.data.message) || 'Failed to update password', 'error');`,
      `}).catch(function(){ return {ok:false,data:{}}; });\n        if (_pwok) { showToast('Password updated!'); document.getElementById('passwordForm').reset(); }\n        else showToast((_pwdata && _pwdata.message) || 'Failed to update password', 'error');`,
    );
  }

  fs.writeFileSync(fpath, html, "utf8");
  console.log("Fixed:", fname);
});

console.log("\nAll done!");
