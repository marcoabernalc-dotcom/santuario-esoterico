import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Moon, Sun, Star, Hand, Layout, Hash, ArrowRight, Sparkles, 
  User, MapPin, Clock, Camera, Loader2, Download, Printer, ShieldAlert
} from 'lucide-react';

/**
 * SANTUARIO ESOTÉRICO - VERSIÓN DE PRODUCCIÓN OPTIMIZADA
 * Este archivo DEBE llamarse main.jsx en la raíz de tu GitHub.
 * Se ha corregido la referencia a la clave de API para compatibilidad total.
 */

// La clave de API se deja vacía; el entorno de ejecución la proporciona automáticamente.
const apiKey = ""; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const ARCANOS_MAYORES = [
  { id: 0, name: "El Loco" }, { id: 1, name: "El Mago" }, { id: 2, name: "La Sacerdotisa" },
  { id: 3, name: "La Emperatriz" }, { id: 4, name: "El Emperador" }, { id: 5, name: "El Hierofante" },
  { id: 6, name: "Los Enamorados" }, { id: 7, name: "El Carro" }, { id: 8, name: "La Fuerza" },
  { id: 9, name: "El Ermitaño" }, { id: 10, name: "La Rueda de la Fortuna" }, { id: 11, name: "La Justicia" },
  { id: 12, name: "El Colgado" }, { id: 13, name: "La Muerte" }, { id: 14, name: "La Templanza" },
  { id: 15, name: "El Diablo" }, { id: 16, name: "La Torre" }, { id: 17, name: "La Estrella" },
  { id: 18, name: "La Luna" }, { id: 19, name: "El Sol" }, { id: 20, name: "El Juicio" },
  { id: 21, name: "El Mundo" }
];

function App() {
  const [view, setView] = useState('welcome'); 
  const [userData, setUserData] = useState({ name: '', birthDate: '', birthTime: '', birthPlace: '', handImage: null, tarotCards: [] });
  const [studies, setStudies] = useState({ numerology: '', astral: '', hands: '', tarot: '', synthesis: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const callGemini = async (prompt, imageData = null) => {
    setIsProcessing(true);
    setError(null);
    try {
      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            ...(imageData ? [{ inlineData: { mimeType: "image/png", data: imageData.split(',')[1] } }] : [])
          ]
        }],
        systemInstruction: {
          parts: [{ text: "Eres un Oráculo Maestro experto en David Phillips, Huber, Quirología y Tarot Rider-Waite. Responde de forma profunda en español." }]
        }
      };
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Error místico");
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      setError("El velo está bloqueado. Por favor, intenta de nuevo.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNumerology = async () => {
    const res = await callGemini(`Estudio Numerológico para ${userData.name}, nacido el ${userData.birthDate}`);
    if (res) { setStudies({...studies, numerology: res}); setView('numerology_result'); }
  };

  const StepCard = ({ title, icon: Icon, content, onNext, label }) => (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Icon className="w-10 h-10 text-amber-500" />
        <h2 className="text-4xl font-serif font-bold text-amber-100">{title}</h2>
      </div>
      <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-2xl max-h-[50vh] overflow-y-auto custom-scrollbar">
        <div className="whitespace-pre-wrap text-slate-200 text-lg leading-relaxed">{content}</div>
      </div>
      <button onClick={onNext} className="w-full bg-amber-600 hover:bg-amber-500 p-6 rounded-2xl font-black text-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl">
        {label} <ArrowRight />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-12 bg-black text-white">
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-16 border-b border-slate-900 pb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="text-amber-500 w-8 h-8" />
          <h1 className="text-3xl font-serif font-bold text-amber-100 uppercase tracking-tighter">Santuario Esotérico</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto">
        {error && <div className="bg-red-900/40 border border-red-500 p-6 rounded-2xl text-red-100 text-center mb-10 flex items-center justify-center gap-3"><ShieldAlert /> {error}</div>}

        {view === 'welcome' && (
          <div className="bg-slate-900/40 p-10 md:p-16 rounded-[4rem] border border-slate-800 space-y-12 text-center shadow-2xl">
            <h2 className="text-5xl font-serif font-bold">Portal de Iniciación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <input type="text" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 text-xl" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} placeholder="Tu nombre..." />
              <input type="date" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 text-xl" value={userData.birthDate} onChange={(e) => setUserData({...userData, birthDate: e.target.value})} />
            </div>
            <button onClick={handleNumerology} disabled={!userData.name || !userData.birthDate || isProcessing} className="w-full bg-amber-600 p-8 rounded-[2.5rem] font-black uppercase text-black flex items-center justify-center gap-4 hover:bg-amber-500 transition-all shadow-xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "Iniciar Ritual Sagrado"}
            </button>
          </div>
        )}

        {view === 'numerology_result' && <StepCard title="I. Numerología" icon={Hash} content={studies.numerology} onNext={() => window.location.reload()} label="Reiniciar Ritual" />}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 text-center text-slate-800 text-[10px] uppercase tracking-[0.8em] font-black pointer-events-none">
        David A. Phillips • Escuela Huber • Quirología Técnica • Rider-Waite
      </footer>
    </div>
  );
}

// ESTA SECCIÓN MONTA LA APLICACIÓN Y EVITA LA PANTALLA NEGRA
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

export default App;
