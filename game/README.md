# No, YOU Are the Router! 🌐

An educational browser-based game that teaches networking fundamentals through hands-on simulation. Players embody network devices (switches, routers) and manually route packets, then progressively automate their decisions by building rule-based systems.

## 🎮 Game Concept

**Core Innovation**: "You ARE the component" - players experience networking from inside the device rather than managing from outside. Progressive automation teaches both how packets flow AND how network devices actually implement forwarding/routing logic.

## 🎯 Learning Objectives

Through 9 progressively complex levels, players learn:
- **Layer 2**: MAC addresses, switching, flooding, MAC address tables
- **Layer 3**: IP routing, subnets, routing tables, default routes
- **Layer 4**: TCP/UDP, port numbers, firewall rules
- **Advanced Concepts**: NAT (Network Address Translation), VLANs, automation

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Navigate to game directory
cd no-you-are-the-router/game

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## 🎲 How to Play

### Basic Gameplay

1. **Select a Level**: Start with Level 1 to learn the basics
2. **Read the Tutorial**: Each level introduces one new concept
3. **Route Packets**: Click buttons to send packets to ports or flood
4. **Learn from Mistakes**: Immediate feedback explains what went wrong
5. **Automate** (Levels 3+): Build rules to handle packets automatically
6. **Earn Stars**: High accuracy and efficient rules earn 3 stars

### Controls

- **Control Panel**: Click buttons to route packets manually
- **Automation Panel**: Build rules with templates (Levels 3+)
- **Packet Inspector**: View packet headers and details
- **Device State**: Monitor MAC tables, routing tables, and NAT state

## 📚 Level Progression

### Level 1: You Are A Switch
Learn MAC address basics and packet flooding

### Level 2: MAC Address Table
Understand how switches learn network topology dynamically

### Level 3: Automate Your Switch
Build automation rules for efficient packet forwarding

### Level 4: ARP - The Missing Link
Discover how IP addresses map to MAC addresses

### Level 5: You Are A Router
Route packets between different networks using IP addresses

### Level 6: Transport Layer - Ports and Protocols
Filter traffic using TCP/UDP ports and protocols

### Level 7: NAT - The Address Translator
Learn how private networks share a single public IP

### Level 8: Automate Your Router
Build advanced routing and NAT automation rules

### Level 9: VLANs - Virtual Networks
Segment networks logically for security and organization

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Storage**: LocalStorage for progress persistence

### Project Structure

```
game/
├── src/
│   ├── components/      # React components
│   │   ├── game/       # Game-specific components
│   │   ├── ui/         # Reusable UI components
│   │   └── layout/     # Layout components
│   ├── engine/         # Game logic (framework-agnostic)
│   │   ├── packets.ts  # Packet creation and validation
│   │   ├── routing.ts  # Routing algorithms
│   │   ├── automation.ts # Rule engine
│   │   ├── scoring.ts  # Star rating system
│   │   └── levels/     # Level definitions
│   ├── store/          # State management
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── public/             # Static assets
└── tests/              # Test files
```

## 📖 Documentation

- [DESIGN.md](../DESIGN.md) - Complete game design document
- [PLAN.md](../PLAN.md) - Implementation plan and architecture
- [CLAUDE.md](../CLAUDE.md) - Development instructions

## 🗺️ Roadmap

### Future Enhancements

- Sound effects and animations
- More levels (IPv6, multicast, load balancing)
- Sandbox mode for custom networks
- Achievement system
- Mobile app version

## 🤝 Contributing

Contributions are welcome! This project was created as an educational tool to make networking more accessible.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Inspired by Zachtronics games (visual programming)
- SpaceChem (puzzle progression)
- Nand2Tetris (building from fundamentals)

---

**Made with ❤️ for networking education**

*"The best way to understand networking is to become the network."*
