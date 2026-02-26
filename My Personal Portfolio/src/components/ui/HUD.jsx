import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Zap, ZapOff, Menu, X, Home, User, Briefcase, FileText, Code, Mail } from 'lucide-react';
import './HUD.css'; // We'll create this next

const HUD = () => {
    const { isLiteMode, toggleLiteMode, activeSection, isMenuOpen, setIsMenuOpen } = usePortfolio();

    const navItems = [
        { id: 'hero', icon: <Home size={18} />, label: 'Home' },
        { id: 'about', icon: <User size={18} />, label: 'About' },
        { id: 'services', icon: <Briefcase size={18} />, label: 'Services' },
        { id: 'experience', icon: <FileText size={18} />, label: 'Experience' },
        { id: 'projects', icon: <Code size={18} />, label: 'Projects' },
        { id: 'contact', icon: <Mail size={18} />, label: 'Contact' }
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    return (
        <div className="global-hud">
            {/* Top Right Controls */}
            <div className="hud-controls glass-panel">
                <button
                    className={`icon-btn ${isLiteMode ? 'active-lite' : ''}`}
                    onClick={toggleLiteMode}
                    title={isLiteMode ? "Enable 3D Features" : "Enable Lite Mode (2D)"}
                    aria-label="Toggle 3D rendering modes"
                >
                    {isLiteMode ? <ZapOff size={18} /> : <Zap size={18} />}
                </button>
                <button
                    className="icon-btn mobile-menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Compact Nav (Visible on desktop or when menu open on mobile) */}
            <div className={`hud-nav glass-panel ${isMenuOpen ? 'open' : ''}`}>
                <div className="hud-nav-items">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`hud-nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(item.id)}
                            title={item.label}
                        >
                            <span className="hud-icon">{item.icon}</span>
                            <span className="hud-label">{item.label}</span>
                        </button>
                    ))}
                </div>
                {/* Active Section Indicator Line */}
                <div
                    className="hud-active-indicator"
                    style={{
                        transform: `translateY(${navItems.findIndex(i => i.id === activeSection) * 44}px)`
                    }}
                />
            </div>
        </div>
    );
};

export default HUD;
