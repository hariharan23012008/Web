import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/audio';
import { Cpu, Eye, RotateCw, Volume2, VolumeX, Sparkles, Layers } from 'lucide-react';

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
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.02);

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

    // --- 2. Studio Lighting for Metallic Traces & Solder Pads ---
    const ambientLight = new THREE.AmbientLight(0xe2e8f0, 1.4);
    scene.add(ambientLight);

    // Key directional light for crisp specular glints off solder joints
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(8, 14, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0003;
    scene.add(keyLight);

    // Warm copper/gold rim light
    const rimLight = new THREE.DirectionalLight(0x34d399, 1.3);
    rimLight.position.set(-8, 9, -6);
    scene.add(rimLight);

    // Soft under-glow
    const underGlow = new THREE.PointLight(0x059669, 1.2, 16);
    underGlow.position.set(0, -3.5, 0);
    scene.add(underGlow);

    // --- 3. Construct Main PCB Board using the Real Board Photo ---
    const pcbGroup = new THREE.Group();
    scene.add(pcbGroup);
    stateRef.current.pcbBoard = pcbGroup;

    // Real PCB Dimensions based on aspect ratio of the user photo (412 / 321 = 1.283)
    const boardWidth = 14.2;
    const boardLength = 11.0;
    const boardThickness = 0.35;
    const boardGeo = new THREE.BoxGeometry(boardWidth, boardThickness, boardLength);

    // Materials for the 6 faces: [right, left, top, bottom, front, back]
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x0f4229, // dark FR4 core resin
      roughness: 0.5,
      metalness: 0.2
    });

    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // dark emerald green solder mask
      roughness: 0.35,
      metalness: 0.15
    });

    const topMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.22
    });

    stateRef.current.materials.push(edgeMat, bottomMat, topMat);

    // Load High-Resolution Real PCB Photo Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('./real-pcb-texture.jpg', (texture) => {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.colorSpace = THREE.SRGBColorSpace;
      topMat.map = texture;

      // Generate dynamic Bump and Specular/Metalness Maps directly from the image data
      try {
        const img = texture.image;
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 512;
        canvas.height = img.height || 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;

          const bumpCanvas = document.createElement('canvas');
          bumpCanvas.width = canvas.width;
          bumpCanvas.height = canvas.height;
          const bCtx = bumpCanvas.getContext('2d')!;
          const bData = bCtx.createImageData(canvas.width, canvas.height);

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

            // Solder joints and shiny pins: high brightness, low green dominance
            const isSolder = lum > 140 && Math.abs(r - b) < 40;
            const isChip = lum < 65;

            // Bump map elevation: solder pads and components raise up
            const elev = isChip ? 180 : (isSolder ? 230 : lum * 0.45);
            bData.data[i] = elev;
            bData.data[i + 1] = elev;
            bData.data[i + 2] = elev;
            bData.data[i + 3] = 255;

            // Metalness map: solder pads, cans, and leads shine with metallic reflections
            const metalVal = isSolder ? 235 : 25;
            mData.data[i] = metalVal;
            mData.data[i + 1] = metalVal;
            mData.data[i + 2] = metalVal;
            mData.data[i + 3] = 255;
          }

          bCtx.putImageData(bData, 0, 0);
          mCtx.putImageData(mData, 0, 0);

          const bumpTex = new THREE.CanvasTexture(bumpCanvas);
          const metalTex = new THREE.CanvasTexture(metalCanvas);
          topMat.bumpMap = bumpTex;
          topMat.bumpScale = 0.09;
          topMat.metalnessMap = metalTex;
          topMat.needsUpdate = true;
        }
      } catch (err) {
        console.warn('Canvas texture analysis fallback', err);
      }

      topMat.needsUpdate = true;
    });

    const boxMaterials = [edgeMat, edgeMat, topMat, bottomMat, edgeMat, edgeMat];
    const boardMesh = new THREE.Mesh(boardGeo, boxMaterials);
    boardMesh.receiveShadow = true;
    boardMesh.castShadow = true;
    pcbGroup.add(boardMesh);

    // --- 4. Authentic Corner Mounting Holes with Annular Gold Rings ---
    const ringGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.37, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.15 });
    const holeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.39, 24);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x06090e });
    stateRef.current.materials.push(ringMat, holeMat);

    const cornerOffsets = [
      [-boardWidth / 2 + 0.8, -boardLength / 2 + 0.8],
      [boardWidth / 2 - 0.8, -boardLength / 2 + 0.8],
      [-boardWidth / 2 + 0.8, boardLength / 2 - 0.8],
      [boardWidth / 2 - 0.8, boardLength / 2 - 0.8]
    ];

    cornerOffsets.forEach(([cx, cz]) => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(cx, 0, cz);
      pcbGroup.add(ring);

      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(cx, 0, cz);
      pcbGroup.add(hole);
    });

    // --- 5. Interactive Micro Diagnostic LEDs (Subtle, Real SMD Scale) ---
    const ledPoints = [
      { x: -1.2, z: 0.5, color: 0x00ff9c, speed: 0 },    // Power OK (Emerald Green)
      { x: 3.2, z: -0.2, color: 0x38bdf8, speed: 7 },    // Clock / SPI Activity (Cyan)
      { x: 0.4, z: 2.1, color: 0xf59e0b, speed: 5 },     // Data Sync (Amber)
      { x: 2.8, z: 3.2, color: 0xef4444, speed: 2 }      // Heartbeat pulse (Red)
    ];

    const ledMeshGeo = new THREE.BoxGeometry(0.18, 0.08, 0.14);

    ledPoints.forEach((pt, idx) => {
      const lMat = new THREE.MeshBasicMaterial({ color: pt.color });
      stateRef.current.materials.push(lMat);
      const lMesh = new THREE.Mesh(ledMeshGeo, lMat);
      lMesh.position.set(pt.x, boardThickness / 2 + 0.04, pt.z);
      pcbGroup.add(lMesh);

      const pLight = new THREE.PointLight(pt.color, 0.9, 1.8);
      pLight.position.set(pt.x, boardThickness / 2 + 0.12, pt.z);
      pcbGroup.add(pLight);

      stateRef.current.ledLights.push({
        light: pLight,
        mesh: lMesh,
        phase: idx * 1.5,
        speed: pt.speed
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
        pcbGroup.rotation.y = Math.sin(elapsedTime * 0.35) * 0.15 + (stateRef.current.mouse.x * 0.32);
        pcbGroup.rotation.x = 0.25 + Math.cos(elapsedTime * 0.28) * 0.06 + (-stateRef.current.mouse.y * 0.25);
        pcbGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.14;
      }

      // Smooth Camera Transitions
      stateRef.current.currentCamPos.lerp(stateRef.current.targetCamPos, 0.045);
      stateRef.current.currentLookAt.lerp(stateRef.current.targetLookAt, 0.045);
      camera.position.copy(stateRef.current.currentCamPos);
      camera.lookAt(stateRef.current.currentLookAt);

      // Animate Diagnostic Micro-LEDs
      stateRef.current.ledLights.forEach(item => {
        if (item.speed === 0) {
          item.light.intensity = 0.8 + Math.sin(elapsedTime * 8) * 0.08;
        } else {
          const val = Math.sin(elapsedTime * item.speed + item.phase);
          item.light.intensity = val > 0.45 ? 1.4 : 0.08;
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

  // Cinematic Deep Zoom into the Real PCB Board & Transition to Dashboard
  const triggerEntryTransition = () => {
    setIsTransitioning(true);
    sound.playCapacitorCharge();
    sound.playTelemetryBurst();

    // Camera zooms deep down into the center of the board
    stateRef.current.targetCamPos.set(0, 1.2, 1.5);
    stateRef.current.targetLookAt.set(0, 0, 0);

    if (stateRef.current.pcbBoard) {
      stateRef.current.pcbBoard.rotation.x = 0.45;
      stateRef.current.pcbBoard.rotation.y = 0.1;
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

  const handleResetCam = (e: React.MouseEvent) => {
    e.stopPropagation();
    stateRef.current.targetCamPos.set(0, 9.5, 12.0);
    stateRef.current.targetLookAt.set(0, 0, 0);
    sound.playRelayClick();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#06090e]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-pointer" />

      {/* Subtle Background Blueprint Grid */}
      <div className="absolute inset-0 pointer-events-none pcb-blueprint-grid opacity-20" />

      {/* Top Header Badge */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-700/80 px-4 py-2 rounded-xl shadow-xl">
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Interactive 3D PCB View</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-xs text-zinc-400 font-normal">
              Touch or click anywhere on the board to enter Dashboard
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
                ? 'bg-zinc-900/80 border-emerald-500/80 text-emerald-400'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Gyroscopic 3D Rotation"
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
        <div className="px-5 py-2 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-700/80 text-xs font-semibold text-zinc-300 shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click anywhere on the PCB board to enter</span>
        </div>
      </div>

    </div>
  );
};
