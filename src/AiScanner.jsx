import React, { useState, useRef } from 'react';
import { 
  Upload, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  Landmark, 
  UtensilsCrossed, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

/**
 * AiScanner Component - Image Upload & Gemini Vision Decoder
 * 
 * Rules:
 * - Completely deleted all navigator.mediaDevices webcam logic
 * - Hidden file input: <input type="file" accept="image/*" onChange={handleImageUpload} />
 * - Triggered by "Upload Photo" or "Open Gallery" button
 * - Reads file as Data URL (base64) using FileReader and shows preview instantly
 * - Analyzes via Gemini REST API with inlineData payload (base64 prefix stripped)
 * - Robust try/catch/finally block with hardcoded fallback response so it NEVER hangs
 */
export default function AiScanner() {
  const [activeMode, setActiveMode] = useState('allergy'); // 'allergy' | 'cultural'
  const [userAllergies, setUserAllergies] = useState('Peanuts, Shellfish, Gluten');
  const [dishName, setDishName] = useState('');
  const [culturalSubState, setCulturalSubState] = useState('translate_taste'); // 'translate_taste' | 'landmark_history'

  const [uploadedImage, setUploadedImage] = useState(null); // Full Data URL (e.g., data:image/jpeg;base64,...)
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Gemini API Key management
  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gsg_gemini_key') || '';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);

  const fileInputRef = useRef(null);

  // TASK 2: FILE UPLOAD VIA FILEREADER
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);

    // Reset input so selecting the same photo triggers onChange
    e.target.value = '';
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
  };

  // TASK 3: CALL GOOGLE GEMINI VISION REST API
  const handleAnalyzeWithAI = async () => {
    if (!uploadedImage) return;

    setIsScanning(true);
    setAnalysisResult(null);

    const effectiveKey = apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';

    // Extract raw base64 string (remove data:...;base64, prefix) and MIME type
    const matches = uploadedImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const base64Data = matches ? matches[2] : uploadedImage.split(',')[1] || uploadedImage;

    let promptText = '';
    if (activeMode === 'allergy') {
      const allergies = userAllergies.trim() || 'Severe unspecified allergies';
      const dishContext = dishName.trim() ? `They describe this dish as: ${dishName.trim()}.` : '';

      promptText = `The user has severe allergies to: ${allergies}. They have uploaded an image of a food item. ${dishContext} Based on the image and this description (critically analyzing hidden internal fillings, marinades, broths, and cooking oils that may not be visually exposed), analyze the ingredients and warn if any of the allergens are likely present.

You MUST format your reply starting with either:
VERDICT: SAFE
or
VERDICT: UNSAFE

Follow immediately with clear reasoning:
- Dish Identified & Description: ${dishName.trim() || 'From image analysis'}
- Detected or potential allergen risks (including hidden fillings, sauces, oils, or cross-contact)
- Safety instructions or kitchen warning card in the local language`;
    } else if (culturalSubState === 'translate_taste') {
      promptText = `You are an expert culinary linguist and food cultural decoder.
Analyze the captured foreign menu or dish.
Provide:
1. Native language translation & English pronunciation
2. Food explanation & ingredient flavor profile
3. Cultural background, local dining etiquette, and how to eat it`;
    } else {
      promptText = `You are a world-class architectural and cultural heritage guide.
Analyze the captured physical monument, statue, temple, or landmark.
Provide:
1. Monument/Landmark Identification & Location
2. Brief historical background and why it was constructed
3. Cultural significance & interesting trivia tourists miss`;
    }

    // Gemini Multimodal Payload Format
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    try {
      if (!effectiveKey || effectiveKey === 'PLACE_KEY_HERE') {
        throw new Error('API key missing');
      }

      const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${effectiveKey}`;

      let response = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Handle 404 if gemini-1.5-flash is sunsetted on this project key
      if (response.status === 404) {
        response = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!replyContent) {
        throw new Error('Empty candidate response');
      }

      let verdict = null;
      if (replyContent.includes('VERDICT: SAFE')) {
        verdict = 'SAFE';
      } else if (replyContent.includes('VERDICT: UNSAFE')) {
        verdict = 'UNSAFE';
      }

      setAnalysisResult({
        text: replyContent,
        verdict,
        model: 'Google Gemini',
      });
    } catch (err) {
      console.warn('Gemini Vision API warning/error:', err);

      // ROBUST FALLBACK: NEVER HANG!
      let fallbackText = "";
      if (activeMode === 'allergy') {
        fallbackText = "⚠️ VERDICT: CAUTION\nOops! The network is glitchy, but exercise extreme care with foreign ingredients! Please show your allergy card to the kitchen staff directly.";
      } else if (culturalSubState === 'translate_taste') {
        fallbackText = "✨ [OFFLINE MENU DECODER]\nOops! The network is glitchy, but that looks like a delicious traditional dish crafted with seasonal local flavors!";
      } else {
        fallbackText = "✨ [OFFLINE LANDMARK DECODER]\nOops! The network is glitchy, but I think that's a historic monument with centuries of cultural heritage!";
      }

      setAnalysisResult({
        text: fallbackText,
        verdict: activeMode === 'allergy' ? 'UNSAFE' : null,
        model: 'Offline Safe Mode',
      });
    } finally {
      setIsScanning(false); // ALWAYS stops the loading animation
    }
  };

  return (
    <div className="space-y-3.5 select-none animate-in fade-in">
      {/* Hidden File Input for Native Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Mode Switcher Banner: Allergy Finder vs Cultural Decoder */}
      <div className="bg-white p-1.5 rounded-2xl border border-sky-100 shadow-sm flex items-center justify-between gap-1.5">
        <button
          onClick={() => { setActiveMode('allergy'); setAnalysisResult(null); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeMode === 'allergy'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Allergy Finder</span>
        </button>

        <button
          onClick={() => { setActiveMode('cultural'); setAnalysisResult(null); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeMode === 'cultural'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Cultural Decoder</span>
        </button>
      </div>

      {/* MODE 1: ALLERGY FINDER INPUT */}
      {activeMode === 'allergy' && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Allergen Cross-Reference
            </span>
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-[10px] text-sky-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3 h-3" /> API Key
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Your Severe Allergies</label>
            <input
              type="text"
              value={userAllergies}
              onChange={(e) => setUserAllergies(e.target.value)}
              placeholder="e.g. Peanuts, Shellfish, Gluten, Dairy..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition"
            />
          </div>

          <div className="flex flex-wrap gap-1 pt-0.5">
            {['Peanuts', 'Shellfish', 'Gluten', 'Dairy', 'Soy', 'Tree Nuts'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (!userAllergies.includes(tag)) {
                    setUserAllergies(userAllergies ? `${userAllergies}, ${tag}` : tag);
                  }
                }}
                className="text-[10px] bg-sky-50 hover:bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium transition cursor-pointer"
              >
                +{tag}
              </button>
            ))}
          </div>

          {/* Dish Name / Context (Optional) Input */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-500">Dish Name / Context (Optional)</label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="e.g., Beef Momos, Chicken Shawarma..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition"
            />
          </div>
        </div>
      )}

      {/* MODE 2: CULTURAL DECODER TOGGLE SWITCH */}
      {activeMode === 'cultural' && (
        <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-sky-100 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Decoder State</span>
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-[10px] text-sky-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3 h-3" /> API Key
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCulturalSubState('translate_taste')}
              className={`py-2 px-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                culturalSubState === 'translate_taste'
                  ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Translate & Taste</span>
            </button>

            <button
              onClick={() => setCulturalSubState('landmark_history')}
              className={`py-2 px-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                culturalSubState === 'landmark_history'
                  ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Landmark & History</span>
            </button>
          </div>
        </div>
      )}

      {/* API Key Modal Drawer */}
      {showKeyModal && (
        <div className="bg-white rounded-2xl p-4 shadow-md border border-sky-100 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Google Gemini API Key</span>
            <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... / AQ..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
            />
            <button
              onClick={() => {
                localStorage.setItem('gsg_gemini_key', apiKey.trim());
                setShowKeyModal(false);
              }}
              className="px-3 py-1.5 bg-sky-600 text-white font-bold rounded-xl text-xs hover:bg-sky-700 transition cursor-pointer"
            >
              Save
            </button>
          </div>
          <p className="text-[10px] text-slate-400">Saved to browser storage or reads VITE_GEMINI_API_KEY from .env.</p>
        </div>
      )}

      {/* TASK 2: IMAGE UPLOAD & PREVIEW VIEWPORT */}
      <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden bg-slate-900 border border-sky-100 shadow-md flex items-center justify-center">
        {uploadedImage ? (
          /* INSTANT IMAGE PREVIEW */
          <div className="relative w-full h-full animate-in fade-in">
            <img
              src={uploadedImage}
              alt="Uploaded photo"
              className="w-full h-full object-cover"
            />

            {/* Action Overlay: Replace or Clear */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" /> Change
              </button>
              <button
                onClick={handleClearImage}
                className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white p-1.5 rounded-full text-xs shadow cursor-pointer transition"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY UPLOAD DROPZONE / BUTTON AREA */
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-4 cursor-pointer hover:bg-slate-800 transition group"
          >
            <div className="w-16 h-16 rounded-3xl bg-sky-500/20 group-hover:bg-sky-500/30 border border-sky-400/30 flex items-center justify-center text-sky-400 transition-transform group-hover:scale-105 shadow-lg shadow-sky-500/10">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-white tracking-tight">Upload Photo to Scan</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Select a menu, dish, or landmark photo from your gallery
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Upload Photo / Open Gallery</span>
            </button>
          </div>
        )}
      </div>

      {/* PRIMARY ACTION BUTTON: ANALYZE WITH GEMINI */}
      {uploadedImage && (
        <button
          onClick={handleAnalyzeWithAI}
          disabled={isScanning}
          className="w-full h-13 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing with Google Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {activeMode === 'allergy'
                  ? 'Verify Food Safety (SAFE / UNSAFE)'
                  : (culturalSubState === 'translate_taste'
                    ? 'Translate & Explain Food'
                    : 'Decode Landmark & History')}
              </span>
            </>
          )}
        </button>
      )}

      {/* ANALYSIS RESULT CARD */}
      {analysisResult && (
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Gemini Vision Result
            </span>

            {analysisResult.verdict === 'SAFE' && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-black border border-emerald-200">
                SAFE ✅
              </span>
            )}
            {analysisResult.verdict === 'UNSAFE' && (
              <span className="text-xs bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-black border border-rose-200">
                UNSAFE ⚠️
              </span>
            )}
          </div>

          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {analysisResult.text}
          </div>
        </div>
      )}
    </div>
  );
}
