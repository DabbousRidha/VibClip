VibClip is a programmable animation engine. Code runs every frame within an `AnimationContext`.

> [!IMPORTANT]
> **Runtime Environment: Browser JavaScript**
> The engine only supports JavaScript. Do not attempt to use Python or other server-side languages.

## 🧱 The Hybrid Composition Engine (v4)
VibClip v4 introduces a **Hybrid Composition Engine** that mixes automatic scene layout with custom code.

- **Auto-Rendering**: Enabled visual assets (image/video) with `visible: true` are automatically drawn as base layers before your scripts execute.
- **Composition Controls**: You can adjust `x`, `y`, `scale`, `rotation`, `opacity`, `fit`, and `blendMode` for each asset in the UI or via the Agent.
- **Enabled vs Visible**: Set `visible: false` if you want to handle all its drawing manually in code using `context.image` or `context.video`.

## ⚡ Execution Environment

Scripts in VibClip run inside a sandboxed loop. Your code is the body of a function that receives a single argument: `context`.

```javascript
// The signature of a script
(context: AnimationContext) => {
  // 1. TOP-LEVEL VARIABLES (Source of Truth for Timeline)
  // const start = 0;
  // const duration = 10;
  
  // Your code here - this runs 60 times per second!
}
```

### 🚨 CRITICAL: Explicit Timing
To ensure your script is correctly sized and positioned on the timeline, you **MUST** include explicit `start` and `duration` variables at the top of your script.
- **Format**: Use `const start = X;` and `const duration = Y;`.
- **Sync**: Changing these values in code updates the timeline. Dragging the timeline block updates these values in your code.
- **Fallbacks**: If omitted, the engine defaults to a 10s duration, which may lead to layout issues on the timeline.

### 🚨 IMPORTANT: Read-Only Context
The `context` object passed to your script is **READ-ONLY** for most project metadata. 
- **DO NOT** attempt to call functions like `context.updateConfig`, `context.addAsset`, or `context.saveProject`. These do not exist at runtime.
- If you need to change project settings (duration, resolution, etc.), you must use the **AI Assistant's Function Tools** (e.g., `update_config`) in your dialogue, *not* inside the animation script code.

### 🎨 Visual Integrity
- **Always specify colors**: When using `rect`, `circle`, etc., explicitly provide a `color` in the options object if you want it to be anything other than the default (black).
- **Center Calibration**: `centerX` and `centerY` are available for layout. Shorthand `rect` and `circle` take absolute coordinates.

### Best Practices

1.  **Access Context Directly**: Instead of destructuring everything at the top (which can lead to missing subsystems), prefer accessing properties via `context.prop` or `context.subsystem`.
    *   *Example*: Use `context.width`, `context.time`, `context.color.lerp()`.
2.  **Explicit Subsystem Access**: If you do destructure, ensure you include the subsystems you need: `const { ctx, width, color, fx } = context;`.
3.  **Use `save()`/`restore()`**: When changing global context state (rotation, alpha) manually, always wrap in `ctx.save()` and `ctx.restore()`.
    *   *Note*: Helper functions like `rect` handle this automatically if you specify options.
4.  **Performance**:
    *   Avoid `new Array()` or object allocation inside the main loop if possible.
    *   Use `context.image` or `context.video` instead of raw `ctx.drawImage` to handle scaling/fitting automatically.
5.  **Responsiveness**: Use `context.width` and `context.height` instead of hardcoded numbers so your animation scales.

---

## 1️⃣ Core Context Variables
*   `ctx`: `CanvasRenderingContext2D` - The standard browser canvas API for all low-level drawing.
*   `time`: `number` - Total elapsed time since the animation started (in seconds).
*   `frame`: `number` - Current frame index (starts at 0).
*   `progress`: `number` - Normalized playback progress from `0.0` (start) to `1.0` (end).
*   `deltaTime`: `number` - Time elapsed since the previous frame (in seconds). Use for frame-rate independent physics.
*   `loopCount`: `number` - Index of the current loop iteration.
*   `isFirstFrame`: `boolean` - `true` only during the very first frame of the session. Useful for one-time initialization.
*   `isLastFrame`: `boolean` - `true` only on the absolute final frame of the duration.
*   `PI`: `number` - Math constant `Math.PI` (approx. 3.14159).
*   `TAU`: `number` - Math constant `2 * PI` (full rotation in radians).
*   `degToRad(deg: number)`: `number` - Helper to convert degrees to radians.
*   `radToDeg(rad: number)`: `number` - Helper to convert radians to degrees.
*   `passIndex`: `number` - Current render pass index (defaults to 0).
*   `render`: `RenderSettings` - Object containing global settings: `{ background, backgroundColor, alpha, pixelRatio }`.
    - `background`: Current background mode (e.g., `'black'`, `'white'`, `'transparent'`, `'custom'`, `'none'`).
    - `backgroundColor`: The hex color used when `background` is set to `'custom'`.
    - `alpha`: `true` if the current render context supports transparency (useful for logic specific to transparent WebM exports).
    - `pixelRatio`: The device pixel ratio for high-DPI handling.

