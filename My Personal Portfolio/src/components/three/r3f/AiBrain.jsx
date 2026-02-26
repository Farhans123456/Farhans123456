import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolio } from '../../../context/PortfolioContext';

// Procedurally generate safe random points inside a sphere for the nodes
const generateNodes = (count, radius) => {
    const nodes = [];
    for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(Math.random()) * radius;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        // Give each node a random skill 'intensity' for pulsing offsets
        nodes.push({ pos: new THREE.Vector3(x, y, z), offset: Math.random() * Math.PI * 2 });
    }
    return nodes;
};

const BrainMesh = ({ nodes }) => {
    const meshRef = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const [hoveredNode, setHoveredNode] = useState(null);

    // Provide base color to all instances
    const baseColor = useMemo(() => new THREE.Color("#00f3ff"), []);
    const activeColor = useMemo(() => new THREE.Color("#ff006e"), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Very slow overall rotation
        meshRef.current.rotation.y += delta * 0.05;

        // Update instance matrices for pulsing
        nodes.forEach((node, i) => {
            const time = state.clock.getElapsedTime();
            const pulse = Math.sin(time * 2 + node.offset) * 0.2 + 1; // Scale 0.8 to 1.2

            // If hovered, make this specific node larger
            const scale = hoveredNode === i ? 1.8 : pulse;

            dummy.position.copy(node.pos);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();

            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Set dynamic color based on hover
            if (hoveredNode === i) {
                meshRef.current.setColorAt(i, activeColor);
            } else {
                meshRef.current.setColorAt(i, baseColor);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (hoveredNode !== null) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    });

    const handlePointerMove = (e) => {
        e.stopPropagation();
        setHoveredNode(e.instanceId);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setHoveredNode(null);
        document.body.style.cursor = 'auto';
    };

    return (
        <instancedMesh
            ref={meshRef}
            args={[null, null, nodes.length]}
            onPointerMove={handlePointerMove}
            onPointerOut={handlePointerOut}
        >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
                toneMapped={false}
                transparent
                opacity={0.8}
            />
        </instancedMesh>
    );
};

const BrainConnections = ({ nodes }) => {
    // Generate line segments connecting nearby nodes
    const lines = useMemo(() => {
        const segs = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].pos.distanceTo(nodes[j].pos) < 2.5) {
                    segs.push([nodes[i].pos, nodes[j].pos]);
                }
            }
        }
        return segs;
    }, [nodes]);

    return (
        <group>
            {lines.map((pts, i) => (
                <Line
                    key={i}
                    points={pts}
                    color="#7b2cbf"
                    lineWidth={1.5}
                    transparent
                    opacity={0.3}
                />
            ))}
        </group>
    );
};

export const AiBrainScene = () => {
    const nodes = useMemo(() => generateNodes(60, 5), []);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />

            <Float speed={1.5} floatingRange={[-0.5, 0.5]}>
                <group>
                    <BrainMesh nodes={nodes} />
                    <BrainConnections nodes={nodes} />
                </group>
            </Float>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </>
    );
};

const AiBrain = () => {
    const { isLiteMode } = usePortfolio();

    if (isLiteMode) {
        return (
            <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                <div>
                    <h3 style={{ color: '#00f3ff' }}>Neural Network Paused</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>WebGL disabled in Lite Mode to save battery and performance.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                <AiBrainScene />
            </Canvas>
        </div>
    );
};

export default AiBrain;
