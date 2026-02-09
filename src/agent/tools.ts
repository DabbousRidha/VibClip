import type { AgentTool } from './types';

// Cast parameters to any to avoid strict schema validation issues during build
export const AGENT_TOOLS: AgentTool[] = [
    {
        name: 'update_config',
        description: 'Update project settings like resolution, FPS, or duration.',
        parameters: {
            type: 'OBJECT',
            properties: {
                width: { type: 'NUMBER' },
                height: { type: 'NUMBER' },
                fps: { type: 'NUMBER' },
                duration: { type: 'NUMBER', description: 'Duration in seconds' },
                backgroundMode: { type: 'STRING', enum: ['black', 'white', 'transparent', 'custom'] },
                backgroundColor: { type: 'STRING', description: 'Hex color code' }
            }
        } as any
    },
    {
        name: 'add_asset_from_url',
        description: 'Add an image or video asset from a URL. Use this for placeholder images or if the user provides a link.',
        parameters: {
            type: 'OBJECT',
            properties: {
                type: { type: 'STRING', enum: ['image', 'video', 'audio'] },
                name: { type: 'STRING' },
                url: { type: 'STRING' }
            },
            required: ['type', 'name', 'url']
        } as any
    },
    {
        name: 'create_script',
        description: 'Create a new blank animation script asset.',
        parameters: {
            type: 'OBJECT',
            properties: {
                name: { type: 'STRING' },
                code: { type: 'STRING', description: 'Optional initial code for the script.' }
            },
            required: ['name']
        } as any
    },
    {
        name: 'update_script_content',
        description: 'Update the JavaScript code of a specific script asset. The code must be a valid function body. IMPORTANT: Always provide the FULL code, not just a patch.',
        parameters: {
            type: 'OBJECT',
            properties: {
                assetId: { type: 'STRING' },
                code: { type: 'STRING', description: 'The full javascript code.' }
            },
            required: ['assetId', 'code']
        } as any
    },
    {
        name: 'update_asset_properties',
        description: 'Update properties of an asset like position, volume, playback rate, or pan.',
        parameters: {
            type: 'OBJECT',
            properties: {
                assetId: { type: 'STRING' },
                updates: {
                    type: 'OBJECT',
                    properties: {
                        volume: { type: 'NUMBER' },
                        playbackRate: { type: 'NUMBER' },
                        startOffset: { type: 'NUMBER' },
                        pan: { type: 'NUMBER' },
                        name: { type: 'STRING' },
                        enabled: { type: 'BOOLEAN', description: 'Whether the asset is included/visible in the project.' },
                        visible: { type: 'BOOLEAN', description: 'Whether to auto-render this visual asset to the canvas.' },
                        x: { type: 'NUMBER', description: 'Horizontal position offset from center (pixels).' },
                        y: { type: 'NUMBER', description: 'Vertical position offset from center (pixels).' },
                        scale: { type: 'NUMBER', description: 'Scale multiplier (1.0 is natural size).' },
                        rotation: { type: 'NUMBER', description: 'Rotation in degrees.' },
                        opacity: { type: 'NUMBER', description: 'Opacity (0.0 to 1.0).' },
                        fit: {
                            type: 'STRING',
                            enum: ['contain', 'cover', 'fill', 'none'],
                            description: 'How the asset fits the canvas.'
                        },
                        flipX: { type: 'BOOLEAN' },
                        flipY: { type: 'BOOLEAN' },
                        blendMode: {
                            type: 'STRING',
                            enum: ['source-over', 'screen', 'multiply', 'overlay', 'addition', 'difference', 'exclusion'],
                            description: 'CSS/Canvas blend mode.'
                        }
                    }
                }
            },
            required: ['assetId', 'updates']
        } as any
    },
    {
        name: 'delete_asset',
        description: 'Remove an asset from the project.',
        parameters: {
            type: 'OBJECT',
            properties: {
                assetId: { type: 'STRING' }
            },
            required: ['assetId']
        } as any
    },
    {
        name: 'set_playback',
        description: 'Control the preview playback.',
        parameters: {
            type: 'OBJECT',
            properties: {
                playing: { type: 'BOOLEAN' },
                time: { type: 'NUMBER' }
            }
        } as any
    }
];
