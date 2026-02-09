# 🍳 Cinematic Recipes
High-impact, copy-pasteable patterns for professional motion design.

## 1. Kinetic Typography (Physical Text)
Treat text as a physical object with weight and inertia.

```javascript
// Recipe: Heavy Impact Title
// Usage: Call inside a scene run() function
const t = context.range(0, 1.5); // 1.5s duration

// "Physical" text with elastic impact and chromatic aberration
context.motion.kineticType("IMPACT", { 
    x: context.centerX,
    y: context.centerY,
    size: 200, 
    color: 'white', 
    duration: 1.5 
});
```

## 2. The "Parallax" Camera
Create depth by moving layers at different speeds relative to the camera.

```javascript
// Recipe: Parallax Scenery
// Usage: Place in main loop
// Setup: Define layers with Z-depth (pseudo)
// Camera moves right (context.time * 50)

const camX = context.time * 100;

// LAYER 1: Background (Far away) - Moves slowly (0.1x speed)
context.transform(() => {
    const parallaxX = -camX * 0.1; 
    // Wrap around for infinite scroll
    const x = parallaxX % context.width; 
    context.ctx.drawImage(context.assets.bg.element, x, 0, context.width, context.height);
    context.ctx.drawImage(context.assets.bg.element, x + context.width, 0, context.width, context.height);
});

// LAYER 2: Midground (Subject) - Moves normally (1.0x speed)
context.camera.use(() => {
    // Camera is chasing this layer, so it stays centered
    context.camera.x = camX; 
    
    // Draw subject at world coordinate matching camera
    context.image('hero', camX, context.centerY, 200, 200);
});

// LAYER 3: Foreground (Debris/Clouds) - Moves fast (1.5x speed)
context.transform(() => {
    // We simulate manual parallax for foreground to "pass by" the camera
    const shift = -camX * 1.5;
    const x = (shift % 2000) + 2000; // Keep positive
    
    context.circle(x, context.centerY + 100, 50, { fill: true, color: 'rgba(255,255,255,0.5)' });
});
```

Link visual intensity directly to audio energy.

```javascript
// Recipe: Beat-Synced Glitch
const track = context.assets.beat;
if (track && track.analysis) {
    const bass = track.analysis.bass; // 0.0 to 1.0
    const hit = bass > 0.8; // Threshold for "kick" drum

    if (hit) {
        // heavy distortion on kicks
        context.motion.glitchOverlay(0.8);
        context.motion.screenImpact(0.5);
        context.motion.lensDistortion(0.8);
        
        // Invert colors momentarily
        context.render.background = 'white';
        context.ctx.fillStyle = 'black';
    } else {
        // subtle drift otherwise
        context.motion.lensDistortion(bass * 0.5);
    }
}
```

## 4. Geometric Masks (The "Wipe")
Use global composite operations to reveal images through shapes.

```javascript
// Recipe: Circle Expand Reveal
// Usage: Transition between Scene A and Scene B
const t = context.range(2, 4); // 2s transition

// Draw Scene A (Underneath)
context.image('scene_A_bg', 0, 0, context.width, context.height);

// Draw Scene B (The Revealer)
context.ctx.save();
context.ctx.beginPath();
// Circle expanding from center to cover full screen
const maxRadius = Math.sqrt(context.width**2 + context.height**2);
const r = context.lerp(0, maxRadius, context.ease('inOutExpo', t));
context.ctx.arc(context.centerX, context.centerY, r, 0, context.TAU);
context.ctx.clip(); // <--- CLIP! standard canvas clipping

// Anything drawn here appears ONLY inside the circle
context.image('scene_B_bg', 0, 0, context.width, context.height);
context.ctx.restore();

// Optional: Draw the border of the wipe
context.circle(context.centerX, context.centerY, r, { stroke: true, lineWidth: 20, color: 'white' });
```

## 5. Dynamic Grid Background
A Tron-like perspective grid that moves forever.

