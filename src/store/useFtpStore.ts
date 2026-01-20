import { create } from 'zustand';

interface FileItem {
    name: string;
    type: 'file' | 'directory';
    size: number;
    modifyTime: number;
    rights?: any;
}

interface FtpState {
    connectionId: string | null;
    currentPath: string;
    files: FileItem[];
    isConnected: boolean;
    isLoading: boolean;

    setConnectionId: (id: string) => void;
    setCurrentPath: (path: string) => void;
    setFiles: (files: FileItem[]) => void;
    setIsConnected: (status: boolean) => void;
    setIsLoading: (status: boolean) => void;
}

export const useFtpStore = create<FtpState>((set) => ({
    connectionId: null,
    currentPath: '/',
    files: [],
    isConnected: false,
    isLoading: false,

    setConnectionId: (id) => set({ connectionId: id }),
    setCurrentPath: (path) => set({ currentPath: path }),
    setFiles: (files) => set({ files }),
    setIsConnected: (status) => set({ isConnected: status }),
    setIsLoading: (status) => set({ isLoading: status }),
}));
