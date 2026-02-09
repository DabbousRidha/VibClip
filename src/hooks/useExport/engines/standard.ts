import type { AnimationConfig, Asset } from '../../../types';

export interface StandardExportOptions {
    canvas: HTMLCanvasElement;
    config: AnimationConfig;
    assets: Asset[];
    analysers: Map<string, { analyser: AnalyserNode, gainNode: GainNode, dataArray: Uint8Array }>;
    getAudioContext: () => AudioContext;
    setCurrentTime: (t: number) => void;
    setProgress: (p: number) => void;
    setIsExporting: (v: boolean) => void;
}

export const exportStandard = async (options: StandardExportOptions) => {
    const { canvas, config, assets, analysers, getAudioContext, setCurrentTime, setProgress, setIsExporting } = options;

    setIsExporting(true);
    setProgress(0);

    const startTimePerf = performance.now();
    console.log(`🎥 [Standard] Export Started (Realtime Capture)`);
    console.log(`   Config: ${config.width}x${config.height} @ ${config.fps}fps, ${config.duration}s`);

    const audioCtx = getAudioContext();
    await audioCtx.resume();
    const dest = audioCtx.createMediaStreamDestination();
    let hasAudio = false;

    const activeSources: AudioBufferSourceNode[] = [];

    assets.forEach(asset => {
        if (!asset.enabled) return;

        if ((asset.type === 'audio' || asset.type === 'video') && asset.audioBuffer && !asset.muted) {
            const source = audioCtx.createBufferSource();
            source.buffer = asset.audioBuffer;
            source.playbackRate.value = asset.playbackRate ?? 1;
            source.loop = asset.loop ?? false;

            const gainNode = audioCtx.createGain();
            gainNode.gain.value = asset.volume ?? 1;

            const pannerNode = audioCtx.createStereoPanner();
            pannerNode.pan.value = asset.pan ?? 0;

            // Chain: Source -> Panner -> Gain -> Dest
            source.connect(pannerNode);
            pannerNode.connect(gainNode);
            gainNode.connect(dest);

            const audioData = analysers.get(asset.id);
            if (audioData) {
                // Also route to analyser for reactive animations during export if needed
                gainNode.connect(audioData.analyser);
            }

            const startTimeOffset = asset.startOffset ?? 0;
            if (startTimeOffset > 0) {
                source.start(audioCtx.currentTime + startTimeOffset);
            } else {
                const adjOffset = Math.abs(startTimeOffset);
                source.start(0, adjOffset);
            }

            activeSources.push(source);
            hasAudio = true;
        }

        if (asset.element instanceof HTMLMediaElement && asset.type === 'video') {
            const initialOffset = Math.max(0, -(asset.startOffset ?? 0));
            asset.element.currentTime = initialOffset;
        }
    });

    if (hasAudio) {
        console.log(`   Audio routing active for ${activeSources.length} sources.`);
    }

    return new Promise<void>((resolve) => {
        setCurrentTime(0);

        const canvasStream = canvas.captureStream(config.fps);
        const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
        if (hasAudio) {
            tracks.push(...dest.stream.getAudioTracks());
        }

        const combinedStream = new MediaStream(tracks);
        const recorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp9',
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
            console.log('   Recording stopped. Finalizing...');
            const blob = new Blob(chunks, { type: 'video/webm' });

            console.log(`💾 Saving output file (${(blob.size / 1024 / 1024).toFixed(2)} MB)...`);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animation.webm';
            a.click();

            assets.forEach(asset => {
                if (asset.element instanceof HTMLMediaElement) {
                    asset.element.muted = false;
                }
            });
            activeSources.forEach(s => { try { s.stop(); s.disconnect(); } catch (e) { } });

            const totalTime = (performance.now() - startTimePerf) / 1000;
            console.log(`✅ [Standard] Export Success! Total realtime duration: ${totalTime.toFixed(2)}s`);

            setIsExporting(false);
            setProgress(0);
            resolve();
        };

        console.log('🔴 [Standard] Recording started...');
        recorder.start();

        const startTime = Date.now();
        const frameMs = 1000 / config.fps;
        let lastLogPercent = 0;

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const p = Math.min(1, elapsed / config.duration);
            const percent = Math.round(p * 100);

            setCurrentTime(p * config.duration);
            setProgress(percent);

            if (percent >= lastLogPercent + 10) {
                console.log(`   Progress: ${percent}% (${elapsed.toFixed(1)}s / ${config.duration}s)`);
                lastLogPercent = percent;
            }

            if (elapsed >= config.duration) {
                clearInterval(interval);
                // add a small buffer to ensure last frame is captured
                setTimeout(() => {
                    recorder.stop();
                }, 500);
            }
        }, frameMs);
    });
};
