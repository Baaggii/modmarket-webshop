// Initialize cart first
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
  // Update cart count immediately
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateCartDisplay(); // Also update cart display on page load
  });
} catch (error) {
  console.error('Error loading cart:', error);
}

// Refresh cart data when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
      updateCartCount();
      updateCartDisplay();
    } catch (error) {
      console.error('Error reloading cart:', error);
    }
  }
});

// Fetch products from API
let products = [];

async function loadRecommendedProducts() {
  try {
    const response = await fetch('/api/products/recommended');
    if (!response.ok) throw new Error('Failed to load recommended products');
    const recommendedProducts = await response.json();
    const recommendedSection = document.querySelector('.recommended-products');
    if (recommendedSection) {
      recommendedSection.innerHTML = recommendedProducts.map(product => `
        <article class="product-card">
          <a href="product.html?id=${product.id}" class="product-link">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <div class="price">₮${product.price.toLocaleString()}</div>
            </div>
          </a>
          <button onclick="addToCart(${product.id})">Сагсанд хийх</button>
        </article>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading recommended products:', error);
  }
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    loadRecommendedProducts(); // Load recommended products
    if (!response.ok) throw new Error('Failed to load products');
    products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    showNotification('Бүтээгдэхүүн ачаалахад алдаа гарлаа');
  }
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', loadProducts);

let currentCategory = 'all';

// Initialize elements
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

// Display products
function displayProducts(productsToShow) {
  const productGrid = document.querySelector('.product-grid');
  productGrid.innerHTML = productsToShow.map(product => `
    <article class="product-card">
      <a href="product.html?id=${product.id}" class="product-link">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <div class="price">
            <span class="current-price">₮${product.price.toLocaleString()}</span>
          </div>
          <div class="rating">${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)} (${product.reviews})</div>
        </div>
      </a>
      <button onclick="addToCart(${product.id})">Сагсанд хийх</button>
    </article>
  `).join('');
}

// Load product detail page
if (window.location.pathname.includes('product.html')) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);

  if (product) {
    // Generate multiple image URLs (for demo)
    const images = [
      product.image,
      product.image.replace('w=300', 'w=301'),
      product.image.replace('w=300', 'w=302'),
      product.image.replace('w=300', 'w=303')
    ];

    document.getElementById('mainImage').src = images[0];
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productPrice').textContent = `₮${product.price.toLocaleString()}`;
    document.getElementById('productRating').innerHTML = `${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)} (${product.reviews})`;
    document.getElementById('productDescription').textContent = product.description;

    // Create thumbnail gallery
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    thumbnailGallery.innerHTML = images.map((img, index) => `
      <img src="${img}" 
           alt="Product view ${index + 1}" 
           class="thumbnail ${index === 0 ? 'active' : ''}"
           onclick="updateMainImage('${img}', this)">
    `).join('');

    initZoom(); // Initialize zoom after images are loaded
  }
}

function updateMainImage(src, thumbnail) {
  document.getElementById('mainImage').src = src;
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  thumbnail.classList.add('active');
  initZoom(); // Re-initialize zoom after image change
}

function addToCartFromDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  addToCart(productId);
}

// Cart functions
function toggleCart(event) {
  event.stopPropagation();
  const cartDropdown = document.querySelector('.cart-dropdown');
  cartDropdown.classList.toggle('show');
  updateCartDisplay();
}

document.addEventListener('click', (event) => {
  const cartDropdown = document.querySelector('.cart-dropdown');
  const cartBtn = document.getElementById('cartBtn');
  if (!cartBtn.contains(event.target) && !cartDropdown.contains(event.target)) {
    cartDropdown.classList.remove('show');
  }
});

function updateQuantity(productId, change, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    const newQuantity = Math.max(1, parseInt(cart[itemIndex].quantity || 1) + (parseInt(change) || 0));
    cart[itemIndex].quantity = newQuantity;
    updateCartDisplay();
    updateCartCount();
    saveCart();
    showNotification('Тоо хэмжээ шинэчлэгдлээ');
  }
}

function handleQuantityInput(productId, inputElement, event) {
  if (event) event.stopPropagation();
  const value = Math.max(1, parseInt(inputElement.value) || 1);
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    cart[itemIndex].quantity = value;
    updateCartDisplay();
    updateCartCount();
    saveCart();
  }
}

async function addToCart(productId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const product = products.find(p => p.id === productId);

  if (!product) return;

  if (!currentUser || !currentUser.id) {
    // Guest user - store in localStorage
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Бүтээгдэхүүн сагсанд нэмэгдлээ');
    return;
  }

  try {
    const response = await fetch(`/api/cart/user/${currentUser.id}/add/${productId}`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Update local cart after successful server-side add
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
    updateCartDisplay();
    showNotification('Бүтээгдэхүүн сагсанд нэмэгдлээ');
  } catch (error) {
    handleError(error, 'Бүтээгдэхүүн сагсанд нэмэхэд алдаа гарлаа');
  }
}

function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  cartCount.textContent = totalItems;
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  let total = 0;
  let totalItems = 0;

  cartItems.innerHTML = cart.map(item => {
    const itemSum = item.price * (item.quantity || 1);
    total += itemSum;
    totalItems += (item.quantity || 1);
    return `<div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-details">
        <span class="item-name">${item.name}</span>
        <span class="item-price">₮${item.price.toLocaleString()} × ${item.quantity || 1} = ₮${itemSum.toLocaleString()}</span>
      </div>
      <div class="quantity-controls" onclick="event.stopPropagation()">
        <input type="number" min="1" value="${item.quantity || 1}" 
          onchange="handleQuantityInput(${item.id}, this, event)"
          onclick="event.stopPropagation()">
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Устгах</button>
      </div>
    </div>`;
  }).join('');

  cartTotal.innerHTML = `
    <span>Нийт (${totalItems} бараа):</span>
    <span>₮${total.toLocaleString()}</span>
  `;
}

function updateQuantity(productId, quantity) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    cart[itemIndex].quantity = Math.max(1, parseInt(quantity) || 1);
    updateCartDisplay();
    updateCartCount();
    saveCart(); // Save cart after changes
    showNotification('Тоо хэмжээ шинэчлэгдлээ');
  }
}

function removeFromCart(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    updateCartCount();
    updateCartDisplay();
    saveCart(); // Save cart after changes
    showNotification('Бүтээгдэхүүн сагснаас хасагдлаа');
  }
}

function checkAuthState() {
  return true; // Basic auth check, can be enhanced later
}

// Error handling for product fetching
function handleError(error, message) {
  console.error(message, error);
  showNotification('Уучлаарай, алдаа гарлаа');
}

function showNotification(message) {
  let container = document.querySelector('.notifications-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notifications-container';
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'all 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Filter products
function filterProducts(category) {
  currentCategory = category;
  const filtered = category === 'all' ? 
    products : 
    products.filter(product => product.category === category);
  displayProducts(filtered);

  // Update active button state
  const buttons = document.querySelectorAll('.department-bar button');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    }
  });

  // Scroll to product section
  const productSection = document.querySelector('.deals');
  if (productSection) {
    productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Checkout process
function checkout() {
  if (cart.length === 0) {
    alert('Таны сагс хоосон байна!');
    return;
  }
  window.location.href = 'payment.html';
}

// Initialize payment page if we're on it
if (window.location.pathname.includes('payment.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (error) {
      console.error('Error loading cart:', error);
      cart = [];
    }
    const orderSummary = document.getElementById('orderSummary');
    const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    orderSummary.innerHTML = `
      <div class="cart-items">
        ${cart.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
              <span class="item-name">${item.name}</span>
              <span class="item-price">₮${item.price.toLocaleString()} x ${item.quantity || 1}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cart-total">
        <span>Нийт (${totalItems} бараа):</span>
        <span>₮${total.toLocaleString()}</span>
      </div>
    `;
  });
}

function showCardForm() {
  const paymentMethods = document.querySelector('.payment-methods');
  const cardForm = document.getElementById('cardForm');
  paymentMethods.style.display = 'none';
  cardForm.style.display = 'block';
}

function cancelCardPayment() {
  const paymentMethods = document.querySelector('.payment-methods');
  const cardForm = document.getElementById('cardForm');
  cardForm.style.display = 'none';
  paymentMethods.style.display = 'grid';
}

function formatExpiry(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    const month = value.substring(0, 2);
    if (parseInt(month) > 12) {
      value = '12' + value.substring(2);
    }
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
  }
  input.value = value;
}

function handleExpiryBackspace(event, input) {
  if (event.key === 'Backspace' && input.value.length === 3) {
    event.preventDefault();
    input.value = input.value.slice(0, 2);
  }
}

function validateCardDetails() {
  const cardNumber = document.querySelector('input[placeholder="Картын дугаар"]').value;
  const expiry = document.querySelector('input[placeholder="MM/YY"]').value;
  const cvv = document.querySelector('input[placeholder="CVV"]').value;

  if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
    alert('Картын дугаар буруу байна');
    return false;
  }

  if (!expiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) {
    alert('Картын хүчинтэй хугацаа буруу байна (MM/YY)');
    return false;
  }

  // Check if card is expired
  const [month, year] = expiry.split('/');
  const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const today = new Date();
  if (expDate < today) {
    alert('Картын хугацаа дууссан байна');
    return false;
  }

  if (!cvv || cvv.length !== 3 || !/^\d+$/.test(cvv)) {
    alert('CVV код буруу байна');
    return false;
  }

  return true;
}

function processPayment(method) {
  try {
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    if (total === 0) {
      throw new Error('Empty cart');
    }

    // Check if user wants email notifications
    const emailInput = document.getElementById('customerEmail')?.value;
    const wantsEmails = document.getElementById('wantsEmails')?.checked;

    if (emailInput) {
      sessionStorage.setItem('customerEmail', emailInput);
      sessionStorage.setItem('wantsEmails', wantsEmails);
    }

    if (method === 'Card') {
      if (!validateCardDetails()) {
        return;
      }
    }

    alert(`${method} төлбөр хийгдэж байна... ₮${total.toLocaleString()}`);

    // Generate order ID
    const orderId = 'ORD-' + Date.now();

    // Store order details in session storage
    const orderDetails = {
      id: orderId,
      items: cart,
      total: total,
      date: new Date().toISOString(),
      paymentMethod: method
    };
    sessionStorage.setItem('lastOrder', JSON.stringify(orderDetails));

    // Save order to database if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id) {
      fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.id,
          orderId: orderId,
          items: cart,
          total: total
        })
      }).catch(error => console.error('Error saving order:', error));
    }

    // Clear cart
    cart = [];
    saveCart();

    // Redirect to success page
    window.location.href = 'success.html';

  } catch (error) {
    console.error('Payment error:', error);
    sessionStorage.setItem('paymentError', error.message || 'Төлбөр хийх үед алдаа гарлаа');
    window.location.href = 'unsuccessful.html';
  }
}

async function saveCart() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.id) {
    try {
      const response = await fetch(`/api/cart/user/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cart)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving cart to server:', error);
      // Fallback to local storage if server save fails
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  } else {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
}

// Banner slider functionality
async function initializeBannerSlider() {
  const slidesContainer = document.querySelector('.slides');
  if (!slidesContainer) return;

  try {
    // Hardcode some test images first
    const images = ['banner1.jpg', 'banner2.jpg', 'banner3.jpg', 'banner4.jpg'];
    console.log('Loading banner images:', images);

    slidesContainer.innerHTML = images
      .map(img => `<div class="slide"><img src="/images/header/${img}" alt="Banner"></div>`)
      .join('');

    let currentSlide = 0;
    const slides = slidesContainer.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function updateSlides() {
      slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateSlides();
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateSlides();
    }

    document.querySelector('.next')?.addEventListener('click', nextSlide);
    document.querySelector('.prev')?.addEventListener('click', prevSlide);

    // Auto advance slides
    setInterval(nextSlide, 5000);
  } catch (error) {
    console.error('Error loading banner images:', error);
  }
}

// Initialize on page load
// Menu functionality
function toggleMenu() {
  const sideNav = document.querySelector('.side-nav');
  const overlay = document.querySelector('.overlay');
  if (sideNav && overlay) {
    sideNav.classList.toggle('open');
    overlay.classList.toggle('show');
  }
}

function scrollToProducts() {
  const productSection = document.querySelector('.deals');
  if (productSection) {
    productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleSearch() {
  const searchBar = document.querySelector('.search-bar');
  const findBtn = document.querySelector('.find-btn');

  searchBar.classList.toggle('show');
  if (searchBar.classList.contains('show')) {
    document.getElementById('searchInput').focus();
    findBtn.style.opacity = '0';
    findBtn.style.pointerEvents = 'none';
  }

  // Hide search and show button when input loses focus
  document.getElementById('searchInput').addEventListener('blur', () => {
    setTimeout(() => {
      if (!document.activeElement.closest('.search-bar')) {
        searchBar.classList.remove('show');
        findBtn.style.opacity = '1';
        findBtn.style.pointerEvents = 'auto';
      }
    }, 200);
  });
}

function searchProducts(query) {
  if (!query.trim()) {
    displayProducts(products);
    return;
  }

  query = query.toLowerCase();
  const filtered = products.filter(product => 
    product.name.toLowerCase().includes(query) || 
    product.category?.toLowerCase().includes(query) ||
    product.description?.toLowerCase().includes(query)
  );

  // Update UI to show search results
  const productGrid = document.querySelector('.product-grid');
  if (productGrid) {
    document.querySelector('.deals h2').textContent = `Хайлтын үр дүн: "${query}"`;
    displayProducts(filtered);

    // Scroll to results
    productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function loadOrderHistory() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || !currentUser.id) return;

  try {
    const response = await fetch(`/api/orders/${currentUser.id}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const orders = await response.json();

    const orderHistory = document.getElementById('orderHistory');
    if (!orderHistory) return;

    orderHistory.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <span>Захиалга #${order.id}</span>
          <span>Огноо: ${new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <span>${item.name}</span>
              <span>${item.quantity}x ₮${item.price.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <span>Нийт: ₮${order.total.toLocaleString()}</span>
          <span class="order-status">${order.status}</span>
        </div>
      </div>
    `).join('') || '<p>Захиалгын түүх хоосон байна.</p>';
  } catch (error) {
    console.error('Error loading order history:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize success page if we're on it
  if (window.location.pathname.includes('success.html')) {
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || '{}');
    if (lastOrder.id) {
      document.getElementById('orderId').textContent = lastOrder.id;
    }
  } else if (window.location.pathname.includes('order-history.html')) {
    loadOrderHistory();
  } else {
    displayProducts(products);
    updateCartCount();
    initializeBannerSlider();
  }

  // Menu button click handler
  document.querySelector('.menu-btn').addEventListener('click', toggleMenu);
  document.querySelector('.overlay').addEventListener('click', toggleMenu);
});

function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, '');
  value = value.replace(/(\d{4})/g, '$1 ').trim();
  input.value = value;
}

// Social Auth functions
function handleGoogleSignIn() {
  window.location.href = '/auth/google';
}

function handleFacebookSignIn() {
  window.location.href = '/auth/facebook';
}

function handleSocialLoginSuccess(userData) {
  localStorage.setItem('currentUser', JSON.stringify(userData));
  window.location.href = 'index.html';
}


// Auth functions
function handleSignIn(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      showNotification('Амжилттай нэвтэрлээ!');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      showNotification(data.message || 'Нэвтрэхэд алдаа гарлаа');
    }
  })
  .catch(err => {
    console.error('Login request failed:', err);
    alert('Сервертэй холбогдож чадсангүй');
  });
}