```javascript
// Example: Initialization and frame-independent logic
if (context.isFirstFrame) {
  context.physics.ball = { x: context.centerX, y: context.centerY, velocity: 0 };
}

// Rotation using degToRad and TAU
const angle = context.degToRad((context.time * 90) % 360); 
context.ctx.rotate(angle);

// Accessing render settings
if (context.render.alpha) {
  // Logic specifically for transparent exports
}
```


```javascript
// Example: Core variable usage
const x = 100 + context.time * 50; // Moves 50px per second regardless of FPS
context.circle(x, 100, 20);
```

## 2️⃣ Layout & Dimensions
*   `width`: `number` - Current width of the canvas.
*   `height`: `number` - Current height of the canvas.
*   `centerX`: `number` - The horizontal center point (`width / 2`).
*   `centerY`: `number` - The vertical center point (`height / 2`).
*   `aspect`: `number` - The aspect ratio of the canvas (`width / height`).
*   `minDim`: `number` - The smaller of the two dimensions (`Math.min(width, height)`).
*   `maxDim`: `number` - The larger of the two dimensions (`Math.max(width, height)`).

```javascript
// Example: Responsive layout based on dimensions
const padding = context.minDim * 0.05;
const areaWidth = context.width - padding * 2;
context.rect(padding, padding, areaWidth, context.height - padding * 2, 20);
```

## 3️⃣ The Asset System (`assets`)
Assets are managed in a central library and accessed via unique names.
*   `image(name: string, x, y, width?, height?, opts?)`: Shorthand for drawing an image asset.
*   `video(name: string, x, y, width?, height?, opts?)`: Shorthand for drawing a video asset, automatically synced to the animation timeline.
*   **Asset Drawing Options (`opts`)**:
    - `opacity`: `number` (0.0 to 1.0) - Sets the drawing transparency.
    - `blendMode`: `string` - Standard CSS mix-blend-mode (e.g., `'screen'`, `'multiply'`, `'overlay'`).
    - `filters`: `string` - Standard CSS filters (e.g., `'blur(5px) grayscale(1) contrast(200%)'`).
    - `flipX`, `flipY`: `boolean` - Mirrors the asset horizontally or vertically.
    - `crop`: `{ x, y, w, h }` - Draws only a specific rectangular sub-region of the source media.
    - `smoothing`: `boolean` - Enables or disables image smoothing for pixel-art styles.
*   **Asset Playback Settings** (Configure in UI or procedurally via `assets[name]`):
    - `playbackRate`: `number` - The speed of the video/audio (e.g., `0.5` for slow-motion).
    - `volume`: `number` - Playback volume (0.0 to 1.0).
    - `loop`: `boolean` - Automatically restart the asset when it reaches the end.
    - `startOffset`: `number` - Time in seconds to offset the asset's start within the timeline.
    - `pan`: `number` - Stereo panning (-1.0 for Left to 1.0 for Right).
    - `preservePitch`: `boolean` - Maintains audio pitch when the `playbackRate` changes.

