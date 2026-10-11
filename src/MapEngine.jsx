import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  ArrowDownToLine, 
  Loader2, 
  Sparkles, 
  Navigation, 
  Compass, 
  Trophy, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Baby
} from 'lucide-react';

/**
 * MapEngine Component - Live OpenStreetMap & Distinct Mobile Screens
 * 
 * Features:
 * 1. State Management: activeScreen ('map' | 'restrooms' | 'sidequests')
 * 2. 'map' Screen:
 *    - Fully functional OpenStreetMap iframe embed
 *    - Floating action grid at the bottom ("Find Restrooms" & "Nearby Sidequests")
 *    - Offline Region Download simulation ("Tokyo - 42MB")
 * 3. 'restrooms' Screen:
 *    - Sticky header with back button to 'map'
 *    - Clean scrollable list of 3 restroom cards with icon, distance, and Free/Paid tags
 * 4. 'sidequests' Screen:
 *    - Sticky header with back button to 'map'
 *    - Clean scrollable list of 3 sidequest cards with XP rewards (+50 XP, etc.)
 */
export default function MapEngine() {
  const [activeScreen, setActiveScreen] = useState('map'); // 'map' | 'restrooms' | 'sidequests'
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'downloaded'
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [completedQuests, setCompletedQuests] = useState([]);
  const intervalRef = useRef(null);

  // 3-Second Offline Region Download Simulation
  const startDownloadSimulation = () => {
    if (downloadState === 'downloading') return;

    if (downloadState === 'downloaded') {
      setDownloadState('idle');
      setDownloadProgress(0);
      return;
    }

    setDownloadState('downloading');
    setDownloadProgress(0);

    const totalDurationMs = 3000;
    const intervalMs = 100;
    const totalSteps = totalDurationMs / intervalMs; // 30 steps
    let currentStep = 0;

    intervalRef.current = setInterval(() => {
      currentStep += 1;
      const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setDownloadProgress(progressPercent);

      if (currentStep >= totalSteps) {
        clearInterval(intervalRef.current);
        setDownloadState('downloaded');
        setDownloadProgress(100);
      }
    }, intervalMs);
  };

  const toggleQuest = (id) => {
    setCompletedQuests(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  // ==========================================
  // SCREEN 2: RESTROOMS SCREEN
  // ==========================================
  if (activeScreen === 'restrooms') {
    const restrooms = [
      {
        id: 1,
        name: "Shinjuku Station South Exit Public Restroom",
        location: "Inside Station Concourse near Exit 4",
        distance: "0.2 km",
        time: "2 min walk",
        type: "Free",
        cleanliness: "Sparkling Clean",
        features: ["Accessible", "Heated Washlet", "Baby Changing Station"]
      },
      {
        id: 2,
        name: "Takashimaya Times Square Restroom (4F)",
        location: "Adjacent to Central Escalator Bay",
        distance: "0.4 km",
        time: "5 min walk",
        type: "Free",
        cleanliness: "Luxury Grade",
        features: ["Quiet Lounge", "Touchless Faucets", "Full Accessibility"]
      },
      {
        id: 3,
        name: "Shinjuku Gyoen Park Gate Pavilion",
        location: "Right of Shinjuku Gate Entryway",
        distance: "0.6 km",
        time: "8 min walk",
        type: "Paid (¥100)",
        cleanliness: "Well Maintained",
        features: ["Attendant on duty", "Eco-friendly Flush", "Spacious Stalls"]
      }
    ];

    return (
      <div className="flex flex-col h-full w-full space-y-3.5 select-none animate-in fade-in">
        {/* Sticky Header with Back Button */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-sky-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveScreen('map')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-sky-50 active:scale-95 text-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Back to Map"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">Nearby Restrooms</h2>
              <p className="text-[10px] text-sky-700 font-semibold">3 facilities within walking distance</p>
            </div>
          </div>

          <div className="text-xl select-none">
            🚽
          </div>
        </div>

        {/* Scrollable Restroom Cards */}
        <div className="space-y-3 pb-2">
          {restrooms.map((spot) => (
            <div 
              key={spot.id}
              className="bg-white rounded-3xl p-4 border border-sky-100 shadow-sm space-y-3 transition hover:border-sky-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                    🚽
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {spot.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {spot.location}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 border ${
                  spot.type === 'Free' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {spot.type}
                </span>
              </div>

              {/* Distance & Walking Time Pill */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl">
                <span className="flex items-center gap-1 text-sky-700 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  {spot.distance}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {spot.time}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-semibold text-[10px]">
                  {spot.cleanliness}
                </span>
              </div>

              {/* Amenities tags */}
              <div className="flex flex-wrap gap-1.5">
                {spot.features.map((feat, idx) => (
                  <span 
                    key={idx}
                    className="text-[10px] font-medium bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* Quick Action */}
              <button
                onClick={() => alert(`Starting turn-by-turn walking route to ${spot.name}...`)}
                className="w-full py-2 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-100"
              >
                <Navigation className="w-3.5 h-3.5 -rotate-45 text-sky-600" />
                <span>Get Walking Directions</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 3: SIDEQUESTS SCREEN
  // ==========================================
  if (activeScreen === 'sidequests') {
    const quests = [
      {
        id: 'quest-1',
        title: "Find the hidden ramen shop",
        distance: "0.3 km",
        time: "3 min away",
        points: "+50 XP",
        category: "Foodie Discovery",
        desc: "Locate the secret 6-stool counter ramen shop tucked behind the indigo noren curtain in Omoide Yokocho.",
        tag: "Secret Alley"
      },
      {
        id: 'quest-2',
        title: "Take a photo with the Hachiko statue",
        distance: "0.8 km",
        time: "9 min away",
        points: "+35 XP",
        category: "Tokyo Legend",
        desc: "Pay your respects to Tokyo's most loyal canine companion outside the bustling Shibuya crossing scramble.",
        tag: "Iconic Landmark"
      },
      {
        id: 'quest-3',
        title: "Discover the rooftop Inari shrine",
        distance: "1.1 km",
        time: "14 min away",
        points: "+75 XP",
        category: "Hidden Sacred Site",
        desc: "Climb the narrow fire escape staircase to discover a miniature vermilion Torii shrine overlooking neon alleys.",
        tag: "Rare Achievement"
      }
    ];

    return (
      <div className="flex flex-col h-full w-full space-y-3.5 select-none animate-in fade-in">
        {/* Sticky Header with Back Button */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-sky-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveScreen('map')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-sky-50 active:scale-95 text-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Back to Map"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">Local Sidequests</h2>
              <p className="text-[10px] text-sky-700 font-semibold">Explore hidden gems & earn traveler XP</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-xs font-black text-amber-700 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>XP Tracker</span>
          </div>
        </div>

        {/* Scrollable Sidequest Cards */}
        <div className="space-y-3 pb-2">
          {quests.map((quest) => {
            const isCompleted = completedQuests.includes(quest.id);

            return (
              <div 
                key={quest.id}
                className={`bg-white rounded-3xl p-4 border transition shadow-sm space-y-3 ${
                  isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-sky-100 hover:border-sky-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {quest.category}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        • {quest.tag}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {quest.title}
                    </h3>
                  </div>

                  {/* Imaginary Points Reward Badge */}
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black shadow-xs shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-slate-950" />
                    <span>{quest.points}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {quest.desc}
                </p>

                {/* Distance and Location Details */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1 text-sky-700">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      {quest.distance}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">
                      {quest.time}
                    </span>
                  </div>

                  {/* Complete / Check-in Button */}
                  <button
                    onClick={() => toggleQuest(quest.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-sm' 
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 shadow-sm'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed!</span>
                      </>
                    ) : (
                      <>
                        <span>Check In</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 1: MAIN 'map' SCREEN
  // ==========================================
  return (
    <div className="flex flex-col h-full w-full space-y-3.5 select-none relative animate-in fade-in">
      {/* FLOATING "DOWNLOAD REGION" CARD: "Tokyo - 42MB" */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm border border-sky-100 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-xs ${
                downloadState === 'downloaded'
                  ? 'bg-emerald-500 text-white'
                  : downloadState === 'downloading'
                  ? 'bg-sky-500 text-white animate-pulse'
                  : 'bg-sky-50 text-sky-600 border border-sky-100'
              }`}
            >
              {downloadState === 'downloaded' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : downloadState === 'downloading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowDownToLine className="w-5 h-5" />
              )}
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                Tokyo - 42MB
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                {downloadState === 'downloaded'
                  ? 'Offline vector cache active • Zero data mode'
                  : downloadState === 'downloading'
                  ? `Downloading vector tiles (${downloadProgress}%)...`
                  : 'Downloads raw geographic coordinates and JSON data cache for offline map rendering.'}
              </p>
            </div>
          </div>

          <button
            onClick={startDownloadSimulation}
            disabled={downloadState === 'downloading'}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer ${
              downloadState === 'downloaded'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : downloadState === 'downloading'
                ? 'bg-sky-100 text-sky-700 font-extrabold cursor-wait'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
            }`}
          >
            {downloadState === 'downloaded'
              ? 'Downloaded ✅'
              : downloadState === 'downloading'
              ? `${downloadProgress}%`
              : 'Download Offline Data (.json)'}
          </button>
        </div>

        {downloadState === 'downloading' && (
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-100 ease-linear shadow-sm"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* FULLY FUNCTIONAL OPENSTREETMAP IFRAME EMBED (REPLACING PLACEHOLDER) */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
        <iframe
          width="100%"
          height="400px"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=139.5%2C35.5%2C139.9%2C35.9&amp;layer=mapnik"
          className="border-0 rounded-2xl shadow-inner w-full block"
          title="Tokyo Live OpenStreetMap"
        />

        {/* Live Map Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live OpenStreetMap • Tokyo</span>
        </div>
      </div>

      {/* FLOATING ACTION MENU GRID AT THE BOTTOM OF THE MAP VIEW */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        <button
          onClick={() => setActiveScreen('restrooms')}
          className="py-3 px-3 bg-white hover:bg-sky-50 active:scale-95 text-slate-800 font-bold rounded-2xl border border-sky-100 shadow-sm flex items-center justify-center gap-2 text-xs transition cursor-pointer"
        >
          <span className="text-base select-none">🚽</span>
          <span>Find Restrooms</span>
        </button>

        <button
          onClick={() => setActiveScreen('sidequests')}
          className="py-3 px-3 bg-white hover:bg-sky-50 active:scale-95 text-slate-800 font-bold rounded-2xl border border-sky-100 shadow-sm flex items-center justify-center gap-2 text-xs transition cursor-pointer"
        >
          <span className="text-base select-none">🗺️</span>
          <span>Nearby Sidequests</span>
        </button>
      </div>
    </div>
  );
}