function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const conditions = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    password.length >= minLength
  ];

  const strength = conditions.filter(Boolean).length;

  const strengthElement = document.getElementById('passwordStrength');
  strengthElement.innerHTML = `Нууц үгийн хүч: ${strength}/5`;
  strengthElement.className = `password-strength strength-${strength}`;

  return strength >= 4;
}

function handleSignUp(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const name = document.getElementById('name').value;

  if (password !== confirmPassword) {
    alert('Нууц үгнүүд таарахгүй байна');
    return;
  }

  if (!validatePassword(password)) {
    alert('Нууц үг сул байна. 8-аас дээш тэмдэгт, том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт шаардлагатай.');
    return;
  }

  fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      localStorage.setItem('currentUser', JSON.stringify({ email, name }));
      localStorage.setItem('cart', JSON.stringify(cartData)); // Preserve cart
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Бүртгэл амжилтгүй боллоо');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Бүртгэл амжилтгүй боллоо');
  });
}

function toggleAccountDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.querySelector('.account-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function updateAccountSection() {
  const accountSection = document.getElementById('accountSection');
  if (!accountSection) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    accountSection.innerHTML = `
      <div class="account-info" onclick="toggleAccountDropdown(event)">
        <span>Сайн уу, ${currentUser.name}</span>
        <strong>Миний хаяг</strong>
        <div class="account-dropdown">
          <a href="account-edit.html"><span class="account-icon">👤</span>Хувийн мэдээлэл</a>
          <a href="order-history.html"><span class="account-icon">📦</span>Захиалгын түүх</a>
          <a href="favorites.html"><span class="account-icon">❤️</span>Хүслийн жагсаалт</a>
          <a href="#" onclick="handleSignOut()"><span class="account-icon">🚪</span>Гарах</a>
        </div>
      </div>
    `;
  } else {
    accountSection.innerHTML = `
      <a href="signin.html" class="account-link">
        <span>Сайн уу, Нэвтрэх</span>
        <strong>Хаяг & Жагсаалт</strong>
      </a>
    `;
  }
}

