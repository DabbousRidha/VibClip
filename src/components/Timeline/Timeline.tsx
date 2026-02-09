import React, { useRef, useState } from 'react';
import TimelineBlock from './TimelineBlock';
import PlaybackBar from '../PlaybackBar';
import type { Asset, AnimationConfig } from '../../types';

interface TimelineProps {
    assets: Asset[];
    config: AnimationConfig;
    currentTime: number;
    onSeek: (time: number) => void;
    onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
    onSelectAsset: (id: string) => void;
    onEditAsset: (id: string) => void;
    selectedAssetId: string | null;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
}

const Timeline: React.FC<TimelineProps> = ({ assets, config, currentTime, onSeek, onUpdateAsset, onSelectAsset, onEditAsset, selectedAssetId, isPlaying, setIsPlaying }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Simple layout: stack assets vertically for now to avoid overlaps? 
    // Or simple rigid channels. Let's do simple vertical stack.
    // Each asset gets its own row for simplicity in v1.

    // Calculate container width logic
    // If we want it responsive to available width:
    // Let's assume the container fills the width.
    const [containerWidth, setContainerWidth] = useState(1000);

    React.useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.clientWidth);

            const resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    setContainerWidth(entry.contentRect.width);
                }
            });
            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);


    const pixelsPerSecond = containerWidth / config.duration;

    const handleRulerClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * config.duration;
        onSeek(Math.max(0, Math.min(time, config.duration)));
    };

    const handleRulerMove = (e: React.MouseEvent) => {
        if (e.buttons === 1) { // dragging
            handleRulerClick(e);
        }
    }


    const playheadPosition = currentTime * pixelsPerSecond;

    return (
        <div
            className="timeline-container"
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'var(--panel-bg)',
                borderTop: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none'
            }}
        >
            {/* Integrated Playback Controls */}
            <div style={{
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '4px 0'
            }}>
                <PlaybackBar
                    config={config}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    currentTime={currentTime}
                    setCurrentTime={onSeek}
                />
            </div>
            {/* Time Ruler */}
            <div
                className="timeline-ruler"
                onMouseDown={handleRulerClick}
                onMouseMove={handleRulerMove}
                style={{
                    height: '28px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid var(--border-color)',
                    position: 'relative',
                    cursor: 'pointer'
                }}
            >
                {/* Playhead Indicator */}
                <div style={{
                    position: 'absolute',
                    left: `${playheadPosition}px`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    height: '100vh', // Extend down
                    background: 'var(--error)',
                    zIndex: 50,
                    pointerEvents: 'none',
                    boxShadow: '0 0 10px var(--error)'
                }} />

                {/* Time Markers */}
                {Array.from({ length: Math.ceil(config.duration) + 1 }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        left: `${i * pixelsPerSecond}px`,
                        top: 0,
                        bottom: 0,
                        borderLeft: '1px solid var(--border-color)',
                        paddingLeft: '6px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        pointerEvents: 'none',
                        fontFamily: 'var(--font-mono)',
                        lineHeight: '28px'
                    }}>
                        {i}s
                    </div>
                ))}
            </div>

            {/* Tracks Area */}
            <div className="timeline-tracks" style={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                padding: '10px 0'
            }}>
                {/* Background Grid Lines */}
                {Array.from({ length: Math.ceil(config.duration) + 1 }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        left: `${i * pixelsPerSecond}px`,
                        top: 0,
                        bottom: 0,
                        borderLeft: '1px solid rgba(55, 65, 81, 0.3)',
                        pointerEvents: 'none',
                        height: '100%'
                    }} />
                ))}

                {assets.filter(a => a.type === 'script' || (a.type !== 'other' && a.visible !== false)).map((asset, index) => (
                    <div
                        key={asset.id}
                        style={{
                            height: '44px',
                            position: 'relative',
                            marginBottom: '4px',
                            // Alternating row background
                            background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                        }}
                    >
                        <TimelineBlock
                            asset={asset}
                            duration={config.duration}
                            containerWidth={containerWidth}
                            onUpdate={onUpdateAsset}
                            onSelect={onSelectAsset}
                            onEdit={onEditAsset}
                            isSelected={selectedAssetId === asset.id}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
