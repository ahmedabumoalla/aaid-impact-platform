"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Line, RoundedBox, Sparkles } from "@react-three/drei";
import { AdditiveBlending, DoubleSide, QuadraticBezierCurve3, Vector3 } from "three";
import { useReducedMotion } from "motion/react";
import type { Group, Mesh } from "three";

const colors = ["#22d3ee", "#3b82f6", "#18c8a4", "#67e8f9"];
const CENTER = new Vector3(0, 0.58, 0);
const RADIUS = 1.48;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function spherePoint(index: number, count: number, radius = RADIUS) {
  const y = 1 - ((index + 0.5) / count) * 2;
  const ring = Math.sqrt(1 - y * y);
  const angle = GOLDEN_ANGLE * index;
  return new Vector3(Math.cos(angle) * ring * radius, y * radius + CENTER.y, Math.sin(angle) * ring * radius);
}

function ParticleVolume({ accent, reduced, speed }: { accent: string; reduced: boolean; speed: number }) {
  const cloud = useRef<Group>(null);
  const [surface, volume] = useMemo(() => {
    const surfaceData = new Float32Array(360 * 3);
    const volumeData = new Float32Array(220 * 3);
    for (let i = 0; i < 360; i += 1) surfaceData.set(spherePoint(i, 360, RADIUS * (0.988 + (i % 5) * 0.003)).toArray(), i * 3);
    for (let i = 0; i < 220; i += 1) {
      const depth = Math.cbrt(0.12 + (((i * 71) % 220) / 220) * 0.82);
      volumeData.set(spherePoint(i, 220, RADIUS * depth).toArray(), i * 3);
    }
    return [surfaceData, volumeData];
  }, []);
  useFrame((_, delta) => { if (!reduced && cloud.current) cloud.current.rotation.y += delta * 0.018 * speed; });
  return (
    <group ref={cloud}>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[surface, 3]} /></bufferGeometry><pointsMaterial color="#9cf5ff" size={0.022} transparent opacity={0.92} depthWrite={false} blending={AdditiveBlending} toneMapped={false} /></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[volume, 3]} /></bufferGeometry><pointsMaterial color={accent} size={0.017} transparent opacity={0.52} depthWrite={false} blending={AdditiveBlending} toneMapped={false} /></points>
    </group>
  );
}

function DataStreams({ nodes, reduced, speed }: { nodes: Vector3[]; reduced: boolean; speed: number }) {
  const movers = useRef<Group>(null);
  const curves = useMemo(() => Array.from({ length: 16 }, (_, index) => {
    const end = nodes[(index * 7 + 3) % nodes.length];
    const angle = (index / 16) * Math.PI * 2;
    const root = new Vector3(Math.cos(angle) * (0.24 + (index % 4) * 0.08), -1.47, Math.sin(angle) * (0.24 + (index % 4) * 0.08));
    const bend = new Vector3(end.x * (0.18 + (index % 5) * 0.035), -0.58 + (index % 6) * 0.11, end.z * (0.18 + (index % 3) * 0.05));
    return new QuadraticBezierCurve3(root, bend, end);
  }), [nodes]);
  useFrame((state) => {
    if (reduced || !movers.current) return;
    movers.current.children.forEach((particle, index) => {
      const progress = (state.clock.elapsedTime * (0.035 + (index % 5) * 0.005) * speed + index / 16) % 1;
      particle.position.copy(curves[index].getPoint(progress));
    });
  });
  return (
    <group ref={movers} visible={!reduced}>
      {curves.map((_, index) => <mesh key={index}><sphereGeometry args={[index % 5 === 0 ? 0.03 : 0.017, 7, 7]} /><meshBasicMaterial color="#f5feff" transparent opacity={index % 3 === 0 ? 0.94 : 0.7} depthWrite={false} toneMapped={false} /></mesh>)}
    </group>
  );
}

