# Implementation Plan - No, YOU Are the Router!

## Executive Summary

This document outlines the complete implementation plan for "No, YOU Are the Router!" - an educational web game teaching networking fundamentals. The game will be built using React + TypeScript + Vite, targeting both desktop and mobile browsers.

## Technology Stack

### Core Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast, modern, excellent DX)
- **Styling**: Tailwind CSS (utility-first, responsive)
- **State Management**: Zustand (lightweight, simple)
- **Drag & Drop**: @dnd-kit (modern, accessible, touch-friendly)
- **Animations**: Framer Motion (smooth, declarative)
- **Testing**: Vitest + React Testing Library
- **Storage**: LocalStorage (progress persistence)

### Justification
- React: Most popular, mature ecosystem, excellent TypeScript support
- Vite: Lightning-fast dev server, optimized builds
- Tailwind: Rapid UI development, built-in responsive utilities
- @dnd-kit: Modern DnD library with touch support and accessibility
- Zustand: Simpler than Redux, perfect for game state
- Framer Motion: Smooth animations without performance issues

## Project Structure

```
no-you-are-the-router/
├── src/
│   ├── assets/              # Images, icons
│   ├── components/          # React components
│   │   ├── game/           # Game-specific components
│   │   │   ├── NetworkTopology.tsx
│   │   │   ├── PacketInspector.tsx
│   │   │   ├── DeviceState.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── AutomationPanel.tsx
│   │   │   └── Packet.tsx
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   └── layout/         # Layout components
│   │       ├── GameLayout.tsx
│   │       └── LevelHeader.tsx
│   ├── engine/             # Game logic (no React)
│   │   ├── packets.ts      # Packet types and validation
│   │   ├── devices.ts      # Device models (Switch, Router)
│   │   ├── routing.ts      # Routing logic
│   │   ├── automation.ts   # Rule engine
│   │   ├── scoring.ts      # Scoring system
│   │   └── levels/         # Level definitions
│   │       ├── level1.ts
│   │       ├── level2.ts
│   │       └── ...
│   ├── store/              # State management
│   │   ├── gameStore.ts    # Main game state
│   │   └── progressStore.ts # Progress/save data
│   ├── types/              # TypeScript types
│   │   ├── packet.ts
│   │   ├── device.ts
│   │   ├── level.ts
│   │   └── rule.ts
│   ├── utils/              # Utilities
│   │   ├── network.ts      # Network calculations
│   │   └── validation.ts   # Input validation
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── tests/                  # Test files
│   ├── engine/            # Engine tests
│   └── components/        # Component tests
├── public/                # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Development Phases

### Phase 1: Project Setup & Core Infrastructure (30 min)
**Goal**: Get a working development environment

Tasks:
1. Initialize Vite + React + TypeScript project
2. Install dependencies (Tailwind, Zustand, @dnd-kit, Framer Motion)
3. Configure Tailwind CSS
4. Set up basic project structure
5. Create initial types (Packet, Device, Level, Rule)
6. Configure Vitest for testing
7. Commit: "Initial project setup with React + TypeScript + Vite"

### Phase 2: Game Engine Core (1 hour)
**Goal**: Build the game logic independent of UI

Tasks:
1. **Packet System** (`engine/packets.ts`)
   - Packet interface with headers (MAC, IP, ports, VLAN)
   - Packet factory functions
   - Packet validation logic

2. **Device Models** (`engine/devices.ts`)
   - Switch model (MAC table, ports)
   - Router model (routing table, NAT table, interfaces)
   - Device state management

3. **Routing Logic** (`engine/routing.ts`)
   - MAC forwarding logic
   - IP routing logic (longest prefix match)
   - NAT logic (5-tuple tracking)
   - VLAN handling

4. **Rule Engine** (`engine/automation.ts`)
   - Rule definition (condition + action)
   - Rule matching algorithm
   - Rule execution priority
   - Fallback to manual

5. **Scoring System** (`engine/scoring.ts`)
   - Accuracy calculation
   - Star rating logic
   - Efficiency scoring (rule count)
   - Speed bonus calculation

6. Commit: "Implement core game engine"

### Phase 3: Level Definitions (45 min)
**Goal**: Define all 9 levels with packets and tutorials

Tasks:
1. Create level configuration schema
2. Implement Level 1: You Are A Switch
3. Implement Level 2: MAC Address Table
4. Implement Level 3: Automate Your Switch
5. Implement Level 4: ARP - The Missing Link
6. Implement Level 5: You Are A Router
7. Implement Level 6: Transport Layer
8. Implement Level 7: NAT
9. Implement Level 8: Automate Your Router
10. Implement Level 9: VLANs
11. Commit: "Define all 9 game levels"

### Phase 4: State Management (30 min)
**Goal**: Set up Zustand stores for game state

Tasks:
1. **Game Store** (`store/gameStore.ts`)
   - Current level state
   - Current packet
   - Device state (tables)
   - Packet queue
   - Rules list
   - Score tracking
   - Actions: routePacket, addRule, nextPacket

2. **Progress Store** (`store/progressStore.ts`)
   - Level completion status
   - Star ratings
   - LocalStorage persistence
   - Actions: saveProgress, loadProgress

3. Commit: "Implement state management with Zustand"

### Phase 5: UI Components (2 hours)
**Goal**: Build all game UI components

Tasks:
1. **Network Topology** (`components/game/NetworkTopology.tsx`)
   - SVG-based network diagram
   - Device nodes (PC, Switch, Router)
   - Connection lines
   - Port labels
   - Responsive sizing

2. **Packet Inspector** (`components/game/PacketInspector.tsx`)
   - Display current packet headers
   - Color-coded by layer
   - Expandable sections
   - Highlight relevant fields

3. **Device State** (`components/game/DeviceState.tsx`)
   - MAC Address Table display
   - Routing Table display
   - NAT Table display
   - Dynamic updates with animations

4. **Control Panel** (`components/game/ControlPanel.tsx`)
   - Drag source for current packet
   - Drop zones (ports, flood, drop)
   - Manual routing interface
   - Feedback display (✓/✗)

5. **Automation Panel** (`components/game/AutomationPanel.tsx`)
   - Condition blocks palette
   - Action blocks palette
   - Rules list (drag to reorder)
   - Rule builder interface

6. **Packet Component** (`components/game/Packet.tsx`)
   - Draggable packet visualization
   - Envelope icon
   - Header display on hover
   - Animation states

7. **Layout Components**
   - GameLayout: Overall game structure
   - LevelHeader: Title, progress, stats

8. Commit: "Implement all UI components"

### Phase 6: Drag & Drop Integration (1 hour)
**Goal**: Wire up @dnd-kit for packet routing and rule building

Tasks:
1. Set up DndContext in App
2. Make Packet draggable
3. Make port zones droppable
4. Handle drop events → trigger routing
5. Make rule blocks draggable
6. Make rule slots droppable
7. Handle rule reordering
8. Add touch support configuration
9. Test on mobile viewport
10. Commit: "Implement drag-and-drop with @dnd-kit"

### Phase 7: Game Flow & Logic Integration (1 hour)
**Goal**: Connect UI to game engine

Tasks:
1. Level initialization flow
2. Tutorial display system
3. Packet queue management
4. Manual routing handler
5. Automatic routing handler (rules)
6. Feedback system (correct/incorrect)
7. Level completion detection
8. Star calculation and display
9. Level transition
10. Progress saving
11. Commit: "Integrate game logic with UI"

### Phase 8: Animations & Polish (1 hour)
**Goal**: Add smooth animations and visual feedback

Tasks:
1. Packet movement animations
2. Correct/incorrect feedback animations
3. Table update animations (fade-in)
4. Rule execution highlight
5. Page transitions
6. Success/failure modals
7. Loading states
8. Commit: "Add animations and polish"

### Phase 9: Mobile Optimization (45 min)
**Goal**: Ensure excellent mobile experience

Tasks:
1. Responsive layout breakpoints
2. Touch-friendly drop zones (min 44px)
3. Mobile navigation
4. Swipeable panels (topology/inspector/automation)
5. Test on various viewports
6. Optimize performance for mobile
7. Commit: "Optimize for mobile devices"

### Phase 10: Testing (1 hour)
**Goal**: Write tests for critical functionality

Tasks:
1. **Engine Tests**
   - Packet validation tests
   - MAC forwarding logic tests
   - IP routing tests
   - NAT logic tests
   - Rule matching tests
   - Scoring tests

2. **Component Tests**
   - PacketInspector render tests
   - ControlPanel interaction tests
   - AutomationPanel tests

3. **Integration Tests**
   - Level 1 playthrough test
   - Rule automation test

4. Run test suite, fix issues
5. Commit: "Add comprehensive test suite"

### Phase 11: Final Polish & Documentation (30 min)
**Goal**: Finish remaining details

Tasks:
1. Add game instructions modal
2. Add glossary/help system
3. Add reset level button
4. Update README.md with:
   - Game description
   - How to run locally
   - How to play
   - Technology stack
   - Future improvements
5. Update CLAUDE.md if needed
6. Update DESIGN.md if needed
7. Commit: "Final polish and documentation"

### Phase 12: Build & Deploy Prep (15 min)
**Goal**: Ensure production build works

Tasks:
1. Run `npm run build`
2. Test production build locally
3. Add deployment instructions to README
4. Commit: "Production build ready"

## Implementation Strategy

### Parallelization Opportunities

1. **Phase 2 & 3 can partially overlap**
   - Use sub-agent to define levels while implementing engine

2. **Phase 5 components can be built in parallel**
   - Use sub-agents for independent components
   - NetworkTopology, PacketInspector, DeviceState can be developed concurrently

3. **Phase 10 tests can be written during development**
   - Write tests alongside implementation

### Quality Checks

After each phase:
- ✓ Code compiles without errors
- ✓ TypeScript types are correct
- ✓ Git commit with clear message
- ✓ Visual check in browser (for UI phases)
- ✓ Update this plan if changes needed

### Risk Mitigation

**Risk**: Drag-and-drop might not work well on mobile
- **Mitigation**: Chose @dnd-kit specifically for touch support
- **Backup**: Implement tap-to-select + tap-to-place for mobile

**Risk**: Performance issues with animations
- **Mitigation**: Use Framer Motion's layout animations (GPU-accelerated)
- **Backup**: Simplify animations, use CSS transitions

**Risk**: Complex rule engine might have bugs
- **Mitigation**: Write comprehensive tests first
- **Backup**: Start with simple rules, add complexity gradually

## Success Criteria

### MVP (End of Session)
- ✅ All 9 levels playable
- ✅ Manual routing works perfectly
- ✅ Automation system functional
- ✅ Star scoring implemented
- ✅ Progress saves to LocalStorage
- ✅ Works on desktop browsers
- ✅ Basic mobile support
- ✅ Core tests passing

### Nice to Have
- ⭐ Polished animations
- ⭐ Comprehensive test coverage (>80%)
- ⭐ Perfect mobile experience
- ⭐ Accessibility features
- ⭐ Help/glossary system

## Timeline Estimate

| Phase | Time | Cumulative |
|-------|------|------------|
| 1. Setup | 30 min | 0:30 |
| 2. Engine | 60 min | 1:30 |
| 3. Levels | 45 min | 2:15 |
| 4. State | 30 min | 2:45 |
| 5. UI | 120 min | 4:45 |
| 6. DnD | 60 min | 5:45 |
| 7. Integration | 60 min | 6:45 |
| 8. Polish | 60 min | 7:45 |
| 9. Mobile | 45 min | 8:30 |
| 10. Tests | 60 min | 9:30 |
| 11. Docs | 30 min | 10:00 |
| 12. Build | 15 min | 10:15 |

**Total Estimated Time**: ~10 hours

**Buffer**: Add 20% for unexpected issues = ~12 hours total

## Next Steps

1. ✅ Create this PLAN.md
2. → Initialize project with Vite
3. → Start Phase 1: Project Setup

---

*This plan will be updated as development progresses to reflect actual progress and any necessary changes.*

**Last Updated**: Initial creation
**Status**: Ready to begin implementation
