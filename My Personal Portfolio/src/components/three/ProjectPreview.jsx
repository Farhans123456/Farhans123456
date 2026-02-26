import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ProjectPreview = ({ isHovered }) => {
    const mountRef = useRef(null);
    const isHoveredRef = useRef(isHovered);

    useEffect(() => {
        isHoveredRef.current = isHovered;
    }, [isHovered]);

    useEffect(() => {
        if (!mountRef.current) return;

        let scene, camera, renderer, animationId;
        let isVisible = false;

        // Intersection Observer to pause rendering when offscreen
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        });
        observer.observe(mountRef.current);

        scene = new THREE.Scene();

        const width = mountRef.current.clientWidth || 300;
        const height = mountRef.current.clientHeight || 200;

        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        mountRef.current.appendChild(renderer.domElement);

        // Simple Plane with glowing shader material
        const geometry = new THREE.PlaneGeometry(3.5, 2.5, 16, 16);

        // Wireframe glowing material
        const material = new THREE.MeshBasicMaterial({
            color: 0x9d4edd,
            wireframe: true,
            transparent: true,
            opacity: 0.15 // base opacity
        });

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        const clock = new THREE.Clock();
        let currentOpacity = 0.15;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (!isVisible) return;

            const elapsedTime = clock.getElapsedTime();
            const targetOpacity = isHoveredRef.current ? 0.8 : 0.15;

            // Smooth opacity transition
            currentOpacity += (targetOpacity - currentOpacity) * 0.1;
            material.opacity = currentOpacity;

            // Gentle floating animation
            const positions = geometry.attributes.position;
            const posArray = positions.array;
            for (let i = 0; i < posArray.length; i += 3) {
                const x = posArray[i];
                const y = posArray[i + 1];
                posArray[i + 2] = Math.sin(x * 2.0 + elapsedTime * 2.0) * 0.1 + Math.cos(y * 2.0 + elapsedTime * 1.5) * 0.1;
            }
            positions.needsUpdate = true;

            // Rotate plane slightly
            plane.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;
            plane.rotation.y = Math.cos(elapsedTime * 0.5) * 0.1;

            // Faster rotation and depth pop on hover
            if (isHoveredRef.current) {
                plane.rotation.y += Math.sin(elapsedTime * 3.0) * 0.05;
                plane.rotation.x += Math.cos(elapsedTime * 3.0) * 0.05;
            }

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
            cancelAnimationFrame(animationId);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (mountRef.current && renderer.domElement) {
                if (mountRef.current.contains(renderer.domElement)) {
                    mountRef.current.removeChild(renderer.domElement);
                }
            }
        };
    }, []); // run once on mount

    return (
        <div
            ref={mountRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}
            aria-hidden="true"
        />
    );
};

export default ProjectPreview;
