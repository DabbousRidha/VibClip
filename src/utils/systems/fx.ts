import type { CinematicState, FxSystem } from '../../types';

export const createFxSystem = (
    ctx: CanvasRenderingContext2D,
    cinematicState: CinematicState,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    maxDim: number,
    minDim: number,
    rand: () => number
): FxSystem => {
    return {
        vignette: (intensity, col = "black") => {
            const grad = ctx.createRadialGradient(centerX, centerY, minDim * 0.5, centerX, centerY, maxDim);
            grad.addColorStop(0, "transparent");
            grad.addColorStop(1 - (1 - intensity) * 0.5, col);
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillRect(0, 0, width, height);
        },
        bloom: (intensity, radius = 20) => {
            if (intensity <= 0) return;

            ctx.save();
            // Using a more controlled brightness and additive blending for a pro glow
            const brightness = 1 + (intensity * 0.2);
            ctx.filter = `blur(${radius}px) brightness(${brightness})`;
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.min(intensity, 0.8); // Cap alpha to keep it subtle
            ctx.drawImage(ctx.canvas, 0, 0);
            ctx.restore();
        },
        grain: (intensity) => {
            if (intensity <= 0) return;
            const amount = intensity * 0.1;
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = amount;

            // Proc-grain optimization could go here, but keeping procedural for now
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const w = Math.random() * 200 + 50;
                const h = Math.random() * 200 + 50;
                ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
                ctx.fillRect(x, y, w, h);
            }

            // Finer grain
            const stride = 4;
            for (let y = 0; y < height; y += stride * 4) {
                for (let x = 0; x < width; x += stride * 4) {
                    if (Math.random() < 0.2) {
                        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
                        ctx.fillRect(x, y, stride, stride);
                    }
                }
            }
            ctx.restore();
        },
        chromatic: (intensity) => {
            if (intensity <= 0) return;
            const off = intensity * 5;

            ctx.save();
            // More refined chromatic approach using globalAlpha and small offsets
            ctx.globalCompositeOperation = 'screen';

            // Red Shift (Primary)
            ctx.globalAlpha = 0.5;
            ctx.drawImage(ctx.canvas, -off, 0);

            // Cyan Shift (Opposite)
            ctx.globalAlpha = 0.5;
            ctx.drawImage(ctx.canvas, off, 0);

            ctx.restore();
        },
        crt: (intensity) => {
            ctx.fillStyle = `rgba(10, 10, 10, ${intensity * 0.3})`;
            for (let i = 0; i < height; i += 6) {
                ctx.fillRect(0, i, width, 2);
            }
        },
        particles: {
            emitter: (x, y, type, count = 1) => {
                for (let i = 0; i < count; i++) {
                    const id = Math.random().toString(36).substr(2, 9);
                    const angle = rand() * Math.PI * 2;
                    let speed = rand() * 2;
                    let life = 1;
                    let size = 2 + rand() * 4;
                    let color = '#ffffff';

                    if (type === 'fire') {
                        color = `rgba(255, ${Math.floor(rand() * 100)}, 0, 1)`;
                        speed = 1 + rand() * 3;
                        life = 0.5 + rand() * 0.5;
                        size = 5 + rand() * 10;
                    } else if (type === 'snow') {
                        speed = 0.5 + rand();
                        size = 2 + rand() * 3;
                        life = 2 + rand() * 2;
                    } else if (type === 'bubbles') {
                        color = `rgba(255, 255, 255, 0.4)`;
                        speed = 0.2 + rand() * 0.5;
                        size = 5 + rand() * 15;
                        life = 2 + rand();
                    }

                    cinematicState.particles.push({
                        id, x, y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life,
                        maxLife: life,
                        size,
                        color
                    });
                }
            }
        }
    };
};
