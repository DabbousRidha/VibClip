export type BackgroundMode = 'transparent' | 'black' | 'white' | 'custom';
import type { Brand } from './utils/brand';

export interface AssetDrawingOptions {
    opacity?: number;
    blendMode?: GlobalCompositeOperation;
    flipX?: boolean;
    flipY?: boolean;
    smoothing?: boolean;
    crop?: { x: number; y: number; w: number; h: number };
    filters?: string;
    fit?: 'contain' | 'cover';
}

export type AssetType = 'image' | 'video' | 'audio' | 'script' | 'other';

export interface AudioAnalysis {
    volume: number;      // 0-1
    bass: number;        // 0-1
    mid: number;         // 0-1
    treble: number;      // 0-1
    spectrum: number[];  // float array
    waveform: number[];  // float array
}

export interface AssetMetadata {
    width?: number;
    height?: number;
    aspectRatio?: number;
    duration?: number;
    size?: number;
    mimeType: string;
    // Overrides for Script Context
    fps?: number;
    backgroundColor?: string;
    backgroundMode?: BackgroundMode;
}

export interface VibClipError {
    id: string;
    source: 'runtime' | 'system';
    message: string;
    assetId?: string;
    timestamp: number;
    stack?: string;
}

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    url: string;
    element: HTMLImageElement | HTMLVideoElement | HTMLAudioElement | null;
    audioSourceNode?: MediaElementAudioSourceNode | null;
    enabled: boolean;
    muted: boolean;
    metadata: AssetMetadata;
    analysis?: AudioAnalysis; // Only for audio
    audioBuffer?: AudioBuffer; // Decoded audio for export/processing
    content?: string; // For script assets

    // Playback & Drawing Options (v3.1)
    playbackRate?: number;
    volume?: number;
    loop?: boolean;
    preservePitch?: boolean;
    startOffset?: number;
    pan?: number;

    // Visual Composition Properties (v4.0)
    visible?: boolean;
    x?: number;
    y?: number;
    width?: number | 'auto';
    height?: number | 'auto';
    scale?: number;
    rotation?: number;
    opacity?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'none';
    flipX?: boolean;
    flipY?: boolean;
    blendMode?: GlobalCompositeOperation;
}

export interface AnimationConfig {
    width: number;
    height: number;
    fps: number;
    duration: number; // in seconds
    backgroundMode: BackgroundMode;
    backgroundColor: string;
}

export interface PlaybackState {
    currentTime: number;
    isPlaying: boolean;
}


export interface InteractionState {
    mouse: { x: number; y: number; down: boolean };
    pointer: { x: number; y: number; velocityX: number; velocityY: number };
}

export interface RenderSettings {
    background: BackgroundMode;
    backgroundColor: string;
    alpha: boolean;
    pixelRatio: number;
    motionBlurSamples: number;
}

export interface CameraState {
    x: number;
    y: number;
    zoom: number;
    rotation: number;
}

export interface CameraSystem extends CameraState {
    use: (fn: () => void) => void;
    follow: (x: number, y: number, damping: number) => void;
    shake: (intensity: number) => void;
    screenToWorld: (x: number, y: number) => { x: number; y: number };
    worldToScreen: (x: number, y: number) => { x: number; y: number };
}

export interface SpringSettings {
    stiffness: number;
    damping: number;
    mass: number;
}

export interface PhysicsSystem {
    spring: (current: number, target: number, velocity: number, settings?: Partial<SpringSettings>) => { value: number; velocity: number };
    lerpAngle: (a: number, b: number, t: number) => number;
    lookAt: (current: number, target: number, speed: number) => number;
}

export interface ColorSystem {
    lerp: (colorA: string, colorB: string, t: number) => string;
    palette: (name: string, index: number) => string;
    toHSL: (color: string) => { h: number; s: number; l: number; a: number };
    toRGB: (color: string) => { r: number; g: number; b: number; a: number };
}

export interface FxSystem {
    vignette: (intensity: number, color?: string) => void;
    bloom: (intensity: number, radius?: number) => void;
    grain: (intensity: number) => void;
    chromatic: (intensity: number) => void;
    crt: (intensity: number) => void;
    particles: {
        emitter: (x: number, y: number, type: 'snow' | 'rain' | 'fire' | 'stars' | 'bubbles', count?: number) => void;
    };
}