function IntelligenceGlobe({ accent, reduced, speed }: { accent: string; reduced: boolean; speed: number }) {
  const globe = useRef<Group>(null);
  const floatingGlobe = useRef<Group>(null);
  const nodes = useMemo(() => Array.from({ length: 34 }, (_, index) => spherePoint(index, 34, RADIUS * 1.012)), []);
  const arcs = useMemo(() => Array.from({ length: 20 }, (_, index) => {
    const start = nodes[(index * 5) % nodes.length];
    const end = nodes[(index * 11 + 9) % nodes.length];
    const control = start.clone().add(end).multiplyScalar(0.5).sub(CENTER).normalize().multiplyScalar(RADIUS * (1.04 + (index % 4) * 0.025)).add(CENTER);
    return new QuadraticBezierCurve3(start, control, end).getPoints(26);
  }), [nodes]);
  useFrame((state, delta) => {
    if (reduced) return;
    if (globe.current) globe.current.rotation.y += delta * 0.026 * speed;
    if (floatingGlobe.current) floatingGlobe.current.position.y = Math.sin(state.clock.elapsedTime * 0.72) * 0.045;
  });
  return (
    <>
      <group ref={floatingGlobe}>
        <group ref={globe}>
          <mesh position={CENTER.toArray()}><sphereGeometry args={[RADIUS, 48, 48]} /><meshPhysicalMaterial color="#07386b" emissive="#0a7ab1" emissiveIntensity={0.24} transparent opacity={0.13} roughness={0.28} metalness={0.12} depthWrite={false} side={DoubleSide} /></mesh>
          <mesh position={CENTER.toArray()} scale={0.91}><sphereGeometry args={[RADIUS, 32, 32]} /><meshBasicMaterial color="#09539a" transparent opacity={0.08} depthWrite={false} blending={AdditiveBlending} /></mesh>
          <mesh position={CENTER.toArray()} scale={1.004}><sphereGeometry args={[RADIUS, 28, 28]} /><meshBasicMaterial color="#5adcf6" wireframe transparent opacity={0.08} depthWrite={false} /></mesh>
          <mesh position={CENTER.toArray()} scale={1.018}><sphereGeometry args={[RADIUS, 18, 18]} /><meshBasicMaterial color="#2aa7ed" wireframe transparent opacity={0.04} depthWrite={false} /></mesh>
          {arcs.map((points, index) => <Line key={index} points={points} color={index % 7 === 0 ? "#8ceeff" : accent} lineWidth={index % 7 === 0 ? 0.7 : 0.36} transparent opacity={index % 7 === 0 ? 0.42 : 0.2} depthWrite={false} />)}
          {nodes.map((node, index) => <mesh key={index} position={node.toArray()} scale={index % 8 === 0 ? 1.7 : 1}><sphereGeometry args={[0.026, 8, 8]} /><meshBasicMaterial color={index % 6 === 0 ? "#fff" : accent} toneMapped={false} /></mesh>)}
        </group>
        <ParticleVolume accent={accent} reduced={reduced} speed={speed} />
      </group>
      <DataStreams nodes={nodes} reduced={reduced} speed={speed} />
    </>
  );
}

