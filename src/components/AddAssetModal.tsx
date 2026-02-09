import React, { useState, useRef } from 'react';
import { X, Plus, Image as ImageIcon, Link, Sparkles } from 'lucide-react';
import type { Asset } from '../types';
import { getAssetTypeFromMime, createAssetElement, extractMediaMetadata, decodeAssetAudio } from '../utils/assetUtils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAddAsset: (assets: Omit<Asset, 'id' | 'enabled' | 'analysis'> | Omit<Asset, 'id' | 'enabled' | 'analysis'>[]) => void;
    onAddScript: () => void;
    assetsCount: number;
    audioCtx: AudioContext;
}

const AddAssetModal: React.FC<Props> = ({ isOpen, onClose, onAddAsset, onAddScript, assetsCount, audioCtx }) => {
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        for (const file of files) {
            const type = getAssetTypeFromMime(file.type);
            const objectUrl = URL.createObjectURL(file);

            const element = await createAssetElement(type, objectUrl);
            const metadata = extractMediaMetadata(file, element);

            let audioBuffer: AudioBuffer | undefined;
            if (type === 'video' || type === 'audio') {
                audioBuffer = await decodeAssetAudio(file, audioCtx);
            }

            onAddAsset({
                name: file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_'),
                type,
                url: objectUrl,
                metadata,
                muted: false,
                element,
                audioBuffer
            });
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    const handleUrlAdd = () => {
        if (!url) return;
        onAddAsset({
            name: name || `image_${assetsCount + 1}`,
            type: 'image',
            url,
            metadata: { mimeType: 'image/remote' },
            muted: true,
            element: null
        });
        setUrl('');
        setName('');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(10px)'
        }}>
            <div className="glass" style={{
                width: '450px',
                padding: '32px',
                borderRadius: '24px',
                position: 'relative',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', color: 'var(--text-secondary)' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Plus className="gradient-text" /> Add Asset
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <button
                        className="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ height: '100px', flexDirection: 'column', gap: '8px' }}
                    >
                        <ImageIcon size={24} />
                        Local Media (Img, Vid, Aud)
                    </button>
                    <button
                        className="secondary"
                        onClick={() => { onAddScript(); onClose(); }}
                        style={{ height: '100px', flexDirection: 'column', gap: '8px', background: 'var(--accent-gradient)', border: 'none', color: 'white' }}
                    >
                        <Sparkles size={24} />
                        New Script
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        style={{ display: 'none' }}
                        accept="image/*,video/*,audio/*"
                    />
                </div>

                <div className="glass" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Link size={16} />
                        <span>Add External Image</span>
                    </div>
                    <input
                        type="text"
                        placeholder="https://example.com/image.png"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        style={{ width: '100%' }}
                    />
                    <input
                        type="text"
                        placeholder="Variable Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ width: '100%' }}
                    />
                    <button
                        className="primary"
                        onClick={handleUrlAdd}
                        disabled={!url}
                        style={{ marginTop: '4px' }}
                    >
                        Add URL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAssetModal;