> [!NOTE]
// Example: Stylized drawing
const character = context.assets.hero;
if (character) {
  context.image('hero', context.centerX, context.centerY, 100, 100, {
    flipX: context.pointer.velocityX < 0,
    filters: `hue-rotate(${context.time * 90}deg)`,
    opacity: context.clamp(1.0 - context.pointer.velocityY / 500, 0.2, 1.0)
  });
}
```
*   **Multimedia Metadata**: `asset.metadata` contains `{ mimeType, size, width, height, duration }`.

```javascript
// Example: Drawing a video
const bg = assets.nature_vid;
if (bg) {
  // Draw video with a screen blend mode and blur filter
  context.video('nature_vid', 0, 0, width, height, { 
    blendMode: 'screen', 
    filters: 'blur(10px)',
    opacity: 0.5 
  }); 
}
```



## 4️⃣ Shorthand Drawing Helpers
*   `rect(x, y, w, h, opts?)`: Draws a rectangle. `opts` can be a `number` (corner radius) or an object: `{ r, fill, stroke, lineWidth }`.
*   `circle(x, y, r, opts?)`: Draws an arc-based circle. `opts`: `{ fill, stroke, lineWidth }`.
*   `line(x1, y1, x2, y2, opts?)`: Draws a straight path. `opts`: `{ lineWidth, cap: 'butt'|'round'|'square' }`.
*   `poly(points: [number, number][], opts?)`: Draws a multi-point path. `opts`: `{ close, fill, stroke, lineWidth }`.
*   `text.draw(str, x, y, opts?)`: Advanced text renderer. `opts`: `{ size, font, align, color, outlineWidth, outlineColor }`.
*   `text.block(str, x, y, width, opts?)`: Renders a block of text with automatic line wrapping and Markdown support.
    - `width`: `number` - The maximum width of the text block before wrapping.
    - **Options (`opts`)**:
        - `size`, `font`, `color`, `outlineWidth`, `outlineColor`: Same as `text.draw`.
        - `align`: `'left'`, `'center'`, `'right'`, or `'justify'`.
        - `lineHeight`: `number` (float) - Multiplier for line spacing (default: `1.2`).
        - `markdown`: `boolean` - Enables parsing of `**bold**`, `*italic*`, and `***both***` (default: `true`).
*   `text.glitch(str, x, y, intensity)`: Applies an RGB-shifted glitch effect.

```javascript
// Example: Styled drawing with the options object
context.rect(50, 50, 200, 100, { 
  r: 10, 
  fill: true, 
  stroke: true, 
  lineWidth: 4,
  color: 'blue' // Sets blue color for fill/stroke
});

// Example: Multi-line Markdown block
context.text.block(
  "This is a **Markdown** block! It supports *italic* and ***bold-italic*** text. The engine handles line wrapping automatically so you can create beautiful layout designs.",
  centerX - 200, 100, 400, 
  { align: 'justify', size: 24, color: 'cyan' }
);

context.poly([[10, 10], [50, 10], [30, 40]], { 
  fill: true, 
  lineWidth: 2, 
  stroke: true,
  color: '#ff00ff'
});

context.text.draw("VibClip", centerX, 100, { 
  size: 80, 
  align: 'center', 
  outlineWidth: 5 
});
```

## 5️⃣ Math & Motion
*   `lerp(a, b, t)`: `number` - Linear interpolation between `a` and `b`.
*   `clamp(v, min, max)`: `number` - Bound a value within a range.
*   `remap(v, inMin, inMax, outMin, outMax)`: `number` - Map a value from one range to another.
*   `ease(type: EaseType, t: number)`: `number` - Returns an eased value from `0..1`. Types: `inQuad`, `outExpo`, `outBounce`, `inOutSine`, etc.
*   `range(start: number, end: number)`: `number` - Returns local `0..1` progress for a specific timestamp window in the animation.
*   `step(t: number, count: number)`: `number` - Quantize a normalized value into discrete steps.

```javascript
// Example: Range-based segments with easing
const intro = context.range(0, 2); // Local 0..1 for first 2 seconds
const scale = context.lerp(0.5, 1.0, context.ease('outBack', intro));

const steps = context.step(progress, 10); // 10 discrete steps across the whole duration
```

## 6️⃣ Transforms & Scoping
*   `transform(fn)`: Scoped save/restore block. `transform(() => { ctx.rotate(1); ... })`.
*   `flip(hx, hy)`: Mirror the canvas horizontally or vertically.

```javascript
// Example: Scoped rotation
context.transform(() => {
  ctx.translate(centerX, centerY);
  ctx.rotate(time);
  context.flip(true, false); // Mirror horizontally
  context.rect(-50, -50, 100, 100);
});
```

## 7️⃣ Interaction
*   `mouse`: `{ x, y, down }` - Standard mouse state.
*   `pointer`: `{ x, y, velocityX, velocityY }` - Enhanced pointer tracking.


```javascript
// Example: Interaction feedback
context.ctx.fillStyle = context.mouse.down ? "red" : "white";

// Scale circle radius based on pointer velocity
const radius = 20 + Math.sqrt(context.pointer.velocityX**2 + context.pointer.velocityY**2) * 0.1;
context.circle(context.mouse.x, context.mouse.y, radius, { fill: true });

