import { useState, useCallback } from 'react';
import type { Asset } from '../types';
import { parseScriptMetadata } from '../utils/scriptParsers';

export function useAssets(initialCode: string) {
    const [assets, setAssets] = useState<Asset[]>([
        {
            id: 'default_script',
            name: 'main_animation',
            type: 'script',
            content: initialCode,
            enabled: true,
            muted: false,
            url: '',
            element: null,
            metadata: {
                mimeType: 'text/javascript',
                ...parseScriptMetadata(initialCode)
            }
        }
    ]);

    const addAsset = useCallback((newAssets: Omit<Asset, 'id' | 'enabled' | 'analysis'> | Omit<Asset, 'id' | 'enabled' | 'analysis'>[]) => {
        const assetsArray = Array.isArray(newAssets) ? newAssets : [newAssets];
        const assetsWithIds = assetsArray.map(asset => ({
            playbackRate: 1,
            volume: 1,
            loop: false,
            pan: 0,
            startOffset: 0,
            ...asset,
            id: Math.random().toString(36).substr(2, 9),
            enabled: true,
            visible: true,
            x: 0, // Will be centered in render loop if not specified, or just set to 0 and handled
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            fit: 'contain',
            flipX: false,
            flipY: false,
            blendMode: 'source-over'
        } as Asset));
        setAssets(prev => [...prev, ...assetsWithIds]);
        return assetsWithIds;
    }, []);


    const removeAsset = useCallback((id: string) => {
        setAssets(prev => prev.filter(a => a.id !== id));
    }, []);

    const toggleAsset = useCallback((id: string) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    }, []);

    const toggleMute = useCallback((id: string) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, muted: !a.muted } : a));
    }, []);

    const renameAsset = useCallback((id: string, name: string) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, name } : a));
    }, []);

    const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }, []);

    const reorderAssets = useCallback((from: number, to: number) => {
        setAssets(prev => {
            const next = [...prev];
            const [removed] = next.splice(from, 1);
            next.splice(to, 0, removed);
            return next;
        });
    }, []);

    return {
        assets,
        addAsset,
        removeAsset,
        toggleAsset,
        toggleMute,
        renameAsset,
        updateAsset,
        reorderAssets
    };
}
