/**
 * Main Application Script & Event Controller
 * File: assets/js/app.js
 * Description: Mengkoordinasikan fetch data, state management, manipulasi DOM,
 *              pencarian transaksi, dan handler modal input transaksi baru.
 */

// Global App State
let appState = {
    payload: null,
    searchQuery: '',
    selectedCategory: 'all',
    selectedDateRange: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Aplikasi
    initApp();

    // 2. Pasang Listener Interaktif UI
    setupEventListeners();
});

/**
 * Inisialisasi Aplikasi Dashboard
 */
async function initApp() {
    updateCurrentDate();
    await loadDashboardData();
}

/**
 * Tampilkan Tanggal Hari Ini di Header Navbar
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('id-ID', options);
    }
}

/**
 * Loader Utama Data Dashboard
 */
async function loadDashboardData() {
    const refreshBtnIcon = document.querySelector('.refresh-btn i');
    if (refreshBtnIcon) refreshBtnIcon.classList.add('spinning');

    try {
        // Ambil Data (otomatis fallback ke Mock Data jika MySQL offline)
        const data = await getDashboardPayload();
        appState.payload = data;

        if (data) {
            // A. Update Status Badge Data Source (MySQL vs Demo Mock)
            updateDataSourcePill();

            // B. Update KPI Summary Cards
            updateSummaryCards(data.summary);

            // C. Render Chart Penjualan Bulanan (Line Chart)
            const lineCtx = document.getElementById('monthlyTrendChart');
            if (lineCtx && data.monthly_trend) {
                renderMonthlyTrendChart(
                    lineCtx,
                    data.monthly_trend.labels,
                    data.monthly_trend.revenue,
                    data.monthly_trend.items_sold
                );
            }

            // D. Render Chart Penjualan Kategori (Bar Chart)
            const barCtx = document.getElementById('categoryBarChart');
            if (barCtx && data.category_sales) {
                renderCategoryBarChart(
                    barCtx,
                    data.category_sales.categories,
                    data.category_sales.revenues
                );
            }

            // E. Render Chart Distribusi Produk (Doughnut Chart)
            const pieCtx = document.getElementById('productPieChart');
            if (pieCtx && data.product_distribution) {
                renderProductPieChart(
                    pieCtx,
                    data.product_distribution.labels,
                    data.product_distribution.quantities
                );
            }

            // F. Render Recent Transactions Table
            renderSalesTable();
        }
    } catch (error) {
        console.error('Error saat load data:', error);
    } finally {
        if (refreshBtnIcon) {
            setTimeout(() => {
                refreshBtnIcon.classList.remove('spinning');
            }, 500);
        }
    }
}

/**
 * Update Elemen Status Pill Data Source (MySQL / Mock Demo)
 */
function updateDataSourcePill() {
    const statusPill = document.getElementById('data-status-pill');
    if (statusPill) {
        const status = getDataSourceStatus();
        statusPill.innerHTML = `<span class="status-dot"></span> ${status.label}`;
        if (status.isMock) {
            statusPill.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            statusPill.style.color = '#f59e0b';
        } else {
            statusPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            statusPill.style.color = '#10b981';
        }
    }
}

/**
 * Update 4 KPI Summary Cards
 */
function updateSummaryCards(summary) {
    if (!summary) return;

    const elRevenue = document.getElementById('kpi-total-revenue');
    const elSales = document.getElementById('kpi-total-sales');
    const elCustomers = document.getElementById('kpi-total-customers');
    const elProducts = document.getElementById('kpi-total-products');

    if (elRevenue) elRevenue.textContent = formatCurrency(summary.total_revenue || 0);
    if (elSales) elSales.textContent = (summary.total_sales || 0).toLocaleString('id-ID');
    if (elCustomers) elCustomers.textContent = (summary.total_customers || 0).toLocaleString('id-ID');
    if (elProducts) elProducts.textContent = (summary.total_products || 0).toLocaleString('id-ID');
}

