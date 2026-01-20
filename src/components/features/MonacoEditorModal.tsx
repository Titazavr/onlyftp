'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { useFtpStore } from '@/store/useFtpStore';

interface MonacoEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    filePath: string;
}

export default function MonacoEditorModal({ isOpen, onClose, fileName, filePath }: MonacoEditorModalProps) {
    const { connectionId } = useFtpStore();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && connectionId && filePath) {
            loadFile();
        }
    }, [isOpen, connectionId, filePath]);

    const loadFile = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/ftp/download?connectionId=${connectionId}&path=${encodeURIComponent(filePath)}`);
            const text = await res.text();
            setContent(text);
        } catch (error) {
            console.error('Failed to load file', error);
            setContent('Error loading file content.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!connectionId) return;
        setIsSaving(true);
        try {
            // Create a blob from content
            const blob = new Blob([content], { type: 'text/plain' });
            const formData = new FormData();
            formData.append('file', blob, fileName);

            // Upload to the same path (overwrite)
            // Note: filePath includes filename, but upload endpoint appends filename to path if it's a directory.
            // If filePath is full path to file, we should pass parent directory to upload, OR handle full path in upload.
            // My upload implementation: `targetPath = (uploadPath as string ? `${uploadPath}/${filename}` : filename)`
            // So if I pass parent dir as path, it works.

            const parentDir = filePath.substring(0, filePath.lastIndexOf('/')) || '/';

            await fetch(`/api/ftp/upload?connectionId=${connectionId}&path=${encodeURIComponent(parentDir)}`, {
                method: 'POST',
                body: formData,
            });

            onClose();
        } catch (error) {
            console.error('Failed to save', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editing: {fileName}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 border rounded-md overflow-hidden min-h-0 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Editor
                            height="100%"
                            defaultLanguage="javascript" // Auto-detect would be better but simple for now
                            theme="vs-dark"
                            value={content}
                            onChange={(value: string | undefined) => setContent(value || '')}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                            }}
                        />
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
