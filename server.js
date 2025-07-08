const express = require('express');
const FS = require('fs');
const app = express();
const PORT = 6060;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/auth/login", (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({
            "success": false,
            "error": "Email and password are required"
        });
    }
    FS.readFile(`db/users.json`, 'utf8', (err, data) => {
        if(err){
            return res.status(500).json({
                "success": false,
                "error": "Server error"
            });
        }

        const users = JSON.parse(data);
        let existingUser = {};
        for(let i=0; i<users.length; i++){
            if(users[i].email === email && users[i].password === password){
                existingUser = users[i];
            }
        }
        if(!existingUser){
            res.json({
                "success": false,
                "error": "Invalid credentials"
            }).status(401);
            return;
        }
        res.json({
            "success": true, 
            "user": existingUser
        }).status(200);
    })
})

app.post("/api/auth/signup", (req,res) => {
    console.log(req.body);
    const {id, username, email, password, isAdmin} = req.body;
    console.log(`${id} ${username} ${email} ${password} ${isAdmin}`)
    if (!email || !password || !username || !id ) {
        return res.status(400).json({
            "success": false,
            "error": "Required fields are missing"
        });
    }
    FS.readFile(`db/users.json`, 'utf8', (err, data) => {
        if(err){
            return res.status(500).json({
                "success": false,
                "error": "Server error"
            });
        }

        const users = JSON.parse(data);
        const newUser = {id, username, email, password, isAdmin};
        const isExist = users.some(user => user.email === newUser.email)

        if(isExist){
            res.json({
                "success": false,
                "error": "User already exists"
            }).status(500);
            return;
        }
        users.push(newUser);

        FS.writeFile(`db/users.json`, JSON.stringify(users, null, 2), (err) => {
            if(err){
                return res.status(500).json({
                    "success": false,
                    "error": "Failed to save user"
                });
            }
            return res.status(201).json({
                "success": true, 
                "user": newUser
            });
        });
    })
})

const readProducts = async () => {
    try {
        const data = await FS.promises.readFile('db/products.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw error;
    }
};

const writeProducts = async (products) => {
    try {
        await FS.promises.writeFile('db/products.json', JSON.stringify(products, null, 2));
    } catch (error) {
        throw error;
    }
};

app.get('/api/products', async (req, res) => {
    try {
        const products = await readProducts();
        
        const filteredProducts = products.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            quantity: product.quantity || product.stock
        }));

        res.json({
            success: true,
            products: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch products"
        });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { title, quantity, price, description } = req.body;
        
        if (!title || !description || isNaN(price) || isNaN(quantity)) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields (title, description, price, quantity)"
            });
        }

        const products = await readProducts();
        
        const existingProduct = products.find(p => p.title.toLowerCase() === title.toLowerCase());
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                error: "Product with this title already exists"
            });
        }

        const newProduct = {
            id: Date.now(),
            title,
            description,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            stock: parseInt(quantity)
        };

        products.push(newProduct);
        await writeProducts(products);

        res.status(201).json({
            success: true,
            product: {
                id: newProduct.id,
                title: newProduct.title,
                description: newProduct.description,
                price: newProduct.price,
                quantity: newProduct.quantity
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to create product"
        });
    }
});


app.patch('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { title, description, quantity, price } = req.body;

        if (!title && !description && !quantity && !price) {
            return res.status(400).json({
                success: false,
                error: "No valid update fields provided"
            });
        }

        const products = await readProducts();
        
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        if (title) products[productIndex].title = title;
        if (description) products[productIndex].description = description;
        if (quantity) products[productIndex].quantity = parseInt(quantity);
        if (price) products[productIndex].price = parseFloat(price);

        await writeProducts(products);

        res.json({
            success: true,
            product: {
                id: productId,
                title: products[productIndex].title,
                description: products[productIndex].description,
                price: products[productIndex].price,
                quantity: products[productIndex].quantity
            }
        });

    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update product"
        });
    }
});


app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = await readProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        const [deletedProduct] = products.splice(productIndex, 1);
        await writeProducts(products);

        res.json({
            success: true,
            product: {
                id: deletedProduct.id,
                title: deletedProduct.title
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to delete product"
        });
    }
});


