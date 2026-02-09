import type {
    AnimationConfig, AnimationContext, InteractionState, EaseType,
    CinematicState, AssetDrawingOptions, GuiControl, ColorSystem, Asset
} from '../types';
import { createRand, createNoise, easingFunctions } from './mathUtils';
import { palettes, toHSL, toRGB, lerpColor } from './colorUtils';

import { createMotionSystem } from './motionComponents';
// Subsystems
import { createCameraSystem } from './systems/camera';
import { createPhysicsSystem } from './systems/physics';
import { createFxSystem } from './systems/fx';
import { createTimelineSystem } from './systems/timeline';
import { createTextSystem } from './systems/text';
import { createGuiSystem } from './systems/gui';
// New Marketing Systems
import { createSmartImage } from './imageHelpers';
import { BrandPresets, DefaultBrand } from './brand';
import { createLayoutSystem } from './layout';
import { createSlideTemplates } from './slides';
import { createModelSystem } from './models';

/**
 * Generic asset drawer for both auto-render and manual script calls.
 * Centers the asset based on its visual properties.
 */
export const drawAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    el: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    config: AnimationConfig,
    time: number
) => {
    const x = asset.x ?? 0;
    const y = asset.y ?? 0;
    const opacity = asset.opacity ?? 1;
    const blendMode = asset.blendMode ?? 'source-over';
    const rotation = (asset.rotation ?? 0) * (Math.PI / 180);
    const scale = asset.scale ?? 1;
    const flipX = asset.flipX ?? false;
    const flipY = asset.flipY ?? false;
    const fit = asset.fit ?? 'contain';

    // Timing check for video
    if (asset.type === 'video' && el instanceof HTMLVideoElement) {
        const offset = asset.startOffset ?? 0;
        const rate = asset.playbackRate ?? 1;
        const activeTime = (time - offset) * rate;
        const duration = asset.metadata?.duration || el.duration || 0;
        if (activeTime < 0 || (!asset.loop && duration > 0 && activeTime > duration)) return;
    } else if (asset.type === 'image') {
        const offset = asset.startOffset ?? 0;
        if (time < offset) return;
    }

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = blendMode;

    // We translate to center + offset
    ctx.translate(config.width / 2 + x, config.height / 2 + y);
    ctx.rotate(rotation);
    ctx.scale(scale * (flipX ? -1 : 1), scale * (flipY ? -1 : 1));

    const imgW = asset.metadata.width || (el instanceof HTMLVideoElement ? el.videoWidth : (el as any).naturalWidth) || el.width || 0;
    const imgH = asset.metadata.height || (el instanceof HTMLVideoElement ? el.videoHeight : (el as any).naturalHeight) || el.height || 0;

    if (imgW > 0 && imgH > 0) {
        let drawW = asset.width === 'auto' || asset.width === undefined ? imgW : asset.width as number;
        let drawH = asset.height === 'auto' || asset.height === undefined ? imgH : asset.height as number;

        if (fit === 'contain' || fit === 'cover') {
            const ratio = imgW / imgH;
            const canvasRatio = config.width / config.height;
            if (fit === 'contain') {
                if (ratio > canvasRatio) {
                    drawW = config.width;
                    drawH = drawW / ratio;
                } else {
                    drawH = config.height;
                    drawW = drawH * ratio;
                }
            } else { // cover
                if (ratio > canvasRatio) {
                    drawH = config.height;
                    drawW = drawH * ratio;
                } else {
                    drawW = config.width;
                    drawH = drawW / ratio;
                }
            }
        }

        ctx.drawImage(el, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.restore();
};

/**
 * Executes a pass over all visual assets that are enabled and marked visible.
 * Used by both Preview and Offline Export Engines.
 */
export const autoRenderPass = (
    ctx: CanvasRenderingContext2D,
    assets: Asset[],
    assetMap: Record<string, any>,
    config: AnimationConfig,
    time: number
) => {
    assets.forEach(asset => {
        if (asset.enabled && asset.visible && (asset.type === 'image' || asset.type === 'video')) {
            const el = assetMap[asset.name];
            if (el) {
                drawAsset(ctx, asset, el as any, config, time);
            }
        }
    });
};

/**
 * Main engine factory that provides the cinematic runtime context to script assets.
 */
export const getAnimationContext = (
    ctx: CanvasRenderingContext2D,
    time: number,
    frame: number,
    config: AnimationConfig,
    assets: Record<string, any>,
    interaction: InteractionState,
    prevFrame: CanvasImageSource | null,
    deltaTime: number,
    cinematicState: CinematicState,
    options: {
        alpha?: boolean;
        passIndex?: number;
        registeredControls?: GuiControl[];
        brand?: string;
    } = {}
): AnimationContext => {
    const { width, height, fps, duration } = config;

    const seed = 12345;
    const rand = createRand(seed);
    const noise = createNoise(rand);

    const progress = Math.min(1, time / duration);
    const loopCount = Math.floor(time / duration);

    const centerX = width / 2;
    const centerY = height / 2;
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    const aspect = width / height;

    // --- Subsystems Implementation ---
    const camera = createCameraSystem(ctx, cinematicState, centerX, centerY, time, noise);
    const physics = createPhysicsSystem(cinematicState);
    const fx = createFxSystem(ctx, cinematicState, width, height, centerX, centerY, maxDim, minDim, rand);
    const timeline = createTimelineSystem(time, frame, fps);
    const text = createTextSystem(ctx);
    const gui = createGuiSystem(cinematicState, options);

    // Shared reference for models to avoid circular dependency
    const modelsContextRef: any = { ctx, mouse: interaction.mouse, physics };
    const models = createModelSystem(modelsContextRef);

    const color: ColorSystem = {
        lerp: (a, b, t) => lerpColor(a, b, t),
        palette: (name, index) => {
            const p = palettes[name.toLowerCase()] || palettes.vibrant;
            return p[index % p.length];
        },
        toHSL: (str) => toHSL(str),
        toRGB: (str) => toRGB(str),
    };

    // Update existing particles
    cinematicState.particles = cinematicState.particles.filter(p => {
        p.life -= deltaTime / p.maxLife;
        p.x += p.vx;
        p.y += p.vy;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return p.life > 0;
    });

    let cachedImageData: ImageData | null = null;
    const getPixel = (x: number, y: number): [number, number, number, number] => {
        if (!prevFrame) return [0, 0, 0, 0];
        if (!cachedImageData) {
            if (prevFrame instanceof ImageData) {
                cachedImageData = prevFrame;
            } else {
                try {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = width;
                    tempCanvas.height = height;
                    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
                    if (tempCtx) {
                        tempCtx.drawImage(prevFrame, 0, 0);
                        cachedImageData = tempCtx.getImageData(0, 0, width, height);
                    }
                } catch (e) { return [0, 0, 0, 0]; }
            }
        }
        if (!cachedImageData) return [0, 0, 0, 0];
        const ix = Math.floor(x); const iy = Math.floor(y);
        if (ix < 0 || ix >= width || iy < 0 || iy >= height) return [0, 0, 0, 0];
        const offset = (iy * width + ix) * 4;
        return [cachedImageData.data[offset], cachedImageData.data[offset + 1], cachedImageData.data[offset + 2], cachedImageData.data[offset + 3]];
    };

    const setPixel = (x: number, y: number, r: number, g: number, b: number, a: number) => {
        const ix = Math.floor(x); const iy = Math.floor(y);
        if (ix < 0 || ix >= width || iy < 0 || iy >= height) return;
        const imageData = ctx.getImageData(ix, iy, 1, 1);
        imageData.data[0] = r; imageData.data[1] = g; imageData.data[2] = b; imageData.data[3] = a;
        ctx.putImageData(imageData, ix, iy);
    };

    const imageDrawer = (name: string, x: number, y: number, w?: number, h?: number, opts: AssetDrawingOptions = {}) => {
        const asset = assets[name]; if (!asset) return;
        const el = (asset instanceof HTMLImageElement || asset.tagName === 'IMG') ? asset : asset.element;
        if (el instanceof HTMLImageElement || el?.tagName === 'IMG') {
            const targetW = w ?? el.naturalWidth ?? el.width ?? 100;
            const targetH = h ?? el.naturalHeight ?? el.height ?? 100;

            // Only enforce startOffset for assets with visible:true (timeline-placed assets)
            // Library images (visible:false) controlled by script logic should bypass this check
            if (asset.visible !== false) {
                const offset = Number(asset.startOffset) || 0;
                if (time < offset) return;
            }

            ctx.save();
            ctx.globalAlpha = opts.opacity ?? 1;
            ctx.globalCompositeOperation = opts.blendMode ?? 'source-over';
            if (opts.flipX || opts.flipY) {
                ctx.translate(x + targetW / 2, y + targetH / 2);
                ctx.scale(opts.flipX ? -1 : 1, opts.flipY ? -1 : 1);
                ctx.translate(-(x + targetW / 2), -(y + targetH / 2));
            }
            if (opts.crop) ctx.drawImage(el, opts.crop.x, opts.crop.y, opts.crop.w, opts.crop.h, x, y, targetW, targetH);
            else ctx.drawImage(el, x, y, targetW, targetH);
            ctx.restore();
        }
    };

    const videoDrawer = (name: string, x: number, y: number, w?: number, h?: number, opts: AssetDrawingOptions = {}) => {
        const asset = assets[name]; if (!asset) return;
        const el = (asset instanceof HTMLVideoElement || asset.tagName === 'VIDEO') ? asset : asset.element;
        if (el instanceof HTMLVideoElement || el?.tagName === 'VIDEO') {
            const targetW = w ?? el.videoWidth ?? el.width ?? 100;
            const targetH = h ?? el.videoHeight ?? el.height ?? 100;
            const offset = Number(asset.startOffset) || 0;
            const rate = Number(asset.playbackRate) || 1;
            const activeTime = (time - offset) * rate;
            const duration = asset.metadata?.duration || el.duration || 0;
            if (activeTime < 0 || (!asset.loop && duration > 0 && activeTime > duration)) return;
            ctx.save();
            ctx.globalAlpha = opts.opacity ?? 1;
            ctx.globalCompositeOperation = opts.blendMode ?? 'source-over';
            if (opts.flipX || opts.flipY) {
                ctx.translate(x + targetW / 2, y + targetH / 2);
                ctx.scale(opts.flipX ? -1 : 1, opts.flipY ? -1 : 1);
                ctx.translate(-(x + targetW / 2), -(y + targetH / 2));
            }
            if (opts.crop) ctx.drawImage(el, opts.crop.x, opts.crop.y, opts.crop.w, opts.crop.h, x, y, targetW, targetH);
            else ctx.drawImage(el, x, y, targetW, targetH);
            ctx.restore();
        }
    };

    const rangeFn = (s: number, e: number) => {
        const d = e - s;
        if (d <= 0) return time >= s ? 1 : 0;
        return Math.max(0, Math.min(1, (time - s) / d));
    };

    const easeFn = (type: EaseType, t: number) => (easingFunctions[type] || easingFunctions.linear)(t);
    const transformFn = (fn: () => void) => { ctx.save(); fn(); ctx.restore(); };

    // Initialize Brand Early
    const brandKit = options.brand ? (typeof options.brand === 'string' ? BrandPresets[options.brand] || DefaultBrand : options.brand) : DefaultBrand;

    const returnContext: AnimationContext = {
        ctx, width, height, time, frame, assets, duration, fps, progress, loopCount, deltaTime,
        centerX, centerY, minDim, maxDim, aspect,
        mouse: interaction.mouse, pointer: interaction.pointer, seed, rand, noise,
        PI: Math.PI, TAU: Math.PI * 2, degToRad: (deg: number) => (deg * Math.PI) / 180, radToDeg: (rad: number) => (rad * 180) / Math.PI,
        lerp: (a: number, b: number, t: number) => a + (b - a) * t,
        clamp: (v: number, min: number, max: number) => Math.min(Math.max(v, min), max),
        remap: (v: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
            const t = (v - inMin) / (inMax - inMin);
            return outMin + (outMax - outMin) * t;
        },
        step: (t: number, count: number) => Math.floor(t * count) / count,
        range: rangeFn,
        ease: easeFn,
        rect: (x, y, w, h, opts = 0) => {
            const r = typeof opts === 'number' ? opts : opts.r || 0;
            const fill = typeof opts === 'number' ? true : opts.fill ?? true;
            const stroke = typeof opts === 'number' ? false : opts.stroke ?? false;
            const lw = typeof opts === 'number' ? 1 : opts.lineWidth ?? 1;
            const color = (typeof opts === 'number' ? null : opts.color) || 'white';

            if (color) {
                if (fill) ctx.fillStyle = color;
                if (stroke) ctx.strokeStyle = color;
            }

            ctx.beginPath(); if (r > 0) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
            if (fill) ctx.fill(); if (stroke) { ctx.lineWidth = lw; ctx.stroke(); }
        },
        circle: (x, y, r, opts = {}) => {
            const fill = opts.fill ?? true; const stroke = opts.stroke ?? false; const lw = opts.lineWidth ?? 1;
            const color = opts.color || 'white';
            if (color) {
                if (fill) ctx.fillStyle = color;
                if (stroke) ctx.strokeStyle = color;
            }
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) ctx.fill(); if (stroke) { ctx.lineWidth = lw; ctx.stroke(); }
        },
        line: (x1, y1, x2, y2, opts = {}) => {
            const lw = opts.lineWidth ?? 1;
            const color = opts.color || 'white';
            if (color) ctx.strokeStyle = color;
            ctx.beginPath(); ctx.lineWidth = lw; ctx.lineCap = opts.cap || 'butt';
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        },
        poly: (points, opts = {}) => {
            if (points.length < 2) return;
            const close = opts.close ?? true; const fill = opts.fill ?? true; const stroke = opts.stroke ?? false; const lw = opts.lineWidth ?? 1;
            const color = opts.color || 'white';
            if (color) {
                if (fill) ctx.fillStyle = color;
                if (stroke) ctx.strokeStyle = color;
            }
            ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]); for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
            if (close) ctx.closePath(); if (fill) ctx.fill(); if (stroke) { ctx.lineWidth = lw; ctx.stroke(); }
        },
        video: videoDrawer,
        image: Object.assign(imageDrawer, {
            smart: createSmartImage({
                ctx, width, height, assets, image: imageDrawer, ease: easeFn, range: rangeFn, brandKit
            })
        }),
        flip: (hx: boolean, hy: boolean) => { ctx.translate(hx ? width : 0, hy ? height : 0); ctx.scale(hx ? -1 : 1, hy ? -1 : 1); },
        transform: transformFn,
        render: { background: config.backgroundMode, backgroundColor: config.backgroundColor, alpha: options.alpha ?? false, pixelRatio: window.devicePixelRatio || 1, motionBlurSamples: 0 },
        prevFrame, getPixel, setPixel, camera, physics, color, fx, timeline, text, gui,
        layout: createLayoutSystem({
            ctx, width, height, image: imageDrawer as any, text, ease: easeFn, range: rangeFn, brandKit
        }),
        slides: undefined as any, // Wire up layout reference in slides after context creation
        motion: createMotionSystem({
            ctx, text, width, height, assets, centerX, centerY, rand, noise, brandKit,
            image: imageDrawer as any, video: videoDrawer, ease: easeFn, range: rangeFn, transform: transformFn
        }),
        models,
        part: () => { console.warn('context.part() can only be used inside a model blueprint.'); },
        spring: (_id, target, _settings) => {
            console.warn('context.spring() outside a model behaves as a simple identity.');
            return target;
        },
        state: (_key, initial) => {
            let val = initial;
            return { get: () => val, set: (v) => { val = v; } };
        },
        passIndex: options.passIndex ?? 0,
        isFirstFrame: frame === 0,
        isLastFrame: frame === Math.floor(duration * fps) - 1,

        // Responsive
        isMobile: width < 768,
        isPortrait: height > width,
        isLandscape: width >= height,

        breakpoint: width < 640 ? 'xs' : width < 768 ? 'sm' : width < 1024 ? 'md' : width < 1280 ? 'lg' : 'xl',

        // Brand
        brandKit
    };

    // Wire up layout reference in slides after context creation
    (returnContext as any).slides = createSlideTemplates({
        ctx, width, height, image: returnContext.image as any, text, ease: easeFn, range: rangeFn, brandKit,
        layout: (returnContext as any).layout
    });

    // Finalize model context with all helpers (rect, circle, text, etc)
    Object.assign(modelsContextRef, returnContext);

    return returnContext;
};
