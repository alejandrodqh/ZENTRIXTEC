
"use strict";

// ======================================
// DATOS DE DEMOSTRACIÓN
// ======================================

const products = [
    { id: "ZT001", name: "Laptop Lenovo IdeaPad", category: "Computadoras", stock: 2, minimum: 5, price: 4200 },
    { id: "ZT002", name: "Impresora Epson L3250", category: "Impresoras", stock: 8, minimum: 3, price: 1850 },
    { id: "ZT003", name: "Teclado Logitech K120", category: "Accesorios", stock: 4, minimum: 5, price: 120 },
    { id: "ZT004", name: "Mouse Redragon M601", category: "Accesorios", stock: 0, minimum: 3, price: 95 },
    { id: "ZT005", name: "Monitor Samsung 24 pulgadas", category: "Monitores", stock: 12, minimum: 4, price: 1150 },
    { id: "ZT006", name: "Memoria RAM Kingston 16GB", category: "Componentes", stock: 3, minimum: 5, price: 450 },
    { id: "ZT007", name: "Disco SSD Kingston 500GB", category: "Componentes", stock: 15, minimum: 5, price: 380 },
    { id: "ZT008", name: "Audífonos HyperX Cloud", category: "Accesorios", stock: 1, minimum: 4, price: 520 },
    { id: "ZT009", name: "Tarjeta gráfica ASUS", category: "Componentes", stock: 6, minimum: 2, price: 2800 },
    { id: "ZT010", name: "Fuente de poder Corsair", category: "Componentes", stock: 0, minimum: 2, price: 650 }
];

const sales = [
    { id: "V-001", product: "Laptop Lenovo IdeaPad", quantity: 2, date: "2026-10-02", total: 8400 },
    { id: "V-002", product: "Teclado Logitech K120", quantity: 8, date: "2026-10-04", total: 960 },
    { id: "V-003", product: "Monitor Samsung 24 pulgadas", quantity: 5, date: "2026-10-08", total: 5750 },
    { id: "V-004", product: "Mouse Redragon M601", quantity: 12, date: "2026-10-11", total: 1140 },
    { id: "V-005", product: "Impresora Epson L3250", quantity: 3, date: "2026-10-15", total: 5550 },
    { id: "V-006", product: "Disco SSD Kingston 500GB", quantity: 10, date: "2026-10-18", total: 3800 },
    { id: "V-007", product: "Teclado Logitech K120", quantity: 6, date: "2026-10-20", total: 720 },
    { id: "V-008", product: "Audífonos HyperX Cloud", quantity: 4, date: "2026-10-22", total: 2080 }
];

const monthlyIncome = [
    { month: "Mayo", value: 12500 },
    { month: "Junio", value: 15800 },
    { month: "Julio", value: 14200 },
    { month: "Agosto", value: 19300 },
    { month: "Sept.", value: 17600 },
    { month: "Octubre", value: 28400 }
];

// ======================================
// FUNCIONES GENERALES
// ======================================

function money(value) {
    return "Bs. " + Number(value).toLocaleString("es-BO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function totalIncome() {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
}

function totalUnits() {
    return products.reduce((sum, product) => sum + product.stock, 0);
}

function totalSoldUnits() {
    return sales.reduce((sum, sale) => sum + sale.quantity, 0);
}

function statusOf(product) {
    if (product.stock === 0) return "empty";
    if (product.stock <= product.minimum) return "low";
    return "available";
}

function statusText(product) {
    const status = statusOf(product);

    if (status === "empty") return "Agotado";
    if (status === "low") return "Stock bajo";

    return "Disponible";
}

function getAlerts() {
    return products.filter(product => statusOf(product) !== "available");
}

function getRanking() {
    const totals = {};

    sales.forEach(sale => {
        totals[sale.product] = (totals[sale.product] || 0) + sale.quantity;
    });

    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

// ======================================
// NAVEGACIÓN
// ======================================

const pageNames = {
    dashboard: "Panel principal",
    inventory: "Inventario",
    alerts: "Notificaciones",
    sales: "Ventas",
    analytics: "Análisis comercial",
    reports: "Reportes"
};

function openPage(pageId) {
    if (!pageNames[pageId]) return;

    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageId);
    });

    document.getElementById("pageTitle").textContent = pageNames[pageId];
    document.getElementById("breadcrumb").textContent = pageNames[pageId];

    document.getElementById("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.page);
    });
});

document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.goto);
    });
});

document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

// ======================================
// FECHA
// ======================================

