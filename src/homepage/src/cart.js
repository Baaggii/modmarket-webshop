let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
const cartContainer = document.getElementById('cartContainer');
const cartTotal = document.getElementById('cartTotal');

async function loadCart() {
  if (!currentUser?.id) return alert('Та нэвтэрнэ үү');

  try {
    const res = await fetch(`/api/cart/user/${currentUser.id}`);
    const items = await res.json();
    displayCart(items);
  } catch (err) {
    console.error('Error loading cart:', err);
  }
}

function displayCart(items) {
  if (!items.length) {
    cartContainer.innerHTML = '<p>Сагс хоосон байна.</p>';
    cartTotal.textContent = '';
    return;
  }

  let total = 0;
  cartContainer.innerHTML = items.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image || 'https://via.placeholder.com/100'}" />
        <div>
          <h3>${item.name}</h3>
          <p>₮${item.price} x ${item.quantity}</p>
          <p>Нийт: ₮${itemTotal.toLocaleString()}</p>
        </div>
      </div>
    `;
  }).join('');

  cartTotal.textContent = `Нийт төлөх дүн: ₮${total.toLocaleString()}`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});
