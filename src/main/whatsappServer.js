require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Business Cloud API token
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;   // Phone number ID from Meta

app.post('/api/send-invoice', async (req, res) => {
    const { mobile, message } = req.body;
    if (!mobile || !message) {
        return res.status(400).json({ success: false, error: 'Missing mobile or message' });
    }
    try {
        await axios.post(
            `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: mobile,
                type: 'text',
                text: { body: message },
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('WhatsApp API error:', err.response?.data || err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`WhatsApp service listening on ${PORT}`));
