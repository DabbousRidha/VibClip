
import { useState, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Part } from '@google/generative-ai';
import type { AppActions, AgentMessage } from '../agent/types';
import { AGENT_TOOLS } from '../agent/tools';
import { VE_SYSTEM_PROMPT } from '../agent/systemPrompt';

export interface FileAttachment {
    data: string; // Base64
    mimeType: string;
    name: string;
}

export function useAgent(actions: AppActions, apiKey: string | null, agentMode: 'fast' | 'planning' = 'fast') {
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const actionsRef = useRef(actions);
    actionsRef.current = actions;

    const sendMessage = useCallback(async (text: string, attachments: FileAttachment[] = []) => {
        if (!apiKey) {
            alert("Please set your Gemini API Key in settings first!");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Gather Context (Enriched)
            const currentAssets = actionsRef.current.getAssets();
            const currentConfig = actionsRef.current.getConfig();
            const currentErrors = actionsRef.current.getErrors();

            const assetsDetails = currentAssets.map(a => {
                let details = `- [${a.type}] "${a.name}" (ID: ${a.id})`;
                if (a.enabled !== undefined) details += ` | Enabled: ${a.enabled}`;
                if (a.visible !== undefined) details += ` | Visible: ${a.visible}`;

                if (a.type === 'image' && a.metadata.width) {
                    details += ` | Size: ${a.metadata.width}x${a.metadata.height}`;
                }
                if ((a.type === 'video' || a.type === 'audio') && a.metadata.duration) {
                    details += ` | Duration: ${a.metadata.duration.toFixed(2)}s`;
                }

                if (a.type === 'image' || a.type === 'video') {
                    details += ` | Position: (${a.x || 0}, ${a.y || 0}) | Scale: ${a.scale || 1} | Rot: ${a.rotation || 0}`;
                    if (a.fit) details += ` | Fit: ${a.fit}`;
                    if (a.opacity !== undefined) details += ` | Opacity: ${a.opacity}`;
                }

                if (a.type === 'script' && a.content) {
                    const cleanContent = a.content.replace(/\n/g, ' ').slice(0, 200);
                    details += ` | Content: "${cleanContent}${a.content.length > 200 ? '...' : ''}"`;
                }

                return details;
            }).join('\n');

            const errorDetails = currentErrors.length > 0
                ? `\n[PROJECT ERRORS! FIX THESE!]\n${currentErrors.map(e => `- ${e.source.toUpperCase()}: ${e.message} ${e.assetId ? `(Asset ID: ${e.assetId})` : ''}`).join('\n')}`
                : "";

            const contextString = `
[ENVIRONMENT: BROWSER (JAVASCRIPT ONLY)]
[AGENT MODE: ${agentMode.toUpperCase()}]
${agentMode === 'planning' ? 'REMINDER: You are in DIRECTOR MODE. You MUST create a Plan artifact first, then build modular scenes using the 5-step workflow.' : 'REMINDER: You are in FAST MODE. Analyze and fix immediately.'}
[STRICT: Only use JavaScript for all code generation. DO NOT use Python.]

[CURRENT PROJECT STATE]
Config: ${currentConfig.width}x${currentConfig.height} @ ${currentConfig.fps}fps, ${currentConfig.duration}s
Assets (${currentAssets.length}):
${assetsDetails}${errorDetails}
`;

            // Initialize SDK
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview", // Corrected model name
                systemInstruction: VE_SYSTEM_PROMPT,
                tools: [{ functionDeclarations: AGENT_TOOLS }]
            });

            // Map internal history format to SDK Content format
            const historyForSdk = messages.map(msg => ({
                role: msg.role,
                parts: msg.parts
            }));

            const chat = model.startChat({
                history: historyForSdk
            });

            // Build current turn parts
            const currentParts: Part[] = [{ text: `${contextString}\n\n${text}` }];
            attachments.forEach(file => {
                currentParts.push({
                    inlineData: {
                        data: file.data,
                        mimeType: file.mimeType
                    }
                });
            });

            // Update local state immediately
            const newUserMsg: AgentMessage = { role: 'user', parts: currentParts };
            const newHistory = [...messages, newUserMsg];
            setMessages(newHistory);

            // Send to model
            let result = await chat.sendMessage(currentParts);
            let response = await result.response;

            // Check for non-standard finish reasons
            const candidate = response.candidates?.[0];
            if (candidate?.finishReason) {
                if (candidate.finishReason === 'MALFORMED_FUNCTION_CALL' || candidate.finishReason === 'RECITATION' || candidate.finishReason === 'SAFETY') {
                    console.error(`Agent stopped with reason: ${candidate.finishReason}`);
                    const finishMsg = candidate.finishMessage ? `\nDetails: ${candidate.finishMessage}` : '';

                    setMessages(prev => [...prev, {
                        role: 'model',
                        parts: [{ text: `❌ **Error**: The agent stopped unexpectedly.\nReason: \`${candidate.finishReason}\`${finishMsg}\n\nPlease try rephrasing your request.` }]
                    }]);
                    setIsProcessing(false);
                    return;
                }
            }

            // Handle loop for function calls (The SDK handles the chat history accumulation internally for the session object,
            // but since we recreate the session every turn (stateless backend style) to avoid managing complex instance state in React,
            // we manually manage the loop here if needed.

            // Actually, recreating startChat every time is fine.
            // We just need to handle the function call loop manually.

            let functionCalls = response.functionCalls();

            // Add initial model response to history
            const initialModelMsg: AgentMessage = {
                role: 'model',
                parts: [
                    { text: response.text() },
                    ...(functionCalls || []).map(fc => ({ functionCall: fc as any }))
                ]
            };

            let currentTurnHistory = [...newHistory, initialModelMsg];
            setMessages(currentTurnHistory);

            let turns = 0;
            while (functionCalls && functionCalls.length > 0 && turns < 5) {
                const functionResponses: Part[] = [];

                for (const call of functionCalls) {
                    const { name, args } = call;
                    console.log(`🤖 Agent calling tool: ${name}`, args);

                    try {
                        const res = await executeTool(name, args, actionsRef.current);
                        functionResponses.push({
                            functionResponse: {
                                name: name,
                                response: res
                            }
                        });
                    } catch (e: any) {
                        console.error(`Tool Execution Error (${name}):`, e);
                        functionResponses.push({
                            functionResponse: {
                                name: name,
                                response: { error: e.message || "Unknown error" }
                            }
                        });
                        actionsRef.current.reportError({
                            source: 'system',
                            message: `Tool "${name}" failed: ${e.message}`
                        });
                    }
                }

                // Add function responses to history
                const responseMsg: AgentMessage = { role: 'function', parts: functionResponses };
                currentTurnHistory = [...currentTurnHistory, responseMsg];
                setMessages(currentTurnHistory);

                // Send function responses back to model
                result = await chat.sendMessage(functionResponses);
                response = await result.response;
                functionCalls = response.functionCalls();

                // Add follow-up model response
                const followUpMsg: AgentMessage = {
                    role: 'model',
                    parts: [
                        { text: response.text() },
                        ...(functionCalls || []).map(fc => ({ functionCall: fc as any }))
                    ]
                };
                currentTurnHistory = [...currentTurnHistory, followUpMsg];
                setMessages(currentTurnHistory);

                turns++;
            }

        } catch (e: any) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: `❌ Error: ${e.message}` }] }]);
        } finally {
            setIsProcessing(false);
        }
    }, [messages, apiKey, agentMode]);

    return {
        messages,
        sendMessage,
        isProcessing,
        clearHistory: () => setMessages([])
    };
}

