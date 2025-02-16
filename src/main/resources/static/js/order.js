let orderItems = [];

const config = {
    apiBaseUrl: '/api',
    imagesBaseUrl: '/images'
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded, attaching event listeners.");

    loadCategories();

    const submitOrderForm = document.getElementById('submitOrderForm');
    if (submitOrderForm) {
        submitOrderForm.addEventListener('submit', function (event) {
            const orderItemsJson = document.getElementById('orderItems')?.value;
            if (!orderItemsJson || orderItemsJson.length === 0) {
                alert("Cannot submit an empty order.");
                event.preventDefault();
            }
        });
    }
});

function loadCategories() {
    fetch(`${config.apiBaseUrl}/categories`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(categories => {
            console.log("Fetched categories:", categories); // Debugging line
            const categoryContainer = document.getElementById('categories');
            if (!categoryContainer) {
                throw new Error("Category container not found in the DOM");
            }
            categoryContainer.innerHTML = ''; // Clear previous categories

            if (!Array.isArray(categories)) {
                throw new Error("Invalid categories response");
            }

            categories.forEach(category => {
                const categoryName = typeof category === 'string' ? category : category.name;

                if (!categoryName) {
                    console.warn("Skipping invalid category:", category);
                    return;
                }

                const button = document.createElement('button');
                button.className = `category-btn text-white font-semibold px-4 py-2 rounded transition duration-300 w-full h-24 flex items-center justify-center ${getCategoryColor(categoryName)}`;
                button.setAttribute('data-category', categoryName);

                const img = document.createElement('img');
                img.src = `${config.imagesBaseUrl}/${encodeURIComponent(categoryName.toLowerCase())}.png` || `${config.imagesBaseUrl}/default-category.png`;
                img.alt = categoryName;
                img.className = 'h-16 w-16 mr-2 rounded';

                img.onerror = function () {
                    this.src = `${config.imagesBaseUrl}/default-category.png`;
                };

                const text = document.createElement('span');
                text.textContent = categoryName.replace(/_/g, ' ');

                button.appendChild(img);
                button.appendChild(text);

                button.addEventListener('click', function () {
                    displayProductsByCategory(categoryName);
                });

                categoryContainer.appendChild(button);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            alert(`Failed to load categories: ${error.message}. Please try again later.`);
        });
}

function displayProductsByCategory(category) {
    const productSection = document.getElementById('productSection');
    const productList = document.getElementById('productList');

    if (!productSection || !productList) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    productSection.style.display = 'block'; // Show the product section
    productList.innerHTML = ''; // Clear previous products

    fetch(`${config.apiBaseUrl}/products/category/${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            console.log("Fetched products for category:", category, products); // Debugging line

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

                const img = document.createElement('img');
                img.src = product.imagePath || `${config.imagesBaseUrl}/default-product.png`;
                img.alt = product.name;
                img.className = 'h-20 w-20 mr-4 rounded';

                img.onerror = function () {
                    this.src = `${config.imagesBaseUrl}/default-product.png`;
                };

                const infoDiv = document.createElement('div');
                infoDiv.className = 'flex-grow';
                infoDiv.innerHTML = `
                    <span class="font-bold">${product.name}</span>
                    <span>${product.price.toFixed(2)}</span>
                    <span> - ALL</span>
                `;

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
            alert(`Failed to load products: ${error.message}. Please try again later.`);
        });
}

function addToOrder(name, price) {
    const existingItem = orderItems.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        orderItems.push({ name, price, quantity: 1 });
    }
    updateOrderList();
}

function removeFromOrder(index) {
    orderItems.splice(index, 1);
    updateOrderList();
}

function updateOrderList() {
    const orderList = document.getElementById('orderList');
    const totalAmount = document.getElementById('totalAmount');
    const orderItemsInput = document.getElementById('orderItems');

    if (!orderList || !totalAmount || !orderItemsInput) {
        console.error("Required elements not found in the DOM.");
        return;
    }

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
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded" onclick="decreaseQuantity(${index})">-</button>
                <span class="px-2">${item.quantity}</span>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded" onclick="increaseQuantity(${index})">+</button>
                <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded ml-4" onclick="removeFromOrder(${index})">Remove</button>
            </div>
        `;
        orderList.appendChild(itemDiv);
        total += item.price * item.quantity;
    });

    totalAmount.textContent = orderItems.length > 0 ? `${total.toFixed(2)} ALL` : '0.00 ALL';
    orderItemsInput.value = JSON.stringify(orderItems);
}

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

const categoryColors = new Map([
    ['HOT_DRINKS', 'bg-red-600 hover:bg-red-700'],
    ['SOFT_DRINKS', 'bg-blue-600 hover:bg-blue-700'],
    ['WINES', 'bg-purple-600 hover:bg-purple-700'],
    ['BEERS', 'bg-yellow-600 hover:bg-yellow-700'],
    ['MILKSHAKES', 'bg-green-600 hover:bg-green-700'],
    ['COCKTAILS', 'bg-pink-600 hover:bg-pink-700'],
    ['OTHER', 'bg-gray-600 hover:bg-gray-700']
]);

function getCategoryColor(category) {
    return categoryColors.get(category) || 'bg-gray-600 hover:bg-gray-700';
}