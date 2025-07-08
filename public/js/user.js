const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};

let currentPage = 1;
let itemsPerPage = 8;

if (!loggedInUser.id) {
    window.location.href = "index.html";
}

let items = [];
let showingWishlist = false;

// API Helper Functions
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

async function updateUserWishlist(userId, wishlist) {
    try {
        const response = await fetch(`http://localhost:6060/api/users/${userId}/wishlist`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wishlist })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating wishlist:', error);
        return { success: false };
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

// Initialize data
async function initData() {
    items = await fetchProducts();
    const userData = await fetchUserData(loggedInUser.id);
    if (userData) {
        loggedInUser.wishlist = userData.wishlist || [];
        loggedInUser.cart = userData.cart || [];
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    }
    initUI();
}

// Pagination functions remain the same
function calculateTotalPages(itemsToDisplay) {
    if (itemsToDisplay.length % itemsPerPage === 0) {
        return itemsToDisplay.length / itemsPerPage;
    } else {
        return Math.floor(itemsToDisplay.length / itemsPerPage) + 1;
    }
}

function getItemsForCurrentPage(itemsToDisplay) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, itemsToDisplay.length);
    return itemsToDisplay.slice(startIndex, endIndex);
}

function renderPaginationControls(totalPages) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination-controls";

    const prevButton = document.createElement("button");
    prevButton.innerHTML = "&laquo;";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderItems();
        }
    });

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${currentPage}/${totalPages}`;

    const nextButton = document.createElement("button");
    nextButton.innerHTML = "&raquo;";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderItems();
        }
    });

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);

    return paginationDiv;
}

function initUI() {
    const heading = document.createElement("h1");
    heading.innerHTML = `Welcome ${loggedInUser.name || 'User'}`;
    nav.appendChild(heading);

    const sideNav = document.createElement("div");
    sideNav.className = "side-nav";

    // Wishlist button with counter
    const wishlistBtnContainer = document.createElement("div");
    wishlistBtnContainer.className = "nav-btn-container";
    
    const wishlistBtn = document.createElement("button");
    wishlistBtn.className = `button ${showingWishlist ? 'active' : ''}`;
    wishlistBtn.innerHTML = '<i class="fas fa-heart" style="color: red"></i> Wishlist';
    wishlistBtn.addEventListener("click", toggleWishlist);
    wishlistBtnContainer.appendChild(wishlistBtn);
    
    const wishlistCounter = document.createElement("span");
    wishlistCounter.className = "nav-counter";
    wishlistCounter.id = "wishlistCount";
    wishlistCounter.textContent = loggedInUser.wishlist.length;
    wishlistBtnContainer.appendChild(wishlistCounter);
    sideNav.appendChild(wishlistBtnContainer);

    // Cart button with counter
    const cartBtnContainer = document.createElement("div");
    cartBtnContainer.className = "nav-btn-container";
    
    const cartBtn = document.createElement("button");
    cartBtn.className = `button ${showingCart ? 'active' : ''}`;
    cartBtn.innerHTML = '<i class="fas fa-shopping-cart" style="color: blue"></i> Cart';
    cartBtn.addEventListener("click", () => {
        window.location.href = "cart.html";
    });
    cartBtnContainer.appendChild(cartBtn);
    
    const cartCounter = document.createElement("span");
    cartCounter.className = "nav-counter";
    cartCounter.id = "cartCount";
    cartCounter.textContent = loggedInUser.cart.reduce((total, item) => total + item.quantity, 0);
    cartBtnContainer.appendChild(cartCounter);
    sideNav.appendChild(cartBtnContainer);

    // Logout button
    const logoutBtn = document.createElement("button");
    logoutBtn.className = "button button-danger";
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
    sideNav.appendChild(logoutBtn);
    nav.appendChild(sideNav);

    renderItems();
}

function toggleWishlist() {
    showingWishlist = !showingWishlist;
    currentPage = 1;
    updateNavButtons();
    renderItems();
}

function updateNavButtons() {
    const wishlistBtn = document.querySelector('.side-nav .fa-heart').closest('button');
    wishlistBtn.classList.toggle('active', showingWishlist);
}

function updateNavCounters() {
    document.querySelector('#wishlistCount').textContent = loggedInUser.wishlist.length;
    document.querySelector('#cartCount').textContent = loggedInUser.cart.reduce((total, item) => total + item.quantity, 0);
}

function renderItems() {
    const lowerDiv = document.createElement("div");
    lowerDiv.className = "lower-div";
    
    const existingLowerDiv = document.querySelector(".lower-div");
    if(existingLowerDiv) existingLowerDiv.remove();

    let itemsToDisplay = [];
    if (showingWishlist) {
        itemsToDisplay = items.filter(item => 
            loggedInUser.wishlist.includes(item.id)
        );
    } else {
        itemsToDisplay = [...items];
    }

    const totalPages = calculateTotalPages(itemsToDisplay);
    const paginatedItems = getItemsForCurrentPage(itemsToDisplay);

    if(paginatedItems.length === 0) {
        const noItemsMsg = document.createElement("div");
        noItemsMsg.className = "no-items";
        noItemsMsg.textContent = showingWishlist ? "Your wishlist is empty" : "No items available";
        lowerDiv.appendChild(noItemsMsg);
    } else {
        paginatedItems.forEach(item => {
            addToDom(item, lowerDiv);
        });

        if (totalPages > 1) {
            const paginationControls = renderPaginationControls(totalPages);
            lowerDiv.appendChild(paginationControls);
        }
    }

    itemsBox.appendChild(lowerDiv);
}

function addToDom(item, container) {
    const div = document.createElement("div");
    div.setAttribute("id", item.id);
    div.classList.add("item");

    const ul = document.createElement("ul");

    const nameLi = document.createElement("li");
    nameLi.classList.add("itemName");
    nameLi.innerHTML = `<strong>Name:</strong> ${item.title || "Unnamed Item"}`;
    ul.appendChild(nameLi);

    const priceLi = document.createElement("li");
    priceLi.classList.add("itemPrice");
    priceLi.innerHTML = `<strong>Price:</strong> $${(item.price || 0)}`;
    ul.appendChild(priceLi);

    const descLi = document.createElement("li");
    descLi.classList.add("itemDesc");
    descLi.innerHTML = `<strong>Description:</strong> ${item.description || "No description available"}`;
    ul.appendChild(descLi);

    div.appendChild(ul);

    const btnBox = document.createElement("div");
    btnBox.classList.add("button-box");

    // Wishlist button
    const wishlistBtn = document.createElement("button");
    wishlistBtn.className = "wishlist-btn";
    wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
    wishlistBtn.classList.toggle("active", loggedInUser.wishlist.includes(item.id));

    wishlistBtn.addEventListener("click", async (e) => {
        const isActive = e.currentTarget.classList.contains("active");
        e.currentTarget.classList.toggle("active", !isActive);
        
        const index = loggedInUser.wishlist.indexOf(item.id);
        if (index === -1) {
            loggedInUser.wishlist.push(item.id);
        } else {
            loggedInUser.wishlist.splice(index, 1);
        }
        
        const result = await updateUserWishlist(loggedInUser.id, loggedInUser.wishlist);
        if (result.success) {
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
            updateNavCounters();
            if (showingWishlist) {
                renderItems();
            }
        }
    });
    btnBox.appendChild(wishlistBtn);

    // Add to Cart button
    const cartBtn = document.createElement("button");
    cartBtn.className = "button button-success";
    cartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
    cartBtn.addEventListener("click", async () => {
        const existingItem = loggedInUser.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            loggedInUser.cart.push({ id: item.id, quantity: 1 });
        }
        
        const result = await updateUserCart(loggedInUser.id, loggedInUser.cart);
        if (result.success) {
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
            updateNavCounters();
        }
    });
    btnBox.appendChild(cartBtn);

    div.appendChild(btnBox);
    container.appendChild(div);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", initData);