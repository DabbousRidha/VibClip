import type { ModelSystem, ModelOptions, AnimationContext } from '../types';

export function createModelSystem(externalContext: any): ModelSystem {
    const registry: Record<string, (props: any, context: AnimationContext) => void> = {};
    const cacheMap = new Map<string, HTMLCanvasElement>();
    const stateStore = new Map<string, Record<string, any>>();

    // Internal shared helpers
    const stateHelper = (key: string, initial: any) => {
        const instanceId = currentModelOptions?.id || 'default';
        const modelState = stateStore.get(instanceId) || {};
        if (modelState[key] === undefined) modelState[key] = initial;
        stateStore.set(instanceId, modelState);
        const store = stateStore;
        return {
            get: () => store.get(instanceId)?.[key],
            set: (val: any) => {
                const s = store.get(instanceId) || {};
                s[key] = val;
                store.set(instanceId, s);
            }
        };
    };

    const springHelper = (id: string, target: number, settings?: any) => {
        const { physics } = externalContext;
        const instanceId = currentModelOptions?.id || 'default';
        const stateKey = `spring_${id}`;
        const modelState = stateStore.get(instanceId) || {};

        const current = modelState[stateKey] || { value: target, velocity: 0 };
        const result = physics.spring(current.value, target, current.velocity, settings);

        modelState[stateKey] = result;
        stateStore.set(instanceId, modelState);

        return result.value;
    };

    // Forward-declare the return object
    let modelSystem: ModelSystem;

    // Helper to get a fresh context for drawing
    const getPartContext = () => {
        const { ctx } = externalContext;
        return {
            ...externalContext,
            get models() { return modelSystem; },
            spring: springHelper,
            state: stateHelper,
            part: (name: string, drawPartFn: () => void) => {
                const partOpts = (currentModelOptions?.parts || {})[name];
                if (!partOpts) {
                    drawPartFn();
                    return;
                }

                ctx.save();
                const { x = 0, y = 0, scale = 1, rotation = 0, opacity = 1 } = partOpts;
                ctx.translate(x, y);
                if (rotation !== 0) ctx.rotate(rotation);
                if (scale !== 1) ctx.scale(scale, scale);
                if (opacity !== 1) ctx.globalAlpha *= opacity;

                drawPartFn();
                ctx.restore();
            }
        };
    };

    let currentModelOptions: ModelOptions | null = null;

    modelSystem = {
        define: (name, drawFn) => {
            registry[name] = drawFn;
            cacheMap.delete(name);
        },
        clearCache: (name) => {
            if (name) cacheMap.delete(name);
            else cacheMap.clear();
        },
        state: stateHelper,
        spring: springHelper,
        draw: (name, options: ModelOptions = {}) => {
            const drawFn = registry[name];
            if (!drawFn) return;

            const { ctx, mouse } = externalContext;

            const {
                x = 0,
                y = 0,
                scale = 1,
                rotation = 0,
                opacity = 1,
                flipX = false,
                flipY = false,
                props = {},
                cache = false,
                interaction,
                id = name
            } = options;

            const prevOptions = currentModelOptions;
            currentModelOptions = { ...options, id };

            ctx.save();

            // 1. Position and Transform
            ctx.translate(x, y);
            if (rotation !== 0) ctx.rotate(rotation);
            if (scale !== 1 || flipX || flipY) {
                ctx.scale(flipX ? -scale : scale, flipY ? -scale : scale);
            }
            if (opacity !== 1) ctx.globalAlpha *= opacity;

            // 2. Interaction Detect
            if (interaction) {
                const dx = mouse.x - x;
                const dy = mouse.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100 * scale) {
                    if (interaction.onHover) interaction.onHover({ x: mouse.x, y: mouse.y });
                    if (mouse.down && interaction.onClick) interaction.onClick({ x: mouse.x, y: mouse.y });
                }
            }

            // 3. Drawing
            const partContext = getPartContext();
            if (cache) {
                let offscreen = cacheMap.get(name);
                if (!offscreen) {
                    offscreen = document.createElement('canvas');
                    offscreen.width = 1000;
                    offscreen.height = 1000;
                    const oCtx = offscreen.getContext('2d');
                    if (oCtx) {
                        const originalCtx = externalContext.ctx;
                        externalContext.ctx = oCtx;
                        oCtx.translate(500, 500);
                        drawFn.call(partContext, props, partContext as any);
                        externalContext.ctx = originalCtx;
                    }
                    cacheMap.set(name, offscreen);
                }
                ctx.drawImage(offscreen, -500, -500);
            } else {
                try {
                    drawFn.call(partContext, props, partContext as any);
                } catch (e) {
                    console.error(`Error drawing model "${name}":`, e);
                }
            }

            ctx.restore();
            currentModelOptions = prevOptions;
        }
    };

    return modelSystem;
}