```javascript
// Recipe: Retro Perspective Grid
context.ctx.save();
// 1. Center vanishing point
context.ctx.translate(context.centerX, context.centerY);

// 2. Horizon cutoff (optional)
context.ctx.beginPath();
context.ctx.rect(-context.centerX, 0, context.width, context.centerY);
context.ctx.clip();

// 3. Draw Vertical Lines (Perspective)
context.ctx.beginPath();
context.ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
context.ctx.lineWidth = 2;
// Fanning out from (0,0)
for (let i = -10; i <= 10; i++) {
    const angle = i * 0.5; // Spread
    context.ctx.moveTo(0, 0); 
    context.ctx.lineTo(Math.sin(angle) * 2000, Math.cos(angle) * 1000);
}
context.ctx.stroke();

// 4. Draw Horizontal Lines (Moving forward)
const speed = context.time * 200;
for (let i = 0; i < 20; i++) {
    // Exponential spacing for depth illusion
    const y = ((i * 50 + speed) % 1000); 
    const depth = y / 1000; // 0 (horizon) to 1 (screen bottom)
    const yProjected = Math.pow(depth, 3) * context.centerY; // Exponential curve
    
    const alpha = depth; // Fade out near horizon
    context.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
    
    // Draw horizontal line
    context.ctx.beginPath();
    context.ctx.moveTo(-1000, yProjected);
    context.ctx.lineTo(1000, yProjected);
    context.ctx.stroke();
}
context.ctx.restore();
```

## 6. Text-to-Video Captions (Word-by-Word)
Highlight spoken words in real-time.

```javascript
// Recipe: Active Caption Highlight
// Usage: Sync with voiceover timestamp
const captions = [
    { text: "Welcome", time: 0 },
    { text: "to", time: 0.5 },
    { text: "VibClip", time: 1.0 }
];

const totalWidth = 600; // Estimate
const startX = context.centerX - totalWidth / 2;
let currentX = startX;

captions.forEach((word) => {
    // Determine if this word is "active" (spoken right now)
    // Simple window: active for 0.5s after its timestamp
    const isActive = context.time >= word.time && context.time < word.time + 0.5;
    
    const color = isActive ? '#00ffff' : 'rgba(255,255,255,0.5)';
    const size = isActive ? 50 : 40;
    
    context.text.draw(word.text, currentX, context.centerY + 300, { color, size, align: 'left' });
    currentX += word.text.length * 25 + 20; // Approximate spacing
});
```

## 7. Complex Compositing (Masking Video inside Text)
Draw a video only where text exists.

```javascript
// Recipe: Video-through-Text (Stenciling)
// Usage: Impact headers with texture background.

// 1. Draw Text (This defines the mask shape)
context.ctx.save();
context.ctx.font = "900 200px Inter, sans-serif";
context.ctx.textAlign = "center";
context.ctx.textBaseline = "middle";

// 2. Initial Path for clipping (clearing/setting up)
// We draw the text in white to establish the "shape"
context.ctx.fillStyle = 'white';
context.ctx.fillText("NATURE", context.centerX, context.centerY);

// 3. CHANGE COMPOSITE MODE
// 'source-in' = Draw new pixels ONLY where existing opaque pixels are.
context.ctx.globalCompositeOperation = 'source-in';

// 4. Draw Video (The 'source')
// This will only appear "inside" the text we just drew
context.video('nature_texture', 0, 0, context.width, context.height, { fit: 'cover' });

// 5. Restore mode
context.ctx.restore();

// Optional: Draw text outline on top for readability
context.text.draw("NATURE", context.centerX, context.centerY, { size: 200, outlineWidth: 5, outlineColor: 'white', color: 'transparent', align: 'center' });
```

---

## 8. Animated Bar Chart (Data Visualization)
Create professional data visualizations with staggered animations.

