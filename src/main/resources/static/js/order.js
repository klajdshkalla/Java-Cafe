let orderItems = [];

// Define a mapping of categories to colors
const categoryColors = {
    HOT_DRINKS: 'bg-red-600 hover:bg-red-700',
    SOFT_DRINKS: 'bg-blue-600 hover:bg-blue-700',
    WINES: 'bg-purple-600 hover:bg-purple-700',
    BEERS: 'bg-yellow-600 hover:bg-yellow-700',
    MILKSHAKES: 'bg-green-600 hover:bg-green-700',
    COCKTAILS: 'bg-pink-600 hover:bg-pink-700'
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded, attaching event listeners.");
    loadCategories(); // Load categories dynamically
});

// Fetch categories from the backend
function loadCategories() {
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categoryContainer = document.getElementById('categories');
            categoryContainer.innerHTML = ''; // Clear previous categories

            categories.forEach(category => {
                const button = document.createElement('button');
                button.className = `category-btn text-white font-semibold px-4 py-2 rounded transition duration-300 w-full h-24 flex items-center justify-center text-lg ${getCategoryColor(category)}`;
                button.textContent = category.replace(/_/g, ' '); // Replace underscores with spaces for readability
                button.setAttribute('data-category', category);
                button.addEventListener('click', function () {
                    displayProductsByCategory(category);
                });
                categoryContainer.appendChild(button);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Helper function to get the color for a category
function getCategoryColor(category) {
    return categoryColors[category] || 'bg-gray-600 hover:bg-gray-700'; // Default color if category is not found
}

// Display products based on the selected category
function displayProductsByCategory(category) {
    // Show the product section
    const productSection = document.getElementById('productSection');
    productSection.style.display = 'block';

    // Adjust the order list column span
    const orderSection = document.getElementById('orderSection');
    orderSection.classList.remove('md:col-span-2');
    orderSection.classList.add('md:col-span-1');

    fetch(`/api/products/category/${category}`)
        .then(response => response.json())
        .then(filteredProducts => {
            const productList = document.getElementById('productList');
            productList.innerHTML = ''; // Clear previous products

            filteredProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-item bg-gray-800 p-4 rounded-lg shadow-md';
                productDiv.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="font-bold">${product.name}</span>
                            <span>${product.price.toFixed(2)}</span>
                            <span> - ALL</span>
                        </div>
                        <button class="add-to-order bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition duration-300"
                                data-product-name="${product.name}"
                                data-product-price="${product.price}">
                            Add
                        </button>
                    </div>
                `;
                productList.appendChild(productDiv);
            });

            attachAddToOrderListeners();
        })
        .catch(error => console.error('Error fetching products by category:', error));
}

// Attach listeners to "Add to Order" buttons
function attachAddToOrderListeners() {
    const buttons = document.querySelectorAll('.add-to-order');
    buttons.forEach(button => {
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
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                ${item.name} -
                <span class="text-blue-400 font-semibold">${item.price.toFixed(2)} ALL</span>
                <span class="bg-blue-700 text-white px-2 py-1 rounded ml-2">${item.quantity}</span>
            </div>
            <button onclick="removeFromOrder(${index})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-300 ml-4">
                Remove
            </button>
        </div>
    `;
        orderList.appendChild(itemDiv);
        total += item.price * item.quantity;
    });

    totalAmount.textContent = total.toFixed(2);
    // Format order items for submission
    const formattedOrderItems = orderItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
    }));
    document.getElementById('orderItems').value = JSON.stringify(formattedOrderItems);
}