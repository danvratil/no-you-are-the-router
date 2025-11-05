# No, YOU Are the Router! - Game Design Document

## Executive Summary

**No, YOU Are the Router!** is a browser-based educational game that teaches networking fundamentals through first-person component simulation. Players embody network devices (switches, routers) and manually route packets, then progressively automate their decisions by building rule-based systems. The game teaches Layer 2 and Layer 3 networking concepts through hands-on interaction, visual feedback, and increasing complexity.

**Target Audience:** Anyone learning networking fundamentals - students, self-taught developers, IT professionals brushing up on basics.

**Platform:** Web browser (desktop and mobile/touch-friendly)

**Core Innovation:** "You ARE the component" - players experience networking from inside the device rather than managing from outside. Progressive automation teaches both how packets flow AND how network devices actually implement forwarding/routing logic.

**Inspiration:** Zachtronics games (visual programming), SpaceChem (puzzle progression), educational tools like Nand2Tetris (building from fundamentals)

---

## Game Concept

### Core Gameplay Loop

Each level follows this pattern:

1. **Tutorial** (30-60 seconds): Brief text explanation of ONE new networking concept
2. **Practice** (2-3 guided packets): Walk through the mechanic with hints
3. **Challenge** (10-30 packets): Route packets correctly to pass the level
4. **Automation** (later levels): Build rules to handle packet volume efficiently
5. **Completion**: Stars awarded based on accuracy and efficiency

### Win Conditions

- **Pass Level**: Route >90% of packets correctly
- **Star Ratings**:
  - ⭐ Basic: >90% accuracy
  - ⭐⭐ Good: >95% accuracy + reasonable efficiency (<X rules, level-dependent)
  - ⭐⭐⭐ Optimal: >98% accuracy + minimal rules + speed bonus

### Fail Conditions

- Route <90% of packets correctly
- Can retry immediately with no penalty

---

## Core Mechanics

### Phase 1: Manual Routing (Levels 1-2)

**Player Actions:**
- Packet appears in center queue/staging area
- Player drags packet to destination device or port
- Immediate visual feedback:
  - ✓ Green checkmark + brief explanation
  - ✗ Red X + explanation of mistake

**Interface Elements:**
- Network topology (top half of screen)
- Packet inspector (shows current packet headers)
- Your device state (MAC table, routing table, etc.)
- Packet queue (incoming packets waiting)
- Available ports/interfaces (drop targets)

### Phase 2: Introducing Automation (Levels 3+)

**New Element: Automation Panel**
- Visual programming interface using drag-and-drop rule blocks
- Rules consist of: Condition → Action
- Rules execute top-to-bottom (priority order)
- Packets matching a rule are handled automatically
- Unmatched packets fall back to manual handling

**Rule Components:**

*Condition Blocks:*
- `[Match: dst_mac = XX:XX:XX:XX:XX:XX]`
- `[Match: dst_mac in learned table]`
- `[Match: dst_mac = FF:FF:FF:FF:FF:FF]` (broadcast)
- `[Match: dst_ip in subnet X.X.X.X/Y]`
- `[Match: dst_ip = default route]`
- `[Match: VLAN = N]`
- `[Match: protocol = ARP/TCP/UDP]`
- `[Match: dst_port = N]`

*Action Blocks:*
- `[Send to: Port N]`
- `[Send to: Interface X]`
- `[Flood all ports]`
- `[Apply NAT]`
- `[Drop packet]`

*Composition:*
- Drag condition block + action block together to create rule
- Drag rules to reorder (priority)
- Toggle rules on/off for testing
- Delete rules

**Efficiency Scoring:**
- Fewer rules = better score
- More general rules (using wildcards/subnets) = better than specific rules
- Optimal rule ordering matters

### Phase 3: Volume Pressure (Levels 5+)

- Packet volume increases to 20-30+ per level
- Manual routing becomes impractical
- Automation shifts from optional to necessary
- Time pressure may be introduced (optional speed bonus)

---

