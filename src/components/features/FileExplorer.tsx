'use client';

import React, { useEffect, useCallback } from 'react';
import { useFtpStore } from '@/store/useFtpStore';
import { useDropzone } from 'react-dropzone';
import { Folder, File, Download, Upload, ArrowUp, RefreshCw, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MonacoEditorModal from './MonacoEditorModal';

export default function FileExplorer() {
    const { connectionId, currentPath, files, setFiles, setCurrentPath, isLoading, setIsLoading } = useFtpStore();
    const [editingFile, setEditingFile] = React.useState<{ name: string, path: string } | null>(null);

    const fetchFiles = useCallback(async (path: string) => {
        if (!connectionId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/ftp/list?connectionId=${connectionId}&path=${encodeURIComponent(path)}`);
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
                setCurrentPath(path);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [connectionId, setFiles, setCurrentPath, setIsLoading]);

    useEffect(() => {
        if (connectionId) {
            fetchFiles(currentPath);
        }
    }, [connectionId, fetchFiles]);

    const handleNavigate = (name: string) => {
        const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        fetchFiles(newPath);
    };

    const handleUp = () => {
        if (currentPath === '/') return;
        const parts = currentPath.split('/');
        parts.pop();
        const newPath = parts.join('/') || '/';
        fetchFiles(newPath);
    };

    const handleDownload = (name: string) => {
        const path = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        window.open(`/api/ftp/download?connectionId=${connectionId}&path=${encodeURIComponent(path)}`, '_blank');
    };

    const handleEdit = (name: string) => {
        const path = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        setEditingFile({ name, path });
    };

    // Upload Logic
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!connectionId) return;

        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                await fetch(`/api/ftp/upload?connectionId=${connectionId}&path=${encodeURIComponent(currentPath)}`, {
                    method: 'POST',
                    body: formData,
                });
                fetchFiles(currentPath);
            } catch (err) {
                console.error('Upload failed', err);
            }
        }
    }, [connectionId, currentPath, fetchFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

    return (
        <div className="flex flex-col h-full" {...getRootProps()}>
            <input {...getInputProps()} />

            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
                <Button variant="ghost" size="icon" onClick={handleUp} disabled={currentPath === '/'}>
                    <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => fetchFiles(currentPath)}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
                <div className="flex-1 px-2 font-mono text-sm truncate bg-background border rounded py-1">
                    {currentPath}
                </div>
                <div className="flex items-center gap-2">
                    <LabelButton />
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto p-2">
                {isDragActive && (
                    <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary z-50 flex items-center justify-center">
                        <p className="text-lg font-bold text-primary">Drop files to upload</p>
                    </div>
                )}

                <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                        <tr>
                            <th className="pb-2 pl-2">Name</th>
                            <th className="pb-2">Size</th>
                            <th className="pb-2">Modified</th>
                            <th className="pb-2 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, i) => (
                            <tr
                                key={i}
                                className="hover:bg-muted/50 transition-colors cursor-pointer group"
                                onDoubleClick={() => file.type === 'directory' ? handleNavigate(file.name) : handleEdit(file.name)}
                            >
                                <td className="py-2 pl-2 flex items-center gap-2">
                                    {file.type === 'directory' ? (
                                        <Folder className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                                    ) : (
                                        <File className="h-4 w-4 text-gray-500" />
                                    )}
                                    {file.name}
                                </td>
                                <td className="py-2 text-muted-foreground">
                                    {file.type === 'directory' ? '-' : formatBytes(file.size)}
                                </td>
                                <td className="py-2 text-muted-foreground">
                                    {new Date(file.modifyTime).toLocaleDateString()}
                                </td>
                                <td className="py-2 text-right pr-2 flex justify-end gap-1">
                                    {file.type === 'file' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(file.name); }}
                                            >
                                                <FileCode className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }}
                                            >
                                                <Download className="h-3 w-3" />
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {files.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Empty directory
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingFile && (
                <MonacoEditorModal
                    isOpen={!!editingFile}
                    onClose={() => setEditingFile(null)}
                    fileName={editingFile.name}
                    filePath={editingFile.path}
                />
            )}
        </div>
    );
}

function LabelButton() {
    return (
        <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
        </Button>
    )
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
