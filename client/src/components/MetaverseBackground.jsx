import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Purple star particle field ────────────────────────────────────────────────
function ParticleField({ count = 800 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.025;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.08;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#8B5CF6" size={0.055} sizeAttenuation depthWrite={false} opacity={0.65} />
    </Points>
  );
}

// ── Cyan secondary particles ──────────────────────────────────────────────────
function CyanParticles({ count = 450 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 32;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = -state.clock.elapsedTime * 0.018;
      ref.current.rotation.z = state.clock.elapsedTime * 0.008;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#06B6D4" size={0.04} sizeAttenuation depthWrite={false} opacity={0.45} />
    </Points>
  );
}

// ── Tiny white sparkle particles ──────────────────────────────────────────────
function SparkleParticles({ count = 200 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#E2D9F3" size={0.025} sizeAttenuation depthWrite={false} opacity={0.3} />
    </Points>
  );
}

// ── Floating wireframe cube ───────────────────────────────────────────────────
function FloatingCube({ position, scale = 0.3, speed = 1, color = '#8B5CF6' }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      ref.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
    </mesh>
  );
}

// ── Floating icosahedron ──────────────────────────────────────────────────────
function FloatingIcosahedron({ position, scale = 0.3, speed = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.25 * speed;
      ref.current.rotation.z = state.clock.elapsedTime * 0.15 * speed;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 * speed + 1) * 0.35;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#06B6D4" wireframe transparent opacity={0.2} />
    </mesh>
  );
}

// ── Floating octahedron ───────────────────────────────────────────────────────
function FloatingOctahedron({ position, scale = 0.3, speed = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4 * speed;
      ref.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 * speed + 2) * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#A855F7" wireframe transparent opacity={0.2} />
    </mesh>
  );
}

// ── Floating glowing ring ─────────────────────────────────────────────────────
function FloatingRing({ position, speed = 0.5, color = '#06B6D4', radius = 0.8 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.7;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.5;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} />
    </mesh>
  );
}

// ── Large distant atmospheric ring ────────────────────────────────────────────
function DistantRing({ position, radius = 4, speed = 0.08, color = '#8B5CF6' }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.6;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[radius, 0.03, 16, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} />
    </mesh>
  );
}

// ── Holographic grid floor ────────────────────────────────────────────────────
function GridFloor() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      // Very subtle floor pulse
      ref.current.material.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[60, 60, 30, 30]} />
      <meshBasicMaterial color="#8B5CF6" wireframe transparent opacity={0.06} />
    </mesh>
  );
}

// ── Data node cluster (small bright spheres) ──────────────────────────────────
function DataNodes({ count = 12 }) {
  const nodes = useMemo(() => Array.from({ length: count }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 12 - 5,
    ],
    speed: 0.3 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    color: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#06B6D4' : '#A855F7',
  })), [count]);

  return (
    <group>
      {nodes.map((node, i) => (
        <DataNode key={i} {...node} />
      ))}
    </group>
  );
}

function DataNode({ position, speed, phase, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + phase) * 0.8;
      ref.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * speed * 1.5 + phase) * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

// ── Camera parallax controller ────────────────────────────────────────────────
function CameraParallax({ mouseX = 0, mouseY = 0 }) {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, y: 0 });

  useFrame(() => {
    targetRef.current.x = mouseX * 1.2;
    targetRef.current.y = -mouseY * 0.8;
    camera.position.x += (targetRef.current.x - camera.position.x) * 0.03;
    camera.position.y += (targetRef.current.y - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Full scene ────────────────────────────────────────────────────────────────
function Scene({ mouseX = 0, mouseY = 0 }) {
  return (
    <>
      <CameraParallax mouseX={mouseX} mouseY={mouseY} />

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[-8, 6, 4]} color="#8B5CF6" intensity={3} distance={25} />
      <pointLight position={[8, -6, 4]} color="#06B6D4" intensity={3} distance={25} />
      <pointLight position={[0, 10, -5]} color="#A855F7" intensity={1.5} distance={20} />

      {/* Particle fields */}
      <ParticleField count={700} />
      <CyanParticles count={350} />
      <SparkleParticles count={180} />

      {/* Wireframe geometry */}
      <FloatingCube position={[-10, 2, -6]} scale={0.45} speed={0.8} color="#8B5CF6" />
      <FloatingCube position={[11, -3, -9]} scale={0.65} speed={0.5} color="#A855F7" />
      <FloatingCube position={[-7, -5, -7]} scale={0.3} speed={1.2} color="#8B5CF6" />
      <FloatingCube position={[8, 5, -5]} scale={0.25} speed={0.9} color="#3B82F6" />
      <FloatingCube position={[1, 7, -12]} scale={0.55} speed={0.6} color="#06B6D4" />

      <FloatingIcosahedron position={[-12, -1, -8]} scale={0.5} speed={0.7} />
      <FloatingIcosahedron position={[5, 6, -10]} scale={0.35} speed={1.0} />

      <FloatingOctahedron position={[13, 1, -7]} scale={0.4} speed={0.6} />
      <FloatingOctahedron position={[-9, 4, -11]} scale={0.55} speed={0.8} />

      {/* Rings */}
      <FloatingRing position={[-12, 1, -9]} speed={0.35} color="#06B6D4" radius={0.9} />
      <FloatingRing position={[12, -2, -11]} speed={0.28} color="#8B5CF6" radius={1.1} />
      <FloatingRing position={[0, -6, -7]} speed={0.55} color="#A855F7" radius={0.7} />
      <FloatingRing position={[6, 3, -8]} speed={0.4} color="#06B6D4" radius={0.6} />

      {/* Large distant atmospheric rings */}
      <DistantRing position={[-6, 0, -18]} radius={5} speed={0.06} color="#8B5CF6" />
      <DistantRing position={[8, 3, -22]} radius={7} speed={0.04} color="#06B6D4" />
      <DistantRing position={[0, -5, -15]} radius={4} speed={0.09} color="#A855F7" />

      {/* Grid floor */}
      <GridFloor />

      {/* Data nodes */}
      <DataNodes count={14} />
    </>
  );
}

// ── CSS bloom/radial overlay ──────────────────────────────────────────────────
function CSSOverlay() {
  return (
    <>
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)',
          backgroundSize: '70px 70px',
          opacity: 0.7,
        }}
      />
      {/* Radial purple glow — top left */}
      <div className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '-5%',
          width: '55%', height: '55%',
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
        }}
      />
      {/* Radial cyan glow — bottom right */}
      <div className="absolute pointer-events-none"
        style={{
          bottom: '-10%', right: '-5%',
          width: '55%', height: '55%',
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)',
        }}
      />
      {/* Center bloom */}
      <div className="absolute pointer-events-none"
        style={{
          top: '20%', left: '30%',
          width: '40%', height: '40%',
          background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.06) 0%, transparent 70%)',
          animation: 'breathe 6s ease-in-out infinite',
        }}
      />
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          backgroundSize: '100% 4px',
        }}
      />
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function MetaverseBackground({ mouseX = 0, mouseY = 0 }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <CSSOverlay />
      {/* Three.js canvas */}
      <Canvas
        camera={{ position: [0, 0, 14], fov: 58 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <Scene mouseX={mouseX} mouseY={mouseY} />
      </Canvas>
    </div>
  );
}