## User Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│ LEVEL TITLE                                    ⭐⭐⭐         │
│ Brief description                       Packets: 15/20       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                  NETWORK TOPOLOGY VIEW                        │
│                                                               │
│         [PC-A]────┐                                          │
│                   │                                          │
│         [PC-B]────┤──[YOU (Switch)]────[Other Device]       │
│                   │                                          │
│         [PC-C]────┘                                          │
│                                                               │
├──────────────────────────┬──────────────────────────────────┤
│   PACKET INSPECTOR       │   YOUR STATE                      │
│                          │                                   │
│   Current Packet:        │   MAC Address Table:              │
│   ┌──────────────────┐   │   AA:BB:CC:DD:EE:FF → Port 1     │
│   │ Src MAC: AA:BB...│   │   11:22:33:44:55:66 → Port 2     │
│   │ Dst MAC: 11:22...│   │                                   │
│   │ VLAN: 10         │   │   Routing Table:                  │
│   │ Src IP: 192...   │   │   192.168.1.0/24 → LAN           │
│   │ Dst IP: 8.8.8.8  │   │   0.0.0.0/0 → WAN                │
│   │ Proto: TCP       │   │                                   │
│   │ Src Port: 54321  │   │   NAT Table:                      │
│   │ Dst Port: 443    │   │   192.168.1.5:12345 ↔            │
│   └──────────────────┘   │   203.0.113.1:54321              │
│                          │                                   │
├──────────────────────────┴──────────────────────────────────┤
│   AUTOMATION PANEL (Levels 3+)                               │
│                                                               │
│   Rules (drag to reorder):                                   │
│   1. [If dst_mac in table] → [Send to learned port]    [×]  │
│   2. [If dst_mac = FF:FF...] → [Flood all ports]       [×]  │
│                                                               │
│   Available Blocks: [Condition blocks...] [Action blocks...]│
│                                                               │
├──────────────────────────────────────────────────────────────┤
│   CONTROL PANEL                                              │
│                                                               │
│   Current Packet → [Drag here to drop zones]                │
│   Drop Zones: [Port 1] [Port 2] [Port 3] [Port 4] [Drop]   │
│                                                               │
│   Stats: Accuracy: 14/15 (93%)  |  Rules: 2  |  Speed: ⚡⚡  │
└──────────────────────────────────────────────────────────────┘
```

---

## Level Progression

### Level 1: "You Are A Switch"
**Technology:** MAC address basics, flooding

**Tutorial:**
"Welcome! You're a 4-port Ethernet switch. Your job is simple: forward packets to the right destination by matching MAC addresses. Every device has a unique MAC address like AA:BB:CC:DD:EE:FF."

**Network Setup:**
- 4 PCs connected to your 4 ports
- Each PC has visible MAC address label

**Packet Types:**
- Unicast: normal MAC-to-MAC traffic
- Broadcast: destination FF:FF:FF:FF:FF:FF (must flood to all ports)

**Progression:**
1. First packet: Guided - "This packet is for PC-A (MAC: AA:BB:CC:DD:EE:FF). Drag it to Port 1."
2. Second packet: Guided - "This is a broadcast (dst: FF:FF:FF:FF:FF:FF). Drag it to 'Flood All Ports'."
3. Third packet: Guided - "Unknown destination MAC. You haven't learned this yet. Flood it!"
4. Packets 4-8: Manual routing on your own

**Success Criteria:**
- Route 7/8 packets correctly (87.5%)
- No automation available

**Learning Outcomes:**
- MAC addresses identify network devices
- Switches forward based on MAC addresses
- Unknown destinations require flooding
- Broadcasts go to everyone

---

### Level 2: "MAC Address Table"
**Technology:** MAC learning, forwarding tables

**Tutorial:**
"Real switches don't magically know which port leads to which MAC address. They LEARN by watching traffic. When a packet arrives from Port 1 with source MAC AA:BB:CC:DD:EE:FF, the switch learns: 'AA:BB:CC:DD:EE:FF is on Port 1.' This builds the MAC address table."

**Network Setup:**
- Same 4-port setup
- MAC address table starts EMPTY

**New Mechanic:**
- MAC address table visible in "Your State" panel
- When packet arrives, its source MAC + ingress port automatically populate table
- Player must check table before forwarding

**Progression:**
1. First packet arrives from PC-A (port 1) → Table learns: AA:BB... → Port 1
2. Second packet TO PC-A → Player checks table, sees Port 1, forwards there
3. Third packet: broadcast → flood
4. Packets arrive from all PCs, table fills up
5. Later packets test if player uses table correctly

**Packet Count:** 10 packets, all manual

**Success Criteria:**
- Route 9/10 packets correctly (90%)

**Learning Outcomes:**
- Switches learn topology dynamically from source addresses
- MAC table maps MAC → Port
- Table eliminates need for flooding known destinations
- Unknown destinations still require flooding

---

### Level 3: "Automate Your Switch"
**Technology:** Automation introduction, rule-based forwarding

**Tutorial:**
"Manually routing every packet is tedious. Real switches automate this with forwarding rules. Let's build some rules to handle traffic automatically."

**Network Setup:**
- Same 4-port network
- 20 packets (too many for comfortable manual routing)

**New Mechanic: AUTOMATION PANEL UNLOCKS**

**Available Rule Blocks:**
- Condition: `[If dst_mac in learned table]`
- Condition: `[If dst_mac = FF:FF:FF:FF:FF:FF]`
- Action: `[Send to learned port]`
- Action: `[Flood all ports]`

**Guided Rule Building:**
1. "Drag the 'If dst_mac in learned table' condition"
2. "Connect it to 'Send to learned port' action"
3. "This rule handles most packets automatically!"
4. "Now add a rule for broadcasts..."

**Progression:**
- First 5 packets: manual (learn how automation would help)
- Tutorial: build first 2 rules
- Remaining 15 packets: rules handle most, player handles exceptions
- Scoring penalizes excessive rules (>4 rules = lower star rating)

**Success Criteria:**
- Route 18/20 packets correctly (90%)
- ⭐⭐⭐ requires <4 rules

**Learning Outcomes:**
- Switches use lookup tables for fast forwarding
- Simple rules can handle most traffic patterns
- Automation is more efficient than manual processing
- Rule design matters for efficiency

---

### Level 4: "ARP - The Missing Link"
**Technology:** ARP (Address Resolution Protocol), IP→MAC translation

**Tutorial:**
"Switches work with MAC addresses, but computers think in IP addresses. How does a computer find the MAC address for an IP? Meet ARP - Address Resolution Protocol. When PC-A wants to send to 192.168.1.5 but doesn't know its MAC, it broadcasts: 'Who has 192.168.1.5?' The device with that IP replies: 'That's me, my MAC is XX:XX:XX:XX:XX:XX.'"

**Network Setup:**
- 4 PCs, each now shows both IP and MAC addresses
- Packets now display BOTH Layer 2 (MAC) and Layer 3 (IP) headers

**New Packet Types:**
- **ARP Request**: Broadcast asking "Who has IP X.X.X.X?"
- **ARP Reply**: Unicast responding "IP X.X.X.X is at MAC YY:YY:YY:YY:YY:YY"
- Normal data packets (after ARP completes)

**Typical Flow:**
1. PC-A wants to send to 192.168.1.5
2. PC-A doesn't know 192.168.1.5's MAC
3. PC-A broadcasts ARP request → You flood it
4. PC-C (192.168.1.5) sends ARP reply back to PC-A → You forward it
5. PC-A now knows the MAC, sends data packet → You forward normally

**Progression:**
- 12 packets total
- 2-3 ARP request/reply pairs
- Remaining packets are normal traffic after ARP completes
- All manual routing (automation not needed yet)

**Success Criteria:**
- Route 11/12 packets correctly (91.6%)

**Learning Outcomes:**
- ARP translates IP addresses to MAC addresses
- ARP is a broadcast-then-reply protocol
- ARP happens BEFORE normal data transmission
- IP layer exists above MAC layer

---

### Level 5: "You Are A Router"
**Technology:** IP routing, subnets, default gateway

**Tutorial:**
"Congratulations on your promotion! You're now a ROUTER. Switches forward packets based on MAC addresses within ONE network. Routers forward packets based on IP addresses BETWEEN different networks. Each network (subnet) has an IP range like 192.168.1.0/24 (IPs from 192.168.1.1 to 192.168.1.254)."

**Network Setup:**
- **WAN port**: Internet side (203.0.113.1/24)
- **LAN port**: Home side (192.168.1.1/24) - you are 192.168.1.1
- 3 PCs on LAN (192.168.1.10, .11, .12)
- External servers on WAN side (8.8.8.8, 1.1.1.1, etc.)

**New Display: Routing Table**
```
Destination       Next Hop      Interface
192.168.1.0/24    Direct        LAN
0.0.0.0/0         Gateway       WAN (default route)
```

**Mechanics:**
- Examine packet's **destination IP address**
- Match against routing table (longest prefix match)
- Forward to appropriate interface

**Packet Types:**
1. LAN → Internet (e.g., 192.168.1.10 → 8.8.8.8): route to WAN
2. Internet → LAN (e.g., 8.8.8.8 → 192.168.1.10): route to LAN
3. LAN → LAN (e.g., 192.168.1.10 → 192.168.1.11): This is a TRICK! You're a router, not a switch. Must reject or note "wrong device type"

**Progression:**
- 10 packets, all manual
- Mix of inbound/outbound traffic
- At least one LAN→LAN to teach limitation

**Success Criteria:**
- Route 9/10 packets correctly (90%)

**Learning Outcomes:**
- Routers work with IP addresses, not MAC addresses
- Routing tables map IP subnets to interfaces
- Default route (0.0.0.0/0) catches everything not explicitly listed
- Routers connect DIFFERENT networks; switches work within ONE network

---

### Level 6: "Transport Layer - Ports and Protocols"
**Technology:** TCP/UDP, port numbers, basic firewall rules

**Tutorial:**
"IP addresses tell us which computer, but computers run many programs at once. How does data reach the right application? PORT NUMBERS! Each program listens on a port: web servers use port 80 (HTTP) or 443 (HTTPS), email uses port 25, etc. Protocols like TCP and UDP manage how data is sent."

**Network Setup:**
- Same router setup (LAN + WAN)
- Packets now show Layer 4 headers:
  - Protocol: TCP or UDP
  - Source Port
  - Destination Port

**New Mechanic: Simple Firewall Rules**
- You can create rules based on ports:
  - `[If dst_port = 22]` → `[Drop]` (block SSH from outside)
  - `[If dst_port = 80]` → `[Allow]` (permit web traffic)

**Packet Types:**
- Web traffic: TCP port 443 (HTTPS)
- DNS queries: UDP port 53
- SSH attempts: TCP port 22 (some should be blocked)
- Random high ports for outbound connections

**Progression:**
- 15 packets
- Player must route correctly AND apply firewall rules
- Some packets should be dropped based on security rules
- Introduction to automation with port-based rules

**Success Criteria:**
- Route and filter 14/15 packets correctly (93%)

**Learning Outcomes:**
- Transport layer (TCP/UDP) sits above network layer (IP)
- Port numbers identify specific applications
- Firewalls can filter based on protocol, ports, direction
- Port numbers are essential for NAT (next level)

---

### Level 7: "NAT - The Address Translator"
**Technology:** Network Address Translation, 5-tuple tracking, stateful connections

**Tutorial:**
"Your home uses private IP addresses (192.168.x.x) that can't reach the Internet. Your router performs NAT - Network Address Translation. Outgoing packets get rewritten to use the router's public IP. The router remembers each connection so returning packets can be translated back."

**Network Setup:**
- Same router (LAN + WAN)
- LAN: 192.168.1.0/24 (private IPs)
- WAN: 203.0.113.1 (single public IP)

**New Display: NAT Table**
```
Internal IP:Port          External IP:Port         State
192.168.1.10:54321   ↔   203.0.113.1:1024         ESTAB
192.168.1.11:12345   ↔   203.0.113.1:1025         ESTAB
```

**Mechanics:**

**Outbound (LAN → WAN):**
1. Packet arrives: `192.168.1.10:54321 → 8.8.8.8:443`
2. Check if src_ip is private (192.168.x.x)
3. Create NAT entry: `192.168.1.10:54321 ↔ 203.0.113.1:1024`
4. Rewrite packet: `203.0.113.1:1024 → 8.8.8.8:443`
5. Forward to WAN

**Inbound (WAN → LAN):**
1. Packet arrives: `8.8.8.8:443 → 203.0.113.1:1024`
2. Look up NAT table for `203.0.113.1:1024`
3. Find internal mapping: `192.168.1.10:54321`
4. Rewrite packet: `8.8.8.8:443 → 192.168.1.10:54321`
5. Forward to LAN

**Special Case:**
- Unsolicited inbound (no NAT entry): DROP (security!)

**Progression:**
- 15 packets
- Mix of outbound connections (create NAT entries)
- Return traffic (use existing NAT entries)
- 1-2 unsolicited inbound (must drop)
- All manual for now (NAT table updates automatically, player just routes)

**Success Criteria:**
- Route 14/15 packets correctly (93%)

**Learning Outcomes:**
- NAT allows private networks to share one public IP
- NAT is stateful (tracks active connections)
- NAT rewrites BOTH IP and port numbers
- 5-tuple: protocol, src_ip, src_port, dst_ip, dst_port
- Unsolicited inbound traffic is blocked (security benefit)

---

### Level 8: "Automate Your Router"
**Technology:** Routing + NAT automation

**Tutorial:**
"Time to automate! Routers handle thousands of connections. Let's build rules to route and NAT automatically."

**Network Setup:**
- Same LAN/WAN setup with NAT
- 30 packets (too many for manual routing)

**Available Rule Blocks:**
- `[If dst_ip in 192.168.1.0/24]` → `[Send to LAN]`
- `[If dst_ip not in private range]` → `[Send to WAN, apply NAT]`
- `[If src_ip in private range AND direction=outbound]` → `[Apply NAT]`
- `[If packet in NAT table]` → `[Reverse NAT, forward]`

**Progression:**
- First 5 packets: manual (feel the pain)
- Tutorial: build 3-4 key rules
- Remaining 25 packets: automation handles most
- Scoring rewards minimal, elegant rules

**Success Criteria:**
- Route 27/30 packets correctly (90%)
- ⭐⭐⭐ requires <6 rules

**Learning Outcomes:**
- Routers automate routing decisions
- NAT state is maintained automatically by connection tracking
- Rule order matters (match most specific first)
- Efficient rule design minimizes processing overhead

---

### Level 9: "VLANs - Virtual Networks"
**Technology:** VLAN tagging, trunk ports, logical isolation

**Tutorial:**
"You run a small office with employees and guests. They share the same physical network, but you want to keep them separate for security. VLANs (Virtual LANs) create multiple logical networks on one physical switch. Devices in VLAN 10 can't talk to VLAN 20 unless traffic goes through a router."

**Network Setup:**
- 6 devices connected to your switch:
  - 3 in VLAN 10 (Office): 192.168.10.x
  - 3 in VLAN 20 (Guest): 192.168.20.x
- Trunk port to router for inter-VLAN routing
- Router has interfaces: vlan10 and vlan20

**Packet Headers Now Show:**
- VLAN Tag: 10 or 20
- (MAC, IP, etc. as before)

**Mechanics:**

**Intra-VLAN traffic (VLAN 10 → VLAN 10):**
- Forward normally within VLAN (like Level 1-3)

**Inter-VLAN traffic (VLAN 10 → VLAN 20):**
1. Packet arrives from VLAN 10 device, dst in VLAN 20
2. Send to trunk port (router)
3. Router routes between VLANs
4. Packet returns tagged with VLAN 20
5. Forward to VLAN 20 destination

**CRITICAL RULE:**
- NEVER forward directly between VLANs (isolation!)
- Violating this = security failure

**Progression:**
- 15 packets
- Mix of intra-VLAN (simple forwarding)
- Mix of inter-VLAN (trunk → router → back)
- At least one temptation: VLAN 10 device to VLAN 20 device on adjacent ports (must refuse or route properly)

**Success Criteria:**
- Route 14/15 packets correctly (93%)
- No VLAN isolation violations

**Learning Outcomes:**
- VLANs provide logical segmentation on physical switches
- Traffic doesn't cross VLAN boundaries without routing
- Trunk ports carry multiple VLANs (tagged)
- Access ports belong to single VLANs (untagged)
- VLANs improve security and network organization

---

## Scoring System

### Per-Level Scoring

**Accuracy:**
- Packets routed correctly / Total packets
- Required: >90% to pass
- ⭐ = 90-94%
- ⭐⭐ = 95-97%
- ⭐⭐⭐ = 98-100%

**Efficiency (Levels 3+):**
- Number of automation rules created
- Penalty for excessive/redundant rules
- Target varies by level complexity
- General guideline: <5 rules for simple levels, <8 for complex

**Speed Bonus (Optional):**
- Time taken to complete level
- Only affects ⭐⭐⭐ rating
- Encourages optimal rule design

### Feedback System

**Correct Routing:**
- ✓ Green checkmark
- Brief positive message: "Correct! Packet delivered to 192.168.1.10"
- +1 to accuracy counter

**Incorrect Routing:**
- ✗ Red X
- Detailed explanation: "Wrong! This packet has destination MAC FF:FF:FF:FF:FF:FF (broadcast). You must flood to all ports, not send to a single port."
- Packet highlights the mistake (e.g., highlights dst_mac field)
- -1 to accuracy counter (but can continue)

**Rule Errors:**
- "Rule conflict: Rule 2 will never execute (Rule 1 catches everything)"
- "Inefficient: You can combine Rules 3 and 4"
- "Missing case: Broadcasts have no rule and will fall to manual"

---

## Visual Design

### Art Style
- **Clean, minimal network diagrams**
- **Slightly whimsical device icons** (friendly computers, smiling routers)
- **Color-coded by network layer:**
  - Layer 2 (MAC): Blue
  - Layer 3 (IP): Green
  - Layer 4 (Ports): Orange
  - VLANs: Purple/Yellow
- **Packet visualization:** Small envelope icon with visible headers on hover/tap

### Animations
- **Packet movement:** Smooth animation from source to destination
- **Correct route:** Green trail following path
- **Incorrect route:** Red X appears at failure point
- **Rule execution:** Brief highlight when rule matches packet
- **Table updates:** Fade-in when new entry appears (MAC table, NAT table)

### Responsive Design
- **Desktop:** Side-by-side panels (topology + inspector + automation)
- **Tablet:** Stacked panels, swipe between views
- **Mobile:** Full-screen modals for packet inspector, compact topology

---

## Technical Considerations

### Platform
- **Web browser** (HTML5, JavaScript)
- **Mobile-friendly:** Touch/drag support
- **No backend required** (runs entirely client-side)

### Suggested Tech Stack
- **Rendering:** Canvas or SVG for network topology
- **Drag-and-Drop:** Native HTML5 drag-and-drop API or library (interact.js)
- **State Management:** Simple state machine for game progression
- **Persistence:** LocalStorage for save progress, star ratings
- **Optional:** Lightweight game framework (Phaser.js) for polish

### Performance
- Target 60 FPS for animations
- Packet processing should be instant (<16ms)
- Rule evaluation must be fast (even with 10+ rules)
- Mobile optimization crucial (touch targets >44px)

### Accessibility
- Keyboard navigation for all actions
- High contrast mode option
- Screen reader support for tutorials
- Colorblind-friendly palette (don't rely solely on color)

---

## Future Expansion Ideas

### Additional Levels (Post-MVP)
- **Subnetting puzzles:** Calculate CIDR ranges
- **Static routes:** Multiple paths, route preferences
- **Firewall advanced:** Stateful packet inspection
- **Port forwarding:** External → internal mapping
- **Load balancing:** Multiple paths, distribute traffic
- **Multicast:** Different forwarding logic
- **VPN tunneling:** Encapsulation concepts
- **IPv6:** Dual-stack routing

### Advanced Features
- **Sandbox mode:** Build custom networks, test scenarios
- **Level editor:** Community-created challenges
- **Leaderboards:** Compete on efficiency scores
- **Achievements:** "Perfection: 100% accuracy across all levels"
- **Challenge mode:** Time trials, minimal rules constraints

### Educational Extensions
- **Glossary:** In-game definitions of terms
- **Packet decoder:** Deep dive into header fields
- **Comparison mode:** "Your rules vs. optimal solution"
- **Certification prep:** Map levels to CCNA/Network+ topics

---

## Success Metrics

### Player Engagement
- Level completion rate
- Average time per level
- Retry rate
- Star rating distribution

### Educational Effectiveness
- Pre/post concept quizzes (optional)
- Community feedback on clarity
- Adoption by educators/bootcamps

### Virality (HN/Reddit)
- GitHub stars
- Social media shares
- Blog post citations
- Inclusion in "learn networking" lists

---

## Development Priorities

### MVP (Minimum Viable Product)
1. Levels 1-5 (Switch basics through Router basics)
2. Manual routing only (no automation)
3. Basic UI with drag-and-drop
4. Pass/fail scoring (no stars)
5. Desktop browser support

### Version 1.0
1. All 9 levels
2. Full automation system
3. 3-star scoring
4. Mobile/tablet support
5. Progress saving

### Version 1.5+
1. Additional levels
2. Sandbox mode
3. Achievements
4. Polished animations
5. Community features

---

## Conclusion

**No, YOU Are the Router!** fills a significant gap in technical education: the "you are the component" simulation game. By letting players embody network devices and make routing decisions manually before automating them, the game teaches both HOW packets flow and HOW real devices implement forwarding logic.

The progressive difficulty curve—from simple MAC switching through NAT and VLANs—matches how networking is taught professionally while remaining accessible to beginners. The visual programming system (inspired by Zachtronics) keeps gameplay engaging even as packet volume increases.

This design balances educational rigor with game-like satisfaction, making it suitable for self-learners, students, and professionals brushing up on fundamentals. The browser-based, mobile-friendly approach ensures maximum accessibility with zero installation friction.

**Ready to build!**
