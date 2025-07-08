const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

if(!loggedInUser || !loggedInUser.isAdmin) {
    window.location.href = "index.html";
}

// Initialize UI
function initUI() {
    // Navigation
    const heading = document.createElement("h1");
    heading.innerHTML = `Welcome ${loggedInUser.username}`;
    nav.appendChild(heading);

    const sideNav = document.createElement("div");
    
    const adminBadge = document.createElement("span");
    adminBadge.className = "admin-badge";
    adminBadge.id = "admin-badge";
    adminBadge.setAttribute("title", "Admin User");
    adminBadge.innerHTML = '<i class="fas fa-user-tie"></i> Admin';
    sideNav.appendChild(adminBadge);

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "button button-danger";
    logoutBtn.id = "logoutBtn";
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
    sideNav.appendChild(logoutBtn);
    nav.appendChild(sideNav);

    renderAdminInterface();
}

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

async function addProduct(product) {
    try {
        const response = await fetch('http://localhost:6060/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding product:', error);
        return { success: false, error: 'Failed to add product' };
    }
}

async function updateProduct(id, updates) {
    try {
        const response = await fetch(`http://localhost:6060/api/products/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: 'Failed to update product' };
    }
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`http://localhost:6060/api/products/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}

function renderAdminInterface() {
    const upperDiv = document.createElement("div");
    upperDiv.classList.add("upper-div");

    const inputsBox = document.createElement("div");
    inputsBox.classList.add("inputs");

    const nameBox = document.createElement("input");
    nameBox.id = "nameBox";
    nameBox.type = "text";
    nameBox.placeholder = "Product name";
    nameBox.required = true;

    const quanBox = document.createElement("input");
    quanBox.id = "quanBox";
    quanBox.type = "number";
    quanBox.placeholder = "Stock quantity";
    quanBox.min = "1";
    quanBox.required = true;

    const priceBox = document.createElement("input");
    priceBox.id = "priceBox";
    priceBox.type = "number";
    priceBox.placeholder = "Price";
    priceBox.min = "1";
    priceBox.required = true;

    const descBox = document.createElement("input");
    descBox.id = "descBox";
    descBox.type = "text";
    descBox.placeholder = "Description";
    descBox.required = true;

    inputsBox.appendChild(nameBox);
    inputsBox.appendChild(quanBox);
    inputsBox.appendChild(priceBox);
    inputsBox.appendChild(descBox);

    const buttonsBox = document.createElement("div");
    buttonsBox.classList.add("Buttons");

    const addBtn = document.createElement("button");
    addBtn.className = "button button-success";
    addBtn.id = "addBtn";
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
    addBtn.addEventListener("click", async () => {
        const existingUpdNow = document.querySelector("#updNowBtn");
        if (existingUpdNow) existingUpdNow.remove();

        if(!nameBox.value.trim() || isNaN(quanBox.value) || isNaN(priceBox.value) || !descBox.value.trim()) {
            alert("Please fill all fields with valid values");
            return;
        }

        const newProduct = {
            title: nameBox.value.trim(),
            quantity: parseInt(quanBox.value),
            price: parseFloat(priceBox.value),
            description: descBox.value.trim()
        };

        const result = await addProduct(newProduct);
        if (result.success) {
            renderItems();
            alert('Product added successfully');
            nameBox.value = '';
            quanBox.value = '';
            priceBox.value = '';
            descBox.value = '';
        } else {
            alert(`Failed to add product: ${result.error}`);
        }
    });
    buttonsBox.appendChild(addBtn);

    upperDiv.appendChild(inputsBox);
    upperDiv.appendChild(buttonsBox);
    itemsBox.appendChild(upperDiv);

    renderItems();
}

async function renderItems() {
    const lowerDiv = document.createElement("div");
    lowerDiv.className = "lower-div";
    
    // Clear existing items
    const existingLowerDiv = document.querySelector(".lower-div");
    if(existingLowerDiv) existingLowerDiv.remove();

    const products = await fetchProducts();

    if(products.length === 0) {
        lowerDiv.textContent = "No products found";
    } else {
        products.forEach(product => {
            addToDom(product, lowerDiv);
        });
    }

    itemsBox.appendChild(lowerDiv);
}

function addToDom(product, container) {
    const div = document.createElement("div");
    div.setAttribute("id", product.id);
    div.classList.add("item");

    const ul = document.createElement("ul");

    const nameLi = document.createElement("li");
    nameLi.classList.add("itemName");
    nameLi.innerHTML = `<strong>Name:</strong> ${product.title}`;
    ul.appendChild(nameLi);

    const quanLi = document.createElement("li");
    quanLi.classList.add("itemQuantity");
    quanLi.innerHTML = `<strong>Stock:</strong> ${product.quantity}`;
    ul.appendChild(quanLi);

    const priceLi = document.createElement("li");
    priceLi.classList.add("itemPrice");
    priceLi.innerHTML = `<strong>Price:</strong> $${product.price}`;
    ul.appendChild(priceLi);

    const descLi = document.createElement("li");
    descLi.classList.add("itemDesc");
    descLi.innerHTML = `<strong>Description:</strong> ${product.description}`;
    ul.appendChild(descLi);

    div.appendChild(ul);

    const btnBox = document.createElement("div");
    btnBox.classList.add("button-box");

    const delBtn = document.createElement("button");
    delBtn.className = "button button-danger";
    delBtn.classList.add("deleteBtn");
    delBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    delBtn.addEventListener("click", async () => {
        const confirmDelete = confirm(`Are you sure you want to delete "${product.title}"?`);
        if (!confirmDelete) return;

        const result = await deleteProduct(product.id);
        if (result.success) {
            div.remove();
            // clear all inputs
            document.querySelector("#nameBox").value = '';
            document.querySelector("#quanBox").value = '';
            document.querySelector("#priceBox").value = '';
            document.querySelector("#descBox").value = '';
        } else {
            alert(`Failed to delete product: ${result.error}`);
        }
    });
    btnBox.appendChild(delBtn);

    const editBtn = document.createElement("button");
    editBtn.className = "button";
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.addEventListener("click", () => {
        const confirmUpdate = confirm(`Are you sure you want to update "${product.title}"?`);
        if (!confirmUpdate) return;

        // Pre-fill the admin input fields
        document.querySelector("#nameBox").value = product.title;
        document.querySelector("#quanBox").value = product.stock;
        document.querySelector("#priceBox").value = product.price;
        document.querySelector("#descBox").value = product.description;

        // Remove existing Update Now button if any
        const existingUpdNow = document.querySelector("#updNowBtn");
        if (existingUpdNow) existingUpdNow.remove();

        // Disable Add Product button
        const addBtn = document.querySelector("#addBtn");
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.style.cursor = "not-allowed";
        }

        // Disable Logout button
        const logoutBtn = document.querySelector("#logoutBtn") 
        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.style.cursor = "not-allowed";
        }

        // disable other Delete buttons too..
        const allDelBtns = document.querySelectorAll(".deleteBtn");
        if(allDelBtns){
            allDelBtns.forEach(button => {
                button.disabled = true;
                button.style.cursor = "not-allowed";
            })
        }

        // Creating Update Now Button
        const updNow = document.createElement("button");
        updNow.id = "updNowBtn";
        updNow.className = "button button-success";
        updNow.innerHTML = '<i class="fas fa-save"></i> Update Now';
        document.querySelector(".Buttons").appendChild(updNow);

        updNow.addEventListener("click", async () => {
            const nameInput = document.querySelector("#nameBox").value.trim();
            const stockInput = parseInt(document.querySelector("#quanBox").value);
            const priceInput = parseFloat(document.querySelector("#priceBox").value);
            const descInput = document.querySelector("#descBox").value.trim();

            if (nameInput === "") {
                alert("Product name cannot be empty or just spaces. Please enter a valid name.");
                return;
            }

            const updates = {};
            if (product.title !== nameInput) updates.title = nameInput;
            if (product.stock !== stockInput) updates.stock = stockInput;
            if (product.price !== priceInput) updates.price = priceInput;
            if (product.description !== descInput) updates.description = descInput;

            if (Object.keys(updates).length === 0) {
                alert("No changes were made");
            } else {
                const result = await updateProduct(product.id, updates);
                if (result.success) {
                    renderItems();
                } else {
                    alert(`Failed to update product: ${result.error}`);
                }
            }

            // Re-enable buttons
            if (addBtn) {
                addBtn.disabled = false;
                addBtn.style.cursor = "pointer";
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
            }
            if (logoutBtn) {
                logoutBtn.disabled = false;
                logoutBtn.style.cursor = "pointer";
            }
            if(allDelBtns){
                allDelBtns.forEach(button => {
                    button.disabled = false;
                    button.style.cursor = "pointer";
                })
            }

            updNow.remove();

            document.querySelector("#nameBox").value = '';
            document.querySelector("#quanBox").value = '';
            document.querySelector("#priceBox").value = '';
            document.querySelector("#descBox").value = '';
        });
    });
    btnBox.appendChild(editBtn);

    div.appendChild(btnBox);
    container.appendChild(div);
}

// Initialize the page
initUI();