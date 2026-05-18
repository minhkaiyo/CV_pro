/**
 * api/download-file.js
 * Proxy download — hỗ trợ Google Drive và Cloudinary
 * Fix: xử lý double-encoded URL và redirect trực tiếp cho Cloudinary
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url, name } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url' });

    // Decode URL — giải quyết cả trường hợp double-encode
    let decodedUrl = decodeURIComponent(url);
    // Nếu vẫn còn %25 (dấu hiệu double-encode), decode thêm 1 lần nữa
    if (decodedUrl.includes('%25') || decodedUrl.includes('%2F')) {
        try { decodedUrl = decodeURIComponent(decodedUrl); } catch (_) {}
    }

    const fileName = name ? decodeURIComponent(name) : 'document';

    try {
        // Google Drive — redirect thẳng
        if (decodedUrl.includes('drive.google.com')) {
            return res.redirect(302, decodedUrl);
        }

        // Cloudinary URL — redirect trực tiếp hoặc proxy tùy định dạng
        if (decodedUrl.includes('res.cloudinary.com')) {
            const isPdf = decodedUrl.toLowerCase().split('?')[0].endsWith('.pdf');
            
            if (isPdf) {
                // Đối với file PDF: Thử proxy fetch trước để ép tải xuống với tên file chuẩn UTF-8
                // Tránh lỗi 401 (Unauthorized) của Cloudinary khi áp dụng transformation trên file PDF
                try {
                    const fileRes = await fetch(decodedUrl, {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    if (fileRes.ok) {
                        const ct = fileRes.headers.get('content-type') || 'application/pdf';
                        const cl = fileRes.headers.get('content-length');
                        res.setHeader('Content-Type', ct);
                        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
                        if (cl) res.setHeader('Content-Length', cl);
                        
                        const buffer = await fileRes.arrayBuffer();
                        return res.send(Buffer.from(buffer));
                    }
                } catch (err) {
                    console.error("Proxy fetch PDF failed, falling back to direct redirect:", err);
                }
                
                // Fallback: Redirect trực tiếp đến URL gốc của Cloudinary (không có fl_attachment sẽ không bị 401)
                return res.redirect(302, decodedUrl);
            } else {
                // Các định dạng khác (docx, doc, txt...) dùng fl_attachment an toàn
                const rawFileName = fileName.replace(/\.[^.]+$/, '');
                const safeFileName = rawFileName
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
                    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                    .replace(/\s+/g, '_') // Thay khoảng trắng bằng dấu gạch dưới
                    .replace(/[^a-zA-Z0-9\-_]/g, ''); // Bỏ mọi ký tự lạ khác
                
                const finalFileName = safeFileName || 'document';
                const dlUrl = decodedUrl.includes('/upload/')
                    ? decodedUrl.replace('/upload/', `/upload/fl_attachment:${finalFileName}/`)
                    : decodedUrl;
                return res.redirect(302, dlUrl);
            }
        }

        // Các URL khác — proxy fetch
        const fileRes = await fetch(decodedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!fileRes.ok) {
            return res.status(404).json({
                error: `File không tìm thấy (${fileRes.status}). URL: ${decodedUrl.substring(0, 80)}...`
            });
        }

        const ct = fileRes.headers.get('content-type') || 'application/octet-stream';
        const cl = fileRes.headers.get('content-length');
        res.setHeader('Content-Type', ct);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
        if (cl) res.setHeader('Content-Length', cl);

        const buffer = await fileRes.arrayBuffer();
        return res.send(Buffer.from(buffer));

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
