// Smart image positioning system with effects and animations
import { createAnimator, type AnimationPreset } from './animations';
import type { AssetDrawingOptions } from '../types';

// Position presets for smart image placement
const POSITION_PRESETS = {
    'center': { x: 0.5, y: 0.5 },
    'center-left': { x: 0.25, y: 0.5 },
    'center-right': { x: 0.75, y: 0.5 },
    'top-left': { x: 0.2, y: 0.2 },
    'top-center': { x: 0.5, y: 0.2 },
    'top-right': { x: 0.8, y: 0.2 },
    'bottom-left': { x: 0.2, y: 0.8 },
    'bottom-center': { x: 0.5, y: 0.8 },
    'bottom-right': { x: 0.8, y: 0.8 }
} as const;

export type PositionPreset = keyof typeof POSITION_PRESETS;

export interface SmartImageOptions {
    // Positioning
    position?: PositionPreset;
    zone?: { x: number; y: number; width: number; height: number }; // 0-1 percentages

    // Sizing
    fill?: number; // 0-1, how much of zone to fill
    fit?: 'contain' | 'cover';

    // Effects
    border?: {
        width: number;
        color: string;
        radius?: number;
    };
    shadow?: {
        blur: number;
        color: string;
        offsetX?: number;
        offsetY?: number;
    };
    glow?: {
        color: string;
        intensity: number; // 0-1
    };
    crop?: {
        focus?: { x: number; y: number }; // 0-1 (e.g., {x:0.5, y:0.2} for top center)
        scale?: number; // Zoom level (default 1)
    };

    // Animation
    entrance?: 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'fade' | 'zoom' | 'bounce' | AnimationPreset;
    progress?: number; // 0-1, manual animation control
    duration?: number;
    delay?: number;
}

