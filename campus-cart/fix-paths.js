/**
 * fix-paths.js - fixes write-pages.js then re-runs it
 * Usage: node fix-paths.js
 */
const fs = require("fs");
const path = require("path");
const base = "c:/CLG ECOM WEB/campus-cart";

// Step 1: fix write-pages.js paths
let src = fs.readFileSync(path.join(base, "write-pages.js"), "utf8");

// Remove /api/v1 prefix from apiFetch calls
src = src.replace(/apiFetch\('\/api\/v1\//g, "apiFetch('/");

// Fix data access for apiFetch results:
// apiFetch returns { ok, status, data: parsedJSON }
// parsedJSON (from API) = { status, data: actualPayload }
// So:  result.data.data = actual payload, result.data.data.items = items array

// Cart page fixes
src = src.replace(
  "const data = await apiFetch('/cart').catch(function(){ return {}; });\n        cartItems = (data.data && data.data.items) ? data.data.items : (data.items || []);",
  "const _cart = await apiFetch('/cart').catch(function(){ return {ok:false,data:{}}; });\n        const _cdata = (_cart.data && _cart.data.data) ? _cart.data.data : {};\n        cartItems = _cdata.items || [];",
);
src = src.replace(
  "await apiFetch('/cart', { method:'PATCH', body: JSON.stringify({ productId: productId, quantity: newQty }) }).catch(function(){});",
  "await apiFetch('/cart', { method:'PATCH', body: JSON.stringify({ productId: productId, quantity: newQty }) });",
);
src = src.replace(
  "await apiFetch('/cart/' + productId, { method:'DELETE' }).catch(function(){});",
  "await apiFetch('/cart/' + productId, { method:'DELETE' });",
);
src = src.replace(
  "const data = await apiFetch('/orders/coupon', { method:'POST', body: JSON.stringify({ code: code }) }).catch(function(){ return {error:'Invalid coupon'}; });",
  "const _coupon = await apiFetch('/orders/coupon', { method:'POST', body: JSON.stringify({ code: code }) }).catch(function(){ return {ok:false,data:{status:'fail',message:'Invalid coupon'}}; });\n        const data = _coupon.data || {};",
);
src = src.replace(
  "const data = await apiFetch('/orders', {\n            method: 'POST',\n            body: JSON.stringify({ shippingAddress: address, couponCode: coupon || undefined })\n        }).catch(function(){ return null; });",
  "const _order = await apiFetch('/orders', {\n            method: 'POST',\n            body: JSON.stringify({ shippingAddress: address, couponCode: coupon || undefined })\n        }).catch(function(){ return {ok:false,data:{}}; });\n        const data = _order.data;",
);
src = src.replace(
  "if (data && (data.orderId || (data.data && data.data.orderId))) {",
  "if (data && (data.orderId || data.id || (data.data && (data.data.orderId || data.data.id)))) {",
);

// Wishlist page fixes
src = src.replace(
  "const data = await apiFetch('/wishlist').catch(function(){ return {}; });\n        const items = (data.data && data.data.items) ? data.data.items : (data.items || []);",
  "const _wl = await apiFetch('/wishlist').catch(function(){ return {ok:false,data:{}}; });\n        const items = (_wl.data && _wl.data.data && _wl.data.data.items) ? _wl.data.data.items : [];",
);
src = src.replace(
  "const data = await apiFetch('/wishlist/toggle', { method:'POST', body: JSON.stringify({ productId: productId }) }).catch(function(){ return {}; });",
  "await apiFetch('/wishlist/toggle', { method:'POST', body: JSON.stringify({ productId: productId }) }).catch(function(){});",
);
src = src.replace(
  "const r = await apiFetch('/cart', { method:'POST', body: JSON.stringify({ productId: productId, quantity: 1 }) }).catch(function(){ return {}; });",
  "const _r = await apiFetch('/cart', { method:'POST', body: JSON.stringify({ productId: productId, quantity: 1 }) }).catch(function(){ return {ok:false}; });",
);
src = src.replace("if (!r.error) {", "if (_r.ok) {");
src = src.replace(
  "await apiFetch('/wishlist/toggle', { method:'POST', body: JSON.stringify({ productId: productId }) }).catch(function(){});",
  "await apiFetch('/wishlist/toggle', { method:'POST', body: JSON.stringify({ productId: productId }) }).catch(function(){});",
);
src = src.replace(
  "btn.disabled = false; btn.textContent = 'Move to Cart';\n            showToast(r.message || 'Failed to add to cart', 'error');",
  "btn.disabled = false; btn.textContent = 'Move to Cart';\n            showToast((_r.data && _r.data.message) || 'Failed to add to cart', 'error');",
);

// Product-details page fixes
src = src.replace(
  "const data = await apiFetch('/products/'+productId+'/reviews', {",
  "const _rev = await apiFetch('/products/'+productId+'/reviews', {",
);
src = src.replace(
  "if (data.message && !data.error) {\n            showToast('Review submitted!');\n            document.getElementById('reviewForm').reset();\n            loadProduct();\n        } else {\n            showToast(data.message || 'Failed to submit review', 'error');\n        }",
  "const _revData = _rev.data || {};\n        if (_rev.ok) {\n            showToast('Review submitted!');\n            document.getElementById('reviewForm').reset();\n            loadProduct();\n        } else {\n            showToast((_revData.message) || 'Failed to submit review', 'error');\n        }",
);

// Profile page fixes
src = src.replace(
  "apiFetch('/users/profile').catch(function(){ return {}; }),\n            apiFetch('/orders').catch(function(){ return {}; }),",
  "apiFetch('/users/profile').catch(function(){ return {ok:false,data:{}}; }),\n            apiFetch('/orders').catch(function(){ return {ok:false,data:{}}; }),",
);
src = src.replace(
  "const user   = userRes.user || userRes.data || userRes;",
  "const user   = (userRes.data && userRes.data.data && userRes.data.data.user) ? userRes.data.data.user : {};",
);
src = src.replace(
  "const orders = ordersRes.orders || (ordersRes.data && ordersRes.data.orders) || [];",
  "const orders = (ordersRes.data && ordersRes.data.data && ordersRes.data.data.orders) ? ordersRes.data.data.orders : (ordersRes.data && ordersRes.data.orders ? ordersRes.data.orders : []);",
);
src = src.replace(
  "const addrRes = await apiFetch('/users/addresses').catch(function(){ return {}; });",
  "const _addrR = await apiFetch('/users/addresses').catch(function(){ return {ok:false,data:{}}; });\n        const addrRes = _addrR.data || {};",
);
src = src.replace(
  "const addrs   = addrRes.addresses || (addrRes.data && addrRes.data.addresses) || [];",
  "const addrs   = (addrRes.data && addrRes.data.addresses) ? addrRes.data.addresses : (addrRes.addresses || []);",
);
src = src.replace(
  "apiFetch('/users/addresses', { method:'POST', body: JSON.stringify({ address: addr }) }).then(function(){",
  "apiFetch('/users/addresses', { method:'POST', body: JSON.stringify({ address: addr }) }).then(function(_res){",
);
src = src.replace(
  "const data = await apiFetch('/users/profile', {",
  "const _pu = await apiFetch('/users/profile', {",
);
src = src.replace(
  "        method:'PUT',\n            body: JSON.stringify({\n                name:  document.getElementById('settingsName').value.trim(),\n                email: document.getElementById('settingsEmail').value.trim(),\n                phone: document.getElementById('settingsPhone').value.trim(),\n            })\n        }).catch(function(){ return {}; });\n        if (!data.error) { showToast('Profile updated!'); loadProfile(); }\n        else showToast(data.message || 'Failed to update profile', 'error');",
  "        method:'PUT',\n            body: JSON.stringify({\n                name:  document.getElementById('settingsName').value.trim(),\n                email: document.getElementById('settingsEmail').value.trim(),\n                phone: document.getElementById('settingsPhone').value.trim(),\n            })\n        }).catch(function(){ return {ok:false,data:{}}; });\n        if (_pu.ok) { showToast('Profile updated!'); loadProfile(); }\n        else showToast((_pu.data && _pu.data.message) || 'Failed to update profile', 'error');",
);
src = src.replace(
  "const data = await apiFetch('/users/password', {",
  "const _pw = await apiFetch('/users/password', {",
);
src = src.replace(
  "        method:'PATCH',\n            body: JSON.stringify({ currentPassword: document.getElementById('currentPass').value, newPassword: np })\n        }).catch(function(){ return {}; });\n        if (!data.error) { showToast('Password updated!'); document.getElementById('passwordForm').reset(); }\n        else showToast(data.message || 'Failed to update password', 'error');",
  "        method:'PATCH',\n            body: JSON.stringify({ currentPassword: document.getElementById('currentPass').value, newPassword: np })\n        }).catch(function(){ return {ok:false,data:{}}; });\n        if (_pw.ok) { showToast('Password updated!'); document.getElementById('passwordForm').reset(); }\n        else showToast((_pw.data && _pw.data.message) || 'Failed to update password', 'error');",
);

fs.writeFileSync(path.join(base, "write-pages.js"), src, "utf8");
console.log("write-pages.js patched successfully");

// Step 2: re-run write-pages.js
require(path.join(base, "write-pages.js"));
