import * as ftp from 'basic-ftp';
import Client from 'ssh2-sftp-client';
import { v4 as uuidv4 } from 'uuid';
import { Readable, Writable } from 'stream';

export type Protocol = 'ftp' | 'ftps' | 'sftp';

export interface ConnectionConfig {
    host: string;
    port?: number;
    user: string;
    password?: string;
    secure?: boolean | 'implicit'; // for FTP
    protocol: Protocol;
}

interface ActiveConnection {
    id: string;
    protocol: Protocol;
    client: ftp.Client | Client;
    lastActive: number;
}

class FtpService {
    private connections: Map<string, ActiveConnection> = new Map();

    // Cleanup inactive connections every 5 minutes
    constructor() {
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    private cleanup() {
        const now = Date.now();
        for (const [id, conn] of this.connections) {
            if (now - conn.lastActive > 10 * 60 * 1000) { // 10 min timeout
                this.disconnect(id);
            }
        }
    }

    async connect(config: ConnectionConfig): Promise<{ connectionId: string }> {
        const connectionId = uuidv4();
        let client: ftp.Client | Client;

        try {
            if (config.protocol === 'sftp') {
                client = new Client();
                await client.connect({
                    host: config.host,
                    port: config.port || 22,
                    username: config.user,
                    password: config.password,
                });
            } else {
                client = new ftp.Client();
                // client.ftp.verbose = true;
                await client.access({
                    host: config.host,
                    port: config.port || 21,
                    user: config.user,
                    password: config.password,
                    secure: config.protocol === 'ftps' ? true : (config.secure === 'implicit' ? 'implicit' : false),
                    secureOptions: { rejectUnauthorized: false } // Often needed for self-signed certs
                });
            }

            this.connections.set(connectionId, {
                id: connectionId,
                protocol: config.protocol,
                client,
                lastActive: Date.now(),
            });

            return { connectionId };
        } catch (error) {
            console.error('Connection failed:', error);
            throw new Error('Failed to connect to server: ' + (error instanceof Error ? error.message : String(error)));
        }
    }

    async list(connectionId: string, path: string = '/') {
        const conn = this.getConnection(connectionId);
        conn.lastActive = Date.now();

        try {
            if (conn.protocol === 'sftp') {
                const sftp = conn.client as Client;
                const list = await sftp.list(path);
                return list.map(item => ({
                    name: item.name,
                    type: item.type === '-' ? 'file' : 'directory',
                    size: item.size,
                    modifyTime: item.modifyTime,
                    rights: item.rights,
                }));
            } else {
                const ftpClient = conn.client as ftp.Client;
                const list = await ftpClient.list(path);
                return list.map(item => ({
                    name: item.name,
                    type: item.isDirectory ? 'directory' : 'file',
                    size: item.size,
                    modifyTime: item.modifiedAt ? item.modifiedAt.getTime() : 0,
                    rights: null, // Basic FTP might not give detailed rights easily in list
                }));
            }
        } catch (error) {
            throw new Error('Failed to list directory: ' + (error instanceof Error ? error.message : String(error)));
        }
    }

    async getStream(connectionId: string, path: string): Promise<Readable> {
        const conn = this.getConnection(connectionId);
        conn.lastActive = Date.now();

        if (conn.protocol === 'sftp') {
            const sftp = conn.client as Client;
            // sftp.get returns a Readable stream if no dst is provided, but types might say otherwise.
            // The library supports returning a stream.
            return sftp.get(path) as unknown as Readable;
        } else {
            const ftpClient = conn.client as ftp.Client;
            // basic-ftp downloadTo returns a Promise, but we need a stream.
            // We can use downloadTo(WritableStream). 
            // But we want a ReadableStream to pipe to Express response.
            // Actually, basic-ftp doesn't easily give a Readable stream directly without a PassThrough.
            // We should create a PassThrough stream.
            const { PassThrough } = await import('stream');
            const pt = new PassThrough();

            // We don't await here because we want to return the stream immediately.
            // But we need to handle errors.
            ftpClient.downloadTo(pt, path).catch(err => {
                console.error('FTP Download Error:', err);
                pt.emit('error', err);
            });

            return pt;
        }
    }

    async uploadStream(connectionId: string, path: string, stream: Readable): Promise<void> {
        const conn = this.getConnection(connectionId);
        conn.lastActive = Date.now();

        if (conn.protocol === 'sftp') {
            const sftp = conn.client as Client;
            await sftp.put(stream, path);
        } else {
            const ftpClient = conn.client as ftp.Client;
            await ftpClient.uploadFrom(stream, path);
        }
    }

    async disconnect(connectionId: string) {
        const conn = this.connections.get(connectionId);
        if (conn) {
            if (conn.protocol === 'sftp') {
                await (conn.client as Client).end();
            } else {
                (conn.client as ftp.Client).close();
            }
            this.connections.delete(connectionId);
        }
    }

    private getConnection(connectionId: string): ActiveConnection {
        const conn = this.connections.get(connectionId);
        if (!conn) {
            throw new Error('Connection not found or expired. Please reconnect.');
        }
        return conn;
    }
}

export const ftpService = new FtpService();
