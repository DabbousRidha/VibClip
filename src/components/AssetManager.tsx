import React from 'react';
import { Image as ImageIcon, Video, Plus, Trash2, CheckCircle2, Circle, Music, FileText, Volume2, VolumeX, Sparkles, ChevronUp, ChevronDown, Code } from 'lucide-react';
import type { Asset, AssetType } from '../types';

interface Props {
    assets: Asset[];
    onAddAsset: (asset: Omit<Asset, 'id' | 'enabled' | 'analysis'>) => void;
    onRemoveAsset: (id: string) => void;
    onToggleAsset: (id: string) => void;
    onToggleMute: (id: string) => void;
    onAddScript: () => void;
    onEditAsset: (id: string) => void;
    onRenameAsset: (id: string, name: string) => void;
    onReorderAssets: (from: number, to: number) => void;
    onOpenAddModal: () => void;
    onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
    onOpenConfig: (id: string) => void;
    embedded?: boolean;
}

const AssetManager: React.FC<Props> = ({
    assets,
    onRemoveAsset,
    onToggleAsset,
    onToggleMute,
    onEditAsset,
    onRenameAsset,
    onReorderAssets,
    onOpenAddModal,
    onUpdateAsset,
    onOpenConfig,
    embedded = false
}) => {
    const [expandedId, setExpandedId] = React.useState<string | null>(null);

    const getIcon = (type: AssetType) => {
        switch (type) {
            case 'image': return <ImageIcon size={14} />;
            case 'video': return <Video size={14} />;
            case 'audio': return <Music size={14} />;
            case 'script': return <Sparkles size={14} />;
            default: return <FileText size={14} />;
        }
    };

    return (
        <div className={`asset-manager ${!embedded ? 'glass' : ''}`} style={{
            width: '100%',
            height: '100%',
            padding: embedded ? '0 16px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: embedded ? '16px' : '24px',
            background: embedded ? 'transparent' : 'rgba(255,255,255,0.02)',
            overflowY: 'auto'
        }}>
            {!embedded && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={20} className="gradient-text" style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Assets</h2>
                    </div>
                </div>
            )}

            <button
                className="primary"
                onClick={onOpenAddModal}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
                <Plus size={18} />
                Add Asset
            </button>

            <div className="asset-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assets.map((asset, index) => (
                    <React.Fragment key={asset.id}>
                        <div
                            key={asset.id}
                            className="glass"
                            style={{
                                padding: '10px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                border: asset.enabled ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button
                                    onClick={() => index > 0 && onReorderAssets(index, index - 1)}
                                    style={{ background: 'transparent', padding: '2px', opacity: index === 0 ? 0.2 : 0.5, border: 'none', cursor: index === 0 ? 'default' : 'pointer' }}
                                    disabled={index === 0}
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => index < assets.length - 1 && onReorderAssets(index, index + 1)}
                                    style={{ background: 'transparent', padding: '2px', opacity: index === assets.length - 1 ? 0.2 : 0.5, border: 'none', cursor: index === assets.length - 1 ? 'default' : 'pointer' }}
                                    disabled={index === assets.length - 1}
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>

                            <div
                                onClick={() => onToggleAsset(asset.id)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {asset.enabled ? (
                                    <CheckCircle2 size={18} color="var(--accent-primary)" />
                                ) : (
                                    <Circle size={18} color="var(--text-secondary)" />
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0, cursor: 'default' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {getIcon(asset.type)}
                                    <input
                                        value={asset.name}
                                        onChange={(e) => onRenameAsset(asset.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid transparent',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            width: '100%',
                                            padding: '2px 0',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-primary)'}
                                        onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                                    />
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    {asset.type === 'script' ? 'Javascript' : (
                                        <>
                                            <>
                                                {asset.metadata?.width ? `${asset.metadata.width}x${asset.metadata.height} • ` : ''}
                                                {asset.metadata?.duration ? `${asset.metadata.duration.toFixed(1)}s • ` : ''}
                                                {asset.metadata?.size ? `${(asset.metadata.size / 1024 / 1024).toFixed(1)}MB` : ''}
                                            </>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {asset.type === 'script' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEditAsset(asset.id); }}
                                        style={{ background: 'transparent', padding: '4px', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}
                                        title="Edit Script"
                                    >
                                        <Code size={14} />
                                    </button>
                                )}
                                {(asset.type === 'audio' || asset.type === 'video' || asset.type === 'image') && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === asset.id ? null : asset.id); }}
                                        style={{ background: 'transparent', padding: '4px', border: 'none', cursor: 'pointer', color: expandedId === asset.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                                        title="Settings"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                )}
                                {asset.type === 'script' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onOpenConfig(asset.id); }}
                                        style={{ background: 'transparent', padding: '4px', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}
                                        title="Configuration"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                )}
                                {asset.type === 'video' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleMute(asset.id); }}
                                        style={{ background: 'transparent', padding: '4px', border: 'none', cursor: 'pointer' }}
                                        title={asset.muted ? "Unmute Audio" : "Mute Audio"}
                                    >
                                        {asset.muted ? <VolumeX size={14} /> : <Volume2 size={14} color="var(--accent-primary)" />}
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemoveAsset(asset.id); }}
                                    style={{ background: 'transparent', padding: '4px', border: 'none', cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} color="var(--error)" />
                                </button>
                            </div>
                        </div>

                        {expandedId === asset.id && (
                            <div className="glass" style={{ padding: '16px', borderRadius: '12px', marginTop: '-4px', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                                {/* Media Controls */}
                                {(asset.type === 'audio' || asset.type === 'video') && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ color: 'var(--text-secondary)' }}>Speed ({asset.playbackRate ?? 1}x)</label>
                                            <input
                                                type="range" min="0.1" max="4" step="0.1"
                                                value={asset.playbackRate ?? 1}
                                                onChange={(e) => onUpdateAsset(asset.id, { playbackRate: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ color: 'var(--text-secondary)' }}>Volume ({Math.round((asset.volume ?? 1) * 100)}%)</label>
                                            <input
                                                type="range" min="0" max="2" step="0.01"
                                                value={asset.volume ?? 1}
                                                onChange={(e) => onUpdateAsset(asset.id, { volume: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ color: 'var(--text-secondary)' }}>Pan ({asset.pan ?? 0})</label>
                                            <input
                                                type="range" min="-1" max="1" step="0.01"
                                                value={asset.pan ?? 0}
                                                onChange={(e) => onUpdateAsset(asset.id, { pan: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ color: 'var(--text-secondary)' }}>Start Offset ({asset.startOffset ?? 0}s)</label>
                                            <input
                                                type="range" min="0" max="10" step="0.1"
                                                value={asset.startOffset ?? 0}
                                                onChange={(e) => onUpdateAsset(asset.id, { startOffset: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: 'span 2' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={asset.loop ?? false} onChange={(e) => onUpdateAsset(asset.id, { loop: e.target.checked })} />
                                                Loop
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={asset.preservePitch ?? true} onChange={(e) => onUpdateAsset(asset.id, { preservePitch: e.target.checked })} />
                                                Preserve Pitch
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Visual Composition Controls */}
                                {(asset.type === 'image' || asset.type === 'video') && (
                                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Visual Composition</span>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                <input type="checkbox" checked={asset.visible ?? true} onChange={(e) => onUpdateAsset(asset.id, { visible: e.target.checked })} />
                                                Auto-Render (Visible)
                                            </label>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Position X ({Math.round(asset.x ?? 0)}px)</label>
                                                <input
                                                    type="range" min="-1000" max="1000" step="1"
                                                    value={asset.x ?? 0}
                                                    onChange={(e) => onUpdateAsset(asset.id, { x: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Position Y ({Math.round(asset.y ?? 0)}px)</label>
                                                <input
                                                    type="range" min="-1000" max="1000" step="1"
                                                    value={asset.y ?? 0}
                                                    onChange={(e) => onUpdateAsset(asset.id, { y: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Scale ({asset.scale ?? 1}x)</label>
                                                <input
                                                    type="range" min="0" max="10" step="0.01"
                                                    value={asset.scale ?? 1}
                                                    onChange={(e) => onUpdateAsset(asset.id, { scale: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Rotation ({asset.rotation ?? 0}°)</label>
                                                <input
                                                    type="range" min="-360" max="360" step="1"
                                                    value={asset.rotation ?? 0}
                                                    onChange={(e) => onUpdateAsset(asset.id, { rotation: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Opacity ({Math.round((asset.opacity ?? 1) * 100)}%)</label>
                                                <input
                                                    type="range" min="0" max="1" step="0.01"
                                                    value={asset.opacity ?? 1}
                                                    onChange={(e) => onUpdateAsset(asset.id, { opacity: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Fit Mode</label>
                                                <select
                                                    value={asset.fit ?? 'contain'}
                                                    onChange={(e) => onUpdateAsset(asset.id, { fit: e.target.value as any })}
                                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.7rem', padding: '2px' }}
                                                >
                                                    <option value="contain">Contain</option>
                                                    <option value="cover">Cover</option>
                                                    <option value="fill">Fill</option>
                                                    <option value="none">None (Natural)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                <input type="checkbox" checked={asset.flipX ?? false} onChange={(e) => onUpdateAsset(asset.id, { flipX: e.target.checked })} />
                                                Flip X
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                <input type="checkbox" checked={asset.flipY ?? false} onChange={(e) => onUpdateAsset(asset.id, { flipY: e.target.checked })} />
                                                Flip Y
                                            </label>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <select
                                                    value={asset.blendMode ?? 'source-over'}
                                                    onChange={(e) => onUpdateAsset(asset.id, { blendMode: e.target.value as any })}
                                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.7rem', padding: '4px' }}
                                                >
                                                    <option value="source-over">Normal</option>
                                                    <option value="screen">Screen</option>
                                                    <option value="multiply">Multiply</option>
                                                    <option value="overlay">Overlay</option>
                                                    <option value="addition">Addition</option>
                                                    <option value="difference">Difference</option>
                                                    <option value="exclusion">Exclusion</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default AssetManager;
