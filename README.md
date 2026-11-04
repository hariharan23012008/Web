# ⚡ Electronics & VLSI Engineering PCB Digital Laboratory Portfolio

> **"An Electronics Engineer's Portfolio Built Inside a Circuit Board."**

A premium, interactive, 3D Printed Circuit Board (PCB) portfolio website engineered for Electronics, VLSI, and Embedded Systems engineers.

---

## 🌟 Key Features

### 1. 3D PCB Landing Page & Cinematic Dive-in
- **Interactive 3D Motherboard**: Built with Three.js rendering a realistic 4-layer FR-4 circuit board (`#0B4D38`) with gold-plated pads, copper routing traces, silkscreen text, and mounting holes.
- **Component Inspection Tooltip**: Hovering over components (STM32F407 MCU, DDR3 RAM, 16MHz Crystal Oscillator, Buck Regulator, USB-C Port, GPIO Headers, 0805 SMD Resistors/Capacitors) highlights them and displays real-time engineering specs.
- **Pulsing Diagnostics**: Moving electron signal pulses traveling along copper traces and blinking RX/TX LEDs.
- **Cinematic 3D Entry Animation**: Clicking the motherboard triggers a capacitor charging audio sweep and an acceleration camera dive into the silicon die, transitioning smoothly into the digital workstation.

### 2. Digital Engineering Workstation Dashboard
- **Live Phosphor Oscilloscope**: Interactive real-time dual-channel oscilloscope generating Sine, Square, Triangle, PWM, and SPI signals with adjustable frequency, voltage gain, trigger modes, and real-time Web Audio API tone synthesis.
- **PROJECTS**: Presented as IC Dual In-line (DIP) and QFP packages with metallic pins. Each project features an interactive modal with architecture breakdown, circuit schematics, 4-layer PCB Gerber viewer with layer toggles, Bill of Materials (BOM) table, source code, and demo video links.
- **SOURCE CODE LAB**: Syntax-highlighted firmware viewer for Verilog HDL, Embedded C, C++, Python, and Arduino. Includes an interactive Digital Logic Analyzer timing diagram simulator with clock cycle stepping!
- **PCB DESIGN LAB**: KiCad/Altium EDA canvas simulator with 6-layer manager (Silkscreen, Top Copper, Ground Plane, Power Plane, Bottom Copper, Excellon Drills) and an interactive Net Highlighter (GND, 3V3, 5V, SPI, I2C, USB).
- **HARDWARE BENCH**: Showcase of robotic motor actuators, ultra-low power LoRaWAN environmental nodes, FPGA coprocessors, and isolated biomedical sensors.
- **ACHIEVEMENTS**: Silicon medal badges for hackathon wins, IEEE research papers, and Cadence certifications with particle confetti celebration.
- **ABOUT ME & CALCULATORS**: Complete engineering bio, education, 4-quadrant skill matrix, interactive 4-band resistor color code calculator, and IPC-2221 PCB trace width calculator.
- **CONTACT TERMINAL**: RF transceiver-themed console with carrier frequency selection, CRC-32 acknowledgment, and direct communication links.
- **ADMIN DASHBOARD**: Passcode-protected (`admin123`) content management console to add/edit/delete projects, upload images, export/import JSON database backups, and restore factory datasets.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite 8
- **3D Graphics**: Three.js (WebGL procedural shaders, PBR materials, raycasting)
- **Audio**: Web Audio API Procedural Synthesizer (Zero audio file dependencies, zero latency)
- **Icons & Visuals**: Lucide Icons, Canvas Confetti

---

## 🚀 Running the Project

```bash
# Navigate to the workspace
cd "C:/Users/HARIHARAN K/.gemini/antigravity/scratch/electronics-pcb-portfolio"

# Start Vite Dev Server
npm run dev
```

Visit: `http://localhost:3000/` in your browser.
Admin passcode: `admin123`
