import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const HumanBodyModel = ({
  activeLayer = 'all', // 'all', 'organs', 'skeleton'
  selectedOrgan,
  onSelectOrgan,
}) => {
  const bodyGroup = useRef();
  const [hovered, setHovered] = useState(null);

  useFrame((_, delta) => {
    if (bodyGroup.current) {
      bodyGroup.current.rotation.y += delta * 0.08;
    }
  });

  const showSkeleton = activeLayer === 'all' || activeLayer === 'skeleton';
  const showOrgans = activeLayer === 'all' || activeLayer === 'organs';

  return (
    <group ref={bodyGroup} position={[0, -0.6, 0]}>
      {/* Head / Cranium */}
      <mesh
        position={[0, 2.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectOrgan('Cerebral Cortex & Neurological System');
        }}
        onPointerOver={() => setHovered('Brain & Nervous System')}
        onPointerOut={() => setHovered(null)}
      >
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial
          color={hovered === 'Brain & Nervous System' ? '#38bdf8' : '#cbd5e1'}
          roughness={0.4}
          metalness={0.1}
          wireframe={activeLayer === 'skeleton'}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.35, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>

      {/* Ribcage / Thorax */}
      {showSkeleton && (
        <group position={[0, 1.25, 0]}>
          {[-0.2, -0.05, 0.1, 0.25].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.42 - i * 0.03, 0.025, 8, 24]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
            </mesh>
          ))}
          {/* Spine Segment */}
          <mesh position={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      )}

      {/* Internal Organs: Heart */}
      {showOrgans && (
        <mesh
          position={[-0.08, 1.25, 0.05]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectOrgan('Cardiac Ventricles & Cardiovascular System');
          }}
          onPointerOver={() => setHovered('Heart')}
          onPointerOut={() => setHovered(null)}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={hovered === 'Heart' || selectedOrgan?.includes('Cardiac') ? '#ef4444' : '#dc2626'}
            emissive="#b91c1c"
            emissiveIntensity={0.4}
          />
        </mesh>
      )}

      {/* Internal Organs: Lungs (Pair) */}
      {showOrgans && (
        <group position={[0, 1.25, 0]}>
          {/* Left Lung */}
          <mesh
            position={[-0.22, 0.02, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOrgan('Pulmonary Respiratory System (Left Lung)');
            }}
            onPointerOver={() => setHovered('Lungs')}
            onPointerOut={() => setHovered(null)}
          >
            <cylinderGeometry args={[0.11, 0.14, 0.38, 16]} />
            <meshStandardMaterial
              color={hovered === 'Lungs' || selectedOrgan?.includes('Pulmonary') ? '#60a5fa' : '#3b82f6'}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Right Lung */}
          <mesh
            position={[0.22, 0.02, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOrgan('Pulmonary Respiratory System (Right Lung)');
            }}
            onPointerOver={() => setHovered('Lungs')}
            onPointerOut={() => setHovered(null)}
          >
            <cylinderGeometry args={[0.12, 0.15, 0.38, 16]} />
            <meshStandardMaterial
              color={hovered === 'Lungs' || selectedOrgan?.includes('Pulmonary') ? '#60a5fa' : '#3b82f6'}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}

      {/* Abdomen / Digestive System */}
      {showOrgans && (
        <mesh
          position={[0, 0.72, 0.02]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectOrgan('Gastrointestinal & Hepatic Organs (Liver/Stomach)');
          }}
          onPointerOver={() => setHovered('Abdomen')}
          onPointerOut={() => setHovered(null)}
        >
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial
            color={hovered === 'Abdomen' ? '#fbbf24' : '#d97706'}
            roughness={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Pelvis / Hip Skeleton */}
      {showSkeleton && (
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.34, 0.28, 0.22, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>
      )}

      {/* Arms (Left & Right) */}
      <group>
        <mesh position={[-0.55, 1.1, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.07, 0.06, 0.9, 12]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0.55, 1.1, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.07, 0.06, 0.9, 12]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Legs (Left & Right) */}
      <group>
        <mesh position={[-0.2, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 1.2, 14]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0.2, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 1.2, 14]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Hover Info Tooltip */}
      {hovered && (
        <Html position={[0, 2.7, 0]} center pointerEvents="none">
          <div className="bg-slate-900/90 text-white text-[11px] px-2.5 py-1 rounded-md shadow-md border border-slate-700 whitespace-nowrap">
            {hovered} (Click to inspect)
          </div>
        </Html>
      )}
    </group>
  );
};

export default HumanBodyModel;
