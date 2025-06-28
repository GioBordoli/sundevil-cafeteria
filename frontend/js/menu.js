// Menu and cart functionality

let allMenuItems = [];
let currentCategory = 'ALL';

async function loadMenuItems() {
    try {
        showLoading('menu-items');
        allMenuItems = await apiRequest('/menu');
        displayMenuItems(allMenuItems);
    } catch (error) {
        document.getElementById('menu-items').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle"></i> Failed to load menu items: ${error.message}
                </div>
            </div>
        `;
    }
}

function displayMenuItems(items) {
    const container = document.getElementById('menu-items');
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-info-circle"></i> No menu items available in this category.
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="col-md-4 col-sm-6 mb-4">
            <div class="card menu-item-card h-100">
                <img src="${item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     class="card-img-top menu-item-image" alt="${item.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text text-muted">${item.description || 'No description available'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="price-tag">${formatPrice(item.price)}</span>
                            <span class="badge bg-secondary">${capitalizeFirst(item.category)}</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary me-2" onclick="decreaseQuantity(${item.id})">-</button>
                            <span class="quantity-display mx-2" id="qty-${item.id}">0</span>
                            <button class="btn btn-sm btn-outline-secondary me-2" onclick="increaseQuantity(${item.id})">+</button>
                            <button class="btn btn-primary btn-sm ms-auto" onclick="addToCart(${item.id})">
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    updateQuantityDisplays();
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update active category button
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter and display items
    if (category === 'ALL') {
        displayMenuItems(allMenuItems);
    } else {
        const filteredItems = allMenuItems.filter(item => item.category === category);
        displayMenuItems(filteredItems);
    }
}

function increaseQuantity(itemId) {
    const qtyDisplay = document.getElementById(`qty-${itemId}`);
    const currentQty = parseInt(qtyDisplay.textContent);
    qtyDisplay.textContent = currentQty + 1;
}

function decreaseQuantity(itemId) {
    const qtyDisplay = document.getElementById(`qty-${itemId}`);
    const currentQty = parseInt(qtyDisplay.textContent);
    if (currentQty > 0) {
        qtyDisplay.textContent = currentQty - 1;
    }
}

function addToCart(itemId) {
    const qtyDisplay = document.getElementById(`qty-${itemId}`);
    const quantity = parseInt(qtyDisplay.textContent);
    
    if (quantity === 0) {
        showAlert('Please select a quantity first', 'warning');
        return;
    }
    
    const menuItem = allMenuItems.find(item => item.id === itemId);
    if (!menuItem) {
        showAlert('Menu item not found', 'error');
        return;
    }
    
    // Check if item already exists in cart
    const existingCartItem = cart.find(item => item.menuItemId === itemId);
    
    if (existingCartItem) {
        existingCartItem.quantity += quantity;
    } else {
        cart.push({
            menuItemId: itemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: quantity
        });
    }
    
    // Reset quantity display
    qtyDisplay.textContent = '0';
    
    updateCartDisplay();
    showAlert(`${menuItem.name} added to cart!`, 'success');
}

function updateQuantityDisplays() {
    cart.forEach(cartItem => {
        const qtyDisplay = document.getElementById(`qty-${cartItem.menuItemId}`);
        if (qtyDisplay) {
            qtyDisplay.textContent = cartItem.quantity.toString();
        }
    });
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartSummary = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
        cartSummary.style.display = 'none';
        return;
    }
    
    cartSummary.style.display = 'block';
    
    let total = 0;
    cartContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>${formatPrice(item.price)} x ${item.quantity}</small>
                    </div>
                    <div class="text-end">
                        <div>${formatPrice(itemTotal)}</div>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.menuItemId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = total.toFixed(2);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.menuItemId !== itemId);
    updateCartDisplay();
    updateQuantityDisplays();
    showAlert('Item removed from cart', 'info');
}

async function placeOrder() {
    if (!requireAuth()) {
        return;
    }
    
    if (cart.length === 0) {
        showAlert('Your cart is empty', 'warning');
        return;
    }
    
    const orderItems = cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
    }));
    
    try {
        const response = await apiRequest(`/orders?customerId=${currentUser.id}`, {
            method: 'POST',
            body: JSON.stringify({
                items: orderItems,
                specialInstructions: ''
            })
        });
        
        cart = [];
        updateCartDisplay();
        updateQuantityDisplays();
        
        showAlert('Order placed successfully!', 'success');
        
        // Switch to customer dashboard to show the new order
        if (hasRole('CUSTOMER')) {
            showDashboard();
        }
        
    } catch (error) {
        showAlert('Failed to place order: ' + error.message, 'danger');
    }
} 