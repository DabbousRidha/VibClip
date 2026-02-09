import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import GuiPanel from './components/GuiPanel';
import CodeEditorModal from './components/CodeEditorModal';
import AddAssetModal from './components/AddAssetModal';
import { useExport } from './hooks/useExport';
import { useAssets } from './hooks/useAssets';
import { useAppActions } from './hooks/useAppActions';
import AgentChatHistory from './components/Agent/AgentChatHistory';
import AgentChatInput from './components/Agent/AgentChatInput';
import { useAgent } from './hooks/useAgent';
import type { AnimationConfig, Asset, GuiControl, VibClipError } from './types';
import Timeline from './components/Timeline/Timeline';
import AssetConfigModal from './components/AssetConfigModal';
import { updateScriptMetadata, parseScriptMetadata } from './utils/scriptParsers';

const DEFAULT_CODE = `
const { ctx, width, height, time, progress, noise, centerX, centerY, minDim, TAU, rand, timeline } = context;
/* @vibclip duration: 10.00, start: 0.00 */

// --- 1. STORY TIMELINE & CONSTANTS ---
const s_walkOut = 0.35;    // Slap-hush walk
const s_realize = 0.45;    // The "Snap" leap
const s_sprint = 0.75;     // Scrambling back
const s_doorClose = 0.85;  // Thud and darkness
const groundY = height * 0.85;
const houseX = width * 0.2;

// --- 2. THE CINEMATIC CAMERA ---
ctx.save();
if (progress > s_doorClose) {
    const zoomP = (progress - s_doorClose) / (0.15); // Final 15% zoom
    const zoom = 1 + zoomP * 2.5;
    const dX = houseX + 80;
    const dY = groundY - 20;
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-dX, -dY);
}

// --- 3. ATMOSPHERIC BACKGROUND (Town & Sky) ---
// Bruised Violet Sky
const sky = ctx.createLinearGradient(0, 0, 0, groundY);
sky.addColorStop(0, "#050510");
sky.addColorStop(1, "#1a102e");
ctx.fillStyle = sky;
ctx.fillRect(-width, -height, width * 3, height * 3);

// Distant City (With Focus Blur)
if (progress > s_doorClose) ctx.filter = \`blur(\${(progress - s_doorClose) * 20}px)\`;
ctx.fillStyle = "#0a0a1a";
for (let i = 0; i < 8; i++) {
    const bx = (i * 250 - time * 40) % (width + 500) - 250;
    ctx.fillRect(bx, groundY - 180, 150, 180);
}
ctx.filter = "none";

// Utility Poles (The cross-lines)
ctx.strokeStyle = "#050505"; ctx.lineWidth = 1;
for (let i = 0; i < 3; i++) {
    const px = (i * 600 - time * 100) % (width + 600) - 300;
    ctx.fillRect(px, 0, 12, groundY);
    ctx.beginPath(); ctx.moveTo(px, 100); ctx.lineTo(px + 600, 150); ctx.stroke();
}

// --- 4. THE HOUSE & GOLDEN LIGHT ---
const doorOpenP = (progress > 0.72 && progress < 0.82);
ctx.fillStyle = "#111122"; // House silhouette
ctx.fillRect(houseX - 80, groundY - 200, 160, 200);

// Warm Golden Light Ray
if (doorOpenP) {
    const glow = ctx.createLinearGradient(houseX, groundY - 90, houseX - 150, groundY + 50);
    glow.addColorStop(0, "rgba(251, 196, 15, 0.6)");
    glow.addColorStop(1, "rgba(251, 196, 15, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.moveTo(houseX - 25, groundY - 90);
    ctx.lineTo(houseX + 25, groundY - 90);
    ctx.lineTo(houseX + 100, groundY + 100);
    ctx.lineTo(houseX - 200, groundY + 100);
    ctx.fill();
}
ctx.fillStyle = doorOpenP ? "#f1c40f" : "#000"; // Door
ctx.fillRect(houseX - 22, groundY - 88, 44, 88);

// --- 5. RAIN & SPLASHES ---
ctx.strokeStyle = "rgba(100, 120, 150, 0.3)";
for (let i = 0; i < 80; i++) {
    const rx = (rand(i) * width * 2 + time * 150) % (width * 2) - width/2;
    const ry = (rand(i + 1) * height + time * 1200) % height;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 1, ry + 12); ctx.stroke();
    if (ry > groundY - 10) { // Splashes
        ctx.beginPath(); ctx.arc(rx, groundY, rand(i)*2, 0, TAU); ctx.stroke();
    }
}

// --- 6. CHARACTER LOGIC (The Man & The Dog) ---
let mX, mY = groundY, dX, mVis = true, mScaleY = 1, dir = 1, mTxt = "", dTxt = "";
const walkFreq = 18;

if (progress < s_walkOut) {
    const p = progress / s_walkOut;
    mX = width * 0.4 + (width * 0.4) * p;
    dX = mX - 70;
} else if (progress < s_realize) {
    const p = (progress - s_walkOut) / (s_realize - s_walkOut);
    mX = width * 0.8; dX = mX - 70;
    mY = groundY - Math.sin(p * Math.PI) * 80; // The Leap
    mScaleY = 1 + Math.cos(p * Math.PI) * 0.3; // Stretch
    mTxt = "I forgot my phone!";
} else if (progress < s_sprint) {
    dir = -1;
    const p = (progress - s_realize) / (s_sprint - s_realize);
    mX = (width * 0.8) - (width * 0.6) * p;
    dX = mX + 80;
} else if (progress < s_doorClose) {
    dir = -1;
    const p = (progress - s_sprint) / (s_doorClose - s_sprint);
    mX = houseX; dX = houseX + 80;
    mVis = p < 0.6;
} else {
    dir = -1; mVis = false; dX = houseX + 80;
    if (progress > 0.9) dTxt = "Now he forgot me...";
}

// --- 7. CHARACTER RENDERING ---
const drawEntity = (x, y, isMan, d, jump) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(d, isMan ? mScaleY : 1);
    
    if (isMan) {
        // Torso/Raincoat
        ctx.fillStyle = "#1e272e";
        ctx.beginPath(); ctx.moveTo(-15, -80); ctx.lineTo(15, -80); ctx.lineTo(20, -30); ctx.lineTo(-20, -30); ctx.fill();
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, -90, 12, 0, TAU); ctx.fill(); // Head
        // Running legs
        const s = (progress < s_walkOut || (progress > s_realize && progress < s_sprint)) ? Math.sin(time * walkFreq) * 20 : 0;
        ctx.strokeStyle = "white"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-8, -30); ctx.lineTo(s, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, -30); ctx.lineTo(-s, 0); ctx.stroke();
    } else {
        // Dog (The Forgotten Shadow)
        ctx.fillStyle = "#a34500";
        ctx.beginPath(); ctx.ellipse(0, -15, 20, 11, 0, 0, TAU); ctx.fill(); // Body
        ctx.fillRect(14, -32, 12, 12); // Head
        ctx.fillStyle = "#803000"; // Drooping ears
        ctx.beginPath(); ctx.moveTo(14, -32); ctx.lineTo(6, -20); ctx.lineTo(14, -22); ctx.fill();
        // Tail wag (slows down in rain)
        const wag = (progress > s_doorClose) ? Math.sin(time * 4) * 2 : Math.sin(time * 15) * 6;
        ctx.strokeStyle = "#a34500"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-18, -15); ctx.lineTo(-28, -20 + wag); ctx.stroke();
    }
    ctx.restore();
};

if (mVis) drawEntity(mX, mY, true, dir);
drawEntity(dX, groundY, false, dir);

// --- 8. SPEECH BUBBLES ---
if (mTxt || dTxt) {
    const t = mTxt || dTxt;
    const tx = mTxt ? mX : dX;
    const ty = mTxt ? mY - 120 : groundY - 60;
    ctx.font = \`italic bold \${minDim * 0.03}px Georgia\`;
    const tw = ctx.measureText(t).width + 30;
    ctx.fillStyle = mTxt ? "white" : "rgba(200, 200, 255, 0.7)";
    ctx.beginPath(); ctx.roundRect(tx - tw/2, ty - 40, tw, 40, 10); ctx.fill();
    ctx.fillStyle = "#000"; ctx.textAlign = "center";
    ctx.fillText(t, tx, ty - 12);
}

// Wet Asphalt
ctx.fillStyle = "#050505";
ctx.fillRect(-width, groundY, width * 3, height - groundY);

ctx.restore(); // Camera Restore

// --- 9. FADE TO BLACK ---
if (progress > 0.97) {
    ctx.fillStyle = \`rgba(0,0,0,\${(progress - 0.97) / 0.03})\`;
    ctx.fillRect(0, 0, width, height);
}
`;

