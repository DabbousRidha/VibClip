import type { CinematicState, PhysicsSystem } from '../../types';

export const createPhysicsSystem = (
    cinematicState: CinematicState
): PhysicsSystem => {
    const physicsBase: PhysicsSystem = {
        spring: (current, target, velocity, settings = {}) => {
            const { stiffness = 0.1, damping = 0.8, mass = 1 } = settings;
            const force = (target - current) * stiffness;
            const acc = force / mass;
            const newVelocity = (velocity + acc) * damping;
            const newValue = current + newVelocity;
            return { value: newValue, velocity: newVelocity };
        },
        lerpAngle: (a, b, t) => {
            const diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
            return a + diff * t;
        },
        lookAt: (current, target, speed) => {
            const diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
            return current + Math.sign(diff) * Math.min(Math.abs(diff), speed);
        }
    };

    return new Proxy(physicsBase, {
        get(target, prop: string) {
            if (prop in target) return (target as any)[prop];
            return cinematicState.physics[prop];
        },
        set(_target, prop: string, value) {
            cinematicState.physics[prop] = value;
            return true;
        }
    }) as any;
};
