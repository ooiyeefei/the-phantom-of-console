# 📋 Specs - Spec-Driven Development

> **🏆 HACKATHON JUDGES:** This demonstrates ADVANCED spec-driven development with formal requirements, correctness properties, and complete traceability.

## What's Here

This directory contains two complete spec workflows:

### 1. `phantom-console/` - Main Feature Spec
The core S3 management functionality built using the full spec workflow:
- **requirements.md** - EARS-compliant requirements with INCOSE quality rules
- **design.md** - Architecture, components, and correctness properties
- **tasks.md** - 40+ implementation tasks with requirement traceability

### 2. `haunted-2006-overhaul/` - UI Overhaul Spec
The retro UI transformation:
- **requirements.md** - Visual and interaction requirements
- **design.md** - Component design and styling approach
- **tasks.md** - UI implementation tasks

## Spec Workflow

```
User Idea
    ↓
Requirements (EARS patterns)
    ↓
Design (Architecture + Properties)
    ↓
Tasks (Implementation plan)
    ↓
Code (Kiro executes tasks)
```

## Advanced Techniques

### 1. EARS Requirements Patterns
Every requirement follows one of six formal patterns:
- **Ubiquitous:** THE <system> SHALL <response>
- **Event-driven:** WHEN <trigger>, THE <system> SHALL <response>
- **State-driven:** WHILE <condition>, THE <system> SHALL <response>
- **Unwanted event:** IF <condition>, THEN THE <system> SHALL <response>
- **Optional feature:** WHERE <option>, THE <system> SHALL <response>
- **Complex:** Combinations of the above

Example:
```
WHEN the user clicks "Share via AIM", 
THE System SHALL display a share dialog with expiration time options.
```

### 2. INCOSE Quality Rules
All requirements comply with:
- ✅ Active voice (who does what)
- ✅ No vague terms ("quickly", "adequate")
- ✅ No escape clauses ("where possible")
- ✅ One thought per requirement
- ✅ Measurable criteria
- ✅ Consistent terminology

### 3. Correctness Properties
Design includes testable properties:
```
Property 1: Share URL Generation
For any file and expiration time, generating a share link 
should produce a valid URL that expires at the specified time.
Validates: Requirements 8.5, 8.6
```

### 4. Requirement Traceability
Every task references specific requirements:
```
- [ ] 10C.1 Create ShareDialog component
  - _Requirements: 8.2, 8.3, 8.8_
```

## Why This Wins

### Structure
- Clear progression from idea to implementation
- Each phase builds on the previous
- User approval gates prevent wasted work

### Quality
- Formal requirements reduce ambiguity
- Correctness properties enable testing
- Traceability ensures completeness

### Collaboration
- Multiple developers can work in parallel
- Clear ownership of tasks
- Easy to track progress

### Documentation
- Requirements document "what"
- Design documents "how"
- Tasks document "when"

## Best Practices Demonstrated

1. **Formal Requirements** - EARS + INCOSE for clarity
2. **Correctness Properties** - Testable design goals
3. **Task Decomposition** - Manageable implementation units
4. **Traceability** - Link tasks → design → requirements
5. **Iterative Refinement** - User approval at each phase

## Statistics

- **Requirements:** 10 user stories, 50+ acceptance criteria
- **Design:** 8 components, 15+ correctness properties
- **Tasks:** 40+ implementation tasks
- **Completion:** 100% of tasks executed
- **Traceability:** Every task links to requirements

## Try It

1. Read `phantom-console/requirements.md` - See formal requirements
2. Read `phantom-console/design.md` - See how requirements become design
3. Read `phantom-console/tasks.md` - See how design becomes tasks
4. Check the code - See how tasks become implementation

## Advanced Usage

### For Complex Features
Use specs when:
- Multiple developers involved
- Requirements are complex or evolving
- Stakeholder approval needed
- Traceability is important

### For Simple Features
Skip specs when:
- Single developer
- Requirements are clear
- Quick iteration needed
- Vibe coding is sufficient

## Integration with Other Features

- **Steering Rules** - Apply during spec execution
- **Vibe Coding** - Generate components from spec tasks
- **Agent Hooks** - Enforce quality during implementation
- **MCP** - Provide tools needed by spec tasks

---

**This spec workflow showcases structured development at its best.** 🎃