function App() {
  const [config, setConfig] = useState<AnimationConfig>({
    width: 1280,
    height: 720,
    fps: 60,
    duration: 10,
    backgroundMode: 'black',
    backgroundColor: '#000000'
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [configAssetId, setConfigAssetId] = useState<string | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guiValues, setGuiValues] = useState<Record<string, any>>({});
  const [guiControls, setGuiControls] = useState<GuiControl[]>([]);
  const [audioCtx] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)());
  const [errors, setErrors] = useState<VibClipError[]>([]);
  const [timelineHeight, setTimelineHeight] = useState(250);
  const isResizingRef = useRef(false);

  const reportError = useCallback((error: Omit<VibClipError, 'id' | 'timestamp'>) => {
    setErrors(prev => {
      // Simple deduplication: don't add if the message and source are the same as any recent error (last 2s)
      const isDuplicate = prev.some(e =>
        e.source === error.source &&
        e.message === error.message &&
        Date.now() - e.timestamp < 2000
      );
      if (isDuplicate) return prev;

      return [...prev, {
        ...error,
        id: Math.random().toString(36).slice(2, 9),
        timestamp: Date.now()
      }];
    });
  }, []);

  const clearErrors = useCallback((source?: VibClipError['source']) => {
    if (source) {
      setErrors(prev => prev.filter(e => e.source !== source));
    } else {
      setErrors([]);
    }
  }, []);

  // Timeline Resizing Logic
  const handleTimelineResize = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const height = window.innerHeight - e.clientY;
    setTimelineHeight(Math.max(150, Math.min(height, window.innerHeight * 0.7)));
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
    document.body.style.cursor = 'default';
    window.removeEventListener('mousemove', handleTimelineResize);
    window.removeEventListener('mouseup', stopResizing);
  }, [handleTimelineResize]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'row-resize';
    window.addEventListener('mousemove', handleTimelineResize);
    window.addEventListener('mouseup', stopResizing);
  }, [handleTimelineResize, stopResizing]);

  const {
    assets, addAsset, removeAsset, toggleAsset, toggleMute, renameAsset, updateAsset, reorderAssets
  } = useAssets(DEFAULT_CODE);

  // Dynamic Duration: Auto-expand config.duration based on assets
  useEffect(() => {
    if (assets.length === 0) return;

    // Calculate the latest end time of any asset
    const maxAssetEndTime = assets.reduce((max, asset) => {
      // Default duration to 10s for scripts if not specified
      const dur = asset.metadata.duration || (asset.type === 'script' ? 10 : 0);
      const end = (asset.startOffset || 0) + dur;
      return end > max ? end : max;
    }, 0);

    // ONLY expand duration if it's too short. Never automatically shrink it, 
    // to allow manual overrides (like the Assistant setting a 60s length).
    const minNeeded = Math.max(10, Math.ceil(maxAssetEndTime));

    if (minNeeded > config.duration) {
      // Use setConfig with prev callback for safety
      setConfig(prev => {
        if (minNeeded > prev.duration) {
          return { ...prev, duration: minNeeded };
        }
        return prev;
      });
    }
  }, [assets, config.duration]);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(!apiKey);
  const [agentMode, setAgentMode] = useState<'fast' | 'planning'>(
    (localStorage.getItem('gemini_agent_mode') as 'fast' | 'planning') || 'fast'
  );

  const handleSaveConfig = (key: string, mode: 'fast' | 'planning') => {
    setApiKey(key);
    setAgentMode(mode);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_agent_mode', mode);
    setShowSettings(false);
  };

  const handleAddAsset = (assets: Omit<Asset, 'id' | 'enabled' | 'analysis'> | Omit<Asset, 'id' | 'enabled' | 'analysis'>[]) => {
    return addAsset(assets);
  };

  const handleAssetUpdateWithSync = useCallback((id: string, updates: Partial<Asset>) => {
    // 1. Update the asset state
    updateAsset(id, updates);

    // 2. Identify script and perform bidirectional sync
    const asset = assets.find(a => a.id === id);
    if (asset && asset.type === 'script') {
      let newCode = updates.content !== undefined ? updates.content : asset.content;

      // A. If content changed (e.g. from Editor or Agent), sync TO metadata
      if (updates.content !== undefined) {
        const metadataFromCode = parseScriptMetadata(updates.content);
        const metadataUpdates: Partial<Asset> = {};
        let syncNeeded = false;

        if (metadataFromCode.start !== undefined && metadataFromCode.start !== asset.startOffset) {
          metadataUpdates.startOffset = metadataFromCode.start;
          syncNeeded = true;
        }
        if (metadataFromCode.duration !== undefined && (asset.metadata?.duration !== metadataFromCode.duration)) {
          metadataUpdates.metadata = { ...asset.metadata, ...metadataFromCode };
          syncNeeded = true;
        }

        if (syncNeeded) {
          updateAsset(id, metadataUpdates);
        }
      }

      // B. If metadata changed (e.g. from Timeline drag or AssetModal), sync TO code
      if (updates.startOffset !== undefined || (updates.metadata && updates.metadata.duration !== undefined)) {
        const durationUpdate = updates.metadata?.duration;
        const startUpdate = updates.startOffset;

        const filteredUpdates = {
          start: startUpdate,
          duration: durationUpdate
        };

        const updatedCode = updateScriptMetadata(newCode || '', filteredUpdates);

        if (updatedCode !== newCode) {
          updateAsset(id, { content: updatedCode });
        }
      }
    }
  }, [assets, updateAsset]);

  const handleSaveScript = useCallback((content: string) => {
    if (editingAssetId) {
      handleAssetUpdateWithSync(editingAssetId, { content });
      setEditingAssetId(null);
    }
  }, [editingAssetId, handleAssetUpdateWithSync]);

  const handleAddScript = useCallback(() => {
    const id = Math.random().toString(36).substr(2, 9);
    const content = '/* @vibclip duration: 10.00, start: 0.00 */\n// Write your cinematic logic here\n';
    addAsset({
      name: `script_${(assets.filter(a => a.type === 'script').length).toString().padStart(2, '0')}`,
      type: 'script',
      content,
      url: '',
      element: null,
      muted: false,
      metadata: {
        mimeType: 'text/javascript',
        ...parseScriptMetadata(content)
      }
    });
    setTimeout(() => setEditingAssetId(id), 0);
  }, [assets, addAsset]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  const appActions = useAppActions(
    config,
    setConfig,
    assets,
    { addAsset, updateAsset: handleAssetUpdateWithSync, removeAsset },
    { setIsPlaying, setCurrentTime },
    setGuiValues,
    { errors, reportError, clearErrors }
  );

  const { messages, sendMessage, isProcessing } = useAgent(appActions, apiKey, agentMode);

  // Audio Analysis Management
  const analysersRef = useRef<Map<string, {
    analyser: AnalyserNode,
    pannerNode: StereoPannerNode,
    gainNode: GainNode,
    dataArray: Uint8Array,
    timeDataArray: Uint8Array
  }>>(new Map());

  useEffect(() => {
    if (!audioCtx) return;

    assets.forEach(asset => {
      if ((asset.type === 'audio' || asset.type === 'video') && asset.element instanceof HTMLMediaElement) {
        // Automatically create source node if missing
        if (!asset.audioSourceNode) {
          try {
            asset.audioSourceNode = audioCtx.createMediaElementSource(asset.element);
            // Unmute the element so audio flows through the node
            asset.element.muted = false;
          } catch (e) {
            console.warn(`Could not create media source for ${asset.name}:`, e);
          }
        }

        if (asset.audioSourceNode && !analysersRef.current.has(asset.id)) {
          const analyser = audioCtx.createAnalyser();
          const pannerNode = audioCtx.createStereoPanner();
          const gainNode = audioCtx.createGain();
          analyser.fftSize = 256;

          try { asset.audioSourceNode.connect(analyser); } catch (e) { }

          analyser.connect(pannerNode);
          pannerNode.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          analysersRef.current.set(asset.id, {
            analyser,
            pannerNode,
            gainNode,
            dataArray: new Uint8Array(analyser.frequencyBinCount),
            timeDataArray: new Uint8Array(analyser.frequencyBinCount)
          });
        }
      }
    });

    // Cleanup analysers for removed assets
    const assetIds = new Set(assets.map(a => a.id));
    analysersRef.current.forEach((_, id) => {
      if (!assetIds.has(id)) {
        const data = analysersRef.current.get(id);
        if (data) {
          try { data.gainNode.disconnect(); } catch (e) { }
          try { data.analyser.disconnect(); } catch (e) { }
        }
        analysersRef.current.delete(id);
      }
    });
  }, [assets, audioCtx]);

  const {
    exportStandard,
    isExporting,
    progress: exportProgress
  } = useExport(setCurrentTime, () => audioCtx);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined && isPlaying) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const deltaTime = (time - lastTimeRef.current) / 1000;
      setCurrentTime(prev => {
        const next = prev + deltaTime;
        if (next >= config.duration) {
          setIsPlaying(false);
          return config.duration;
        }
        return next;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, config.duration]);

  const handleRegisterControls = useCallback((controls: GuiControl[]) => {
    setGuiControls(prev => {
      // Check if the controls actually changed (shallow ID+Value check)
      if (prev.length === controls.length &&
        prev.every((c, i) => c.id === controls[i].id && c.value === controls[i].value)) {
        return prev;
      }
      return controls;
    });

    setGuiValues(prev => {
      const newValues: Record<string, any> = { ...prev };
      let changed = false;
      controls.forEach(control => {
        if (newValues[control.id] !== control.value) {
          newValues[control.id] = control.value;
          changed = true;
        }
      });
      return changed ? newValues : prev;
    });
  }, []);

  const handleGuiChange = (id: string, value: any) => {
    setGuiValues(prev => ({ ...prev, [id]: value }));
  };

  const currentEditingAsset = useMemo(() =>
    assets.find(a => a.id === editingAssetId),
    [assets, editingAssetId]);


  const handleExport = async (_type: 'standard') => {
    try {
      const canvas = canvasRef.current;
      if (canvas) await exportStandard(canvas, config, assets, analysersRef.current);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed. Check console for details.');
    } finally {
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)'
    }}>

      {/* 1. LEFT SIDEBAR: Configuration, Assets & Export */}
      <div className="sidebar-container glass-panel" style={{
        width: '320px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Toolbar
            config={config}
            setConfig={setConfig}
            onExport={handleExport}
            isExporting={isExporting}
            progress={exportProgress}

            // API Key Settings
            onOpenSettings={() => setShowSettings(true)}

            // Asset Props
            assets={assets}
            onAddAsset={handleAddAsset}
            onRemoveAsset={removeAsset}
            onToggleAsset={toggleAsset}
            onToggleMute={toggleMute}
            onRenameAsset={renameAsset}
            onAddScript={handleAddScript}
            onEditAsset={setEditingAssetId}
            onReorderAssets={reorderAssets}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onUpdateAsset={handleAssetUpdateWithSync}
            onOpenConfig={setConfigAssetId}
          />
        </div>
      </div>

      {/* WRAPPER: Top (Preview+Assistant) + Bottom (Timeline) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* TOP AREA: Preview & Assistant */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* CENTER: Preview & Input */}
          <main style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            position: 'relative',
            minWidth: 0,
            background: 'radial-gradient(circle at 50% 30%, #1a1f35 0%, #0B0F1A 70%)',
            overflowY: 'auto'
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              marginBottom: '24px'
            }}>
              <Preview
                config={config}
                canvasRef={canvasRef}
                assets={assets}
                isPlaying={isPlaying}
                currentTime={currentTime}
                isExporting={isExporting}
                guiValues={guiValues}
                onRegisterControls={handleRegisterControls}
                analysers={analysersRef.current}
                reportError={reportError}
                clearErrors={clearErrors}
              />
            </div>



            <div style={{
              height: 'auto',
              minHeight: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              flexShrink: 0
            }}>
              <AgentChatInput
                onSendMessage={sendMessage}
                isProcessing={isProcessing}
              />
            </div>

            {guiControls.length > 0 && (
              <GuiPanel
                controls={guiControls}
                values={guiValues}
                onChange={handleGuiChange}
              />
            )}
          </main>

          {/* RIGHT SIDEBAR: VibClip Assistant */}
          <div className="right-sidebar glass-panel" style={{
            width: '300px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--border-color)',
            zIndex: 50
          }}>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <AgentChatHistory
                messages={messages}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* RESIZE HANDLE */}
        <div
          onMouseDown={startResizing}
          style={{
            height: '4px',
            background: 'var(--border-color)',
            cursor: 'row-resize',
            zIndex: 100,
            transition: 'background 0.2s',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--border-color)'}
        >
          <div style={{
            position: 'absolute',
            top: '-4px',
            bottom: '-4px',
            left: 0,
            right: 0
          }} />
        </div>

        {/* BOTTOM AREA: Timeline */}
        <div style={{ flex: `0 0 ${timelineHeight}px`, height: `${timelineHeight}px`, overflow: 'hidden' }}>
          <Timeline
            assets={assets}
            config={config}
            currentTime={currentTime}
            onSeek={setCurrentTime}
            onUpdateAsset={handleAssetUpdateWithSync}
            onSelectAsset={setSelectedTimelineId}
            onEditAsset={setEditingAssetId}
            selectedAssetId={selectedTimelineId}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </div>

      </div>

      {/* Settings Modal (Overlay) */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: '#111827',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #374151',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '16px' }}>VibClip Configuration</h3>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '24px' }}>
              Enter your Google Gemini API Key to enable the AI Assistant.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Gemini API Key</label>
                <input
                  id="settings-api-key"
                  type="password"
                  defaultValue={apiKey}
                  placeholder="AIza..."
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Agent Model Optimization</label>
                <select
                  id="settings-agent-mode"
                  defaultValue={agentMode}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'white',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="fast">⚡ Fast (Analysis & Quick Fixes)</option>
                  <option value="planning">🎬 Planning (Multi-Scene Direction)</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                const key = (document.getElementById('settings-api-key') as HTMLInputElement).value;
                const mode = (document.getElementById('settings-agent-mode') as HTMLSelectElement).value as any;
                handleSaveConfig(key, mode);
              }}
              style={{
                width: '100%',
                backgroundColor: '#9333ea',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Save & Start
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CodeEditorModal
        isOpen={!!editingAssetId}
        onClose={() => setEditingAssetId(null)}
        initialCode={currentEditingAsset?.content || ''}
        onSave={handleSaveScript}

        title={currentEditingAsset?.name || 'Edit Script'}
      />

      {/* Asset Config Modal */}
      {configAssetId && assets.find(a => a.id === configAssetId) && (
        <AssetConfigModal
          isOpen={true}
          onClose={() => setConfigAssetId(null)}
          asset={assets.find(a => a.id === configAssetId)!}
          onUpdate={(updates) => handleAssetUpdateWithSync(configAssetId, updates)}
        />
      )}

      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAsset={(asset) => {
          handleAddAsset(asset);
          setIsAddModalOpen(false);
        }}
        onAddScript={() => {
          handleAddScript();
          setIsAddModalOpen(false);
        }}
        assetsCount={assets.length}
        audioCtx={audioCtx}
      />
    </div>
  );
}

export default App;
