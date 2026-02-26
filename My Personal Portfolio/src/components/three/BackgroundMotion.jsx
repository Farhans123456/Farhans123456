import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BackgroundMotion = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();

        // Camera setup - Orthographic for 2D shader
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'low-power'
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Geometry - simple plane filling the screen
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Shader Material - extremely lightweight gradient/nebula math
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;
        
        void main() {
          vec2 p = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
          p.x *= uResolution.x / uResolution.y;
          
          // Soft fluid distortion using sin/cos
          float t = uTime * 0.15;
          vec2 pos = vec2(
            p.x + sin(p.y * 2.0 + t) * 0.2,
            p.y + cos(p.x * 2.0 + t * 0.8) * 0.2
          );
          
          float d = length(pos);
          
          // Color palette matching the theme
          vec3 purple = vec3(0.48, 0.17, 0.75); // #7b2cbf equivalent
          vec3 cyan = vec3(0.0, 0.95, 1.0);     // #00f3ff equivalent
          
          float glow = max(0.0, 1.0 - d * 0.8);
          // Very strong blend for visibility
          vec3 color = mix(purple * 1.5, cyan * 1.5, glow * sin(t + pos.x) + 0.5);
          
          // Add a bit of additive base
          color += purple * 0.8 * (1.0 - length(p - vec2(0.5, 0.5)));
          
          gl_FragColor = vec4(color, 1.0); // opacity managed by canvas alpha and CSS
        }
      `,
            transparent: true,
            depthWrite: false,
            depthTest: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Animation loop with FPS cap
        const clock = new THREE.Clock();
        let animationId;
        let resizeTimeout;
        const targetFPS = 60;
        const frameDelay = 1000 / targetFPS; // 16.66ms
        let lastTime = 0;

        const animate = (time) => {
            animationId = requestAnimationFrame(animate);

            if (time - lastTime < frameDelay) return;
            lastTime = time;

            const elapsedTime = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsedTime;

            renderer.render(scene, camera);
        };

        animationId = requestAnimationFrame(animate);

        // Initial time setup
        clock.start();

        // Handle Resize (Debounced)
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
            }, 200);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            geometry.dispose();
            material.dispose();
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
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none',
                opacity: 0.8 // Blend with existing CSS background
            }}
            aria-hidden="true"
        />
    );
};

export default BackgroundMotion;