export function createSmartImage(context: any) {
    const { ctx, width, height, assets, image, ease, range } = context;

    const animator = createAnimator(context);

    const smartImage = (name: string, opts: SmartImageOptions = {}) => {
        if (!ctx || !width || !height || !assets || !image) return;

        const asset = assets[name];
        if (!asset) {
            console.warn(`Asset "${name}" not found`);
            return;
        }

        // Calculate position
        let targetX: number, targetY: number, zoneW: number, zoneH: number;

        if (opts.zone) {
            // Custom zone (percentages)
            targetX = opts.zone.x * width;
            targetY = opts.zone.y * height;
            zoneW = opts.zone.width * width;
            zoneH = opts.zone.height * height;
        } else if (opts.position) {
            // Preset position
            const preset = POSITION_PRESETS[opts.position];
            targetX = preset.x * width;
            targetY = preset.y * height;
            zoneW = width * 0.3; // Default zone size
            zoneH = height * 0.3;
        } else {
            // Default: center
            targetX = width / 2;
            targetY = height / 2;
            zoneW = width * 0.5;
            zoneH = height * 0.5;
        }

        // Apply fill factor
        const fill = opts.fill ?? 0.9;
        const drawW = zoneW * fill;
        const drawH = zoneH * fill;

        // Animation
        let animProgress = opts.progress ?? 1;
        if (opts.entrance && opts.progress === undefined && range && ease) {
            const delay = opts.delay ?? 0;
            const dur = opts.duration ?? 1;
            const t = range(delay, delay + dur);
            animProgress = ease('outBack', t);
        }

        // Apply entrance animation transforms
        ctx.save();

        if (opts.entrance && animProgress < 1) {
            let preset: AnimationPreset;

            if (typeof opts.entrance === 'string') {
                // Map legacy string presets to new system
                switch (opts.entrance) {
                    case 'slideLeft': preset = { type: 'slideIn', direction: 'right', distance: width * 0.3 }; break;
                    case 'slideRight': preset = { type: 'slideIn', direction: 'left', distance: width * 0.3 }; break;
                    case 'slideUp': preset = { type: 'slideIn', direction: 'down', distance: height * 0.3 }; break;
                    case 'slideDown': preset = { type: 'slideIn', direction: 'up', distance: height * 0.3 }; break;
                    case 'fade': preset = { type: 'fadeIn' }; break;
                    case 'zoom': preset = { type: 'zoomIn' }; break;
                    case 'bounce': preset = { type: 'bounceIn' }; break;
                    default: preset = { type: 'fadeIn' };
                }
            } else {
                preset = opts.entrance;
            }

            // Apply transform logic from animator
            // We need to translate to center of object for scaling/rotation to work correctly
            ctx.translate(targetX, targetY);
            animator.apply(preset, animProgress);
            ctx.translate(-targetX, -targetY);
        }

        // Apply shadow
        if (opts.shadow) {
            ctx.shadowColor = opts.shadow.color;
            ctx.shadowBlur = opts.shadow.blur;
            ctx.shadowOffsetX = opts.shadow.offsetX ?? 0;
            ctx.shadowOffsetY = opts.shadow.offsetY ?? 0;
        }

        // Apply glow (using shadow with no offset)
        if (opts.glow) {
            ctx.shadowColor = opts.glow.color;
            ctx.shadowBlur = 40 * opts.glow.intensity;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // Draw border background if specified
        if (opts.border) {
            ctx.fillStyle = opts.border.color;
            ctx.beginPath();
            const borderPadding = opts.border.width;
            if (opts.border.radius) {
                ctx.roundRect(
                    targetX - drawW / 2 - borderPadding,
                    targetY - drawH / 2 - borderPadding,
                    drawW + borderPadding * 2,
                    drawH + borderPadding * 2,
                    opts.border.radius
                );
            } else {
                ctx.rect(
                    targetX - drawW / 2 - borderPadding,
                    targetY - drawH / 2 - borderPadding,
                    drawW + borderPadding * 2,
                    drawH + borderPadding * 2
                );
            }
            ctx.fill();
        }

        // Reset shadow for image drawing
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Calculate Crop
        let cropX = 0, cropY = 0, cropW = 0, cropH = 0;
        let useCrop = false;

        if (opts.crop || opts.fit === 'cover') {
            const img = assets[name];
            if (img) {
                const imgAspectRatio = img.width / img.height;
                const targetAspectRatio = drawW / drawH;

                let sw = img.width;
                let sh = img.height;

                if (imgAspectRatio > targetAspectRatio) {
                    // Image is wider than target
                    sh = img.height;
                    sw = sh * targetAspectRatio;

                    // Focus X
                    const focusX = opts.crop?.focus?.x ?? 0.5;
                    cropX = (img.width - sw) * focusX;
                } else {
                    // Image is taller than target
                    sw = img.width;
                    sh = sw / targetAspectRatio;

                    // Focus Y
                    const focusY = opts.crop?.focus?.y ?? 0.5;
                    cropY = (img.height - sh) * focusY;
                }

                cropW = sw;
                cropH = sh;

                // Apply zoom/scale
                if (opts.crop?.scale && opts.crop.scale !== 1) {
                    const centerW = cropW;
                    const centerH = cropH;
                    cropW /= opts.crop.scale;
                    cropH /= opts.crop.scale;
                    cropX += (centerW - cropW) * 0.5;
                    cropY += (centerH - cropH) * 0.5;
                }

                useCrop = true;
            }
        }

        // Draw image
        const drawOpts: AssetDrawingOptions = {
            fit: opts.fit ?? 'contain'
        };

        if (useCrop) {
            drawOpts.crop = { x: cropX, y: cropY, w: cropW, h: cropH };
            // Since we are cropping manually to ratio, we just fill the rect
            drawOpts.fit = 'fill' as any;
        }

        image(name, targetX - drawW / 2, targetY - drawH / 2, drawW, drawH, drawOpts);
        ctx.restore();
    };

    // Attach standalone crop helper
    (smartImage as any).crop = (name: string, x: number, y: number, w: number, h: number, opts: { focus?: { x: number, y: number }, scale?: number } = {}) => {
        smartImage(name, {
            zone: { x: x / width, y: y / height, width: w / width, height: h / height },
            fit: 'cover',
            crop: opts,
            fill: 1
        });
    };

    return smartImage;
}
