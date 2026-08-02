/**
 * API Fetch Helper Module with Exact Database SQL Mock Fallback
 * File: assets/js/api.js
 * Description: Data persis sama dengan database.sql (dashboard_sales_db)
 */

const API_BASE_URL = 'api/';

// Internal State & DataSource Status
let useMockFallback = false;
let mockDataStore = null;

/**
 * Dataset persis 100% dari database.sql MySQL
 */
function createMockDataset() {
    return {
        summary: {
            total_revenue: 218320000,
            total_sales: 32,
            total_customers: 15,
            total_products: 14,
            growth: {
                revenue: 14.2,
                sales: 8.5,
                customers: 12.0,
                products: 4.1
            }
        },
        monthly_trend: {
            labels: ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'Mei 2026', 'Jun 2026', 'Jul 2026', 'Agu 2026'],
            revenue: [21410000, 12480000, 38800000, 20600000, 28600000, 30730000, 40250000, 25450000],
            items_sold: [8, 8, 8, 14, 8, 16, 14, 8]
        },
        category_sales: {
            categories: ['Electronics', 'Home & Living', 'Fashion', 'Books'],
            revenues: [188100000, 13050000, 13000000, 4170000],
            quantities: [33, 10, 21, 22]
        },
        product_distribution: {
            labels: ['Laptop Pro 15-inch', 'Smartphone Ultra 5G', 'Wireless Headphones', 'Smartwatch Fitness', 'Kursi Ergonomis Kantor'],
            quantities: [6, 9, 7, 7, 3],
            revenues: [90000000, 68000000, 17500000, 12600000, 6300000]
        },
        payment_methods: {
            labels: ['Transfer Bank', 'QRIS / E-Wallet', 'Kartu Kredit', 'Cash'],
            data: [50, 30, 12, 8]
        },
        recent_sales: [
            {
                id: 'TRX-32',
                customer_name: 'Giri Wijaya',
                product_name: 'Kursi Ergonomis Kantor',
                category: 'Home & Living',
                quantity: 1,
                price: 2100000,
                total_price: 2100000,
                payment_method: 'Transfer Bank',
                status: 'Sukses',
                sale_date: '2026-08-01 15:00'
            },
            {
                id: 'TRX-31',
                customer_name: 'Fitri Handayani',
                product_name: 'Tas Ransel Waterproof',
                category: 'Fashion',
                quantity: 3,
                price: 450000,
                total_price: 1350000,
                payment_method: 'QRIS / E-Wallet',
                status: 'Sukses',
                sale_date: '2026-08-01 13:15'
            },
            {
                id: 'TRX-30',
                customer_name: 'Eko Prasetyo',
                product_name: 'Wireless Noise-Canceling Headphones',
                category: 'Electronics',
                quantity: 2,
                price: 2500000,
                total_price: 5000000,
                payment_method: 'Transfer Bank',
                status: 'Sukses',
                sale_date: '2026-08-01 10:45'
            },
            {
                id: 'TRX-29',
                customer_name: 'Dewi Lestari',
                product_name: 'Smartphone Ultra 5G',
                category: 'Electronics',
                quantity: 2,
                price: 8500000,
                total_price: 17000000,
                payment_method: 'Kartu Kredit',
                status: 'Sukses',
                sale_date: '2026-08-01 08:30'
            },
            {
                id: 'TRX-28',
                customer_name: 'Ahmad Rizky',
                product_name: 'Buku Master Data Science & AI',
                category: 'Books',
                quantity: 5,
                price: 220000,
                total_price: 1100000,
                payment_method: 'QRIS / E-Wallet',
                status: 'Sukses',
                sale_date: '2026-07-27 16:30'
            },
            {
                id: 'TRX-27',
                customer_name: 'Siti Nurhaliza',
                product_name: 'Jaket Denim Vintage',
                category: 'Fashion',
                quantity: 3,
                price: 650000,
                total_price: 1950000,
                payment_method: 'Transfer Bank',
                status: 'Sukses',
                sale_date: '2026-07-19 14:00'
            },
            {
                id: 'TRX-26',
                customer_name: 'Budi Santoso',
                product_name: 'Smartwatch Fitness Tracker',
                category: 'Electronics',
                quantity: 4,
                price: 1800000,
                total_price: 7200000,
                payment_method: 'QRIS / E-Wallet',
                status: 'Sukses',
                sale_date: '2026-07-12 11:50'
            },
            {
                id: 'TRX-25',
                customer_name: 'Oscar Farhan',
                product_name: 'Laptop Pro 15-inch',
                category: 'Electronics',
                quantity: 2,
                price: 15000000,
                total_price: 30000000,
                payment_method: 'Transfer Bank',
                status: 'Sukses',
                sale_date: '2026-07-04 09:15'
            }
        ]
    };
}

