import React, { useRef, useState } from 'react';

const TiltCard = ({ children, className = '', style = {} }) => {
    const cardRef = useRef(null);
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    const [isHovered, setIsHovered] = useState(false);

    // For calculating the dynamic rim light/glare position
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        const centerX = width / 2;
        const centerY = height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);

        // Update glare position (percentage)
        setGlarePos({
            x: (x / width) * 100,
            y: (y / height) * 100
        });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    };

    return (
        <div
            ref={cardRef}
            className={`tilt-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                transform,
                transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
                boxShadow: isHovered ? '0 10px 40px rgba(157, 78, 221, 0.4)' : '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                position: 'relative' // Ensure children layer correctly
            }}
        >
            {/* Dynamic CSS rim light/glare that follows the cursor */}
            <div
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                    pointerEvents: 'none',
                    background: isHovered
                        ? `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`
                        : 'transparent',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    mixBlendMode: 'overlay',
                }}
            />
            {/* Extremely subtle rim light border overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9,
                    pointerEvents: 'none',
                    borderRadius: 'inherit',
                    boxShadow: isHovered ? `inset 0 0 0 1px rgba(255,255,255,0.2)` : 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                    transition: 'box-shadow 0.3s ease'
                }}
            />

            {typeof children === 'function' ? children(isHovered) : children}
        </div>
    );
};

export default TiltCard;
