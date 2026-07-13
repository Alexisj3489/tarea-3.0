// Leer la URL dinámica de config.js o usar fallback en localhost si falta
const API_BASE_URL = window.APP_CONFIG && window.APP_CONFIG.API_URL 
    ? window.APP_CONFIG.API_URL 
    : "https://backalexis.byronrm.com";

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initUsers();
    initProducts();
});

// ==========================================
// CONTROLADOR DE PESTAÑAS (TABS)
// ==========================================
function initTabs() {
    const tabUsers = document.getElementById("tab-users");
    const tabProducts = document.getElementById("tab-products");
    const sectionUsers = document.getElementById("section-users");
    const sectionProducts = document.getElementById("section-products");

    tabUsers.addEventListener("click", () => {
        tabUsers.className = "border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none transition-all";
        tabProducts.className = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none transition-all";
        
        sectionUsers.classList.remove("hidden");
        sectionUsers.classList.add("block");
        sectionProducts.classList.remove("block");
        sectionProducts.classList.add("hidden");
    });

    tabProducts.addEventListener("click", () => {
        tabProducts.className = "border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none transition-all";
        tabUsers.className = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none transition-all";
        
        sectionProducts.classList.remove("hidden");
        sectionProducts.classList.add("block");
        sectionUsers.classList.remove("block");
        sectionUsers.classList.add("hidden");
    });
}

// ==========================================
// CRUD DE USUARIOS
// ==========================================
function initUsers() {
    const formUser = document.getElementById("form-user");
    const usersTableBody = document.getElementById("users-table-body");
    const userCount = document.getElementById("user-count");
    const btnUserCancel = document.getElementById("btn-user-cancel");
    const formUserTitle = document.getElementById("form-user-title");

    fetchUsers();

    async function fetchUsers() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`);
            if (!res.ok) throw new Error("Error cargando usuarios");
            const users = await res.json();
            renderUsers(users);
        } catch (error) {
            console.error(error);
            usersTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error al conectar con la API de usuarios.</td></tr>`;
        }
    }

    function renderUsers(users) {
        usersTableBody.innerHTML = "";
        userCount.textContent = `${users.length} ${users.length === 1 ? 'Usuario' : 'Usuarios'}`;

        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-400">No hay usuarios registrados.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${user.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${user.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="btn-edit text-indigo-600 hover:text-indigo-950 mr-3 transition-colors" data-id="${user.id}" data-name="${user.name}" data-email="${user.email}">Editar</button>
                    <button class="btn-delete text-red-600 hover:text-red-950 transition-colors" data-id="${user.id}">Eliminar</button>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });

        // Configurar botones de edición
        document.querySelectorAll("#users-table-body .btn-edit").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const name = e.target.getAttribute("data-name");
                const email = e.target.getAttribute("data-email");

                document.getElementById("user-id").value = id;
                document.getElementById("user-name").value = name;
                document.getElementById("user-email").value = email;

                formUserTitle.textContent = "Editar Usuario";
                btnUserCancel.classList.remove("hidden");
            });
        });

        // Configurar botones de eliminación
        document.querySelectorAll("#users-table-body .btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/users/${id}`, { method: "DELETE" });
                        if (res.ok) {
                            fetchUsers();
                        } else {
                            alert("No se pudo eliminar el usuario");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        });
    }

    formUser.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("user-id").value;
        const name = document.getElementById("user-name").value;
        const email = document.getElementById("user-email").value;

        const userData = { name, email };
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_BASE_URL}/api/users/${id}` : `${API_BASE_URL}/api/users`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            if (res.ok) {
                resetUserForm();
                fetchUsers();
            } else {
                const errData = await res.json();
                alert(errData.detail || "Error al guardar los datos del usuario");
            }
        } catch (error) {
            console.error(error);
            alert("Error de red al conectar con el servidor.");
        }
    });

    btnUserCancel.addEventListener("click", resetUserForm);

    function resetUserForm() {
        formUser.reset();
        document.getElementById("user-id").value = "";
        formUserTitle.textContent = "Crear Nuevo Usuario";
        btnUserCancel.classList.add("hidden");
    }
}

// ==========================================
// CRUD DE PRODUCTOS
// ==========================================
function initProducts() {
    const formProduct = document.getElementById("form-product");
    const productsTableBody = document.getElementById("products-table-body");
    const productCount = document.getElementById("product-count");
    const btnProductCancel = document.getElementById("btn-product-cancel");
    const formProductTitle = document.getElementById("form-product-title");

    fetchProducts();

    async function fetchProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            if (!res.ok) throw new Error("Error cargando productos");
            const products = await res.json();
            renderProducts(products);
        } catch (error) {
            console.error(error);
            productsTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error al conectar con la API de productos.</td></tr>`;
        }
    }

    function renderProducts(products) {
        productsTableBody.innerHTML = "";
        productCount.textContent = `${products.length} ${products.length === 1 ? 'Producto' : 'Productos'}`;

        if (products.length === 0) {
            productsTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">No hay productos registrados.</td></tr>`;
            return;
        }

        products.forEach(product => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${product.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${product.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.stock}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="btn-edit text-indigo-600 hover:text-indigo-950 mr-3 transition-colors" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${product.stock}">Editar</button>
                    <button class="btn-delete text-red-600 hover:text-red-950 transition-colors" data-id="${product.id}">Eliminar</button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        // Configurar botones de edición
        document.querySelectorAll("#products-table-body .btn-edit").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const name = e.target.getAttribute("data-name");
                const price = e.target.getAttribute("data-price");
                const stock = e.target.getAttribute("data-stock");

                document.getElementById("product-id").value = id;
                document.getElementById("product-name").value = name;
                document.getElementById("product-price").value = price;
                document.getElementById("product-stock").value = stock;

                formProductTitle.textContent = "Editar Producto";
                btnProductCancel.classList.remove("hidden");
            });
        });

        // Configurar botones de eliminación
        document.querySelectorAll("#products-table-body .btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
                        if (res.ok) {
                            fetchProducts();
                        } else {
                            alert("No se pudo eliminar el producto");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        });
    }

    formProduct.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("product-id").value;
        const name = document.getElementById("product-name").value;
        const price = parseFloat(document.getElementById("product-price").value);
        const stock = parseInt(document.getElementById("product-stock").value, 10);

        const productData = { name, price, stock };
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_BASE_URL}/api/products/${id}` : `${API_BASE_URL}/api/products`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                resetProductForm();
                fetchProducts();
            } else {
                const errData = await res.json();
                alert(errData.detail || "Error al guardar los datos del producto");
            }
        } catch (error) {
            console.error(error);
            alert("Error de red al conectar con el servidor.");
        }
    });

    btnProductCancel.addEventListener("click", resetProductForm);

    function resetProductForm() {
        formProduct.reset();
        document.getElementById("product-id").value = "";
        formProductTitle.textContent = "Crear Nuevo Producto";
        btnProductCancel.classList.add("hidden");
    }
}