import { Sparkles, Box } from 'lucide-react';
import type { AnimationConfig, Asset } from '../types';
import ConfigurationPanel from './ConfigurationPanel';
import ExportPanel from './ExportPanel';
import AssetManager from './AssetManager';
import React, { useState } from 'react';

// Combined props for Toolbar + AssetManager
interface Props {
    config: AnimationConfig;
    setConfig: (config: AnimationConfig) => void;
    onExport: (type: 'standard') => void;
    isExporting: boolean;
    progress: number;
    // Agent settings
    onOpenSettings: () => void;
    // Assets
    assets: Asset[];
    onAddAsset: (assets: any) => void;
    onRemoveAsset: (id: string) => void;
    onToggleAsset: (id: string) => void;
    onToggleMute: (id: string) => void;
    onRenameAsset: (id: string, newName: string) => void;
    onAddScript: () => void;
    onEditAsset: (id: string) => void;
    onReorderAssets: (fromIndex: number, toIndex: number) => void;
    onOpenAddModal: () => void;
    onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
    onOpenConfig: (id: string) => void;
}

const Toolbar: React.FC<Props> = ({
    config, setConfig, onExport, isExporting, progress, onOpenSettings,
    assets, onAddAsset, onRemoveAsset, onToggleAsset, onToggleMute, onRenameAsset,
    onAddScript, onEditAsset, onReorderAssets, onOpenAddModal, onUpdateAsset, onOpenConfig
}) => {

    // Asset Manager Collapse State
    const [isAssetsExpanded, setIsAssetsExpanded] = useState(true);

    return (
        <div className="toolbar glass" style={{
            width: '320px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-color)',
            background: '#050510' // Slightly darker
        }}>
            {/* Configuration Button */}
            <div style={{ padding: '16px' }}>
                <button
                    id="toolbar-config-button"
                    className="secondary"
                    onClick={onOpenSettings}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        padding: '12px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Sparkles size={18} fill="currentColor" />
                    Configuration
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <ConfigurationPanel config={config} setConfig={setConfig} />

                {/* Collapsible Asset Manager Wrapper */}
                <div style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setIsAssetsExpanded(!isAssetsExpanded)}
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
                            <Box size={18} style={{ color: 'var(--accent-secondary)' }} />
                            <span style={{ fontWeight: 600 }}>Assets ({assets.length})</span>
                        </div>
                        {isAssetsExpanded ? <div style={{ transform: 'rotate(90deg)' }}>›</div> : <div>›</div>}
                        {/* Simple chevron simulation or use icon */}
                    </button>

                    {isAssetsExpanded && (
                        <div style={{ paddingBottom: '16px' }}>
                            <AssetManager
                                assets={assets}
                                onAddAsset={onAddAsset}
                                onRemoveAsset={onRemoveAsset}
                                onToggleAsset={onToggleAsset}
                                onToggleMute={onToggleMute}
                                onRenameAsset={onRenameAsset}
                                onAddScript={onAddScript}
                                onEditAsset={onEditAsset}
                                onReorderAssets={onReorderAssets}
                                onOpenAddModal={onOpenAddModal}
                                onUpdateAsset={onUpdateAsset}
                                onOpenConfig={onOpenConfig}
                                embedded={true} // Hint to style it without its own header if needed
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: Export */}
            <ExportPanel
                onExport={onExport}
                isExporting={isExporting}
                progress={progress}
            />

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Toolbar;
