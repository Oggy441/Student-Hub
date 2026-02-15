
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/generate-quote.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log(' loaded .env variables');
    }
} catch (e) {
    console.warn('Failed to load .env:', e.message);
}

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    console.log(`${req.method} ${req.url}`);

    if (req.url === '/api/generate-quote') {
        // Mock Vercel's response helpers
        const vercelRes = {
            status: (code) => {
                res.statusCode = code;
                return vercelRes;
            },
            json: (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return vercelRes;
            },
            send: (data) => {
                res.end(data);
                return vercelRes;
            }
        };

        try {
            await handler(req, vercelRes);
        } catch (error) {
            console.error('Handler error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Local API Server running at http://localhost:${PORT}`);
});
