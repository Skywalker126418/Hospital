import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { RotateCw, ZoomIn, ZoomOut, RefreshCcw, Maximize2, Minimize2, Eye, Activity } from 'lucide-react';
import { Model3DErrorBoundary, ModelLoadingPlaceholder } from './ModelLoader';

const MedicalObjectViewer = ({
  children,
  title = 'Interactive Medical Visualizer',
  badge = 'Interactive Visualizer',
  height = 'h-80 md:h-96',
  allowWireframe = false,
  onReset,
  extraControls,
}) => {
  const controlsRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef();

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    if (onReset) onReset();
  };

  const handleZoom = (delta) => {
    if (controlsRef.current) {
      const cam = controlsRef.current.object;
      cam.position.multiplyScalar(delta);
      controlsRef.current.update();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col`}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white tracking-wide">{title}</span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {badge}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* 3D WebGL Canvas with Error Boundary and Suspense */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Model3DErrorBoundary>
          <Suspense fallback={<ModelLoadingPlaceholder />}>
            <Canvas
              camera={{ position: [0, 1.5, 4.5], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
              <directionalLight position={[-5, -2, -5]} intensity={0.4} color="#38bdf8" />
              <pointLight position={[0, 0, 2]} intensity={0.5} color="#ffffff" />

              {children}

              <ContactShadows
                position={[0, -1.2, 0]}
                opacity={0.4}
                scale={6}
                blur={1.5}
                far={4}
              />
              <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.05}
                minDistance={1.5}
                maxDistance={8}
                maxPolarAngle={Math.PI / 1.7}
              />
            </Canvas>
          </Suspense>
        </Model3DErrorBoundary>
      </div>

      {/* Floating Bottom Toolbar Controls */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 pointer-events-auto shadow-lg">
          <button
            onClick={() => handleZoom(0.85)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(1.15)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Reset Camera"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {extraControls && (
          <div className="pointer-events-auto flex items-center gap-2">
            {extraControls}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalObjectViewer;
