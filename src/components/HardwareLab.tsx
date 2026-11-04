import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { 
  Bot, Radio, Cpu, Wrench, Zap, Compass, 
  CheckCircle2, Gauge, ShieldCheck, Thermometer
} from 'lucide-react';

interface HardwareBenchItem {
  id: string;
  name: string;
  category: string;
  mcu: string;
  interfaces: string[];
  powerRating: string;
  description: string;
  image: string;
  status: 'PROTOTYPE_FABRICATED' | 'BENCH_TESTED_OK' | 'DEPLOYED_FIELD';
}

const BENCH_ITEMS: HardwareBenchItem[] = [
  {
    id: 'hw-1',
    name: 'Quadruped Robot Dynamic Joint Actuator Module',
    category: 'Robotics & Mechatronics',
    mcu: 'STM32G431CBU6 (170MHz Cordic)',
    interfaces: ['CAN-FD (5 Mbps)', 'SPI (AS5047P)', 'UART Telemetry'],
    powerRating: '24V - 48V DC // 40A Peak',
    description: 'High-bandwidth field-oriented motor controller with zero backlash planetary cycloidal reduction gearbox. Tuned for impedance-controlled dynamic leg locomotion.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    status: 'BENCH_TESTED_OK'
  },
  {
    id: 'hw-2',
    name: 'LoRaWAN Solar Environmental Telemetry Station',
    category: 'Ultra-Low-Power IoT',
    mcu: 'ESP32-C3 RISC-V + SX1262 LoRa',
    interfaces: ['I2C (BME688)', 'ADC Solar Cell', 'LoRa 868MHz'],
    powerRating: '3.8µA Sleep // Solar MPPT Harvester',
    description: 'Perpetual outdoor sensor node measuring VOC gases, humidity, and barometric pressure. Transmits encrypted packets up to 15km line-of-sight without battery replacement.',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1000&q=80',
    status: 'DEPLOYED_FIELD'
  },
  {
    id: 'hw-3',
    name: 'FPGA Reconfigurable Real-Time Audio DSP Platform',
    category: 'Digital Signal Processing',
    mcu: 'Xilinx Artix-7 XC7A35T FPGA',
    interfaces: ['I2S Audio Codec', 'SPI Flash', 'PMOD Bus'],
    powerRating: '3.3V / 1.0V Multi-rail (12W)',
    description: 'Hardware pipeline executing 1024-point real-time FFT, parametric FIR equalizer, and dynamic range audio compressor at 96kHz / 24-bit sampling rate.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    status: 'BENCH_TESTED_OK'
  },
  {
    id: 'hw-4',
    name: 'Medical-Grade Galvanic Isolated Biometric Sensor',
    category: 'Biomedical Electronics',
    mcu: 'TI MSP430FR5994 Low-Power MCU',
    interfaces: ['Isolated SPI (ADuM1401)', 'Analog Front-End'],
    powerRating: '2.5kV Galvanic Isolation // 3.3V',
    description: 'Electrocardiogram (ECG) and PPG pulse oximeter with optical digital isolation barrier, driven right-leg circuit for 50Hz CMRR noise cancellation.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80',
    status: 'PROTOTYPE_FABRICATED'
  }
];

export const HardwareLab: React.FC = () => {
  const [activeItem, setActiveItem] = useState<HardwareBenchItem>(BENCH_ITEMS[0]);

  return (
    <section id="hardware" className="py-16 relative">
      {/* Header Accent */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-[2px] bg-[#E58E26]" />
        <span className="text-xs font-mono font-bold text-[#E58E26] tracking-widest uppercase">
          SECTION 04 // HARDWARE BENCH & PROTOTYPES
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-orbitron tracking-tight flex items-center gap-3">
            <Bot className="w-8 h-8 text-[#E58E26]" />
            HARDWARE & ROBOTICS LAB
          </h2>
          <p className="text-sm text-[#C0C6CE] font-mono mt-1 max-w-2xl">
            Physical electronics bench builds: BLDC motor drivers, multi-sensor telemetry nodes, RF transceivers, and FPGA coprocessors.
          </p>
        </div>
      </div>

      {/* Hardware Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENCH_ITEMS.map((item) => {
          const isSelected = activeItem.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                setActiveItem(item);
                sound.playRelayClick();
              }}
              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-4 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#121820] border-[#E58E26] shadow-xl glow-copper'
                  : 'bg-[#0A0D14] border-white/10 hover:border-white/30'
              }`}
            >
              <div>
                <div className="relative h-40 rounded-lg overflow-hidden mb-3 border border-white/10">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-[#00FF9C] border border-[#00FF9C]/40">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#E58E26] font-bold uppercase">
                  {item.category}
                </div>
                <h3 className="text-base font-bold text-white font-rajdhani mt-0.5 leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-[#C0C6CE] mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#00BFFF]">
                  <span className="text-[10px] text-[#C0C6CE]/60">CORE:</span>
                  <span className="truncate max-w-[170px]">{item.mcu}</span>
                </div>
                <div className="flex items-center justify-between text-[#00FF9C]">
                  <span className="text-[10px] text-[#C0C6CE]/60">POWER:</span>
                  <span className="truncate max-w-[170px]">{item.powerRating}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

