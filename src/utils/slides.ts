// Slide templates for quick presentation creation

export interface ImageContentOptions {
    image: string;
    title: string;
    description?: string;
    bullets?: string[];
    layout?: 'image-left' | 'image-right' | 'image-top' | 'image-bottom';
    imageSplit?: number;
    padding?: number;
    animate?: boolean;
    animationProgress?: number;
}

export interface ComparisonOptions {
    before: string;
    after: string;
    labels?: [string, string];
    title?: string;
    splitPosition?: number; // 0-1
    vertical?: boolean;
}

export interface HeroOptions {
    image: string;
    caption?: string;
    overlay?: 'dark' | 'light' | 'gradient' | 'none';
    overlayOpacity?: number;
    captionPosition?: 'center' | 'bottom' | 'top';
    captionSize?: number;
}

export interface TimelineOptions {
    items: { date: string; title: string; description?: string }[];
    color?: string;
    textColor?: string;
    progress?: number;
    orientation?: 'horizontal' | 'vertical';
}

export interface TeamMemberOptions {
    image: string;
    name: string;
    role: string;
    bio?: string;
    color?: string;
    align?: 'left' | 'right' | 'center';
}

export interface TestimonialOptions {
    quote: string;
    author: string;
    role?: string;
    image?: string;
    color?: string;
    bgOpacity?: number;
    style?: 'modern' | 'classic' | 'minimal';
}

export interface ProductShowcaseOptions {
    image: string;
    hotspots?: { x: number; y: number; label: string; position?: 'top' | 'bottom' | 'left' | 'right' }[];
    title?: string;
    price?: string;
    description?: string;
    color?: string;
    animationProgress?: number;
}

export interface CollageOptions {
    images: string[]; // 3-6 images recommended
    layout?: 'masonry' | 'scatter' | 'filmstrip';
    spacing?: number;
    bgImage?: string;
}

export interface MagazineOptions {
    image: string;
    headline: string;
    subheadline?: string;
    text?: string;
    layout?: 'classic' | 'modern' | 'split';
    themeColor?: string;
}

