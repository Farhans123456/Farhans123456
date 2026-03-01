import React, { Suspense } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import HUD from './components/ui/HUD';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Services from './components/Services';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Traits from './components/Traits';
import Contact from './components/Contact';
import Footer from './components/Footer';
import DevModeOverlay from './components/ui/DevModeOverlay';
import BookingForm from './components/BookingForm';

const GalaxyHero = React.lazy(() => import('./components/three/r3f/GalaxyHero'));

const AppContent = () => {
  const { activeSection, setActiveSection, isLiteMode } = usePortfolio();

  const handleNavigate = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-main" style={{ position: 'relative', zIndex: 1 }}>
      <HUD />
      <DevModeOverlay />
      <BookingForm />

      {!isLiteMode && (
        <Suspense fallback={null}>
          <GalaxyHero activeSection={activeSection} onNavigate={handleNavigate} />
        </Suspense>
      )}

      <main style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
        {/* Pointer events none on main prevents blocking the 3D canvas globally.
                    The inner .container classes have pointer-events: auto to keep buttons clickable */}
        <Hero />
        <Traits />
        <About />
        <Skills />
        <Services />
        <Experience />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}

export default App;
