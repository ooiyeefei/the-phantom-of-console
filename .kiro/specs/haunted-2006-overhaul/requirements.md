# Requirements Document

## Introduction

The Haunted 2006 Overhaul transforms the Phantom Console frontend into a fully immersive Halloween-themed experience. This sprint focuses on creating an atmospheric, "cursed software" interface that mimics dying hardware from 2006, utilizing period-accurate CSS techniques and audio-visual synchronization.

## Glossary

- **Phantom Console**: The main application interface
- **CRT Effect**: A visual overlay simulating cathode ray tube monitor artifacts (scanlines, flicker)
- **Kiro Phantom**: The interactive ghost agent (formerly Clippy) that provides haunted messages
- **Audio Engine**: The system managing sound effect playback
- **Blood Mode**: A temporary visual state where the header transitions to red and "drips"
- **Shake Effect**: A CSS vibration animation applied to UI elements

## Requirements

### Requirement 1: Visual Theme Transformation

**User Story:** As a hackathon attendee, I want the interface to have a dark, haunted Halloween aesthetic, so that I feel immersed in the "cursed 2006 software" experience.

#### Acceptance Criteria

1. THE Phantom Console SHALL apply Abyssal Black (#0b0c10) as the primary background color
2. THE Phantom Console SHALL apply Graveyard Mist (#1f2833) to content areas (tables, frames)
3. THE Phantom Console SHALL apply Ectoplasm Green (#45a29e) to all hyperlinks
4. THE Phantom Console SHALL maintain AWS Orange (#FF9900) for header elements (thematic consistency)
5. THE Phantom Console SHALL force the CSS cursor to wait (hourglass) or help (?) globally to induce user anxiety

### Requirement 2: CRT Monitor Effect

**User Story:** As a user, I want to see visual artifacts that simulate a dying CRT monitor, so that the interface feels like haunted hardware from 2006.

#### Acceptance Criteria

1. THE Phantom Console SHALL render a full-screen div overlay with pointer-events: none (to allow clicking through it)
2. THE Phantom Console SHALL animate the overlay opacity between 0.8 and 0.95 continuously to simulate power fluctuation
3. THE Phantom Console SHALL apply a "scanline" CSS background pattern (linear-gradient) to the overlay

### Requirement 3: Startup Audio Behavior (Demo Safety)

**User Story:** As a user, I want to hear a dial-up modem sound exactly once when the application loads, setting the mood.

#### Acceptance Criteria

1. WHEN the Phantom Console component mounts, THE Audio Engine SHALL attempt to play dialup.mp3 exactly once
2. IF the browser blocks Autoplay, THE Audio Engine SHALL catch the error silently and NOT crash the application
3. THE Audio Engine SHALL NOT replay dialup.mp3 on subsequent re-renders or interactions

### Requirement 4: Interactive Audio Feedback

**User Story:** As a user, I want to hear hard drive sounds when I interact with buttons, simulating physical hardware.

#### Acceptance Criteria

1. WHEN the user clicks the "Upload", "Refresh", or "Tell Me More" buttons, THE Audio Engine SHALL play hdd-crunch.mp3
2. THE Audio Engine SHALL allow overlapping sounds (e.g., crunching while dial-up fades out)

### Requirement 5: Kiro Phantom Interactive Messages

**User Story:** As a user, I want the ghost agent to roast my code when I interact with it.

#### Acceptance Criteria

1. THE Kiro Phantom SHALL display the title "The Kiro Phantom"
2. WHEN the user clicks "Tell Me More", THE Kiro Phantom SHALL randomly display one message from the following set:
   - "I see you used var... excellent. Let the scope bleed."
   - "Your commit history is haunted by bad decisions."
   - "Kiro is writing code... but who is writing Kiro?"
   - "I deleted a random semicolon in your backend. Good luck."

### Requirement 6: Ghost Animation Effects

**User Story:** As a user, I want the ghost agent to move in an unsettling way.

#### Acceptance Criteria

1. THE Kiro Phantom SHALL animate with a continuous vertical "bobbing" motion (CSS @keyframes float)
2. THE Kiro Phantom SHALL randomly trigger a "Glitch Twitch" (rotate 5deg + scale 1.1) every 3-5 seconds to look unstable

### Requirement 7: Blood Mode Visual Effect (CRITICAL)

**User Story:** As a user, I want the header to turn red and "drip" when I upload files, providing visceral horror feedback.

#### Acceptance Criteria

1. WHEN the user clicks "Upload", THE Phantom Console SHALL immediately apply the .blood-mode class to the header
2. THE Phantom Console SHALL transition the header background to Deep Red (#8B0000) and increase height to simulate dripping
3. THE Phantom Console SHALL wait 1.5 seconds (using setTimeout) AFTER the click before opening the native file selection dialog (This ensures the user sees the blood animation before the OS window freezes the view)
4. THE Phantom Console SHALL remove .blood-mode after 2 seconds

### Requirement 8: Shake Effect

**User Story:** As a user, I want the UI to vibrate when the ghost speaks.

#### Acceptance Criteria

1. WHEN the Kiro Phantom updates its message, THE Phantom Console SHALL apply a .shake class to the main table
2. THE .shake class SHALL use CSS transforms to translate X/Y by 2px rapidly for 0.5 seconds

### Requirement 9: Developer Easter Egg

**User Story:** As a developer/judge inspecting the application, I want to discover a hidden message in the console.

#### Acceptance Criteria

1. WHEN the application loads, THE Phantom Console SHALL log "%c 🎃 THE PHANTOM CONSOLE IS WATCHING YOU 🎃" to the browser console
2. THE Phantom Console SHALL use CSS styling: font-size: 24px, color: orange, background: black
