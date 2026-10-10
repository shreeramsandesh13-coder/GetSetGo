import React, { useState } from 'react';
import { MessageSquare, Scan, Map } from 'lucide-react';
import DeluluChat from './DeluluChat';
import AiScanner from './AiScanner';
import MapFeature from './MapFeature';
import Auth from './Auth';

/**
 * App Component - Onboarding & Main Mobile Shell with Bottom Navigation
 * 
 * Features:
 * - Preserves the exact intro animation and login UI (Auth.jsx)
 * - State management: isAuthenticated and activeTab ('map' | 'chat' | 'scan')
 * - Main App View (after login): constrained mobile shell (max-w-[430px])
 * - Fixed Bottom Navigation: AI Guide (Chat), Explore (Map), Scanner (Scan)
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="w-full h-[100dvh] bg-slate-950 flex items-center justify-center overflow-hidden">
      {!isAuthenticated ? (
        /* ORIGINAL ONBOARDING & LOGIN SCREEN (WITH GET... SET... GO... ANIMATION) */
        <div className="max-w-[430px] w-full mx-auto h-[100dvh] bg-slate-50 relative overflow-hidden shadow-2xl sm:border border-slate-200 sm:rounded-[2rem] flex flex-col">
          <Auth onLogin={() => setIsAuthenticated(true)} />
        </div>
      ) : (
        /* MAIN APP VIEW (AFTER LOGIN) */
        <div className="max-w-[430px] w-full mx-auto h-[100dvh] bg-slate-50 relative overflow-hidden flex flex-col shadow-2xl sm:border border-slate-200 sm:rounded-[2rem] font-sans">
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto pb-20 no-scrollbar [scrollbar-width:none]">
            {activeTab === 'chat' && <DeluluChat />}
            {activeTab === 'scan' && <AiScanner />}
            {activeTab === 'map' && <MapFeature />}
          </div>

          {/* Bottom Navigation Bar */}
          <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {/* Button 1: AI Guide */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer ${
                activeTab === 'chat' ? 'text-blue-600 font-bold' : 'text-slate-400'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">AI Guide</span>
            </button>

            {/* Button 2: Explore */}
            <button
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer ${
                activeTab === 'map' ? 'text-blue-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="text-xs">Explore</span>
            </button>

            {/* Button 3: Scanner */}
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer ${
                activeTab === 'scan' ? 'text-blue-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Scan className="w-5 h-5" />
              <span className="text-xs">Scanner</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
