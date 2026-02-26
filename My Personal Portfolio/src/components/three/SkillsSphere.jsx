import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SkillsSphere = ({ skills, onHoverSkill }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        let scene, camera, renderer, animationId;
        const meshes = []; // to store our skill nodes for raycasting
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Intersection Observer for lazy loading / performance
        let isVisible = false;
        let initialized = false;

        const initThree = () => {
            scene = new THREE.Scene();

            const width = mountRef.current.clientWidth || 300;
            const height = mountRef.current.clientHeight || 300;

            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.z = 10;

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            mountRef.current.appendChild(renderer.domElement);

            // Create a low-poly core mesh (neural-like)
            const coreGeometry = new THREE.IcosahedronGeometry(3, 1);
            const coreMaterial = new THREE.MeshBasicMaterial({
                color: 0x7b2cbf,
                wireframe: true,
                transparent: true,
                opacity: 0.15
            });
            const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
            scene.add(coreMesh);

            // Create skill nodes
            const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);

            // Determine positions based on icosahedron vertices, just pick 6 spread out ones
            // An Icosahedron has 12 vertices.
            const vertices = coreGeometry.attributes.position.array;
            const uniqueVertices = [];

            for (let i = 0; i < vertices.length; i += 3) {
                const v = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
                // Simple way to filter rough uniqueness, ignoring floating point tiny diffs
                if (!uniqueVertices.some(uv => uv.distanceTo(v) < 0.1)) {
                    uniqueVertices.push(v);
                }
            }

            skills.forEach((skill, index) => {
                // use a base color and glow color
                const nodeMat = new THREE.MeshBasicMaterial({
                    color: 0x00f3ff,
                    transparent: true,
                    opacity: 0.8
                });

                const node = new THREE.Mesh(nodeGeometry, nodeMat);

                // Pick a vertex for this skill
                const v = uniqueVertices[index % uniqueVertices.length];

                // Push slightly outwards
                node.position.copy(v).multiplyScalar(1.1);

                // Store user data to identify on intersection
                node.userData = { skill, originalColor: nodeMat.color.getHex(), isNode: true };

                coreMesh.add(node);
                meshes.push(node);
            });

            // Lighting is not strictly necessary with BasicMaterial, but if we upgrade to Standard:
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            return coreMesh;
        };

        let coreMesh;

        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;

            if (isVisible && !initialized) {
                coreMesh = initThree();
                initialized = true;
                clock.start();
                animate(0); // jumpstart
            } else if (!isVisible && initialized) {
                // Optional: aggressively dispose here, but pausing the loop might be enough for this scale
                // We will just pause the loop to save battery
            }
        }, { threshold: 0.1 });

        observer.observe(mountRef.current);

        const clock = new THREE.Clock();
        let hoveredNode = null;
        const targetFPS = 60;
        const frameDelay = 1000 / targetFPS;
        let lastTime = 0;

        let targetRotationX = 0;
        let targetRotationY = 0;

        const animate = (time) => {
            // If we aren't visible, stop scheduling new frames
            if (!isVisible) {
                animationId = requestAnimationFrame(animate);
                return;
            }

            animationId = requestAnimationFrame(animate);

            if (time - lastTime < frameDelay) return;
            lastTime = time;

            const delta = clock.getDelta();

            if (coreMesh) {
                // Auto-rotate if not hovering over a node
                if (!hoveredNode) {
                    targetRotationY += delta * 0.2;
                    targetRotationX += delta * 0.1;
                }

                // Smooth damping towards target rotation
                coreMesh.rotation.y += (targetRotationY - coreMesh.rotation.y) * 0.05;
                coreMesh.rotation.x += (targetRotationX - coreMesh.rotation.x) * 0.05;

                // Animate node pulsuation
                const t = clock.getElapsedTime();
                meshes.forEach((n) => {
                    let scale = 1.0;
                    if (n === hoveredNode) {
                        scale = 1.5 + Math.sin(t * 5) * 0.1;
                    } else {
                        scale = 1.0 + Math.sin(t * 2 + n.position.x) * 0.1;
                    }
                    n.scale.set(scale, scale, scale);
                });

                renderer.render(scene, camera);
            }
        };

        const handleMouseMove = (event) => {
            if (!initialized || !isVisible || !mountRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            mouse.x = (x / rect.width) * 2 - 1;
            mouse.y = -(y / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // Find intersections with the coreMesh's children (the nodes)
            const intersects = raycaster.intersectObjects(meshes);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (hoveredNode !== object) {
                    // Reset previous
                    if (hoveredNode) {
                        hoveredNode.material.color.setHex(hoveredNode.userData.originalColor);
                    }

                    hoveredNode = object;
                    hoveredNode.material.color.setHex(0xff006e); // Ping color
                    mountRef.current.style.cursor = 'pointer';

                    if (onHoverSkill) onHoverSkill(hoveredNode.userData.skill);
                }
            } else {
                if (hoveredNode) {
                    hoveredNode.material.color.setHex(hoveredNode.userData.originalColor);
                    hoveredNode = null;
                    mountRef.current.style.cursor = 'default';

                    if (onHoverSkill) onHoverSkill(null);
                }
            }
        };

        const handleResize = () => {
            if (!initialized || !mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        };

        window.addEventListener('resize', handleResize);
        // Bind mouse move to container rather than document so it's localized
        const currentMount = mountRef.current;
        if (currentMount) {
            currentMount.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeEventListener('mousemove', handleMouseMove);
            }
            cancelAnimationFrame(animationId);

            if (initialized) {
                // Dispose geometries and materials
                scene.traverse((object) => {
                    if (object.isMesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(mat => mat.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });
                renderer.dispose();
                if (currentMount && renderer.domElement) {
                    if (currentMount.contains(renderer.domElement)) {
                        currentMount.removeChild(renderer.domElement);
                    }
                }
            }
        };
    }, [skills, onHoverSkill]);

    return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
};

export default SkillsSphere;
