import React, { useState } from 'react';
import { Cpu, Zap, Layers, Activity, Sliders, ChevronRight, Terminal, Info, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface PcbComponent {
  id: string;
  ref: string;
  name: string;
  category: 'MCU' | 'Wireless' | 'Power' | 'Display' | 'Interface' | 'AI Metrology';
  package: string;
  voltage: string;
  description: string;
  role: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const PCB_COMPONENTS: PcbComponent[] = [
  {
    id: 'u1-stm32',
    ref: 'U1',
    name: 'STM32F407VGT6 Microcontroller',
    category: 'MCU',
    package: 'LQFP-100 (14x14 mm)',
    voltage: '3.3V DC',
    description: 'ARM Cortex-M4F 32-bit RISC core operating at 168 MHz with 1MB Flash memory, 192KB SRAM, hardware FPU, and DSP instructions.',
    role: 'Central processing unit for low-latency robotics kinematics and real-time hardware telemetry.',
    x: 235,
    y: 135,
    width: 130,
    height: 130
  },
  {
    id: 'u2-esp32',
    ref: 'U2',
    name: 'ESP32-WROOM-32D Module',
    category: 'Wireless',
    package: 'SMD Module (18x25.5 mm)',
    voltage: '3.3V DC',
    description: '240 MHz dual-core Tensilica Xtensa LX6 MCU with built-in 802.11 b/g/n Wi-Fi, BLE 4.2, and PCB trace antenna.',
    role: 'VoltX Smart Charging Cutoff controller with automated battery threshold monitoring and Wi-Fi cloud telemetry.',
    x: 45,
    y: 65,
    width: 125,
    height: 180
  },
  {
    id: 'disp1-oled',
    ref: 'DISP1',
    name: '0.96" I2C Monochrome OLED',
    category: 'Display',
    package: 'SSD1306 Module',
    voltage: '3.3V / 5V DC',
    description: '128x64 high-contrast blue/white organic LED display panel interfacing over fast-mode I2C (address 0x3C).',
    role: 'Displays live battery percentage, system operating voltage, temperature, and hardware status messages.',
    x: 435,
    y: 75,
    width: 135,
    height: 110
  },
  {
    id: 'ai-driftsense',
    ref: 'IC3',
    name: 'DriftSense Metrology Co-Processor',
    category: 'AI Metrology',
    package: 'BGA-64 (Edge Accelerator)',
    voltage: '1.8V / 3.3V Core',
    description: 'Sub-pixel SEM metrology execution unit running the Custom 4-Layer ResNet Triplet Loss Model with 3-Level Pyramid NCC.',
    role: 'Performs sub-pixel DRAM & FinFET reference patch localization in extreme noise Scanning Electron Microscope images.',
    x: 240,
    y: 295,
    width: 120,
    height: 75
  },
  {
    id: 'k1-relay',
    ref: 'K1',
    name: 'VoltX 10A Opto-Isolated Relay',
    category: 'Power',
    package: 'Through-Hole SPDT',
    voltage: '5V Coil / 250VAC 10A',
    description: 'Songle SPDT mechanical power relay driven via 2N2222 BJT and PC817 optocoupler with 1N4007 flyback suppression diode.',
    role: 'Physically severs phone charging AC/DC mains circuit automatically when target battery capacity (80%) is reached.',
    x: 45,
    y: 275,
    width: 125,
    height: 95
  },
  {
    id: 'tb-power',
    ref: 'J1-J4',
    name: 'Screw Terminal Blocks',
    category: 'Interface',
    package: '5.08mm Pitch Euroblock',
    voltage: 'Up to 300V / 15A',
    description: 'Heavy-duty industrial wire clamp terminal headers for external power supply, lithium battery input, and motor rails.',
    role: 'Provides vibration-resistant electrical connections for power input, CAN bus, and automated relay contacts.',
    x: 200,
    y: 20,
    width: 200,
    height: 40
  }
];

export const PcbBoardViewer: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<PcbComponent>(PCB_COMPONENTS[0]);
  const [layerVisibility, setLayerVisibility] = useState({
    copper: true,
    silkscreen: true,
    vias: true,
    components: true
  });

  const handleComponentClick = (comp: PcbComponent) => {
    sound.playRelayClick();
    setSelectedComponent(comp);
  };

  return (
    <section id="pcb-board" className="py-6 relative w-full font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-300 font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Hardware Engineering Core
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-white" />
            Hardware Motherboard Architecture
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl font-normal">
            Clean 2D engineering view of the custom 4-layer control motherboard. Click any onboard IC or module below to inspect its pinout, role, and electrical interface.
          </p>
        </div>

        {/* Quick Spec Badge */}
        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-300">REV 4.2 • 4-LAYER FR4-TG155 • ENIG GOLD</span>
        </div>
      </div>

      {/* Main Board Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 2D Interactive PCB Board Surface */}
        <div className="lg:col-span-8 rounded-3xl bg-[#141518] border border-zinc-800 p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Board Status Banner */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80 text-xs">
            <div className="flex items-center space-x-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-zinc-200">BOARD SIZE: 145 × 105 mm</span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-zinc-400">IMPEDANCE CONTROLLED</span>
            </div>
            <div className="text-zinc-500 font-mono text-[11px] hidden sm:block">
              TOUCH OR CLICK COMPONENTS TO INSPECT
            </div>
          </div>

          {/* Authentic 2D Technical Solder Mask Canvas (SVG Vector) */}
          <div className="relative w-full aspect-[620/410] rounded-2xl overflow-hidden border-2 border-emerald-950 bg-[#071d13] shadow-inner select-none">
            
            {/* PCB Grid Texture */}
            <svg
              viewBox="0 0 620 410"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Copper Hatch Pattern */}
                <pattern id="pcbHatch" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 0 16 L 16 0 M 0 0 L 16 16" fill="none" stroke="#0d3522" strokeWidth="0.8" />
                </pattern>
                {/* Gold Glow Filter */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* FR4 Solder Mask Substrate Base */}
              <rect x="8" y="8" width="604" height="394" rx="14" fill="#0b2c1c" stroke="#10422a" strokeWidth="2" />
              <rect x="12" y="12" width="596" height="386" rx="12" fill="url(#pcbHatch)" />

              {/* Copper Ground Plane Perimeter Border */}
              <rect x="20" y="20" width="580" height="370" rx="10" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.4" />

              {/* --- COPPER SIGNAL TRACES --- */}
              {layerVisibility.copper && (
                <g stroke="#d4af37" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                  {/* Traces from U1 MCU to ESP32 */}
                  <path d="M 235 150 L 195 150 L 170 125 L 170 100" />
                  <path d="M 235 165 L 190 165 L 165 140 L 170 140" />
                  <path d="M 235 180 L 185 180 L 160 155 L 160 190 L 170 190" />
                  <path d="M 235 195 L 195 195 L 180 210 L 170 210" />

                  {/* Traces from U1 MCU to OLED Display */}
                  <path d="M 365 150 L 400 150 L 420 130 L 435 130" stroke="#f59e0b" />
                  <path d="M 365 165 L 405 165 L 425 145 L 435 145" stroke="#f59e0b" />
                  <path d="M 365 180 L 395 180 L 415 160 L 435 160" />
                  <path d="M 365 195 L 410 195 L 430 175 L 435 175" />

                  {/* Traces to DriftSense AI Co-Processor */}
                  <path d="M 270 265 L 270 295" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d="M 285 265 L 285 295" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d="M 300 265 L 300 295" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d="M 315 265 L 315 295" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d="M 330 265 L 330 295" stroke="#38bdf8" strokeWidth="2.5" />

                  {/* Traces from ESP32 to VoltX Relay */}
                  <path d="M 90 245 L 90 275" stroke="#10b981" strokeWidth="3" />
                  <path d="M 115 245 L 115 275" stroke="#10b981" strokeWidth="3" />

                  {/* Power Bus Rails */}
                  <path d="M 300 60 L 300 135" stroke="#ef4444" strokeWidth="3" />
                  <path d="M 320 60 L 320 135" stroke="#3b82f6" strokeWidth="3" />
                </g>
              )}

              {/* --- GOLD VIAS & DRILL PADS --- */}
              {layerVisibility.vias && (
                <g fill="#d4af37">
                  {/* Corner Mounting Holes with Annular Copper Rings */}
                  {[
                    [32, 32], [588, 32], [32, 378], [588, 378]
                  ].map(([hx, hy], idx) => (
                    <g key={idx}>
                      <circle cx={hx} cy={hy} r="14" fill="none" stroke="#d4af37" strokeWidth="4" />
                      <circle cx={hx} cy={hy} r="8" fill="#040d08" stroke="#d4af37" strokeWidth="1" />
                    </g>
                  ))}

                  {/* Matrix of Ground & Signal Vias */}
                  {[
                    [195, 150], [190, 165], [185, 180], [195, 195],
                    [400, 150], [405, 165], [395, 180], [410, 195],
                    [220, 95], [240, 95], [260, 95], [360, 95], [380, 95],
                    [220, 280], [380, 280], [450, 220], [470, 220], [490, 220],
                    [530, 270], [550, 270], [530, 290], [550, 290]
                  ].map(([vx, vy], vIdx) => (
                    <g key={vIdx}>
                      <circle cx={vx} cy={vy} r="4.5" fill="#d4af37" />
                      <circle cx={vx} cy={vy} r="2" fill="#06120b" />
                    </g>
                  ))}
                </g>
              )}

              {/* --- WHITE SILKSCREEN LEGENDS --- */}
              {layerVisibility.silkscreen && (
                <g fill="#ffffff" fontFamily="sans-serif">
                  <text x="30" y="398" fontSize="9" fontWeight="bold" opacity="0.8" letterSpacing="0.5">
                    HARIHARAN K // HIGH-SPEED ROBOTICS MOTHERBOARD // REV 4.2
                  </text>
                  <text x="450" y="398" fontSize="8" opacity="0.7" fontFamily="monospace">
                    ROHS COMPLIANT • TG155
                  </text>

                  {/* Pin 1 Indicators */}
                  <circle cx="242" cy="142" r="3" fill="#ffffff" />
                  <circle cx="247" cy="302" r="2.5" fill="#ffffff" />
                </g>
              )}

              {/* --- ONBOARD PHYSICAL COMPONENTS --- */}
              {layerVisibility.components && PCB_COMPONENTS.map((comp) => {
                const isSelected = selectedComponent.id === comp.id;

                return (
                  <g
                    key={comp.id}
                    onClick={() => handleComponentClick(comp)}
                    className="cursor-pointer transition-all duration-200"
                    style={{ outline: 'none' }}
                  >
                    {/* Selection Highlight Glow Box */}
                    {isSelected && (
                      <rect
                        x={comp.x - 4}
                        y={comp.y - 4}
                        width={comp.width + 8}
                        height={comp.height + 8}
                        rx="8"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Specific Realistic Renders per Component */}
                    {comp.id === 'u1-stm32' && (
                      <g>
                        {/* QFP IC Body */}
                        <rect x={comp.x} y={comp.y} width={comp.width} height={comp.height} rx="4" fill="#14181f" stroke="#334155" strokeWidth="2" />
                        {/* Chamfer center notch */}
                        <circle cx={comp.x + comp.width / 2} cy={comp.y + comp.height / 2} r="16" fill="#1e293b" opacity="0.5" />
                        {/* Laser text markings */}
                        <text x={comp.x + comp.width / 2} y={comp.y + 45} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">
                          STM32F407
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 62} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                          ARM CORTEX-M4F
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 78} textAnchor="middle" fill="#94a3b8" fontSize="8">
                          168MHz / 1MB FLASH
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 102} textAnchor="middle" fill="#00ff9c" fontSize="8" fontWeight="bold">
                          {comp.ref}
                        </text>
                        {/* QFP Gull-wing Pins along 4 edges */}
                        {[...Array(12)].map((_, pi) => (
                          <g key={pi} fill="#e2e8f0">
                            <rect x={comp.x + 12 + pi * 9} y={comp.y - 6} width="4" height="6" />
                            <rect x={comp.x + 12 + pi * 9} y={comp.y + comp.height} width="4" height="6" />
                            <rect x={comp.x - 6} y={comp.y + 12 + pi * 9} width="6" height="4" />
                            <rect x={comp.x + comp.width} y={comp.y + 12 + pi * 9} width="6" height="4" />
                          </g>
                        ))}
                      </g>
                    )}

                    {comp.id === 'u2-esp32' && (
                      <g>
                        {/* ESP32 Carrier PCB */}
                        <rect x={comp.x} y={comp.y} width={comp.width} height={comp.height} rx="5" fill="#090c10" stroke="#1e293b" strokeWidth="1.5" />
                        {/* Gold Serpentine Trace PCB Antenna */}
                        <rect x={comp.x + 10} y={comp.y + 8} width={comp.width - 20} height="36" rx="3" fill="#131720" stroke="#d4af37" strokeWidth="1.5" />
                        <path d={`M ${comp.x + 18} ${comp.y + 36} L ${comp.x + 18} ${comp.y + 14} L ${comp.x + 36} ${comp.y + 14} L ${comp.x + 36} ${comp.y + 36} L ${comp.x + 54} ${comp.y + 36} L ${comp.x + 54} ${comp.y + 14} L ${comp.x + 72} ${comp.y + 14} L ${comp.x + 72} ${comp.y + 36} L ${comp.x + 90} ${comp.y + 36} L ${comp.x + 90} ${comp.y + 14}`} fill="none" stroke="#f59e0b" strokeWidth="2" />
                        {/* RF Metal Shielding Can */}
                        <rect x={comp.x + 10} y={comp.y + 52} width={comp.width - 20} height="110" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                        {/* Laser text on metal can */}
                        <text x={comp.x + comp.width / 2} y={comp.y + 85} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="bold">
                          ESP-WROOM-32
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 102} textAnchor="middle" fill="#475569" fontSize="8" fontWeight="bold">
                          Wi-Fi + BLE 4.2
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 124} textAnchor="middle" fill="#047857" fontSize="9" fontWeight="bold">
                          VoltX Cutoff Core
                        </text>
                        {/* Header side pins */}
                        {[...Array(10)].map((_, epi) => (
                          <g key={epi} fill="#d4af37">
                            <rect x={comp.x - 4} y={comp.y + 55 + epi * 11} width="4" height="4" />
                            <rect x={comp.x + comp.width} y={comp.y + 55 + epi * 11} width="4" height="4" />
                          </g>
                        ))}
                      </g>
                    )}

                    {comp.id === 'disp1-oled' && (
                      <g>
                        {/* OLED Blue Substrate PCB */}
                        <rect x={comp.x} y={comp.y} width={comp.width} height={comp.height} rx="4" fill="#0f172a" stroke="#2563eb" strokeWidth="1.5" />
                        {/* Emissive Glass Screen */}
                        <rect x={comp.x + 10} y={comp.y + 20} width={comp.width - 20} height="80" rx="2" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                        {/* Illuminated Graphic Readout */}
                        <text x={comp.x + 20} y={comp.y + 40} fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
                          VOLTX: ONLINE
                        </text>
                        <text x={comp.x + 20} y={comp.y + 54} fill="#38bdf8" fontSize="8" fontFamily="monospace">
                          BATTERY: 80% (CUT)
                        </text>
                        <text x={comp.x + 20} y={comp.y + 68} fill="#34d399" fontSize="7" fontFamily="monospace">
                          DRIFTSENSE: READY
                        </text>
                        <path d={`M ${comp.x + 20} ${comp.y + 85} Q ${comp.x + 50} ${comp.y + 75} ${comp.x + 75} ${comp.y + 85} T ${comp.x + 115} ${comp.y + 85}`} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                        {/* 4 Header pins at top */}
                        {[...Array(4)].map((_, opi) => (
                          <circle key={opi} cx={comp.x + 40 + opi * 18} cy={comp.y + 10} r="3" fill="#d4af37" />
                        ))}
                      </g>
                    )}

                    {comp.id === 'ai-driftsense' && (
                      <g>
                        {/* Semiconductor AI Silicon Die */}
                        <rect x={comp.x} y={comp.y} width={comp.width} height={comp.height} rx="4" fill="#090d16" stroke="#0284c7" strokeWidth="2" />
                        <rect x={comp.x + 6} y={comp.y + 6} width={comp.width - 12} height={comp.height - 12} rx="2" fill="#0c1929" />
                        <text x={comp.x + comp.width / 2} y={comp.y + 30} textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                          DRIFTSENSE AI
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 45} textAnchor="middle" fill="#94a3b8" fontSize="8">
                          4-Layer ResNet TLM
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 60} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                          96.7% ACCURACY
                        </text>
                      </g>
                    )}

                    {comp.id === 'k1-relay' && (
                      <g>
                        {/* Blue/Black Songle Relay Box */}
                        <rect x={comp.x} y={comp.y} width={comp.width} height={comp.height} rx="3" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="1.5" />
                        <text x={comp.x + comp.width / 2} y={comp.y + 32} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                          SONGLE RELAY
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 48} textAnchor="middle" fill="#93c5fd" fontSize="9">
                          10A 250VAC // 5VDC
                        </text>
                        <text x={comp.x + comp.width / 2} y={comp.y + 68} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                          VOLTX CUTOFF
                        </text>
                        <rect x={comp.x + 20} y={comp.y + 76} width={comp.width - 40} height="10" rx="2" fill="#172554" />
                      </g>
                    )}

                    {comp.id === 'tb-power' && (
                      <g>
                        {/* Terminal blocks */}
                        <rect x={comp.x} y={comp.y} width={comp.width} height={comp.height} rx="3" fill="#14532d" stroke="#16a34a" strokeWidth="1" />
                        {[...Array(6)].map((_, tbi) => (
                          <g key={tbi}>
                            <rect x={comp.x + 8 + tbi * 32} y={comp.y + 6} width="24" height="28" rx="2" fill="#166534" />
                            <circle cx={comp.x + 20 + tbi * 32} cy={comp.y + 16} r="4" fill="#e2e8f0" />
                            <rect x={comp.x + 14 + tbi * 32} y={comp.y + 26} width="12" height="6" fill="#052e16" />
                          </g>
                        ))}
                      </g>
                    )}

                  </g>
                );
              })}

            </svg>

          </div>

          {/* Quick Component Selection Pills */}
          <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-zinc-800">
            {PCB_COMPONENTS.map((comp) => {
              const isSelected = selectedComponent.id === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleComponentClick(comp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-zinc-950 font-semibold shadow-md'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-70">[{comp.ref}]</span>
                  <span>{comp.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right: Component Telemetry & Electrical Specifications Panel */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Selected Component Card */}
          <div className="rounded-3xl bg-[#141518] border border-zinc-800 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-zinc-800 text-emerald-400 border border-zinc-700">
                REF: {selectedComponent.ref}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                {selectedComponent.category}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white leading-snug">
              {selectedComponent.name}
            </h3>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">PACKAGE</span>
                <span className="text-zinc-200 font-semibold truncate block mt-0.5">{selectedComponent.package}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">OPERATING VOLTAGE</span>
                <span className="text-emerald-400 font-semibold block mt-0.5">{selectedComponent.voltage}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/80">
              <div className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-white" />
                Technical Overview:
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                {selectedComponent.description}
              </p>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Portfolio Application:
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedComponent.role}
              </p>
            </div>
          </div>

          {/* Board Layer & Fabrication Details */}
          <div className="rounded-3xl bg-[#141518] border border-zinc-800 p-6 shadow-xl">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              Fabrication & Layer Specs
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/80 text-zinc-300">
                <span className="text-zinc-400">Layer Count:</span>
                <span className="font-semibold text-white font-mono">4-Layer Stackup</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/80 text-zinc-300">
                <span className="text-zinc-400">Substrate Material:</span>
                <span className="font-semibold text-white font-mono">FR4-Standard (TG155)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/80 text-zinc-300">
                <span className="text-zinc-400">Surface Finish:</span>
                <span className="font-semibold text-white font-mono">ENIG (Electroless Gold)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/80 text-zinc-300">
                <span className="text-zinc-400">Min Trace / Spacing:</span>
                <span className="font-semibold text-white font-mono">5 mil / 5 mil</span>
              </div>
              <div className="flex justify-between py-1.5 text-zinc-300">
                <span className="text-zinc-400">Copper Thickness:</span>
                <span className="font-semibold text-white font-mono">1 oz Outer / 0.5 oz Inner</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
