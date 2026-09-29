const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Lark API credentials - from environment variables
const APP_ID = process.env.LARK_APP_ID || '';
const APP_SECRET = process.env.LARK_APP_SECRET || '';
const BASE_APP_TOKEN = process.env.LARK_BASE_TOKEN || 'SWSQbZibjaHSTqsWlbqlB4sHg9e';
const TABLE_ID = process.env.LARK_TABLE_ID || 'tblmmHsnTTzufnUq'; // Outbound Record table

if (!APP_ID || !APP_SECRET) {
    console.error('Error: LARK_APP_ID and LARK_APP_SECRET must be set in .env file');
    process.exit(1);
}

let tenantAccessToken = '';
let tokenExpireTime = 0;

// Get tenant access token
async function getAccessToken() {
    if (tenantAccessToken && Date.now() < tokenExpireTime) {
        return tenantAccessToken;
    }
    
    const response = await axios.post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal/', {
        app_id: APP_ID,
        app_secret: APP_SECRET
    });
    
    tenantAccessToken = response.data.tenant_access_token;
    tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000; // Refresh 5 min before expiry
    return tenantAccessToken;
}

// Search record by HKSLI no (Doc Number)
app.post('/api/records/search', async (req, res) => {
    try {
        const token = await getAccessToken();
        const { hkSliNo } = req.body;
        if (!hkSliNo) return res.status(400).json({ error: 'HKSLI no is required' });

        const response = await axios.post(
            `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${TABLE_ID}/records/search`,
            {
                filter: {
                    conjunction: 'and',
                    conditions: [{ field_name: 'HKSLI no', operator: 'is', value: [hkSliNo] }]
                }
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error searching records:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get records from Lark
app.get('/api/records', async (req, res) => {
    try {
        const token = await getAccessToken();
        const response = await axios.get(
            `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${TABLE_ID}/records`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page_size: 100
                }
            }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching records:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

// Create record in Lark
app.post('/api/records', async (req, res) => {
    try {
        const token = await getAccessToken();
        const response = await axios.post(
            `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${TABLE_ID}/records`,
            { fields: req.body },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Error creating record:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update record in Lark
app.put('/api/records/:recordId', async (req, res) => {
    try {
        const token = await getAccessToken();
        const response = await axios.put(
            `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${TABLE_ID}/records/${req.params.recordId}`,
            { fields: req.body },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Error updating record:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
