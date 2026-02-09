import React, { useEffect, useState, useRef } from 'react';
import type { AnimationConfig, Asset, InteractionState, CinematicState, GuiControl, VibClipError } from '../types';
import { getAnimationContext, autoRenderPass } from '../utils/contextUtils';

interface Props {
    config: AnimationConfig;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    assets: Asset[];
    isPlaying: boolean;
    currentTime: number;
    isExporting: boolean;
    onRegisterControls?: (controls: GuiControl[]) => void;
    guiValues: Record<string, any>;
    analysers: Map<string, { analyser: AnalyserNode, pannerNode: StereoPannerNode, gainNode: GainNode, dataArray: Uint8Array, timeDataArray: Uint8Array }>;
    reportError: (err: Omit<VibClipError, 'id' | 'timestamp'>) => void;
    clearErrors: (source?: VibClipError['source']) => void;
}

const Preview: React.FC<Props> = ({ config, canvasRef, assets, isPlaying, currentTime, isExporting, onRegisterControls, guiValues, analysers, reportError, clearErrors }) => {
    const [localError, setLocalError] = useState<string | null>(null);

    // Compiled Scripts Cache
    const scriptFnsRef = useRef<Map<string, Function>>(new Map());

    // Compile Scripts
    useEffect(() => {
        const newFns = new Map<string, Function>();
        let hasError = false;

        assets.forEach(asset => {
            if (asset.type === 'script' && asset.content) {
                try {
                    const fn = new Function('context', asset.content);
                    newFns.set(asset.id, fn);
                } catch (e: any) {
                    const msg = `Syntax error in "${asset.name}": ${e.message}`;
                    setLocalError(msg);
                    reportError({ source: 'runtime', message: msg, assetId: asset.id });
                    hasError = true;
                }
            }
        });

        if (!hasError) {
            setLocalError(null);
            clearErrors('runtime');
        }
        scriptFnsRef.current = newFns;

        // Reset cinematic state if needed, or just keep it persistent
        // For multi-script, maybe we reset if NO scripts exist? 
        // Let's keep existing behavior of persistent state for now.
    }, [assets]); // Re-compile when assets (content) change

    // Interaction State
    const [interaction, setInteraction] = useState<InteractionState>({
        mouse: { x: 0, y: 0, down: false },
        pointer: { x: 0, y: 0, velocityX: 0, velocityY: 0 }
    });
    const lastPosRef = useRef({ x: 0, y: 0, time: 0 });

    // Frame Buffer & Delta Time
    const lastTimeRef = useRef(currentTime);

    // Cinematic State Persistence
    const cinematicStateRef = useRef<CinematicState>({
        camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
        physics: {},
        particles: [],
        guiValues: {}
    });

    // Feedback Buffer (GPU-side)
    const feedbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const feedbackCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMove = (e: MouseEvent | PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (config.width / rect.width);
            const y = (e.clientY - rect.top) * (config.height / rect.height);

            setInteraction(prev => {
                const now = performance.now();
                const dt = (now - lastPosRef.current.time) / 1000;
                const vx = dt > 0 ? (x - lastPosRef.current.x) / dt : 0;
                const vy = dt > 0 ? (y - lastPosRef.current.y) / dt : 0;

                lastPosRef.current = { x, y, time: now };

                return {
                    mouse: { ...prev.mouse, x, y },
                    pointer: { x, y, velocityX: vx, velocityY: vy }
                };
            });
        };

        const handleDown = () => setInteraction(prev => ({ ...prev, mouse: { ...prev.mouse, down: true } }));
        const handleUp = () => setInteraction(prev => ({ ...prev, mouse: { ...prev.mouse, down: false } }));

        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('mousedown', handleDown);
        window.addEventListener('mouseup', handleUp);

        return () => {
            canvas.removeEventListener('mousemove', handleMove);
            canvas.removeEventListener('mousedown', handleDown);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [config.width, config.height]);

    // Audio Playback Management for Pure Web Audio
    const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
    const lastPlaybackTimeRef = useRef(currentTime);
    const playbackAssetsRef = useRef(assets);
    playbackAssetsRef.current = assets;

    // Start/Stop Audio based on play state
    useEffect(() => {
        const stopAll = () => {
            activeSourcesRef.current.forEach(s => { try { s.stop(); } catch { } });
            activeSourcesRef.current.clear();
        };

        const startAll = (timeOffset: number) => {
            stopAll();
            playbackAssetsRef.current.forEach(asset => {
                if (asset.type === 'audio' && asset.audioBuffer && !asset.muted && asset.enabled) {
                    const audioData = analysers.get(asset.id);
                    if (audioData) {
                        const { analyser } = audioData;
                        const ctx = analyser.context as AudioContext;
                        const source = ctx.createBufferSource();
                        source.buffer = asset.audioBuffer;
                        source.loop = asset.loop ?? false;
                        source.playbackRate.value = asset.playbackRate ?? 1;
                        source.connect(analyser);

                        const adjTime = timeOffset - (asset.startOffset ?? 0);
                        if (adjTime >= 0) {
                            if (asset.loop || adjTime < asset.audioBuffer.duration) {
                                const offset = asset.loop ? (adjTime % asset.audioBuffer.duration) : adjTime;
                                source.start(0, offset);
                                activeSourcesRef.current.set(asset.id, source);
                            }
                        }
                    }
                }
            });
        };

        if (isPlaying && !isExporting) {
            if (activeSourcesRef.current.size === 0) {
                startAll(currentTime);
            }
        } else {
            stopAll();
        }

        return stopAll;
    }, [isPlaying, isExporting, assets, analysers]);

    // Detect Jumps (Seeking) - separately from lifecycle
    useEffect(() => {
        if (isPlaying && !isExporting) {
            const jumped = Math.abs(currentTime - lastPlaybackTimeRef.current) > 0.3;

            // 1. Update playbackRate for already running sources
            activeSourcesRef.current.forEach((source, id) => {
                const asset = assets.find(a => a.id === id);
                if (asset && asset.type === 'audio') {
                    const targetRate = asset.playbackRate ?? 1;
                    if (source.playbackRate.value !== targetRate) {
                        source.playbackRate.setTargetAtTime(targetRate, source.context.currentTime, 0.05);
                    }
                }
            });

            if (jumped) {
                // Restart all from new time
                const active = activeSourcesRef.current;
                active.forEach(s => { try { s.stop(); } catch { } });
                active.clear();

                assets.forEach(asset => {
                    if (asset.type === 'audio' && asset.audioBuffer && !asset.muted && asset.enabled) {
                        const audioData = analysers.get(asset.id);
                        if (audioData) {
                            const { analyser } = audioData;
                            const ctx = analyser.context as AudioContext;
                            const source = ctx.createBufferSource();
                            source.buffer = asset.audioBuffer;
                            source.loop = asset.loop ?? false;
                            source.playbackRate.value = asset.playbackRate ?? 1;
                            source.connect(analyser);

                            const adjTime = currentTime - (asset.startOffset ?? 0);
                            if (adjTime >= 0) {
                                // If loop is off, only play if we haven't reached the end
                                if (asset.loop || adjTime < asset.audioBuffer.duration) {
                                    const offset = asset.loop ? (adjTime % asset.audioBuffer.duration) : adjTime;
                                    source.start(0, offset);
                                    active.set(asset.id, source);
                                }
                            }
                        }
                    }
                });
            } else {
                // Check for assets that should start playing but aren't in activeSources
                assets.forEach(asset => {
                    if (asset.type === 'audio' && asset.audioBuffer && !asset.muted && asset.enabled && !activeSourcesRef.current.has(asset.id)) {
                        const adjTime = currentTime - (asset.startOffset ?? 0);
                        if (adjTime >= 0 && (asset.loop || adjTime < asset.audioBuffer.duration)) {
                            // Start it!
                            const audioData = analysers.get(asset.id);
                            if (audioData) {
                                const { analyser } = audioData;
                                const ctx = analyser.context as AudioContext;
                                const source = ctx.createBufferSource();
                                source.buffer = asset.audioBuffer;
                                source.loop = asset.loop ?? false;
                                source.playbackRate.value = asset.playbackRate ?? 1;
                                source.connect(analyser);

                                const offset = asset.loop ? (adjTime % asset.audioBuffer.duration) : adjTime;
                                source.start(0, offset);
                                activeSourcesRef.current.set(asset.id, source);
                            }
                        }
                    }
                });
            }
        } else if (!isPlaying) {
            // Stop everything when paused
            activeSourcesRef.current.forEach(s => { try { s.stop(); } catch { } });
            activeSourcesRef.current.clear();
        }
        lastPlaybackTimeRef.current = currentTime;
    }, [currentTime, isPlaying, isExporting, assets, analysers]);

    // Initialize Feedback Canvas
    useEffect(() => {
        if (!feedbackCanvasRef.current) {
            feedbackCanvasRef.current = document.createElement('canvas');
            feedbackCanvasRef.current.width = config.width;
            feedbackCanvasRef.current.height = config.height;
            feedbackCtxRef.current = feedbackCanvasRef.current.getContext('2d', { willReadFrequently: true });
        } else {
            feedbackCanvasRef.current.width = config.width;
            feedbackCanvasRef.current.height = config.height;
        }
    }, [config.width, config.height]);

    // Main Render Logic - triggered by currentTime change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvasRef.current) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const time = currentTime;
        const frame = Math.floor(time * config.fps);
        const assetMap: Record<string, any> = {};

        // 1. Sync & Analyze Assets
        assets.forEach(asset => {
            const el = asset.element;
            const audioData = analysers.get(asset.id);

            // 1. Handle Playback & Sync
            if (el instanceof HTMLMediaElement && asset.type === 'video') {
                const adjTime = (time - (asset.startOffset ?? 0)) * (asset.playbackRate ?? 1);
                const clampedTime = Math.max(0, adjTime);

                if (Math.abs(el.currentTime - clampedTime) > 0.1) {
                    el.currentTime = clampedTime;
                }

                if (!isExporting) {
                    el.playbackRate = asset.playbackRate ?? 1;
                    el.loop = asset.loop ?? false;
                    el.preservesPitch = asset.preservePitch ?? true;

                    // Only play if enabled AND isPlaying AND within time window
                    const inWindow = adjTime >= 0 && (asset.loop || adjTime <= (asset.metadata.duration ?? 99999));
                    const shouldPlay = isPlaying && asset.enabled && inWindow;

                    if (shouldPlay && el.paused) {
                        el.play().catch(() => { });
                    } else if (!shouldPlay && !el.paused) {
                        el.pause();
                    }
                }
            } else if (el instanceof HTMLMediaElement && asset.type === 'audio') {
                if (!asset.enabled && !el.paused) el.pause();
                // Audio is handled by WebAudio/AudioBufferSourceNode
            }

            // 2. Handle Audio Gain & Pan (Always run for all analysers)
            if (audioData) {
                const { analyser, pannerNode, gainNode } = audioData;
                // Mute if: Not Enabled OR Muted (for video)
                const isMuted = !asset.enabled || !!asset.muted;
                const targetVolume = isMuted ? 0 : (asset.volume ?? 1);
                gainNode.gain.setTargetAtTime(targetVolume, analyser.context.currentTime, 0.01);

                if (pannerNode) {
                    pannerNode.pan.setTargetAtTime(asset.pan ?? 0, analyser.context.currentTime, 0.01);
                }

                // Only perform analysis for enabled items to save CPU
                if (asset.enabled) {
                    const { dataArray, timeDataArray } = audioData;
                    analyser.getByteTimeDomainData(timeDataArray as any);
                    analyser.getByteFrequencyData(dataArray as any);

                    const getAverage = (start: number, end: number) => {
                        let sum = 0;
                        const len = dataArray.length;
                        const s = Math.floor(start * len);
                        const e = Math.floor(end * len);
                        for (let i = s; i < e; i++) sum += dataArray[i];
                        return (sum / (e - s)) / 255;
                    };

                    const analysis = {
                        get volume() { return getAverage(0, 1); },
                        get bass() { return getAverage(0, 0.1); },
                        get mid() { return getAverage(0.1, 0.5); },
                        get treble() { return getAverage(0.5, 1); },
                        get spectrum() {
                            return Array.from(dataArray).map(v => v / 255);
                        },
                        get waveform() {
                            return Array.from(timeDataArray).map(v => (v - 128) / 128);
                        }
                    };

                    if (el) {
                        // Attach properties to the element for easier access in scripts
                        // while maintaining drawImage compatibility
                        (el as any).asset = asset;
                        (el as any).analysis = analysis;
                        (el as any).metadata = asset.metadata;
                        (el as any).type = asset.type;

                        // Safety check for native setters
                        const rate = asset.playbackRate ?? 1;
                        const vol = asset.volume ?? 1;
                        if (Number.isFinite(rate)) (el as any).playbackRate = rate;
                        if (Number.isFinite(vol)) (el as any).volume = vol;

                        (el as any).loop = !!asset.loop;
                        (el as any).startOffset = asset.startOffset ?? 0;
                        (el as any).pan = asset.pan ?? 0;

                        assetMap[asset.name] = el;
                    }
                }
            } else if (asset.enabled && asset.element) {
                const el = asset.element;
                // Attach properties to the element
                (el as any).asset = asset;
                (el as any).metadata = asset.metadata;
                (el as any).type = asset.type;

                // Safety check for native setters
                const rate = asset.playbackRate ?? 1;
                const vol = asset.volume ?? 1;
                if (Number.isFinite(rate)) (el as any).playbackRate = rate;
                if (Number.isFinite(vol)) (el as any).volume = vol;

                (el as any).loop = !!asset.loop;
                (el as any).startOffset = asset.startOffset ?? 0;
                (el as any).pan = asset.pan ?? 0;

                assetMap[asset.name] = el;
            }
        });

        // 2. Sync GUI Values from React to Animated State
        cinematicStateRef.current.guiValues = guiValues;

        // 3. Clear & Render
        const deltaTime = currentTime - lastTimeRef.current;
        // Check local error before clearing
        if (localError) {
            // We only clear if we successfully execute a frame without re-throwing
        }
        if (config.backgroundMode !== 'transparent') {
            ctx.fillStyle = config.backgroundMode === 'custom' ? config.backgroundColor : config.backgroundMode;
            ctx.fillRect(0, 0, config.width, config.height);
        } else {
            ctx.clearRect(0, 0, config.width, config.height);
        }

        // 3.5 Auto-Render Pass (Base Layers)
        autoRenderPass(ctx, assets, assetMap, config, time);

        // Execute all active scripts
        try {
            const registeredControls: GuiControl[] = [];
            const animCtx = getAnimationContext(
                ctx, time, frame, config, assetMap, interaction, feedbackCanvasRef.current, deltaTime, cinematicStateRef.current,
                { alpha: config.backgroundMode === 'transparent', registeredControls }
            );

            ctx.save();
            assets.forEach(asset => {
                if (asset.type === 'script' && asset.enabled) {
                    const start = asset.startOffset || 0;
                    const duration = asset.metadata.duration || 9999;

                    // Check if within time window
                    if (time >= start && time < start + duration) {
                        const localTime = time - start;
                        const localProgress = duration > 0 ? localTime / duration : 0;

                        // Create a local context for this script
                        // We need to override time and progress, AND support metadata overrides
                        const metadata = asset.metadata || {};
                        const localAnimCtx = {
                            ...animCtx,
                            time: localTime,
                            progress: localProgress,
                            // Overrides
                            width: metadata.width || animCtx.width,
                            height: metadata.height || animCtx.height,
                            fps: metadata.fps || animCtx.fps,
                            duration: metadata.duration || animCtx.duration
                        };

                        const fn = scriptFnsRef.current.get(asset.id);
                        if (fn) {
                            ctx.save();
                            try {
                                // Apply asset-specific background if set
                                if (metadata.backgroundColor && metadata.backgroundMode === 'custom') {
                                    ctx.fillStyle = metadata.backgroundColor;
                                    ctx.fillRect(0, 0, localAnimCtx.width, localAnimCtx.height);
                                } else if (metadata.backgroundMode && metadata.backgroundMode !== 'transparent') {
                                    ctx.fillStyle = metadata.backgroundMode;
                                    ctx.fillRect(0, 0, localAnimCtx.width, localAnimCtx.height);
                                }

                                const result = fn(localAnimCtx);
                                // Support scripts that return a render function
                                if (typeof result === 'function') {
                                    result(localAnimCtx);
                                }
                            } catch (e: any) {
                                const msg = `Runtime error in "${asset.name}": ${e.message}`;
                                setLocalError(msg);
                                reportError({ source: 'runtime', message: msg, assetId: asset.id });
                            }
                            ctx.restore();
                        }
                    }
                }
            });

            ctx.restore();

            if (onRegisterControls && !isExporting) {
                onRegisterControls(registeredControls);
            }

            // Capture current frame for next iteration (GPU-side copy)
            if (feedbackCtxRef.current) {
                feedbackCtxRef.current.clearRect(0, 0, config.width, config.height);
                feedbackCtxRef.current.drawImage(canvas, 0, 0);
            }
        } catch (e: any) {
            setLocalError(e.message);
            reportError({ source: 'runtime', message: e.message });
        }
    }, [currentTime, isPlaying, config, assets]);

    return (
        <div className="preview-container" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto',
            background: 'rgba(0,0,0,0.2)',
            position: 'relative'
        }}>
            <div className="canvas-wrapper glass" style={{
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                borderRadius: '8px',
                overflow: 'hidden',
                background: config.backgroundMode === 'transparent' ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uInG7xA3q4VCVPA8K6KFTDPCOYyYDAMIKisAtvK7ChYBBkOAL9LAbV9Q3QvAAAAAElFTkSuQmCC")' : 'none'
            }}>
                <canvas
                    ref={canvasRef}
                    width={config.width}
                    height={config.height}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: 'block'
                    }}
                />
            </div>

            {localError && (
                <div className="error-overlay" style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backdropFilter: 'blur(4px)',
                    maxWidth: '80%',
                    textAlign: 'center',
                    zIndex: 100
                }}>
                    <b>Error:</b> {localError}
                </div>
            )}
        </div>
    );
};

export default Preview;