```javascript
// Recipe: Quarterly Sales Chart
// Usage: Data presentation scenes
const data = [
  { label: 'Q1', value: 45000 },
  { label: 'Q2', value: 62000 },
  { label: 'Q3', value: 58000 },
  { label: 'Q4', value: 71000 }
];

const maxValue = Math.max(...data.map(d => d.value));
const chartX = context.width * 0.15;
const chartY = context.height * 0.2;
const chartW = context.width * 0.7;
const chartH = context.height * 0.5;
const barWidth = chartW / data.length * 0.7;

data.forEach((item, i) => {
  // Stagger each bar's entrance
  const barStart = 1 + i * 0.2;
  const barT = context.range(barStart, barStart + 0.8);
  const barHeight = (item.value / maxValue) * chartH * context.ease('outBack', barT);
  
  const x = chartX + (chartW / data.length) * i + (chartW / data.length - barWidth) / 2;
  const y = chartY + chartH - barHeight;
  
  // Draw bar
  context.rect(x, y, barWidth, barHeight, {
    fill: true,
    color: '#3498db',
    r: 8
  });
  
  // Draw label
  if (barT > 0.5) {
    context.text.draw(item.label, x + barWidth / 2, chartY + chartH + 30, {
      align: 'center',
      size: 20,
      color: 'white'
    });
    
    // Draw value
    context.text.draw(`$${(item.value / 1000).toFixed(0)}K`, x + barWidth / 2, y - 20, {
      align: 'center',
      size: 18,
      color: '#2ecc71'
    });
  }
});
```

---

## 9. Logo Reveal Animation
Professional brand entrance with multiple reveal styles.

```javascript
// Recipe: Logo Reveal with Particles
// Usage: Video intros, brand moments
const t = context.range(0, 2.5);

if (t < 0.8) {
  // Phase 1: Particle gather (0 to 0.8s)
  const particleT = t / 0.8;
  
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * context.TAU;
    const startDist = 500;
    const dist = context.lerp(startDist, 0, context.ease('inQuart', particleT));
    
    const x = context.centerX + Math.cos(angle) * dist;
    const y = context.centerY + Math.sin(angle) * dist;
    const size = context.lerp(2, 8, particleT);
    
    context.circle(x, y, size, { fill: true, color: '#3498db' });
  }
} else {
  // Phase 2: Logo reveal (0.8s onwards)
  const logoT = (t - 0.8) / 1.7;
  const scale = context.ease('outBack', logoT);
  const opacity = context.ease('outQuad', logoT);
  
  // Flash effect at the moment of reveal
  if (logoT < 0.1) {
    context.ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * (1 - logoT / 0.1)})`;
    context.ctx.fillRect(0, 0, context.width, context.height);
  }
  
  // Draw logo with scale
  if (context.assets.logo) {
    context.transform(() => {
      context.ctx.translate(context.centerX, context.centerY);
      context.ctx.scale(scale, scale);
      context.image('logo', 0, 0, 300, 300, { opacity });
    });
  }
  
  // Glow effect
  if (logoT > 0.3) {
    context.fx.bloom(2.0);
  }
}
```

---

## 10. Loading Progress Indicator
Smooth progress animations for loading states.

```javascript
// Recipe: Circular Progress Loader
// Usage: Loading screens, progress tracking
const progress = (context.time % 5) / 5; // 5-second loop for demo

const centerX = context.centerX;
const centerY = context.centerY;
const radius = 100;
const thickness = 15;

// Background circle
context.ctx.beginPath();
context.ctx.arc(centerX, centerY, radius, 0, context.TAU);
context.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
context.ctx.lineWidth = thickness;
context.ctx.stroke();

// Progress arc
const progressAngle = progress * context.TAU;
context.ctx.beginPath();
context.ctx.arc(centerX, centerY, radius, -context.PI / 2, -context.PI / 2 + progressAngle);
context.ctx.strokeStyle = '#3498db';
context.ctx.lineWidth = thickness;
context.ctx.lineCap = 'round';
context.ctx.stroke();

// Percentage text
context.text.draw(`${Math.floor(progress * 100)}%`, centerX, centerY, {
  size: 48,
  align: 'center',
  color: 'white'
});