/**
 * Render Tabel Transaksi Penjualan dengan Filter & Pencarian
 */
function renderSalesTable() {
    const tbody = document.getElementById('recent-sales-tbody');
    if (!tbody || !appState.payload || !appState.payload.recent_sales) return;

    let sales = appState.payload.recent_sales;

    // Filter Kategori
    if (appState.selectedCategory !== 'all') {
        sales = sales.filter(s => s.category.toLowerCase() === appState.selectedCategory.toLowerCase());
    }

    // Filter Search Query
    if (appState.searchQuery.trim() !== '') {
        const q = appState.searchQuery.toLowerCase();
        sales = sales.filter(s => 
            s.id.toLowerCase().includes(q) ||
            s.customer_name.toLowerCase().includes(q) ||
            s.product_name.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
        );
    }

    if (sales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    <i class="ri-inbox-line" style="font-size: 1.8rem; display: block; margin-bottom: 6px;"></i>
                    Tidak ada transaksi yang cocok dengan kriteria pencarian.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sales.map(s => {
        const badgeClass = (s.status || 'Sukses').toLowerCase() === 'sukses' ? 'sukses' : 'pending';
        return `
            <tr>
                <td><strong style="color: var(--primary);">${escapeHTML(s.id)}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">
                            ${escapeHTML(s.customer_name.substring(0, 2).toUpperCase())}
                        </div>
                        <span>${escapeHTML(s.customer_name)}</span>
                    </div>
                </td>
                <td>${escapeHTML(s.product_name)}</td>
                <td><span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: var(--accent-blue);">${escapeHTML(s.category)}</span></td>
                <td><strong>${s.quantity}</strong></td>
                <td><strong>${formatCurrency(s.total_price)}</strong></td>
                <td><span class="status-badge ${badgeClass}">${escapeHTML(s.status || 'Sukses')}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Setup Seluruh Event Listener Interaktif
 */
function setupEventListeners() {
    // 1. Refresh Button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboardData();
        });
    }

    // 2. Toggle DataSource Pill (Mock <-> MySQL)
    const statusPill = document.getElementById('data-status-pill');
    if (statusPill) {
        statusPill.addEventListener('click', () => {
            toggleDataSourceMode();
            loadDashboardData();
        });
    }

    // 3. Search Bar Listener
    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.searchQuery = e.target.value;
            renderSalesTable();
        });
    }

    // 4. Category Filter Select
    const categorySelect = document.getElementById('filter-category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            appState.selectedCategory = e.target.value;
            renderSalesTable();
        });
    }

    // 5. Sidebar Toggle (Mobile Responsive)
    const menuToggleBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggleBtn && sidebar) {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // 6. Modal Tambah Transaksi Listener
    const btnOpenModal = document.getElementById('btn-add-transaction');
    const modalOverlay = document.getElementById('add-transaction-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const formAddTrx = document.getElementById('form-add-transaction');

    if (btnOpenModal && modalOverlay) {
        btnOpenModal.addEventListener('click', () => {
            modalOverlay.classList.add('active');
        });
    }

    if (btnCloseModal && modalOverlay) {
        btnCloseModal.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // Submit Form Transaksi Baru
    if (formAddTrx) {
        formAddTrx.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                customer_name: document.getElementById('input-customer-name').value,
                product_name: document.getElementById('input-product-name').value,
                category: document.getElementById('input-category').value,
                price: parseFloat(document.getElementById('input-price').value),
                quantity: parseInt(document.getElementById('input-quantity').value),
                status: 'Sukses'
            };

            // Tambahkan transaksi secara lokal ke state
            addNewTransactionLocal(formData);

            // Close modal & Reset form
            modalOverlay.classList.remove('active');
            formAddTrx.reset();

            // Re-render UI
            loadDashboardData();
        });
    }
}

/**
 * Helper Escape HTML Sanitization
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
