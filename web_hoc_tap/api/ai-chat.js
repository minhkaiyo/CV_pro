// api/ai-chat.js — Vercel Serverless Proxy for Groq Chat (Llama 3)
// Features Multi-key Rotation & Fallback to prevent Rate Limits

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Lấy chuỗi các key, ưu tiên GROQ_API_KEYS (nhiều key), nếu không có thì lấy GROQ_API_KEY (1 key)
    const keysString = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
    const apiKeys = keysString.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
        return res.status(500).json({ error: 'Groq API keys not configured on server' });
    }

    try {
        const { messages, stream } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array required' });
        }

        const systemPrompt = `You are the Intelligent Study Assistant for the "StudyPortal" platform.
The system focuses on these HUST courses:
1. Digital Signal Processing (DSP): Z-transform, FFT, FIR/IIR filters
2. Microprocessors (8086): Assembly, registers, memory addressing
3. FPGA/Verilog: Digital circuit design, sequential/combinational logic

Task: Answer technical questions accurately, concisely, with clean markdown.
Tone: Friendly, highly supportive Vietnamese study companion.
Language: Default Vietnamese unless user asks in English.`;

        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // Đảo ngẫu nhiên mảng key để phân phối tải (Load balancing)
        const shuffledKeys = apiKeys.sort(() => 0.5 - Math.random());
        let groqRes = null;
        let lastErrorText = '';

        // Thử từng key, nếu bị lỗi 429 (Rate Limit) thì thử key tiếp theo
        for (const key of shuffledKeys) {
            groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: fullMessages,
                    stream: !!stream,
                    temperature: 0.7,
                    max_tokens: 2048
                })
            });

            if (groqRes.ok) {
                break; // Thành công, thoát khỏi vòng lặp
            } else if (groqRes.status === 429) {
                // Rate limit, thử key khác
                lastErrorText = await groqRes.text();
                continue;
            } else {
                // Lỗi nghiêm trọng khác (như sai định dạng), ngừng thử
                break;
            }
        }

        if (!groqRes || !groqRes.ok) {
            const errText = groqRes ? await groqRes.text().catch(() => lastErrorText) : lastErrorText;
            return res.status(groqRes ? groqRes.status : 500).json({ error: errText || 'All API keys failed or rate limited.' });
        }

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const reader = groqRes.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    res.write(chunk);
                }
            } catch (e) {
                console.error('Stream error:', e);
            }
            res.end();
        } else {
            const data = await groqRes.json();
            return res.status(200).json(data);
        }

    } catch (err) {
        console.error('ai-chat error:', err);
        return res.status(500).json({ error: err.message });
    }
}
