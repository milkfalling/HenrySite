export default function handler(req, res) {
    // 添加 CORS 頭
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 如果是 OPTIONS 請求，直接返回 200
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 正常的健康檢查響應
    res.status(200).json({ status: 'ok' });
} 