// Draw a line indicating pointer movement direction
if (context.pointer.velocityX !== 0 || context.pointer.velocityY !== 0) {
  context.line(context.mouse.x, context.mouse.y, context.mouse.x + context.pointer.velocityX * 0.5, context.mouse.y + context.pointer.velocityY * 0.5, {
    lineWidth: 3,
    color: 'lime',
    cap: 'round'
  });
}
```

## 8️⃣ Cinematic Subsystems

### 🎥 Camera (`camera`)
The camera system allows for dynamic control over the view, including panning, zooming, rotation, and screen shake. All properties are in world coordinates.
*   `camera.x`: `number` - The current X-coordinate of the camera's focal point in world space.
*   `camera.y`: `number` - The current Y-coordinate of the camera's focal point in world space.
*   `camera.zoom`: `number` - The current magnification level. `1.0` is no zoom, `2.0` is double zoom.
*   `camera.rotation`: `number` - The current rotation of the camera view in radians.
*   `camera.use(fn: () => void)`: A wrapper function that applies the camera's transformations (translation, zoom, rotation) before executing the provided callback `fn`. All drawing commands inside `fn` will be rendered relative to the camera's view, effectively drawing in "world space".
*   `camera.follow(x: number, y: number, damping?: number)`: Smoothly interpolates the camera's position (`camera.x`, `camera.y`) towards a target `(x, y)`. `damping` (0.0 to 1.0, default 0.1) controls the smoothness of the follow.
*   `camera.shake(intensity: number)`: Applies a noise-based translation to the camera view for a short duration, simulating screen shake. `intensity` controls the magnitude of the shake.
*   `camera.screenToWorld(x: number, y: number)`: Converts screen pixel coordinates `(x, y)` to world coordinates, taking into account the current camera transformations. Returns `{ x: number, y: number }`.
*   `camera.worldToScreen(x: number, y: number)`: Converts world coordinates `(x, y)` to screen pixel coordinates, taking into account the current camera transformations. Returns `{ x: number, y: number }`.

```javascript
// Example: Dynamic camera control
// Make the camera smoothly follow a player object
context.camera.follow(player.x, player.y, 0.05);

// Rotate the camera slowly over time
context.camera.rotation = context.time * 0.1;

context.camera.use(() => {
  // Everything drawn inside use() is zoomed, panned, and rotated automatically
  // These coordinates (player.x, player.y) are in "world space"
  context.rect(player.x - 25, player.y - 25, 50, 50, { color: 'green', fill: true });
  context.circle(player.x + 50, player.y + 50, 10, { color: 'red', fill: true });
  context.text.draw("World Origin", 0, 0, { color: 'white', size: 20 });
});

// Apply screen shake when a specific event occurs
if (player.exploding) context.camera.shake(20);

// Convert a screen click to world coordinates
if (context.mouse.down && context.isFirstFrame) { // Only on the first frame the mouse is down
  const worldClick = context.camera.screenToWorld(context.mouse.x, context.mouse.y);
  console.log(`Clicked at world: (${worldClick.x}, ${worldClick.y})`);
}
```

### ⚖️ Physics (`physics`)
The physics system provides helpers for common motion behaviors and automatically persists state between frames. **Any property assigned directly to the `physics` object will be remembered across frames**, making it ideal for managing any dynamic state, particles, or simulation variables without needing global scope.
*   `physics.spring(current: number, target: number, velocity: number, settings?: SpringSettings)`: Calculates the next state of a spring simulation. Returns `{ value: number, velocity: number }`. `settings` is an optional object: `{ stiffness?: number, damping?: number, mass?: number }`. `stiffness` (default 0.1) controls how strongly the spring pulls, `damping` (default 0.5) controls resistance, and `mass` (default 1.0) affects inertia.
*   `physics.lerpAngle(a: number, b: number, t: number)`: Interpolates between two angles `a` and `b` by `t` (0.0 to 1.0), correctly handling the +/- PI (or +/- 180 degree) boundary to ensure the shortest path.
*   `physics.lookAt(current: number, target: number, speed: number)`: Rotates a `current` angle towards a `target` angle at a fixed `speed` (radians per second). Returns the new `current` angle.

```javascript
// Example: High-performance persistent physics
// Initialize context.physics.cursor if it doesn't exist (e.g., on first frame)
if (!context.physics.cursor) context.physics.cursor = { value: 0, velocity: 0 };

