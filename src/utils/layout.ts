// Layout system for professional presentations and marketing

export interface SplitScreenOptions {
    image: string;
    title: string;
    description?: string;
    bullets?: string[];
    layout?: 'horizontal' | 'vertical';
    imagePosition?: 'left' | 'right' | 'top' | 'bottom';
    imageSplit?: number; // 0-1
    padding?: number; // 0-1
    animate?: boolean;
    animationProgress?: number; // 0-1, manual control
    titleSize?: number;
    descSize?: number;
    titleColor?: string;
    descColor?: string;
}

export interface GridOptions {
    images: string[];
    columns?: number;
    rows?: number;
    gap?: number; // 0-1
    padding?: number; // 0-1
    fit?: 'contain' | 'cover';
    captions?: string[];
    stagger?: number;
    entrance?: 'fade' | 'zoom' | 'slide';
    animationProgress?: number;
}

export function createLayoutSystem(context: any) {
    const { ctx, width, height, image, text, ease, range } = context;


    return {
        splitScreen: (opts: SplitScreenOptions) => {
            if (!ctx || !width || !height || !image || !text) return;

            const layout = opts.layout ?? (context.isPortrait ? 'vertical' : 'horizontal');
            const imagePos = opts.imagePosition ?? (layout === 'horizontal' ? 'left' : 'top');
            const split = opts.imageSplit ?? (context.isMobile ? 0.4 : 0.5);
            const padding = (opts.padding ?? 0.05) * Math.min(width, height);

            // Calculate zones
            let imageZone: { x: number; y: number; w: number; h: number };
            let textZone: { x: number; y: number; w: number; h: number };

            if (layout === 'horizontal') {
                if (imagePos === 'left') {
                    imageZone = { x: 0, y: 0, w: width * split, h: height };
                    textZone = { x: width * split, y: 0, w: width * (1 - split), h: height };
                } else {
                    textZone = { x: 0, y: 0, w: width * (1 - split), h: height };
                    imageZone = { x: width * (1 - split), y: 0, w: width * split, h: height };
                }
            } else {
                if (imagePos === 'top') {
                    imageZone = { x: 0, y: 0, w: width, h: height * split };
                    textZone = { x: 0, y: height * split, w: width, h: height * (1 - split) };
                } else {
                    textZone = { x: 0, y: 0, w: width, h: height * (1 - split) };
                    imageZone = { x: 0, y: height * (1 - split), w: width, h: height * split };
                }
            }

            // Animation progress
            let progress = opts.animationProgress ?? 1;
            if (opts.animate && opts.animationProgress === undefined && range && ease) {
                const t = range(0, 2);
                progress = ease('outQuart', t);
            }

            // Draw image with animation
            ctx.save();
            if (opts.animate && progress < 1) {
                const slideOffset = (1 - progress) * (layout === 'horizontal' ? width * 0.2 : height * 0.2);
                if (imagePos === 'left') ctx.translate(-slideOffset, 0);
                else if (imagePos === 'right') ctx.translate(slideOffset, 0);
                else if (imagePos === 'top') ctx.translate(0, -slideOffset);
                else ctx.translate(0, slideOffset);
                ctx.globalAlpha = progress;
            }

            image(
                opts.image,
                imageZone.x + padding,
                imageZone.y + padding,
                imageZone.w - padding * 2,
                imageZone.h - padding * 2,
                { fit: 'contain' }
            );
            ctx.restore();

            // Draw text with staggered animation
            const titleProgress = opts.animate && range && ease ?
                ease('outQuart', range(0.3, 1.3)) : 1;
            const descProgress = opts.animate && range && ease ?
                ease('outQuart', range(0.6, 1.6)) : 1;
            const bulletsProgress = opts.animate && range && ease ?
                ease('outQuart', range(0.9, 1.9)) : 1;

            const textX = textZone.x + padding * 2;
            const textY = textZone.y + textZone.h * 0.3;
            const textW = textZone.w - padding * 4;

            // Title
            if (titleProgress > 0) {
                ctx.save();
                ctx.globalAlpha = titleProgress;
                const titleSize = opts.titleSize ?? Math.min(width, height) * 0.05;
                text.draw(opts.title, textX, textY, {
                    size: titleSize,
                    align: 'left',
                    color: opts.titleColor ?? 'white'
                });
                ctx.restore();
            }

            // Description
            if (opts.description && descProgress > 0) {
                ctx.save();
                ctx.globalAlpha = descProgress;
                const descSize = opts.descSize ?? Math.min(width, height) * 0.025;
                text.block(
                    opts.description,
                    textX,
                    textY + (opts.titleSize ?? Math.min(width, height) * 0.05) + padding,
                    textW,
                    {
                        size: descSize,
                        align: 'left',
                        color: opts.descColor ?? 'rgba(255, 255, 255, 0.85)',
                        lineHeight: 1.6
                    }
                );
                ctx.restore();
            }

            // Bullets
            if (opts.bullets && bulletsProgress > 0) {
                const bulletY = textY + (opts.titleSize ?? Math.min(width, height) * 0.05) +
                    (opts.description ? padding * 3 : padding);
                const bulletSize = opts.descSize ?? Math.min(width, height) * 0.025;
                const bulletSpacing = bulletSize * 2;

                opts.bullets.forEach((bullet, i) => {
                    ctx.save();
                    ctx.globalAlpha = bulletsProgress;
                    text.draw(
                        `• ${bullet}`,
                        textX,
                        bulletY + i * bulletSpacing,
                        {
                            size: bulletSize,
                            align: 'left',
                            color: opts.descColor ?? 'rgba(255, 255, 255, 0.85)'
                        }
                    );
                    ctx.restore();
                });
            }
        },

        grid: (opts: GridOptions) => {
            if (!ctx || !width || !height || !image) return;

            let cols = opts.columns ?? Math.ceil(Math.sqrt(opts.images.length));
            if (context.isMobile && cols > 2) cols = 2; // Limit columns on mobile

            const rows = opts.rows ?? Math.ceil(opts.images.length / cols);
            const gap = (opts.gap ?? 0.02) * Math.min(width, height);
            const padding = (opts.padding ?? 0.05) * Math.min(width, height);

            const totalW = width - padding * 2;
            const totalH = height - padding * 2;
            const cellW = (totalW - gap * (cols - 1)) / cols;
            const cellH = (totalH - gap * (rows - 1)) / rows;

            opts.images.forEach((imgName, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);

                const x = padding + col * (cellW + gap);
                const y = padding + row * (cellH + gap);

                // Staggered animation
                let itemProgress = opts.animationProgress ?? 1;
                if (opts.stagger && range && ease) {
                    const delay = i * opts.stagger;
                    const t = range(delay, delay + 1);
                    itemProgress = ease('outBack', t);
                }

                if (itemProgress > 0) {
                    ctx.save();

                    // Apply entrance animation
                    if (opts.entrance === 'zoom') {
                        ctx.translate(x + cellW / 2, y + cellH / 2);
                        ctx.scale(itemProgress, itemProgress);
                        ctx.translate(-(x + cellW / 2), -(y + cellH / 2));
                    } else if (opts.entrance === 'slide') {
                        const offset = (1 - itemProgress) * 50;
                        ctx.translate(0, offset);
                    }

                    ctx.globalAlpha = itemProgress;

                    image(imgName, x, y, cellW, cellH, { fit: opts.fit ?? 'cover' });

                    // Caption
                    if (opts.captions && opts.captions[i] && text) {
                        text.draw(opts.captions[i], x + cellW / 2, y + cellH + gap / 2, {
                            size: Math.min(cellW, cellH) * 0.1,
                            align: 'center',
                            color: 'white'
                        });
                    }

                    ctx.restore();
                }
            });
        }
    };
}