function Processor({ accent }: { accent: string }) {
  const pins = useMemo(() => Array.from({ length: 12 }, (_, index) => -0.76 + index * 0.138), []);
  const traces = useMemo(() => Array.from({ length: 8 }, (_, index) => {
    const offset = -0.66 + index * 0.188;
    return [
      [new Vector3(offset, 0.23, 0.62), new Vector3(offset, 0.23, 0.83), new Vector3(offset * 1.08, 0.23, 1.02)],
      [new Vector3(offset, 0.23, -0.62), new Vector3(offset, 0.23, -0.83), new Vector3(offset * 1.08, 0.23, -1.02)],
      [new Vector3(0.72, 0.23, offset * 0.82), new Vector3(0.94, 0.23, offset * 0.82), new Vector3(1.12, 0.23, offset)],
      [new Vector3(-0.72, 0.23, offset * 0.82), new Vector3(-0.94, 0.23, offset * 0.82), new Vector3(-1.12, 0.23, offset)],
    ];
  }).flat(), []);
  const fasteners = [[-.93, -.78], [.93, -.78], [-.93, .78], [.93, .78]] as const;

  return (
    <group position={[0, -1.56, 0]} rotation={[0, Math.PI / 4, 0]} scale={0.68}>
      <RoundedBox args={[2.72, 0.16, 2.47]} radius={0.055} smoothness={5} position={[0, -0.38, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#010613" emissive="#02091c" emissiveIntensity={0.35} metalness={0.92} roughness={0.28} />
      </RoundedBox>
      <RoundedBox args={[2.48, 0.36, 2.24]} radius={0.09} smoothness={6} position={[0, -0.19, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#020b1f" emissive="#06183a" emissiveIntensity={0.38} metalness={0.88} roughness={0.22} clearcoat={0.72} clearcoatRoughness={0.18} />
      </RoundedBox>
      <RoundedBox args={[2.22, 0.13, 1.98]} radius={0.06} smoothness={5} position={[0, 0.055, 0]} castShadow>
        <meshPhysicalMaterial color="#07314a" emissive={accent} emissiveIntensity={0.24} metalness={0.72} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>
      <RoundedBox args={[1.62, 0.105, 1.42]} radius={0.045} smoothness={5} position={[0, 0.17, 0]} castShadow>
        <meshStandardMaterial color="#b7d4df" emissive={accent} emissiveIntensity={0.18} metalness={0.95} roughness={0.16} />
      </RoundedBox>
      <RoundedBox args={[1.46, 0.075, 1.26]} radius={0.035} smoothness={5} position={[0, 0.255, 0]} castShadow>
        <meshPhysicalMaterial color="#1bb8c8" emissive={accent} emissiveIntensity={0.55} metalness={0.48} roughness={0.12} clearcoat={1} clearcoatRoughness={0.06} />
      </RoundedBox>
      <RoundedBox args={[1.02, 0.045, 0.82]} radius={0.025} smoothness={4} position={[0, 0.32, 0]}>
        <meshPhysicalMaterial color="#b9f7ff" emissive={accent} emissiveIntensity={0.3} transparent opacity={0.34} transmission={0.34} thickness={0.12} roughness={0.08} metalness={0.08} depthWrite={false} />
      </RoundedBox>
      {traces.map((points, index) => <Line key={index} points={points} color={index % 5 === 0 ? "#eefeff" : accent} lineWidth={index % 5 === 0 ? 0.75 : 0.42} transparent opacity={index % 5 === 0 ? 0.72 : 0.4} depthWrite={false} />)}
      {fasteners.map(([x, z]) => <mesh key={`${x}-${z}`} position={[x, 0.16, z]} castShadow><cylinderGeometry args={[0.035, 0.035, 0.055, 18]} /><meshStandardMaterial color="#d8edf2" metalness={0.98} roughness={0.16} /></mesh>)}
      {pins.map((position, index) => <group key={position}>
        {[[position,-.12,1.29,.058,.08,.34],[position,-.12,-1.29,.058,.08,.34],[1.41,-.12,position,.34,.08,.058],[-1.41,-.12,position,.34,.08,.058]].map(([x,y,z,w,h,d], pin) => <mesh key={pin} position={[x,y,z]} castShadow><boxGeometry args={[w,h,d]} /><meshStandardMaterial color={index % 4 === 0 ? "#e7f7fa" : "#8fc8d3"} emissive={index % 4 === 0 ? accent : "#072d42"} emissiveIntensity={index % 4 === 0 ? 0.5 : 0.22} metalness={0.92} roughness={0.2} /></mesh>)}
      </group>)}
    </group>
  );
}

function Hud({ accent, reduced }: { accent: string; reduced: boolean }) {
  const rings = useRef<Group>(null);
  const counter = useRef<Group>(null);
  const radials = useMemo(() => Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return [new Vector3(Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0), new Vector3(Math.cos(a) * (2.05 + i % 3 * .18), Math.sin(a) * (2.05 + i % 3 * .18), 0)]; }), []);
  useFrame((_, delta) => { if (!reduced) { if (rings.current) rings.current.rotation.z -= delta * .055; if (counter.current) counter.current.rotation.z += delta * .028; } });
  return (
    <group position={[0, -2.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={rings}>{[1.18,1.48,1.82,2.18,2.55].map((radius,index) => <mesh key={radius}><torusGeometry args={[radius,index===1?.018:.009,7,128]} /><meshBasicMaterial color={index%2?"#d4faff":accent} transparent opacity={.34-index*.04} depthWrite={false} blending={AdditiveBlending} toneMapped={false} /></mesh>)}</group>
      <group ref={counter}>{[1.63,2.35].flatMap((radius,index) => Array.from({length:8},(_,segment) => <mesh key={`${radius}-${segment}`} rotation={[0,0,segment/8*Math.PI*2]}><torusGeometry args={[radius,index?.025:.017,6,28,.32]} /><meshBasicMaterial color={segment%3===0?"#fff":accent} transparent opacity={.7} toneMapped={false} /></mesh>))}</group>
      {radials.map((points,index) => <Line key={index} points={points} color={accent} lineWidth={.35} transparent opacity={index%3===0?.22:.1} depthWrite={false} />)}
    </group>
  );
}

function Scene({ activeIndex, reduced, speed, globeOnly }: { activeIndex: number; reduced: boolean; speed: number; globeOnly: boolean }) {
  const pulse = useRef<Mesh>(null);
  const accent = colors[activeIndex];
  useFrame((state) => { if (!reduced && pulse.current) pulse.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.7) * .07); });
  return <>
    <ambientLight intensity={0.24} />
    <hemisphereLight args={["#b8f5ff", "#010716", 0.62]} />
    <spotLight position={[3.6, 5.4, 4.2]} intensity={38} angle={0.5} penumbra={0.82} color="#d8fbff" castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[2.4,3.8,3.4]} intensity={18} color={accent} />
    <pointLight position={[-3.2,-.5,2]} intensity={9} color="#1d70ff" />
    <IntelligenceGlobe accent={accent} reduced={reduced} speed={speed} />
    {!globeOnly && <><Processor accent={accent} /><Hud accent={accent} reduced={reduced} /><ContactShadows position={[0, -2.11, 0]} opacity={0.52} scale={6.8} blur={2.7} far={3.1} color="#00030c" /><mesh ref={pulse} position={[0,-1.43,0]}><sphereGeometry args={[.13,20,20]} /><meshBasicMaterial color="#fff" transparent opacity={.95} toneMapped={false} /></mesh></>}
    <Sparkles count={reduced ? 24 : 48} scale={[6.5,4.9,3.2]} size={1.45} speed={reduced ? 0 : .1} color={accent} opacity={.48} />
  </>;
}

export function ImpactUniverse({ activeIndex, speed = 1, globeOnly = false, onReady }: { activeIndex: number; speed?: number; globeOnly?: boolean; onReady?: () => void }) {
  const reduced = Boolean(useReducedMotion());
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 780px)").matches;
  const cameraPosition: [number, number, number] = globeOnly ? [0, .58, narrow ? 10.2 : 5.8] : [0, .08, 8.15];
  return <Canvas className="impact-canvas" shadows="basic" camera={{ position: cameraPosition, fov:42 }} dpr={[1,1.45]} frameloop={reduced?"demand":"always"} gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} onCreated={onReady}><Scene activeIndex={activeIndex} reduced={reduced} speed={speed} globeOnly={globeOnly} /></Canvas>;
}
