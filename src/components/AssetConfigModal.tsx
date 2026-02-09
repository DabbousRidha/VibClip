
import React from 'react';
import { X, Check } from 'lucide-react';
import type { Asset } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset;
    onUpdate: (updates: Partial<Asset>) => void;
}

const AssetConfigModal: React.FC<Props> = ({ isOpen, onClose, asset, onUpdate }) => {
    if (!isOpen) return null;

    const metadata = asset.metadata || {};

    const handleChange = (key: string, value: any) => {
        if (key === 'startOffset') {
            onUpdate({ startOffset: parseFloat(value) });
        } else {
            // Update metadata
            onUpdate({
                metadata: {
                    ...metadata,
                    [key]: value
                }
            });
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content glass" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                borderRadius: '16px',
                background: '#050510',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📺</span>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Configuration</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Resolution */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Resolution</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input
                                type="number"
                                placeholder="Width"
                                value={metadata.width || 1280}
                                onChange={(e) => handleChange('width', parseInt(e.target.value))}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <input
                                type="number"
                                placeholder="Height"
                                value={metadata.height || 720}
                                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Frame Rate */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Frame Rate (FPS)</label>
                        <select
                            value={metadata.fps || 60}
                            onChange={(e) => handleChange('fps', parseInt(e.target.value))}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value={24}>24 FPS</option>
                            <option value={30}>30 FPS</option>
                            <option value={60}>60 FPS</option>
                        </select>
                    </div>

                    {/* Duration */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Duration (seconds)</label>
                        <input
                            type="number"
                            value={metadata.duration || 10}
                            onChange={(e) => handleChange('duration', parseFloat(e.target.value))}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Start Time (Extra) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Start Time (seconds)</label>
                        <input
                            type="number"
                            value={asset.startOffset || 0}
                            onChange={(e) => handleChange('startOffset', parseFloat(e.target.value))}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Background */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Background</label>
                        <select
                            value={metadata.backgroundMode || 'black'}
                            onChange={(e) => handleChange('backgroundMode', e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="black">Black</option>
                            <option value="white">White</option>
                            <option value="transparent">Transparent</option>
                            <option value="custom">Custom Color</option>
                        </select>
                        {metadata.backgroundMode === 'custom' && (
                            <input
                                type="color"
                                value={metadata.backgroundColor || '#000000'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                        onClick={onClose}
                        className="primary"
                        style={{
                            padding: '10px 24px',
                            fontWeight: 600,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Check size={16} />
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetConfigModal;
