const apiCall = async (endpoint, method = 'GET', data = null) => {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    const res = await fetch(`/api/${endpoint}`, options);
    const json = await res.json();
    if (!json.success) {
        throw new Error(json.error || 'API Error');
    }
    return json.data;
};

window.electron = {
    version: 'web',
    // Auth
    login: (credentials) => apiCall('login', 'POST', credentials),

    // Product APIs
    getProducts: () => apiCall('products'),
    addProduct: (product) => apiCall('products', 'POST', product),
    updateProduct: (id, product) => apiCall(`products/${id}`, 'PUT', product),
    deleteProduct: (id) => apiCall(`products/${id}`, 'DELETE'),

    // Customer APIs
    getCustomers: () => apiCall('customers'),
    getCustomer: (mobile) => apiCall(`customers/${mobile}`),
    addCustomer: (customer) => apiCall('customers', 'POST', customer),

    // Invoices
    createInvoice: (data) => apiCall('invoices', 'POST', data),
    getInvoices: () => apiCall('invoices'),
    getCustomerInvoices: (mobile) => apiCall(`invoices/customer/${mobile}`),
    getInvoiceDetails: (id) => apiCall(`invoices/${id}`),
    getDashboardStats: () => apiCall('dashboard-stats'),

    // Purchase APIs
    getPurchases: () => apiCall('purchases'),
    addPurchase: (data) => apiCall('purchases', 'POST', data),

    // Settings
    getSettings: () => apiCall('settings'),
    updateSettings: (settings) => apiCall('settings', 'POST', settings),

    // Reset Operations
    resetSales: () => apiCall('reset/sales', 'POST'),
    resetCustomers: () => apiCall('reset/customers', 'POST'),
    resetInventory: () => apiCall('reset/inventory', 'POST'),
    resetStocks: () => apiCall('reset/stocks', 'POST'),
    resetAll: () => apiCall('reset/all', 'POST'),
};