// Update the spring simulation, making context.physics.cursor.value follow context.mouse.x
context.physics.cursor = context.physics.spring(
  context.physics.cursor.value, 
  context.mouse.x, 
  context.physics.cursor.velocity, 
  { stiffness: 0.2, damping: 0.7, mass: 1.5 } // Custom spring settings
);

// Draw a circle at the spring's current value
context.circle(context.physics.cursor.value, context.centerY, 40, { color: 'orange', fill: true });

// Example: Smooth angle interpolation
if (!context.physics.angle) context.physics.angle = 0;
const targetAngle = Math.atan2(context.mouse.y - context.centerY, context.mouse.x - context.centerX);
context.physics.angle = context.physics.lerpAngle(context.physics.angle, targetAngle, 0.1); // Smoothly rotate towards mouse
context.transform(() => {
  context.ctx.translate(context.centerX, context.centerY);
  context.ctx.rotate(context.physics.angle);
  context.rect(0, -10, 50, 20, { color: 'cyan', fill: true }); // Draw an arrow pointing
});
```

### 🎞️ Timeline (`timeline`)
The timeline system provides tools for orchestrating events and sequences over the animation's duration.
*   `timeline.at(time: number, callback: () => void)`: Executes the provided `callback` function exactly once when the animation `time` reaches the specified `time` (in seconds).
*   `timeline.range(start: number, end: number, callback: (t: number) => void)`: Executes the `callback` function continuously while the animation `time` is between `start` and `end` (in seconds). The `callback` receives a normalized `t` value (0.0 to 1.0) representing progress within that specific range.
*   `timeline.sequence(scenes: Scene[])`: Choreographs a list of scenes, where each `Scene` is an object `{ duration: number, run: (t: number) => void }`. The `run` function for each scene is called for its specified `duration`, receiving a normalized `t` (0.0 to 1.0) for that scene's progress. Scenes play sequentially.

```javascript
// Example: Sequence and timed events
context.timeline.sequence([
  // Scene 1: Display "INTRO" for 1 second
  { duration: 1, run: (t) => {
      context.text.draw("INTRO", context.centerX, context.centerY, { size: 50, align: 'center', color: 'white' });
    }
  },
  // Scene 2: Expand a rectangle for 2 seconds
  { duration: 2, run: (t) => {
      const rectWidth = context.width * t;
      context.rect(0, context.height - 20, rectWidth, 20, { color: 'blue', fill: true });
      context.text.draw(`Progress: ${t.toFixed(2)}`, context.centerX, context.centerY + 50, { size: 30, align: 'center' });
    }
  },
  // Scene 3: Hold for 0.5 seconds (empty run function)
  { duration: 0.5, run: () => {} }
]);

// Fire a bloom effect exactly at 3.0 seconds into the animation
context.timeline.at(3.0, () => context.fx.bloom(2.0));

// Show a message only during a specific time window
context.timeline.range(4.0, 6.0, (t) => {
  const alpha = Math.sin(t * context.PI); // Fade in and out
  context.text.draw("Timeline Range Active!", context.centerX, context.centerY - 50, { size: 40, align: 'center', color: `rgba(255, 255, 0, ${alpha})` });
});
```


### ✨ Visual FX & Particles (fx)
The FX system provides built-in post-processing effects and a persistent particle system.
*   `fx.vignette(intensity: number, color?: string)`: Applies a radial shadow effect. `intensity` (0.0 to 1.0) controls the strength, and `color` (default 'black') sets the vignette color.
*   `fx.bloom(intensity: number, radius?: number)`: Simulates a light bleed effect around bright elements. `intensity` controls the glow strength, and `radius` (default 20) sets the blur radius.
*   `fx.grain(intensity: number)`: Adds simulated film grain/noise to the image. `intensity` controls the noise level. (🚫 **Do not use** `fx.noise`).
*   `fx.chromatic(intensity: number)`: Simulates lens chromatic aberration by slightly shifting color channels. `intensity` controls the pixel offset.
*   `fx.crt(intensity: number)`: Applies a retro CRT scanline effect. `intensity` controls the visibility of the lines.
*   `fx.particles.emitter(x: number, y: number, type: string, count?: number)`: Spawns persistent particles at the given position. `type` can be `'fire'`, `'snow'`, `'bubbles'`, or `'stars'`. Particles are updated and drawn automatically by the engine.

```javascript
// Example: Post-processing and particles
// Emit "fire" particles at the context.mouse position
context.fx.particles.emitter(context.mouse.x, context.mouse.y, 'fire', 2);