export function createSlideTemplates(context: any) {
    const { ctx, width, height, image, text } = context;
    const brandKit = context.brandKit;

    return {
        imageContent: (opts: ImageContentOptions) => {
            if (!ctx || !width || !height || !image || !text) return;

            // Map layout to splitScreen parameters
            const layout = opts.layout ?? 'image-left';
            let horizontal = true;
            let imagePos: 'left' | 'right' | 'top' | 'bottom' = 'left';

            if (layout === 'image-left') {
                horizontal = true;
                imagePos = 'left';
            } else if (layout === 'image-right') {
                horizontal = true;
                imagePos = 'right';
            } else if (layout === 'image-top') {
                horizontal = false;
                imagePos = 'top';
            } else {
                horizontal = false;
                imagePos = 'bottom';
            }

            // Use layout.splitScreen
            const layoutSystem = context.layout;
            if (layoutSystem) {
                layoutSystem.splitScreen({
                    image: opts.image,
                    title: opts.title,
                    description: opts.description,
                    bullets: opts.bullets,
                    layout: horizontal ? 'horizontal' : 'vertical',
                    imagePosition: imagePos,
                    imageSplit: opts.imageSplit ?? 0.5,
                    padding: opts.padding ?? 0.05,
                    animate: opts.animate ?? true,
                    animationProgress: opts.animationProgress
                });
            }
        },

        comparison: (opts: ComparisonOptions) => {
            if (!ctx || !width || !height || !image || !text) return;

            const splitPos = opts.splitPosition ?? 0.5;
            const isVertical = opts.vertical ?? false;

            // Draw title if provided
            if (opts.title) {
                ctx.save();
                text.draw(opts.title, width / 2, height * 0.1, {
                    size: Math.min(width, height) * 0.05,
                    align: 'center',
                    color: 'white'
                });
                ctx.restore();
            }

            const contentY = opts.title ? height * 0.2 : 0;
            const contentH = opts.title ? height * 0.8 : height;

            // Draw before image
            ctx.save();
            ctx.beginPath();
            if (isVertical) {
                ctx.rect(0, contentY, width, contentH * splitPos);
            } else {
                ctx.rect(0, contentY, width * splitPos, contentH);
            }
            ctx.clip();

            image(opts.before, 0, contentY, width, contentH, { fit: 'cover' });

            // Before label
            if (opts.labels) {
                const labelY = contentY + contentH * 0.1;
                text.draw(opts.labels[0], width * 0.1, labelY, {
                    size: Math.min(width, height) * 0.03,
                    color: 'white',
                    outlineWidth: 2,
                    outlineColor: 'black'
                });
            }
            ctx.restore();

            // Draw after image
            ctx.save();
            ctx.beginPath();
            if (isVertical) {
                ctx.rect(0, contentY + contentH * splitPos, width, contentH * (1 - splitPos));
            } else {
                ctx.rect(width * splitPos, contentY, width * (1 - splitPos), contentH);
            }
            ctx.clip();

            image(opts.after, 0, contentY, width, contentH, { fit: 'cover' });

            // After label
            if (opts.labels) {
                const labelX = isVertical ? width * 0.1 : width * 0.6;
                const labelY = isVertical ? contentY + contentH * 0.6 : contentY + contentH * 0.1;
                text.draw(opts.labels[1], labelX, labelY, {
                    size: Math.min(width, height) * 0.03,
                    color: 'white',
                    outlineWidth: 2,
                    outlineColor: 'black'
                });
            }
            ctx.restore();

            // Draw divider line
            ctx.save();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            if (isVertical) {
                const y = contentY + contentH * splitPos;
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            } else {
                const x = width * splitPos;
                ctx.moveTo(x, contentY);
                ctx.lineTo(x, contentY + contentH);
            }
            ctx.stroke();
            ctx.restore();
        },

        hero: (opts: HeroOptions) => {
            if (!ctx || !width || !height || !image || !text) return;

            // Draw full-screen image
            image(opts.image, 0, 0, width, height, { fit: 'cover' });

            // Draw overlay
            if (opts.overlay && opts.overlay !== 'none') {
                ctx.save();
                const opacity = opts.overlayOpacity ?? 0.4;

                if (opts.overlay === 'dark') {
                    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                    ctx.fillRect(0, 0, width, height);
                } else if (opts.overlay === 'light') {
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fillRect(0, 0, width, height);
                } else if (opts.overlay === 'gradient') {
                    const grad = ctx.createLinearGradient(0, 0, 0, height);
                    grad.addColorStop(0, `rgba(0, 0, 0, 0)`);
                    grad.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.restore();
            }

            // Draw caption
            if (opts.caption) {
                const captionPos = opts.captionPosition ?? 'center';
                const captionSize = opts.captionSize ?? Math.min(width, height) * 0.06;

                let captionY: number;
                if (captionPos === 'top') {
                    captionY = height * 0.2;
                } else if (captionPos === 'bottom') {
                    captionY = height * 0.85;
                } else {
                    captionY = height * 0.5;
                }

                ctx.save();
                text.draw(opts.caption, width / 2, captionY, {
                    size: captionSize,
                    align: 'center',
                    color: 'white',
                    outlineWidth: 4,
                    outlineColor: 'rgba(0, 0, 0, 0.8)'
                });
                ctx.restore();
            }
        },

        timeline: (opts: TimelineOptions) => {
            if (!ctx || !width || !height || !text) return;

            const color = opts.color ?? '#3498db';
            const textColor = opts.textColor ?? 'white';
            const progress = opts.progress ?? 1;
            const items = opts.items;
            const orientation = opts.orientation ?? (context.isPortrait ? 'vertical' : 'horizontal');

            const margin = Math.min(width, height) * 0.1;

            if (orientation === 'horizontal') {
                const lineY = height * 0.5;
                const startX = margin;
                const endX = width - margin;
                const totalW = endX - startX;
                const step = totalW / (items.length - 1);

                // Draw main line
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(startX, lineY);
                ctx.lineTo(startX + totalW * Math.min(1, progress * 1.2), lineY); // Line animates in first
                ctx.lineWidth = 4;
                ctx.strokeStyle = color;
                ctx.stroke();
                ctx.restore();

                // Draw points and text
                items.forEach((item, i) => {
                    const itemProgress = Math.max(0, Math.min(1, (progress - i * 0.15) * 2));
                    if (itemProgress <= 0) return;

                    const x = startX + i * step;

                    ctx.save();
                    ctx.fillStyle = color;
                    ctx.globalAlpha = itemProgress;

                    // Dot
                    ctx.beginPath();
                    ctx.arc(x, lineY, 8 * itemProgress, 0, Math.PI * 2);
                    ctx.fill();

                    // Date (Top)
                    text.draw(item.date, x, lineY - 30, {
                        size: 20, align: 'center', color: textColor, font: 'Inter, sans-serif'
                    });

                    // Title (Bottom)
                    text.draw(item.title, x, lineY + 30, {
                        size: 18, align: 'center', color: textColor, font: 'bold Inter, sans-serif'
                    });

                    if (item.description) {
                        text.block(item.description, x - step / 2 + 10, lineY + 60, step - 20, {
                            size: 14, align: 'center', color: 'rgba(255,255,255,0.7)'
                        });
                    }
                    ctx.restore();
                });
            } else {
                // Vertical Timeline
                const lineX = width * 0.2;
                const startY = margin;
                const endY = height - margin;
                const totalH = endY - startY;
                const step = totalH / (items.length - 1);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(lineX, startY);
                ctx.lineTo(lineX, startY + totalH * Math.min(1, progress * 1.2));
                ctx.lineWidth = 4;
                ctx.strokeStyle = color;
                ctx.stroke();
                ctx.restore();

                items.forEach((item, i) => {
                    const itemProgress = Math.max(0, Math.min(1, (progress - i * 0.15) * 2));
                    if (itemProgress <= 0) return;

                    const y = startY + i * step;

                    ctx.save();
                    ctx.fillStyle = color;
                    ctx.globalAlpha = itemProgress;

                    // Dot
                    ctx.beginPath();
                    ctx.arc(lineX, y, 8 * itemProgress, 0, Math.PI * 2);
                    ctx.fill();

                    // Date (Left)
                    text.draw(item.date, lineX - 20, y, {
                        size: 18, align: 'right', color: textColor, font: 'Inter, sans-serif'
                    });

                    // Content (Right)
                    const contentX = lineX + 30;
                    text.draw(item.title, contentX, y - 10, {
                        size: 20, align: 'left', color: textColor, font: 'bold Inter, sans-serif'
                    });

                    if (item.description) {
                        text.block(item.description, contentX, y + 20, width - contentX - margin, {
                            size: 16, align: 'left', color: 'rgba(255,255,255,0.7)'
                        });
                    }
                    ctx.restore();
                });
            }
        },

        teamMember: (opts: TeamMemberOptions) => {
            if (!ctx || !width || !height || !image || !text) return;

            const align = opts.align ?? 'center';
            const color = opts.color ?? '#3498db';

            ctx.save();

            if (align === 'center') {
                const imgSize = Math.min(width, height) * 0.3;
                const imgX = (width - imgSize) / 2;
                const imgY = height * 0.15;

                // Photo circle mask
                ctx.save();
                ctx.beginPath();
                ctx.arc(width / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
                ctx.clip();
                image(opts.image, imgX, imgY, imgSize, imgSize, { fit: 'cover' });
                ctx.restore();

                // Ring
                ctx.beginPath();
                ctx.arc(width / 2, imgY + imgSize / 2, imgSize / 2 + 5, 0, Math.PI * 2);
                ctx.lineWidth = 4;
                ctx.strokeStyle = color;
                ctx.stroke();

                // Text info
                text.draw(opts.name, width / 2, imgY + imgSize + 40, {
                    size: 40, align: 'center', font: 'bold Inter, sans-serif', color: 'white'
                });
                text.draw(opts.role, width / 2, imgY + imgSize + 90, {
                    size: 24, align: 'center', font: 'Inter, sans-serif', color: color
                });

                if (opts.bio) {
                    const bioWidth = Math.min(width * 0.8, 600);
                    text.block(opts.bio, (width - bioWidth) / 2, imgY + imgSize + 140, bioWidth, {
                        size: 18, align: 'center', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6
                    });
                }
            } else {
                // Side layout similar to split screen but tailored for profile
                const margin = width * 0.1;
                const imgW = width * 0.35;
                const imgH = height * 0.6;

                if (align === 'left') {
                    image(opts.image, margin, (height - imgH) / 2, imgW, imgH, { fit: 'cover' });

                    const textX = margin + imgW + 40;
                    const textY = height * 0.3;

                    text.draw(opts.name, textX, textY, { size: 48, align: 'left', font: 'bold Inter, sans-serif' });
                    text.draw(opts.role, textX, textY + 60, { size: 28, align: 'left', color: color });
                    if (opts.bio) {
                        text.block(opts.bio, textX, textY + 110, width - textX - margin, {
                            size: 18, align: 'left', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6
                        });
                    }
                }
            }
            ctx.restore();
        },

        testimonial: (opts: TestimonialOptions) => {
            if (!ctx || !width || !height || !text) return;

            const bgOpacity = opts.bgOpacity ?? 0.8;
            const cardW = Math.min(width * 0.8, 800);
            const cardH = height * 0.6;
            const cardX = (width - cardW) / 2;
            const cardY = (height - cardH) / 2;

            // Glass card background
            ctx.save();
            ctx.fillStyle = `rgba(30,30,30,${bgOpacity})`;
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 20);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Giant quote mark
            text.draw('"', cardX + 40, cardY + 80, {
                size: 120, font: 'serif', color: opts.color || '#f1c40f'
            });

            // Quote text
            text.block(opts.quote, cardX + 80, cardY + 100, cardW - 160, {
                size: 28, align: 'center', font: 'italic Inter, serif', lineHeight: 1.6
            });

            // Author info at bottom
            const authorY = cardY + cardH - 100;
            if (opts.image && image) {
                const imgSize = 60;
                ctx.save();
                ctx.beginPath();
                ctx.arc(width / 2 - 100, authorY, imgSize / 2, 0, Math.PI * 2);
                ctx.clip();
                image(opts.image, width / 2 - 100 - imgSize / 2, authorY - imgSize / 2, imgSize, imgSize, { fit: 'cover' });
                ctx.restore();

                text.draw(opts.author, width / 2 - 50, authorY - 10, { size: 20, align: 'left', font: 'bold Inter, sans-serif' });
                if (opts.role) {
                    text.draw(opts.role, width / 2 - 50, authorY + 15, { size: 16, align: 'left', color: 'rgba(255,255,255,0.6)' });
                }
            } else {
                text.draw(`- ${opts.author}`, width / 2, authorY, { size: 22, align: 'center', font: 'bold Inter, sans-serif' });
                if (opts.role) {
                    text.draw(opts.role, width / 2, authorY + 30, { size: 16, align: 'center', color: 'rgba(255,255,255,0.6)' });
                }
            }

            ctx.restore();
        },

        productShowcase: (opts: ProductShowcaseOptions) => {
            if (!ctx || !width || !height || !image || !text) return;


            const accentColor = opts.color ?? brandKit.colors.accent;
            const animProgress = opts.animationProgress ?? 1;

            // 1. Draw Product Image (Centered)
            const imgSize = Math.min(width, height) * 0.5;


            // Subtle floating animation
            const floatY = Math.sin(context.time * 2) * 10;

            ctx.save();
            image.smart(opts.image, {
                position: 'center',
                fit: 'contain',
                scale: 1 + (1 - animProgress) * 0.2, // Zoom out entrance
                entrance: { type: 'zoomIn', duration: 0.8 },
                progress: animProgress
            });
            ctx.restore();

            // 2. Hotspots
            if (opts.hotspots && animProgress > 0.5) {
                opts.hotspots.forEach((spot, i) => {
                    // Coordinates relative to screen center area (approximate product zone)
                    // mapping 0-1 to a box around the product
                    const zoneSize = imgSize * 0.8;
                    const hx = (width - zoneSize) / 2 + spot.x * zoneSize;
                    const hy = (height - zoneSize) / 2 + spot.y * zoneSize + floatY; // Follow float

                    const spotProgress = Math.min(1, Math.max(0, (animProgress - 0.5 - i * 0.1) * 2));
                    if (spotProgress <= 0) return;

                    ctx.save();
                    ctx.globalAlpha = spotProgress;

                    // Pulse ring
                    const pulse = (Math.sin(context.time * 4) + 1) / 2;
                    ctx.beginPath();
                    ctx.arc(hx, hy, 10 + pulse * 10, 0, Math.PI * 2);
                    ctx.fillStyle = accentColor;
                    ctx.globalAlpha = spotProgress * (0.5 - pulse * 0.3);
                    ctx.fill();

                    // Dot
                    ctx.globalAlpha = spotProgress;
                    ctx.beginPath();
                    ctx.arc(hx, hy, 6, 0, Math.PI * 2);
                    ctx.fillStyle = accentColor;
                    ctx.fill();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Label line and text
                    const labelX = hx + (spot.position === 'left' ? -100 : 100);
                    const labelY = hy + (spot.position === 'top' ? -50 : spot.position === 'bottom' ? 50 : 0);

                    ctx.beginPath();
                    ctx.moveTo(hx, hy);
                    ctx.lineTo(labelX, labelY);
                    ctx.strokeStyle = accentColor;
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    text.draw(spot.label, labelX, labelY - 5, {
                        size: 16,
                        color: brandKit.colors.text,
                        align: spot.position === 'left' ? 'right' : 'left',
                        font: brandKit.typography.body
                    });

                    ctx.restore();
                });
            }

            // 3. Info Panel
            if (opts.title) {
                const titleY = height * 0.8;
                const alpha = Math.min(1, Math.max(0, (animProgress - 0.3) * 2));

                ctx.save();
                ctx.globalAlpha = alpha;
                text.draw(opts.title, width / 2, titleY, {
                    size: 40, align: 'center', font: brandKit.typography.heading, color: brandKit.colors.text
                });

                if (opts.price) {
                    text.draw(opts.price, width / 2, titleY + 50, {
                        size: 32, align: 'center', font: brandKit.typography.body, color: accentColor
                    });
                }
                ctx.restore();
            }
        },

        collage: (opts: CollageOptions) => {
            if (!ctx || !width || !height || !image) return;

            const spacing = opts.spacing ?? 10;
            const layout = opts.layout ?? 'masonry';
            const count = opts.images.length;

            if (layout === 'masonry') {
                // Simple 3-column masonry approximation
                const cols = 3;
                const colW = (width - spacing * (cols + 1)) / cols;
                const colHeights = [0, 0, 0];

                opts.images.forEach((imgName, i) => {
                    // Pick shortest column
                    const colIndex = colHeights.indexOf(Math.min(...colHeights));
                    const x = spacing + colIndex * (colW + spacing);
                    const y = spacing + colHeights[colIndex];

                    // Random-ish height for variety based on index
                    const h = (i % 2 === 0 ? colW * 0.8 : colW * 1.4);

                    ctx.save();
                    // Smart crop to fit this tile
                    image.smart(imgName, { fit: 'cover', crop: { scale: 1.1 } });
                    // Wait, smart doesn't take raw coords easily if we don't use the full 'smart' pipeline with zone/preset
                    // So we use standard image but with new crop helper if available? 
                    // Actually, we can use standard drawImage logic here or just call image() with cover fit
                    // Let's use standard image helper which supports defaults
                    image(imgName, x, y, colW, h, { fit: 'cover' });
                    ctx.restore();

                    colHeights[colIndex] += h + spacing;
                });
            } else if (layout === 'scatter') {
                // Random scattered polaroids
                const cx = width / 2;
                const cy = height / 2;

                opts.images.forEach((imgName, i) => {
                    const angle = (i / count) * Math.PI * 2;
                    const radius = Math.min(width, height) * 0.2;
                    const x = cx + Math.cos(angle) * radius;
                    const y = cy + Math.sin(angle) * radius;
                    const w = 300;
                    const h = 240;
                    const rot = (Math.random() - 0.5) * 0.4;

                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(rot);

                    // Polaroid frame
                    ctx.fillStyle = 'white';
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 15;
                    ctx.fillRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 60);

                    image(imgName, -w / 2, -h / 2, w, h, { fit: 'cover' });
                    ctx.restore();
                });
            }
        },

        magazine: (opts: MagazineOptions) => {
            if (!ctx || !width || !height || !image || !text) return;


            const isClassic = opts.layout === 'classic';

            // Background Image (Full or Split)
            if (opts.layout === 'split') {
                image(opts.image, width / 2, 0, width / 2, height, { fit: 'cover' });

                ctx.fillStyle = brandKit.colors.background;
                ctx.fillRect(0, 0, width / 2, height);
            } else {
                image(opts.image, 0, 0, width, height, { fit: 'cover' });

                // Gradient overlay for text readability
                const grad = ctx.createLinearGradient(0, height / 2, 0, height);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,0.9)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
            }

            // Typography
            const titleX = opts.layout === 'split' ? width * 0.05 : width * 0.05;
            const titleY = opts.layout === 'split' ? height * 0.4 : height * 0.65;
            const maxWidth = opts.layout === 'split' ? width * 0.4 : width * 0.9;

            const titleColor = opts.layout === 'split' ? brandKit.colors.text : 'white';

            text.draw(opts.headline.toUpperCase(), titleX, titleY, {
                size: fontSize(80),
                align: 'left',
                font: isClassic ? 'Playfair Display, serif' : brandKit.typography.heading,
                color: titleColor
            });

            // Decorative line
            ctx.fillStyle = opts.themeColor ?? brandKit.colors.accent;
            ctx.fillRect(titleX, titleY + 20, 100, 6);

            if (opts.subheadline) {
                text.draw(opts.subheadline, titleX, titleY + 60, {
                    size: 30, align: 'left', font: brandKit.typography.body, color: titleColor
                });
            }

            if (opts.text && opts.layout === 'split') {
                text.block(opts.text, titleX, titleY + 100, maxWidth, {
                    size: 18, align: 'left', color: brandKit.colors.muted, lineHeight: 1.6
                });
            }

            function fontSize(base: number) {
                return context.isMobile ? base * 0.6 : base;
            }
        }
    };
}
