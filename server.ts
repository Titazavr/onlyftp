import express, { Request, Response, NextFunction } from 'express';
import next from 'next';
import { parse } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

async function bootstrap() {
    try {
        await app.prepare();
        const server = express();

        // Middleware to parse JSON bodies (for API routes)
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));

        // Custom API Routes
        const ftpRoutes = (await import('./src/server/routes/ftp.routes')).default;
        server.use('/api/ftp', ftpRoutes);

        // Global Error Handler
        server.use((err: any, req: Request, res: Response, next: NextFunction) => {
            console.error('Global Error:', err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Internal Server Error',
                error: dev ? err : undefined,
            });
        });

        // Next.js Request Handler
        server.all('*', (req: Request, res: Response) => {
            const parsedUrl = parse(req.url!, true);
            return handle(req, res, parsedUrl);
        });

        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

bootstrap();
