import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// A single interactive planet
const Planet = ({ color, name, onClick, isSelected, orbitRadius, orbitSpeed, initialAngle, size, hasRing }) => {
    const groupRef = useRef();
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Revolve around the center
            groupRef.current.rotation.y += delta * orbitSpeed;
        }
        if (meshRef.current) {
            // Spin on own axis
            meshRef.current.rotation.y += delta * 0.4;
            meshRef.current.rotation.z += delta * 0.1;

            // Hover scale effect
            const targetScale = hovered ? 1.15 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    return (
        <group ref={groupRef} rotation={[0, initialAngle, 0]}>
            {/* The orbit ring line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>

            <group position={[orbitRadius, 0, 0]}>
                <Float speed={hovered ? 0 : 2} rotationIntensity={0.5} floatIntensity={1}>
                    <group
                        onClick={(e) => {
                            e.stopPropagation();
                            // Calculate absolute world position for the camera to zoom to
                            const worldPosition = new THREE.Vector3();
                            e.object.getWorldPosition(worldPosition);
                            onClick(name, worldPosition);
                        }}
                        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
                    >
                        <mesh ref={meshRef}>
                            <sphereGeometry args={[size, 64, 64]} />
                            <meshStandardMaterial
                                color={color}
                                roughness={0.6}
                                metalness={0.2}
                                emissive={hovered ? color : '#000000'}
                                emissiveIntensity={0.3}
                                wireframe={hovered}
                            />
                        </mesh>

                        {/* Atmospheric glow */}
                        <mesh scale={1.15}>
                            <sphereGeometry args={[size, 32, 32]} />
                            <meshBasicMaterial
                                color={color}
                                transparent
                                opacity={hovered ? 0.3 : 0.1}
                                blending={THREE.AdditiveBlending}
                                side={THREE.BackSide}
                            />
                        </mesh>

                        {/* Planetary Ring */}
                        {hasRing && (
                            <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
                                <ringGeometry args={[size * 1.5, size * 2.2, 64]} />
                                <meshStandardMaterial
                                    color={color}
                                    transparent
                                    opacity={0.6}
                                    side={THREE.DoubleSide}
                                    roughness={0.8}
                                />
                            </mesh>
                        )}
                    </group>
                </Float>
            </group>
        </group>
    );
};

// Central Sun / Core
const CentralCore = () => {
    const coreRef = useRef();

    useFrame((state, delta) => {
        if (coreRef.current) {
            coreRef.current.rotation.y += delta * 0.1;
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
            coreRef.current.scale.set(pulse, pulse, pulse);
        }
    });

    return (
        <mesh ref={coreRef}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshBasicMaterial color="#ffffff" />
            <mesh scale={1.4}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#00f3ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh scale={2}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#7b2cbf" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
            </mesh>
        </mesh>
    );
};

// The main Galaxy Scene
const GalaxyScene = ({ activeSection, onNavigate }) => {
    const { camera } = useThree();

    // Define the planets (sections) with orbit parameters
    const planets = useMemo(() => [
        { id: 'about', color: '#7b2cbf', orbitRadius: 4, orbitSpeed: 0.15, angle: 0, size: 0.6, ring: true },
        { id: 'skills', color: '#00f3ff', orbitRadius: 6, orbitSpeed: 0.1, angle: Math.PI / 2, size: 0.5, ring: false },
        { id: 'projects', color: '#ff9f1c', orbitRadius: 8.5, orbitSpeed: 0.07, angle: Math.PI, size: 0.8, ring: true },
        { id: 'experience', color: '#38b000', orbitRadius: 11, orbitSpeed: 0.05, angle: Math.PI * 1.5, size: 0.7, ring: false },
        { id: 'contact', color: '#ff006e', orbitRadius: 14, orbitSpeed: 0.03, angle: Math.PI / 4, size: 0.4, ring: true }
    ], []);

    const handlePlanetClick = (id, position) => {
        // Find a camera position slightly in front of the planet and above it
        const newCamPos = new THREE.Vector3()
            .copy(position)
            .normalize()
            .multiplyScalar(position.length() + 4)
            .add(new THREE.Vector3(0, 2, 0));

        // GSAP animate camera
        gsap.to(camera.position, {
            x: newCamPos.x,
            y: newCamPos.y,
            z: newCamPos.z,
            duration: 1.5,
            ease: 'power3.inOut'
        });

        // Trigger external navigation (scroll or state)
        onNavigate(id);
    };

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2.5} color="#ffffff" distance={30} decay={2} />

            <CentralCore />

            {/* Cinematic deep space background */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {planets.map((planet) => (
                <Planet
                    key={planet.id}
                    name={planet.id}
                    color={planet.color}
                    size={planet.size}
                    hasRing={planet.ring}
                    orbitRadius={planet.orbitRadius}
                    orbitSpeed={planet.orbitSpeed}
                    initialAngle={planet.angle}
                    onClick={handlePlanetClick}
                    isSelected={activeSection === planet.id}
                />
            ))}

            {/* Orbit Controls restricted */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.5}
            />
        </>
    );
};

// Container Component
const GalaxyHero = ({ activeSection, onNavigate }) => {
    return (
        <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
            {/* Set pointerEvents: auto on Canvas to capture orbital drags and clicks when not layered behind text */}
            <Canvas camera={{ position: [0, 8, 20], fov: 45 }} style={{ pointerEvents: 'auto' }}>
                <GalaxyScene activeSection={activeSection} onNavigate={onNavigate} />
            </Canvas>
        </div>
    );
};

export default GalaxyHero;
