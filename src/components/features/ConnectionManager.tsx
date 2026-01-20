'use client';

import React, { useState } from 'react';
import { useFtpStore } from '@/store/useFtpStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // We need Card component, I'll assume standard shadcn structure or just use divs if I didn't create it. I'll use divs for now to be safe or create Card.
import { Label } from '@/components/ui/label'; // Need Label
import { Loader2 } from 'lucide-react';

export default function ConnectionManager() {
    const { setConnectionId, setIsConnected, setIsLoading, isLoading } = useFtpStore();
    const [formData, setFormData] = useState({
        host: 'localhost',
        port: '21',
        user: 'anonymous',
        password: '',
        protocol: 'ftp',
    });
    const [error, setError] = useState('');

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/ftp/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Connection failed');
            }

            setConnectionId(data.connectionId);
            setIsConnected(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-card text-card-foreground rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">New Connection</h2>
            <form onSubmit={handleConnect} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Protocol</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.protocol}
                            onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                        >
                            <option value="ftp">FTP</option>
                            <option value="ftps">FTPS (Explicit)</option>
                            <option value="sftp">SFTP (SSH)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Port</label>
                        <Input
                            type="number"
                            value={formData.port}
                            onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Host</label>
                    <Input
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        placeholder="ftp.example.com"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                            value={formData.user}
                            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                            placeholder="user"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect
                </Button>
            </form>
        </div>
    );
}