function showDate() {
    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("es-BO", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

// ======================================
// PANEL PRINCIPAL
// ======================================

function renderDashboard() {
    const alerts = getAlerts();

    document.getElementById("dashboardIncome").textContent = money(totalIncome());
    document.getElementById("dashboardProducts").textContent = products.length;
    document.getElementById("dashboardUnits").textContent = totalUnits();
    document.getElementById("dashboardAlerts").textContent = alerts.length;

    document.getElementById("alertBadge").textContent = alerts.length;
    document.getElementById("bellBadge").textContent = alerts.length;

    renderIncomeBars();
    renderStockSummary();
    renderDashboardAlerts();
    renderTopProducts();
}

function renderIncomeBars() {
    const container = document.getElementById("incomeBars");
    const maximum = Math.max(...monthlyIncome.map(item => item.value));

    container.innerHTML = monthlyIncome.map(item => {
        const height = Math.max(5, (item.value / maximum) * 100);

        return `
            <div class="bar-item">
                <span class="bar-value">${(item.value / 1000).toFixed(1)}k</span>
                <div class="bar" style="height:${height}%"></div>
                <span class="bar-label">${item.month}</span>
            </div>
        `;
    }).join("");
}

function renderStockSummary() {
    const available = products.filter(p => statusOf(p) === "available").length;
    const low = products.filter(p => statusOf(p) === "low").length;
    const empty = products.filter(p => statusOf(p) === "empty").length;
    const total = products.length || 1;

    const rows = [
        { label: "Disponible", count: available, color: "progress-blue" },
        { label: "Stock bajo", count: low, color: "progress-orange" },
        { label: "Agotado", count: empty, color: "progress-red" }
    ];

    document.getElementById("stockSummary").innerHTML = rows.map(row => `
        <div class="stock-row">
            <div class="stock-row-top">
                <span>${row.label}</span>
                <strong>${row.count} productos</strong>
            </div>
            <div class="progress">
                <div class="progress-fill ${row.color}"
                     style="width:${(row.count / total) * 100}%"></div>
            </div>
        </div>
    `).join("");
}

function renderDashboardAlerts() {
    const container = document.getElementById("dashboardAlertList");
    const alerts = getAlerts().slice(0, 4);

    if (alerts.length === 0) {
        container.innerHTML = "<p>No hay alertas pendientes.</p>";
        return;
    }

    container.innerHTML = alerts.map(product => {
        const critical = product.stock === 0;

        return `
            <div class="alert-row ${critical ? "critical" : ""}">
                <div class="alert-icon">${critical ? "!" : "⚠"}</div>
                <div class="alert-description">
                    <strong>${escapeHTML(product.name)}</strong>
                    <small>${critical ? "Producto agotado" : "Existencias por debajo del mínimo"}</small>
                </div>
                <span class="alert-quantity">${product.stock} unidades</span>
            </div>
        `;
    }).join("");
}

function renderTopProducts() {
    const ranking = getRanking().slice(0, 4);

    document.getElementById("dashboardTopProducts").innerHTML =
        ranking.map((item, index) => `
            <div class="top-row">
                <div class="top-number">${index + 1}</div>
                <div class="top-description">
                    <strong>${escapeHTML(item[0])}</strong>
                    <small>Ventas registradas</small>
                </div>
                <span class="top-sold">${item[1]} unidades</span>
            </div>
        `).join("");
}

// ======================================
// INVENTARIO
// ======================================

function renderInventory() {
    const search = document.getElementById("inventorySearch").value.toLowerCase();
    const filter = document.getElementById("inventoryFilter").value;

    const filtered = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            product.id.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search);

        const matchesFilter =
            filter === "all" || statusOf(product) === filter;

        return matchesSearch && matchesFilter;
    });

    const table = document.getElementById("inventoryTable");

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr><td colspan="6" class="empty-message">No se encontraron productos.</td></tr>
        `;
    } else {
        table.innerHTML = filtered.map(product => `
            <tr>
                <td><strong>${escapeHTML(product.name)}</strong></td>
                <td>${escapeHTML(product.id)}</td>
                <td>${escapeHTML(product.category)}</td>
                <td>${product.stock} unidades</td>
                <td>${money(product.price)}</td>
                <td><span class="status ${statusOf(product)}">${statusText(product)}</span></td>
            </tr>
        `).join("");
    }

    document.getElementById("inventoryCount").textContent = products.length;
    document.getElementById("inventoryUnits").textContent = totalUnits();

    document.getElementById("inventoryLow").textContent =
        products.filter(p => statusOf(p) === "low").length;

    document.getElementById("inventoryEmpty").textContent =
        products.filter(p => statusOf(p) === "empty").length;
}

document.getElementById("inventorySearch").addEventListener("input", renderInventory);
document.getElementById("inventoryFilter").addEventListener("change", renderInventory);

// ======================================
// NOTIFICACIONES
// ======================================

function renderAlerts() {
    const alerts = getAlerts();
    const container = document.getElementById("allAlerts");

    document.getElementById("alertSummary").textContent =
        alerts.length + " alertas activas";

    if (alerts.length === 0) {
        container.innerHTML = "<article class='panel'>No existen alertas de inventario.</article>";
        return;
    }

    container.innerHTML = alerts.map(product => {
        const critical = product.stock === 0;

        return `
            <article class="alert-card ${critical ? "critical" : ""}">
                <div class="alert-icon">${critical ? "!" : "⚠"}</div>
                <div>
                    <h3>${escapeHTML(product.name)}</h3>
                    <p>Código: ${escapeHTML(product.id)} · ${escapeHTML(product.category)}</p>
                    <strong>
                        ${critical
                            ? "Producto agotado. Necesita reposición."
                            : `Quedan ${product.stock} unidades. Mínimo: ${product.minimum}.`
                        }
                    </strong>
                </div>
            </article>
        `;
    }).join("");
}

// ======================================
// VENTAS
// ======================================

function renderSales() {
    const search = document.getElementById("salesSearch").value.toLowerCase();

    const filtered = sales.filter(sale =>
        sale.id.toLowerCase().includes(search) ||
        sale.product.toLowerCase().includes(search)
    );

    const table = document.getElementById("salesTable");

    if (filtered.length === 0) {
        table.innerHTML = "<tr><td colspan='6'>No se encontraron ventas.</td></tr>";
    } else {
        table.innerHTML = filtered.map(sale => `
            <tr>
                <td><strong>${escapeHTML(sale.id)}</strong></td>
                <td>${escapeHTML(sale.product)}</td>
                <td>${sale.quantity} unidades</td>
                <td>${sale.date.split("-").reverse().join("/")}</td>
                <td><strong>${money(sale.total)}</strong></td>
                <td><span class="status completed">Registrada</span></td>
            </tr>
        `).join("");
    }

    const income = totalIncome();

    document.getElementById("salesCount").textContent = sales.length;
    document.getElementById("salesIncome").textContent = money(income);
    document.getElementById("salesAverage").textContent =
        money(sales.length ? income / sales.length : 0);
    document.getElementById("salesUnits").textContent = totalSoldUnits();
}

document.getElementById("salesSearch").addEventListener("input", renderSales);

// ======================================
// ANÁLISIS COMERCIAL
// ======================================

function renderAnalytics() {
    const ranking = getRanking();
    const best = ranking[0];
    const least = ranking[ranking.length - 1];

    document.getElementById("bestProduct").textContent =
        best ? best[0] : "Sin datos";

    document.getElementById("bestQuantity").textContent =
        best ? best[1] + " unidades vendidas" : "Sin ventas";

    document.getElementById("leastProduct").textContent =
        least ? least[0] : "Sin datos";

    document.getElementById("leastQuantity").textContent =
        least ? least[1] + " unidades vendidas" : "Sin ventas";

    document.getElementById("analysisIncome").textContent = money(totalIncome());
    document.getElementById("analysisSales").textContent = sales.length;
    document.getElementById("analysisUnits").textContent = totalSoldUnits();
    document.getElementById("analysisAlerts").textContent = getAlerts().length;

    const max = Math.max(1, ...ranking.map(item => item[1]));

    document.getElementById("productBars").innerHTML = ranking.map(item => `
        <div class="horizontal-item">
            <span>${escapeHTML(item[0])}</span>
            <div class="horizontal-track">
                <div class="horizontal-fill" style="width:${(item[1] / max) * 100}%"></div>
            </div>
            <strong>${item[1]}</strong>
        </div>
    `).join("");
}

// ======================================
// EXPORTAR REPORTES CSV
// ======================================

function downloadCSV(filename, rows) {
    if (rows.length <= 1) {
        alert("No hay información para exportar.");
        return;
    }

    const csv = rows.map(row =>
        row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")
    ).join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function exportInventory() {
    const rows = [
        ["Código", "Producto", "Categoría", "Existencias", "Precio", "Estado"]
    ];

    products.forEach(product => {
        rows.push([
            product.id,
            product.name,
            product.category,
            product.stock,
            product.price,
            statusText(product)
        ]);
    });

    downloadCSV("ZENTRIXTEC_Inventario.csv", rows);
}

function exportSales() {
    const rows = [
        ["Operación", "Producto", "Cantidad", "Fecha", "Total"]
    ];

    sales.forEach(sale => {
        rows.push([
            sale.id,
            sale.product,
            sale.quantity,
            sale.date,
            sale.total
        ]);
    });

    downloadCSV("ZENTRIXTEC_Ventas.csv", rows);
}

function exportAlerts() {
    const rows = [
        ["Código", "Producto", "Existencias", "Mínimo", "Estado"]
    ];

    getAlerts().forEach(product => {
        rows.push([
            product.id,
            product.name,
            product.stock,
            product.minimum,
            statusText(product)
        ]);
    });

    downloadCSV("ZENTRIXTEC_Alertas.csv", rows);
}

document.getElementById("exportInventory").addEventListener("click", exportInventory);
document.getElementById("reportInventory").addEventListener("click", exportInventory);
document.getElementById("reportSales").addEventListener("click", exportSales);
document.getElementById("reportAlerts").addEventListener("click", exportAlerts);

// ======================================
// INICIAR APLICACIÓN
// ======================================

function initialize() {
    showDate();
    renderDashboard();
    renderInventory();
    renderAlerts();
    renderSales();
    renderAnalytics();
}

initialize();