function handleSignOut() {
  const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
  localStorage.removeItem('currentUser');
  localStorage.setItem('cart', JSON.stringify(cartData)); // Preserve cart data
  showNotification('Системээс гарлаа');
  updateAccountSection();
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadCart(); // Load cart on page load
  updateAccountSection();
  if (window.location.pathname.includes('success.html')) {
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || '{}');
    if (lastOrder.id) {
      document.getElementById('orderId').textContent = lastOrder.id;
      // ... rest of the success page code
    }
  } else {
    displayProducts(products);
    updateCartCount();
    initializeBannerSlider();
  }

  // Menu button click handler
  document.querySelector('.menu-btn').addEventListener('click', toggleMenu);
  document.querySelector('.overlay').addEventListener('click', toggleMenu);
});

function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, '');
  value = value.replace(/(\d{4})/g, '$1 ').trim();
  input.value = value;
}

async function loadCart() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || !currentUser.id) {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    updateCartCount();
    updateCartDisplay();
    return;
  }

  try {
    const response = await fetch(`/api/cart/user/${currentUser.id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    cart = Array.isArray(data) ? data : [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
  } catch (error) {
    console.error('Error loading cart:', error);
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    updateCartCount();
    updateCartDisplay();
  }
}

function initZoom() {
  const mainImage = document.getElementById('mainImage');
  const productImages = document.querySelector('.product-images');

  // Remove existing zoom container if any
  const existingZoom = document.querySelector('.zoom-container');
  if (existingZoom) existingZoom.remove();

  // Create zoom container
  const zoomContainer = document.createElement('div');
  zoomContainer.className = 'zoom-container';
  productImages.appendChild(zoomContainer);

  mainImage.addEventListener('mousemove', (e) => {
    const bounds = mainImage.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    const xPercent = (x / bounds.width) * 100;
    const yPercent = (y / bounds.height) * 100;

    zoomContainer.style.backgroundImage = `url(${mainImage.src})`;
    zoomContainer.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    zoomContainer.style.backgroundSize = '250%';
    zoomContainer.style.backgroundRepeat = 'no-repeat';
    zoomContainer.style.display = 'block';
  });

  mainImage.addEventListener('mouseleave', () => {
    zoomContainer.style.display = 'none';
  });

  mainImage.addEventListener('mouseenter', () => {
    zoomContainer.style.display = 'block';
  });
}