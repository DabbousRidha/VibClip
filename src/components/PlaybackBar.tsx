import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { AnimationConfig } from '../types';

interface Props {
    config: AnimationConfig;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
}

const PlaybackBar: React.FC<Props> = ({ config, isPlaying, setIsPlaying, currentTime, setCurrentTime }) => {
    return (
        <div className="playback-bar" style={{
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto 12px',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'transparent'
        }}>
            <button
                className="primary"
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>

            <button
                className="secondary"
                onClick={() => { setIsPlaying(false); setCurrentTime(0); }}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                <RotateCcw size={18} />
            </button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                    type="range"
                    min={0}
                    max={config.duration}
                    step={0.01}
                    value={currentTime}
                    onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentTime(parseFloat(e.target.value));
                    }}
                    className="seeker"
                    style={{ flex: 1, height: '6px', cursor: 'pointer' }}
                />

                <div style={{ minWidth: '100px', textAlign: 'right', fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ color: 'white', fontWeight: 600 }}>{currentTime.toFixed(2)}s</span>
                    <span style={{ color: 'var(--text-secondary)' }}> / {config.duration}s</span>
                </div>
            </div>
        </div>
    );
};

export default PlaybackBar;
