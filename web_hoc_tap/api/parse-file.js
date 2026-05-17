/**
 * api/parse-file.js — Vercel Serverless Function
 * Parse uploaded files (.docx, .txt, .pdf) → plain text
 *
 * POST /api/parse-file
 * Content-Type: multipart/form-data
 * Body field: "file" (the uploaded file)
 *
 * Returns: { text: string, wordCount: number, fileName: string }
 */

import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable Next.js/Vercel default body parser so formidable can handle it
export const config = {
    api: {
        bodyParser: false,
    },
};

// ── CORS helper ──────────────────────────────────────────────────────────────
function setCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    setCORS(res);

    // Preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // ── Parse multipart form ──────────────────────────────────────────────────
    let filePath, originalName, mimeType;
    try {
        const { filePath: fp, originalName: on, mimeType: mt } = await parseForm(req);
        filePath = fp;
        originalName = on;
        mimeType = mt;
    } catch (err) {
        return res.status(400).json({ error: 'Failed to parse form: ' + err.message });
    }

    const ext = path.extname(originalName).toLowerCase().replace('.', '');

    // ── Route to correct parser ───────────────────────────────────────────────
    let extractedText = '';
    try {
        if (ext === 'txt') {
            extractedText = await parseTxt(filePath);
        } else if (ext === 'docx' || ext === 'doc') {
            extractedText = await parseDocx(filePath);
        } else if (ext === 'pdf') {
            extractedText = await parsePdf(filePath);
        } else {
            cleanup(filePath);
            return res.status(415).json({
                error: `Unsupported file type ".${ext}". Supported: .txt, .docx, .pdf`,
            });
        }
    } catch (err) {
        cleanup(filePath);
        return res.status(500).json({ error: 'Parse error: ' + err.message });
    }

    cleanup(filePath);

    // ── Sanitize output ───────────────────────────────────────────────────────
    extractedText = sanitize(extractedText);

    if (!extractedText || extractedText.length < 5) {
        return res.status(422).json({ error: 'File has no readable text content.' });
    }

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    return res.status(200).json({
        text: extractedText,
        wordCount,
        fileName: originalName,
        ext,
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse multipart/form-data with formidable */
function parseForm(req) {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({
            maxFileSize: 10 * 1024 * 1024, // 10 MB limit
            keepExtensions: true,
        });

        form.parse(req, (err, _fields, files) => {
            if (err) return reject(err);

            const uploaded = files.file;
            if (!uploaded) return reject(new Error('No file field named "file" found.'));

            // formidable v3 returns array; v2 returns object directly
            const fileObj = Array.isArray(uploaded) ? uploaded[0] : uploaded;

            resolve({
                filePath: fileObj.filepath,
                originalName: fileObj.originalFilename || fileObj.name || 'upload',
                mimeType: fileObj.mimetype || '',
            });
        });
    });
}

/** Read plain text file */
async function parseTxt(filePath) {
    return fs.promises.readFile(filePath, 'utf-8');
}

/** Extract raw text from .docx using mammoth */
async function parseDocx(filePath) {
    // Dynamic import — mammoth is a CommonJS module
    const mammoth = await import('mammoth').then(m => m.default || m);
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

/** Extract text from PDF using pdf-parse */
async function parsePdf(filePath) {
    const pdfParse = await import('pdf-parse').then(m => m.default || m);
    const buffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
}

/** Remove temp file silently */
function cleanup(filePath) {
    if (filePath) {
        fs.unlink(filePath, () => {});
    }
}

/** Normalize whitespace and remove junk characters */
function sanitize(text) {
    return text
        .replace(/\0/g, '')           // null bytes
        .replace(/\r\n/g, '\n')       // Windows line endings
        .replace(/\r/g, '\n')         // old Mac line endings
        .replace(/\n{4,}/g, '\n\n')   // excessive blank lines
        .replace(/[ \t]{3,}/g, '  ')  // excessive spaces/tabs
        .trim();
}
