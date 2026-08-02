/**
 * Chart.js Visualization Engine Module
 * File: assets/js/charts.js
 * Description: Mengelola pembuatan, konfigurasi visual, dan perenderan ulang Chart.js v4.
 */

// Storage Instance Chart untuk mempermudah destroy/update
let monthlyLineChart = null;
let categoryBarChart = null;
let productPieChart = null;
let paymentMethodChart = null;

/**
 * Format Currency Rupiah (IDR)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * 1. Render Line Chart: Trend Penjualan Bulanan
 */
function renderMonthlyTrendChart(ctx, labels, revenueData, itemsSoldData) {
    if (monthlyLineChart) {
        monthlyLineChart.destroy();
    }

    const chartCtx = ctx.getContext('2d');
    const gradientRevenue = chartCtx.createLinearGradient(0, 0, 0, 320);
    gradientRevenue.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    gradientRevenue.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    monthlyLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Revenue (Rp)',
                    data: revenueData,
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    backgroundColor: gradientRevenue,
                    fill: true,
                    tension: 0.38,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    yAxisID: 'y'
                },
                {
                    label: 'Produk Terjual (Unit)',
                    data: itemsSoldData,
                    borderColor: '#38bdf8',
                    borderWidth: 2.5,
                    borderDash: [4, 4],
                    backgroundColor: 'transparent',
                    pointBackgroundColor: '#38bdf8',
                    pointRadius: 4,
                    tension: 0.38,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.datasetIndex === 0) {
                                label += formatCurrency(context.parsed.y);
                            } else {
                                label += context.parsed.y + ' unit';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        callback: function(value) {
                            return 'Rp ' + (value / 1000000).toFixed(0) + ' Jt';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: '#38bdf8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        callback: function(value) {
                            return value + ' Unit';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 2. Render Bar Chart: Penjualan per Kategori
 */
function renderCategoryBarChart(ctx, categories, revenues) {
    if (categoryBarChart) {
        categoryBarChart.destroy();
    }

    const chartCtx = ctx.getContext('2d');
    const gradientBar = chartCtx.createLinearGradient(0, 0, 400, 0);
    gradientBar.addColorStop(0, '#6366f1');
    gradientBar.addColorStop(1, '#a855f7');

    categoryBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Pendapatan (Rp)',
                data: revenues,
                backgroundColor: [
                    '#6366f1',
                    '#10b981',
                    '#38bdf8',
                    '#a855f7',
                    '#f59e0b'
                ],
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 28
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Pendapatan: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        callback: function(value) {
                            return 'Rp ' + (value / 1000000).toFixed(0) + ' Jt';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 3. Render Doughnut Chart: Distribusi Produk Terlaris
 */
function renderProductPieChart(ctx, labels, quantities) {
    if (productPieChart) {
        productPieChart.destroy();
    }

    productPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: quantities,
                backgroundColor: [
                    '#6366f1',
                    '#38bdf8',
                    '#10b981',
                    '#f59e0b',
                    '#ec4899'
                ],
                borderColor: '#1e293b',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        usePointStyle: true,
                        padding: 14
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const val = context.parsed || 0;
                            return ` ${label}: ${val} Unit Terjual`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 4. Render Payment Method Breakdown Chart (Polar/Doughnut)
 */
function renderPaymentMethodChart(ctx, labels, data) {
    if (paymentMethodChart) {
        paymentMethodChart.destroy();
    }

    paymentMethodChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(56, 189, 248, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        usePointStyle: true,
                        padding: 12
                    }
                }
            },
            scales: {
                r: {
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    ticks: { display: false }
                }
            }
        }
    });
}
