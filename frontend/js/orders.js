// Order management functionality

async function loadCustomerOrders() {
    if (!currentUser || !hasRole('CUSTOMER')) {
        return;
    }
    
    try {
        showLoading('customer-orders');
        const orders = await apiRequest(`/orders/customer/${currentUser.id}`);
        displayCustomerOrders(orders);
    } catch (error) {
        document.getElementById('customer-orders').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle"></i> Failed to load orders: ${error.message}
            </div>
        `;
    }
}

function displayCustomerOrders(orders) {
    const container = document.getElementById('customer-orders');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="fas fa-info-circle"></i> You haven't placed any orders yet. 
                <a href="#" onclick="showPage('menu')" class="alert-link">Browse our menu</a> to get started!
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="card order-card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Order #${order.id}</h6>
                <span class="order-status status-${order.status.toLowerCase()}">${capitalizeFirst(order.status)}</span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6>Items:</h6>
                        <ul class="list-unstyled">
                            ${order.orderItems.map(item => `
                                <li class="mb-1">
                                    <strong>${item.menuItem.name}</strong> x ${item.quantity} 
                                    <span class="text-muted">(${formatPrice(item.unitPrice)} each)</span>
                                </li>
                            `).join('')}
                        </ul>
                        ${order.specialInstructions ? `
                            <p class="text-muted mb-1"><strong>Special Instructions:</strong> ${order.specialInstructions}</p>
                        ` : ''}
                    </div>
                    <div class="col-md-4 text-end">
                        <h5 class="text-success">Total: ${formatPrice(order.totalAmount)}</h5>
                        <small class="text-muted">Ordered: ${formatDate(order.createdAt)}</small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadActiveOrders() {
    if (!currentUser || !hasAnyRole(['WORKER', 'MANAGER'])) {
        return;
    }
    
    try {
        showLoading('active-orders');
        const orders = await apiRequest('/orders/active');
        displayActiveOrders(orders);
    } catch (error) {
        document.getElementById('active-orders').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle"></i> Failed to load active orders: ${error.message}
            </div>
        `;
    }
}

