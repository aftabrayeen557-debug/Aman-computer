import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RealDoorsSection from './components/RealDoorsSection';
import TimeTravelStory from './components/TimeTravelStory';
import SkillPageView from './components/SkillPageView';
import MyStoryView from './components/MyStoryView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsConditionsView from './components/TermsConditionsView';
import Footer from './components/Footer';
import HolographicCardModal from './components/HolographicCardModal';
import { NavigationPage } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [isAbilityCardOpen, setIsAbilityCardOpen] = useState(false);

  const openWhatsApp = () => {
    window.open('https://wa.me/918595515718', '_blank', 'noopener,noreferrer');
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rt_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.replace('#', '') as string;
      if (hash === 'privacy' || hash === 'legal') hash = 'privacy-policy';
      if (hash === 'terms') hash = 'terms-and-conditions';
      
      const validPages: NavigationPage[] = [
        'home',
        'web-development',
        'app-development',
        'ui-ux',
        'graphic-design',
        'photography',
        'my-story',
        'contact',
        'privacy-policy',
        'terms-and-conditions',
      ];
      if (hash === 'contact') {
        openWhatsApp();
        setCurrentPage('home');
      } else if (validPages.includes(hash as NavigationPage)) {
        setCurrentPage(hash as NavigationPage);
      } else if (!hash) {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update theme on html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-mode', 'dark');
      localStorage.setItem('rt_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-mode');
      localStorage.setItem('rt_dark_mode', 'false');
    }
  }, [darkMode]);

  const navigateToPage = (page: NavigationPage) => {
    if (page === 'contact') {
      openWhatsApp();
      return;
    }
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreWork = () => {
    const el = document.querySelector('#works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigateToPage('home');
    }
  };

  const isSkillDoorPage = [
    'web-development',
    'app-development',
    'ui-ux',
    'graphic-design',
    'photography',
  ].includes(currentPage);

  return (
    <div className="min-h-screen bg-[#E8E4E0] dark:bg-[#1A1818] text-[#1A1818] dark:text-[#E8E4E0] flex flex-col font-sans selection:bg-[#1A1818] selection:text-[#E8E4E0] dark:selection:bg-[#E8E4E0] dark:selection:text-[#1A1818] transition-colors duration-300">
      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={navigateToPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onHireClick={openWhatsApp}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            <Hero
              onHireClick={openWhatsApp}
              onExploreWork={handleExploreWork}
              onAbilityCardClick={() => setIsAbilityCardOpen(true)}
            />
            <RealDoorsSection onOpenDoor={(page) => navigateToPage(page)} />
            <TimeTravelStory />
          </>
        )}

        {isSkillDoorPage && (
          <SkillPageView
            page={currentPage}
            onBack={() => navigateToPage('home')}
            onContactClick={openWhatsApp}
          />
        )}

        {currentPage === 'my-story' && (
          <MyStoryView
            onBack={() => navigateToPage('home')}
            onContactClick={openWhatsApp}
          />
        )}

        {currentPage === 'privacy-policy' && (
          <PrivacyPolicyView
            onBack={() => navigateToPage('home')}
            onNavigateToTerms={() => navigateToPage('terms-and-conditions')}
          />
        )}

        {currentPage === 'terms-and-conditions' && (
          <TermsConditionsView
            onBack={() => navigateToPage('home')}
            onNavigateToPrivacy={() => navigateToPage('privacy-policy')}
          />
        )}
      </main>

      {/* Site Footer */}
      <Footer
        onHireClick={openWhatsApp}
        onNavigate={navigateToPage}
      />

      {/* Holographic 3D Ability Card Modal */}
      <HolographicCardModal
        isOpen={isAbilityCardOpen}
        onClose={() => setIsAbilityCardOpen(false)}
      />
    </div>
  );
}
