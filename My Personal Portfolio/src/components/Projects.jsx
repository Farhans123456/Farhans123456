import React from 'react';
import TiltCard from './TiltCard';
import useScrollAnimation from '../hooks/useScrollAnimation';

const projects = [
    {
        title: "AI Assistant",
        category: "Cybersecurity & ML",
        image: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" // Placeholder gradient
    },
    {
        title: "Coming Soon",
        category: "Data Visualization",
        image: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)"
    },
    {
        title: "Coming Soon",
        category: "Web Development",
        image: "linear-gradient(135deg, #000000 0%, #434343 100%)"
    }
];

const Projects = () => {
    const sectionRef = useScrollAnimation();

    return (
        <section ref={sectionRef} id="projects" className="section-padding fade-up">
            <div className="container">
                <h2 className="section-title">Featured Projects</h2>
                <div className="projects-grid">
                    {projects.map((project, index) => (
                        <TiltCard key={index} className="project-card glass-card blurred-card" style={{ overflow: 'hidden' }}>
                            {(isHovered) => (
                                <>
                                    <div className="project-background" style={{ background: project.image, zIndex: 1, position: 'relative' }}></div>
                                    <div className="coming-soon-overlay" style={{ zIndex: 2, position: 'relative', pointerEvents: 'none' }}>
                                        <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</span>
                                        <h3 style={{ marginBottom: '0.25rem' }}>Coming Soon</h3>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{project.title}</p>
                                    </div>
                                </>
                            )}
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
