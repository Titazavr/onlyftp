import { Router, Request, Response, NextFunction } from 'express';
import { ftpService } from '../services/ftp.service';
import { encrypt, decrypt } from '../../lib/crypto';
import { PrismaClient } from '@prisma/client';
import busboy from 'busboy';

const router = Router();
const prisma = new PrismaClient();

// Connect
router.post('/connect', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { host, port, user, password, protocol, save } = req.body;

        // Connect to FTP
        const { connectionId } = await ftpService.connect({
            host,
            port: parseInt(port),
            user,
            password,
            protocol,
        });

        // Save if requested
        if (save) {
            await prisma.connection.create({
                data: {
                    name: `${user}@${host}`,
                    host,
                    port: parseInt(port),
                    username: user,
                    password: encrypt(password),
                    protocol,
                },
            });
        }

        res.json({ success: true, connectionId });
    } catch (error) {
        next(error);
    }
});

// List Directory
router.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { connectionId, path } = req.query;
        if (!connectionId || typeof connectionId !== 'string') throw new Error('Connection ID required');

        const files = await ftpService.list(connectionId, (path as string) || '/');
        res.json({ success: true, files });
    } catch (error) {
        next(error);
    }
});

// Download File (Stream)
router.get('/download', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { connectionId, path } = req.query;
        if (!connectionId || typeof connectionId !== 'string') throw new Error('Connection ID required');
        if (!path || typeof path !== 'string') throw new Error('Path required');

        const stream = await ftpService.getStream(connectionId, path);

        // Set headers
        const filename = path.split('/').pop() || 'download';
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Pipe stream to response
        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('Stream Error:', err);
            // If headers sent, we can't send JSON error. 
            if (!res.headersSent) next(err);
        });

    } catch (error) {
        next(error);
    }
});

// Upload File (Stream with Busboy)
router.post('/upload', async (req: Request, res: Response, next: NextFunction) => {
    const { connectionId, path: uploadPath } = req.query;

    if (!connectionId || typeof connectionId !== 'string') {
        return res.status(400).json({ success: false, message: 'Connection ID required' });
    }

    const bb = busboy({ headers: req.headers });

    bb.on('file', async (name: string, file: any, info: busboy.FileInfo) => {
        const { filename } = info;
        const targetPath = (uploadPath as string ? `${uploadPath}/${filename}` : filename).replace('//', '/');

        try {
            console.log(`Uploading ${filename} to ${targetPath}...`);
            await ftpService.uploadStream(connectionId, targetPath, file);
            console.log(`Upload ${filename} complete.`);
        } catch (err) {
            console.error('Upload Error:', err);
            // Busboy doesn't easily allow sending error back if response already started, 
            // but here we wait for file stream to finish.
            // We should probably emit error to bb or handle it.
        }
    });

    bb.on('close', () => {
        res.json({ success: true, message: 'Upload completed' });
    });

    bb.on('error', (err: any) => {
        next(err);
    });

    req.pipe(bb);
});

export default router;