// Apply a light film grain and CRT scanlines
context.fx.grain(0.1);
context.fx.crt(0.5);

// Apply chromatic aberration that increases with audio volume (if available)
const track = context.assets.main_song;
if (track && track.analysis) {
  context.fx.chromatic(track.analysis.volume * 5.0);
}

// Add a vignette to focus on the center
context.fx.vignette(0.4, 'black');
```

### 🎛️ Developer GUI (`gui`)
The GUI system allows you to create interactive controls that appear in the side panel. Changes made to these controls are reflected in real-time in the `guiValues` state.
*   `gui.slider(label: string, min: number, max: number, initial?: number)`: Creates a numeric slider. Returns the current `number` value.
*   `gui.color(label: string, initial?: string)`: Creates a color picker. Returns the current hex `string` value (e.g., `'#ff0000'`).
*   `gui.checkbox(label: string, initial?: boolean)`: Creates a toggle switch. Returns the current `boolean` value.
*   `gui.button(label: string)`: Creates a clickable button. Returns `true` for **exactly one frame** when clicked, then resets to `false` automatically. This is ideal for triggering one-time events like resets or spawning objects.

```javascript
// Example: Code-driven UI controls
// Create a slider to control movement speed
const speed = context.gui.slider("Speed", 1, 10, 5);

// Create a color picker for the background
const bgColor = context.gui.color("Background Color", "#1a1a1a");

// Create a checkbox to toggle an effect
const showGlow = context.gui.checkbox("Enable Glow", true);

// Create a button to reset position
if (context.gui.button("Reset Position")) {
  context.physics.ball = { value: context.centerX, velocity: 0 };
  console.log("Position Reset!");
}

// Use the GUI values in your animation
context.ctx.fillStyle = bgColor;
context.ctx.fillRect(0, 0, context.width, context.height);

if (showGlow) context.fx.bloom(2.0);
context.circle(context.centerX + context.time * speed, context.centerY, 50);
```

### 🎨 Color System (`color`)
The color system simplifies color manipulation, interpolation, and conversion.
*   `color.lerp(a: string, b: string, t: number)`: Linearly interpolates between two color strings `a` and `b` by `t` (0.0 to 1.0). Supports all standard CSS color formats. Returns a `string`.
*   `color.palette(name: string, index: number)`: Retrieves a specific color from a named theme. Built-in palettes: `'cyberpunk'`, `'retro'`, `'vintage'`, `'noir'`, `'vibrant'`. Returns a hex `string`.
*   `color.toRGB(str: string)`: Converts any CSS color string into an RGBA object: `{ r: number, g: number, b: number, a: number }`.
*   `color.toHSL(str: string)`: Converts any CSS color string into an HSLA object: `{ h: number, s: number, l: number, a: number }`. (HSL: 0-360, S: 0-100, L: 0-100).

```javascript
// Example: Reactive color gradient
// Create a oscillating color between blue and red over time
const colorA = "blue";
const colorB = "red";
const mixedColor = context.color.lerp(colorA, colorB, Math.sin(context.time) * 0.5 + 0.5);

context.ctx.fillStyle = mixedColor;
context.circle(context.centerX, context.centerY, 100, { fill: true });

// Use a palette color linked to a slider
const paletteIndex = Math.floor(context.gui.slider("Palette Index", 0, 4, 0));
const strokeColor = context.color.palette('cyberpunk', paletteIndex);
context.rect(10, 10, 100, 100, { stroke: true, lineWidth: 5, color: strokeColor });
```

## 9️⃣ Deterministic Randomness
*   `rand()`: Seeded random number (consistent across reloads).
*   `rand(seed)`: Seeded hash for a specific number.
*   `noise(x, y, z)`: Perlin/Value noise.

```javascript
// Example: Noise-based organic movement
const nx = context.noise(context.time * 0.5, 0, 0) * 100;
const ny = context.noise(0, context.time * 0.5, 0) * 100;
context.circle(context.centerX + nx, context.centerY + ny, 20);
```

## 🔟 Pixel Manipulation
*   `prevFrame`: `ImageData` from the previous frame.
*   `getPixel(x, y)`: Returns `[r, g, b, a]`.
*   `setPixel(x, y, r, g, b, a)`: Write directly to canvas.

```javascript
// Example: Simple "Trail" effect using previous frame
if (context.prevFrame) {
  context.ctx.globalAlpha = 0.9;
  context.ctx.putImageData(context.prevFrame, 0, 0);
  context.ctx.globalAlpha = 1.0;
}
```
