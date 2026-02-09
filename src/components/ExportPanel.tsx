import React, { useState } from 'react';
import { Video, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
    onExport: (type: 'standard') => void;
    isExporting: boolean;
    progress: number;
}

const ExportPanel: React.FC<Props> = ({ onExport, isExporting, progress }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
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
                    <Video size={18} style={{ color: 'var(--accent-secondary)' }} />
                    <span style={{ fontWeight: 600 }}>Export</span>
                </div>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {isExpanded && (
                <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        className="primary"
                        onClick={() => onExport('standard')}
                        disabled={isExporting}
                        style={{
                            width: '100%',
                            opacity: isExporting ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'var(--accent-gradient)',
                            border: 'none',
                            color: 'white',
                            height: '48px',
                            fontSize: '1rem'
                        }}
                    >
                        <Sparkles size={20} />
                        Export Video
                    </button>

                    {isExporting && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <div className="spinner" style={{
                                width: '24px',
                                height: '24px',
                                border: '3px solid rgba(255,255,255,0.1)',
                                borderTopColor: 'var(--accent-primary)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 10px'
                            }}></div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {progress > 0 ? `Encoding: ${progress.toFixed(0)}%` : 'Preparing export...'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExportPanel;
