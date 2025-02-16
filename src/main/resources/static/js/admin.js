document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded, attaching event listeners.");

    const deleteButtons = document.querySelectorAll('.delete-btn');
    console.log("Found delete buttons:", deleteButtons.length);
    deleteButtons.forEach(btn => {
        console.log("Button product ID:", btn.getAttribute('data-product-id'));
    });

    document.body.addEventListener('click', function (event) {
        const target = event.target;
        if (target.classList.contains('delete-btn')) {
            const productId = target.getAttribute('data-product-id');
            console.log("Clicked delete button for product ID:", productId);

            if (!productId || productId.includes('${')) {
                console.error("Invalid product ID or template not properly rendered:", productId);
                alert("Error: Product ID not properly loaded. Please refresh the page.");
                return;
            }

            deleteProduct(productId);
        }
    });
});

function deleteProduct(productId) {
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

    console.log("Deleting product ID:", productId);
    console.log("CSRF Header:", csrfHeader);
    console.log("CSRF Token exists:", !!csrfToken);

    if (!productId) {
        console.error("Invalid product ID.");
        alert("Failed to delete product: Invalid product ID.");
        return;
    }

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    if (csrfHeader && csrfToken) {
        headers[csrfHeader] = csrfToken;
    }

    const url = `/admin/products/delete/${productId}`;
    console.log("Making delete request to:", url);

    fetch(url, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to delete product");
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Delete successful:", data);
        window.location.reload();
    })
    .catch(error => {
        console.error("Error deleting product:", error);
        alert(`An error occurred while deleting the product: ${error.message}`);
    });
}