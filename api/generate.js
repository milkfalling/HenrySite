export default async function handler(req, res) {
    // 添加 CORS 頭
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, system } = req.body;
        
        console.log('Request details:', { messages, system });

        // 使用 Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD3qDpbQazq5OQPjFibHIQN7QYnYAsBOJM`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${system}\n${messages[0].content}\n請只生成一個詞或一句話，不要生成多個選項。`
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 50,
                        temperature: 0.7,
                        topP: 0.8,
                        topK: 40
                    }
                })
            }
        );

        const data = await response.json();
        console.log('Gemini raw response:', data);

        if (!response.ok) {
            throw new Error(`Gemini API error: ${data.error?.message || JSON.stringify(data)}`);
        }

        // 檢查並處理 Gemini 的響應格式
        let text;
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = data.candidates[0].content.parts[0].text;
        } else if (data.promptFeedback?.block) {
            throw new Error('內容被過濾：' + data.promptFeedback.blockReason);
        } else {
            console.error('Unexpected Gemini response format:', data);
            throw new Error('無效的 Gemini 響應格式');
        }

        // 清理文本
        text = text
            .split('\n')[0]  // 只取第一行
            .replace(/^[1-9\.\s、]+/g, '')  // 移除開頭的數字、點和空格
            .replace(/[：:]/g, '')  // 移除冒號
            .replace(/^["']|["']$/g, '')  // 移除引號
            .replace(/翻譯：|譯文：|中文：/g, '')  // 移除標籤
            .trim();

        const result = {
            content: [{
                text: text
            }]
        };

        console.log('Final response to client:', result);
        res.status(200).json(result);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: 'Failed to generate text',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            name: error.name
        });
    }
} 