const readUsers = async () => {
    try {
        const data = await FS.promises.readFile('db/users.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw error;
    }
};

const readWishlists = async () => {
    try {
        const data = await FS.promises.readFile('db/wishlist.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};
const writeWishlists = async (wishlists) => {
    try {
        await FS.promises.writeFile('db/wishlist.json', JSON.stringify(wishlists, null, 2));
    } catch (error) {
        throw error;
    }
};
const readCarts = async () => {
    try {
        const data = await FS.promises.readFile('db/cart.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};
const writeCarts = async (carts) => {
    try {
        await FS.promises.writeFile('db/cart.json', JSON.stringify(carts, null, 2));
    } catch (error) {
        throw error;
    }
};

app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const users = await readUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Get wishlist and cart data
        const wishlists = await readWishlists();
        const userWishlist = wishlists.find(w => w.userId === userId) || { products: [] };
        
        const carts = await readCarts();
        const userCart = carts.find(c => c.userId === userId) || { products: [] };

        // Extract just the product IDs for wishlist
        const wishlistIds = userWishlist.products.map(p => p.id);
        
        // Prepare cart items in format expected by frontend
        const cartItems = userCart.products.map(p => ({
            id: p.id,
            quantity: p.quantity || 1
        }));

        res.json({
            success: true,
            user: {
                ...user,
                wishlist: wishlistIds,
                cart: cartItems
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch user data"
        });
    }
});

app.patch('/api/users/:userId/wishlist', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { wishlist } = req.body;
        
        if (!Array.isArray(wishlist)) {
            return res.status(400).json({
                success: false,
                error: "Wishlist must be an array of product IDs"
            });
        }

        const products = await readProducts();
        const wishlists = await readWishlists();
        
        // Validate all product IDs exist
        for (const productId of wishlist) {
            if (!products.some(p => p.id === productId)) {
                return res.status(400).json({
                    success: false,
                    error: `Product with ID ${productId} not found`
                });
            }
        }

        // Find or create user's wishlist
        let userWishlist = wishlists.find(w => w.userId === userId);
        if (!userWishlist) {
            userWishlist = {
                id: Date.now(),
                userId,
                products: [],
                totalProducts: 0
            };
            wishlists.push(userWishlist);
        }

        // Update products in wishlist
        userWishlist.products = wishlist.map(productId => {
            const product = products.find(p => p.id === productId);
            return {
                id: product.id,
                title: product.title,
                price: product.price,
                description: product.description,
                stock: product.quantity
            };
        });

        userWishlist.totalProducts = userWishlist.products.length;

        await writeWishlists(wishlists);

        res.json({
            success: true,
            wishlist: userWishlist
        });
    } catch (error) {
        console.error("Error updating wishlist:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update wishlist"
        });
    }
});

app.patch('/api/users/:userId/cart', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { cart } = req.body;
        
        if (!Array.isArray(cart)) {
            return res.status(400).json({
                success: false,
                error: "Cart must be an array of product objects"
            });
        }

        const products = await readProducts();
        const carts = await readCarts();
        
        // Validate all product IDs exist and quantities are valid
        for (const item of cart) {
            if (!products.some(p => p.id === item.id)) {
                return res.status(400).json({
                    success: false,
                    error: `Product with ID ${item.id} not found`
                });
            }
            if (typeof item.quantity !== 'number' || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid quantity for product ${item.id}`
                });
            }
        }

        // Find or create user's cart
        let userCart = carts.find(c => c.userId === userId);
        if (!userCart) {
            userCart = {
                id: Date.now(),
                userId,
                products: [],
                totalPrice: 0,
                totalProducts: 0,
                totalQuantity: 0
            };
            carts.push(userCart);
        }

        // Update products in cart
        userCart.products = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            return {
                id: product.id,
                title: product.title,
                price: product.price,
                description: product.description,
                quantity: item.quantity
            };
        });

        // Calculate totals
        userCart.totalQuantity = userCart.products.reduce((sum, item) => sum + item.quantity, 0);
        userCart.totalProducts = userCart.products.length;
        userCart.totalPrice = userCart.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await writeCarts(carts);

        res.json({
            success: true,
            cart: userCart
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update cart"
        });
    }
});

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})