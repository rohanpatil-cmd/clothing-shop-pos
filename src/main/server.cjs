require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { queries } = require('./db.cjs');

const app = express();
app.use(cors());
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// WhatsApp
app.post('/api/send-invoice', async (req, res) => {
    const { mobile, message, token, phoneId } = req.body;
    const finalToken = token || WHATSAPP_TOKEN;
    const finalPhoneId = phoneId || PHONE_ID;

    if (!mobile || !message) return res.status(400).json({ success: false, error: 'Missing mobile or message' });
    if (!finalToken || !finalPhoneId) return res.status(400).json({ success: false, error: 'WhatsApp credentials not configured.' });

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${finalPhoneId}/messages`,
            { messaging_product: 'whatsapp', to: mobile, type: 'text', text: { body: message } },
            { headers: { Authorization: `Bearer ${finalToken}`, 'Content-Type': 'application/json' } }
        );
        res.json({ success: true, id: response.data.messages?.[0]?.id });
    } catch (err) {
        res.status(500).json({ success: false, error: err.response?.data || err.message });
    }
});

// Wrapper to handle errors
const handleReq = (promiseGen) => async (req, res) => {
    try {
        const result = await promiseGen(req);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Auth
app.post('/api/login', handleReq(req => queries.login(req.body.username, req.body.password)));

// Products
app.get('/api/products', handleReq(() => queries.getProducts()));
app.post('/api/products', handleReq(req => queries.addProduct(req.body)));
app.put('/api/products/:id', handleReq(req => queries.updateProduct(req.params.id, req.body)));
app.delete('/api/products/:id', handleReq(req => queries.deleteProduct(req.params.id)));

// Customers
app.get('/api/customers', handleReq(() => queries.getCustomers()));
app.get('/api/customers/:mobile', handleReq(req => queries.getCustomer(req.params.mobile)));
app.post('/api/customers', handleReq(req => queries.addCustomer(req.body)));

// Invoices
app.post('/api/invoices', handleReq(req => queries.createInvoice(req.body)));
app.get('/api/invoices', handleReq(() => queries.getInvoices()));
app.get('/api/invoices/customer/:mobile', handleReq(req => queries.getCustomerInvoices(req.params.mobile)));
app.get('/api/invoices/:id', handleReq(req => queries.getInvoiceDetails(req.params.id)));
app.get('/api/dashboard-stats', handleReq(() => queries.getDashboardStats()));

// Purchases
app.get('/api/purchases', handleReq(() => queries.getPurchases()));
app.post('/api/purchases', handleReq(req => queries.addPurchase(req.body)));

// Settings
app.get('/api/settings', handleReq(() => queries.getSettings()));
app.post('/api/settings', handleReq(req => queries.updateSettings(req.body)));

// Reset Operations
app.post('/api/reset/sales', handleReq(() => queries.resetSales()));
app.post('/api/reset/customers', handleReq(() => queries.resetCustomers()));
app.post('/api/reset/inventory', handleReq(() => queries.resetInventory()));
app.post('/api/reset/stocks', handleReq(() => queries.resetStocks()));
app.post('/api/reset/all', handleReq(() => queries.resetAll()));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API Server running on port ${PORT}`));

process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