export interface Particle {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

export interface TimelineSystem {
    play: (duration: number, cb: (t: number) => void) => void;
    at: (time: number, callback: () => void) => void;
    range: (start: number, end: number, run: (t: number) => void) => void;
    sequence: (scenes: { duration: number; run: (t: number) => void }[]) => void;
    reset?: () => void;
}

export interface TextSystem {
    draw: (text: string, x: number, y: number, options?: {
        font?: string;
        align?: CanvasTextAlign;
        color?: string;
        size?: number;
        outlineWidth?: number;
        outlineColor?: string;
        wrapWidth?: number;
    }) => void;
    glitch: (text: string, x: number, y: number, intensity: number) => void;
    block: (text: string, x: number, y: number, width: number, options?: {
        font?: string;
        align?: 'left' | 'center' | 'right' | 'justify';
        color?: string;
        size?: number;
        lineHeight?: number;
        outlineWidth?: number;
        outlineColor?: string;
        markdown?: boolean;
    }) => void;
    fit: (text: string, x: number, y: number, width: number, height: number, options?: {
        minSize?: number;
        maxSize?: number;
        font?: string;
        align?: 'left' | 'center' | 'right' | 'justify';
        color?: string;
        lineHeight?: number;
        markdown?: boolean;
    }) => void;
}

export interface GuiControl {
    id: string;
    label: string;
    type: 'slider' | 'color' | 'checkbox' | 'button' | 'select';
    min?: number;
    max?: number;
    options?: string[];
    value: any;
}

export interface GuiSystem {
    slider: (label: string, min: number, max: number, initial?: number) => number;
    color: (label: string, initial?: string) => string;
    checkbox: (label: string, initial?: boolean) => boolean;
    button: (label: string) => boolean;
}

// Smart Image System
export interface SmartImageOptions {
    position?: 'center' | 'center-left' | 'center-right' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    zone?: { x: number; y: number; width: number; height: number };
    fill?: number;
    fit?: 'contain' | 'cover';
    border?: { width: number; color: string; radius?: number };
    shadow?: { blur: number; color: string; offsetX?: number; offsetY?: number };
    glow?: { color: string; intensity: number };
    entrance?: 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'fade' | 'zoom' | 'bounce';
    progress?: number;
    duration?: number;
    delay?: number;
    crop?: {
        focus?: { x: number; y: number };
        scale?: number;
    };
}

// Layout System
export interface LayoutSystem {
    splitScreen: (options: {
        image: string;
        title: string;
        description?: string;
        bullets?: string[];
        layout?: 'horizontal' | 'vertical';
        imagePosition?: 'left' | 'right' | 'top' | 'bottom';
        imageSplit?: number;
        padding?: number;
        animate?: boolean;
        animationProgress?: number;
        titleSize?: number;
        descSize?: number;
        titleColor?: string;
        descColor?: string;
    }) => void;

    grid: (options: {
        images: string[];
        columns?: number;
        rows?: number;
        gap?: number;
        padding?: number;
        fit?: 'contain' | 'cover';
        captions?: string[];
        stagger?: number;
        entrance?: 'fade' | 'zoom' | 'slide';
        animationProgress?: number;
    }) => void;
}

// Slide Templates
export interface SlideSystem {
    imageContent: (options: {
        image: string;
        title: string;
        description?: string;
        bullets?: string[];
        layout?: 'image-left' | 'image-right' | 'image-top' | 'image-bottom';
        imageSplit?: number;
        padding?: number;
        animate?: boolean;
        animationProgress?: number;
    }) => void;

    comparison: (options: {
        before: string;
        after: string;
        labels?: [string, string];
        title?: string;
        splitPosition?: number;
        vertical?: boolean;
    }) => void;

    hero: (options: {
        image: string;
        caption?: string;
        overlay?: 'dark' | 'light' | 'gradient' | 'none';
        overlayOpacity?: number;
        captionPosition?: 'center' | 'bottom' | 'top';
        captionSize?: number;
    }) => void;

    timeline: (options: {
        items: { date: string; title: string; description?: string }[];
        color?: string;
        textColor?: string;
        progress?: number;
        orientation?: 'horizontal' | 'vertical';
    }) => void;

    teamMember: (options: {
        image: string;
        name: string;
        role: string;
        bio?: string;
        color?: string;
        align?: 'left' | 'right' | 'center';
    }) => void;

    testimonial: (options: {
        quote: string;
        author: string;
        role?: string;
        image?: string;
        color?: string;
        bgOpacity?: number;
        style?: 'modern' | 'classic' | 'minimal';
    }) => void;

    productShowcase: (options: {
        image: string;
        hotspots?: { x: number; y: number; label: string; position?: 'top' | 'bottom' | 'left' | 'right' }[];
        title?: string;
        price?: string;
        description?: string;
        color?: string;
        animationProgress?: number;
    }) => void;

    collage: (options: {
        images: string[];
        layout?: 'masonry' | 'scatter' | 'filmstrip';
        spacing?: number;
        bgImage?: string;
    }) => void;

