# 🎬 Motion System API Reference

The Motion System (`context.motion`) provides high-level cinematic components for professional animations. These functions handle complex visual patterns so you can focus on storytelling.

## Table of Contents
- [Charts & Data Visualization](#charts--data-visualization)
- [Text Orchestration](#text-orchestration)
- [Cinematic Effects](#cinematic-effects--post-processing)
- [Backgrounds & Ambiance](#backgrounds--ambiance)
- [Asset Composition](#asset-composition)
- [Utilities & Branding](#utilities--branding)
- [Transitions](#transitions)
- [Layout & Presentation](#layout--presentation-system)

---

## Charts & Data Visualization

### `motion.drawBarChart(data, opts)`
Renders an animated bar chart with staggered entry animations.

**Parameters:**
- `data`: `Array<{ label: string, value: number }>` - Array of data points
- `opts`: `Object` (optional)
  - `x`: `number` - X position (default: `context.width * 0.1`)
  - `y`: `number` - Y position (default: `context.height * 0.2`)
  - `width`: `number` - Chart width (default: `context.width * 0.8`)
  - `height`: `number` - Chart height (default: `context.height * 0.6`)
  - `color`: `string` - Bar color (default: `'#3498db'`)
  - `labelColor`: `string` - Label text color (default: `'white'`)
  - `stagger`: `number` - Delay between bars in seconds (default: `0.1`)
  - `animationDuration`: `number` - Duration of bar growth (default: `1.0`)

**Example:**
```javascript
const salesData = [
  { label: 'Q1', value: 45000 },
  { label: 'Q2', value: 62000 },
  { label: 'Q3', value: 58000 },
  { label: 'Q4', value: 71000 }
];

context.motion.drawBarChart(salesData, {
  x: context.width * 0.1,
  y: context.height * 0.2,
  color: '#2ecc71',
  stagger: 0.15
});
```

**Performance:** Medium impact. Suitable for up to 20 bars.

---

### `motion.drawLineChart(data, opts)`
Smooth path reveal animation for line charts.

**Parameters:**
- `data`: `Array<{ x: number, y: number }>` - Array of data points
- `opts`: `Object` (optional)
  - `x`: `number` - Chart X position
  - `y`: `number` - Chart Y position
  - `width`: `number` - Chart width
  - `height`: `number` - Chart height
  - `color`: `string` - Line color (default: `'#e74c3c'`)
  - `lineWidth`: `number` - Stroke width (default: `3`)
  - `fillBelow`: `boolean` - Fill area under line (default: `false`)
  - `fillOpacity`: `number` - Fill opacity if enabled (default: `0.3`)
  - `showPoints`: `boolean` - Show data point markers (default: `true`)
  - `animationDuration`: `number` - Path reveal duration (default: `2.0`)

**Example:**
```javascript
const trend = [
  { x: 0, y: 100 },
  { x: 1, y: 150 },
  { x: 2, y: 130 },
  { x: 3, y: 180 },
  { x: 4, y: 200 }
];

context.motion.drawLineChart(trend, {
  color: '#9b59b6',
  lineWidth: 4,
  fillBelow: true,
  showPoints: true
});
```

---

### `motion.drawDonutChart(data, opts)`
Animated concentric rings for categorical data visualization.

**Parameters:**
- `data`: `Array<{ label: string, value: number, color?: string }>` - Data segments
- `opts`: `Object` (optional)
  - `x`: `number` - Center X (default: `context.centerX`)
  - `y`: `number` - Center Y (default: `context.centerY`)
  - `radius`: `number` - Outer radius (default: `context.minDim * 0.3`)
  - `thickness`: `number` - Ring thickness (default: `60`)
  - `colors`: `Array<string>` - Color palette (auto-generated if not provided)
  - `showLabels`: `boolean` - Display segment labels (default: `true`)
  - `animationDuration`: `number` - Segment draw duration (default: `1.5`)

**Example:**
```javascript
const marketShare = [
  { label: 'Product A', value: 45, color: '#3498db' },
  { label: 'Product B', value: 30, color: '#e74c3c' },
  { label: 'Product C', value: 25, color: '#2ecc71' }
];

context.motion.drawDonutChart(marketShare, {
  radius: 200,
  thickness: 80,
  showLabels: true
});
```

---

### `motion.drawRadarChart(labels, values, opts)`
Spider/radar graphs for multi-variable comparisons.

**Parameters:**
- `labels`: `Array<string>` - Axis labels
- `values`: `Array<number>` - Values (0-1 normalized)
- `opts`: `Object` (optional)
  - `x`: `number` - Center X
  - `y`: `number` - Center Y
  - `radius`: `number` - Chart radius (default: `150`)
  - `color`: `string` - Fill color (default: `'#3498db'`)
  - `bgOpacity`: `number` - Background grid opacity (default: `0.2`)
  - `showLabels`: `boolean` - Display axis labels (default: `true`)

**Example:**
```javascript
const skills = ['Speed', 'Power', 'Defense', 'Agility', 'Stamina'];
const ratings = [0.8, 0.6, 0.9, 0.7, 0.5];

context.motion.drawRadarChart(skills, ratings, {
  radius: 180,
  color: '#e67e22'
});
```

---

### `motion.numericDashboard(stats, opts)`
Grid layout of animated counters and labels for KPI displays.

**Parameters:**
- `stats`: `Array<{ label: string, value: number, suffix?: string }>` - Statistics to display
- `opts`: `Object` (optional)
  - `x`: `number` - Grid X position
  - `y`: `number` - Grid Y position
  - `width`: `number` - Total grid width
  - `columns`: `number` - Number of columns (default: `3`)
  - `color`: `string` - Text color (default: `'white'`)
  - `accentColor`: `string` - Number color (default: `'#3498db'`)

**Example:**
```javascript
const kpis = [
  { label: 'Revenue', value: 1250000, suffix: '$' },
  { label: 'Users', value: 45230, suffix: '' },
  { label: 'Growth', value: 23.5, suffix: '%' }
];

context.motion.numericDashboard(kpis, {
  columns: 3,
  accentColor: '#2ecc71'
});
```

---

### `motion.animatedCounter(value, opts)`
Smooth number counting animation from zero.

**Parameters:**
- `value`: `number` - Target value
- `opts`: `Object` (optional)
  - `x`: `number` - X position
  - `y`: `number` - Y position
  - `size`: `number` - Font size (default: `60`)
  - `color`: `string` - Text color (default: `'white'`)
  - `duration`: `number` - Count duration (default: `2.0`)
  - `decimals`: `number` - Decimal places (default: `0`)
  - `prefix`: `string` - Text before number (default: `''`)
  - `suffix`: `string` - Text after number (default: `''`)

**Example:**
```javascript
context.motion.animatedCounter(98.7, {
  x: context.centerX,
  y: context.centerY,
  size: 120,
  color: '#2ecc71',
  decimals: 1,
  suffix: '%'
});
```

---

## Text Orchestration

### `motion.bulletReveal(items, t, opts)`
Staggered bullet point entry from the side with fade and slide.

**Parameters:**
- `items`: `Array<string>` - Bullet point text items
- `t`: `number` - Animation progress (0-1)
- `opts`: `Object` (optional)
  - `x`: `number` - Starting X position
  - `y`: `number` - Starting Y position
  - `spacing`: `number` - Vertical spacing between items (default: `60`)
  - `color`: `string` - Text color (default: `'white'`)
  - `bulletColor`: `string` - Bullet marker color (default: `'#3498db'`)
  - `size`: `number` - Font size (default: `32`)
  - `stagger`: `number` - Delay between items (default: `0.15`)

**Example:**
```javascript
const points = [
  'Increase user engagement',
  'Reduce operational costs',
  'Improve customer satisfaction'
];

const t = context.range(1, 3); // Reveal over 2 seconds
context.motion.bulletReveal(points, t, {
  x: context.width * 0.1,
  y: context.height * 0.3,
  bulletColor: '#e74c3c'
});
```

---

### `motion.cinematicTitle(text, t, opts)`
Professional title card animations with multiple style presets.

**Parameters:**
- `text`: `string` - Title text
- `t`: `number` - Animation progress (0-1)
- `opts`: `Object` (optional)
  - `x`: `number` - X position (default: `context.centerX`)
  - `y`: `number` - Y position (default: `context.centerY`)
  - `size`: `number` - Font size (default: `100`)
  - `color`: `string` - Text color (default: `'white'`)
  - `style`: `'fade' | 'slide' | 'glitch' | 'mask'` - Animation style (default: `'fade'`)
  - `direction`: `'up' | 'down' | 'left' | 'right'` - Slide direction (default: `'up'`)

**Styles:**
- `'fade'`: Simple opacity fade-in
- `'slide'`: Slide from direction with fade
- `'glitch'`: Digital glitch effect with RGB split
- `'mask'`: Clipping reveal (wipe effect)

**Example:**
```javascript
const introT = context.range(0, 2);
context.motion.cinematicTitle('CHAPTER ONE', introT, {
  size: 120,
  style: 'mask',
  color: '#ecf0f1'
});
```

---

### `motion.kineticType(text, opts)`
Physical text with elastic impact and chromatic aberration.

**Parameters:**
- `text`: `string` - Text content
- `opts`: `Object`
  - `x`: `number` - X position
  - `y`: `number` - Y position
  - `size`: `number` - Font size
  - `color`: `string` - Text color
  - `duration`: `number` - Impact animation duration

**Example:**
```javascript
context.motion.kineticType('IMPACT', {
  x: context.centerX,
  y: context.centerY,
  size: 200,
  color: 'white',
  duration: 1.5
});
```

**Use Case:** High-energy title reveals, action moments, beat drops.

---

### `motion.lowerThird(text, subtext, opts)`
Professional overlay for speakers, locations, or section titles.

**Parameters:**
- `text`: `string` - Main text (name/title)
- `subtext`: `string` - Secondary text (role/location)
- `opts`: `Object` (optional)
  - `position`: `'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'` (default: `'bottom-left'`)
  - `color`: `string` - Text color (default: `'white'`)
  - `accentColor`: `string` - Background/accent color (default: `'#3498db'`)
  - `padding`: `number` - Internal padding (default: `20`)

**Example:**
```javascript
context.motion.lowerThird('Dr. Jane Smith', 'Chief Data Scientist', {
  position: 'bottom-left',
  accentColor: '#e74c3c'
});
```

---

### `motion.quoteCard(quote, author, opts)`
Centered impact statement with stylish quotation marks.

**Parameters:**
- `quote`: `string` - Quote text
- `author`: `string` - Attribution text
- `opts`: `Object` (optional)
  - `x`: `number` - Center X
  - `y`: `number` - Center Y
  - `width`: `number` - Maximum text width (default: `context.width * 0.6`)
  - `color`: `string` - Text color (default: `'white'`)
  - `bgOpacity`: `number` - Background overlay opacity (default: `0.3`)

**Example:**
```javascript
context.motion.quoteCard(
  'The best way to predict the future is to invent it.',
  'Alan Kay',
  { color: '#ecf0f1', bgOpacity: 0.5 }
);
```

---

### `motion.callout(label, targetX, targetY, opts)`
Draws a connecting line between a point and a label (annotation).

**Parameters:**
- `label`: `string` - Callout text
- `targetX`: `number` - Point X coordinate
- `targetY`: `number` - Point Y coordinate
- `opts`: `Object` (optional)
  - `x`: `number` - Label X position
  - `y`: `number` - Label Y position
  - `color`: `string` - Line and text color (default: `'white'`)
  - `dotSize`: `number` - Target dot radius (default: `8`)
  - `lineWidth`: `number` - Connection line width (default: `2`)

**Example:**
```javascript
// Annotate a specific point on a chart
context.motion.callout('Peak Performance', 850, 200, {
  x: 950,
  y: 150,
  color: '#e74c3c'
});
```

---

### `motion.processSequence(steps, progress, opts)`
Visual stepper for roadmaps, timelines, or process flows.

**Parameters:**
- `steps`: `Array<string>` - Step labels
- `progress`: `number` - Current step index (0-based)
- `opts`: `Object` (optional)
  - `x`: `number` - Starting X
  - `y`: `number` - Y position
  - `width`: `number` - Total width
  - `color`: `string` - Inactive step color (default: `'#7f8c8d'`)
  - `activeColor`: `string` - Active/completed step color (default: `'#2ecc71'`)
  - `orientation`: `'horizontal' | 'vertical'` (default: `'horizontal'`)

**Example:**
```javascript
const workflow = ['Research', 'Design', 'Develop', 'Test', 'Deploy'];
const currentStep = Math.floor(context.time / 2); // Advance every 2 seconds

context.motion.processSequence(workflow, currentStep, {
  y: context.height * 0.8,
  activeColor: '#3498db'
});
```

---

## Cinematic Effects & Post-Processing

### `motion.vignette(intensity, opts)`
Professional edge-dimming effect to focus viewer attention.

**Parameters:**
- `intensity`: `number` - Darkness strength (0-1)
- `opts`: `Object` (optional)
  - `color`: `string` - Vignette color (default: `'black'`)

**Example:**
```javascript
context.motion.vignette(0.6, { color: '#1a1a1a' });
```

**Performance:** Low impact. Safe to use every frame.

---

### `motion.screenImpact(intensity)`
Coordinated camera shake and flash for hits, explosions, or impacts.

**Parameters:**
- `intensity`: `number` - Impact strength (0-1)

**Example:**
```javascript
// Trigger on beat drop or collision
if (context.time % 4 < 0.1) {
  context.motion.screenImpact(0.8);
}
```

**Performance:** Medium impact. Use sparingly for dramatic moments.

---

### `motion.glitchOverlay(intensity)`
Digital glitch artifacts with random rectangles and color shifts.

**Parameters:**
- `intensity`: `number` - Glitch strength (0-1)

**Example:**
```javascript
const glitchAmount = context.gui.slider('Glitch', 0, 1, 0.3);
context.motion.glitchOverlay(glitchAmount);
```

---

### `motion.lensDistortion(intensity)`
Simulates chromatic aberration and edge distortion (fisheye effect).

**Parameters:**
- `intensity`: `number` - Distortion strength (0-1)

**Example:**
```javascript
// Increase distortion based on audio bass
const track = context.assets.music;
if (track?.analysis) {
  context.motion.lensDistortion(track.analysis.bass * 0.5);
}
```

**Performance:** High impact. Use moderately.

---

### `motion.spotlight(x, y, radius, opts)`
Radial mask highlight - darkens everything except a circular area.

**Parameters:**
- `x`: `number` - Spotlight center X
- `y`: `number` - Spotlight center Y
- `radius`: `number` - Spotlight radius
- `opts`: `Object` (optional)
  - `bgOpacity`: `number` - Darkness outside spotlight (default: `0.7`)
  - `feather`: `number` - Edge softness (default: `100`)

**Example:**
```javascript
// Follow mouse with spotlight
context.motion.spotlight(context.mouse.x, context.mouse.y, 200, {
  bgOpacity: 0.85
});
```

---

## Backgrounds & Ambiance

### `motion.drawGrid(opts)`
Background grid with optional pulse effects (Tron/cyberpunk aesthetic).

**Parameters:**
- `opts`: `Object` (optional)
  - `color`: `string` - Grid line color (default: `'#3498db'`)
  - `spacing`: `number` - Grid cell size (default: `50`)
  - `lineWidth`: `number` - Line thickness (default: `1`)
  - `pulseIntensity`: `number` - Animated pulse strength (0-1, default: `0`)
  - `opacity`: `number` - Overall grid opacity (default: `0.3`)

**Example:**
```javascript
context.motion.drawGrid({
  color: '#00ffff',
  spacing: 60,
  pulseIntensity: 0.5
});
```

---

### `motion.ambientBackground(type, intensity, color)`
Adds atmospheric depth with noise or particles.

**Parameters:**
- `type`: `'noise' | 'particles'` - Effect type
- `intensity`: `number` - Effect strength (0-1)
- `color`: `string` - Effect color

**Example:**
```javascript
// Subtle particle ambiance
context.motion.ambientBackground('particles', 0.3, '#ffffff');
```

---

### `motion.ambientWeather(type, intensity)`
High-level weather presets for atmospheric effects.

**Parameters:**
- `type`: `'snow' | 'rain' | 'dust' | 'bokeh'` - Weather type
- `intensity`: `number` - Particle density (0-1)

**Example:**
```javascript
context.motion.ambientWeather('snow', 0.6);
```

**Performance:** Medium-High impact. Adjust intensity based on target framerate.

---

### `motion.fluidBackground(colors, opts)`
Procedural shifting gradient backgrounds (organic, liquid-like).

**Parameters:**
- `colors`: `Array<string>` - Color palette for gradient
- `opts`: `Object` (optional)
  - `speed`: `number` - Animation speed (default: `0.5`)
  - `scale`: `number` - Gradient scale (default: `1.0`)

**Example:**
```javascript
context.motion.fluidBackground(
  ['#667eea', '#764ba2', '#f093fb'],
  { speed: 0.3 }
);
```

---

## Asset Composition

### `motion.assetReveal(name, opts)`
Orchestrated entry animations for images and videos.

**Parameters:**
- `name`: `string` - Asset name
- `opts`: `Object`
  - `x`: `number` - X position
  - `y`: `number` - Y position
  - `type`: `'pop' | 'slide' | 'zoom'` - Animation style
  - `duration`: `number` - Animation duration
  - `delay`: `number` - Start delay (default: `0`)
  - `width`: `number` - Display width (optional)
  - `height`: `number` - Display height (optional)

**Example:**
```javascript
context.motion.assetReveal('product_image', {
  x: context.centerX,
  y: context.centerY,
  type: 'pop',
  duration: 1.0,
  delay: 0.5
});
```

---

### `motion.comparisonSplit(assetA, assetB, progress, opts)`
"Before/After" split-screen comparison with draggable divider.

**Parameters:**
- `assetA`: `string` - First asset name
- `assetB`: `string` - Second asset name
- `progress`: `number` - Split position (0-1, 0=all A, 1=all B)
- `opts`: `Object` (optional)
  - `vertical`: `boolean` - Vertical split if true, horizontal if false (default: `true`)
  - `labelA`: `string` - Label for asset A (default: `'Before'`)
  - `labelB`: `string` - Label for asset B (default: `'After'`)

**Example:**
```javascript
const splitPos = context.gui.slider('Split', 0, 1, 0.5);
context.motion.comparisonSplit('before', 'after', splitPos, {
  vertical: true,
  labelA: 'Original',
  labelB: 'Enhanced'
});
```

---

## Utilities & Branding

### `motion.watermark(name, opts)`
Logo placement with opacity control.

**Parameters:**
- `name`: `string` - Logo asset name
- `opts`: `Object` (optional)
  - `position`: `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'` (default: `'bottom-right'`)
  - `opacity`: `number` - Logo opacity (default: `0.7`)
  - `size`: `number` - Logo size in pixels (default: `80`)
  - `margin`: `number` - Distance from edge (default: `20`)

**Example:**
```javascript
context.motion.watermark('company_logo', {
  position: 'bottom-right',
  opacity: 0.5,
  size: 100
});
```

---

### `motion.timelineProgress(progress, opts)`
Project-wide progress bar indicator.

**Parameters:**
- `progress`: `number` - Progress value (0-1)
- `opts`: `Object` (optional)
  - `position`: `'top' | 'bottom'` (default: `'bottom'`)
  - `color`: `string` - Bar color (default: `'#3498db'`)
  - `height`: `number` - Bar height (default: `4`)

**Example:**
```javascript
context.motion.timelineProgress(context.progress, {
  position: 'top',
  color: '#2ecc71',
  height: 6
});
```

---

### `image.smart(name, opts)`
Intelligently draws images/video with automatic scaling, fitting, and focus-aware cropping.

**Parameters:**
- `name`: `string` - Asset name
- `opts`: `Object` (optional)
  - `position`: `'center' | 'top-left' | 'bottom-right' | ...` (Presets)
  - `zone`: `{ x, y, width, height }` (Percentage-based bounding box)
  - `fill`: `number` (0-1, amount of zone to fill, default: `0.9`)
  - `fit`: `'contain' | 'cover'` (default: `'contain'`)
  - `crop`: `Object` - Smart cropping options
    - `focus`: `{ x, y }` (0-1 normalized center of interest, default: `{0.5, 0.5}`)
    - `scale`: `number` (Zoom level, e.g., `1.2` for 20% zoom)
  - `border`: `{ width, color, radius }`
  - `shadow`: `{ blur, color, offsetX, offsetY }`
  - `glow`: `{ color, intensity }`
  - `entrance`: Entrance animation preset
  - `progress`: `number` (Manual animation control, 0-1)

**Example:**
```javascript
// Smart Portrait: Focus on top-center (face) and zoom 1.2x
context.image.smart('hero', {
  fit: 'cover',
  crop: { focus: { x: 0.5, y: 0.2 }, scale: 1.2 },
  border: { width: 4, color: 'white', radius: 20 }
});
```

---

### `image.crop(name, x, y, w, h, opts)`
Standalone helper for precise cropped image regions.

**Parameters:**
- `name`: `string`
- `x, y, w, h`: `number` - Target bounding box on canvas
- `opts`: `Object`
  - `focus`: `{ x, y }`
  - `scale`: `number`

**Example:**
```javascript
context.image.crop('bg', 0, 0, context.width, 300, {
  focus: { x: 0.5, y: 0.5 },
  scale: 1.5
});
```

---

## Transitions

### `motion.transition(type, direction, opts)`
Seamless scene transitions.

**Parameters:**
- `type`: `'fade' | 'wipe' | 'slide' | 'zoom'` - Transition style
- `direction`: `number` - Direction (0=out, 1=in)
- `opts`: `Object` (optional)
  - `progress`: `number` - Transition progress (0-1)
  - `color`: `string` - Transition color (default: `'black'`)

**Example:**
```javascript
// Fade to black at end of scene
const fadeT = context.range(8, 10); // Last 2 seconds
context.motion.transition('fade', 1, {
  progress: fadeT,
  color: 'black'
});
```

---

## Performance Guidelines

**Low Impact (Safe for every frame):**
- `vignette`, `watermark`, `timelineProgress`, `smartLayout`

**Medium Impact (Use judiciously):**
- Charts, text orchestration, `drawGrid`, `ambientBackground`

**High Impact (Use sparingly):**
- `lensDistortion`, `ambientWeather`, `fluidBackground`, particle effects

**Optimization Tips:**
1. Cache complex calculations outside the render loop when possible
2. Use `context.range()` to limit effects to specific time windows
3. Reduce particle counts for better performance
4. Combine multiple effects strategically rather than layering everything

---

## Model Component System

The Model System (`context.models`) allows you to define reusable, standalone drawing components (similar to "Symbols" or "Pre-comps"). This isolates complex drawing logic from your movement/animation logic.

### `models.define(name, drawFn)`
Registers a "Blueprint" for an object.

**Parameters:**
- `name`: `string` - Unique identifier for the model.
- `drawFn`: `(props, mod) => void` - A function that draws the object. 
  - `props`: Custom data passed from `draw()`.
  - `mod`: A specialized `AnimationContext` containing unique model helpers:
    - `mod.part(name, drawPartFn)`: Apply sub-transforms to a labeled section.
    - `mod.spring(id, target, settings)`: Internal physics state that persists per instance.
    - `mod.state(key, initial)`: Persistent data store for the instance.
    - `mod.models`: Access to the model system for nesting.

**Example:**
```javascript
context.models.define('Robot', function(props, mod) {
    const { color = 'white' } = props;
    
    // 1. Draw Body
    mod.rect(-50, -50, 100, 100, { r: 10, color, fill: true });
    
    // 2. Animated Part (Arm)
    mod.part('arm', () => {
        mod.rect(0, 0, 20, 80, { color: 'black', fill: true });
    });

    // 3. Internal Physics
    const blink = mod.spring('blink', context.mouse.down ? 0 : 1);
    mod.circle(0, 0, 10 * blink, { color: 'yellow', fill: true });
});
```

---

### `models.draw(name, opts)`
Instantiates and draws a defined model with coordinate isolation and advanced overrides.

**Parameters:**
- `name`: `string` - Name of the defined model.
- `opts`: `Object` (optional)
  - `x, y, scale, rotation, opacity`: Standard transforms.
  - `id`: `string` - Unique ID for this instance (required for persistent state/springs).
  - `cache`: `boolean` - If `true`, the model is pre-rendered to an offscreen canvas for massive performance gains.
  - `props`: `Object` - Custom data passed to the model's `drawFn`.
  - `parts`: `Record<string, Partial<ModelOptions>>` - Override transforms for internal `mod.part()` calls.
  - `interaction`: `{ onHover, onClick }` - Add interactivity to the model.

**Example:**
```javascript
// Complex hierarchical draw
context.models.draw('Robot', { 
    id: 'hero_bot',
    x: context.centerX, 
    y: context.centerY,
    cache: false, // Set to true if it doesn't animate internally
    parts: {
        arm: { rotation: Math.sin(context.time) } // Animate the part from outside!
    },
    interaction: {
        onHover: () => console.log('Hello Robot!')
    }
});
```

---

### 🎨 Model Best Practices

To achieve high-end cinematic quality, we recommend a **Scene-Specific Modeling** approach:

1.  **Programmatic Core (IMPORTANT)**: You **MUST** draw complex objects (phones, laptops, UI) entirely with code. Do not use static image assets for elements that require movement, dynamic lighting, or part-based animation. Programming your models allows for perfect resolution, custom color themes, and physics-driven micro-interactions.
2.  **Detailed Precision**: Do not create generic "boxes." Use `mod.ctx.createLinearGradient`, `ctx.shadowBlur`, and multiple overlaps to simulate real materials (brushed metal, glass, fabric).
3.  **Scene-Specific Models**: Instead of one "God Model" with complex props, you **MUST** define specific models for specific shots.
    *   `phone_Overview`: Lower detail, optimized for large movements.
    *   `phone_Macro_Lenses`: Extremely high detail, focusing on glass reflections and aperture movements for close-ups.
4.  **Encapsulated Physics**: Use `mod.spring()` to handle independent micro-interactions (like a button vibrating when pressed) without polluting the main script's logic.
5.  **Persistent State**: Use `mod.state()` for things like "Screen On/Off" toggle, allowing the model to manage its own internal visual state based on its `id`.

---

## Common Pitfalls

❌ **Don't** call motion functions without checking asset existence:
```javascript
// BAD
context.motion.assetReveal('logo', { ... });
```

✅ **Do** verify assets first:
```javascript
// GOOD
if (context.assets.logo) {
  context.motion.assetReveal('logo', { ... });
}
```

❌ **Don't** hardcode positions:
```javascript
// BAD
context.motion.cinematicTitle('Title', t, { x: 640, y: 360 });
```

✅ **Do** use responsive values:
```javascript
// GOOD
context.motion.cinematicTitle('Title', t, {
  x: context.centerX,
  y: context.centerY
});

// BETTER (Responsive)
if (context.isMobile) {
  context.motion.cinematicTitle('Title', t, { y: context.height * 0.2, size: 40 });
} else {
  context.motion.cinematicTitle('Title', t, { y: context.centerY, size: 80 });
}
```

---

## Responsive Design

The system provides built-in flags to help you create adaptable layouts.

- `context.isMobile`: `boolean` (width < 768px)
- `context.isPortrait`: `boolean` (height > width)
- `context.isLandscape`: `boolean` (width >= height)
- `context.breakpoint`: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`

**Example:**
```javascript
const layout = context.isPortrait ? 'vertical' : 'horizontal';
context.layout.splitScreen({ ...opts, layout });
```

---

## Smart Typography

### `text.fit(text, x, y, w, h, opts)`
Automatically scales text to fit within a specific bounding box. Perfect for user-generated content or variable-length strings.

**Parameters:**
- `text`: `string`
- `x, y, w, h`: `number` - Bounding box
- `opts`: `Object`
  - `minSize`: `number` (default: 10)
  - `maxSize`: `number` (default: 200)
  - `align`: `'left' | 'center' | 'right' | 'justify'`
  - `font`: `string`

**Example:**
```javascript
context.text.fit(longDescription, 100, 100, 400, 300, {
  color: 'white',
  align: 'center'
});
```

---

## Layout & Presentation System

The layout system (`context.layout`, `context.slides`) provides powerful tools for creating professional presentations and marketing materials with minimal code.

### `image.smart(name, opts)`
Intelligent image positioning with built-in effects and entrance animations.

**Parameters:**
- `name`: `string` - Asset name
- `opts`: `Object`
  - `position`: `'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-left' | 'center-right' | 'top-center' | 'bottom-center'`
  - `zone`: `{ x, y, width, height }` - Custom placement (0-1 percentages)
  - `fill`: `number` - Fill factor (default: 0.9)
  - `fit`: `'contain' | 'cover'`
  - `shadow`: `{ blur, color, offsetX, offsetY }`
  - `border`: `{ width, color, radius }`
  - `glow`: `{ color, intensity }`
  - `entrance`: `'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'fade' | 'zoom' | 'bounce'`
  - `progress`: `number` - Manual animation control (0-1)

**Example:**
```javascript
context.image.smart('product', {
  position: 'center-right',
  entrance: 'slideLeft',
  shadow: { blur: 20, color: 'rgba(0,0,0,0.5)' }
});
```

---

### `layout.splitScreen(opts)`
Professional split layout for image + text.

**Parameters:**
- `opts`: `Object`
  - `image`: `string` - Asset name
  - `title`: `string`
  - `description`: `string`
  - `bullets`: `Array<string>`
  - `layout`: `'horizontal' | 'vertical'`
  - `imagePosition`: `'left' | 'right' | 'top' | 'bottom'`
  - `imageSplit`: `number` - Split percentage (default: 0.5)

**Example:**
```javascript
context.layout.splitScreen({
  image: 'feature',
  title: 'Smart Features',
  bullets: ['AI-Powered', 'Cloud Sync'],
  layout: 'horizontal',
  imagePosition: 'left'
});
```

---

### `layout.grid(opts)`
Auto-arranged image grid.

**Parameters:**
- `opts`: `Object`
  - `images`: `Array<string>` - List of asset names
  - `columns`: `number`
  - `rows`: `number`
  - `gap`: `number` - Spacing (0-1)
  - `entrance`: `'fade' | 'zoom'`
  - `stagger`: `number` - delay between items

**Example:**
```javascript
context.layout.grid({
  images: ['p1', 'p2', 'p3', 'p4'],
  columns: 2,
  entrance: 'zoom'
});
```

---

### `slides.hero(opts)`
Full-screen hero slide with overlay.

**Parameters:**
- `opts`: `Object`
  - `image`: `string`
  - `caption`: `string`
  - `overlay`: `'dark' | 'light' | 'gradient'`
  - `captionPosition`: `'center' | 'bottom' | 'top'`

**Example:**
```javascript
context.slides.hero({
  image: 'bg',
  caption: 'The Future',
  overlay: 'dark'
});
```

---

### `slides.comparison(opts)`
Side-by-side comparison with label support.

**Parameters:**
- `opts`: `Object`
  - `before`: `string` - Asset name
  - `after`: `string` - Asset name
  - `labels`: `[string, string]` - e.g. ['Before', 'After']
  - `splitPosition`: `number` - Divider position (0-1)

**Example:**
```javascript
context.slides.comparison({
  before: 'old_ui',
  after: 'new_ui',
  labels: ['Old', 'New']
});
```

---

### `slides.timeline(opts)`
Animated chronological timeline.

**Parameters:**
- `opts`: `Object`
  - `items`: `Array<{ date, title, description }>`
  - `orientation`: `'horizontal' | 'vertical'` (auto-detects if omitted)
  - `color`: `string`
  - `progress`: `number`

---

### `slides.teamMember(opts)`
Profile card for team introductions.

**Parameters:**
- `opts`: `Object`
  - `image`: `string`
  - `name`: `string`
  - `role`: `string`
  - `bio`: `string`
  - `align`: `'center' | 'left' | 'right'`

---

### `slides.testimonial(opts)`
Styled quote card with author details.

**Parameters:**
- `opts`: `Object`
  - `quote`: `string`
  - `author`: `string`
  - `role`: `string`
  - `image`: `string`

---

### `slides.productShowcase(opts)`
Display a product with animated interactive hotspots.

**Parameters:**
- `opts`: `Object`
  - `image`: `string` - Product asset
  - `title`: `string`
  - `price`: `string`
  - `hotspots`: `Array<{ x, y, label, position }>`
  - `animationProgress`: `number` (Controls hotspots reveal)

---

### `slides.collage(opts)`
Artistic arrangement of multiple images.

**Parameters:**
- `opts`: `Object`
  - `images`: `string[]` - List of image assets
  - `layout`: `'masonry' | 'scatter'`
  - `spacing`: `number`

---

### `slides.magazine(opts)`
High-end editorial layout with large type.

**Parameters:**
- `opts`: `Object`
  - `image`: `string`
  - `headline`: `string`
  - `subheadline`: `string`
  - `layout`: `'classic' | 'modern' | 'split'`
  - `themeColor`: `string` (Accent color)
---

## Brand Kit System
The Brand Kit system ensures visual consistency by centralizing colors, typography, and assets.

### Brand Interface
```typescript
interface Brand {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  style: {
    radius: number;
    border: number;
    shadow: string;
  };
}
```

### Presets
Common presets available in `context.brand`:
- `TechStart`: Modern, high-contrast, slate/blue.
- `FashionHouse`: Elegant, serif typography, gold accents.
- `CorporatePro`: Professional, trustworthy blues.

### Using the Brand Kit in Scripts
You can access brand tokens directly via `context.brand`. All built-in templates use these tokens automatically.

```javascript
// Example: Manual drawing using brand colors
context.ctx.fillStyle = context.brand.colors.background;
context.ctx.fillRect(0, 0, context.width, context.height);

context.text.draw("BRANDED TITLE", context.centerX, 100, {
    font: context.brand.typography.heading,
    color: context.brand.colors.primary,
    align: 'center'
});

// Using brand style tokens
context.rect(100, 100, 200, 200, {
    fill: true,
    color: context.brand.colors.accent,
    r: context.brand.style.radius // Access brand corner radius
});
```
