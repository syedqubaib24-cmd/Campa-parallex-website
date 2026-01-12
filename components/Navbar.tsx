
import React from 'react';
import { NAV_LINKS } from '../constants';
import { ThemeMode } from '../types';

interface NavbarProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  activeSection: string;
  themeColor: string;
}

const Navbar: React.FC<NavbarProps> = ({ mode, setMode, activeSection, themeColor }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 transition-colors duration-500 ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
      <div className="text-2xl font-black tracking-tighter">CAMPA</div>
      
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a 
            key={link.name} 
            href={link.href}
            className={`text-xs uppercase tracking-widest font-bold transition-all hover:opacity-100 ${activeSection === link.href.slice(1) ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: activeSection === link.href.slice(1) ? themeColor : undefined }}
          >
            {link.name}
          </a>
        ))}
      </div>

      <button 
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-full border border-current opacity-60 hover:opacity-100 transition-opacity"
      >
        {mode === 'dark' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>
    </nav>
  );
};

export default Navbar;