function displayActiveOrders(orders) {
    const container = document.getElementById('active-orders');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="fas fa-info-circle"></i> No active orders at the moment.
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="card order-card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">Order #${order.id}</h6>
                    <small class="text-muted">Customer: ${order.customer.fullName}</small>
                </div>
                <span class="order-status status-${order.status.toLowerCase()}">${capitalizeFirst(order.status)}</span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6>Items:</h6>
                        <ul class="list-unstyled">
                            ${order.orderItems.map(item => `
                                <li class="mb-1">
                                    <strong>${item.menuItem.name}</strong> x ${item.quantity}
                                    ${item.specialInstructions ? `<br><small class="text-info">Note: ${item.specialInstructions}</small>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                        ${order.specialInstructions ? `
                            <p class="text-muted mb-1"><strong>Special Instructions:</strong> ${order.specialInstructions}</p>
                        ` : ''}
                    </div>
                    <div class="col-md-4">
                        <div class="text-end mb-2">
                            <h6>Total: ${formatPrice(order.totalAmount)}</h6>
                            <small class="text-muted">Ordered: ${formatDate(order.createdAt)}</small>
                        </div>
                        <div class="btn-group-vertical w-100">
                            ${getOrderStatusButtons(order)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getOrderStatusButtons(order) {
    const statusFlow = {
        'PENDING': 'CONFIRMED',
        'CONFIRMED': 'PREPARING',
        'PREPARING': 'READY',
        'READY': 'COMPLETED'
    };
    
    const nextStatus = statusFlow[order.status];
    let buttons = '';
    
    if (nextStatus) {
        buttons += `
            <button class="btn btn-sm btn-success mb-1" onclick="updateOrderStatus(${order.id}, '${nextStatus}')">
                Mark as ${capitalizeFirst(nextStatus)}
            </button>
        `;
    }
    
    if (order.status !== 'CANCELLED' && order.status !== 'COMPLETED') {
        buttons += `
            <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.id}, 'CANCELLED')">
                Cancel Order
            </button>
        `;
    }
    
    return buttons;
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await apiRequest(`/orders/${orderId}/status?status=${newStatus}`, {
            method: 'PATCH'
        });
        
        showAlert(`Order #${orderId} status updated to ${capitalizeFirst(newStatus)}`, 'success');
        
        // Reload the orders
        if (hasRole('WORKER') || hasRole('MANAGER')) {
            loadActiveOrders();
        }
    } catch (error) {
        showAlert('Failed to update order status: ' + error.message, 'danger');
    }
}

async function loadMenuManagement() {
    if (!currentUser || !hasRole('MANAGER')) {
        return;
    }
    
    try {
        showLoading('menu-management');
        const menuItems = await apiRequest('/menu/all');
        displayMenuManagement(menuItems);
    } catch (error) {
        document.getElementById('menu-management').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle"></i> Failed to load menu items: ${error.message}
            </div>
        `;
    }
}

function displayMenuManagement(menuItems) {
    const container = document.getElementById('menu-management');
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${menuItems.map(item => `
                        <tr>
                            <td>
                                <img src="${item.imageUrl || 'https://via.placeholder.com/50x50?text=No+Image'}" 
                                     class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;" alt="${item.name}">
                            </td>
                            <td>
                                <strong>${item.name}</strong><br>
                                <small class="text-muted">${item.description || 'No description'}</small>
                            </td>
                            <td><span class="badge bg-secondary">${capitalizeFirst(item.category)}</span></td>
                            <td>${formatPrice(item.price)}</td>
                            <td>
                                <span class="badge ${item.available ? 'bg-success' : 'bg-danger'}">
                                    ${item.available ? 'Available' : 'Unavailable'}
                                </span>
                            </td>
                            <td>
                                <div class="btn-group-vertical btn-group-sm">
                                    <button class="btn btn-outline-info" onclick="uploadImage(${item.id})" title="Upload Image">
                                        <i class="fas fa-image"></i>
                                    </button>
                                    <button class="btn btn-outline-primary" onclick="toggleItemAvailability(${item.id})" title="Toggle Availability">
                                        ${item.available ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>'}
                                    </button>
                                    <button class="btn btn-outline-warning" onclick="editMenuItem(${item.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="deleteMenuItem(${item.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function toggleItemAvailability(itemId) {
    try {
        await apiRequest(`/menu/${itemId}/toggle-availability`, {
            method: 'PATCH'
        });
        
        showAlert('Menu item availability updated', 'success');
        loadMenuManagement();
    } catch (error) {
        showAlert('Failed to update item availability: ' + error.message, 'danger');
    }
}

async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }
    
    try {
        await apiRequest(`/menu/${itemId}`, {
            method: 'DELETE'
        });
        
        showAlert('Menu item deleted successfully', 'success');
        loadMenuManagement();
    } catch (error) {
        showAlert('Failed to delete menu item: ' + error.message, 'danger');
    }
}

function uploadImage(itemId) {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`${API_BASE_URL}/menu/${itemId}/image`, {
                method: 'POST',
                body: formData
            });
            
            // Parse response only once
            const contentType = response.headers.get('content-type');
            let data = null;
            
            if (contentType && contentType.includes('application/json')) {
                const responseText = await response.text();
                if (responseText.trim()) {
                    data = JSON.parse(responseText);
                }
            }
            
            if (!response.ok) {
                throw new Error(data?.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            showAlert('Image uploaded successfully!', 'success');
            loadMenuManagement();
        } catch (error) {
            showAlert('Failed to upload image: ' + error.message, 'danger');
        }
    };
    
    fileInput.click();
}

async function editMenuItem(itemId) {
    try {
        // Fetch the current menu item data
        const menuItem = await apiRequest(`/menu/${itemId}`);
        
        const modalHtml = `
            <div class="modal fade" id="editMenuItemModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Menu Item</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-menu-item-form">
                                <div class="mb-3">
                                    <label for="edit-item-name" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="edit-item-name" value="${menuItem.name}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-item-description" class="form-label">Description</label>
                                    <textarea class="form-control" id="edit-item-description" rows="3">${menuItem.description || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-item-category" class="form-label">Category</label>
                                    <select class="form-control" id="edit-item-category" required>
                                        <option value="BREAKFAST" ${menuItem.category === 'BREAKFAST' ? 'selected' : ''}>Breakfast</option>
                                        <option value="LUNCH" ${menuItem.category === 'LUNCH' ? 'selected' : ''}>Lunch</option>
                                        <option value="DINNER" ${menuItem.category === 'DINNER' ? 'selected' : ''}>Dinner</option>
                                        <option value="BEVERAGES" ${menuItem.category === 'BEVERAGES' ? 'selected' : ''}>Beverages</option>
                                        <option value="SNACKS" ${menuItem.category === 'SNACKS' ? 'selected' : ''}>Snacks</option>
                                        <option value="DESSERTS" ${menuItem.category === 'DESSERTS' ? 'selected' : ''}>Desserts</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-item-price" class="form-label">Price</label>
                                    <input type="number" class="form-control" id="edit-item-price" step="0.01" min="0" value="${menuItem.price}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-item-available" class="form-label">Availability</label>
                                    <select class="form-control" id="edit-item-available" required>
                                        <option value="true" ${menuItem.available ? 'selected' : ''}>Available</option>
                                        <option value="false" ${!menuItem.available ? 'selected' : ''}>Unavailable</option>
                                    </select>
                                </div>
                                ${menuItem.imageUrl ? `
                                    <div class="mb-3">
                                        <label class="form-label">Current Image</label>
                                        <div>
                                            <img src="${menuItem.imageUrl}" class="img-thumbnail" style="max-width: 150px; max-height: 150px; object-fit: cover;" alt="${menuItem.name}">
                                        </div>
                                    </div>
                                ` : ''}
                                <div class="mb-3">
                                    <label for="edit-item-image" class="form-label">${menuItem.imageUrl ? 'Replace Image (Optional)' : 'Add Image (Optional)'}</label>
                                    <input type="file" class="form-control" id="edit-item-image" accept="image/*">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="submitEditMenuItem(${itemId})">Update Item</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editMenuItemModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editMenuItemModal'));
        modal.show();
        
    } catch (error) {
        showAlert('Failed to load menu item details: ' + error.message, 'danger');
    }
}

async function submitEditMenuItem(itemId) {
    const name = document.getElementById('edit-item-name').value;
    const description = document.getElementById('edit-item-description').value;
    const category = document.getElementById('edit-item-category').value;
    const price = parseFloat(document.getElementById('edit-item-price').value);
    const available = document.getElementById('edit-item-available').value === 'true';
    const imageFile = document.getElementById('edit-item-image').files[0];
    
    if (!name || !category || !price) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        // Update menu item data
        const menuItemData = {
            name: name,
            description: description,
            category: category,
            price: price,
            available: available
        };
        
        const updatedMenuItem = await apiRequest(`/menu/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(menuItemData)
        });
        
        // Upload new image if provided
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const imageResponse = await fetch(`${API_BASE_URL}/menu/${itemId}/image`, {
                method: 'POST',
                body: formData
            });
            
            // Handle image upload response properly
            if (!imageResponse.ok) {
                const contentType = imageResponse.headers.get('content-type');
                let errorData = null;
                
                if (contentType && contentType.includes('application/json')) {
                    const responseText = await imageResponse.text();
                    if (responseText.trim()) {
                        errorData = JSON.parse(responseText);
                    }
                }
                
                throw new Error(errorData?.error || `Image upload failed: HTTP ${imageResponse.status}`);
            }
        }
        
        showAlert('Menu item updated successfully!', 'success');
        
        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('editMenuItemModal'));
        modal.hide();
        loadMenuManagement();
        
    } catch (error) {
        showAlert('Failed to update menu item: ' + error.message, 'danger');
    }
}

function showAddMenuItemForm() {
    const modalHtml = `
        <div class="modal fade" id="addMenuItemModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Menu Item</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-menu-item-form">
                            <div class="mb-3">
                                <label for="item-name" class="form-label">Name</label>
                                <input type="text" class="form-control" id="item-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="item-description" class="form-label">Description</label>
                                <textarea class="form-control" id="item-description" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="item-category" class="form-label">Category</label>
                                <select class="form-control" id="item-category" required>
                                    <option value="BREAKFAST">Breakfast</option>
                                    <option value="LUNCH">Lunch</option>
                                    <option value="DINNER">Dinner</option>
                                    <option value="BEVERAGES">Beverages</option>
                                    <option value="SNACKS">Snacks</option>
                                    <option value="DESSERTS">Desserts</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="item-price" class="form-label">Price</label>
                                <input type="number" class="form-control" id="item-price" step="0.01" min="0" required>
                            </div>
                            <div class="mb-3">
                                <label for="item-image" class="form-label">Image (Optional)</label>
                                <input type="file" class="form-control" id="item-image" accept="image/*">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitNewMenuItem()">Add Item</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addMenuItemModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addMenuItemModal'));
    modal.show();
}

async function submitNewMenuItem() {
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const category = document.getElementById('item-category').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const imageFile = document.getElementById('item-image').files[0];
    
    if (!name || !category || !price) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        // Create menu item first
        const menuItemData = {
            name: name,
            description: description,
            category: category,
            price: price,
            available: true
        };
        
        const menuItem = await apiRequest('/menu', {
            method: 'POST',
            body: JSON.stringify(menuItemData)
        });
        
        // Upload image if provided
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const imageResponse = await fetch(`${API_BASE_URL}/menu/${menuItem.id}/image`, {
                method: 'POST',
                body: formData
            });
            
            // Handle image upload response properly
            if (!imageResponse.ok) {
                const contentType = imageResponse.headers.get('content-type');
                let errorData = null;
                
                if (contentType && contentType.includes('application/json')) {
                    const responseText = await imageResponse.text();
                    if (responseText.trim()) {
                        errorData = JSON.parse(responseText);
                    }
                }
                
                throw new Error(errorData?.error || `Image upload failed: HTTP ${imageResponse.status}`);
            }
        }
        
        showAlert('Menu item added successfully!', 'success');
        
        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMenuItemModal'));
        modal.hide();
        loadMenuManagement();
        
    } catch (error) {
        showAlert('Failed to add menu item: ' + error.message, 'danger');
    }
}

async function loadOrderStats() {
    if (!currentUser || !hasRole('MANAGER')) {
        return;
    }
    
    try {
        showLoading('order-stats');
        const todayOrders = await apiRequest('/orders/today');
        const allOrders = await apiRequest('/orders');
        
        displayOrderStats(todayOrders, allOrders);
    } catch (error) {
        document.getElementById('order-stats').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle"></i> Failed to load order statistics: ${error.message}
            </div>
        `;
    }
}

function displayOrderStats(todayOrders, allOrders) {
    const container = document.getElementById('order-stats');
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    
    container.innerHTML = `
        <div class="row text-center">
            <div class="col-6">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">${todayOrders.length}</h5>
                        <p class="card-text">Today's Orders</p>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">${formatPrice(todayRevenue)}</h5>
                        <p class="card-text">Today's Revenue</p>
                    </div>
                </div>
            </div>
            <div class="col-6 mt-2">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5 class="card-title">${allOrders.length}</h5>
                        <p class="card-text">Total Orders</p>
                    </div>
                </div>
            </div>
            <div class="col-6 mt-2">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5 class="card-title">${formatPrice(totalRevenue)}</h5>
                        <p class="card-text">Total Revenue</p>
                    </div>
                </div>
            </div>
        </div>
    `;
} 