// Spinning dots around the circle
for (let i = 0; i < 8; i++) {
  const dotAngle = (i / 8) * context.TAU + context.time * 2;
  const dotX = centerX + Math.cos(dotAngle) * (radius + 30);
  const dotY = centerY + Math.sin(dotAngle) * (radius + 30);
  const dotSize = 4 + Math.sin(context.time * 3 + i) * 2;
  
  context.circle(dotX, dotY, dotSize, { fill: true, color: '#3498db' });
}
```

---

## 11. Split-Screen Comparison
Side-by-side or before/after comparisons with smooth transitions.

```javascript
// Recipe: Before/After Product Comparison
// Usage: Product demos, feature highlights
const splitPos = context.gui.slider('Split Position', 0, 1, 0.5);

// Draw "Before" on left
context.ctx.save();
context.ctx.beginPath();
context.ctx.rect(0, 0, context.width * splitPos, context.height);
context.ctx.clip();

if (context.assets.before) {
  context.image('before', 0, 0, context.width, context.height, { fit: 'cover' });
}

// Label
context.text.draw('BEFORE', context.width * splitPos * 0.5, 50, {
  size: 32,
  align: 'center',
  color: 'white',
  outlineWidth: 3,
  outlineColor: 'black'
});

context.ctx.restore();

// Draw "After" on right
context.ctx.save();
context.ctx.beginPath();
context.ctx.rect(context.width * splitPos, 0, context.width * (1 - splitPos), context.height);
context.ctx.clip();

if (context.assets.after) {
  context.image('after', 0, 0, context.width, context.height, { fit: 'cover' });
}

// Label
context.text.draw('AFTER', context.width * splitPos + context.width * (1 - splitPos) * 0.5, 50, {
  size: 32,
  align: 'center',
  color: 'white',
  outlineWidth: 3,
  outlineColor: 'black'
});

context.ctx.restore();

// Draw divider line
context.line(context.width * splitPos, 0, context.width * splitPos, context.height, {
  lineWidth: 4,
  color: 'white'
});

// Draw draggable handle
const handleY = context.centerY;
context.circle(context.width * splitPos, handleY, 30, {
  fill: true,
  stroke: true,
  lineWidth: 3,
  color: 'white'
});

// Draw arrows
context.ctx.fillStyle = '#3498db';
context.ctx.beginPath();
// Left arrow
context.ctx.moveTo(context.width * splitPos - 10, handleY);
context.ctx.lineTo(context.width * splitPos - 20, handleY - 8);
context.ctx.lineTo(context.width * splitPos - 20, handleY + 8);
// Right arrow
context.ctx.moveTo(context.width * splitPos + 10, handleY);
context.ctx.lineTo(context.width * splitPos + 20, handleY - 8);
context.ctx.lineTo(context.width * splitPos + 20, handleY + 8);
context.ctx.fill();
```

---

## 12. Countdown Timer
Animated countdown with urgency effects.

```javascript
// Recipe: Event Countdown
// Usage: Product launches, event promotions
const targetTime = 10; // 10 seconds for demo
const remaining = Math.max(0, targetTime - context.time);
const seconds = Math.floor(remaining);
const milliseconds = Math.floor((remaining % 1) * 100);

// Urgency color (red when < 3 seconds)
const isUrgent = remaining < 3;
const color = isUrgent ? '#e74c3c' : '#3498db';

// Pulse effect when urgent
const pulseScale = isUrgent ? 1 + Math.sin(context.time * 10) * 0.05 : 1;

context.transform(() => {
  context.ctx.translate(context.centerX, context.centerY);
  context.ctx.scale(pulseScale, pulseScale);
  
  // Main number
  context.text.draw(`${seconds}`, 0, -20, {
    size: 180,
    align: 'center',
    color: color,
    outlineWidth: 8,
    outlineColor: 'black'
  });
  
  // Milliseconds
  context.text.draw(`.${milliseconds.toString().padStart(2, '0')}`, 0, 80, {
    size: 60,
    align: 'center',
    color: 'rgba(255, 255, 255, 0.7)'
  });
});

