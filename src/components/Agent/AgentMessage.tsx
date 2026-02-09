

import type { AgentMessage } from '../../agent/types';
import type { FunctionCallPart, FunctionResponsePart, TextPart } from '@google/generative-ai';
import { Bot, User, Terminal } from 'lucide-react';

interface AgentMessageProps {
    message: AgentMessage;
}

export function AgentMessageItem({ message }: AgentMessageProps) {
    const isUser = message.role === 'user';
    const isFunction = message.role === 'function';

    // Helper to render text parts
    const renderContent = () => {
        if (message.parts) {
            return message.parts.map((part, i) => {
                if ('text' in part) {
                    const textPart = part as TextPart;
                    return <div key={i} style={{ whiteSpace: 'pre-wrap' }}>{textPart.text}</div>;
                }
                if ('functionCall' in part) {
                    const fcPart = part as FunctionCallPart;
                    return (
                        <div key={i} style={{
                            marginTop: '8px',
                            fontSize: '0.75rem',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '8px',
                            fontFamily: 'monospace'
                        }}>
                            <div style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Terminal size={12} />
                                Run: {fcPart.functionCall.name}
                            </div>
                            <pre style={{ color: '#9ca3af', overflowX: 'auto', marginTop: '4px' }}>
                                {JSON.stringify(fcPart.functionCall.args, null, 2)}
                            </pre>
                        </div>
                    );
                }
                if ('functionResponse' in part) {
                    const frPart = part as FunctionResponsePart;
                    return (
                        <div key={i} style={{
                            marginTop: '8px',
                            fontSize: '0.75rem',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '8px',
                            fontFamily: 'monospace',
                            opacity: 0.7
                        }}>
                            <div style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Terminal size={12} />
                                Result: {frPart.functionResponse.name}
                            </div>
                            <pre style={{ color: '#9ca3af', overflowX: 'auto', marginTop: '4px' }}>
                                {JSON.stringify(frPart.functionResponse.response, null, 2)}
                            </pre>
                        </div>
                    );
                }
                return null;
            });
        }
        return message.content;
    };

    if (isFunction) {
        // Function results (system messages essentially)
        return (
            <div style={{ display: 'flex', gap: '12px', padding: '8px 16px', opacity: 0.6, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: '#1f2937',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Terminal size={14} style={{ color: '#22c55e' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: '0.875rem', overflow: 'hidden' }}>
                    {renderContent()}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', gap: '12px', padding: '16px',
            background: isUser ? 'transparent' : 'rgba(31, 41, 55, 0.3)'
        }}>
            <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: isUser ? '#2563eb' : '#9333ea'
            }}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 500, fontSize: '0.75rem', marginBottom: '4px', color: '#9ca3af' }}>
                    {isUser ? 'You' : 'VibClip Assistant'}
                </div>
                <div style={{ color: '#e5e7eb' }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
