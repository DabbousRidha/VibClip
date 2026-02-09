import type { MotionSystem } from '../types';

export function createMotionSystem(context: any): MotionSystem {
    const { ctx, text, ease, range, centerX, centerY, width, height, assets, image, video, camera, fx } = context;


    return {
        // --- Charts & Data ---
        drawBarChart: (data, opts = {}) => {
            if (!ctx || !range || !ease) return;
            const x = opts.x ?? 100;
            const y = opts.y ?? 412;
            const w = opts.w ?? 600;
            const h = opts.h ?? 300;
            const color = opts.color ?? '#3498db';
            const stagger = opts.stagger ?? 0.1;
            const reveal = opts.reveal ?? 'grow';

            const barWidth = (w / data.length) * 0.8;
            const spacing = (w / data.length) * 0.2;
            const maxValue = Math.max(...data);

            data.forEach((val, i) => {
                const barHeight = (val / maxValue) * h;
                const progress = range(i * stagger, i * stagger + 0.5);
                const easedProgress = ease('outBack', progress);

                const currentH = reveal === 'grow' ? barHeight * easedProgress : barHeight;
                const currentOpacity = reveal === 'fade' ? easedProgress : 1;

                ctx.save();
                ctx.globalAlpha = currentOpacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.roundRect(x + i * (barWidth + spacing), y - currentH, barWidth, currentH, 4);
                ctx.fill();
                ctx.restore();
            });
        },

        drawLineChart: (data, opts = {}) => {
            if (!ctx || !range || !ease) return;
            const x = opts.x ?? 100;
            const y = opts.y ?? 412;
            const w = opts.w ?? 600;
            const h = opts.h ?? 300;
            const color = opts.color ?? '#e74c3c';
            const thickness = opts.thickness ?? 3;
            const reveal = opts.reveal ?? 'trace';

            const spacing = w / (data.length - 1);
            const maxValue = Math.max(...data);
            const progress = range(0, 1);
            const easedProgress = ease('inOutSine', progress);

            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            data.forEach((val, i) => {
                const px = x + i * spacing;
                const py = y - (val / maxValue) * h;
                const segmentProgress = i / (data.length - 1);

                if (reveal === 'trace') {
                    if (segmentProgress <= easedProgress) {
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                } else {
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
            });

            if (reveal === 'fade') ctx.globalAlpha = easedProgress;
            ctx.stroke();
            ctx.restore();
        },

        drawDonutChart: (data, opts = {}) => {
            if (!ctx || !range || !ease) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const radius = opts.radius ?? 150;
            const thickness = opts.thickness ?? 40;
            const colors = opts.colors ?? ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];

            const progress = range(0, 1);
            const reveal = ease('inOutCubic', progress);

            const total = data.reduce((sum, item) => sum + item.value, 0);
            let currentAngle = -Math.PI / 2;

            ctx.save();
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';

            data.forEach((item, i) => {
                const sliceAngle = (item.value / total) * (Math.PI * 2) * reveal;
                ctx.strokeStyle = colors[i % colors.length];

                ctx.beginPath();
                ctx.arc(x, y, radius, currentAngle, currentAngle + sliceAngle);
                ctx.stroke();

                currentAngle += sliceAngle;
            });
            ctx.restore();
        },

        drawRadarChart: (labels, values, opts = {}) => {
            if (!ctx || !range || !ease) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const radius = opts.radius ?? 150;
            const color = opts.color ?? '#3498db';
            const bgOpacity = opts.bgOpacity ?? 0.1;

            const progress = range(0, 1);
            const reveal = ease('outExpo', progress);

            const angleStep = (Math.PI * 2) / labels.length;

            ctx.save();
            ctx.translate(x, y);

            // Web/Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            for (let j = 1; j <= 4; j++) {
                const r = (radius / 4) * j;
                ctx.beginPath();
                for (let i = 0; i < labels.length; i++) {
                    const ax = Math.cos(i * angleStep - Math.PI / 2) * r;
                    const ay = Math.sin(i * angleStep - Math.PI / 2) * r;
                    if (i === 0) ctx.moveTo(ax, ay);
                    else ctx.lineTo(ax, ay);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Data Polygon
            ctx.fillStyle = color.startsWith('rgba') ? color : `${color.replace('#', 'rgba(')}, ${bgOpacity})`; // Simplified for brevity
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            values.forEach((val, i) => {
                const r = radius * val * reveal;
                const ax = Math.cos(i * angleStep - Math.PI / 2) * r;
                const ay = Math.sin(i * angleStep - Math.PI / 2) * r;
                if (i === 0) ctx.moveTo(ax, ay);
                else ctx.lineTo(ax, ay);
            });
            ctx.closePath();
            ctx.stroke();
            ctx.globalAlpha = 0.3;
            ctx.fill();

            // Labels
            ctx.globalAlpha = 1;
            labels.forEach((label, i) => {
                const ax = Math.cos(i * angleStep - Math.PI / 2) * (radius + 20);
                const ay = Math.sin(i * angleStep - Math.PI / 2) * (radius + 20);
                text?.draw(label, ax, ay, { size: 12, color: 'white', align: 'center' });
            });

            ctx.restore();
        },

        numericDashboard: (stats, opts = {}) => {
            if (!ctx || !text || !range || !ease) return;
            const x = opts.x ?? 100;
            const y = opts.y ?? 100;
            const w = opts.w ?? (width ?? 1920) - 200;
            const columns = opts.columns ?? 3;

            const colW = w / columns;
            const rowH = 150;

            stats.forEach((stat, i) => {
                const col = i % columns;
                const row = Math.floor(i / columns);
                const px = x + col * colW + colW / 2;
                const py = y + row * rowH;

                const t = range(i * 0.1, i * 0.1 + 0.5);
                if (t <= 0) return;
                const reveal = ease('outBack', t);

                ctx.save();
                ctx.translate(px, py);
                ctx.scale(reveal, reveal);
                ctx.globalAlpha = reveal;

                // Value
                const progress = range(i * 0.1, i * 0.1 + 1);
                const easedVal = ease('outExpo', progress);
                const currentVal = stat.value * easedVal;
                text.draw(`${stat.prefix ?? ''}${currentVal.toFixed(0)}${stat.suffix ?? ''}`, 0, 0, {
                    size: 32,
                    color: 'white',
                    align: 'center'
                });

                // Label
                text.draw(stat.label, 0, 30, {
                    size: 14,
                    color: 'rgba(255,255,255,0.6)',
                    align: 'center'
                });

                ctx.restore();
            });
        },

        animatedCounter: (value, opts = {}) => {
            if (!text || !range || !ease || !ctx) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const size = opts.size ?? 48;
            const color = opts.color ?? 'white';
            const prefix = opts.prefix ?? '';
            const suffix = opts.suffix ?? '';
            const decimals = opts.decimals ?? 0;

            const progress = range(0, 1);
            const easedProgress = ease('outExpo', progress);
            const currentVal = value * easedProgress;

            text.draw(`${prefix}${currentVal.toFixed(decimals)}${suffix}`, x, y, {
                size,
                color,
                align: 'center'
            });
        },

        progressRing: (progress, opts = {}) => {
            if (!ctx || !range || !ease) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const radius = opts.radius ?? 50;
            const thickness = opts.thickness ?? 8;
            const color = opts.color ?? '#2ecc71';
            const bgOpacity = opts.bgOpacity ?? 0.2;

            const revealT = range(0, 1);
            const easedReveal = ease('inOutCubic', revealT);
            const currentProgress = progress * easedReveal;

            // BG Ring
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = bgOpacity;
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Progress Ring
            ctx.globalAlpha = 1;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * currentProgress));
            ctx.stroke();
            ctx.restore();
        },

        // --- Text & Information ---
        bulletReveal: (items, _t, opts = {}) => {
            if (!text || !range || !ease) return;
            const x = opts.x ?? 100;
            const y = opts.y ?? 100;
            const size = opts.size ?? 24;
            const color = opts.color ?? 'white';
            const spacing = opts.spacing ?? 40;
            const stagger = opts.stagger ?? 0.2;

            items.forEach((item, i) => {
                const itemT = range(i * stagger, i * stagger + 0.5);
                if (itemT <= 0) return;

                const easedT = ease('outQuart', itemT);
                const itemX = x + (1.0 - easedT) * -20;
                const opacity = easedT;

                text.draw(`• ${item}`, itemX, y + i * spacing, {
                    size,
                    color: color.startsWith('rgba') ? color : `rgba(255, 255, 255, ${opacity})`,
                    align: 'left'
                });
            });
        },

        cinematicTitle: (str, _t, opts = {}) => {
            if (!text || !ctx || !range || !ease) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const size = opts.size ?? 60;
            const color = opts.color ?? 'white';
            const style = opts.style ?? 'fade';

            const progress = range(0, 1);
            const easedT = ease('outExpo', progress);

            if (style === 'glitch') {
                text.glitch(str, x, y, (1.0 - easedT) * 20);
            } else if (style === 'slide') {
                const slideY = y + (1.0 - easedT) * 50;
                text.draw(str, x, slideY, { size, color, align: 'center' });
            } else if (style === 'mask') {
                ctx.save();
                ctx.beginPath();
                // Reveal from bottom-up using a clipping rect
                const textHeight = size * 1.5;
                ctx.rect(x - (width ?? 1920) / 2, y - textHeight / 2, width ?? 1920, textHeight * easedT);
                ctx.clip();
                text.draw(str, x, y, { size, color, align: 'center' });
                ctx.restore();
            } else {
                ctx.save();
                ctx.globalAlpha = easedT;
                text.draw(str, x, y, { size, color, align: 'center' });
                ctx.restore();
            }
        },

        kineticType: (str, opts = {}) => {
            if (!text || !ctx || !range || !ease || !camera) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const size = opts.size ?? 120;
            const color = opts.color ?? 'white';
            const duration = opts.duration ?? 0.5;

            // Assume the range has been set up externally or use default 0-1
            // In a motion component, we often rely on the provided range or internal time
            const progress = range(0, duration);
            const t = ease('outBack', progress);

            // 1. Elastic Scale
            const scale = 3.0 - (2.0 * t); // Starts 3x, ends 1x
            const opacity = Math.min(t * 2, 1);

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);

            // 2. Chromatic Split Impact
            if (t < 0.3) {
                const offset = (1 - t * 3.3) * 10;
                ctx.globalAlpha = opacity * 0.7;
                text.draw(str, offset, 0, { ...opts, size, color: '#ff0000', align: 'center' });
                text.draw(str, -offset, 0, { ...opts, size, color: '#00ffff', align: 'center' });
            }

            ctx.globalAlpha = opacity;
            text.draw(str, 0, 0, { ...opts, size, color, align: 'center' });

            ctx.restore();

            // 3. Screen Shake on impact
            if (t < 0.1) camera.shake((0.1 - t) * 20);
        },

        lowerThird: (primary, sub, opts = {}) => {
            if (!ctx || !text || !range || !ease) return;
            const side = opts.side ?? 'left';
            const x = opts.x ?? (side === 'left' ? 100 : (width ?? 1920) - 100);
            const y = opts.y ?? (height ?? 1080) - 150;
            const color = opts.color ?? 'white';
            const accent = opts.accentColor ?? '#3498db';

            const progress = range(0, 1);
            const reveal = ease('outQuart', progress);
            const slide = (1 - reveal) * 50;

            ctx.save();
            ctx.translate(side === 'left' ? slide : -slide, 0);
            ctx.globalAlpha = reveal;

            // Accent Bar
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.roundRect(side === 'left' ? x : x - 10, y - 40, 6, 80, 3);
            ctx.fill();

            // Text Rendering
            text.draw(primary.toUpperCase(), side === 'left' ? x + 25 : x - 25, y - 5, {
                size: 32,
                color,
                align: side as any
            });

            text.draw(sub, side === 'left' ? x + 25 : x - 25, y + 30, {
                size: 18,
                color: 'rgba(255,255,255,0.7)',
                align: side as any
            });

            ctx.restore();
        },

        quoteCard: (quote, author, opts = {}) => {
            if (!ctx || !text || !range || !ease) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const w = opts.w ?? 800;
            const color = opts.color ?? 'white';
            const bgOpacity = opts.bgOpacity ?? 0.1;

            const progress = range(0, 1);
            const reveal = ease('outExpo', progress);
            const scale = 0.95 + reveal * 0.05;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.globalAlpha = reveal;

            // BG Box
            ctx.fillStyle = `rgba(255, 255, 255, ${bgOpacity})`;
            ctx.beginPath();
            ctx.roundRect(-w / 2, -150, w, 300, 20);
            ctx.fill();

            // Large Quotes
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            text.draw('"', -w / 2 + 50, -50, { size: 120, align: 'center' });
            text.draw('"', w / 2 - 50, 120, { size: 120, align: 'center' });

            // Quote Text
            text.draw(`"${quote}"`, 0, -20, {
                size: 28,
                color,
                align: 'center',
                wrapWidth: w - 100
            });

            // Author
            text.draw(`— ${author}`, 0, 80, {
                size: 20,
                color: 'rgba(255,255,255,0.6)',
                align: 'center'
            });

            ctx.restore();
        },

        callout: (label, tx, ty, opts = {}) => {
            if (!ctx || !text || !range || !ease) return;
            const x = opts.x ?? (centerX ?? 0);
            const y = opts.y ?? (centerY ?? 0);
            const color = opts.color ?? 'white';
            const dotSize = opts.dotSize ?? 4;

            const progress = range(0, 1);
            const reveal = ease('outExpo', progress);

            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.globalAlpha = reveal;

            // Target Dot
            ctx.beginPath();
            ctx.arc(tx, ty, dotSize, 0, Math.PI * 2);
            ctx.fill();

            // Connecting Line
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Label text
            text.draw(label, x + 10, y, {
                size: 20,
                color,
                align: 'left'
            });

            ctx.restore();
        },

        processSequence: (steps, progress, opts = {}) => {
            if (!ctx || !text || !range || !ease) return;
            const x = opts.x ?? 100;
            const y = opts.y ?? (centerY ?? 0);
            const w = opts.w ?? (width ?? 1920) - 200;
            const color = opts.color ?? 'rgba(255,255,255,0.2)';
            const activeColor = opts.activeColor ?? '#2ecc71';

            const revealT = range(0, 1);
            const reveal = ease('outCubic', revealT);

            const stepW = w / (steps.length - 1);

            ctx.save();
            ctx.globalAlpha = reveal;

            // Base line
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.stroke();

            // Progress line
            ctx.strokeStyle = activeColor;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w * progress, y);
            ctx.stroke();

            // Nodes
            steps.forEach((step, i) => {
                const nodeX = x + i * stepW;
                const isActive = (i / (steps.length - 1)) <= progress;

                ctx.fillStyle = isActive ? activeColor : color;
                ctx.beginPath();
                ctx.arc(nodeX, y, 8, 0, Math.PI * 2);
                ctx.fill();

                text.draw(step, nodeX, y + 30, {
                    size: 16,
                    color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                    align: 'center'
                });
            });

            ctx.restore();
        },

        // --- Backgrounds & Ambiance ---
        drawGrid: (opts = {}) => {
            if (!ctx) return;
            const size = opts.size ?? 50;
            const color = opts.color ?? 'rgba(255, 255, 255, 0.1)';
            const opacity = opts.opacity ?? 0.5;
            const thickness = opts.thickness ?? 1;
            const pulseIntensity = opts.pulseIntensity ?? 0;

            const w = width ?? 1920;
            const h = height ?? 1080;

            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = thickness;
            ctx.globalAlpha = opacity;

            if (pulseIntensity > 0) {
                const pulse = (Math.sin(Date.now() / 1000) + 1) / 2;
                ctx.globalAlpha = opacity * (1 - pulseIntensity + pulse * pulseIntensity);
            }

            ctx.beginPath();
            for (let x = 0; x <= w; x += size) {
                ctx.moveTo(x, 0); ctx.lineTo(x, h);
            }
            for (let y = 0; y <= h; y += size) {
                ctx.moveTo(0, y); ctx.lineTo(w, y);
            }
            ctx.stroke();
            ctx.restore();
        },

        ambientBackground: (type, intensity = 0.5, color = 'white') => {
            if (!ctx || !context.noise || !context.rand) return;
            const w = width ?? 1920;
            const h = height ?? 1080;

            if (type === 'noise') {
                ctx.save();
                ctx.globalAlpha = intensity * 0.1;
                for (let i = 0; i < 1000; i++) {
                    const x = context.rand() * w;
                    const y = context.rand() * h;
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, 1, 1);
                }
                ctx.restore();
                ctx.restore();
            } else if (type === 'particles') {
                // Particles handled by engine FX system, but we can draw some ambient ones here too
                // No-op here as createFxSystem handles the main particle loop
            }
        },

        ambientWeather: (type, intensity = 0.5) => {
            if (!fx || !ctx) return;
            const w = width ?? 1920;
            const h = height ?? 1080;

            if (type === 'snow' || type === 'rain') {
                fx.particles.emitter(centerX ?? 0, 0, type, Math.floor(20 * intensity));
            } else if (type === 'dust') {
                ctx.save();
                ctx.globalAlpha = intensity * 0.2;
                for (let i = 0; i < 30; i++) {
                    const t = Date.now() / 5000;
                    const x = (context.noise!(i, t) * 0.5 + 0.5) * w;
                    const y = (context.noise!(i + 10, t) * 0.5 + 0.5) * h;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            } else if (type === 'bokeh') {
                ctx.save();
                for (let i = 0; i < 15; i++) {
                    const t = Date.now() / 8000;
                    const x = (context.noise!(i * 0.5, t) * 0.5 + 0.5) * w;
                    const y = (context.noise!(i * 0.3, t + 50) * 0.5 + 0.5) * h;
                    const bSize = (context.noise!(i, t) * 0.5 + 0.5) * 100 * intensity;

                    const grad = ctx.createRadialGradient(x, y, 0, x, y, bSize);
                    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
                    grad.addColorStop(1, 'rgba(255,255,255,0)');

                    ctx.fillStyle = grad;
                    ctx.beginPath(); ctx.arc(x, y, bSize, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }
        },

        fluidBackground: (colors, opts = {}) => {
            if (!ctx || !context.noise) return;
            const w = width ?? 1920;
            const h = height ?? 1080;
            const speed = opts.speed ?? 1;
            // Use global time if available for smoother animation
            const t = (context.time ?? Date.now() / 1000) * speed * 0.5;

            ctx.save();

            // Base layer
            const baseGradient = ctx.createLinearGradient(0, 0, w, h);
            baseGradient.addColorStop(0, colors[0]);
            baseGradient.addColorStop(1, colors[colors.length - 1]);
            ctx.fillStyle = baseGradient;
            ctx.fillRect(0, 0, w, h);

            // Floating blobs
            ctx.globalCompositeOperation = 'overlay';
            colors.forEach((col, i) => {
                if (i === 0) return; // Skip first color as it's in base

                const nx = context.noise!(i * 10, t) * 0.5 + 0.5;
                const ny = context.noise!(i * 10 + 100, t * 1.1) * 0.5 + 0.5;
                const radiusVar = context.noise!(i * 20, t * 0.5); // -1 to 1

                const cx = nx * w;
                const cy = ny * h;
                const r = (w + h) * 0.4 * (1 + radiusVar * 0.2);

                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                grad.addColorStop(0, col);
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.6;
                ctx.fillRect(0, 0, w, h);
            });

            ctx.restore();
        },

        lensDistortion: (intensity = 0.5) => {
            // Simulates a lens distortion/chromatic aberration effect
            if (!ctx || !width || !height) return;


            // We can't do real lens distortion without shaders easily in 2D canvas, 
            // but we can do a chromatic aberration pass at the edges.
            // This requires reading the canvas which is expensive, so we'll use compositing for a cheap fake.

            // Just apply a subtle scaling to RGB channels? 
            // Canvas 2D doesn't support easy channel separation without pixel manipulation.
            // Fallback to a high-quality vignette + subtle chromatic shake if 'fx' is available.

            if (context.fx) {
                context.fx.chromatic(intensity * 10);
                context.fx.vignette(0.3 * intensity, 'black');
            }
        },

        // --- Layout & Asset Composition ---
        assetReveal: (name, opts = {}) => {
            if (!range || !ease || !assets || !(image || video)) return;
            const asset = assets[name];
            if (!asset) return;

            const delay = opts.delay ?? 0;
            const dur = opts.duration ?? 1;
            const type = opts.type ?? 'pop';
            const t = range(delay, delay + dur);
            if (t <= 0) return;

            const easedT = ease(type === 'pop' ? 'outBack' : 'outExpo', t);

            const ax = opts.x ?? 0;
            const ay = opts.y ?? 0;
            const targetW = opts.w;
            const targetH = opts.h;

            if (context.transform) {
                context.transform(() => {
                    if (type === 'pop') {
                        ctx?.translate((centerX ?? 0) + ax, (centerY ?? 0) + ay);
                        ctx?.scale(easedT, easedT);
                        ctx?.translate(-((centerX ?? 0) + ax), -((centerY ?? 0) + ay));
                    } else if (type === 'slide') {
                        ctx?.translate(ax + (1 - easedT) * -100, ay);
                    } else if (type === 'zoom') {
                        ctx?.scale(1 + (1 - easedT), 1 + (1 - easedT));
                    }

                    if (asset.type === 'video' && video) {
                        video(name, ax, ay, targetW, targetH, { opacity: easedT });
                    } else if (image) {
                        image(name, ax, ay, targetW, targetH, { opacity: easedT });
                    }
                });
            }
        },

        comparisonSplit: (assetA, assetB, splitProgress, opts = {}) => {
            if (!ctx || !assets || !(image || video)) return;
            const w = width ?? 1920;
            const h = height ?? 1080;
            const isVertical = opts.vertical ?? false;

            ctx.save();
            // Side A
            ctx.beginPath();
            if (isVertical) ctx.rect(0, 0, w, h * splitProgress);
            else ctx.rect(0, 0, w * splitProgress, h);
            ctx.clip();
            if (image) image(assetA, 0, 0, w, h);

            // Side B
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            if (isVertical) ctx.rect(0, h * splitProgress, w, h * (1 - splitProgress));
            else ctx.rect(w * splitProgress, 0, w * (1 - splitProgress), h);
            ctx.clip();
            if (image) image(assetB, 0, 0, w, h);
            ctx.restore();

            // Divider
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (isVertical) {
                ctx.moveTo(0, h * splitProgress); ctx.lineTo(w, h * splitProgress);
            } else {
                ctx.moveTo(w * splitProgress, 0); ctx.lineTo(w * splitProgress, h);
            }
            ctx.stroke();
        },

        // --- Cinematic Effects & Filters ---
        vignette: (intensity, opts = {}) => {
            if (!fx) return;
            fx.vignette(intensity, opts.color);
        },

        screenImpact: (intensity) => {
            if (!ctx || !camera) return;
            camera.shake(intensity * 20);

            // Flash effect
            const w = width ?? 1920;
            const h = height ?? 1080;
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.globalAlpha = intensity;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        },

        glitchOverlay: (intensity, _seed = 0) => {
            if (!ctx || !context.rand) return;
            const w = width ?? 1920;
            const h = height ?? 1080;

            ctx.save();
            ctx.globalAlpha = intensity;
            for (let i = 0; i < 5 * intensity; i++) {
                const x = context.rand() * w;
                const y = context.rand() * h;
                const sliceW = context.rand() * 200;
                const sliceH = context.rand() * 20;

                ctx.fillStyle = `rgba(${context.rand() * 255},${context.rand() * 255},${context.rand() * 255},0.5)`;
                ctx.fillRect(x, y, sliceW, sliceH);
            }
            ctx.restore();
        },

        spotlight: (x, y, radius, opts = {}) => {
            if (!ctx) return;
            const w = width ?? 1920;
            const h = height ?? 1080;
            const bgOpacity = opts.bgOpacity ?? 0.8;

            ctx.save();
            // Create a radial gradient for the spotlight hole
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, `rgba(0,0,0,${bgOpacity})`);

            ctx.fillStyle = grad;
            // Draw overlay around the spotlight
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        },

        // --- Utilities & Branding ---
        watermark: (name, opts = {}) => {
            if (!ctx || !image) return;
            const w = width ?? 1920;
            const h = height ?? 1080;
            const sizeW = opts.w ?? 200;
            const sizeH = opts.h ?? 100;
            const opacity = opts.opacity ?? 0.5;
            const pos = opts.position ?? 'bottom-right';

            let x = 0;
            let y = 0;
            const padding = 50;

            switch (pos) {
                case 'top-left': x = padding; y = padding; break;
                case 'top-right': x = w - sizeW - padding; y = padding; break;
                case 'bottom-left': x = padding; y = h - sizeH - padding; break;
                case 'bottom-right': x = w - sizeW - padding; y = h - sizeH - padding; break;
            }

            if (opts.x !== undefined) x = opts.x;
            if (opts.y !== undefined) y = opts.y;

            ctx.save();
            ctx.globalAlpha = opacity;
            image(name, x, y, sizeW, sizeH);
            ctx.restore();
        },

        smartLayout: (name: string, opts: { margin?: number, fit?: 'contain' | 'cover' } = {}) => {
            if (!ctx || !width || !height || !image || !assets) return;
            const asset = assets[name];
            if (!asset) return;

            const el = (asset instanceof HTMLImageElement || asset.tagName === 'IMG') ? asset : asset.element;
            const isVideo = el instanceof HTMLVideoElement || el.tagName === 'VIDEO';
            const nativeW = isVideo ? (el as HTMLVideoElement).videoWidth : (el as HTMLImageElement).naturalWidth ?? 100;
            const nativeH = isVideo ? (el as HTMLVideoElement).videoHeight : (el as HTMLImageElement).naturalHeight ?? 100;

            const margin = opts.margin ?? 0.1;
            const availableW = width * (1 - margin * 2);
            const availableH = height * (1 - margin * 2);
            const fit = opts.fit ?? 'contain';

            let drawW = nativeW;
            let drawH = nativeH;

            if (fit === 'contain') {
                const scale = Math.min(availableW / nativeW, availableH / nativeH);
                drawW = nativeW * scale;
                drawH = nativeH * scale;
            } else {
                const scaleW = availableW / nativeW;
                const scaleH = availableH / nativeH;
                const scale = Math.max(scaleW, scaleH);
                drawW = nativeW * scale;
                drawH = nativeH * scale;
            }

            const x = (width - drawW) / 2;
            const y = (height - drawH) / 2;
            image(name, x, y, drawW, drawH);
        },

        transition: (type = 'fade', _duration = 1.0, opts = {}) => {
            if (!ctx || !width || !height) return;
            const w = width;
            const h = height;
            const t = opts.progress ?? 0; // 0 to 1
            const color = opts.color ?? 'black';

            if (t <= 0 || t >= 1) return;

            ctx.save();
            ctx.fillStyle = color;

            if (type === 'fade') {
                const opacity = t < 0.5 ? t * 2 : (1 - t) * 2;
                ctx.globalAlpha = opacity;
                ctx.fillRect(0, 0, w, h);
            } else if (type === 'slide') {
                const x = (1 - t) * w;
                ctx.fillRect(x, 0, w, h);
            } else if (type === 'wipe') {
                const maxR = Math.sqrt(w * w + h * h);
                const r = (1 - Math.abs(t - 0.5) * 2) * maxR;
                ctx.beginPath();
                ctx.arc(centerX ?? w / 2, centerY ?? h / 2, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        },

        audioReactive: (param, band = 'bass') => {
            const audioAsset = Object.values(assets).find((a: any) => a.type === 'audio' && a.analysis) as any;
            if (!audioAsset || !audioAsset.analysis) return 0;

            const val = audioAsset.analysis[band] || 0;

            if (param === 'scale') return 1 + val * 0.5;
            if (param === 'opacity') return val;
            if (param === 'y') return val * -100;
            return val;
        },

        timelineProgress: (progress, opts = {}) => {
            if (!ctx) return;
            const w = width ?? 1920;
            const h = height ?? 1080;
            const barH = opts.height ?? 10;
            const color = opts.color ?? '#e74c3c';
            const pos = opts.position ?? 'bottom';

            const y = pos === 'top' ? 0 : h - barH;

            ctx.save();
            ctx.fillStyle = color;
            ctx.fillRect(0, y, w * progress, barH);
            ctx.restore();
        }
    };
}