// Screen shake when urgent
if (isUrgent) {
  context.camera.shake(5);
}

// Flash on each second
if (remaining % 1 > 0.95) {
  context.ctx.fillStyle = `rgba(255, 255, 255, ${(1 - remaining % 1) * 0.3})`;
  context.ctx.fillRect(0, 0, context.width, context.height);
}
```

---

## 13. Notification/Toast Message
Slide-in notification with auto-dismiss.

```javascript
// Recipe: Success Notification
// Usage: Feedback messages, alerts
function showNotification(message, type = 'success') {
  const duration = 3; // Show for 3 seconds
  const t = context.range(5, 5 + duration); // Start at 5s for demo
  
  if (t <= 0) return; // Not visible yet
  
  // Slide in/out animation
  let slideT;
  if (t < 0.3) {
    slideT = context.ease('outBack', t / 0.3);
  } else if (t > 0.8) {
    slideT = 1 - context.ease('inQuart', (t - 0.8) / 0.2);
  } else {
    slideT = 1;
  }
  
  const colors = {
    success: '#2ecc71',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  };
  
  const bgColor = colors[type] || colors.info;
  const width = 400;
  const height = 80;
  const x = context.width - width - 20;
  const y = 20 + (1 - slideT) * -100; // Slide from top
  
  // Shadow
  context.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  context.ctx.shadowBlur = 20;
  context.ctx.shadowOffsetY = 10;
  
  // Background
  context.rect(x, y, width, height, {
    fill: true,
    color: bgColor,
    r: 12
  });
  
  context.ctx.shadowColor = 'transparent';
  
  // Icon (checkmark for success)
  if (type === 'success') {
    context.ctx.strokeStyle = 'white';
    context.ctx.lineWidth = 4;
    context.ctx.lineCap = 'round';
    context.ctx.beginPath();
    context.ctx.moveTo(x + 30, y + height / 2);
    context.ctx.lineTo(x + 45, y + height / 2 + 10);
    context.ctx.lineTo(x + 65, y + height / 2 - 15);
    context.ctx.stroke();
  }
  
  // Message text
  context.text.draw(message, x + 85, y + height / 2, {
    size: 20,
    color: 'white',
    align: 'left'
  });
}

// Usage
showNotification('Changes saved successfully!', 'success');
```

---

## 14. Particle Burst Effect
Explosion/celebration particle system.

```javascript
// Recipe: Celebration Burst
// Usage: Success moments, achievements
if (!context.physics.particles) {
  context.physics.particles = [];
}

// Trigger burst at specific moment
context.timeline.at(2.0, () => {
  const burstX = context.centerX;
  const burstY = context.centerY;
  
  // Create 100 particles
  for (let i = 0; i < 100; i++) {
    const angle = (i / 100) * context.TAU;
    const speed = 200 + context.rand(i) * 300;
    
    context.physics.particles.push({
      x: burstX,
      y: burstY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color: context.color.palette('vibrant', Math.floor(context.rand(i * 2) * 5)),
      size: 4 + context.rand(i * 3) * 6
    });
  }
});

