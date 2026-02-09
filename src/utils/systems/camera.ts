import type { CinematicState, CameraSystem } from '../../types';

export const createCameraSystem = (
    ctx: CanvasRenderingContext2D,
    cinematicState: CinematicState,
    centerX: number,
    centerY: number,
    time: number,
    noise: (x: number, y: number, z: number) => number
): CameraSystem => {
    const camera: CameraSystem = {
        ...cinematicState.camera,
        use: (fn) => {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(camera.zoom, camera.zoom);
            ctx.rotate(camera.rotation);
            ctx.translate(-camera.x, -camera.y);
            fn();
            ctx.restore();
        },
        follow: (tx, ty, damping = 0.1) => {
            cinematicState.camera.x += (tx - cinematicState.camera.x) * damping;
            cinematicState.camera.y += (ty - cinematicState.camera.y) * damping;
        },
        shake: (intensity) => {
            const sx = (noise(time * 20, 0, 0) - 0.5) * intensity;
            const sy = (noise(0, time * 20, 0) - 0.5) * intensity;
            ctx.translate(sx, sy);
        },
        screenToWorld: (sx, sy) => {
            const x = (sx - centerX) / camera.zoom + camera.x;
            const y = (sy - centerY) / camera.zoom + camera.y;
            return { x, y };
        },
        worldToScreen: (wx, wy) => {
            const x = (wx - camera.x) * camera.zoom + centerX;
            const y = (wy - camera.y) * camera.zoom + centerY;
            return { x, y };
        }
    };
    return camera;
};
