// ============================================
// UNIVERSAL CART SYSTEM - NgoPag.co
// File: js/cart.js
// ============================================

// Cart Management Functions
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  let total = 0;
  cart.forEach(item => total += item.quantity);
  const countEl = document.getElementById("cartCount");
  if (countEl) {
    countEl.innerText = total;
  }
}

function hitungTotal() {
  const cart = getCart();
  let total = 0;
  cart.forEach(item => {
    const harga = parseInt(item.price.replace(/\./g, ''));
    total += harga * item.quantity;
  });
  return total;
}

function formatRupiah(angka) {
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Add to Cart - PERBAIKAN: Gunakan window untuk global access
window.tambahKeKeranjang = function(id, nama, harga, gambar) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: id,
      name: nama,
      price: harga,
      image: gambar,
      quantity: 1
    });
  }
  
  saveCart(cart);
  updateCartCount();
  
  // Show success notification
  console.log('Item added to cart:', nama);
  alert('✅ ' + nama + ' berhasil ditambahkan ke keranjang!');
}

// Quantity Controls
window.tambahQty = function(id) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity++;
    saveCart(cart);
    renderCart();
    updateCartCount();
  }
}

window.kurangiQty = function(id) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  if (item && item.quantity > 1) {
    item.quantity--;
    saveCart(cart);
    renderCart();
    updateCartCount();
  }
}

window.hapusItem = function(id) {
  let cart = getCart();
  const itemToRemove = cart.find(item => item.id === id);
  if (itemToRemove) {
    const konfirmasi = confirm('Hapus ' + itemToRemove.name + ' dari keranjang?');
    if (konfirmasi) {
      cart = cart.filter(item => item.id !== id);
      saveCart(cart);
      renderCart();
      updateCartCount();
    }
  }
}

// Render Cart
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Keranjang belanja Anda masih kosong</p>
        <button class="btn btn-primary" onclick="tutupCart(); window.location.href='shop.html'">Mulai Belanja</button>
      </div>
    `;
  } else {
    let html = '';
    cart.forEach(item => {
      html += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">Rp ${item.price}</div>
          </div>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="kurangiQty(${item.id})">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="tambahQty(${item.id})">+</button>
          </div>
          <button class="remove-btn" onclick="hapusItem(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    });
    
    const total = hitungTotal();
    html += `
      <div class="cart-total">
        Total: ${formatRupiah(total)}
      </div>
      <button class="btn btn-success w-100 mt-3" onclick="bukaCheckout()">
        <i class="fas fa-shopping-bag me-2"></i>Lanjut ke Checkout
      </button>
    `;
    
    container.innerHTML = html;
  }
}

// Popup Functions
window.bukaCart = function(e) {
  if (e) e.preventDefault();
  renderCart();
  const popup = document.getElementById("cartPreview");
  if (popup) {
    popup.style.display = "flex";
  }
}

window.tutupCart = function() {
  const popup = document.getElementById("cartPreview");
  if (popup) {
    popup.style.display = "none";
  }
}

window.langkahCheckout = function() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("⚠️ Keranjang Anda masih kosong! Silakan tambahkan produk terlebih dahulu.");
    window.location.href = 'shop.html';
    return;
  }
  bukaCheckout();
}

window.bukaCheckout = function() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("⚠️ Keranjang masih kosong!");
    return;
  }
  
  const total = hitungTotal();
  const totalEl = document.getElementById("checkoutTotal");
  if (totalEl) {
    totalEl.innerHTML = `Total Pembayaran: ${formatRupiah(total)}`;
  }
  
  const cartPopup = document.getElementById("cartPreview");
  const checkoutPopup = document.getElementById("checkoutModal");
  
  if (cartPopup) cartPopup.style.display = "none";
  if (checkoutPopup) checkoutPopup.style.display = "flex";
}

window.tutupCheckout = function() {
  const popup = document.getElementById("checkoutModal");
  if (popup) {
    popup.style.display = "none";
  }
}

window.kirimCheckoutWA = function() {
  const nama = document.getElementById("formNama").value.trim();
  const hp = document.getElementById("formHp").value.trim();
  const email = document.getElementById("formEmail").value.trim();
  const alamat = document.getElementById("formAlamat").value.trim();

  if (!nama || !hp || !email || !alamat) {
    alert("⚠️ Mohon lengkapi semua data!");
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert("⚠️ Keranjang masih kosong!");
    return;
  }

  let daftarPesanan = '';
  let totalBelanja = 0;
  
  cart.forEach(item => {
    const harga = parseInt(item.price.replace(/\./g, ''));
    const subtotal = harga * item.quantity;
    totalBelanja += subtotal;
    daftarPesanan += `- ${item.name}%0A  Qty: ${item.quantity} x Rp ${item.price} = ${formatRupiah(subtotal)}%0A%0A`;
  });

  const pesan = `*PESANAN BARU - NgoPag.co*%0A%0A` +
    `📋 *DETAIL PESANAN:*%0A${daftarPesanan}` +
    `💰 *TOTAL: ${formatRupiah(totalBelanja)}*%0A%0A` +
    `👤 *DATA PELANGGAN:*%0A` +
    `Nama: ${nama}%0A` +
    `No HP: ${hp}%0A` +
    `Email: ${email}%0A` +
    `Alamat: ${alamat}%0A%0A` +
    `Terima kasih telah berbelanja di NgoPag.co! ☕`;

  window.open(`https://wa.me/6287829383526?text=${pesan}`, "_blank");
  
  // Clear form
  document.getElementById("formNama").value = "";
  document.getElementById("formHp").value = "";
  document.getElementById("formEmail").value = "";
  document.getElementById("formAlamat").value = "";
  
  tutupCheckout();
  alert("✅ Pesanan Anda sedang dikirim ke WhatsApp. Terima kasih!");
}

// Promo Popup
window.tutupPromo = function() {
  const popup = document.getElementById("promoPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  
  // Show promo popup after 1 second
  setTimeout(function() {
    const promoPopup = document.getElementById("promoPopup");
    if (promoPopup) {
      promoPopup.style.display = "flex";
    }
  }, 1000);
  
  console.log('Cart system initialized');
});