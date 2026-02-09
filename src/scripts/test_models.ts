import type { AnimationContext } from '../types';

/**
 * Verification script for the Model Component Architecture.
 * Defines a reusable "Gadget" model and draws multiple instances.
 */
export default function testModels(context: AnimationContext) {
    const { centerX, centerY, time, models, brandKit } = context;

    // 1. Define models once (ideally at the start of the script or in a setup block)
    if (context.frame === 0) {
        models.define('Gadget', (props) => {
            const { color = 'white', size = 100, label = 'VibClip' } = props;

            // Draw a complex shape relative to (0,0)
            context.rect(-size / 2, -size / 2, size, size, {
                r: 20,
                color: color,
                fill: true
            });

            // Decorative inner parts
            context.circle(0, 0, size * 0.3, { color: 'rgba(0,0,0,0.2)', fill: true });

            context.text.draw(label, 0, size * 0.4, {
                size: size * 0.15,
                color: 'white',
                align: 'center'
            });
        });

        models.define('Pointer', (props) => {
            const { color = brandKit.colors.accent } = props;
            context.poly([
                [0, 0],
                [20, 40],
                [0, 30],
                [-20, 40]
            ], { color, fill: true, close: true });
        });
    }

    // --- Scene Logic ---
    context.motion.fluidBackground([brandKit.colors.background, '#050505'], { speed: 0.1 });

    // 2. Use models with isolated transforms
    const count = 5;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + time * 0.5;
        const x = centerX + Math.cos(angle) * 200;
        const y = centerY + Math.sin(angle) * 200;

        models.draw('Gadget', {
            x, y,
            scale: 0.8 + Math.sin(time * 2 + i) * 0.2,
            rotation: angle + Math.PI / 2,
            props: {
                color: context.color.palette('vibrant', i),
                label: `Gadget ${i + 1}`
            }
        });
    }

    // Central model
    models.draw('Gadget', {
        x: centerX,
        y: centerY,
        scale: 1.5,
        rotation: time,
        props: {
            color: brandKit.colors.primary,
            label: 'CORE'
        }
    });

    // Cursor model
    models.draw('Pointer', {
        x: context.mouse.x,
        y: context.mouse.y,
        rotation: -Math.PI / 4
    });

    context.fx.bloom(0.6);
}
