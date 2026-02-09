import { useState } from 'react';
import type { AnimationConfig, Asset } from '../types';

// Engine
import { exportStandard } from './useExport/engines/standard';

export function useExport(
    setCurrentTime: (t: number) => void,
    getAudioContext: () => AudioContext
) {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleExportStandard = async (
        canvas: HTMLCanvasElement,
        config: AnimationConfig,
        assets: Asset[],
        analysers: Map<string, { analyser: AnalyserNode, gainNode: GainNode, dataArray: Uint8Array }>
    ) => {
        await exportStandard({
            canvas, config, assets, analysers,
            getAudioContext, setCurrentTime, setProgress, setIsExporting
        });
    };

    return {
        isExporting,
        progress,
        exportStandard: handleExportStandard
    };
}