    magazine: (options: {
        image: string;
        headline: string;
        subheadline?: string;
        text?: string;
        layout?: 'classic' | 'modern' | 'split';
        themeColor?: string;
    }) => void;
}

export interface MotionSystem {
    // Charts & Data
    drawBarChart: (data: number[], options?: { x?: number, y?: number, w?: number, h?: number, color?: string, stagger?: number, reveal?: 'grow' | 'fade' }) => void;
    drawLineChart: (data: number[], options?: { x?: number, y?: number, w?: number, h?: number, color?: string, thickness?: number, reveal?: 'trace' | 'fade' }) => void;
    drawDonutChart: (data: { label: string, value: number }[], options?: { x?: number, y?: number, radius?: number, thickness?: number, colors?: string[] }) => void;
    drawRadarChart: (labels: string[], values: number[], options?: { x?: number, y?: number, radius?: number, color?: string, bgOpacity?: number }) => void;
    numericDashboard: (stats: { label: string, value: number, prefix?: string, suffix?: string }[], options?: { x?: number, y?: number, w?: number, columns?: number }) => void;
    animatedCounter: (value: number, options?: { x?: number, y?: number, size?: number, color?: string, prefix?: string, suffix?: string, decimals?: number }) => void;
    progressRing: (progress: number, options?: { x?: number, y?: number, radius?: number, thickness?: number, color?: string, bgOpacity?: number }) => void;

    // Text & Information
    bulletReveal: (items: string[], t: number, options?: { x?: number, y?: number, size?: number, color?: string, spacing?: number, stagger?: number }) => void;
    cinematicTitle: (text: string, t: number, options?: { x?: number, y?: number, size?: number, color?: string, style?: 'glitch' | 'fade' | 'slide' | 'mask' }) => void;
    kineticType: (text: string, options?: { x?: number, y?: number, size?: number, color?: string, duration?: number }) => void;
    lowerThird: (text: string, subtext: string, options?: { x?: number, y?: number, color?: string, accentColor?: string, side?: 'left' | 'right' }) => void;
    quoteCard: (quote: string, author: string, options?: { x?: number, y?: number, w?: number, color?: string, bgOpacity?: number }) => void;
    callout: (label: string, targetX: number, targetY: number, options?: { x?: number, y?: number, color?: string, dotSize?: number }) => void;
    processSequence: (steps: string[], progress: number, options?: { x?: number, y?: number, w?: number, color?: string, activeColor?: string }) => void;

    // Backgrounds & Ambiance
    drawGrid: (options?: { size?: number, color?: string, opacity?: number, thickness?: number, pulseIntensity?: number }) => void;
    ambientBackground: (type: 'particles' | 'noise' | 'fog', intensity?: number, color?: string) => void;
    ambientWeather: (type: 'snow' | 'rain' | 'dust' | 'bokeh', intensity?: number) => void;
    fluidBackground: (colors: string[], options?: { speed?: number, scale?: number }) => void;

    // Layout & Asset Composition
    assetReveal: (name: string, options?: { x?: number, y?: number, w?: number, h?: number, type?: 'pop' | 'slide' | 'zoom', delay?: number, duration?: number }) => void;
    comparisonSplit: (assetA: string, assetB: string, progress: number, options?: { vertical?: boolean, labelA?: string, labelB?: string }) => void;

    // Cinematic Effects & Filters
    vignette: (intensity: number, options?: { color?: string }) => void;
    screenImpact: (intensity: number) => void;
    glitchOverlay: (intensity: number, seed?: number) => void;
    lensDistortion: (intensity?: number) => void;
    spotlight: (x: number, y: number, radius: number, options?: { color?: string, bgOpacity?: number }) => void;
    transition: (type?: 'fade' | 'slide' | 'wipe', duration?: number, options?: { progress?: number, color?: string }) => void;
    audioReactive: (param: 'scale' | 'opacity' | 'y', band?: 'bass' | 'mid' | 'high') => number;
    smartLayout: (name: string, options?: { margin?: number, fit?: 'contain' | 'cover', align?: 'center' | 'left' | 'right' }) => void;

