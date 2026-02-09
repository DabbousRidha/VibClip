import type { EaseType } from '../types';

/**
 * Deterministic PRNG using a simple LCG or mulberry32
 */
export function createRand(seed: number) {
    let state = seed;
    const next = () => {
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return (s?: number) => {
        if (s !== undefined) {
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
        return next();
    };
}

/**
 * Basic Coherent Noise (Value Noise)
 * Seeded to be deterministic
 */
export function createNoise(rand: () => number) {
    const p = new Uint8Array(512);
    for (let i = 0; i < 256; i++) p[i] = p[i + 256] = Math.floor(rand() * 256);

    const lerp = (t: number, a: number, b: number) => a + t * (b - a);
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (hash: number, x: number, y: number, z: number) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    return (x: number, y: number = 0, z: number = 0) => {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = fade(x);
        const v = fade(y);
        const w = fade(z);

        const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
        const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

        return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
            grad(p[BA], x - 1, y, z)),
            lerp(u, grad(p[AB], x, y - 1, z),
                grad(p[BB], x - 1, y - 1, z))),
            lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
                grad(p[BA + 1], x - 1, y, z - 1)),
                lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                    grad(p[BB + 1], x - 1, y - 1, z - 1))));
    };
}

export const easingFunctions: Record<EaseType, (t: number) => number> = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => t * (2 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    inCubic: (t) => t * t * t,
    outCubic: (t) => --t * t * t + 1,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    inQuart: (t) => t * t * t * t,
    outQuart: (t) => 1 - --t * t * t * t,
    inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
    inQuint: (t) => t * t * t * t * t,
    outQuint: (t) => 1 + --t * t * t * t * t,
    inOutQuint: (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
    inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    outSine: (t) => Math.sin((t * Math.PI) / 2),
    inOutSine: (t) => 0.5 * (1 - Math.cos(Math.PI * t)),
    inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
    outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutExpo: (t) => {
        if (t === 0 || t === 1) return t;
        let t2 = t * 2;
        if (t2 < 1) return 0.5 * Math.pow(2, 10 * (t2 - 1));
        return 0.5 * (2 - Math.pow(2, -10 * (t2 - 1)));
    },
    inCirc: (t) => 1 - Math.sqrt(1 - t * t),
    outCirc: (t) => Math.sqrt(1 - (t - 1) * (t - 1)),
    inOutCirc: (t) => {
        let t2 = t * 2;
        return t2 < 1 ? -0.5 * (Math.sqrt(1 - t2 * t2) - 1) : 0.5 * (Math.sqrt(1 - (t2 - 2) * t2) + 1);
    },
    inBack: (t) => {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },
    outBack: (t) => {
        const s = 1.70158;
        let t2 = t - 1;
        return t2 * t2 * ((s + 1) * t2 + s) + 1;
    },
    inOutBack: (t) => {
        const s = 1.70158 * 1.525;
        let t2 = t * 2;
        if (t2 < 1) return 0.5 * (t2 * t2 * ((s + 1) * t2 - s));
        t2 -= 2;
        return 0.5 * (t2 * t2 * ((s + 1) * t2 + s) + 2);
    },
    inElastic: (t) => {
        if (t === 0 || t === 1) return t;
        return -Math.pow(2, 10 * t - 10) * Math.sin(((t * 10 - 10.75) * (2 * Math.PI)) / 3);
    },
    outElastic: (t) => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3) + 1;
    },
    inOutElastic: (t) => {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },
    inBounce: (t) => 1 - easingFunctions.outBounce(1 - t),
    outBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) {
            let t2 = t - 1.5 / d1;
            return n1 * t2 * t2 + 0.75;
        }
        if (t < 2.5 / d1) {
            let t2 = t - 2.25 / d1;
            return n1 * t2 * t2 + 0.9375;
        }
        let t2 = t - 2.625 / d1;
        return n1 * t2 * t2 + 0.984375;
    },
    inOutBounce: (t) => (t < 0.5 ? (1 - easingFunctions.outBounce(1 - 2 * t)) / 2 : (1 + easingFunctions.outBounce(2 * t - 1)) / 2),
};
