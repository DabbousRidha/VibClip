# 🎬 Motion Design System

Level up from a static mindset to a **time-based storytelling** approach.

## 1. Scene-Based Thinking
Stop thinking in "slides". Think in **scenes**.
A project should be structured as a sequence of high-level scenes using `context.timeline.sequence`.

**Workflow:**
1.  **Define Scenes**: Break content into `intro`, `concept_explainer`, `data_reveal`, `story`, and `outro`.
2.  **Assign Mood**: Determine the emotional tone for each scene.
3.  **Determine Duration**: Allocate time based on cognitive load.

## 🎨 2. Visual Language System
Use consistent design systems to avoid chaos. Choose a style and stick to it throughout the project.

| Style Name          | Elements                       | Motion                 | Palette              | Use Case             |
| ------------------- | ------------------------------ | ---------------------- | -------------------- | -------------------- |
| `clean_infographic` | lines, icons, cards            | smooth, linear         | muted + accent       | economics, tech      |
| `playful_storybook` | blobs, hand-drawn shapes       | bouncy                 | pastel               | kids stories         |
| `cinematic_minimal` | silhouettes, masks             | slow pans, fades       | dark + highlight     | history, drama       |
| `tech_futuristic`   | grids, particles, glows        | fast pulses, glitches  | neon on dark         | AI, cybersec         |
| `modern_editorial`  | bold type, thin borders        | high-contrast slides   | monochrome + 1 color | fashion, luxury      |
| `neo_brutalist`     | thick outlines, harsh shadows  | raw, snappy            | high-saturation      | marketing, web3      |
| `organic_fluid`     | gradients, rounded "blobs"     | elastic, liquid-like   | harmonious gradients | health, nature       |
| `vaporwave_retro`   | grids, 80s icons, CRT lines    | glitchy, dreamy        | pink, cyan, purple   | music, nostalgia     |
| `flat_geometric`    | circles, triangles, primary    | pop, spring-based      | bold primaries       | education, kids      |
| `noir_industrial`   | textures, high-contrast, grain | slow, heavy, dramatic  | b&w + warm accent    | reporting, mystery   |

### Style Implementation Guide

**Tech / Futuristic**:
```javascript
const color = '#00ffff';
context.motion.drawGrid({ color, pulseIntensity: 0.5 });
context.motion.ambientBackground('particles', 0.8, color);
context.motion.glitchOverlay(0.2);
```

**Clean / Corporate**:
```javascript
context.render.background = 'white';
context.motion.fluidBackground(['#f0f2f5', '#ffffff'], { speed: 0.2 });
context.motion.lowerThird("Market Analysis", "Q3 Report", { color: '#2c3e50', accentColor: '#3498db' });
```

## 🧠 3. Visual Metaphors
Don't just draw literally. Use metaphors to represent abstract concepts.

| Concept      | Visual Metaphor                            |
| ------------ | ------------------------------------------ |
| Growth       | line rising, bars growing, plant sprouting |
| Conflict     | shapes colliding, color clash              |
| Connection   | lines linking nodes                        |
| Time passing | moving sun, timeline sliding               |
| Complexity   | tangled lines becoming organized           |

## ⏱ 4. Animation Principles
Every movement must have intent. Never use `linear` easing for primary actions.

*   **Easing**: Use `easeInOutCubic` for natural feel, `easeOutBack` for playful pops, `easeOutQuint` for smooth arrivals.
*   **Stagger**: Use `context.range` offsets or `Math.delay` patterns to avoid elements appearing all at once.
*   **Anticipation & Overshoot**: Add small movements in the opposite direction before a big move.
*   **Secondary Motion**: Add subtle background elements that react to the main action.

## 🎥 5. Cinematography (The Virtual Camera)
The camera is your eye. Move it to guide the viewer's attention.
*   **Slow Push**: Zoom in slowly (0.1 to 0.2 increment) to create tension/focus.
*   **Pan to Follow**: Move the camera focal point (`camera.x`, `camera.y`) to follow active elements.
*   **Parallax**: Layer elements with different movement speeds relative to the camera.

## 🧱 6. Layered Composition
Always think in layers:
1.  **Background**: Grids, atmospheric noise, or subtle ambient motion.
2.  **Midground**: Main storytelling elements and data.
3.  **Foreground**: Labels, highlights, vignettes, and UI overlays.

## 🧱 8. Motion Components (The Cinematic Toolkit)
Don't reinvent the wheel. Use these high-level helpers to create professional visuals instantly. Access them via `context.motion`.

### 📊 Charts & Data
*   `motion.drawBarChart(data, opts)`: Animated bar chart with stagger.
*   `motion.drawLineChart(data, opts)`: Smooth path reveal for line charts.
*   `motion.drawDonutChart(data, opts)`: Animated concentric rings for categorical data.
    - `opts`: `{ x, y, radius, thickness, colors[] }`
*   `motion.drawRadarChart(labels, values, opts)`: Spider graphs for multi-variable comparisons.
    - `opts`: `{ x, y, radius, color, bgOpacity }`
*   `motion.numericDashboard(stats, opts)`: Grid layout of animated counters and labels.
    - `opts`: `{ x, y, w, columns }`
*   `motion.animatedCounter(value, opts)`: Animates numbers from zero (useful for stats).
    - `opts`: `{ x, y, radius, thickness, color, bgOpacity }`

