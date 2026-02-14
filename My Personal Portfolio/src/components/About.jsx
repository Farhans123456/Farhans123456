import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { ChevronRight, Github, Linkedin, Mail, Code, Cpu, Globe, Zap } from 'lucide-react';

const About = () => {
    const sectionRef = useScrollAnimation();

    const stats = [
        { label: 'Years Exp.', value: '2+', icon: <Zap size={18} color="#00f3ff" /> },
        { label: 'Projects', value: '15+', icon: <Code size={18} color="#7b2cbf" /> },
        { label: 'Clients', value: '5+', icon: <Globe size={18} color="#2ec4b6" /> },
        { label: 'Tech Stack', value: '10+', icon: <Cpu size={18} color="#ff9f1c" /> }
    ];

    const skills = ["React", "Node.js", "Python", "Cybersecurity", "TensorFlow", "AWS"];
    const interests = ["AI Research", "Blockchain", "Penetration Testing", "UI/UX Design"];

    return (
        <section ref={sectionRef} id="about" className="section-padding about-section">
            <div className="container">
                <div className="about-container">
                    {/* Left Column: Content */}
                    <div className="about-content">
                        <div className="section-header">
                            <h2 className="about-title">About <span className="text-gradient">Me</span></h2>
                        </div>

                        <p className="about-description">
                            I’m Farhan, a Computer Science Engineering student passionate about <span className="text-highlight">Cybersecurity</span>, <span className="text-highlight">AI</span>, and <span className="text-highlight">Machine Learning</span>. I work with Linux, SQL, and automation, building practical AI-based projects.
                        </p>
                        <p className="about-description">
                            Alongside programming, I create digital content and edit videos, simplifying complex concepts—especially mathematics. I’m focused on continuous learning and combining technical depth with creativity. 🚀
                        </p>

                        <div className="about-tags-section">
                            <h3 className="tag-heading"><ChevronRight size={16} className="tag-icon" /> Skills</h3>
                            <div className="tags-grid">
                                {skills.map((skill, index) => (
                                    <span key={index} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="about-tags-section">
                            <h3 className="tag-heading"><ChevronRight size={16} className="tag-icon purple" /> Interests</h3>
                            <div className="tags-grid">
                                {interests.map((interest, index) => (
                                    <span key={index} className="interest-tag">{interest}</span>
                                ))}
                            </div>
                        </div>

                        <div className="social-row">
                            <a href="https://github.com/Farhans123456" target="_blank" rel="noopener noreferrer" className="social-btn"><Github size={20} /></a>
                            <a href="https://www.linkedin.com/in/farhan-shaikh-753551358/" target="_blank" rel="noopener noreferrer" className="social-btn"><Linkedin size={20} /></a>
                            <a href="mailto:f98561965@gmail.com" className="social-btn"><Mail size={20} /></a>

                        </div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="about-visuals">
                        <div className="profile-card glass-card">
                            <div className="profile-image-container">
                                {/* Placeholder Gradient Art */}
                                <div className="profile-placeholder-art"></div>
                                <div className="profile-overlay">
                                    <div className="profile-info">
                                        <h3 className="profile-name">Farhan Shaikh</h3>
                                        <p className="profile-title">Computer Science Engineer</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stats-row">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-card glass-card">
                                    <div className="stat-header">
                                        {stat.icon}
                                    </div>
                                    <span className="stat-value">{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
