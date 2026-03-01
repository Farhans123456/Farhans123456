import React, { createContext, useContext, useState, useEffect } from 'react';

const PortfolioContext = createContext();

export const usePortfolio = () => {
    return useContext(PortfolioContext);
};

export const PortfolioProvider = ({ children }) => {
    // Determine if device is mobile or if user prefers reduced motion for initial 'lite mode' guess
    const [isLiteMode, setIsLiteMode] = useState(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Simple heuristic for lower-end devices or mobile (less than 768px width)
        const isMobile = window.innerWidth <= 768;
        return prefersReducedMotion || isMobile; // Default to lite mode on mobile for performance safety
    });

    const [activeSection, setActiveSection] = useState('hero');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    // Toggle Lite Mode manually
    const toggleLiteMode = () => {
        setIsLiteMode(prev => !prev);
    };

    // Keep track of scroll to update active section (simplistic version, can be expanded)
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'about', 'services', 'experience', 'projects', 'contact'];
            let current = 'hero';

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // If the section is primarily in the top half of the screen
                    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                        current = section;
                        break;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const value = {
        isLiteMode,
        toggleLiteMode,
        activeSection,
        setActiveSection,
        isMenuOpen,
        setIsMenuOpen,
        isBookingOpen,
        setIsBookingOpen
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
};
