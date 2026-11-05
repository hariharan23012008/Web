import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/audio';
import { Cpu, Eye, RotateCw, Volume2, VolumeX, Sparkles, Layers, Zap } from 'lucide-react';

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
    ledLights: { light: THREE.PointLight; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; phase: number; speed: number; pattern: 'steady' | 'blink' | 'burst' | 'heartbeat' }[];
    activeSparks: { mesh: THREE.Mesh; path: THREE.Vector3[]; progress: number; speed: number }[];
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
    activeSparks: [],
    materials: [],
    targetCamPos: new THREE.Vector3(0, 9.5, 12.0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentCamPos: new THREE.Vector3(0, 9.5, 12.0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    mouse: new THREE.Vector2(0, 0),
    targetMouse: new THREE.Vector2(0, 0)
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070a);
    scene.fog = new THREE.FogExp2(0x05070a, 0.018);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 9.5, 12.0);
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
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;

    // --- 2. Studio Lighting for High-Contrast Black PCB & Metallic Traces ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Key directional light for crisp reflections off solder joints, pins and the STM32 package
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 15, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0003;
    scene.add(keyLight);

    // Electric Cyan & Emerald Rim Lighting for futuristic circuit aesthetics
    const cyanRim = new THREE.DirectionalLight(0x00e5ff, 1.4);
    cyanRim.position.set(-9, 10, -7);
    scene.add(cyanRim);

    const emeraldRim = new THREE.DirectionalLight(0x10b981, 1.2);
    emeraldRim.position.set(9, -4, -6);
    scene.add(emeraldRim);

    // Dynamic Board Under-Glow
    const underGlow = new THREE.PointLight(0x00ffff, 1.4, 20);
    underGlow.position.set(0, -3.2, 0);
    scene.add(underGlow);

    // --- 3. Construct Main STM32 Board using the Clean User Picture ---
    const pcbGroup = new THREE.Group();
    scene.add(pcbGroup);
    stateRef.current.pcbBoard = pcbGroup;

    // Aspect ratio matches 1024x768 (1.333)
    const boardWidth = 14.0;
    const boardLength = 10.5;
    const boardThickness = 0.38;
    const boardGeo = new THREE.BoxGeometry(boardWidth, boardThickness, boardLength);

    // Matte Black FR4 core edge material with subtle metallic sheen
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x121418,
      roughness: 0.45,
      metalness: 0.3
    });

    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.5,
      metalness: 0.2
    });

    const topMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.35,
      transparent: true
    });

    stateRef.current.materials.push(edgeMat, bottomMat, topMat);

    // Load STM32 Board Texture with White-Background Transparency Keying
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('./stm32-board.jpg', (rawTexture) => {
      try {
        const img = rawTexture.image;
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1024;
        canvas.height = img.height || 768;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;

          // Bump map canvas
          const bumpCanvas = document.createElement('canvas');
          bumpCanvas.width = canvas.width;
          bumpCanvas.height = canvas.height;
          const bCtx = bumpCanvas.getContext('2d')!;
          const bData = bCtx.createImageData(canvas.width, canvas.height);

          // Metalness canvas
          const metalCanvas = document.createElement('canvas');
          metalCanvas.width = canvas.width;
          metalCanvas.height = canvas.height;
          const mCtx = metalCanvas.getContext('2d')!;
          const mData = mCtx.createImageData(canvas.width, canvas.height);

          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            // Remove outer white background from image corners with soft edge feathering
            if (r > 242 && g > 242 && b > 242) {
              d[i + 3] = 0; // Pure transparent background
            } else if (r > 220 && g > 220 && b > 220) {
              const alpha = Math.max(0, Math.min(255, (255 - lum) * 8));
              d[i + 3] = alpha;
            }

            // Height Bump Mapping: Pins, crystal, battery holder & IC stand out
            const isMetal = lum > 140 && Math.abs(r - b) < 40;
            const isChip = lum < 60;
            const elev = isChip ? 190 : (isMetal ? 245 : lum * 0.45);
            bData.data[i] = elev;
            bData.data[i + 1] = elev;
            bData.data[i + 2] = elev;
            bData.data[i + 3] = d[i + 3];

            // Metalness: Solder joints, silver crystal can and gold pins reflect intensely
            const metalVal = isMetal ? 245 : 30;
            mData.data[i] = metalVal;
            mData.data[i + 1] = metalVal;
            mData.data[i + 2] = metalVal;
            mData.data[i + 3] = d[i + 3];
          }

          ctx.putImageData(imgData, 0, 0);
          bCtx.putImageData(bData, 0, 0);
          mCtx.putImageData(mData, 0, 0);

          const cleanTexture = new THREE.CanvasTexture(canvas);
          cleanTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          cleanTexture.colorSpace = THREE.SRGBColorSpace;
          topMat.map = cleanTexture;

          const bumpTex = new THREE.CanvasTexture(bumpCanvas);
          const metalTex = new THREE.CanvasTexture(metalCanvas);
          topMat.bumpMap = bumpTex;
          topMat.bumpScale = 0.12;
          topMat.metalnessMap = metalTex;
          topMat.needsUpdate = true;
        }
      } catch (err) {
        console.warn('Canvas texture processing fallback', err);
        rawTexture.colorSpace = THREE.SRGBColorSpace;
        topMat.map = rawTexture;
        topMat.needsUpdate = true;
      }
    });

    const boxMaterials = [edgeMat, edgeMat, topMat, bottomMat, edgeMat, edgeMat];
    const boardMesh = new THREE.Mesh(boardGeo, boxMaterials);
    boardMesh.receiveShadow = true;
    boardMesh.castShadow = true;
    pcbGroup.add(boardMesh);

    // Corner Mounting Rings in Gold & Silver
    const ringGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.40, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const holeGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.42, 24);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
    stateRef.current.materials.push(ringMat, holeMat);

    [
      [-boardWidth / 2 + 0.75, -boardLength / 2 + 0.75],
      [boardWidth / 2 - 0.75, -boardLength / 2 + 0.75],
      [-boardWidth / 2 + 0.75, boardLength / 2 - 0.75],
      [boardWidth / 2 - 0.75, boardLength / 2 - 0.75]
    ].forEach(([cx, cz]) => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(cx, 0, cz);
      pcbGroup.add(ring);

      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(cx, 0, cz);
      pcbGroup.add(hole);
    });

    // ========================================================
    // 4. "SPARK LINES ARE RUN IN THE BOARD" (Animated Energy Traces)
    // ========================================================
    const sparkLinesGroup = new THREE.Group();
    pcbGroup.add(sparkLinesGroup);

    // Multi-segment circuit routes running across the STM32 board
    const sparkPaths: THREE.Vector3[][] = [
      // 1. Shrouded JTAG Header to Central STM32 MCU
      [
        new THREE.Vector3(2.5, 0.23, -3.6),
        new THREE.Vector3(1.6, 0.23, -2.4),
        new THREE.Vector3(0.8, 0.23, -1.2),
        new THREE.Vector3(0.0, 0.23, 0.0)
      ],
      // 2. Crystal Oscillators to STM32 Clock Inputs
      [
        new THREE.Vector3(-0.6, 0.23, -1.8),
        new THREE.Vector3(-0.4, 0.23, -1.0),
        new THREE.Vector3(0.0, 0.23, -0.3)
      ],
      // 3. STM32 MCU to Flash Memory Chip
      [
        new THREE.Vector3(-0.3, 0.23, 0.1),
        new THREE.Vector3(-1.4, 0.23, 0.1),
        new THREE.Vector3(-2.6, 0.23, 0.2)
      ],
      // 4. STM32 MCU to Right Dual-Row Pin Header Bus
      [
        new THREE.Vector3(0.4, 0.23, 0.2),
        new THREE.Vector3(2.0, 0.23, 0.8),
        new THREE.Vector3(3.6, 0.23, 1.4),
        new THREE.Vector3(4.8, 0.23, 1.8)
      ],
      // 5. STM32 MCU to Left Dual-Row Pin Header Bus
      [
        new THREE.Vector3(-0.3, 0.23, -0.2),
        new THREE.Vector3(-2.2, 0.23, -1.0),
        new THREE.Vector3(-3.8, 0.23, -1.8),
        new THREE.Vector3(-4.8, 0.23, -2.0)
      ],
      // 6. Coin Cell Battery (RTC Backup) to STM32 Core
      [
        new THREE.Vector3(-1.1, 0.23, 2.3),
        new THREE.Vector3(-0.6, 0.23, 1.4),
        new THREE.Vector3(-0.1, 0.23, 0.4)
      ],
      // 7. Micro SD / USB Header to Bus Hub
      [
        new THREE.Vector3(4.6, 0.23, -2.4),
        new THREE.Vector3(3.2, 0.23, -1.8),
        new THREE.Vector3(1.5, 0.23, -0.8),
        new THREE.Vector3(0.2, 0.23, 0.0)
      ]
    ];

    // Build glowing electric circuit line tracks on the board
    sparkPaths.forEach((pathPoints, pIdx) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
      const isCyan = pIdx % 2 === 0;
      const trackMat = new THREE.LineBasicMaterial({
        color: isCyan ? 0x00ffff : 0x10b981,
        transparent: true,
        opacity: 0.55
      });
      stateRef.current.materials.push(trackMat);
      const lineMesh = new THREE.Line(lineGeo, trackMat);
      sparkLinesGroup.add(lineMesh);
    });

    // Active Traveling Energy Sparks with Glowing Light Bulbs
    const sparkGeo = new THREE.SphereGeometry(0.09, 10, 10);
    const sparkMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const sparkMatEmerald = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const sparkMatAmber = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    stateRef.current.materials.push(sparkMatCyan, sparkMatEmerald, sparkMatAmber);

    sparkPaths.forEach((path, i) => {
      // 3 to 4 sparks per line track
      const sparksPerLine = 3;
      for (let s = 0; s < sparksPerLine; s++) {
        let mat = sparkMatCyan;
        if (i % 3 === 1) mat = sparkMatEmerald;
        if (i % 3 === 2) mat = sparkMatAmber;

        const sparkMesh = new THREE.Mesh(sparkGeo, mat);
        sparkLinesGroup.add(sparkMesh);

        stateRef.current.activeSparks.push({
          mesh: sparkMesh,
          path,
          progress: (s / sparksPerLine) + (i * 0.12),
          speed: 0.005 + (i * 0.0012)
        });
      }
    });

    // ========================================================
    // 5. "AND LIGHT ARE BLINK" (Pulsing SMD Diagnostic LEDs)
    // ========================================================
    const ledSpecs: {
      x: number;
      z: number;
      color: number;
      speed: number;
      pattern: 'steady' | 'blink' | 'burst' | 'heartbeat';
      name: string;
    }[] = [
      { x: -4.2, z: -3.0, color: 0x10b981, speed: 0, pattern: 'steady', name: 'PWR (3V3 Ready)' },        // Green Power LED
      { x: -3.0, z: -2.2, color: 0x00e5ff, speed: 7, pattern: 'burst', name: 'TX Activity (SPI)' },        // Cyan High-Speed Packet Burst
      { x: -2.5, z: -2.2, color: 0xf59e0b, speed: 6, pattern: 'burst', name: 'RX Activity (UART)' },       // Amber Data Burst
      { x: 1.8, z: -2.8, color: 0x3b82f6, speed: 2, pattern: 'heartbeat', name: 'CPU Kernel Heartbeat' }, // Blue Heartbeat
      { x: -1.6, z: 3.4, color: 0xef4444, speed: 4, pattern: 'blink', name: 'User LED / D2' }             // Red User Alert Blink
    ];

    const ledPackageGeo = new THREE.BoxGeometry(0.24, 0.12, 0.16);

    ledSpecs.forEach((spec, idx) => {
      const ledMat = new THREE.MeshStandardMaterial({
        color: spec.color,
        emissive: new THREE.Color(spec.color),
        emissiveIntensity: 1.6,
        roughness: 0.2,
        metalness: 0.1
      });
      stateRef.current.materials.push(ledMat);

      const ledMesh = new THREE.Mesh(ledPackageGeo, ledMat);
      ledMesh.position.set(spec.x, boardThickness / 2 + 0.06, spec.z);
      pcbGroup.add(ledMesh);

      // Dedicated PointLight casting real colored light onto the surrounding PCB traces
      const pLight = new THREE.PointLight(spec.color, 1.2, 2.2);
      pLight.position.set(spec.x, boardThickness / 2 + 0.16, spec.z);
      pcbGroup.add(pLight);

      stateRef.current.ledLights.push({
        light: pLight,
        mesh: ledMesh,
        mat: ledMat,
        phase: idx * 1.6,
        speed: spec.speed,
        pattern: spec.pattern
      });
    });

    // --- 6. Interactive Mouse Gyro Handlers ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      stateRef.current.targetMouse.set(x, y);
    };

    // Clicking anywhere on the 3D board triggers zoom and dashboard entry
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

    // --- 7. Animation Loop with Live Sparks & Blinking Lights ---
    let clock = new THREE.Clock();

    const animate = () => {
      stateRef.current.reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse Parallax Lerp
      stateRef.current.mouse.lerp(stateRef.current.targetMouse, 0.08);

      // Gyroscopic Floating Board Motion
      if (!isTransitioning && autoRotate) {
        pcbGroup.rotation.y = Math.sin(elapsedTime * 0.35) * 0.16 + (stateRef.current.mouse.x * 0.32);
        pcbGroup.rotation.x = 0.28 + Math.cos(elapsedTime * 0.28) * 0.06 + (-stateRef.current.mouse.y * 0.26);
        pcbGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.15;
      }

      // Smooth Camera Transitions
      stateRef.current.currentCamPos.lerp(stateRef.current.targetCamPos, 0.045);
      stateRef.current.currentLookAt.lerp(stateRef.current.targetLookAt, 0.045);
      camera.position.copy(stateRef.current.currentCamPos);
      camera.lookAt(stateRef.current.currentLookAt);

      // --- ANIMATE BLINKING LIGHTS ("light are blink") ---
      stateRef.current.ledLights.forEach(item => {
        let intensity = 1.0;

        if (item.pattern === 'steady') {
          // Steady power with subtle analog ripple
          intensity = 1.0 + Math.sin(elapsedTime * 12) * 0.08;
        } else if (item.pattern === 'heartbeat') {
          // Double pulse heartbeat (every 1 sec)
          const cycle = (elapsedTime * 1.5 + item.phase) % (Math.PI * 2);
          const pulse1 = Math.max(0, Math.sin(cycle * 3));
          const pulse2 = Math.max(0, Math.sin((cycle - 0.5) * 3));
          intensity = (pulse1 > 0.4 || pulse2 > 0.4) ? 2.2 : 0.08;
        } else if (item.pattern === 'burst') {
          // High-frequency telemetry packet burst
          const raw = Math.sin(elapsedTime * item.speed + item.phase);
          const noise = Math.sin(elapsedTime * 23.5);
          intensity = (raw > 0.3 && noise > 0) ? 2.4 : 0.06;
        } else if (item.pattern === 'blink') {
          // Classic crisp digital flash
          const pulse = Math.sin(elapsedTime * item.speed + item.phase);
          intensity = pulse > 0.2 ? 2.0 : 0.05;
        }

        item.light.intensity = intensity;
        item.mat.emissiveIntensity = intensity * 1.4;
      });

      // --- ANIMATE TRAVELING SPARK LINES ("spark line are run in the board") ---
      stateRef.current.activeSparks.forEach(spark => {
        spark.progress += spark.speed;
        if (spark.progress > 1.0) spark.progress = 0;

        const numSegments = spark.path.length - 1;
        const segmentFloat = spark.progress * numSegments;
        const segIdx = Math.floor(segmentFloat);
        const segT = segmentFloat - segIdx;

        if (segIdx < numSegments) {
          const p1 = spark.path[segIdx];
          const p2 = spark.path[segIdx + 1];
          spark.mesh.position.lerpVectors(p1, p2, segT);
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

  // Cinematic Deep Zoom into the STM32 Board & Transition to Dashboard
  const triggerEntryTransition = () => {
    setIsTransitioning(true);
    sound.playCapacitorCharge();
    sound.playTelemetryBurst();

    // Camera zooms straight down into the central STM32 chip
    stateRef.current.targetCamPos.set(0, 1.1, 1.3);
    stateRef.current.targetLookAt.set(0, 0, 0.1);

    if (stateRef.current.pcbBoard) {
      stateRef.current.pcbBoard.rotation.x = 0.45;
      stateRef.current.pcbBoard.rotation.y = 0.08;
    }

    setTimeout(() => {
      onEnterPortfolio();
      setIsTransitioning(false);
    }, 1100);
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

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#05070a]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-pointer" />

      {/* Subtle Background Blueprint Grid */}
      <div className="absolute inset-0 pointer-events-none pcb-blueprint-grid opacity-20" />

      {/* Top Header Badge */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3 bg-zinc-950/85 backdrop-blur-md border border-zinc-700/80 px-4 py-2 rounded-xl shadow-xl">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>STM32F4xx Development Board</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="text-xs text-zinc-400 font-normal flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <Zap className="w-3 h-3" /> Live Sparks Running
              </span>
              <span>•</span>
              <span>Click board to enter Dashboard</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Audio Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all shadow-md"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={handleToggleRotate}
            className={`p-2.5 rounded-xl border transition-all shadow-md ${
              autoRotate
                ? 'bg-zinc-900/80 border-cyan-500/80 text-cyan-400'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Gyroscopic 3D Tilt"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Wireframe View */}
          <button
            onClick={handleToggleWireframe}
            className={`p-2.5 rounded-xl border transition-all shadow-md ${
              wireframeMode
                ? 'bg-zinc-900/80 border-cyan-500/80 text-cyan-400'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Wireframe CAD Mode"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Enter Dashboard Direct Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerEntryTransition();
            }}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <span>Enter Dashboard</span>
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Center Touch Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-5 py-2 rounded-full bg-zinc-950/85 backdrop-blur-md border border-zinc-700/80 text-xs font-semibold text-zinc-300 shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click anywhere on the STM32 board to enter</span>
        </div>
      </div>

    </div>
  );
};
