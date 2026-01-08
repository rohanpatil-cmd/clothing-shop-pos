const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { queries } = require('./db.cjs');

const isDev = !app.isPackaged;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "Clothing Shop Manager",
        autoHideMenuBar: true,
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:4500');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
}

// Register IPC Handlers
function registerIpcHandlers() {
    // Auth
    ipcMain.handle('login', (event, { username, password }) => queries.login(username, password));

    // Products
    ipcMain.handle('get-products', () => queries.getProducts());
    ipcMain.handle('add-product', (event, product) => queries.addProduct(product));
    ipcMain.handle('update-product', (event, id, product) => queries.updateProduct(id, product));
    ipcMain.handle('delete-product', (event, id) => queries.deleteProduct(id));

    // Customers
    ipcMain.handle('get-customers', () => queries.getCustomers());
    ipcMain.handle('get-customer', (event, mobile) => queries.getCustomer(mobile));
    ipcMain.handle('add-customer', (event, customer) => queries.addCustomer(customer));

    // Invoices
    ipcMain.handle('create-invoice', (event, data) => queries.createInvoice(data));
    ipcMain.handle('get-invoices', () => queries.getInvoices());
    ipcMain.handle('get-customer-invoices', (event, mobile) => queries.getCustomerInvoices(mobile));
    ipcMain.handle('get-invoice-details', (event, id) => queries.getInvoiceDetails(id));
    ipcMain.handle('get-dashboard-stats', () => queries.getDashboardStats());

    // Purchases
    ipcMain.handle('get-purchases', () => queries.getPurchases());
    ipcMain.handle('add-purchase', (event, data) => queries.addPurchase(data));

    // Settings
    ipcMain.handle('get-settings', () => queries.getSettings());
    ipcMain.handle('update-settings', (event, settings) => queries.updateSettings(settings));
}

app.whenReady().then(() => {
    registerIpcHandlers();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
