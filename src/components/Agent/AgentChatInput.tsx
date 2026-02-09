
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText } from 'lucide-react';
import type { FileAttachment } from '../../hooks/useAgent';

interface AgentChatInputProps {
    onSendMessage: (text: string, attachments: FileAttachment[]) => Promise<void>;
    isProcessing: boolean;
}

export default function AgentChatInput({ onSendMessage, isProcessing }: AgentChatInputProps) {
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

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

        const textToSubmit = input;
        const attachmentsToSubmit = [...attachments];

        setInput('');
        setAttachments([]);

        await onSendMessage(textToSubmit, attachmentsToSubmit);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div
            className="agent-input-container glow-focus"
            style={{
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto',
                padding: '12px',
                background: 'rgba(18, 24, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 211, 238, 0.15)';
                e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
        >
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {attachments.map((file, idx) => (
                        <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(147, 51, 234, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            color: '#e5e7eb',
                            border: '1px solid rgba(147, 51, 234, 0.3)'
                        }}>
                            <FileText size={14} />
                            <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                            <button onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#9ca3af',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <Paperclip size={20} />
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
                        id="agent-chat-textarea"
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message VibClip Assistant..."
                        disabled={isProcessing}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 4px',
                            fontSize: '0.95rem',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            resize: 'none',
                            minHeight: '36px',
                            maxHeight: '150px',
                            lineHeight: '1.4',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                <button
                    id="agent-send-button"
                    onClick={() => handleSubmit()}
                    disabled={(!input.trim() && attachments.length === 0) || isProcessing}
                    style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        opacity: (input.trim() || attachments.length > 0) && !isProcessing ? 1 : 0.5,
                        transform: (input.trim() || attachments.length > 0) && !isProcessing ? 'scale(1)' : 'scale(0.9)',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>

            {/* Removed the hint text to save space as requested */}
        </div>
    );
}
