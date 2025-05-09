
let product = null;

async function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showError('Product ID not found');
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Failed to load product');
        product = await response.json();
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        displayProduct();
        loadRecommendedProducts();
    } catch (err) {
        console.error('Error loading product:', err);
        showError('Failed to load product');
    }
}

function showError(message) {
    const productDetails = document.getElementById('productDetails');
    productDetails.innerHTML = `<p class="error">${message}</p>`;
}

function displayProduct() {
    const productDetails = document.getElementById('productDetails');
    if (!product) return;
    
    productDetails.innerHTML = `
        <div class="product-full">
            <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}">
            <div class="product-info">
                <h1>${product.name}</h1>
                <div class="price">₮${product.price ? product.price.toLocaleString() : 0}</div>
                <p>${product.description || 'No description available'}</p>
                <button onclick="checkStockAndAdd(${product.id})">Сагсанд хийх</button>
            </div>
        </div>
    `;
}

async function checkStockAndAdd(productId) {
    try {
        const res = await fetch(`/api/stock/${productId}`);
        if (!res.ok) throw new Error('Stock API error');
        const stock = await res.json();

        if (stock.stock_qty <= 0) {
            alert("Уучлаарай, үлдэгдэл дууссан байна.");
            return;
        }

        addToCart(productId);
    } catch (err) {
        console.error("Stock check error:", err);
        alert("Үлдэгдлийг шалгаж чадсангүй.");
    }
}

function addToCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Та эхлээд нэвтэрнэ үү');
        window.location.href = 'signin.html';
        return;
    }
    
    fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: currentUser.id,
            productId: productId,
            quantity: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Бүтээгдэхүүн сагсанд нэмэгдлээ');
            window.location.href = 'cart.html';
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
        alert('Сагсанд нэмэхэд алдаа гарлаа');
    });
}

document.addEventListener('DOMContentLoaded', loadProduct);