    // Utilities & Branding
    watermark: (name: string, options?: { x?: number, y?: number, w?: number, h?: number, opacity?: number, position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }) => void;
    timelineProgress: (progress: number, options?: { height?: number, color?: string, position?: 'top' | 'bottom' }) => void;
}

// Model System (Standalone Reusable Components)
export interface ModelOptions {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
    flipX?: boolean;
    flipY?: boolean;
    props?: Record<string, any>; // Custom properties for the model
    parts?: Record<string, Partial<ModelOptions>>; // Target internal sections
    cache?: boolean; // Enable offscreen rendering for performance
    interaction?: {
        onHover?: (event: { x: number, y: number }) => void;
        onClick?: (event: { x: number, y: number }) => void;
    };
    id?: string; // Optional instance ID for tracking local state/springs
}

export interface HitZone {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ModelSystem {
    define: (name: string, drawFn: (props: any, context: AnimationContext) => void) => void;
    draw: (name: string, options?: ModelOptions) => void;
    clearCache: (name?: string) => void;
    state: (key: string, initial: any) => { get: () => any, set: (val: any) => void };
    spring: (id: string, target: number, settings?: any) => number;
}

export interface CinematicState {
    camera: CameraState;
    physics: Record<string, { value: number; velocity: number }>;
    particles: Particle[];
    guiValues: Record<string, any>;
}

export type EaseType =
    | 'linear' | 'inQuad' | 'outQuad' | 'inOutQuad' | 'inCubic' | 'outCubic' | 'inOutCubic'
    | 'inQuart' | 'outQuart' | 'inOutQuart' | 'inQuint' | 'outQuint' | 'inOutQuint'
    | 'inSine' | 'outSine' | 'inOutSine' | 'inExpo' | 'outExpo' | 'inOutExpo'
    | 'inCirc' | 'outCirc' | 'inOutCirc' | 'inBack' | 'outBack' | 'inOutBack'
    | 'inElastic' | 'outElastic' | 'inOutElastic' | 'inBounce' | 'outBounce' | 'inOutBounce';

export interface AnimationContext {
    // Standard
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    time: number;
    frame: number;
    assets: Record<string, any>;

    // Timeline
    duration: number;
    fps: number;
    progress: number;
    loopCount: number;
    deltaTime: number;

    // Space
    centerX: number;
    centerY: number;
    minDim: number;
    maxDim: number;
    aspect: number;

    // Input (Preview)
    mouse: InteractionState['mouse'];
    pointer: InteractionState['pointer'];

    // Random
    seed: number;
    rand: () => number;
    noise: (x: number, y?: number, t?: number) => number;

    // Math & Motion
    PI: number;
    TAU: number;
    degToRad: (deg: number) => number;
    radToDeg: (rad: number) => number;
    lerp: (a: number, b: number, t: number) => number;
    clamp: (v: number, min: number, max: number) => number;
    remap: (v: number, inMin: number, inMax: number, outMin: number, outMax: number) => number;
    step: (t: number, count: number) => number;
    range: (start: number, end: number) => number;
    ease: (type: EaseType, t: number) => number;

    // Drawing Shorthands
    rect: (x: number, y: number, w: number, h: number, options?: number | { r?: number, fill?: boolean, stroke?: boolean, lineWidth?: number, color?: string | CanvasGradient | CanvasPattern }) => void;
    circle: (x: number, y: number, r: number, options?: { fill?: boolean, stroke?: boolean, lineWidth?: number, color?: string | CanvasGradient | CanvasPattern }) => void;
    line: (x1: number, y1: number, x2: number, y2: number, options?: { lineWidth?: number, cap?: CanvasLineCap, color?: string | CanvasGradient | CanvasPattern }) => void;
    poly: (points: [number, number][], options?: { close?: boolean, fill?: boolean, stroke?: boolean, lineWidth?: number, color?: string | CanvasGradient | CanvasPattern }) => void;
    video: (name: string, x: number, y: number, w?: number, h?: number, options?: AssetDrawingOptions) => void;
    image: {
        (name: string, x: number, y: number, w?: number, h?: number, options?: AssetDrawingOptions): void;
        smart: (name: string, options?: SmartImageOptions) => void;
    };

    // Transform Helpers
    flip: (x: boolean, y: boolean) => void;
    transform: (fn: () => void) => void;

    // Render
    render: RenderSettings;

    // Advanced
    prevFrame: CanvasImageSource | null;
    getPixel: (x: number, y: number) => [number, number, number, number];
    setPixel: (x: number, y: number, r: number, g: number, b: number, a: number) => void;

    // Camera
    camera: CameraSystem;

    // Subsystems
    physics: PhysicsSystem;
    color: ColorSystem;
    fx: FxSystem;
    timeline: TimelineSystem;
    text: TextSystem;
    gui: GuiSystem;
    layout: LayoutSystem;
    slides: SlideSystem;
    motion: MotionSystem;
    models: ModelSystem;

    // Model Helpers (available in Model blueprints)
    part: (name: string, drawPartFn: () => void) => void;
    spring: (id: string, target: number, settings?: any) => number;
    state: (key: string, initial: any) => { get: () => any, set: (val: any) => void };

    // State & Metadata
    passIndex: number;
    isFirstFrame: boolean;
    isLastFrame: boolean;

    // Responsive
    isMobile: boolean;
    isPortrait: boolean;
    isLandscape: boolean;
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

    // Brand
    brandKit: Brand;
}

export interface AnimationState {
    code: string;
    config: AnimationConfig;
}
