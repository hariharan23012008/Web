import React, { useState } from 'react';
import { PcbDesignEntry } from '../types';
import { sound } from '../utils/audio';
import { 
  Layers, Download, Eye, FileSpreadsheet, Box, 
  CheckSquare, Square, Crosshair, Sparkles, Sliders
} from 'lucide-react';

interface PcbDesignLabProps {
  designs: PcbDesignEntry[];
}

export const PcbDesignLab: React.FC<PcbDesignLabProps> = ({ designs }) => {
  const [selectedDesign, setSelectedDesign] = useState<PcbDesignEntry>(designs[0]);
  const [activeLayers, setActiveLayers] = useState({
    silkscreen: true,
    topCopper: true,
    gndPlane: true,
    pwrPlane: false,
    bottomCopper: true,
    drills: true
  });
  const [highlightedNet, setHighlightedNet] = useState<string | null>(null);

  const handleSelectDesign = (d: PcbDesignEntry) => {
    sound.playRelayClick();
    setSelectedDesign(d);
    setHighlightedNet(null);
  };

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    sound.playRelayClick();
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleNetClick = (net: string) => {
    sound.playSignalPulse();
    setHighlightedNet(highlightedNet === net ? null : net);
  };

  const handleDownloadGerber = () => {
    sound.playBeep(1200, 'sine', 0.1);
    const content = `GERBER RS-274X FABRICATION ARCHIVE\nBOARD: ${selectedDesign.boardName}\nTOOL: ${selectedDesign.edaTool}\nLAYERS: ${selectedDesign.layerCount}\nFINISH: ${selectedDesign.finish}\n\nFILES:\n${selectedDesign.gerberFiles.join('\n')}`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDesign.boardName.replace('.kicad_pcb', '')}_Gerbers.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section id="pcblab" className="py-16 relative">
      {/* Header Accent */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-[2px] bg-[#00FF9C]" />
        <span className="text-xs font-mono font-bold text-[#00FF9C] tracking-widest uppercase">
          SECTION 03 // PCB DESIGN & CAD WORKSPACE
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-orbitron tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-[#00FF9C]" />
            PCB DESIGN LAB
          </h2>
          <p className="text-sm text-[#C0C6CE] font-mono mt-1 max-w-2xl">
            Controlled-impedance multi-layer stackups, Gerber CAM verification, differential pair routing, and high-frequency RF layouts.
          </p>
        </div>

        <button
          onClick={handleDownloadGerber}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF9C] hover:bg-[#00FF9C]/80 text-black font-mono text-xs font-bold transition-all shadow-lg glow-green"
        >
          <Download className="w-4 h-4" />
          EXPORT GERBER ARCHIVE
        </button>
      </div>

      {/* Main PCB CAD Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#080B10] border-2 border-[#00FF9C]/40 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left Panel: Design Selector & Layer Manager */}
        <div className="lg:col-span-4 bg-[#0A0E14] border-r border-white/10 p-5 space-y-5">
          
          {/* Design Projects Selector */}
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-2">
              <Box className="w-4 h-4 text-[#00FF9C]" />
              SELECT PCB PROJECT
            </div>
            <div className="space-y-2">
              {designs.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDesign(d)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedDesign.id === d.id
                      ? 'bg-[#0B4D38]/50 border-[#00FF9C] text-white glow-green'
                      : 'bg-black/40 border-white/5 text-[#C0C6CE] hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-[#00FF9C]">
                    {d.boardName}
                  </div>
                  <div className="text-xs text-white mt-0.5 font-rajdhani font-semibold">
                    {d.title}
                  </div>
                  <div className="text-[10px] text-[#C0C6CE]/60 font-mono mt-1">
                    {d.layerCount} Layers • {d.dimensions} • {d.edaTool}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* KiCad / Altium Layer Manager */}
          <div className="pt-4 border-t border-white/10">
            <div className="text-xs font-mono font-bold text-white uppercase mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#00BFFF]" />
                LAYER STACKUP MANAGER
              </span>
              <span className="text-[10px] text-[#00FF9C] font-mono">
                {selectedDesign.layerCount}-LAYER
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {[
                { key: 'silkscreen', label: 'F.SilkS (Top Silkscreen)', color: '#ffffff' },
                { key: 'topCopper', label: 'F.Cu (Top Signal Copper)', color: '#D4AF37' },
                { key: 'gndPlane', label: 'In1.Cu (Internal Ground)', color: '#00BFFF' },
                { key: 'pwrPlane', label: 'In2.Cu (Internal Power)', color: '#F59E0B' },
                { key: 'bottomCopper', label: 'B.Cu (Bottom Signal)', color: '#E58E26' },
                { key: 'drills', label: 'Excellon Drills & Vias', color: '#00FF9C' }
              ].map(layer => {
                const isActive = activeLayers[layer.key as keyof typeof activeLayers];
                return (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key as keyof typeof activeLayers)}
                    className="w-full flex items-center justify-between p-2 rounded bg-black/40 border border-white/5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                      <span className={isActive ? 'text-white' : 'text-[#C0C6CE]/40 line-through'}>
                        {layer.label}
                      </span>
                    </div>
                    {isActive ? (
                      <CheckSquare className="w-4 h-4 text-[#00FF9C]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#C0C6CE]/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Net Highlighter */}
          <div className="pt-4 border-t border-white/10">
            <div className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#00FF9C]" />
              NET HIGHLIGHT PROBE
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['GND', 'VDD_3V3', 'VDD_5V0', 'SPI_MOSI', 'I2C_SDA', 'USB_DP'].map(net => (
                <button
                  key={net}
                  onClick={() => handleNetClick(net)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                    highlightedNet === net
                      ? 'bg-[#00FF9C] text-black shadow glow-green'
                      : 'bg-black/50 border border-white/10 text-[#C0C6CE] hover:border-[#00FF9C]/40'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Panel: Interactive CAD Viewport & Fabrication Specs */}
        <div className="lg:col-span-8 flex flex-col p-5 bg-[#05070B] space-y-5">
          
          {/* Virtual CAD Viewport with Simulated Copper Tracks */}
          <div className="relative h-[340px] rounded-xl overflow-hidden border-2 border-[#0B4D38] bg-[#07251B] pcb-grid flex items-center justify-center shadow-inner">
            
            {/* High-tech CAD crosshair center markings */}
            <div className="absolute top-3 left-4 text-[10px] font-mono text-[#00FF9C] bg-black/60 px-2 py-1 rounded border border-[#00FF9C]/30">
              GRID: 0.1mm • ZOOM: 100% • NET: {highlightedNet || 'ALL_NETS'}
            </div>

            {/* Simulated PCB Copper Artwork Canvas SVG */}
            <svg className="w-full h-full max-w-lg max-h-[300px]" viewBox="0 0 600 400">
              {/* Board Outline */}
              <rect x="20" y="20" width="560" height="360" rx="16" fill="#0B4D38" stroke="#D4AF37" strokeWidth="3" />
              
              {/* Copper Ground Pour Crosshatch */}
              {activeLayers.gndPlane && (
                <g opacity="0.25">
                  {[...Array(20)].map((_, i) => (
                    <line key={i} x1={40 + i * 26} y1="30" x2={40 + i * 26} y2="370" stroke="#00BFFF" strokeWidth="1" />
                  ))}
                </g>
              )}

              {/* Copper Traces */}
              {activeLayers.topCopper && (
                <g>
                  {/* Traces */}
                  <path
                    d="M 60 80 L 180 80 L 220 120 L 320 120"
                    fill="none"
                    stroke={highlightedNet === 'VDD_3V3' ? '#00FF9C' : '#D4AF37'}
                    strokeWidth={highlightedNet === 'VDD_3V3' ? '6' : '3'}
                    className={highlightedNet === 'VDD_3V3' ? 'animate-pulse' : ''}
                  />
                  <path
                    d="M 80 320 L 200 320 L 260 260 L 380 260"
                    fill="none"
                    stroke={highlightedNet === 'GND' ? '#00FF9C' : '#D4AF37'}
                    strokeWidth={highlightedNet === 'GND' ? '6' : '3'}
                  />
                  <path
                    d="M 280 180 L 360 180 L 420 120 L 520 120"
                    fill="none"
                    stroke={highlightedNet === 'SPI_MOSI' ? '#00FF9C' : '#E58E26'}
                    strokeWidth="3"
                  />
                  {/* Differential Pairs */}
                  <path d="M 120 220 L 200 220 L 240 180 L 300 180" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
                  <path d="M 120 230 L 195 230 L 235 190 L 300 190" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
                </g>
              )}

              {/* Silkscreen Markings */}
              {activeLayers.silkscreen && (
                <g fill="rgba(255,255,255,0.85)" fontFamily="'JetBrains Mono', monospace" fontSize="12">
                  <text x="40" y="55" fontWeight="bold">REV 2.4 - {selectedDesign.boardName}</text>
                  <rect x="260" y="140" width="80" height="80" fill="none" stroke="#fff" strokeWidth="1.5" />
                  <text x="280" y="185" fill="#00FF9C">U1 MCU</text>
                  <rect x="420" y="160" width="60" height="40" fill="none" stroke="#fff" strokeWidth="1.5" />
                  <text x="430" y="185">U2 REG</text>
                </g>
              )}

              {/* Via Holes & Drill Pads */}
              {activeLayers.drills && (
                <g>
                  {[[60, 80], [320, 120], [80, 320], [380, 260], [520, 120], [280, 180]].map(([vx, vy], i) => (
                    <g key={i}>
                      <circle cx={vx} cy={vy} r="8" fill="#E5C07B" stroke="#000" strokeWidth="1.5" />
                      <circle cx={vx} cy={vy} r="3.5" fill="#051009" />
                    </g>
                  ))}
                  {/* Mounting Holes */}
                  {[[35, 35], [565, 35], [35, 365], [565, 365]].map(([hx, hy], i) => (
                    <g key={i}>
                      <circle cx={hx} cy={hy} r="14" fill="none" stroke="#D4AF37" strokeWidth="5" />
                      <circle cx={hx} cy={hy} r="9" fill="#080B10" />
                    </g>
                  ))}
                </g>
              )}
            </svg>

            {highlightedNet && (
              <div className="absolute bottom-3 right-4 bg-[#00FF9C] text-black font-mono font-bold text-xs px-3 py-1 rounded shadow glow-green animate-pulse">
                PROBE ACTIVE: {highlightedNet}
              </div>
            )}
          </div>

          {/* Fabrication Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedDesign.specs.map((spec, sIdx) => (
              <div key={sIdx} className="p-3 bg-black/40 border border-white/10 rounded-lg">
                <div className="text-[10px] font-mono text-[#C0C6CE]/60 uppercase">
                  {spec.label}
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>

          {/* Gerber Files List */}
          <div className="p-4 bg-black/50 border border-white/10 rounded-xl">
            <div className="text-xs font-mono font-bold text-[#00FF9C] uppercase mb-2 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              GENERATED GERBER CAM PRODUCTION SUITE
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-[#C0C6CE]">
              {selectedDesign.gerberFiles.map((gf, gIdx) => (
                <div key={gIdx} className="flex items-center space-x-2 bg-white/5 p-2 rounded border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]" />
                  <span className="truncate">{gf}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

