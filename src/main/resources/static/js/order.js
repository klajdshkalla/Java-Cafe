let orderItems = [];
let currentCategory = null;

document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded, attaching event listeners.");
    attachAddToOrderListeners();
});

function attachAddToOrderListeners() {
    const buttons = document.querySelectorAll('.add-to-order');
    console.log("Found " + buttons.length + " buttons to attach listeners to.");
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');
            console.log("Adding product to order: ", productName, productPrice);
            addToOrder(productName, parseFloat(productPrice));
        });
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
    orderList.innerHTML = '';

    let total = 0;

    orderItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>${item.name} - $${item.price.toFixed(2)} (x${item.quantity})</div>
                <button onclick="removeFromOrder(${index})" class="btn btn-danger btn-sm">Remove</button>
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