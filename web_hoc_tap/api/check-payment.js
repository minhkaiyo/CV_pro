export default async function handler(req, res) {
    const { code, price } = req.query;

    // Đặt CORS header để gọi từ Frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (!code) {
        return res.status(400).json({ error: 'Missing payment code' });
    }

    const expectedPrice = parseInt(price) || 10000;

    const SEPAY_TOKEN = process.env.SEPAY_TOKEN;
    if (!SEPAY_TOKEN) {
        // Nếu Admin chưa cấu hình Token, trả về false để không bị lỗi ứng dụng
        return res.status(200).json({ paid: false, message: 'Missing SEPAY_TOKEN configuration' });
    }

    try {
        const response = await fetch('https://my.sepay.vn/userapi/transactions/list?limit=10', {
            headers: {
                'Authorization': `Bearer ${SEPAY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`SePay API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.transactions || !Array.isArray(data.transactions)) {
            return res.status(200).json({ paid: false });
        }

        // Tìm giao dịch có chứa mã Code (VD: HT123456) và số tiền nhận được >= expectedPrice VNĐ
        const transaction = data.transactions.find(t => {
            const content = t.transaction_content ? t.transaction_content.toUpperCase() : '';
            const amount = parseInt(t.amount_in) || 0;
            return content.includes(code.toUpperCase()) && amount >= expectedPrice;
        });

        if (transaction) {
            return res.status(200).json({ 
                paid: true, 
                transactionId: transaction.id,
                transaction: {
                    id: transaction.id,
                    amount: transaction.amount_in,
                    content: transaction.transaction_content,
                    date: transaction.transaction_date,
                    account: transaction.bank_brand_name || 'MB Bank'
                }
            });
        } else {
            return res.status(200).json({ paid: false });
        }
    } catch (error) {
        console.error('SePay Check Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
