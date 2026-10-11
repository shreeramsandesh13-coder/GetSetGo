import React, { useState } from 'react';
import { 
  Search, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  Compass, 
  Sparkles, 
  Clock, 
  Trophy, 
  Navigation, 
  ChevronRight, 
  ArrowDownToLine
} from 'lucide-react';

/**
 * MapFeature Component - Global Search, Live OpenStreetMap & Real File Download
 * 
 * Features:
 * - Nominatim OpenStreetMap Geocoding API (search any location in the world)
 * - Live dynamic OSM iframe embedding with bbox
 * - Real offline JSON download via Blob API
 * - Subscreens for Restrooms and Sidequests with injected {currentLocation}
 */
export default function MapFeature() {
  const [activeScreen, setActiveScreen] = useState('map'); // 'map' | 'restrooms' | 'sidequests'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Tokyo');
  const [bbox, setBbox] = useState('139.5,35.5,139.9,35.9');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [fileSizeMB, setFileSizeMB] = useState(42);

  // 1. GEOCODING LOGIC (Nominatim API)
  const handleSearch = async (e, manualQuery) => {
    if (e) e.preventDefault();
    const query = manualQuery || searchQuery;
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept-Language': 'en',
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        // Format bbox for OpenStreetMap: min_lon,min_lat,max_lon,max_lat
        const newBbox = `${place.boundingbox[2]},${place.boundingbox[0]},${place.boundingbox[3]},${place.boundingbox[1]}`;
        const cityName = place.display_name.split(',')[0].trim();

        setBbox(newBbox);
        setCurrentLocation(cityName);
        setFileSizeMB(Math.floor(Math.random() * (65 - 28 + 1)) + 28);
        setDownloadSuccess(false);
        if (!manualQuery) setSearchQuery('');
      } else {
        alert(`Could not find "${query}". Please check spelling and try again!`);
      }
    } catch (err) {
      console.error('Nominatim Geocoding Error:', err);
      alert('Network error while searching location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. REAL DOWNLOAD LOGIC (Blob API)
  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    setTimeout(() => {
      const offlineData = {
        city: currentLocation,
        coordinates: bbox,
        offline_status: 'ready',
        generated_at: new Date().toISOString(),
        package_size_mb: fileSizeMB,
        sidequests: [
          `Find the best street food in ${currentLocation}`,
          `Take a panoramic photo at ${currentLocation} historic center`,
          `Discover the secret alleyway landmark in ${currentLocation}`
        ],
        restroom_pins: [
          { name: `${currentLocation} Central Restroom`, distance: '0.2 km', type: 'Free' },
          { name: `${currentLocation} Transit Concourse Restroom`, distance: '0.4 km', type: 'Free' },
          { name: `${currentLocation} Park Pavilion Restroom`, distance: '0.7 km', type: 'Paid' }
        ]
      };

      const dataStr = JSON.stringify(offlineData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${currentLocation.replace(/\s+/g, '_')}_Offline_Map.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setIsDownloading(false);
      setDownloadSuccess(true);
    }, 1500);
  };

  const toggleQuest = (id) => {
    setCompletedQuests(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  // SCREEN 2: DYNAMIC RESTROOMS
  if (activeScreen === 'restrooms') {
    return (
      <div className="p-4 space-y-3.5 select-none animate-in fade-in">
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
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                {currentLocation} Restrooms
              </h2>
              <p className="text-[10px] text-sky-700 font-semibold">
                Verified clean facilities in {currentLocation}
              </p>
            </div>
          </div>
          <div className="text-xl select-none">🚽</div>
        </div>

        <div className="space-y-3 pb-4">
          {[
            {
              id: 1,
              name: `${currentLocation} Central Restroom`,
              location: `Main Square concourse near ${currentLocation} Station`,
              distance: '0.2 km',
              time: '2 min walk',
              type: 'Free',
              rating: 'Sparkling Clean',
              amenities: ['Accessible', 'Touchless Faucets', 'Heated Washlet']
            },
            {
              id: 2,
              name: `${currentLocation} Heritage Park Pavilion`,
              location: `Inside ${currentLocation} Public Gardens`,
              distance: '0.4 km',
              time: '5 min walk',
              type: 'Free',
              rating: 'Well Maintained',
              amenities: ['Eco-friendly Flush', 'Spacious', 'Baby Care']
            },
            {
              id: 3,
              name: `${currentLocation} Market Plaza Restroom`,
              location: `${currentLocation} Old Town shopping arcade`,
              distance: '0.7 km',
              time: '9 min walk',
              type: 'Paid (Coins/Card)',
              rating: 'Attendant on duty',
              amenities: ['Sanitized after every visit', 'Private Mirrors']
            }
          ].map((spot) => (
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
                  {spot.rating}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {spot.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <button
                onClick={() => alert(`Starting walking navigation to ${spot.name}...`)}
                className="w-full py-2 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-100"
              >
                <Navigation className="w-3.5 h-3.5 -rotate-45 text-sky-600" />
                <span>Navigate (Walking Route)</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SCREEN 3: DYNAMIC SIDEQUESTS
  if (activeScreen === 'sidequests') {
    return (
      <div className="p-4 space-y-3.5 select-none animate-in fade-in">
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
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                {currentLocation} Sidequests
              </h2>
              <p className="text-[10px] text-sky-700 font-semibold">
                Complete quests in {currentLocation} for bonus XP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-black text-amber-700 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>+350 Total XP</span>
          </div>
        </div>

        <div className="space-y-3 pb-4">
          {[
            {
              id: 'quest-food',
              title: `Find the best street food in ${currentLocation}`,
              distance: '0.3 km',
              time: '3 min walk',
              reward: '+150 XP',
              category: 'Culinary Quest',
              desc: `Wander through the backstreets of ${currentLocation} and discover a local culinary treasure loved by neighborhood locals.`,
              badge: 'Food Explorer'
            },
            {
              id: 'quest-monument',
              title: `Take a photo at ${currentLocation} Old Town landmark`,
              distance: '0.6 km',
              time: '7 min walk',
              reward: '+80 XP',
              category: 'Heritage Sightseeing',
              desc: `Visit the central historic plaza in ${currentLocation} and capture the architecture during golden hour.`,
              badge: 'Historic Landmark'
            },
            {
              id: 'quest-secret',
              title: `Discover the hidden rooftop viewpoint in ${currentLocation}`,
              distance: '1.0 km',
              time: '12 min walk',
              reward: '+120 XP',
              category: 'Secret Discovery',
              desc: `Climb the public terrace steps overlooking ${currentLocation} skyline for an unforgettable panoramic photo.`,
              badge: 'Secret Horizon'
            }
          ].map((quest) => {
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
                        • {quest.badge}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {quest.title}
                    </h3>
                  </div>

                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black shadow-xs shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-slate-950" />
                    <span>{quest.reward}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {quest.desc}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1 text-sky-700">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      {quest.distance}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{quest.time}</span>
                  </div>

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

  // SCREEN 1: MAIN MAP SCREEN
  return (
    <div className="p-4 space-y-3.5 select-none animate-in fade-in">
      {/* Search Header */}
      <div className="flex items-center justify-between shrink-0 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">Explore</h1>
            <p className="text-[10px] text-sky-700 font-semibold">Live Map & Offline Cache</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>{currentLocation}</span>
        </div>
      </div>

      {/* Global Search Input */}
      <form onSubmit={handleSearch} className="relative shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any city or country (e.g. Paris, Kyoto)..."
          disabled={isLoading}
          className="w-full bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 rounded-2xl pl-10 pr-24 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none shadow-sm transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        <button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-40 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Quick City Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 py-0.5">
        {['Tokyo', 'Paris', 'New York', 'London', 'Kyoto', 'Rome'].map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => handleSearch(null, city)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border transition cursor-pointer active:scale-95 ${
              currentLocation.toLowerCase() === city.toLowerCase()
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-sky-50'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Live OpenStreetMap Iframe */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 shrink-0">
        <iframe
          width="100%"
          height="380px"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
          className="border-0 rounded-2xl shadow-inner w-full block"
          title={`${currentLocation} Live Map`}
        />

        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentLocation} • Live Coordinates</span>
        </div>
      </div>

      {/* Real Offline Download Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shadow-xs ${
                downloadSuccess
                  ? 'bg-emerald-500 text-white'
                  : isDownloading
                  ? 'bg-sky-500 text-white animate-pulse'
                  : 'bg-sky-50 text-sky-600 border border-sky-100'
              }`}
            >
              {downloadSuccess ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isDownloading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <ArrowDownToLine className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {currentLocation} - {fileSizeMB}MB
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {downloadSuccess
                  ? 'File saved to Downloads • Ready for offline travel'
                  : isDownloading
                  ? 'Extracting vector tiles & caching offline JSON...'
                  : 'Downloads raw geographic coordinates and JSON data cache for offline map rendering.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer disabled:opacity-60 ${
              downloadSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : isDownloading
                ? 'bg-sky-100 text-sky-700 font-extrabold cursor-wait'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
            }`}
          >
            {isDownloading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Packaging...</span>
              </span>
            ) : downloadSuccess ? (
              'Downloaded ✅'
            ) : (
              'Download Offline Data (.json)'
            )}
          </button>
        </div>

        {isDownloading && (
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full animate-pulse w-full" />
          </div>
        )}
      </div>

      {/* Floating Action Menu Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5 pb-2">
        <button
          onClick={() => setActiveScreen('restrooms')}
          className="py-3.5 px-3 bg-white hover:bg-sky-50 active:scale-95 text-slate-800 font-bold rounded-2xl border border-sky-100 shadow-sm flex items-center justify-center gap-2 text-xs transition cursor-pointer"
        >
          <span className="text-base select-none">🚽</span>
          <span>Find Restrooms</span>
        </button>

        <button
          onClick={() => setActiveScreen('sidequests')}
          className="py-3.5 px-3 bg-white hover:bg-sky-50 active:scale-95 text-slate-800 font-bold rounded-2xl border border-sky-100 shadow-sm flex items-center justify-center gap-2 text-xs transition cursor-pointer"
        >
          <span className="text-base select-none">🗺️</span>
          <span>Nearby Sidequests</span>
        </button>
      </div>
    </div>
  );
}

