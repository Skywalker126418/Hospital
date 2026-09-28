import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const HospitalModel = ({ selectedDepartment, onSelectDepartment }) => {
  const facilityRef = useRef();
  const [hovered, setHovered] = useState(null);

  useFrame((_, delta) => {
    if (facilityRef.current) {
      facilityRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={facilityRef} position={[0, -0.4, 0]}>
      {/* Ground Plaza */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Main Hospital Tower (Inpatient & Administration) */}
      <mesh
        position={[0, 1.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectDepartment('Central Hospital Inpatient Tower');
        }}
        onPointerOver={() => setHovered('Central Medical Tower')}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[1.8, 2.8, 1.8]} />
        <meshStandardMaterial
          color={hovered === 'Central Medical Tower' ? '#38bdf8' : '#1e293b'}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Glass Atrium Windows Grid on Main Tower */}
      {[-0.8, -0.2, 0.4, 1.0, 1.6, 2.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0.92]}>
          <boxGeometry args={[1.5, 0.35, 0.04]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
        </mesh>
      ))}

      {/* Emergency Department Wing (Left) */}
      <mesh
        position={[-1.7, 0.6, 0.2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectDepartment('Emergency & Trauma Care Center');
        }}
        onPointerOver={() => setHovered('Emergency Wing (24/7)')}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[1.6, 1.2, 2.0]} />
        <meshStandardMaterial
          color={hovered === 'Emergency Wing (24/7)' ? '#ef4444' : '#334155'}
          roughness={0.3}
        />
      </mesh>

      {/* Red Emergency Cross Emblem on Wing */}
      <mesh position={[-1.7, 0.6, 1.23]}>
        <boxGeometry args={[0.5, 0.16, 0.05]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-1.7, 0.6, 1.23]}>
        <boxGeometry args={[0.16, 0.5, 0.05]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {/* Diagnostic & Cardiology Pavilion (Right) */}
      <mesh
        position={[1.6, 0.7, -0.1]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectDepartment('Cardiovascular & Advanced Diagnostics Pavilion');
        }}
        onPointerOver={() => setHovered('Cardiology & Diagnostics Wing')}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[1.4, 1.4, 1.8]} />
        <meshStandardMaterial
          color={hovered === 'Cardiology & Diagnostics Wing' ? '#0ea5e9' : '#1e293b'}
          roughness={0.3}
        />
      </mesh>

      {/* Rooftop Helipad */}
      <group position={[0, 2.82, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 24]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Helipad Yellow H */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.45, 0.45]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      </group>

      {/* Hover Info Tooltip */}
      {hovered && (
        <Html position={[0, 3.4, 0]} center pointerEvents="none">
          <div className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
            🏢 {hovered}
          </div>
        </Html>
      )}
    </group>
  );
};

export default HospitalModel;