### 📝 Text Orchestration
*   `motion.bulletReveal(items, t, opts)`: Staggered bullet point entry from the side.
*   `motion.cinematicTitle(text, t, opts)`: Professional title cards.
    - `style`: `'fade' | 'slide' | 'glitch' | 'mask'` (New: mask uses clipping reveal)
*   `motion.kineticType(text, opts)`: **[NEW]** Physical text with elastic impact and chromatic aberration.
    - `opts`: `{ x, y, size, color, duration }`
*   `motion.lowerThird(text, subtext, opts)`: Professional overlay for speakers or section titles.
*   `motion.quoteCard(quote, author, opts)`: Centered impact statement with stylish quotes.
    - `opts`: `{ x, y, w, color, bgOpacity }`
*   `motion.callout(label, targetX, targetY, opts)`: Draws a connecting line between a point and a label.
    - `opts`: `{ x, y, color, dotSize }`
*   `motion.processSequence(steps, progress, opts)`: Visual stepper for roadmaps or process flows.
    - `opts`: `{ x, y, w, color, activeColor }`

### 🎬 Cinematic Effects & Post-Processing
*   `motion.vignette(intensity, opts)`: Professional edge-dimming.
    - `opts`: `{ color }`
*   `motion.screenImpact(intensity)`: Coordinated camera shake and flash for hits/impacts.
*   `motion.glitchOverlay(intensity)`: Digital glitch artifacts/rectangles.
*   `motion.lensDistortion(intensity)`: **[NEW]** Simulates chromatic aberration and edge distortion.
*   `motion.spotlight(x, y, radius, opts)`: Radial mask highlight.
    - `opts`: `{ bgOpacity }`

### 🌌 Backgrounds & Ambiance
*   `motion.drawGrid(opts)`: Background grid with optional pulse effects.
*   `motion.ambientBackground(type, intensity, color)`: Adds atmospheric depth (noise/particles).
*   `motion.ambientWeather(type, intensity)`: High-level weather presets.
    - `type`: `'snow' | 'rain' | 'dust' | 'bokeh'`
*   `motion.fluidBackground(colors, opts)`: Procedural shifting gradient backgrounds.
    - `opts`: `{ speed }`

### 🎬 Asset Composition
*   `motion.assetReveal(name, opts)`: Orchestrated entry for images/videos.
    - `opts`: `{ x, y, type: 'pop' | 'slide' | 'zoom', duration, delay }`
*   `motion.comparisonSplit(assetA, assetB, progress, opts)`: "Before/After" split-screen.
    - `opts`: `{ vertical, labelA, labelB }`

### 🛠️ Utilities & Branding
*   `motion.watermark(name, opts)`: Logo placement.
    - `opts`: `{ position, opacity, size }`
*   `motion.timelineProgress(progress, opts)`: Project-wide progress bar.
    - `opts`: `{ position, color, height }`
*   `motion.smartLayout(name, opts)`: **SAFE** way to draw images/video. Autoscales to fit/cover the canvas with margins.
    - `opts`: `{ margin: 0.1, fit: 'contain' | 'cover' }`

### Scene Transitions
Seamlessly transition between scenes.
```javascript
// Render a fade-out overlay based on scene progress
const t = context.range(duration - 1, duration); // last second
context.motion.transition('fade', 1, { progress: t, color: 'black' });
```

### Advanced FX
- **`bloom(intensity)`**: Now supports a "glow" style using screen blending.
- **`grain(intensity)`**: Enhanced pattern-based film grain.
- **`chromatic(intensity)`**: True RGB split aberration.

---

## 🔥 The Motion Designer's Flight Check
Before finalizing any animation script, you **MUST** verify these 5 pillars of quality.

### 1. 📖 NARRATIVE & PACING
*   [ ] **Scene Structure**: Did you break the content into clear scenes (Intro → Concept → Data → Outro)?
*   [ ] **Breathing Room**: Did you add sufficient duration for the viewer to read text? (Approx. 200ms per word).
*   [ ] **Emotional Arc**: Does the motion style match the content mood? (e.g., Don't use "bouncy" ease for serious data).

### 2. 👁️ VISUAL HIERARCHY
*   [ ] **Focal Point**: Is there **one** clear thing the user should look at right now?
*   [ ] **Contrast**: Is the active element highlighted (size, color, opacity) while others recede?
*   [ ] **Camera Guide**: Are you using the `camera` to physically move the viewer's eye to the action?

### 3. 🎬 MOTION QUALITY
*   [ ] **No Linear Easing**: Are you using `easeInOutCubic` or similar for **all** natural movement?
*   [ ] **Staggered Entries**: Did you use `context.range` or delay loops to prevent "wall of text" appearances?
*   [ ] **Secondary Motion**: When the main action happens, do background elements react slightly?
*   [ ] **Anticipation**: Do elements pull back slightly before shooting forward?

### 4. ✨ POLISH & ATMOSPHERE
*   [ ] **Ambiance**: Did you add a `fluidBackground`, `drawGrid`, or `ambientWeather` to fill empty space?
*   [ ] **Polished Look**: Did you add a subtle `vignette` or `noise` overlay for texture?
*   [ ] **Visual Impact**: Did you use `screenImpact` or shake for dramatic moments?

### 5. 🛡️ TECHNICAL SAFETY
*   [ ] **Loop Safety**: Are all `while` loops guaranteed to exit?
*   [ ] **Asset Check**: Did you use `assetReveal` instead of raw `ctx.drawImage` for safer loading?
*   [ ] **Cleanup**: Did you restore `ctx.save()` with `ctx.restore()` for every transformation?
