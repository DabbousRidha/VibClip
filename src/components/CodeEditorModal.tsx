import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import CodeEditor from './Editor';

interface CodeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialCode: string;
    onSave: (newCode: string) => void;
    title: string;
}

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({ isOpen, onClose, initialCode, onSave, title }) => {
    const [code, setCode] = useState(initialCode);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content glass" style={{
                width: '90vw',
                height: '90vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div className="modal-header" style={{
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-color)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => onSave(code)}
                            className="primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'var(--accent-color)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <Save size={18} />
                            Save
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="modal-body" style={{ flex: 1, position: 'relative' }}>
                    <CodeEditor code={code} onChange={(val) => setCode(val || '')} />
                </div>
            </div>
        </div>
    );
};

export default CodeEditorModal;
