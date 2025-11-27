# Design Document: Haunted 2006 Overhaul

## Overview

The Haunted 2006 Overhaul transforms the Phantom Console into a fully immersive Halloween experience by layering atmospheric visual effects, synchronized audio feedback, and interactive horror elements onto the existing Web 2.0-compliant architecture. The design maintains strict adherence to 2006 web standards (no modern JavaScript features, float-based layouts, XMLHttpRequest) while creating a cohesive "cursed software" aesthetic.

This overhaul focuses on five core systems:
1. **Visual Theme Engine** - Dark color palette with CRT monitor simulation
2. **Audio Engine** - Startup and interaction sound management
3. **Kiro Phantom System** - Interactive ghost agent with random messages
4. **Animation Framework** - CSS-based effects (blood mode, shake, float-shiver)
5. **Developer Easter Egg** - Console logging with styled output

## Architecture

### Component Hierarchy

```
App.tsx (Main Controller)
├── CRT Overlay (New - Full-screen effect layer)
├── Header (Modified - Blood mode support)
├── Navigation (Unchanged)
├── Main Content
│   ├── BucketTable (Modified - Shake effect support)
│   └── Status Boxes (Unchanged)
├── Footer (Unchanged)
└── GhostAgent.tsx (Major Refactor)
    └── Kiro Phantom Messages (New)
```

### State Management

The App component manages all haunted effects through class component state:

```typescript
interface AppState {
  // Existing state...
  audioEnabled: boolean;
  dialupPlayed: boolean;
  
  // New state for haunted effects
  bloodModeActive: boolean;
  shakeActive: boolean;
  uploadDelayTimer: number | null;
}
```

### Audio Architecture

**Audio Engine Design:**
- Two audio instances: `dialupAudio` (startup) and `hddAudio` (interactions)
- Startup audio plays once on mount with error handling for autoplay blocking
- Interaction audio plays on button clicks (Upload, Refresh, Tell Me More)
- Audio instances are created fresh for each playback to allow overlapping sounds

**Playback Flow:**
```
Component Mount → Try dialup.mp3 → Catch autoplay error → Continue silently
Button Click → Create new Audio() → Play hdd-crunch.mp3 → Allow overlap
```

## Components and Interfaces

### 1. CRT Overlay Component (New)

**Purpose:** Simulate dying CRT monitor with scanlines and flicker

**Implementation:**
- Full-screen fixed position div
- `pointer-events: none` to allow click-through
- CSS animation for opacity flicker (0.8 to 0.95)
- Linear gradient background for scanline pattern

**CSS Structure:**
```css
.crt-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 9998;
  background: repeating-linear-gradient(...);
  animation: crt-flicker 0.15s infinite;
}

@keyframes crt-flicker {
  0% { opacity: 0.8; }
  50% { opacity: 0.95; }
  100% { opacity: 0.8; }
}
```

### 2. Visual Theme System

