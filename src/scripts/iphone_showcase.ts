import type { AnimationContext } from '../types';

/**
 * iPhone Showcase Cinematic Script
 * Fixed visibility, coordinates, and added high-end rim lighting.
 */
export default function iphoneShowcase(context: AnimationContext) {
    const { centerX, centerY, time, models, brandKit, ease, timeline, ctx, width, height } = context;

    // 1. Model Definitions
    if (context.frame === 0) {
        // Metallic Camera Lens Component
        models.define('Lens', function (props, mod) {
            const { scale = 1, focus = 0 } = props;

            // Outer housing with metallic rim
            const rim = mod.ctx.createRadialGradient(0, 0, 15 * scale, 0, 0, 20 * scale);
            rim.addColorStop(0, '#1a1a1a');
            rim.addColorStop(0.7, '#666');
            rim.addColorStop(1, '#222');
            mod.circle(0, 0, 20 * scale, { color: rim, fill: true });

            // Glass reflection (moving slightly)
            const flareX = Math.sin(time * 2) * 3;
            mod.circle(flareX, -5, 8 * scale, { color: 'rgba(255,255,255,0.2)', fill: true });

            // Internal Aperture Part
            mod.part('aperture', () => {
                const apScale = 1 + focus;
                mod.circle(0, 0, 12 * scale * apScale, { color: '#000', fill: true });
                mod.circle(2, 2, 5 * scale, { color: '#0a0f1a', fill: true });
            });
        });

        // The Full iPhone Model
        models.define('iPhone', function (props, mod) {
            const { color = '#1c1c1e', screenOn = true, side = 'front' } = props;

            // --- CHASSIS RIM LIGHTING ---
            // Subtle glow around the edges to separate from background
            const rimGlow = mod.ctx.createLinearGradient(-80, -160, 80, 160);
            rimGlow.addColorStop(0, 'rgba(255,255,255,0.15)');
            rimGlow.addColorStop(0.5, 'rgba(255,255,255,0.05)');
            rimGlow.addColorStop(1, 'rgba(255,255,255,0.15)');
            mod.rect(-78, -153, 156, 306, { r: 32, color: rimGlow, fill: true });

            // Main Chassis
            mod.rect(-75 * 1.02, -150 * 1.02, 150 * 1.02, 300 * 1.02, { r: 28, color: '#333', fill: true });
            mod.rect(-75, -150, 150, 300, { r: 25, color, fill: true });

            // --- FRONT SIDE ---
            if (side === 'front') {
                mod.part('screen', () => {
                    mod.rect(-70, -145, 140, 290, { r: 22, color: '#000', fill: true });

                    if (screenOn) {
                        // Wallpaper
                        const g = mod.ctx.createLinearGradient(0, -145, 0, 145);
                        g.addColorStop(0, brandKit.colors.primary);
                        g.addColorStop(1, brandKit.colors.accent);
                        mod.ctx.fillStyle = g;
                        mod.ctx.beginPath();
                        mod.ctx.roundRect(-70, -145, 140, 290, 22);
                        mod.ctx.fill();

                        // UI
                        mod.text.draw('9:41', 0, -100, { align: 'center', size: 36, color: 'white' });
                    }

                    // Dynamic Island
                    mod.part('dynamicIsland', () => {
                        const w = mod.spring('islandWidth', props.islandExpanded ? 100 : 50, { stiffness: 150, damping: 15 });
                        mod.rect(-w / 2, -135, w, 14, { r: 7, color: '#000', fill: true });
                    });
                });
            }

            // --- REAR SIDE ---
            if (side === 'back') {
                mod.part('cameraBump', () => {
                    // Frost glass plate
                    mod.rect(5, -140, 62, 62, { r: 18, color: 'rgba(255,255,255,0.1)', fill: true });

                    const focusVal = props.cameraFocus || 0;
                    mod.part('lens1', () => mod.models.draw('Lens', { x: 22, y: -125, scale: 0.85, props: { focus: focusVal } }));
                    mod.part('lens2', () => mod.models.draw('Lens', { x: 52, y: -125, scale: 0.85, props: { focus: -focusVal } }));
                    mod.part('lens3', () => mod.models.draw('Lens', { x: 37, y: -95, scale: 0.85, props: { focus: focusVal } }));
                });
            }
        });
    }

    // --- CINEMATOGRAPHY ---
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Scene 1: Reveal (0s - 4s)
    timeline.range(0, 4, (t) => {
        const reveal = ease('inOutQuart', t);

        models.draw('iPhone', {
            x: centerX,
            y: centerY + (1 - reveal) * 150,
            rotation: (1 - reveal) * 0.2,
            scale: 1 + reveal * 0.1,
            props: { color: '#151517', screenOn: false, side: 'front' }
        });

        // Light sweep
        const sweepX = centerX - 400 + reveal * 800;
        const scanLine = ctx.createLinearGradient(sweepX - 100, 0, sweepX + 100, 0);
        scanLine.addColorStop(0, 'transparent');
        scanLine.addColorStop(0.5, 'rgba(255,255,255,0.4)');
        scanLine.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = scanLine;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    });

    // Scene 2: Dynamic Island (4s - 8s)
    timeline.range(4, 8, (t) => {
        const zoom = ease('inOutCubic', t);
        const expand = t > 0.3 && t < 0.7;

        // Auto-center the island area
        // Island is at -135. We want it near centerY.
        const targetScale = 1.5 + zoom * 3;
        const targetY = centerY + (135 * targetScale) - (zoom * 100);

        models.draw('iPhone', {
            x: centerX,
            y: targetY,
            scale: targetScale,
            props: { color: '#1c1c1e', screenOn: true, islandExpanded: expand, side: 'front' }
        });

        ctx.save();
        ctx.globalAlpha = t;
        context.text.draw('DYNAMIC ISLAND', centerX, height - 100, {
            align: 'center', size: 32, color: 'white'
        });
        ctx.restore();
    });

    // Scene 3: Pro Optics (8s - 12s)
    timeline.range(8, 12, (t) => {
        const zoom = ease('inOutCubic', t);
        const focus = Math.sin(t * Math.PI) * 0.3;

        // Camera bump is around y = -110. Center it.
        const targetScale = 2 + zoom * 4;
        const targetY = centerY + (110 * targetScale);

        models.draw('iPhone', {
            x: centerX,
            y: targetY,
            scale: targetScale,
            rotation: -0.05 + zoom * 0.1,
            props: { color: '#111', side: 'back', cameraFocus: focus }
        });

        ctx.save();
        ctx.globalAlpha = t;
        context.text.draw('PRO OPTICS', centerX, height - 100, { align: 'center', size: 32, color: 'white' });
        ctx.restore();
    });

    // Scene 4: Performance Spin (12s - 16s)
    timeline.range(12, 16, (t) => {
        const floatY = Math.sin(time * 3) * 15;
        const spin = t * Math.PI * 4;

        models.draw('iPhone', {
            id: 'spinning_phone',
            x: centerX,
            y: centerY + floatY,
            rotation: spin,
            scale: 0.8,
            props: { color: brandKit.colors.primary, side: spin % (Math.PI * 2) < Math.PI ? 'front' : 'back' }
        });

        context.fx.bloom(0.3);
    });

    // Final Branding
    timeline.range(16, 18, (t) => {
        ctx.save();
        ctx.globalAlpha = ease('outQuad', t);
        context.text.draw('iPhone 16 Pro', centerX, centerY, {
            align: 'center', size: 64, color: 'white'
        });
        ctx.restore();
    });
}
