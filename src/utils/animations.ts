import type { EaseType } from '../types';

export interface AnimationPreset {
    type: 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'zoomIn' | 'zoomOut' | 'bounceIn' | 'flipIn' | 'reveal';
    duration?: number;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
    ease?: EaseType;
}

export function createAnimator(context: any) {
    const { ctx, ease } = context;

    return {
        // Apply animation transform to the current context state
        apply: (preset: AnimationPreset, progress: number) => {
            if (!ctx) return;

            // Normalize progress (handle delay and duration if manually controlling time)
            // Note: In most cases 'progress' is already 0-1 from the caller.

            const p = progress;
            if (p <= 0) {
                ctx.globalAlpha = 0;
                return;
            }
            if (p >= 1) {
                ctx.globalAlpha = 1;
                return;
            }

            const easing = preset.ease || 'outExpo';
            const t = ease ? ease(easing, p) : p;

            switch (preset.type) {
                case 'fadeIn':
                    ctx.globalAlpha = t;
                    break;

                case 'fadeOut':
                    ctx.globalAlpha = 1 - t;
                    break;

                case 'slideIn': {
                    const dist = preset.distance ?? 50;
                    const dir = preset.direction ?? 'up';

                    let dx = 0, dy = 0;
                    if (dir === 'up') dy = dist * (1 - t);
                    else if (dir === 'down') dy = -dist * (1 - t);
                    else if (dir === 'left') dx = dist * (1 - t);
                    else if (dir === 'right') dx = -dist * (1 - t);

                    ctx.translate(dx, dy);
                    ctx.globalAlpha = t;
                    break;
                }

                case 'slideOut': {
                    const dist = preset.distance ?? 50;
                    const dir = preset.direction ?? 'up';

                    let dx = 0, dy = 0;
                    if (dir === 'up') dy = -dist * t;
                    else if (dir === 'down') dy = dist * t;
                    else if (dir === 'left') dx = -dist * t;
                    else if (dir === 'right') dx = dist * t;

                    ctx.translate(dx, dy);
                    ctx.globalAlpha = 1 - t;
                    break;
                }

                case 'zoomIn': {
                    const scale = t;
                    ctx.scale(scale, scale);
                    ctx.globalAlpha = t;
                    break;
                }

                case 'zoomOut': {
                    const scale = 1 + t * 0.5;
                    ctx.scale(scale, scale);
                    ctx.globalAlpha = 1 - t;
                    break;
                }

                case 'bounceIn': {
                    const bounceT = ease ? ease('outBounce', p) : p; // Force bounce easing
                    const scale = bounceT;
                    ctx.scale(scale, scale);
                    ctx.globalAlpha = Math.min(1, p * 2);
                    break;
                }

                case 'flipIn': {
                    const rot = (1 - t) * Math.PI / 2;
                    const dir = preset.direction ?? 'left';

                    // Simple 2D perspective fake
                    if (dir === 'left' || dir === 'right') {
                        ctx.scale(Math.cos(rot), 1);
                    } else {
                        ctx.scale(1, Math.cos(rot));
                    }
                    ctx.globalAlpha = t;
                    break;
                }

                case 'reveal': {
                    // Mask clip reveal
                    // const dir = preset.direction ?? 'left';
                    // This requires the caller to handle clipping, 
                    // or we need to pass bounds. 
                    // For now, simpler fade+slide backup
                    ctx.globalAlpha = t;
                    const offset = (1 - t) * 20;
                    ctx.translate(0, offset);
                    break;
                }
            }
        }
    };
}
