import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/audio';
import { Cpu, Eye, RotateCw, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface PCB3DCanvasProps {
  onEnterPortfolio: () => void;
  isInspecting?: boolean;
  onCloseInspect?: () => void;
}

export const PCB3DCanvas: React.FC<PCB3DCanvasProps> = ({
  onEnterPortfolio,
  isInspecting = false,
  onCloseInspect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const stateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    pcbBoard?: THREE.Group;
    ledLights: { light: THREE.PointLight; mesh: THREE.Mesh; phase: number; speed: number }[];
    materials: THREE.Material[];
    reqId?: number;
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentCamPos: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    mouse: THREE.Vector2;
    targetMouse: THREE.Vector2;
  }>({
    ledLights: [],
    materials: [],
    targetCamPos: new THREE.Vector3(0, 8.5, 12.5),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentCamPos: new THREE.Vector3(0, 8.5, 12.5),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    mouse: new THREE.Vector2(0, 0),
    targetMouse: new THREE.Vector2(0, 0)
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.022);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 12.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;

    // --- 2. Realistic Studio & Accent Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0a1c13, 1.8);
    scene.add(ambientLight);

    // Warm Key Light for crisp metallic specular highlights
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.3);
    keyLight.position.set(7, 14, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -9;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cool Cyan Rim Fill
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-8, 8, -6);
    scene.add(fillLight);

    // Deep Emerald Under-glow
    const underLight = new THREE.PointLight(0x059669, 1.2, 18);
    underLight.position.set(0, -3.5, 0);
    scene.add(underLight);

    // --- 3. Construct Main PCB Board ---
    const pcbGroup = new THREE.Group();
    scene.add(pcbGroup);
    stateRef.current.pcbBoard = pcbGroup;

    const boardWidth = 14.5;
    const boardLength = 10.5;
    const boardThickness = 0.28;
    const boardGeo = new THREE.BoxGeometry(boardWidth, boardThickness, boardLength);

    // --- Generate High-Resolution Realistic Solder Mask & Silk Canvas Texture ---
    const pcbCanvas = document.createElement('canvas');
    pcbCanvas.width = 2048;
    pcbCanvas.height = 1480;
    const ctx = pcbCanvas.getContext('2d');

    if (ctx) {
      // 1. Plain Solid Green PCB Solder Mask (Clean & Smooth)
      ctx.fillStyle = '#107c41';
      ctx.fillRect(0, 0, pcbCanvas.width, pcbCanvas.height);

      // 2. Realistic Copper Traces (Golden-Amber with 45-degree chamfers)
      ctx.strokeStyle = '#c69239';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'miter';

      const traces = [
        // ESP32 to MCU bus lines
        [[520, 260], [700, 260], [820, 380], [820, 680]],
        [[520, 290], [680, 290], [800, 410], [800, 680]],
        [[520, 320], [660, 320], [780, 440], [780, 680]],
        [[520, 350], [640, 350], [760, 470], [760, 680]],
        // MCU to OLED Display bus
        [[1060, 720], [1200, 720], [1300, 620], [1400, 620]],
        [[1060, 750], [1180, 750], [1280, 650], [1400, 650]],
        [[1060, 780], [1160, 780], [1260, 680], [1400, 680]],
        [[1060, 810], [1140, 810], [1240, 710], [1400, 710]],
        // Tactile Push Buttons to MCU
        [[1350, 1200], [1350, 1050], [1180, 880], [1050, 880]],
        [[1520, 1200], [1520, 1020], [1200, 850], [1050, 850]],
        [[1700, 1200], [1700, 990], [1220, 820], [1050, 820]],
        // Power Rail Traces (wider)
        [[220, 480], [380, 480], [480, 580], [480, 850]],
        [[220, 520], [360, 520], [460, 620], [460, 850]],
        [[220, 860], [400, 860], [540, 1000], [780, 1000]],
        [[220, 900], [380, 900], [520, 1040], [780, 1040]],
        // Terminal blocks top routing
        [[300, 140], [300, 220], [420, 340]],
        [[500, 140], [500, 200], [600, 300]],
        [[700, 140], [700, 220], [780, 300]],
        [[900, 140], [900, 260], [960, 320]],
        [[1100, 140], [1100, 260], [1160, 320]],
        [[1300, 140], [1300, 240], [1360, 300]],
        [[1500, 140], [1500, 240], [1560, 300]],
        [[1700, 140], [1700, 280], [1650, 330]]
      ];

      traces.forEach(pts => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();
      });

      // 4. Gold / Tin Plated Through-Hole Vias
      const viaPoints = [
        [300, 220], [420, 340], [500, 200], [700, 220], [900, 260], [1100, 260],
        [1300, 240], [1500, 240], [1700, 280], [700, 260], [680, 290], [660, 320],
        [640, 350], [1200, 720], [1180, 750], [1160, 780], [1140, 810], [1350, 1050],
        [1520, 1020], [1700, 990], [380, 480], [360, 520], [540, 1000], [520, 1040],
        [750, 520], [780, 520], [810, 520], [1050, 520], [1080, 520], [1110, 520],
        [850, 920], [880, 920], [910, 920], [940, 920], [970, 920], [1000, 920]
      ];

      viaPoints.forEach(([vx, vy]) => {
        // Outer copper pad
        ctx.beginPath();
        ctx.arc(vx, vy, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#d4af37';
        ctx.fill();
        // Inner hole
        ctx.beginPath();
        ctx.arc(vx, vy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#06170d';
        ctx.fill();
      });

      // 4. Crisp White Silkscreen Markings (Clean Common Font)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;

      // Title & Architecture silkscreen
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('EMBEDDED CONTROL MOTHERBOARD // ROBOTICS & RADIO CORE', 120, 90);
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('DESIGNED BY HARIHARAN K • REV 4.2 HIGH-SPEED PCB', 120, 120);

      // ESP32 Silkscreen Outline & Labels
      ctx.strokeRect(320, 180, 380, 600);
      ctx.fillText('ESP32-WROOM-32D', 410, 215);
      ctx.fillText('GND  5V  RX  TX  EN', 340, 760);

      // OLED Silkscreen Box
      ctx.strokeRect(1320, 480, 420, 420);
      ctx.fillText('0.96" I2C OLED (SSD1306)', 1360, 515);
      ctx.fillText('GND  VCC  SCL  SDA', 1420, 545);

      // MCU Outline & Pin 1 Indicator
      ctx.strokeRect(840, 640, 340, 340);
      ctx.fillText('U1: STM32F407VGT6', 870, 630);
      ctx.beginPath();
      ctx.arc(860, 660, 7, 0, Math.PI * 2);
      ctx.fill();

      // Tactile Buttons Silkscreen (UP, DOWN, OK)
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillText('UP', 1335, 1340);
      ctx.fillText('DOWN', 1490, 1340);
      ctx.fillText('OK', 1690, 1340);
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('SW1', 1345, 1220);
      ctx.fillText('SW2', 1515, 1220);
      ctx.fillText('SW3', 1695, 1220);

      // Terminal Blocks Silkscreen Labels
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('5V  GND', 210, 175);
      ctx.fillText('MOT_A', 380, 175);
      ctx.fillText('MOT_B', 560, 175);
      ctx.fillText('SERVO_1', 750, 175);
      ctx.fillText('SERVO_2', 950, 175);
      ctx.fillText('BAT_IN', 1150, 175);
      ctx.fillText('RADIO_RX', 1350, 175);
      ctx.fillText('CAN_BUS', 1550, 175);

      // Corner Mounting Holes with Annular Copper Rings
      const corners = [
        [90, 90],
        [pcbCanvas.width - 90, 90],
        [90, pcbCanvas.height - 90],
        [pcbCanvas.width - 90, pcbCanvas.height - 90]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#d4af37';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fillStyle = '#06090e';
        ctx.fill();
      });
    }

    const pcbTexture = new THREE.CanvasTexture(pcbCanvas);
    pcbTexture.anisotropy = 8;

    const boardMat = new THREE.MeshStandardMaterial({
      map: pcbTexture,
      roughness: 0.32,
      metalness: 0.15
    });
    stateRef.current.materials.push(boardMat);

    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.receiveShadow = true;
    boardMesh.castShadow = true;
    pcbGroup.add(boardMesh);

    // Common Materials
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.12 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const darkChipMat = new THREE.MeshStandardMaterial({ color: 0x151921, roughness: 0.45, metalness: 0.5 });
    const terminalGreenMat = new THREE.MeshStandardMaterial({ color: 0x1e824c, roughness: 0.35, metalness: 0.15 });
    stateRef.current.materials.push(goldMat, silverMat, darkChipMat, terminalGreenMat);

    // ==========================================
    // 1. ESP32-WROOM-32 DEV MODULE (Realistic CAD)
    // ==========================================
    const espGroup = new THREE.Group();
    espGroup.position.set(-4.0, 0.2, -1.8);

    // Black carrier PCB
    const espPcbGeo = new THREE.BoxGeometry(2.8, 0.12, 4.4);
    const espPcbMat = new THREE.MeshStandardMaterial({ color: 0x11161d, roughness: 0.6 });
    stateRef.current.materials.push(espPcbMat);
    const espPcb = new THREE.Mesh(espPcbGeo, espPcbMat);
    espPcb.position.y = 0.06;
    espGroup.add(espPcb);

    // Gold serpentine trace PCB Wi-Fi antenna
    const antCanvas = document.createElement('canvas');
    antCanvas.width = 256;
    antCanvas.height = 128;
    const aCtx = antCanvas.getContext('2d');
    if (aCtx) {
      aCtx.fillStyle = '#11161d';
      aCtx.fillRect(0, 0, 256, 128);
      aCtx.strokeStyle = '#f59e0b';
      aCtx.lineWidth = 7;
      aCtx.beginPath();
      // Serpentine zig-zag antenna trace
      aCtx.moveTo(20, 100);
      aCtx.lineTo(20, 20);
      aCtx.lineTo(60, 20);
      aCtx.lineTo(60, 90);
      aCtx.lineTo(100, 90);
      aCtx.lineTo(100, 20);
      aCtx.lineTo(140, 20);
      aCtx.lineTo(140, 90);
      aCtx.lineTo(180, 90);
      aCtx.lineTo(180, 20);
      aCtx.lineTo(230, 20);
      aCtx.stroke();
    }
    const antTex = new THREE.CanvasTexture(antCanvas);
    const antMat = new THREE.MeshBasicMaterial({ map: antTex });
    stateRef.current.materials.push(antMat);
    const antMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.0), antMat);
    antMesh.rotation.x = -Math.PI / 2;
    antMesh.position.set(0, 0.13, -1.55);
    espGroup.add(antMesh);

    // Metal RF Shielding Can with Chamfered edges
    const shieldGeo = new THREE.BoxGeometry(2.1, 0.24, 2.2);
    const shieldMesh = new THREE.Mesh(shieldGeo, silverMat);
    shieldMesh.position.set(0, 0.22, 0.2);
    espGroup.add(shieldMesh);

    // Laser Engraving on ESP32 Shield
    const shieldCanvas = document.createElement('canvas');
    shieldCanvas.width = 512;
    shieldCanvas.height = 512;
    const sCtx = shieldCanvas.getContext('2d');
    if (sCtx) {
      sCtx.fillStyle = '#c5cbd3';
      sCtx.fillRect(0, 0, 512, 512);
      sCtx.fillStyle = '#475569';
      sCtx.font = 'bold 44px Arial, sans-serif';
      sCtx.textAlign = 'center';
      sCtx.fillText('ESP-WROOM-32', 256, 160);
      sCtx.font = 'bold 28px Arial, sans-serif';
      sCtx.fillText('ESPRESSIF', 256, 230);
      sCtx.font = '24px Arial, sans-serif';
      sCtx.fillText('FCC ID: 2AC7Z-ESPWROOM32', 256, 290);
      sCtx.fillText('Wi-Fi + BLE 4.2 CORE', 256, 350);
      sCtx.strokeRect(40, 40, 432, 432);
    }
    const shieldTex = new THREE.CanvasTexture(shieldCanvas);
    const shieldLabelMat = new THREE.MeshBasicMaterial({ map: shieldTex });
    stateRef.current.materials.push(shieldLabelMat);
    const shieldTop = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.0), shieldLabelMat);
    shieldTop.rotation.x = -Math.PI / 2;
    shieldTop.position.set(0, 0.35, 0.2);
    espGroup.add(shieldTop);

    // Dual-in-line gold header pins on carrier edges
    const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 8);
    for (let p = 0; p < 15; p++) {
      const zPos = -1.8 + p * 0.25;
      const pinL = new THREE.Mesh(pinGeo, goldMat);
      pinL.position.set(-1.25, 0.05, zPos);
      espGroup.add(pinL);
      const pinR = new THREE.Mesh(pinGeo, goldMat);
      pinR.position.set(1.25, 0.05, zPos);
      espGroup.add(pinR);
    }

    // Micro USB / Type-C port on bottom of ESP32
    const usbGeo = new THREE.BoxGeometry(0.8, 0.25, 0.7);
    const usbMesh = new THREE.Mesh(usbGeo, silverMat);
    usbMesh.position.set(0, 0.18, 2.1);
    espGroup.add(usbMesh);

    // Onboard micro tactile buttons (EN & BOOT)
    const btnGeo = new THREE.BoxGeometry(0.25, 0.18, 0.25);
    const btnMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    stateRef.current.materials.push(btnMat);
    const enBtn = new THREE.Mesh(btnGeo, btnMat);
    enBtn.position.set(-0.8, 0.2, 1.8);
    espGroup.add(enBtn);
    const bootBtn = new THREE.Mesh(btnGeo, btnMat);
    bootBtn.position.set(0.8, 0.2, 1.8);
    espGroup.add(bootBtn);

    pcbGroup.add(espGroup);

    // ==========================================
    // 2. 0.96" I2C OLED DISPLAY MODULE (SSD1306)
    // ==========================================
    const oledGroup = new THREE.Group();
    oledGroup.position.set(3.8, 0.2, 0.6);

    // Blue/Black carrier PCB
    const oledPcbGeo = new THREE.BoxGeometry(3.0, 0.1, 3.0);
    const oledPcbMat = new THREE.MeshStandardMaterial({ color: 0x12243d, roughness: 0.4 });
    stateRef.current.materials.push(oledPcbMat);
    const oledPcb = new THREE.Mesh(oledPcbGeo, oledPcbMat);
    oledPcb.position.y = 0.05;
    oledGroup.add(oledPcb);

    // 4-Pin Header at top of OLED module
    const oledPinHeaderGeo = new THREE.BoxGeometry(1.2, 0.3, 0.25);
    const oledHeaderBase = new THREE.Mesh(oledPinHeaderGeo, darkChipMat);
    oledHeaderBase.position.set(0, 0.2, -1.3);
    oledGroup.add(oledHeaderBase);
    for (let i = 0; i < 4; i++) {
      const pin = new THREE.Mesh(pinGeo, goldMat);
      pin.position.set(-0.45 + i * 0.3, 0.38, -1.3);
      oledGroup.add(pin);
    }

    // OLED Glass Screen (Emissive graphic readout)
    const oledGlassGeo = new THREE.BoxGeometry(2.5, 0.08, 1.9);
    const oledCanvas = document.createElement('canvas');
    oledCanvas.width = 512;
    oledCanvas.height = 384;
    const oCtx = oledCanvas.getContext('2d');
    if (oCtx) {
      oCtx.fillStyle = '#05070a';
      oCtx.fillRect(0, 0, 512, 384);
      oCtx.strokeStyle = '#00ffff';
      oCtx.lineWidth = 3;
      oCtx.strokeRect(10, 10, 492, 364);

      oCtx.fillStyle = '#00ffff';
      oCtx.font = 'bold 30px Arial, sans-serif';
      oCtx.fillText('STATUS: ONLINE', 30, 60);

      oCtx.font = '22px Arial, sans-serif';
      oCtx.fillText('CPU: 168 MHz   TEMP: 38°C', 30, 110);
      oCtx.fillText('BATT: 12.6V    PWR: 3.30V', 30, 150);
      oCtx.fillText('I2C: 0x3C (SSD1306 OK)', 30, 190);

      // Oscilloscope live sine wave display
      oCtx.strokeStyle = '#00ff9c';
      oCtx.lineWidth = 4;
      oCtx.beginPath();
      for (let x = 30; x < 480; x += 5) {
        const y = 290 + Math.sin(x * 0.04) * 45;
        if (x === 30) oCtx.moveTo(x, y);
        else oCtx.lineTo(x, y);
      }
      oCtx.stroke();
    }
    const oledTex = new THREE.CanvasTexture(oledCanvas);
    const oledMat = new THREE.MeshStandardMaterial({
      map: oledTex,
      emissive: new THREE.Color(0x00ffff),
      emissiveMap: oledTex,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.2
    });
    stateRef.current.materials.push(oledMat);
    const oledGlass = new THREE.Mesh(oledGlassGeo, oledMat);
    oledGlass.position.set(0, 0.14, 0.15);
    oledGroup.add(oledGlass);

    // Amber flex ribbon cable under glass
    const flexRibbonGeo = new THREE.BoxGeometry(1.2, 0.04, 0.5);
    const flexMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    stateRef.current.materials.push(flexMat);
    const flexRibbon = new THREE.Mesh(flexRibbonGeo, flexMat);
    flexRibbon.position.set(0, 0.11, 1.25);
    oledGroup.add(flexRibbon);

    // 4 Corner Standoff Screws on OLED
    const standoffGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12);
    [
      [-1.3, -1.3],
      [1.3, -1.3],
      [-1.3, 1.3],
      [1.3, 1.3]
    ].forEach(([sx, sz]) => {
      const st = new THREE.Mesh(standoffGeo, silverMat);
      st.position.set(sx, 0.1, sz);
      oledGroup.add(st);
    });

    pcbGroup.add(oledGroup);

    // ==========================================
    // 3. GREEN PHOENIX SCREW TERMINAL BLOCKS
    // ==========================================
    const createTerminalBlock = (x: number, z: number, pins: number, rotY: number = 0) => {
      const termGroup = new THREE.Group();
      termGroup.position.set(x, 0.2, z);
      termGroup.rotation.y = rotY;

      const pitch = 0.52;
      const width = pins * pitch;
      const bodyGeo = new THREE.BoxGeometry(width, 0.85, 0.75);
      const bodyMesh = new THREE.Mesh(bodyGeo, terminalGreenMat);
      bodyMesh.position.y = 0.42;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      termGroup.add(bodyMesh);

      // Screw heads & wire entry holes
      const screwGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
      for (let i = 0; i < pins; i++) {
        const offset = -width / 2 + pitch / 2 + i * pitch;
        // Silver screw top
        const screw = new THREE.Mesh(screwGeo, silverMat);
        screw.position.set(offset, 0.85, 0.05);
        termGroup.add(screw);

        // Wire entry hole in front
        const holeGeo = new THREE.BoxGeometry(0.22, 0.25, 0.1);
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x07150e });
        stateRef.current.materials.push(holeMat);
        const hole = new THREE.Mesh(holeGeo, holeMat);
        hole.position.set(offset, 0.35, 0.38);
        termGroup.add(hole);
      }

      pcbGroup.add(termGroup);
    };

    // Array of Green Terminal Blocks along perimeter (Reference Image 2)
    createTerminalBlock(-5.5, -4.5, 3);
    createTerminalBlock(-3.5, -4.5, 3);
    createTerminalBlock(-1.5, -4.5, 2);
    createTerminalBlock(0.5, -4.5, 2);
    createTerminalBlock(2.5, -4.5, 3);
    createTerminalBlock(4.5, -4.5, 3);

    // Left border terminal blocks
    createTerminalBlock(-6.4, 0.2, 2, Math.PI / 2);
    createTerminalBlock(-6.4, 2.0, 3, Math.PI / 2);
    createTerminalBlock(-6.4, 3.8, 2, Math.PI / 2);

    // Right bottom terminal block
    createTerminalBlock(5.8, 2.5, 2, -Math.PI / 2);

    // ==========================================
    // 4. 3x TACTILE PUSH BUTTONS (UP, DOWN, OK)
    // ==========================================
    const createTactileButton = (x: number, z: number) => {
      const btnGroup = new THREE.Group();
      btnGroup.position.set(x, 0.2, z);

      // Square metal body can
      const canGeo = new THREE.BoxGeometry(0.65, 0.25, 0.65);
      const can = new THREE.Mesh(canGeo, silverMat);
      can.position.y = 0.12;
      btnGroup.add(can);

      // Round black tactile plunger button
      const plungerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.18, 16);
      const plungerMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.3 });
      stateRef.current.materials.push(plungerMat);
      const plunger = new THREE.Mesh(plungerGeo, plungerMat);
      plunger.position.y = 0.28;
      btnGroup.add(plunger);

      // 4 gull-wing soldered legs
      const legGeo = new THREE.BoxGeometry(0.1, 0.05, 0.15);
      [
        [-0.32, -0.22],
        [-0.32, 0.22],
        [0.32, -0.22],
        [0.32, 0.22]
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, silverMat);
        leg.position.set(lx, 0.03, lz);
        btnGroup.add(leg);
      });

      pcbGroup.add(btnGroup);
    };

    createTactileButton(2.5, 3.8); // UP
    createTactileButton(3.7, 3.8); // DOWN
    createTactileButton(4.9, 3.8); // OK

    // ==========================================
    // 5. TO-220 POWER REGULATOR (LM7805 / Heat Tab)
    // ==========================================
    const to220Group = new THREE.Group();
    to220Group.position.set(-3.2, 0.2, 3.2);

    // Black plastic molded body
    const toBodyGeo = new THREE.BoxGeometry(1.0, 0.95, 0.45);
    const toBody = new THREE.Mesh(toBodyGeo, darkChipMat);
    toBody.position.y = 0.55;
    to220Group.add(toBody);

    // Shiny Aluminum Heat Sink Tab with hole
    const tabGeo = new THREE.BoxGeometry(1.0, 0.65, 0.12);
    const tab = new THREE.Mesh(tabGeo, silverMat);
    tab.position.set(0, 1.15, -0.16);
    to220Group.add(tab);

    // 3 Bent metallic lead pins
    for (let p = -1; p <= 1; p++) {
      const pinLead = new THREE.Mesh(pinGeo, silverMat);
      pinLead.position.set(p * 0.28, 0.1, 0);
      to220Group.add(pinLead);
    }
    pcbGroup.add(to220Group);

    // ==========================================
    // 6. MAIN MCU (STM32 QFP-100 Chip in Center)
    // ==========================================
    const mcuGroup = new THREE.Group();
    mcuGroup.position.set(0.2, 0.2, 0.8);

    const mcuBodyGeo = new THREE.BoxGeometry(2.2, 0.26, 2.2);
    const mcuBody = new THREE.Mesh(mcuBodyGeo, darkChipMat);
    mcuBody.position.y = 0.13;
    mcuGroup.add(mcuBody);

    // Laser engraved badge on MCU
    const mcuBadgeGeo = new THREE.PlaneGeometry(1.7, 1.7);
    const mcuBadgeCanvas = document.createElement('canvas');
    mcuBadgeCanvas.width = 512;
    mcuBadgeCanvas.height = 512;
    const bCtx = mcuBadgeCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#14181f';
      bCtx.fillRect(0, 0, 512, 512);
      bCtx.fillStyle = '#cbd5e1';
      bCtx.font = 'bold 38px Arial, sans-serif';
      bCtx.textAlign = 'center';
      bCtx.fillText('STM32F407VGT6', 256, 170);
      bCtx.font = '28px Arial, sans-serif';
      bCtx.fillText('ARM CORTEX-M4F', 256, 230);
      bCtx.fillText('168MHz / 1MB FLASH', 256, 290);
      bCtx.font = '24px Arial, sans-serif';
      bCtx.fillText('ARM ARCHITECTURE', 256, 350);
      // Pin 1 dot
      bCtx.beginPath();
      bCtx.arc(50, 50, 16, 0, Math.PI * 2);
      bCtx.fillStyle = '#ffffff';
      bCtx.fill();
    }
    const badgeTex = new THREE.CanvasTexture(mcuBadgeCanvas);
    const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTex });
    stateRef.current.materials.push(badgeMat);
    const badgeMesh = new THREE.Mesh(mcuBadgeGeo, badgeMat);
    badgeMesh.rotation.x = -Math.PI / 2;
    badgeMesh.position.y = 0.27;
    mcuGroup.add(badgeMesh);

    // QFP Metallic Pins along all 4 edges
    const qfpPinGeo = new THREE.BoxGeometry(0.06, 0.06, 0.25);
    const pinsPerSide = 12;
    for (let i = 0; i < pinsPerSide; i++) {
      const offset = (i - (pinsPerSide - 1) / 2) * 0.15;
      const pN = new THREE.Mesh(qfpPinGeo, silverMat);
      pN.position.set(offset, 0.08, 1.2);
      mcuGroup.add(pN);

      const pS = new THREE.Mesh(qfpPinGeo, silverMat);
      pS.position.set(offset, 0.08, -1.2);
      mcuGroup.add(pS);

      const pE = new THREE.Mesh(qfpPinGeo, silverMat);
      pE.rotation.y = Math.PI / 2;
      pE.position.set(1.2, 0.08, offset);
      mcuGroup.add(pE);

      const pW = new THREE.Mesh(qfpPinGeo, silverMat);
      pW.rotation.y = Math.PI / 2;
      pW.position.set(-1.2, 0.08, offset);
      mcuGroup.add(pW);
    }
    pcbGroup.add(mcuGroup);

    // ==========================================
    // 7. ALUMINUM ELECTROLYTIC RADIAL CAPACITORS
    // ==========================================
    const createElectrolyticCap = (x: number, z: number, height: number = 0.8, radius: number = 0.35) => {
      const capGroup = new THREE.Group();
      capGroup.position.set(x, 0.2, z);

      // Main dark metallic canister
      const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 20);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
      stateRef.current.materials.push(capMat);
      const body = new THREE.Mesh(bodyGeo, capMat);
      body.position.y = height / 2;
      capGroup.add(body);

      // Silver top bevel with stamped pressure relief cross
      const topGeo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 0.04, 20);
      const top = new THREE.Mesh(topGeo, silverMat);
      top.position.y = height + 0.02;
      capGroup.add(top);

      pcbGroup.add(capGroup);
    };

    createElectrolyticCap(-4.8, 2.5, 0.95, 0.4);
    createElectrolyticCap(-4.8, 3.6, 0.95, 0.4);
    createElectrolyticCap(-1.2, 3.5, 0.75, 0.3);

    // ==========================================
    // 8. REALISTIC SMD 0805 CERAMIC CAPS & RESISTORS
    // ==========================================
    const smdCapMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.3, metalness: 0.2 }); // Tan ceramic
    const smdResMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.3 }); // Black resistor
    stateRef.current.materials.push(smdCapMat, smdResMat);

    const smdBodyGeo = new THREE.BoxGeometry(0.24, 0.12, 0.18);
    const smdEndGeo = new THREE.BoxGeometry(0.06, 0.13, 0.19);

    const placeSMD = (x: number, z: number, isCap: boolean, rotY: number = 0) => {
      const g = new THREE.Group();
      g.position.set(x, 0.25, z);
      g.rotation.y = rotY;

      // Middle body
      const body = new THREE.Mesh(smdBodyGeo, isCap ? smdCapMat : smdResMat);
      g.add(body);

      // Silver solder fillets on both ends
      const end1 = new THREE.Mesh(smdEndGeo, silverMat);
      end1.position.x = -0.12;
      g.add(end1);

      const end2 = new THREE.Mesh(smdEndGeo, silverMat);
      end2.position.x = 0.12;
      g.add(end2);

      pcbGroup.add(g);
    };

    // Populate around MCU and power rails
    [
      [-1.3, 0.4, true, 0],
      [-1.3, 0.8, false, 0],
      [-1.3, 1.2, true, 0],
      [1.7, 0.4, true, 0],
      [1.7, 0.8, false, 0],
      [1.7, 1.2, false, 0],
      [0.2, -0.7, true, Math.PI / 2],
      [-0.4, -0.7, false, Math.PI / 2],
      [0.8, -0.7, true, Math.PI / 2],
      [0.2, 2.3, false, Math.PI / 2],
      [-0.4, 2.3, true, Math.PI / 2],
      [0.8, 2.3, false, Math.PI / 2],
      [-2.6, 2.4, true, 0],
      [-2.6, 2.8, false, 0],
      [-2.6, 3.2, true, 0],
      [2.5, 2.8, false, Math.PI / 2],
      [3.7, 2.8, false, Math.PI / 2],
      [4.9, 2.8, false, Math.PI / 2]
    ].forEach(([x, z, isCap, rot]) => {
      placeSMD(x as number, z as number, isCap as boolean, rot as number);
    });

    // ==========================================
    // 9. HIGH-TECH GLOWING BUS TRACKS & ELECTRONS
    // ==========================================
    const pulsesGroup = new THREE.Group();
    pcbGroup.add(pulsesGroup);

    const pulsePaths: THREE.Vector3[][] = [
      // ESP32 to Central MCU
      [
        new THREE.Vector3(-3.0, 0.22, -1.0),
        new THREE.Vector3(-1.5, 0.22, -0.2),
        new THREE.Vector3(0.2, 0.22, 0.8)
      ],
      // MCU to OLED Display
      [
        new THREE.Vector3(0.2, 0.22, 0.8),
        new THREE.Vector3(2.0, 0.22, 0.8),
        new THREE.Vector3(3.8, 0.22, 0.6)
      ],
      // Power Stage to MCU
      [
        new THREE.Vector3(-3.2, 0.22, 3.2),
        new THREE.Vector3(-1.0, 0.22, 2.0),
        new THREE.Vector3(0.2, 0.22, 0.8)
      ],
      // Buttons to MCU
      [
        new THREE.Vector3(3.7, 0.22, 3.8),
        new THREE.Vector3(2.0, 0.22, 2.4),
        new THREE.Vector3(0.2, 0.22, 0.8)
      ]
    ];

    const pulseParticleGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const pulseMatCyan = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const pulseMatGreen = new THREE.MeshBasicMaterial({ color: 0x00ff9c });
    stateRef.current.materials.push(pulseMatCyan, pulseMatGreen);

    const activePulseMeshes: { mesh: THREE.Mesh; path: THREE.Vector3[]; progress: number; speed: number }[] = [];

    pulsePaths.forEach((path, i) => {
      for (let p = 0; p < 4; p++) {
        const pMesh = new THREE.Mesh(pulseParticleGeo, i % 2 === 0 ? pulseMatCyan : pulseMatGreen);
        pulsesGroup.add(pMesh);
        activePulseMeshes.push({
          mesh: pMesh,
          path,
          progress: (p / 4) + (i * 0.15),
          speed: 0.006 + (i * 0.001)
        });
      }
    });

    // ==========================================
    // 10. DIAGNOSTIC SMDs & PULSING TELEMETRY LEDS
    // ==========================================
    const ledGeo = new THREE.BoxGeometry(0.22, 0.12, 0.16);
    const leds = [
      { x: -5.8, z: -3.8, color: 0x00ff9c, speed: 0 },   // 5V Power OK (Steady)
      { x: -5.4, z: -3.8, color: 0x00bfff, speed: 8 },   // RX Activity
      { x: -5.0, z: -3.8, color: 0xf59e0b, speed: 6 },   // TX Activity
      { x: -4.6, z: -3.8, color: 0x10b981, speed: 2 }    // Heartbeat
    ];

    leds.forEach((led, idx) => {
      const ledMat = new THREE.MeshBasicMaterial({ color: led.color });
      stateRef.current.materials.push(ledMat);
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(led.x, 0.25, led.z);
      pcbGroup.add(ledMesh);

      const pLight = new THREE.PointLight(led.color, 1.1, 2.0);
      pLight.position.set(led.x, 0.38, led.z);
      pcbGroup.add(pLight);

      stateRef.current.ledLights.push({
        light: pLight,
        mesh: ledMesh,
        phase: idx * 1.4,
        speed: led.speed
      });
    });

    // --- Interactive Mouse Handlers ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      stateRef.current.targetMouse.set(x, y);
    };

    // Clicking directly on the 3D PCB board zooms inside to Dashboard
    const handleCanvasClick = () => {
      if (isTransitioning) return;
      triggerEntryTransition();
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleCanvasClick);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let clock = new THREE.Clock();

    const animate = () => {
      stateRef.current.reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse Parallax Lerp
      stateRef.current.mouse.lerp(stateRef.current.targetMouse, 0.08);

      // Realistic 3D Gyro Floating Tilt
      if (!isTransitioning && autoRotate) {
        pcbGroup.rotation.y = Math.sin(elapsedTime * 0.35) * 0.12 + (stateRef.current.mouse.x * 0.28);
        pcbGroup.rotation.x = 0.28 + Math.cos(elapsedTime * 0.28) * 0.05 + (-stateRef.current.mouse.y * 0.22);
        pcbGroup.position.y = Math.sin(elapsedTime * 0.75) * 0.12;
      }

      // Smooth Camera Transitions
      stateRef.current.currentCamPos.lerp(stateRef.current.targetCamPos, 0.045);
      stateRef.current.currentLookAt.lerp(stateRef.current.targetLookAt, 0.045);
      camera.position.copy(stateRef.current.currentCamPos);
      camera.lookAt(stateRef.current.currentLookAt);

      // Animate Diagnostic LEDs
      stateRef.current.ledLights.forEach(item => {
        if (item.speed === 0) {
          item.light.intensity = 1.0 + Math.sin(elapsedTime * 10) * 0.06;
        } else {
          const val = Math.sin(elapsedTime * item.speed + item.phase);
          item.light.intensity = val > 0.45 ? 1.6 : 0.05;
        }
      });

      // Animate Traveling Electron Pulses
      activePulseMeshes.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1.0) p.progress = 0;

        const numSegments = p.path.length - 1;
        const segmentFloat = p.progress * numSegments;
        const segIdx = Math.floor(segmentFloat);
        const segT = segmentFloat - segIdx;

        if (segIdx < numSegments) {
          const p1 = p.path[segIdx];
          const p2 = p.path[segIdx + 1];
          p.mesh.position.lerpVectors(p1, p2, segT);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (stateRef.current.reqId) cancelAnimationFrame(stateRef.current.reqId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleCanvasClick);

      renderer.dispose();
      stateRef.current.materials.forEach(m => m.dispose());
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Cinematic Deep Zoom into the PCB Board & Transition to Dashboard
  const triggerEntryTransition = () => {
    setIsTransitioning(true);
    sound.playCapacitorCharge();
    sound.playTelemetryBurst();

    // Camera zooms deep down into the central MCU & copper tracks
    stateRef.current.targetCamPos.set(0.2, 0.7, 1.3);
    stateRef.current.targetLookAt.set(0.2, 0.2, 0.8);

    if (stateRef.current.pcbBoard) {
      stateRef.current.pcbBoard.rotation.x = 0.45;
      stateRef.current.pcbBoard.rotation.y = 0.15;
    }

    setTimeout(() => {
      onEnterPortfolio();
      setIsTransitioning(false);
    }, 1150);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleWireframe = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !wireframeMode;
    setWireframeMode(next);
    stateRef.current.materials.forEach(m => {
      if ('wireframe' in m) {
        (m as THREE.MeshStandardMaterial).wireframe = next;
      }
    });
    sound.playRelayClick();
  };

  const handleToggleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAutoRotate(!autoRotate);
    sound.playRelayClick();
  };

  const handleResetCam = (e: React.MouseEvent) => {
    e.stopPropagation();
    stateRef.current.targetCamPos.set(0, 8.5, 12.5);
    stateRef.current.targetLookAt.set(0, 0, 0);
    sound.playRelayClick();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#06090e]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-pointer" />

      {/* Cyberpunk HUD Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none pcb-blueprint-grid opacity-25" />

      {/* Top Telemetry Header */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3 bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg shadow-lg">
          <Cpu className="w-5 h-5 text-white animate-pulse" />
          <div>
            <div className="text-sm font-bold text-white tracking-wide">
              SYS::MOTHERBOARD_V4.2
            </div>
            <div className="text-xs text-zinc-400 font-normal">
              Click board directly to zoom inside
            </div>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="flex items-center space-x-2">
          {isInspecting && onCloseInspect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseInspect();
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow"
            >
              Return to Profile
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
