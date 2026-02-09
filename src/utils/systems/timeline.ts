import type { TimelineSystem } from '../../types';

export const createTimelineSystem = (
    time: number,
    frame: number,
    fps: number
): TimelineSystem => {
    let cursor = 0;

    return {
        play: (duration, cb) => {
            const start = cursor;
            const end = cursor + duration;
            if (time >= start && time <= end) {
                const d = Math.max(0.0001, end - start);
                const t = (time - start) / d;
                cb(Math.min(Math.max(t, 0), 1));
            }
            cursor += duration;
        },
        at: (t, cb) => {
            const targetFrame = Math.floor(t * fps);
            if (frame === targetFrame) cb();
        },
        range: (start, end, cb) => {
            if (time >= start && time <= end) {
                const duration = Math.max(0.0001, end - start);
                const t = (time - start) / duration;
                cb(Math.min(Math.max(t, 0), 1));
            }
        },
        sequence: (scenes) => {
            let currentOffset = 0;
            for (let i = 0; i < scenes.length; i++) {
                const s = scenes[i];
                const duration = Math.max(0.0001, s.duration);
                const isLast = i === scenes.length - 1;

                // Check if time is within this segment
                if (time >= currentOffset && (time < currentOffset + duration || (isLast && time <= currentOffset + duration))) {
                    const t = (time - currentOffset) / duration;
                    s.run(Math.min(Math.max(t, 0), 1));
                    break;
                }
                currentOffset += duration;
            }
        },
        reset: () => {
            cursor = 0;
        }
    };
};
