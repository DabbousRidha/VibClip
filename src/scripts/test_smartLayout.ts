import type { AnimationContext } from '../types';
import { BrandPresets } from '../utils/brand';

// Test script for Phase 3: Brand Kit & Advanced Media
export default function testSmartLayout(context: AnimationContext) {
    const { width, height, time, isMobile } = context;

    // Cycle Brands based on time
    // 0-5s: TechStart (Default)
    // 5-10s: FashionHouse
    // 10-15s: CorporatePro
    let currentBrand = BrandPresets.TechStart;
    if (time > 5 && time < 10) currentBrand = BrandPresets.FashionHouse;
    if (time >= 10) currentBrand = BrandPresets.CorporatePro;

    // Manually inject brand for testing (in real app, this is done in context creation)
    context.brandKit = currentBrand;

    // Background based on brand
    context.ctx.fillStyle = context.brandKit.colors.background;
    context.ctx.fillRect(0, 0, width, height);

    // 1. Smart Cropping Test (0-3s)
    if (time < 3) {
        context.text.draw(`Smart Crop Focus Test (${context.brandKit.name})`, width / 2, 50, {
            align: 'center', color: context.brandKit.colors.text, font: context.brandKit.typography.heading
        });

        // Simulating different aspect ratios or focus points
        // Draw image 3 times with different focus


        // Left: Focus Top-Left
        context.image.smart('avatar1', {
            position: 'center-left',
            fit: 'cover',
            crop: { focus: { x: 0.2, y: 0.2 } },
            border: { width: 2, color: context.brandKit.colors.accent }
        });

        // Center: Focus Center
        context.image.smart('avatar1', {
            position: 'center',
            fit: 'cover',
            crop: { focus: { x: 0.5, y: 0.5 } },
            border: { width: 2, color: context.brandKit.colors.primary }
        });

        // Right: Focus Bottom-Right (+ Zoom)
        context.image.smart('avatar1', {
            position: 'center-right',
            fit: 'cover',
            crop: { focus: { x: 0.8, y: 0.8 }, scale: 1.5 },
            border: { width: 2, color: context.brandKit.colors.secondary }
        });
    }

    // 2. Product Showcase (3-8s)
    else if (time < 8) {


        context.slides.productShowcase({
            image: 'product1',
            title: 'Hydra Bottle 3000',
            price: '$49.99',
            description: 'The ultimate hydration companion.',
            hotspots: [
                { x: 0.2, y: -0.3, label: 'Leak Proof', position: 'left' },
                { x: 0.3, y: 0.2, label: 'Smart Cap', position: 'right' }
            ],
            animationProgress: context.range(3.5, 7) // Hotspots reveal
        });
    }

    // 3. Magazine Layout (8-12s)
    else if (time < 12) {
        context.slides.magazine({
            image: 'fashion_model',
            headline: 'Autumn Collection',
            subheadline: 'Redefining Elegance for the Modern Era',
            text: 'Discover the new textures and tones that define this season. From deep earth colors to vibrant accents, our collection speaks to the bold and the beautiful.',
            layout: isMobile ? 'modern' : 'split'
        });
    }

    // 4. Collage (12s+)
    else {
        context.slides.collage({
            images: ['img1', 'img2', 'img3', 'img4', 'img5'],
            layout: 'masonry',
            spacing: 15
        });

        context.text.draw("Dynamic Collage", width / 2, height - 50, {
            align: 'center',
            color: context.brandKit.colors.text,
            size: 40,
            font: context.brandKit.typography.heading,
            outlineWidth: 4,
            outlineColor: context.brandKit.colors.background
        });
    }
}
