
import type { AnimationConfig, Asset, VibClipError } from '../types';
import type { FunctionDeclaration, Part } from '@google/generative-ai';

// The interface for the "Bridge" that connects the Agent to the App's internal state
export interface AppActions {
    // Global
    getConfig: () => AnimationConfig;
    updateConfig: (updates: Partial<AnimationConfig>) => void;

    // Playback
    setIsPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;

    // Assets
    getAssets: () => Asset[];
    addAsset: (asset: Omit<Asset, 'id' | 'enabled' | 'analysis'>) => Asset[];
    updateAsset: (id: string, updates: Partial<Asset>) => void;
    removeAsset: (id: string) => void;

    // Scripting
    updateScript: (id: string, content: string) => void;

    // GUI
    updateGuiValues: (updates: Record<string, any>) => void;

    // Errors
    getErrors: () => VibClipError[];
    reportError: (error: Omit<VibClipError, 'id' | 'timestamp'>) => void;
    clearErrors: (source?: VibClipError['source']) => void;
}

// Low-level types for the LLM Function Calling API
export type AgentTool = FunctionDeclaration;

export interface AgentMessage {
    role: 'user' | 'model' | 'function';
    content?: string;
    parts: Part[];
}
