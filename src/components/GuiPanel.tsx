import React from 'react';
import type { GuiControl } from '../types';

interface Props {
    controls: GuiControl[];
    values: Record<string, any>;
    onChange: (id: string, value: any) => void;
}

const GuiPanel: React.FC<Props> = ({ controls, values, onChange }) => {
    if (controls.length === 0) return null;

    return (
        <div className="gui-panel glass" style={{
            width: '260px',
            borderLeft: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '20px'
        }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Quick Controls
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {controls.map(control => {
                    const value = values[control.id] !== undefined ? values[control.id] : control.value;

                    return (
                        <div key={control.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{control.label}</label>
                                {control.type === 'slider' && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'monospace' }}>
                                        {Number(value).toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {control.type === 'slider' && (
                                <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    step={(control.max! - control.min!) / 100}
                                    value={value}
                                    onChange={(e) => onChange(control.id, parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                                />
                            )}

                            {control.type === 'color' && (
                                <input
                                    type="color"
                                    value={value}
                                    onChange={(e) => onChange(control.id, e.target.value)}
                                    style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px', background: 'none', cursor: 'pointer' }}
                                />
                            )}

                            {control.type === 'checkbox' && (
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => onChange(control.id, e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            )}

                            {control.type === 'button' && (
                                <button
                                    onClick={() => onChange(control.id, true)}
                                    className="glass-button"
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', fontSize: '0.8rem' }}
                                >
                                    Fire
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GuiPanel;