// Inisialisasi Mock Store
mockDataStore = createMockDataset();

/**
 * Utility Function untuk melakukan fetch API dengan automatic fallback
 */
async function fetchAPI(endpoint) {
    if (useMockFallback) {
        return getMockDataForEndpoint(endpoint);
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const json = await response.json();
        if (json.status === 'success' && json.data) {
            useMockFallback = false;
            return json.data;
        } else {
            throw new Error(json.message || 'Format JSON backend tidak valid');
        }
    } catch (error) {
        console.warn(`[SalesViz API] Gagal terhubung ke MySQL (${endpoint}):`, error.message, '-> Mengalihkan ke Data Database SQL Mode.');
        useMockFallback = true;
        return getMockDataForEndpoint(endpoint);
    }
}

/**
 * Helper untuk memberikan mock data sesuai endpoint
 */
function getMockDataForEndpoint(endpoint) {
    if (endpoint.includes('action=summary')) return mockDataStore.summary;
    if (endpoint.includes('action=monthly_trend')) return mockDataStore.monthly_trend;
    if (endpoint.includes('action=category_sales')) return mockDataStore.category_sales;
    if (endpoint.includes('action=product_distribution')) return mockDataStore.product_distribution;
    if (endpoint.includes('action=recent_sales')) return mockDataStore.recent_sales;
    
    return mockDataStore;
}

/**
 * Cek Status Data Source Saat Ini
 */
function getDataSourceStatus() {
    return {
        isMock: useMockFallback,
        label: useMockFallback ? '⚡ Data Demo (MySQL Sync)' : '🟢 Realtime MySQL DB'
    };
}

/**
 * Toggle Paksa Mode Data (MySQL <-> Mock Demo)
 */
function toggleDataSourceMode() {
    useMockFallback = !useMockFallback;
    return getDataSourceStatus();
}

/**
 * Function publik untuk mengambil semua payload dashboard
 */
async function getDashboardPayload() {
    return await fetchAPI('sales.php?action=all');
}

/**
 * Function untuk menambah transaksi baru (Local State Update)
 */
function addNewTransactionLocal(saleData) {
    const nextId = mockDataStore.recent_sales.length + 33;
    const newTrx = {
        id: `TRX-${nextId}`,
        customer_name: saleData.customer_name || 'Pelanggan Baru',
        product_name: saleData.product_name || 'Laptop Pro 15-inch',
        category: saleData.category || 'Electronics',
        quantity: parseInt(saleData.quantity) || 1,
        price: parseFloat(saleData.price) || 15000000,
        total_price: (parseInt(saleData.quantity) || 1) * (parseFloat(saleData.price) || 15000000),
        payment_method: saleData.payment_method || 'Transfer Bank',
        status: saleData.status || 'Sukses',
        sale_date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    mockDataStore.recent_sales.unshift(newTrx);
    mockDataStore.summary.total_revenue += newTrx.total_price;
    mockDataStore.summary.total_sales += newTrx.quantity;
    
    return newTrx;
}
