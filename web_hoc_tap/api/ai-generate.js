// api/ai-generate.js — Vercel Serverless Proxy for Groq Exam Generation
// Multi-key Rotation & Fallback to prevent Rate Limits

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const keysString = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
    const apiKeys = keysString.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
        return res.status(500).json({ error: 'Groq API keys not configured on server' });
    }

    try {
        const { sourceText, subject, questionCount, difficulty } = req.body;

        if (!sourceText || sourceText.length < 50) {
            return res.status(400).json({ error: 'Source text too short (min 50 chars)' });
        }

        const qCount = parseInt(questionCount) || 5;
        const diff = difficulty || 'medium';

        const systemPrompt = `You are a professional university professor at Hanoi University of Science and Technology (HUST). 
Generate exactly ${qCount} multiple choice questions at ${diff} difficulty based strictly on the academic text provided by the user.
Your output must be absolutely valid JSON only. Do not wrap it in markdown code fences.

Return exactly the following JSON structure:
[
  {
    "content": "Câu hỏi chuyên sâu bằng tiếng Việt...",
    "type": "multiple_choice",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_answer": "A",
    "explanation": "Giải thích chi tiết chuẩn sư phạm bằng tiếng Việt..."
  }
]

Rules:
- All questions and explanations MUST be in Vietnamese
- Each question must have exactly 4 options labeled A, B, C, D
- correct_answer must be a single letter: A, B, C, or D
- Questions must be derived from the provided text, not generic
- Vary difficulty: include both recall and application questions`;

        const shuffledKeys = apiKeys.sort(() => 0.5 - Math.random());
        let response = null;
        let lastErrorText = '';

        for (const key of shuffledKeys) {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Môn học: ${subject}\n\nTài liệu nguồn:\n${sourceText.substring(0, 6000)}` }
                    ],
                    temperature: 0.5,
                    max_tokens: 4096
                })
            });

            if (response.ok) {
                break;
            } else if (response.status === 429) {
                lastErrorText = await response.text();
                continue;
            } else {
                break;
            }
        }

        if (!response || !response.ok) {
            const errText = response ? await response.text().catch(() => lastErrorText) : lastErrorText;
            console.error('Groq API error:', response?.status, errText);
            return res.status(response ? response.status : 500).json({ 
                error: errText || 'All API keys rate limited',
            });
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();

        // Clean markdown fences if present
        if (content.startsWith('```json')) content = content.substring(7);
        if (content.startsWith('```')) content = content.substring(3);
        if (content.endsWith('```')) content = content.substring(0, content.length - 3);
        content = content.trim();

        const questions = JSON.parse(content);

        if (!Array.isArray(questions)) {
            return res.status(500).json({ error: 'AI did not return an array' });
        }

        return res.status(200).json({ 
            success: true, 
            questions,
            model: data.model,
            usage: data.usage
        });

    } catch (err) {
        console.error('ai-generate error:', err);
        return res.status(500).json({ error: err.message });
    }
}
