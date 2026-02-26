import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HeroParticles = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Determine particle count based on screen width (simple mobile check)
        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 600 : 1200;

        // Scene setup
        const scene = new THREE.Scene();

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile,
            powerPreference: 'low-power'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        mountRef.current.appendChild(renderer.domElement);

        // Particles Geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const originalPositions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Create a cylindrical/spherical distribution for a "tunnel" or "field" look
            const radius = 20 + Math.random() * 80;
            const angle = Math.random() * Math.PI * 2;
            const z = (Math.random() - 0.5) * 200;

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            velocities[i] = 0.05 + Math.random() * 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Particle Material
        // Create a circular sprite texture programmatically for soft particles
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: isMobile ? 3.0 : 5.0,
            color: 0x9d4edd, // Primary glow color
            map: texture,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particlesList = new THREE.Points(geometry, material);
        scene.add(particlesList);

        // Interactivity state
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        let scrollY = window.scrollY;

        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        const onDocumentMouseMove = (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.05;
            mouseY = (event.clientY - windowHalfY) * 0.05;
        };

        const onWindowScroll = () => {
            scrollY = window.scrollY;
        };

        document.addEventListener('mousemove', onDocumentMouseMove);
        window.addEventListener('scroll', onWindowScroll, { passive: true });

        // Intersection Observer to pause rendering when out of viewport
        let isVisible = true;
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        });
        // We observe the parent section, but here we can just observe our mount point
        observer.observe(mountRef.current);

        // Animation variables
        const clock = new THREE.Clock();
        let animationId;
        const targetFPS = 60;
        const frameDelay = 1000 / targetFPS;
        let lastTime = 0;

        const animate = (time) => {
            animationId = requestAnimationFrame(animate);

            if (!isVisible) return; // Pause animation computation if not visible

            if (time - lastTime < frameDelay) return;
            lastTime = time;

            const delta = clock.getDelta();

            // Smooth mouse follow (damping)
            targetX = mouseX * 0.5;
            targetY = mouseY * 0.5;

            camera.position.x += (targetX - camera.position.x) * 0.02;
            camera.position.y += (-targetY - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            // Animate particles
            const positionsAttr = geometry.attributes.position;
            const posArray = positionsAttr.array;

            for (let i = 0; i < particleCount; i++) {
                // Slowly move particles on Z axis
                posArray[i * 3 + 2] += velocities[i];

                // Reset if too far forward
                if (posArray[i * 3 + 2] > 100) {
                    posArray[i * 3 + 2] = -100;
                }

                // Apply scroll dispersion (push particles out from center based on scroll)
                // Max dispersion factor limits how far they fly
                const dispersionFactor = Math.min(scrollY * 0.02, 30);

                // Original X/Y target plus dispersion
                const origX = originalPositions[i * 3];
                const origY = originalPositions[i * 3 + 1];

                // Direction vector from center
                const length = Math.sqrt(origX * origX + origY * origY) || 1;
                const dirX = origX / length;
                const dirY = origY / length;

                // Add subtle wave movement
                const wave = Math.sin(time * 0.001 + i) * 2.0;

                posArray[i * 3] = origX + dirX * dispersionFactor + wave;
                posArray[i * 3 + 1] = origY + dirY * dispersionFactor + wave;
            }
            positionsAttr.needsUpdate = true;

            // Rotate the entire system slowly
            particlesList.rotation.z -= delta * 0.05;

            renderer.render(scene, camera);
        };

        animationId = requestAnimationFrame(animate);

        // Window Resize
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            }, 200);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            document.removeEventListener('mousemove', onDocumentMouseMove);
            window.removeEventListener('scroll', onWindowScroll);
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
            cancelAnimationFrame(animationId);

            geometry.dispose();
            material.dispose();
            texture.dispose();
            renderer.dispose();

            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden'
            }}
            aria-hidden="true"
        />
    );
};

export default HeroParticles;
