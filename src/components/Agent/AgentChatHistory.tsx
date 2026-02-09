
import { useRef, useEffect } from 'react';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import { AgentMessageItem } from './AgentMessage';
import type { AgentMessage } from '../../agent/types';

interface AgentChatHistoryProps {
    messages: AgentMessage[];
    isProcessing: boolean;
}

export default function AgentChatHistory({ messages, isProcessing }: AgentChatHistoryProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);
    return (
        <div className="premium-glass" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            border: 'none'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(168, 85, 247, 0.05)'
            }}>
                <Sparkles size={16} style={{ color: '#c084fc' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#c084fc', textTransform: 'uppercase' }}>
                    VibClip Assistant
                </span>
            </div>
            {/* History Container */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
                padding: '12px 0'
            }}>
                {messages.length === 0 && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        padding: '32px',
                        textAlign: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#1f2937',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Sparkles size={24} style={{ color: 'rgba(168, 85, 247, 0.5)' }} />
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                            I can help you create animations, using local Assets, and process videos.
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
