# Implementation Plan: Haunted 2006 Overhaul

- [x] 1. Update CSS theme and add core animation framework
  - Update color palette in `retro.css` (Abyssal Black, Graveyard Mist, Ectoplasm Green)
  - Add global cursor override with pointer exceptions for interactive elements
  - Create CRT overlay styles with scanline pattern and flicker animation
  - Create blood-mode class with red background and height transition
  - Create shake animation keyframes with horizontal translation
  - Create float-shiver animation keyframes with vertical bob and rotation twitch
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 7.1, 7.2, 8.2_

- [x] 2. Implement CRT overlay component in App.tsx
  - Add CRT overlay div to App component render method
  - Apply fixed positioning with pointer-events: none
  - Apply crt-overlay CSS class for scanline and flicker effects
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Refactor audio system in App.tsx
  - [x] 3.1 Implement startup audio with error handling
    - Add console easter egg log in componentDidMount with styled output
    - Create dialup audio instance in componentDidMount
    - Implement try-catch for autoplay blocking (silent failure)
    - Ensure dialup plays exactly once on mount
    - _Requirements: 3.1, 3.2, 3.3, 9.1, 9.2_
  
  - [x] 3.2 Implement interaction audio function
    - Create playCrunch() method that instantiates new Audio('/sounds/hdd-crunch.mp3')
    - Add error handling for audio playback failures
    - Allow overlapping sounds by creating new instances
    - _Requirements: 4.1, 4.2_

- [x] 4. Implement blood mode system in App.tsx
  - [x] 4.1 Add blood mode state management
    - Add bloodModeActive boolean to AppState interface
    - Add uploadDelayTimer to AppState interface for cleanup
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 4.2 Implement upload handler with delay
    - Create handleUploadWithDelay method
    - Call playCrunch() on click
    - Set bloodModeActive to true immediately
    - Use setTimeout to delay file picker by 1.5 seconds
    - Store timer reference in state for cleanup
    - Use setTimeout to remove bloodModeActive after 2 seconds
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 4.3 Apply blood-mode class to header
    - Update header className to conditionally include 'blood-mode'
    - Integrate with existing header class logic
    - _Requirements: 7.1, 7.2_
  
  - [x] 4.4 Update Upload button handler
    - Replace existing handleUploadClick with handleUploadWithDelay
    - Ensure playCrunch() is called before delay
    - _Requirements: 7.3_

- [x] 5. Implement shake effect system in App.tsx
  - [x] 5.1 Add shake state management
    - Add shakeActive boolean to AppState interface
    - Create triggerShake() method that sets shakeActive to true
    - Use setTimeout to set shakeActive to false after 500ms
    - _Requirements: 8.1, 8.2_
  
  - [x] 5.2 Apply shake class to table
    - Update BucketTable component to accept shakeActive prop
    - Apply 'shake' class conditionally to table element
    - Pass shakeActive state from App to BucketTable
    - _Requirements: 8.1, 8.2_

- [x] 6. Refactor Kiro Phantom component (GhostAgent.tsx)
  - [x] 6.1 Update ghost title and messages
    - Change header title from "The Kiro Phantom" to "The Kiro Phantom"
    - Replace SPOOKY_DEV_FACTS array with HAUNTED_MESSAGES array
    - Add four specific haunted messages to array
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.2 Implement random message selection
    - Update handleTellMore to select random message from HAUNTED_MESSAGES
    - Call playCrunch() when Tell Me More is clicked
    - Update component state with selected message
    - _Requirements: 5.2_
  
  - [x] 6.3 Add float-shiver animation
    - Apply float-shiver animation class to ghost-agent container
    - Ensure animation runs continuously (infinite loop)
    - _Requirements: 6.1, 6.2_
  
  - [x] 6.4 Integrate shake trigger
    - Call parent triggerShake() method when ghost displays message
    - Pass triggerShake as prop from App to GhostAgent
    - Invoke in handleTellMore after message selection
    - _Requirements: 8.1_

- [x] 7. Update button click handlers for audio
  - Update Refresh button onClick to call playCrunch()
  - Update Tell Me More button onClick to call playCrunch()
  - Verify Upload button already calls playCrunch() via handleUploadWithDelay
  - _Requirements: 4.1_

- [x] 8. Add timer cleanup in App.tsx
  - Implement componentWillUnmount lifecycle method
  - Clear uploadDelayTimer if it exists
  - Prevent memory leaks from pending timers
  - _Requirements: 7.3, 7.4_
