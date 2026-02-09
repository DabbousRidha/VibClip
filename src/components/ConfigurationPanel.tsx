import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Monitor } from 'lucide-react';
import type { AnimationConfig } from '../types';

interface Props {
    config: AnimationConfig;
    setConfig: (config: AnimationConfig) => void;
}

const ConfigurationPanel: React.FC<Props> = ({ config, setConfig }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig({
            ...config,
            [name]: name === 'backgroundMode' ? value : Number(value)
        });
    };

    return (
        <div style={{ borderBottom: '1px solid var(--border-color)' }}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Monitor size={18} className="gradient-text" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 600 }}>Configuration</span>
                </div>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {isExpanded && (
                <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="control-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resolution</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="number"
                                name="width"
                                value={config.width}
                                onChange={handleChange}
                                placeholder="Width"
                                style={{ width: '100%' }}
                            />
                            <input
                                type="number"
                                name="height"
                                value={config.height}
                                onChange={handleChange}
                                placeholder="Height"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div className="control-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Frame Rate (FPS)</label>
                        <select
                            name="fps"
                            value={config.fps}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        >
                            <option value={24}>24 FPS</option>
                            <option value={30}>30 FPS</option>
                            <option value={60}>60 FPS</option>
                            <option value={120}>120 FPS</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Duration (seconds)</label>
                        <input
                            type="number"
                            name="duration"
                            value={config.duration}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="control-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Background</label>
                        <select
                            name="backgroundMode"
                            value={config.backgroundMode}
                            onChange={handleChange}
                            style={{ width: '100%', marginBottom: '10px' }}
                        >
                            <option value="transparent">Transparent</option>
                            <option value="black">Black</option>
                            <option value="white">White</option>
                            <option value="custom">Custom Color</option>
                        </select>
                        {config.backgroundMode === 'custom' && (
                            <input
                                type="color"
                                name="backgroundColor"
                                value={config.backgroundColor}
                                onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                                style={{ width: '100%', height: '40px', padding: '2px' }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigurationPanel;
