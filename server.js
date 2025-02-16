const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// 允許所有來源的請求
app.use(cors());
app.use(express.json());

// 代理 API 請求
app.post('/api/generate', async (req, res) => {
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: "claude-3-opus-20240229",
            max_tokens: 50,
            messages: req.body.messages,
            system: req.body.system
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': '你的API密鑰',
                'anthropic-version': '2023-06-01'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('代理服務器運行在 http://localhost:3000');
}); 