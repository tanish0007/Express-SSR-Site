const cartContainer = document.querySelector('.cart-container');
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};

if (!loggedInUser.id) {
    window.location.href = "index.html";
}

const navButtons = document.createElement('div');
navButtons.className = 'cart-nav-buttons';
document.body.insertBefore(navButtons, cartContainer);

const viewOrdersBtn = document.createElement('button');
viewOrdersBtn.className = 'button';
viewOrdersBtn.innerHTML = '<i class="fas fa-clipboard-list"></i> View Orders';
viewOrdersBtn.addEventListener('click', toggleOrdersView);
navButtons.appendChild(viewOrdersBtn);

const backToShopBtn = document.createElement('button');
backToShopBtn.className = 'button';
backToShopBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> Back to Shop';
backToShopBtn.addEventListener('click', () => {
    window.location.href = "user.html";
});
navButtons.appendChild(backToShopBtn);

const logoutBtn = document.createElement('button');
logoutBtn.className = 'button button-danger';
logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});
navButtons.appendChild(logoutBtn);

let showingOrders = false;

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:6060/api/products');
        const data = await response.json();
        if (data.success) {
            return data.products;
        } else {
            console.error('Error fetching products:', data.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function fetchUserData(userId) {
    try {
        const response = await fetch(`http://localhost:6060/api/users/${userId}`);
        const data = await response.json();
        if (data.success) {
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function fetchUserOrders(userId) {
    try {
        const response = await fetch(`http://localhost:6060/api/users/${userId}/orders`);
        const data = await response.json();
        if (data.success) {
            return data.orders;
        }
        return [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

async function updateUserCart(userId, cart) {
    try {
        const response = await fetch(`http://localhost:6060/api/users/${userId}/cart`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating cart:', error);
        return { success: false };
    }
}

function createCartHeader() {
    const header = document.createElement('div');
    header.className = 'cart-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Your Shopping Cart';
    header.appendChild(title);
    
    const itemCount = document.createElement('span');
    itemCount.className = 'item-count';
    itemCount.textContent = `${loggedInUser.cart.reduce((total, item) => total + item.quantity, 0)} items`;
    header.appendChild(itemCount);
    
    return header;
}

function createCartItem(product, cartItem) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.dataset.id = product.id;

    const imgDiv = document.createElement('div');
    imgDiv.className = 'item-image';
    imgDiv.innerHTML = '<i class="fas fa-box-open"></i>';
    itemDiv.appendChild(imgDiv);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'item-info';

    const name = document.createElement('h3');
    name.textContent = product.title;
    infoDiv.appendChild(name);

    const price = document.createElement('p');
    price.className = 'item-price';
    price.textContent = `$${product.price.toFixed(2)}`;
    infoDiv.appendChild(price);

    itemDiv.appendChild(infoDiv);

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'item-quantity';

    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'quantity-btn';
    decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
    decreaseBtn.addEventListener('click', () => updateQuantity(product.id, -1));
    quantityDiv.appendChild(decreaseBtn);

    const quantity = document.createElement('span');
    quantity.className = 'quantity';
    quantity.textContent = cartItem.quantity;
    quantityDiv.appendChild(quantity);

    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'quantity-btn';
    increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
    increaseBtn.addEventListener('click', () => updateQuantity(product.id, 1));
    quantityDiv.appendChild(increaseBtn);

    itemDiv.appendChild(quantityDiv);

    const totalDiv = document.createElement('div');
    totalDiv.className = 'item-total';
    totalDiv.textContent = `$${(product.price * cartItem.quantity).toFixed(2)}`;
    itemDiv.appendChild(totalDiv);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    removeBtn.addEventListener('click', () => removeItem(product.id));
    itemDiv.appendChild(removeBtn);

    return itemDiv;
}

function createCartSummary() {
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'cart-summary';

    const summaryTitle = document.createElement('h3');
    summaryTitle.textContent = 'Order Summary';
    summaryDiv.appendChild(summaryTitle);

    const subtotalDiv = document.createElement('div');
    subtotalDiv.className = 'summary-row';
    
    const subtotalLabel = document.createElement('span');
    subtotalLabel.textContent = 'Subtotal';
    subtotalDiv.appendChild(subtotalLabel);
    
    const subtotalValue = document.createElement('span');
    subtotalValue.id = 'subtotal';
    subtotalValue.textContent = '$0.00';
    subtotalDiv.appendChild(subtotalValue);
    
    summaryDiv.appendChild(subtotalDiv);

    const shippingDiv = document.createElement('div');
    shippingDiv.className = 'summary-row';
    
    const shippingLabel = document.createElement('span');
    shippingLabel.textContent = 'Shipping';
    shippingDiv.appendChild(shippingLabel);
    
    const shippingValue = document.createElement('span');
    shippingValue.textContent = 'FREE';
    shippingDiv.appendChild(shippingValue);
    
    summaryDiv.appendChild(shippingDiv);

    const totalDiv = document.createElement('div');
    totalDiv.className = 'summary-row total';
    
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Total';
    totalDiv.appendChild(totalLabel);
    
    const totalValue = document.createElement('span');
    totalValue.id = 'total';
    totalValue.textContent = '$0.00';
    totalDiv.appendChild(totalValue);
    
    summaryDiv.appendChild(totalDiv);

    const checkoutBtn = document.createElement('button');
    checkoutBtn.className = 'checkout-btn';
    checkoutBtn.textContent = 'Place Order';
    checkoutBtn.addEventListener('click', placeOrder);
    summaryDiv.appendChild(checkoutBtn);

    return summaryDiv;
}

async function toggleOrdersView() {
    showingOrders = !showingOrders;
    
    if (showingOrders) {
        viewOrdersBtn.classList.add('active');
        await renderOrders();
    } else {
        viewOrdersBtn.classList.remove('active');
        renderCart();
    }
}

async function renderOrders() {
    cartContainer.innerHTML = '';
    
    const orders = await fetchUserOrders(loggedInUser.id);
    
    if (orders.length === 0) {
        const emptyOrders = document.createElement('div');
        emptyOrders.className = 'empty-orders';
        emptyOrders.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet</p>
        `;
        cartContainer.appendChild(emptyOrders);
        return;
    }

    const ordersTitle = document.createElement('h2');
    ordersTitle.textContent = 'Your Orders';
    ordersTitle.className = 'orders-title';
    cartContainer.appendChild(ordersTitle);

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order';

        const orderHeader = document.createElement('div');
        orderHeader.className = 'order-header';
        
        const orderId = document.createElement('span');
        orderId.className = 'order-id';
        orderId.textContent = `Order #${order.id}`;
        orderHeader.appendChild(orderId);
        
        const orderDate = document.createElement('span');
        orderDate.className = 'order-date';
        orderDate.textContent = new Date(order.date).toLocaleDateString();
        orderHeader.appendChild(orderDate);
        
        const orderTotal = document.createElement('span');
        orderTotal.className = 'order-total';
        orderTotal.textContent = `$${order.total.toFixed(2)}`;
        orderHeader.appendChild(orderTotal);
        
        orderDiv.appendChild(orderHeader);

        const orderStatus = document.createElement('div');
        orderStatus.className = 'order-status';
        orderStatus.textContent = `Status: ${order.status}`;
        orderDiv.appendChild(orderStatus);

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'order-items';

        order.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item';
            
            const itemName = document.createElement('span');
            itemName.className = 'order-item-name';
            itemName.textContent = item.title;
            itemDiv.appendChild(itemName);
            
            const itemDetails = document.createElement('span');
            itemDetails.className = 'order-item-details';
            itemDetails.textContent = `${item.quantity} × $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`;
            itemDiv.appendChild(itemDetails);
            
            itemsContainer.appendChild(itemDiv);
        });

        orderDiv.appendChild(itemsContainer);
        cartContainer.appendChild(orderDiv);
    });
}

async function updateQuantity(productId, change) {
    const cartItem = loggedInUser.cart.find(item => item.id === productId);
    if (!cartItem) return;

    cartItem.quantity += change;

    if (cartItem.quantity <= 0) {
        loggedInUser.cart = loggedInUser.cart.filter(item => item.id !== productId);
    }

    const result = await updateUserCart(loggedInUser.id, loggedInUser.cart);
    if (result.success) {
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        renderCart();
    }
}

async function removeItem(productId) {
    loggedInUser.cart = loggedInUser.cart.filter(item => item.id !== productId);
    
    const result = await updateUserCart(loggedInUser.id, loggedInUser.cart);
    if (result.success) {
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        renderCart();
    }
}

function calculateTotals(products) {
    let subtotal = 0;
    
    loggedInUser.cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            subtotal += product.price * cartItem.quantity;
        }
    });

    return {
        subtotal,
        total: subtotal
    };
}

async function placeOrder() {
    if (loggedInUser.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const products = await fetchProducts();
    const totals = calculateTotals(products);
    
    const orderItems = loggedInUser.cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        return {
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: cartItem.quantity,
            total: product.price * cartItem.quantity
        };
    });

    try {
        const response = await fetch(`http://localhost:6060/api/users/${loggedInUser.id}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: orderItems,
                total: totals.total
            })
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Order placed successfully!');
            
            loggedInUser.cart = [];
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
            
            await updateUserCart(loggedInUser.id, []);
            
            showingOrders = true;
            viewOrdersBtn.classList.add('active');
            await renderOrders();
        } else {
            alert('Failed to place order. Please try again.');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    }
}

async function renderCart() {
    cartContainer.innerHTML = '';
    
    if (loggedInUser.cart.length === 0) {
        const emptyCart = document.createElement('div');
        emptyCart.className = 'empty-cart';
        emptyCart.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet</p>
            <button class="button button-success" onclick="window.location.href='user.html'">Continue Shopping</button>
        `;
        cartContainer.appendChild(emptyCart);
        return;
    }

    const products = await fetchProducts();
    const totals = calculateTotals(products);

    const cartHeader = createCartHeader();
    cartContainer.appendChild(cartHeader);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';

    loggedInUser.cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            const cartItemElement = createCartItem(product, cartItem);
            itemsContainer.appendChild(cartItemElement);
        }
    });

    cartContainer.appendChild(itemsContainer);

    const cartSummary = createCartSummary();
    cartContainer.appendChild(cartSummary);

    document.getElementById('subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${totals.total.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const userData = await fetchUserData(loggedInUser.id);
    if (userData) {
        loggedInUser.cart = userData.cart || [];
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    }
    renderCart();
});