// Update and draw particles
context.physics.particles = context.physics.particles.filter(p => {
  // Physics
  p.vy += 500 * context.deltaTime; // Gravity
  p.x += p.vx * context.deltaTime;
  p.y += p.vy * context.deltaTime;
  p.life -= context.deltaTime * 0.8;
  
  // Draw
  if (p.life > 0) {
    context.circle(p.x, p.y, p.size * p.life, {
      fill: true,
      color: p.color,
      opacity: p.life
    });
    return true; // Keep particle
  }
  return false; // Remove particle
});
```

---

## 15. Text Typewriter Effect
Character-by-character text reveal.

```javascript
// Recipe: Typewriter Narration
// Usage: Storytelling, captions, dialogue
function typewriter(text, startTime, duration) {
  const t = context.range(startTime, startTime + duration);
  const charsToShow = Math.floor(t * text.length);
  const visibleText = text.substring(0, charsToShow);
  
  // Draw text
  context.text.block(visibleText, context.width * 0.1, context.height * 0.7, context.width * 0.8, {
    size: 32,
    color: 'white',
    align: 'left',
    lineHeight: 1.5
  });
  
  // Blinking cursor
  if (t < 1 && Math.floor(context.time * 2) % 2 === 0) {
    const cursorX = context.width * 0.1 + (charsToShow % 50) * 15; // Approximate
    const cursorY = context.height * 0.7 + Math.floor(charsToShow / 50) * 48;
    
    context.rect(cursorX, cursorY, 3, 30, {
      fill: true,
      color: 'white'
    });
  }
  
  // Typing sound effect trigger (visual feedback)
  if (charsToShow > 0 && charsToShow !== Math.floor((t - context.deltaTime) * text.length)) {
    // Character just appeared - could trigger sound here
    context.circle(context.width - 50, 50, 5, { fill: true, color: '#2ecc71' });
  }
}

// Usage
const story = "In a world where animations come to life, one developer discovered the power of VibClip...";
typewriter(story, 1, 5); // Start at 1s, type over 5 seconds
```

## 16. Smart Split Screen
Create a professional product landing page with zero layout math.

```javascript
// Recipe: Product Feature Reveal
// Usage: Marketing slides or intro sequences

// Background with subtle motion
context.motion.fluidBackground(['#1a1a1a', '#2c3e50'], { speed: 0.2 });

// Split layout handles positioning and text animations automatically
context.layout.splitScreen({
    image: 'hero_product',
    title: 'Next Gen Interface',
    description: 'Experience the future of interaction with our neural-linked design system.',
    bullets: [
        'Zero-latency response time',
        'Adaptive extensive learning',
        'Biometric security integration'
    ],
    layout: 'horizontal',
    imagePosition: 'right',
    imageSplit: 0.55,
    animate: true,
    animationProgress: context.range(0.5, 2.0) // Control timing manually
});

// Add a "Buy Now" call to action
if (context.time > 2.5) {
    context.motion.callout('Pre-order Now', context.width * 0.25, context.height * 0.8, {
        color: '#2ecc71',
        x: context.width * 0.25,
        y: context.height * 0.9
    });
}
```

## 17. Dynamic Grid Gallery
Showcase a portfolio or collection with staggered entrance effects.

```javascript
// Recipe: Portfolio Grid
// Usage: Image galleries, team rosters, product collections

// 1. Grid Configuration
const products = ['shoe_red', 'shoe_blue', 'shoe_green', 'shoe_black'];

if (context.time > 0.5) {
    context.layout.grid({
        images: products,
        columns: 2,
        rows: 2,
        gap: 0.05,        // 5% gap
        fit: 'cover',     // Crop to fill cells
        entrance: 'zoom', // Zoom-in effect
        stagger: 0.15     // 150ms delay between each item
    });
}

// 2. Add an overlay title
const titleT = context.range(0, 1);
context.motion.cinematicTitle('SUMMER COLLECTION', titleT, {
    y: context.height * 0.1,
    size: 80,
    style: 'mask'
});
```

## 18. Animated Roadmap
Visualize progress with a sleek timeline animation.

```javascript
// Recipe: Project Roadmap
// Usage: Business updates, history view

context.motion.fluidBackground(['#2c3e50', '#3498db'], { speed: 0.15 });

const timelineData = [
    { date: 'Q1', title: 'Concept', description: 'Brainstorming & Design' },
    { date: 'Q2', title: 'Prototype', description: 'MVP Development' },
    { date: 'Q3', title: 'Launch', description: 'Public Beta Release' },
    { date: 'Q4', title: 'Growth', description: 'Global Expansion' }
];