async function executeTool(name: string, args: any, actions: AppActions): Promise<any> {
    const findAsset = (idOrName: string) => {
        const assets = actions.getAssets();
        return assets.find(a => a.id === idOrName) ||
            assets.find(a => a.name.toLowerCase() === idOrName.toLowerCase());
    };

    switch (name) {
        case 'update_config':
            actions.updateConfig(args);
            return { result: "Config updated" };
        case 'add_asset_from_url':
            const newAssetsFromUrl = actions.addAsset({
                element: null,
                muted: false,
                ...args,
                metadata: { width: 0, height: 0, duration: 0, size: 0, mimeType: 'unknown' }
            });
            return {
                message: `Asset ${args.name} added`,
                asset: { id: newAssetsFromUrl[0].id, name: newAssetsFromUrl[0].name }
            };
        case 'create_script':
            const newScriptArr = actions.addAsset({
                type: 'script',
                name: args.name,
                content: args.code || args.content || '// New script',
                metadata: { mimeType: 'text/javascript' },
                url: '',
                element: null,
                muted: false
            });
            return {
                message: "Script created",
                asset: { id: newScriptArr[0].id, name: newScriptArr[0].name }
            };
        case 'update_script_content':
            const scriptToUpdate = findAsset(args.assetId);
            if (!scriptToUpdate) throw new Error(`Script not found: ${args.assetId}`);
            actions.updateScript(scriptToUpdate.id, args.code);
            return { result: "Script updated" };
        case 'update_asset_properties':
            const assetToUpdate = findAsset(args.assetId);
            if (!assetToUpdate) throw new Error(`Asset not found: ${args.assetId}`);
            actions.updateAsset(assetToUpdate.id, args.updates);
            return { result: "Asset updated" };
        case 'delete_asset':
            const assetToDelete = findAsset(args.assetId);
            if (!assetToDelete) throw new Error(`Asset not found: ${args.assetId}`);
            actions.removeAsset(assetToDelete.id);
            return { result: "Asset deleted" };
        case 'set_playback':
            if (args.playing !== undefined) actions.setIsPlaying(args.playing);
            if (args.time !== undefined) actions.setCurrentTime(args.time);
            return { result: "Playback updated" };
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
