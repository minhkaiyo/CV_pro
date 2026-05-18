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

        // Cloudinary URL — redirect trực tiếp (không cần proxy)
        // URL Cloudinary đã public, fetch qua proxy gây lỗi CORS không cần thiết
        if (decodedUrl.includes('res.cloudinary.com')) {
            // Thêm fl_attachment để Cloudinary tự trả header Content-Disposition
            const dlUrl = decodedUrl.includes('/upload/')
                ? decodedUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(fileName.replace(/\.[^.]+$/, ''))}/`)
                : decodedUrl;
            return res.redirect(302, dlUrl);
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
