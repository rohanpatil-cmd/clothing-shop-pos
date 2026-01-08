const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    version: process.versions.electron,
    // Auth
    login: (credentials) => ipcRenderer.invoke('login', credentials),

    // Product APIs
    getProducts: () => ipcRenderer.invoke('get-products'),
    addProduct: (product) => ipcRenderer.invoke('add-product', product),
    updateProduct: (id, product) => ipcRenderer.invoke('update-product', id, product),
    deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),

    // Customer APIs
    getCustomers: () => ipcRenderer.invoke('get-customers'),
    getCustomer: (mobile) => ipcRenderer.invoke('get-customer', mobile),
    addCustomer: (customer) => ipcRenderer.invoke('add-customer', customer),

    // Invoices
    createInvoice: (data) => ipcRenderer.invoke('create-invoice', data),
    getInvoices: () => ipcRenderer.invoke('get-invoices'),
    getCustomerInvoices: (mobile) => ipcRenderer.invoke('get-customer-invoices', mobile),
    getInvoiceDetails: (id) => ipcRenderer.invoke('get-invoice-details', id),
    getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),

    // Purchase APIs
    getPurchases: () => ipcRenderer.invoke('get-purchases'),
    addPurchase: (data) => ipcRenderer.invoke('add-purchase', data),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
});
