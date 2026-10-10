import React, { useState } from 'react';
import { 
  Camera, 
  MessageSquare, 
  Map, 
  User, 
  Compass, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  LogOut 
} from 'lucide-react';
import AiScanner from './AiScanner';
import DeluluChat from './DeluluChat';
import MapEngine from './MapEngine';

/**
 * ProfileView Component
 */
function ProfileView({ onLogout }) {
  const travelerXP = 280;

  return (
    <div className="space-y-4 select-none pb-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 text-center space-y-3">
        <div className="relative w-18 h-18 mx-auto">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
            <User className="w-9 h-9" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow">
            ★
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">Alex Rivera</h2>
          <p className="text-xs text-sky-700 font-semibold flex items-center justify-center gap-1 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Wanderer • Level 4</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Visits</span>
            <p className="text-sm font-extrabold text-sky-700">14</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">XP</span>
            <p className="text-sm font-extrabold text-sky-700">{travelerXP}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Offline</span>
            <p className="text-sm font-extrabold text-sky-700">Tokyo</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Traveler Preferences
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Allergen Vision Shield
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              Delulu AI Companion
            </span>
            <span className="text-indigo-700 font-bold bg-indigo-100/70 px-2 py-0.5 rounded-full text-[10px]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Sidequest Radar
            </span>
            <span className="text-amber-700 font-bold bg-amber-100/70 px-2 py-0.5 rounded-full text-[10px]">
              Ready
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 font-bold rounded-2xl border border-rose-200/80 flex items-center justify-center gap-2 text-xs transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>
    </div>
  );
}

/**
 * Dashboard Component - The Shell & Grid
 * 
 * Rules:
 * - Fixed bottom navigation bar: h-20 pb-safe fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-200 z-50
 * - Tabs: Camera, Chat, Map, Profile
 * - Scroll Behavior: flex-1 overflow-y-auto pb-24 scrollbar-hide
 */
export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'chat' | 'map' | 'profile'

  const navTabs = [
    { id: 'camera', label: 'Camera', icon: Camera, subtitle: 'AI Vision Scanner' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, subtitle: 'Delulu The AI Guide' },
    { id: 'map', label: 'Map', icon: Map, subtitle: 'Unified Map Engine' },
    { id: 'profile', label: 'Profile', icon: User, subtitle: 'Traveler Dashboard' },
  ];

  const currentTabObj = navTabs.find((t) => t.id === activeTab);

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-slate-50 select-none">
      {/* Top Mobile App Header */}
      <header className="h-14 shrink-0 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 flex items-center justify-between z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xs shadow-sky-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">GetSetGo</h1>
            <p className="text-[10px] font-semibold text-sky-700 truncate max-w-[150px]">
              {currentTabObj?.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-sky-500" />
          <span>Tokyo • 24°C</span>
        </div>
      </header>

      {/* ACTIVE VIEW AREA: flex-1 overflow-y-auto pb-24 scrollbar-hide */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 py-3 scrollbar-hide">
        {activeTab === 'camera' && <AiScanner />}
        {activeTab === 'chat' && <DeluluChat />}
        {activeTab === 'map' && <MapEngine />}
        {activeTab === 'profile' && <ProfileView onLogout={onLogout} />}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR: h-20 pb-safe fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-200 z-50 */}
      <nav className="h-20 pb-safe fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-200 z-50 flex justify-around items-center shadow-[0_-4px_25px_rgba(14,165,233,0.08)]">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer ${
                isActive ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1 rounded-2xl transition ${
                  isActive ? 'bg-sky-50 text-sky-600 ring-1 ring-sky-200/50' : ''
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? 'text-sky-700 font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