**Color Palette Implementation:**
- Abyssal Black (#0b0c10) → `body { background-color }`
- Graveyard Mist (#1f2833) → `.phantom-container { background-color }`
- Ectoplasm Green (#45a29e) → `a { color }`
- AWS Orange (#FF9900) → `.phantom-header { background-color }` (unchanged)
- Deep Red (#8B0000) → `.blood-mode { background-color }`

**Cursor Override:**
```css
body {
  cursor: progress; /* Global hourglass for "slow/broken" vibe */
}

/* Allow pointer cursor on interactive elements */
button, a, .retro-button {
  cursor: pointer !important;
}
```

### 3. Audio Engine Refactor (App.tsx)

**Startup Audio (useEffect equivalent in componentDidMount):**

```typescript
componentDidMount() {
  var self = this;
  
  // Console easter egg
  console.log(
    "%c 🎃 THE PHANTOM CONSOLE IS WATCHING YOU 🎃",
    "font-size: 24px; color: orange; background: black; border: 2px solid red;"
  );
  
  // Attempt dialup sound with error handling
  self.dialupAudio = new Audio('/sounds/dialup.mp3');
  self.dialupAudio.play().catch(function(error) {
    // Silently fail if autoplay blocked
    console.warn('Autoplay blocked:', error);
  });
  
  self.loadBuckets();
}
```

**Interaction Audio Function:**

```typescript
playCrunch() {
  var self = this;
  self.hddAudio = new Audio('/sounds/hdd-crunch.mp3');
  self.hddAudio.play().catch(function(e) {
    console.error('Could not play crunch sound:', e);
  });
}
```

**Button Integration:**
- Upload button: `onClick={function() { self.playCrunch(); self.handleUploadWithDelay(); }}`
- Refresh button: `onClick={function() { self.playCrunch(); self.loadBuckets(); }}`
- Tell Me More button: `onClick={function() { self.playCrunch(); self.handleTellMore(); }}`

### 4. Kiro Phantom System (GhostAgent.tsx)

**Title Update:**
```typescript
<div className="ghost-agent-header">
  👻 The Kiro Phantom
  ...
</div>
```

**Message Array:**
```typescript
var HAUNTED_MESSAGES = [
  "I see you used var... excellent. Let the scope bleed.",
  "Your commit history is haunted by bad decisions.",
  "Kiro is writing code... but who is writing Kiro?",
  "I deleted a random semicolon in your backend. Good luck."
];
```

**Random Message Selection:**
```typescript
handleTellMore() {
  var self = this;
  var index = Math.floor(Math.random() * HAUNTED_MESSAGES.length);
  var message = HAUNTED_MESSAGES[index];
  self.setState({ currentMessage: message });
  self.triggerShake();
}
```

**Float-Shiver Animation:**
```css
@keyframes float-shiver {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
  }
  25% { 
    transform: translateY(-10px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-15px) rotate(5deg); /* Twitch */
  }
  75% { 
    transform: translateY(-10px) rotate(0deg); 
  }
}

.ghost-agent {
  animation: float-shiver 3s ease-in-out infinite;
}
```

### 5. Blood Mode System

**State Management:**
```typescript
interface AppState {
  bloodModeActive: boolean;
  uploadDelayTimer: number | null;
}
```

**Upload Handler with Delay:**
```typescript
handleUploadClick(bucketName: string) {
  var self = this;
  
  // Play crunch sound
  self.playCrunch();
  
  // Activate blood mode
  self.setState({ bloodModeActive: true });
  
  // Wait 1.5s before opening file picker
  var timer = setTimeout(function() {
    // Open file picker
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = function(e) {
      var file = (e.target as HTMLInputElement).files[0];
      if (file) {
        self.handleUpload(bucketName, file);
      }
    };
    input.click();
  }, 1500);
  
  self.setState({ uploadDelayTimer: timer });
  
  // Remove blood mode after 2s
  setTimeout(function() {
    self.setState({ bloodModeActive: false });
  }, 2000);
}
```

**CSS Implementation:**
```css
.blood-mode {
  background-color: #8B0000 !important;
  transition: background-color 0.3s ease, height 0.5s ease;
  height: 80px; /* Increased from default */
  overflow: hidden;
}

.blood-mode h1,
.blood-mode .tagline {
  color: #FFFFFF !important;
}
```

**Header Class Application:**
```typescript
render() {
  var self = this;
  var headerClass = 'phantom-header' + 
    (self.state.bloodModeActive ? ' blood-mode' : '');
  
  return (
    <header className={headerClass}>
      ...
    </header>
  );
}
```

### 6. Shake Effect System

**State Management:**
```typescript
interface AppState {
  shakeActive: boolean;
}
```

**Trigger Function:**
```typescript
triggerShake() {
  var self = this;
  self.setState({ shakeActive: true });
  
  setTimeout(function() {
    self.setState({ shakeActive: false });
  }, 500);
}
```

**Table Class Application:**
```typescript
var tableClass = 'data-table' + 
  (self.state.shakeActive ? ' shake' : '');

<table className={tableClass}>
  ...
</table>
```

**CSS Implementation:**
```css
@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 0); }
  20%, 40%, 60%, 80% { transform: translate(2px, 0); }
}

.shake {
  animation: shake 0.5s ease-in-out;
}
```

**Integration with Ghost:**
When Kiro Phantom displays a message, call `triggerShake()` from parent component.

## Data Models

### Audio State Model

```typescript
interface AudioState {
  dialupAudio: HTMLAudioElement | null;
  hddAudio: HTMLAudioElement | null;
  dialupPlayed: boolean;
  audioEnabled: boolean;
}
```

### Effect State Model

```typescript
interface EffectState {
  bloodModeActive: boolean;
  shakeActive: boolean;
  uploadDelayTimer: number | null;
}
```

### Ghost Message Model

```typescript
interface GhostMessage {
  text: string;
  timestamp: number;
}

// Messages are stored as static array
var HAUNTED_MESSAGES: string[] = [...];
```

## Error Handling

### Audio Playback Errors

**Autoplay Blocking:**
```typescript
audio.play().catch(function(error) {
  // Browser blocked autoplay - fail silently
  console.warn('Audio playback blocked:', error);
  // Application continues normally
});
```

**Missing Audio Files:**
- Audio constructor will fail silently if file not found
- Catch block prevents application crash
- User experience continues without audio

### Animation Errors

**CSS Animation Fallbacks:**
- All animations use `@keyframes` with browser prefixes if needed
- Missing animation support degrades gracefully (no animation, but functional)
- No JavaScript animation dependencies

### Timer Cleanup

**Upload Delay Timer:**
```typescript
componentWillUnmount() {
  var self = this;
  if (self.state.uploadDelayTimer) {
    clearTimeout(self.state.uploadDelayTimer);
  }
}
```

## Testing Strategy

### Visual Testing

**Manual Verification:**
1. Color palette applied correctly across all elements
2. CRT overlay visible with scanline pattern
3. Cursor changes to progress/help globally
4. Blood mode transitions smoothly on upload click
5. Shake effect triggers when ghost speaks
6. Float-shiver animation runs continuously on ghost

**Browser Compatibility:**
- Test in Chrome (primary target)
- Verify CSS animations work
- Check audio playback permissions

### Audio Testing

**Startup Audio:**
1. Load application → Dialup sound plays once
2. Reload application → Dialup sound plays again
3. Navigate away and back → Dialup sound plays
4. Block autoplay → Application continues without crash

**Interaction Audio:**
1. Click Upload → Crunch sound plays
2. Click Refresh → Crunch sound plays
3. Click Tell Me More → Crunch sound plays
4. Rapid clicks → Sounds overlap correctly

### Interaction Testing

**Blood Mode:**
1. Click Upload → Header turns red immediately
2. Wait 1.5s → File picker opens
3. Wait 2s total → Header returns to orange
4. Cancel file picker → No errors

**Shake Effect:**
1. Click Tell Me More → Table shakes for 0.5s
2. Rapid clicks → Animation restarts correctly

**Ghost Messages:**
1. Click Tell Me More → Random message displays
2. Click again → Different message (usually)
3. Verify all 4 messages can appear

### Console Testing

**Easter Egg:**
1. Open DevTools console
2. Load application
3. Verify styled message appears: "🎃 THE PHANTOM CONSOLE IS WATCHING YOU 🎃"
4. Verify styling: 24px, orange text, black background

## Implementation Notes

### Web 2.0 Compliance

**JavaScript Constraints:**
- Use `var` for all variable declarations
- Use `function` declarations, not arrow functions
- Use `XMLHttpRequest`, not `fetch`
- Use callbacks, not Promises/async-await
- Use string concatenation with `+`, not template literals
- Use `setTimeout` for delays, not async patterns

**CSS Constraints:**
- Use `float` for layouts, not flexbox/grid
- Use fixed pixel widths, not responsive units
- Use `position: fixed` for overlays
- Use `@keyframes` for animations
- Avoid CSS variables (use hardcoded hex values)

### Performance Considerations

**Animation Performance:**
- CRT flicker runs at 0.15s intervals (low CPU impact)
- Float-shiver runs at 3s intervals (smooth, low impact)
- Shake effect is 0.5s one-shot (no continuous load)
- Blood mode is 2s one-shot (no continuous load)

**Audio Performance:**
- Audio files are small (<1MB each)
- New Audio() instances created per play (allows overlap)
- No audio preloading (loads on demand)

**DOM Performance:**
- CRT overlay is single div (minimal DOM impact)
- No dynamic element creation except file input
- Class toggles for effects (no style manipulation)

### File Structure

```
src/
├── App.tsx (Modified)
│   ├── Add CRT overlay JSX
│   ├── Refactor audio handling
│   ├── Add blood mode state/logic
│   ├── Add shake effect state/logic
│   ├── Add console easter egg
│   └── Update button handlers
├── components/
│   └── GhostAgent.tsx (Modified)
│       ├── Update title to "The Kiro Phantom"
│       ├── Replace message array
│       ├── Add float-shiver animation
│       └── Integrate shake trigger
└── styles/
    └── retro.css (Modified)
        ├── Update color palette
        ├── Add CRT overlay styles
        ├── Add blood-mode class
        ├── Add shake animation
        ├── Add float-shiver animation
        └── Update cursor globally
```

## Design Decisions and Rationales

### 1. Why 1.5s Upload Delay?

**Problem:** Native file picker freezes all JavaScript and CSS animations when opened.

**Solution:** Delay file picker by 1.5s to allow blood mode animation to complete.

**Rationale:** 
- 1.5s is long enough for users to see the red transition
- Not so long that users think the button is broken
- Provides visceral feedback before the OS interrupts

### 2. Why Separate Audio Instances?

**Problem:** Reusing single Audio instance prevents overlapping sounds.

**Solution:** Create new `Audio()` instance for each playback.

**Rationale:**
- Allows crunch sounds to overlap (rapid button clicks)
- Allows crunch to play while dialup fades out
- Minimal memory impact (audio files are small)

### 3. Why CSS Animations Over JavaScript?

**Problem:** JavaScript animations require `requestAnimationFrame` or intervals.

**Solution:** Use CSS `@keyframes` for all visual effects.

**Rationale:**
- Better performance (GPU-accelerated)
- More authentic to 2006 (CSS animations existed)
- Simpler code (no animation loop management)
- Automatic cleanup (no timer management)

### 4. Why Silent Autoplay Failure?

**Problem:** Browsers block autoplay without user interaction.

**Solution:** Catch error and continue silently.

**Rationale:**
- Prevents application crash on load
- Audio is atmospheric, not critical to functionality
- User can still interact to trigger other sounds
- Console warning for debugging, but no user-facing error

### 5. Why Fixed 1024px Width?

**Problem:** Modern responsive design wasn't standard in 2006.

**Solution:** Maintain existing 1024px fixed width.

**Rationale:**
- Authentic to 2006 web design
- Matches existing design system
- Simplifies layout calculations
- Consistent with "best viewed at 1024x768" footer message

## Accessibility Considerations

**Visual Effects:**
- CRT flicker is subtle (0.8-0.95 opacity, not 0-1)
- Shake effect is brief (0.5s) and small amplitude (2px)
- Blood mode uses high contrast (red on white text)

**Audio:**
- All audio is optional (fails gracefully if blocked)
- No critical information conveyed through audio alone
- Visual feedback accompanies all audio cues

**Cursor Override:**
- Global `cursor: progress` creates "slow/broken" atmosphere
- Interactive elements (buttons, links) override with `cursor: pointer`
- Prevents judges from thinking app has crashed
- Maintains usability while preserving haunted aesthetic

## Future Enhancements

**Potential Additions (Out of Scope):**
1. Random glitch intervals (ghost twitches every 3-5s)
2. Additional haunted messages (expand array)
3. Error sound effect (error.mp3 on API failures)
4. Persistent ghost minimized state (localStorage)
5. Multiple CRT overlay patterns (random selection)
6. Blood drip animation (vertical gradient movement)

**Performance Optimizations:**
1. Preload audio files on first user interaction
2. Use CSS `will-change` for animated elements
3. Debounce rapid button clicks
4. Pool audio instances instead of creating new ones
