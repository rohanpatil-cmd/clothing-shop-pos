require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Business Cloud API token
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;   // Phone number ID from Meta

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/send-invoice', async (req, res) => {
    const { mobile, message, token, phoneId } = req.body;

    // Prioritize credentials from request, fallback to env
    const finalToken = token || WHATSAPP_TOKEN;
    const finalPhoneId = phoneId || PHONE_ID;

    if (!mobile || !message) {
        return res.status(400).json({ success: false, error: 'Missing mobile or message' });
    }

    if (!finalToken || !finalPhoneId) {
        return res.status(400).json({ success: false, error: 'WhatsApp credentials not configured. Please check Settings.' });
    }

    try {
        console.log(`[WhatsApp] Sending message to ${mobile} via ${finalPhoneId}`);
        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${finalPhoneId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: mobile,
                type: 'text',
                text: { body: message },
            },
            {
                headers: {
                    Authorization: `Bearer ${finalToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('[WhatsApp] Message sent successfully');
        res.json({ success: true, id: response.data.messages?.[0]?.id });
    } catch (err) {
        const errorData = err.response?.data || err.message;
        console.error('WhatsApp API error:', JSON.stringify(errorData, null, 2));
        res.status(500).json({ success: false, error: errorData });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`WhatsApp service listening on ${PORT}`));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});
