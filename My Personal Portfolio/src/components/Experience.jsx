import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const experience = [
    {
        role: "Computer Science Engineer",
        company: "Academic & Personal Projects",
        year: "2023 - 2024",
        desc: "Leading development of complex systems, from AI algorithms to full-stack applications. Focusing on clean architecture and scalable code."
    },
    {
        role: "Cybersecurity Analyst",
        company: "Independent Research",
        year: "2024 - 2025",
        desc: "Conducting vulnerability assessments, penetration testing, and designing secure network protocols."
    },
    {
        role: "AI & ML Explorer",
        company: "Self-Driven Studies",
        year: "2025 - 2026",
        desc: "Experimenting with neural networks, natural language processing, and predictive analytics to solve real-world problems."
    },
    {
        role: "WebGL & Frontend Innovator",
        company: "Personal Portfolio & Projects",
        year: "2026 - Present",
        desc: "Architecting immersive 3D web experiences, optimizing performance, and building interactive generative AI interfaces and Geospatial HUDs."
    }
];

const Experience = () => {
    const sectionRef = useScrollAnimation();

    return (
        <section ref={sectionRef} id="experience" className="section-padding fade-up">
            <div className="container">
                <h2 className="section-title">Journey & Experience</h2>
                <div className="timeline">
                    {experience.map((item, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content glass-card">
                                <span className="timeline-year">{item.year}</span>
                                <h3 className="timeline-role">{item.role}</h3>
                                <p className="timeline-company">{item.company}</p>
                                <p className="timeline-desc">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
