let orderItems = [];

document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded, attaching event listeners.");
    loadCategories(); // Load categories dynamically
    document.getElementById('submitOrderForm').addEventListener('submit', function (event) {
        const orderItemsJson = document.getElementById('orderItems').value;
        if (!orderItemsJson || orderItemsJson.length === 0) {
            alert("Cannot submit an empty order.");
            event.preventDefault(); // Prevent form submission
        }
    });
});

// Fetch categories from the backend and display them with images
function loadCategories() {
    fetch('/api/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(categories => {
            console.log("Fetched categories:", categories); // Debugging line
            const categoryContainer = document.getElementById('categories');
            categoryContainer.innerHTML = ''; // Clear previous categories

            if (!Array.isArray(categories)) {
                throw new Error("Invalid categories response");
            }

            categories.forEach(category => {
                // Handle both objects and strings
                const categoryName = typeof category === 'string' ? category : category.name;

                if (!categoryName) {
                    console.warn("Skipping invalid category:", category);
                    return;
                }

                const button = document.createElement('button');
                button.className = `category-btn text-white font-semibold px-4 py-2 rounded transition duration-300 w-full h-24 flex items-center justify-center ${getCategoryColor(categoryName)}`;

                // Category image
                const img = document.createElement('img');
                img.src = `/images/${encodeURIComponent(categoryName.toLowerCase())}.png` || '/images/default-category.png';
                img.alt = categoryName;
                img.className = 'h-16 w-16 mr-2 rounded';

                // Handle missing images gracefully
                img.onerror = function () {
                    this.src = '/images/default-category.png';
                };

                // Category text
                const text = document.createElement('span');
                text.textContent = categoryName.replace(/_/g, ' ');

                // Append elements to the button
                button.appendChild(img);
                button.appendChild(text);

                // Set data attribute and click event
                button.setAttribute('data-category', categoryName);
                button.addEventListener('click', function () {
                    displayProductsByCategory(categoryName);
                });

                // Add button to the container
                categoryContainer.appendChild(button);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            alert("Failed to load categories. Please try again later.");
        });
}

// Fetch and display products for the selected category
function displayProductsByCategory(category) {
    const productSection = document.getElementById('productSection');
    productSection.style.display = 'block';
    const orderSection = document.getElementById('orderSection');
    orderSection.classList.remove('md:col-span-2');
    orderSection.classList.add('md:col-span-1');

    fetch(`/api/products/category/${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            console.log("Fetched products for category:", category, products); // Debugging line
            const productList = document.getElementById('productList');
            productList.innerHTML = ''; // Clear previous products

            if (!Array.isArray(products)) {
                throw new Error("Invalid products response");
            }

            if (products.length === 0) {
                productList.innerHTML = '<p class="text-gray-400">No products available in this category.</p>';
                return;
            }

            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-item bg-gray-800 p-4 rounded-lg shadow-md flex items-center';

                // Product image
                const img = document.createElement('img');
                img.src = product.imagePath || '/images/default-product.png'; // Fallback image
                img.alt = product.name;
                img.className = 'h-20 w-20 mr-4 rounded';

                // Handle missing images gracefully
                img.onerror = function () {
                    this.src = '/images/default-product.png';
                };

                // Product details
                const infoDiv = document.createElement('div');
                infoDiv.className = 'flex-grow';
                infoDiv.innerHTML = `
                    <span class="font-bold">${product.name}</span>
                    <span> - ALL</span>
                    <span>${product.price.toFixed(2)}</span>
                `;

                // Add to order button
                const addButton = document.createElement('button');
                addButton.className = "add-to-order bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition duration-300";
                addButton.setAttribute("data-product-name", product.name);
                addButton.setAttribute("data-product-price", product.price);
                addButton.textContent = "Add";
                addButton.addEventListener('click', function () {
                    addToOrder(product.name, product.price);
                });

                productDiv.appendChild(img);
                productDiv.appendChild(infoDiv);
                productDiv.appendChild(addButton);
                productList.appendChild(productDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            alert("Failed to load products. Please try again later.");
        });
}

// Attach listeners to "Add to Order" buttons
function attachAddToOrderListeners() {
    document.querySelectorAll('.add-to-order').forEach(button => {
        button.addEventListener('click', function () {
            const productName = this.getAttribute('data-product-name');
            const productPrice = parseFloat(this.getAttribute('data-product-price'));
            addToOrder(productName, productPrice);
        });
    });
}

// Add a product to the order list
function addToOrder(name, price) {
    const existingItem = orderItems.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        orderItems.push({ name, price, quantity: 1 });
    }
    updateOrderList();
}

// Remove a product from the order list
function removeFromOrder(index) {
    orderItems.splice(index, 1);
    updateOrderList();
}

// Update the order list UI
function updateOrderList() {
    const orderList = document.getElementById('orderList');
    const totalAmount = document.getElementById('totalAmount');
    orderList.innerHTML = '';
    let total = 0;

    orderItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item flex justify-between items-center';
        itemDiv.innerHTML = `
            <div>
                ${item.name} -
                <span class="text-blue-400 font-semibold">${item.price.toFixed(2)} ALL</span>
                <span class="bg-blue-700 text-white px-2 py-1 rounded ml-2">${item.quantity}</span>
            </div>
            <div class="flex space-x-2">
                <!-- Quantity Button -->
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition duration-300"
                        onclick="decreaseQuantity(${index})">-</button>
                <span class="px-2">${item.quantity}</span>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition duration-300"
                        onclick="increaseQuantity(${index})">+</button>
                <!-- Remove Button -->
                <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-300 ml-4"
                        onclick="removeFromOrder(${index})">Remove</button>
            </div>
        `;
        orderList.appendChild(itemDiv);
        total += item.price * item.quantity;
    });

    // Ensure total is not 0.00 ALL when there are items
    if (orderItems.length > 0) {
        totalAmount.textContent = `${total.toFixed(2)} ALL`;
    } else {
        totalAmount.textContent = '0.00 ALL';
    }

    document.getElementById('orderItems').value = JSON.stringify(orderItems);
}

// Functions to handle quantity changes
function increaseQuantity(index) {
    if (orderItems[index]) {
        orderItems[index].quantity += 1;
        updateOrderList();
    }
}

function decreaseQuantity(index) {
    if (orderItems[index] && orderItems[index].quantity > 1) {
        orderItems[index].quantity -= 1;
        updateOrderList();
    } else if (orderItems[index] && orderItems[index].quantity === 1) {
        removeFromOrder(index);
    }
}
// Helper function to get the category color
function getCategoryColor(category) {
    const categoryColors = {
        HOT_DRINKS: 'bg-red-600 hover:bg-red-700',
        SOFT_DRINKS: 'bg-blue-600 hover:bg-blue-700',
        WINES: 'bg-purple-600 hover:bg-purple-700',
        BEERS: 'bg-yellow-600 hover:bg-yellow-700',
        MILKSHAKES: 'bg-green-600 hover:bg-green-700',
        COCKTAILS: 'bg-pink-600 hover:bg-pink-700',
        OTHER: 'bg-gray-600 hover:bg-gray-700'
    };
    return categoryColors[category] || 'bg-gray-600 hover:bg-gray-700';
}

// Functions to handle quantity changes
function increaseQuantity(index) {
    if (orderItems[index]) {
        orderItems[index].quantity += 1;
        updateOrderList();
    }
}

function decreaseQuantity(index) {
    if (orderItems[index] && orderItems[index].quantity > 1) {
        orderItems[index].quantity -= 1;
        updateOrderList();
    } else if (orderItems[index] && orderItems[index].quantity === 1) {
        removeFromOrder(index);
    }
}

function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
        fetch(`/admin/products/delete/${productId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    window.location.reload(); // Reload the page after successful deletion
                } else {
                    alert("Failed to delete product.");
                }
            })
            .catch(error => {
                console.error("Error deleting product:", error);
                alert("An error occurred while deleting the product.");
            });
    }
}