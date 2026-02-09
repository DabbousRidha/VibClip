import { useCallback } from 'react';
import type { AppActions } from '../agent/types';
import type { AnimationConfig, Asset, VibClipError } from '../types';

// This hook doesn't create state, it just bundles existing setters into the Bridge interface
export function useAppActions(
    config: AnimationConfig,
    setConfig: React.Dispatch<React.SetStateAction<AnimationConfig>>,
    assets: Asset[],
    assetActions: {
        addAsset: (a: any) => Asset[],
        updateAsset: (id: string, u: any) => void,
        removeAsset: (id: string) => void
    },
    playback: {
        setIsPlaying: (p: boolean) => void,
        setCurrentTime: (t: number) => void
    },
    setGuiValues: React.Dispatch<React.SetStateAction<Record<string, any>>>,
    errorActions: {
        errors: VibClipError[],
        reportError: (e: Omit<VibClipError, 'id' | 'timestamp'>) => void,
        clearErrors: (source?: VibClipError['source']) => void
    }
): AppActions {

    // We wrap these in useCallback to ensure stability, though the raw setters are usually stable
    const getConfig = useCallback(() => config, [config]);

    const updateConfig = useCallback((updates: Partial<AnimationConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, [setConfig]);

    const getAssets = useCallback(() => assets, [assets]);

    const updateScript = useCallback((id: string, content: string) => {
        assetActions.updateAsset(id, { content });
    }, [assetActions]);

    const updateGuiValues = useCallback((updates: Record<string, any>) => {
        setGuiValues(prev => ({ ...prev, ...updates }));
    }, [setGuiValues]);

    const getErrors = useCallback(() => errorActions.errors, [errorActions.errors]);

    return {
        getConfig,
        updateConfig,
        setIsPlaying: playback.setIsPlaying,
        setCurrentTime: playback.setCurrentTime,
        getAssets,
        addAsset: assetActions.addAsset,
        updateAsset: assetActions.updateAsset,
        removeAsset: assetActions.removeAsset,
        updateScript,
        updateGuiValues,
        getErrors,
        reportError: errorActions.reportError,
        clearErrors: errorActions.clearErrors
    };
}