context.slides.timeline({
    items: timelineData,
    progress: context.range(0.5, 3.5), // Animate items sequentially
    color: '#f1c40f',
    textColor: 'white',
    orientation: context.isMobile ? 'vertical' : 'horizontal' // Auto-responsive
});
```

## 19. Team Spotlight
Introduce team members with professional profile cards.

```javascript
// Recipe: Team Member Intro
// Usage: "Meet the Team" sections

context.motion.ambientBackground('particles', 0.3);

// Dynamic layout based on screen size
const align = context.isMobile ? 'center' : 'left';

context.slides.teamMember({
    image: 'sarah_profile',
    name: 'Sarah Connor',
    role: 'Chief Security Officer',
    bio: 'Expert in cyber-defense and future threat analysis.',
    color: '#e74c3c',
    align: align
});
```

## 20. Social Proof
Highlight customer feedback with a glass-morphism testimonial card.

```javascript
// Recipe: Customer Review
// Usage: Trust building, case studies

context.motion.fluidBackground(['#8e44ad', '#2980b9'], { speed: 0.1 });

// Fade in
if (context.time > 0.5) {
    context.slides.testimonial({
        quote: "VibClip revolutionized our content creation process. Must-have tool!",
        author: "Alex Chen",
        role: "Marketing Director",
        image: 'alex_avatar',
        color: '#f39c12',
        bgOpacity: 0.7
    });
}
```

## 21. Product Launch
Dynamic product showcase with interactive hotspots.

```javascript
// Recipe: Product Showcase
// Usage: Marketing, E-commerce, Features highlight

context.motion.fluidBackground([context.brand.colors.primary, context.brand.colors.background], { speed: 0.1 });

context.slides.productShowcase({
    image: 'smart_watch',
    title: 'VibWatch Series 7',
    price: '$299',
    hotspots: [
        { x: 0.1, y: -0.2, label: 'Pure Retina Display', position: 'top' },
        { x: 0.3, y: 0.1, label: 'Oxygen Sensor', position: 'right' }
    ],
    animationProgress: context.range(0.5, 4.5)
});
```

## 22. Editorial Spread
Magazine-style layout with large typography and split-screen imagery.

```javascript
// Recipe: Fashion Magazine
// Usage: Portfolios, Lifestyle, Storytelling

context.slides.magazine({
    image: 'lifestyle_hero',
    headline: 'Urban Nomads',
    subheadline: 'The intersection of tech and style.',
    text: 'A deep dive into how modern professionals are redefining their workspaces.',
    layout: 'split',
    themeColor: '#e67e22'
});
```

## 23. Artistic Collage
Dynamic masonry arrangement for showcasing multiple assets.

```javascript
// Recipe: Visual Portfolio
// Usage: Event recaps, Moodboards

context.slides.collage({
    images: ['shot1', 'shot2', 'shot3', 'shot4', 'shot5'],
    layout: 'masonry',
    spacing: 12
});
```
## 24. Brand-Aware Dynamic Theme Switcher
Efficiently cycle through different brand identities within a single sequence.

```javascript
// Recipe: Multi-Brand Showcase
// Usage: Demonstrating flexibility or multi-tenant branding

const brands = ['TechStart', 'FashionHouse', 'CorporatePro'];
const cycleT = Math.floor(context.time / 4) % brands.length;
const activeBrandName = brands[cycleT];

// This helper is usually handled in getAnimationContext, 
// but you can switch it dynamically for a "Theming Showcase" effect.
context.brand = BrandPresets[activeBrandName]; 

// Now all templates and styles will instantly react to the new brand
context.motion.fluidBackground([context.brand.colors.primary, context.brand.colors.background], { speed: 0.1 });

context.slides.hero({
    image: 'lifestyle_hero',
    caption: `Experience ${context.brand.name}`,
    color: context.brand.colors.accent
});

context.text.draw("Dynamic Branding", context.centerX, context.height - 50, {
    font: context.brand.typography.body,
    color: context.brand.colors.text,
    size: 20
});
```
