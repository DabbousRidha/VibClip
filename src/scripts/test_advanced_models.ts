import type { AnimationContext } from '../types';

/**
 * Advanced verification script for the Model System.
 * Showcases Hierarchy, Caching, Interactions, and Internal State.
 */
export default function testAdvancedModels(context: AnimationContext) {
    const { centerX, centerY, time, models, brandKit, mouse } = context;

    // 1. Setup Models
    if (context.frame === 0) {
        // Simple Head with reactive eyes
        models.define('RobotHead', function (props, mod) {
            const { color = 'white' } = props;

            // Draw Head
            mod.rect(-30, -30, 60, 60, { r: 10, color, fill: true });

            // Use Internal Spring for blinking
            const blink = mod.spring('blink', mouse.down ? 0.1 : 1, { stiffness: 200 });

            mod.circle(-15, -5, 5 * blink, { color: 'black', fill: true });
            mod.circle(15, -5, 5 * blink, { color: 'black', fill: true });

            // Antenna that jiggles
            const jiggle = Math.sin(time * 10) * 5;
            mod.line(0, -30, jiggle, -50, { color: 'black', lineWidth: 2 });
            mod.circle(jiggle, -55, 4, { color: brandKit.colors.accent, fill: true });
        });

        // Hierarchical Robot Body
        models.define('Robot', function (props, mod) {
            const { theme = brandKit.colors.primary } = props;

            // Body
            mod.rect(-50, 0, 100, 120, { r: 15, color: theme, fill: true });

            // Targeted Parts (Arms)
            mod.part('leftArm', () => {
                mod.rect(-20, 0, 20, 80, { r: 10, color: '#333', fill: true });
            });

            mod.part('rightArm', () => {
                mod.rect(0, 0, 20, 80, { r: 10, color: '#333', fill: true });
            });

            // Nested Model (Head)
            mod.models.draw('RobotHead', {
                y: -10,
                props: { color: brandKit.colors.secondary }
            });
        });

        // Complex Cachable Background
        models.define('GridPattern', function (_props, mod) {
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    mod.circle(-500 + i * 50, -500 + j * 50, 2, { color: 'rgba(255,255,255,0.1)', fill: true });
                }
            }
        });
    }

    // --- RENDERING ---
    context.motion.fluidBackground([brandKit.colors.background, '#000'], { speed: 0.1 });

    // 1. Draw Cached Background (High performance)
    models.draw('GridPattern', { x: centerX, y: centerY, cache: true });

    // 2. Draw Interactive Robots
    const robotState = context.models.state('robot_hover', false);

    models.draw('Robot', {
        id: 'main_bot',
        x: centerX,
        y: centerY + 50,
        scale: 1.2,
        rotation: Math.sin(time) * 0.1,
        interaction: {
            onHover: () => robotState.set(true)
        },
        parts: {
            leftArm: { rotation: Math.PI / 4 + Math.sin(time * 2) * 0.5 },
            rightArm: { rotation: -Math.PI / 4 - Math.sin(time * 2) * 0.5 }
        },
        props: {
            theme: robotState.get() ? brandKit.colors.accent : brandKit.colors.primary
        }
    });

    // Reset hover state for next frame
    if (context.passIndex === 0) robotState.set(false);

    context.fx.bloom(0.4);
    context.text.draw('CLICK & HOVER ROBOT', centerX, 100, { align: 'center', size: 24, color: 'white' });
}
