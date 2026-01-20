'use client';

import { useFtpStore } from '@/store/useFtpStore';
import ConnectionManager from '@/components/features/ConnectionManager';
import FileExplorer from '@/components/features/FileExplorer';

export default function Home() {
    const { isConnected } = useFtpStore();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-dot-pattern">
            <div className="w-full max-w-6xl h-[80vh] bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <header className="p-4 border-b flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <h1 className="font-semibold text-sm text-muted-foreground">Web FTP Client</h1>
                    <div className="w-16" />
                </header>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {!isConnected ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                            <ConnectionManager />
                        </div>
                    ) : (
                        <FileExplorer />
                    )}
                </div>
            </div>
        </main>
    );
}
