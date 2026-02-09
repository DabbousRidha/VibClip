
import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, X, Sparkles, Loader2, Bot, Paperclip, FileText } from 'lucide-react';
import { useAgent, type FileAttachment } from '../../hooks/useAgent';
import { AgentMessageItem } from './AgentMessage';
import type { AppActions } from '../../agent/types';

interface AgentPanelProps {
    appActions: AppActions;
    isOpen: boolean;
    onClose: () => void;
}

export default function AgentPanel({ appActions, isOpen, onClose }: AgentPanelProps) {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [showSettings, setShowSettings] = useState(!apiKey);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [agentMode, setAgentMode] = useState<'fast' | 'planning'>('fast');

    const { messages, sendMessage, isProcessing } = useAgent(appActions, apiKey, agentMode);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSaveConfig = (key: string) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        setShowSettings(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newAttachments: FileAttachment[] = [];
        for (const file of files) {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve(base64String);
                };
                reader.readAsDataURL(file);
            });
            newAttachments.push({
                data: base64,
                mimeType: file.type || 'application/octet-stream',
                name: file.name
            });
        }
        setAttachments(prev => [...prev, ...newAttachments]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && attachments.length === 0) || isProcessing) return;

        await sendMessage(input, attachments);
        setInput('');
        setAttachments([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>

            {/* Header */}
            <div style={{
                height: '48px',
                borderBottom: '1px solid #374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                background: 'rgba(31, 41, 55, 0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#c084fc' }}>
                    <Sparkles size={18} />
                    <span>VibClip Assistant</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                        value={agentMode}
                        onChange={(e) => setAgentMode(e.target.value as 'fast' | 'planning')}
                        style={{
                            background: '#1f2937',
                            color: '#e5e7eb',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="fast">⚡ Fast</option>
                        <option value="planning">🎬 Planning</option>
                    </select>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ padding: '6px', borderRadius: '4px', cursor: 'pointer', border: 'none', background: 'transparent', color: '#9ca3af' }}
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        style={{ padding: '6px', borderRadius: '4px', cursor: 'pointer', border: 'none', background: 'transparent', color: '#9ca3af' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Settings Layer */}
            {showSettings ? (
                <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'white' }}>Agent Configuration</h3>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                        To use the AI Assistant, you need a Google Gemini API Key.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIza..."
                            style={{
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.5)',
                                border: '1px solid #374151',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '0.875rem',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => handleSaveConfig(apiKey)}
                        style={{
                            marginTop: 'auto',
                            backgroundColor: '#9333ea',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Save & Start Chatting
                    </button>
                </div>
            ) : (
                <>
                    {/* Chat History */}
                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, background: 'rgba(3, 7, 18, 0.3)' }}>
                        {messages.length === 0 && (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', padding: '32px', textAlign: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', background: '#1f2937', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={24} style={{ color: 'rgba(168, 85, 247, 0.5)' }} />
                                </div>
                                <p style={{ fontSize: '0.875rem' }}>
                                    I can help you create animations, using local Assets, and process videos.
                                    <br />
                                    <br />
                                </p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <AgentMessageItem key={idx} message={msg} />
                        ))}
                        {isProcessing && (
                            <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', background: '#9333ea',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }}>
                                    <Bot size={16} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.875rem' }}>
                                    <Loader2 size={14} className="animate-spin" />
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '16px', borderTop: '1px solid #374151', background: '#111827' }}>
                        {/* Attachments Preview */}
                        {attachments.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {attachments.map((file, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: '#1f2937', padding: '4px 8px', borderRadius: '16px',
                                        fontSize: '0.75rem', color: '#e5e7eb', border: '1px solid #374151'
                                    }}>
                                        <FileText size={12} />
                                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                        <button onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#1f2937',
                                    color: '#9ca3af',
                                    borderRadius: '8px',
                                    border: '1px solid #374151',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <Paperclip size={18} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                multiple
                            />

                            <div style={{ flex: 1, position: 'relative' }}>
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Message VibClip Assistant..."
                                    disabled={isProcessing}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        padding: '12px 48px 12px 12px',
                                        fontSize: '0.875rem',
                                        color: 'white',
                                        outline: 'none',
                                        resize: 'none',
                                        minHeight: '42px',
                                        maxHeight: '200px',
                                        lineHeight: '1.5'
                                    }}
                                />
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={(!input.trim() && attachments.length === 0) || isProcessing}
                                    style={{
                                        position: 'absolute', right: '8px', bottom: '8px',
                                        padding: '6px',
                                        backgroundColor: '#9333ea',
                                        color: 'white',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: (input.trim() || attachments.length > 0) && !isProcessing ? 1 : 0.5
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                        <div style={{ marginTop: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: '#4b5563' }}>
                                Ctrl + Enter to send
                            </span>
                        </div>
                    </div>
                </>
            )}
            <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: .5; }
            }
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
    );
}
