import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const HeartModel = ({
  wireframe = false,
  isPulsing = true,
  bpm = 72,
  onOrganSelect,
}) => {
  const heartGroup = useRef();
  const leftVentricle = useRef();
  const rightVentricle = useRef();
  const aorta = useRef();

  // Heartbeat animation frame
  useFrame((state, delta) => {
    if (!heartGroup.current) return;

    if (isPulsing) {
      // 4D cardiac cycle simulation
      const time = state.clock.getElapsedTime();
      const frequency = (bpm / 60) * Math.PI * 2;
      // Cardiac dual beat (lub-dub) wave: sin(t) + 0.3*sin(2t)
      const pulse = 1 + Math.sin(time * frequency) * 0.08 + Math.sin(time * frequency * 2) * 0.04;
      heartGroup.current.scale.set(pulse, pulse, pulse);
    }

    // Subtle gentle idle rotation
    heartGroup.current.rotation.y += delta * 0.15;
  });

  return (
    <group
      ref={heartGroup}
      onClick={(e) => {
        e.stopPropagation();
        if (onOrganSelect) onOrganSelect('Human Cardiac Muscle & Aortic Arch');
      }}
    >
      {/* Central Ventricle Left (Oxygenated - Deep Crimson) */}
      <mesh
        ref={leftVentricle}
        position={[-0.35, -0.2, 0]}
        rotation={[0, 0, Math.PI / 10]}
      >
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color={wireframe ? '#38bdf8' : '#e11d48'}
          roughness={0.3}
          metalness={0.2}
          wireframe={wireframe}
          emissive={wireframe ? '#0284c7' : '#881337'}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Ventricle Right (Deoxygenated - Indigo Crimson) */}
      <mesh
        ref={rightVentricle}
        position={[0.35, -0.1, 0.1]}
        rotation={[0, 0, -Math.PI / 12]}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={wireframe ? '#38bdf8' : '#be123c'}
          roughness={0.3}
          metalness={0.2}
          wireframe={wireframe}
        />
      </mesh>

      {/* Aorta Arch Curved Tube */}
      <mesh ref={aorta} position={[0, 0.7, -0.1]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.45, 0.18, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={wireframe ? '#7dd3fc' : '#dc2626'}
          roughness={0.25}
          metalness={0.4}
          wireframe={wireframe}
        />
      </mesh>

      {/* Superior Vena Cava / Pulmonary Artery Branches */}
      <mesh position={[0.4, 0.9, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.6, 16]} />
        <meshStandardMaterial
          color={wireframe ? '#38bdf8' : '#2563eb'}
          roughness={0.3}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[-0.4, 0.9, -0.1]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.6, 16]} />
        <meshStandardMaterial
          color={wireframe ? '#38bdf8' : '#2563eb'}
          roughness={0.3}
          wireframe={wireframe}
        />
      </mesh>

      {/* Coronary Arteries Surface Vessels */}
      <mesh position={[-0.1, -0.3, 0.7]} rotation={[0.4, 0.2, 0.8]}>
        <torusGeometry args={[0.35, 0.035, 8, 24, Math.PI / 1.5]} />
        <meshStandardMaterial color="#f43f5e" wireframe={wireframe} />
      </mesh>
    </group>
  );
};

export default HeartModel;
