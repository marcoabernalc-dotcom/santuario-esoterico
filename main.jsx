import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Star, Hand, Layout, Hash, ArrowRight, Sparkles, 
  User, MapPin, Clock, Camera, Loader2, Download, Printer, ShieldAlert
} from 'lucide-react';

/**
 * SANTUARIO ESOTÉRICO - VERSIÓN DE PRODUCCIÓN 1.1
 * ESTE ARCHIVO DEBE LLAMARSE: main.jsx
 * UBICACIÓN: Raíz de tu repositorio de GitHub
 */

// Lógica para detectar la clave de API en Vercel o en el entorno local
const getApiKey = () => {
  try {
    // Intenta leer la variable de entorno configurada en Vercel
    // En el entorno de previsualización, se inicializa como cadena vacía
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  } catch (e) {
    return "";
  }
};

const apiKey = getApiKey();
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
    
    // Verificación de clave antes de disparar la petición
    // Nota: El entorno de previsualización proporciona la clave automáticamente si apiKey está vacía
    const currentKey = apiKey;

    try {
      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            ...(imageData ? [{ inlineData: { mimeType: "image/png", data: imageData.split(',')[1] } }] : [])
          ]
        }],
        systemInstruction: {
          parts: [{ text: "Eres un Oráculo Maestro experto en David Phillips, Astrología Huber, Quirología y Tarot Rider-Waite. Responde de forma mística y profunda en español. Usa tablas Markdown para resumir categorías vitales." }]
        }
      };
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${currentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Error en la conexión con el oráculo.");
      
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      setError("El velo está bloqueado. Verifica tu conexión o la clave de API en Vercel.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNumerology = async () => {
    const res = await callGemini(`Estudio de Numerología de David Phillips para ${userData.name}, nacido el ${userData.birthDate}. Analiza Pasado, Presente, Futuro y categorías: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias.`);
    if (res) { setStudies({...studies, numerology: res}); setView('numerology_result'); }
  };

  const handleAstral = async () => {
    const res = await callGemini(`Carta Natal Huber para ${userData.name} en ${userData.birthPlace} a las ${userData.birthTime} el día ${userData.birthDate}.`);
    if (res) { setStudies({...studies, astral: res}); setView('astral_result'); }
  };

  const handleHands = async (base64) => {
    const res = await callGemini(`Analiza esta palma con Quirología Técnica. Desglosa líneas y montes.`, base64);
    if (res) { setStudies({...studies, hands: res}); setView('hands_result'); }
  };

  const handleTarot = async () => {
    const cards = userData.tarotCards.map(c => c.name).join(', ');
    const res = await callGemini(`Lectura de Tarot Rider-Waite con las cartas: ${cards}.`);
    if (res) { setStudies({...studies, tarot: res}); setView('tarot_result'); }
  };

  const handleSynthesis = async () => {
    const res = await callGemini(`Genera el REPORTE INTEGRAL FINAL para ${userData.name}. Resume todos los estudios en un dictamen supremo.`);
    if (res) { setStudies({...studies, synthesis: res}); setView('final_report'); }
  };

  const StepCard = ({ title, icon: Icon, content, onNext, label }) => (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Icon className="w-10 h-10 text-amber-500" />
        <h2 className="text-4xl font-serif font-bold text-amber-100">{title}</h2>
      </div>
      <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-2xl max-h-[50vh] overflow-y-auto custom-scrollbar prose prose-invert prose-amber max-w-none">
        <div className="whitespace-pre-wrap text-slate-200 text-lg leading-relaxed">{content}</div>
      </div>
      <button onClick={onNext} className="w-full bg-amber-600 hover:bg-amber-500 p-6 rounded-2xl font-black text-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl">
        {label} <ArrowRight />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-12 bg-black text-white">
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-16 border-b border-slate-900 pb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="text-amber-500 w-8 h-8" />
          <h1 className="text-3xl font-serif font-bold tracking-tighter text-amber-100 uppercase">Santuario Esotérico</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto">
        {error && <div className="bg-red-900/40 border border-red-500 p-6 rounded-2xl text-red-100 text-center mb-10 flex items-center justify-center gap-3"><ShieldAlert className="w-6 h-6" /> {error}</div>}

        {view === 'welcome' && (
          <div className="bg-slate-900/40 p-10 md:p-16 rounded-[4rem] border border-slate-800 space-y-12 text-center shadow-2xl">
            <h2 className="text-5xl font-serif font-bold">Portal de Iniciación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <input type="text" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 text-xl" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} placeholder="Tu nombre..." />
              <input type="date" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 text-xl" value={userData.birthDate} onChange={(e) => setUserData({...userData, birthDate: e.target.value})} />
            </div>
            <button onClick={handleNumerology} disabled={!userData.name || !userData.birthDate || isProcessing} className="w-full bg-amber-600 p-8 rounded-[2.5rem] font-black uppercase text-black flex items-center justify-center gap-4 hover:bg-amber-500 transition-all shadow-xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "Iniciar Ritual de Numerología"}
            </button>
          </div>
        )}

        {view === 'numerology_result' && <StepCard title="I. Numerología" icon={Hash} content={studies.numerology} onNext={() => setView('ask_astral')} label="Continuar a Carta Natal" />}
        
        {view === 'ask_astral' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 space-y-10 text-center animate-in slide-in-from-right">
            <h2 className="text-4xl font-serif font-bold">Coordenadas del Cielo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <input type="text" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white text-xl" value={userData.birthPlace} onChange={(e) => setUserData({...userData, birthPlace: e.target.value})} placeholder="Ciudad..." />
              <input type="time" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white text-xl" value={userData.birthTime} onChange={(e) => setUserData({...userData, birthTime: e.target.value})} />
            </div>
            <button onClick={handleAstral} className="w-full bg-purple-600 p-8 rounded-[2.5rem] font-black text-white uppercase shadow-xl">Generar Carta Natal</button>
          </div>
        )}

        {view === 'astral_result' && <StepCard title="II. Carta Natal" icon={Moon} content={studies.astral} onNext={() => setView('ask_hands')} label="Pasar a Quiromancia" />}

        {view === 'ask_hands' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 text-center space-y-10 animate-in slide-in-from-right">
            <h2 className="text-4xl font-serif font-bold">Quiromancia</h2>
            <div className="border-4 border-dashed border-slate-800 rounded-[3rem] p-20 bg-slate-950/50 cursor-pointer" onClick={() => !isProcessing && fileInputRef.current.click()}>
              {userData.handImage ? <img src={userData.handImage} className="w-72 h-72 mx-auto rounded-[2rem] border-2 border-emerald-500 shadow-2xl object-cover" /> : <div className="flex flex-col items-center gap-6 text-slate-700"><Camera className="w-20 h-20" /><p className="font-black uppercase tracking-widest text-sm">Cargar imagen de la mano</p></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if(file){
                  const reader = new FileReader();
                  reader.onloadend = () => { setUserData({...userData, handImage: reader.result}); handleHands(reader.result); };
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
          </div>
        )}

        {view === 'hands_result' && <StepCard title="III. Quiromancia" icon={Hand} content={studies.hands} onNext={() => setView('ask_tarot')} label="Consultar el Tarot" />}

        {view === 'ask_tarot' && (
          <div className="space-y-12 text-center animate-in fade-in">
            <h2 className="text-5xl font-serif font-bold text-white">Tarot</h2>
            <div className="grid grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} onClick={() => {
                  if (userData.tarotCards[i] || isProcessing) return;
                  const card = ARCANOS_MAYORES[Math.floor(Math.random()*ARCANOS_MAYORES.length)];
                  const newCards = [...userData.tarotCards]; newCards[i] = card;
                  setUserData({...userData, tarotCards: newCards});
                }} className={`aspect-[2/3.5] rounded-[2rem] border-2 flex items-center justify-center p-8 cursor-pointer transition-all ${userData.tarotCards[i] ? 'bg-slate-900 border-purple-500 shadow-2xl scale-105' : 'bg-slate-950 border-slate-800'}`}>
                  {userData.tarotCards[i] ? <p className="text-xl font-serif font-bold uppercase text-purple-100">{userData.tarotCards[i].name}</p> : <Star className="w-12 h-12 text-slate-900 animate-pulse" />}
                </div>
              ))}
            </div>
            <button onClick={handleTarot} disabled={userData.tarotCards.length < 3 || isProcessing} className="w-full bg-purple-800 p-8 rounded-[2.5rem] font-black uppercase text-white shadow-2xl">Ver Lectura</button>
          </div>
        )}

        {view === 'tarot_result' && <StepCard title="IV. Tarot" icon={Layout} content={studies.tarot} onNext={handleFinalSynthesis} label="GENERAR REPORTE INTEGRAL" />}

        {view === 'final_report' && (
          <div className="bg-slate-950 border-2 border-amber-600/20 p-8 md:p-16 rounded-[4rem] shadow-2xl relative">
            <h2 className="text-4xl font-serif font-bold mb-10 text-amber-100 border-b border-slate-800 pb-6 text-center">Reporte Integral Definitivo</h2>
            <div className="whitespace-pre-wrap font-serif text-xl leading-relaxed mb-24 text-justify text-slate-200">
              {studies.synthesis}
            </div>
            <button onClick={() => window.location.reload()} className="w-full mt-12 text-amber-500 font-black border-2 border-amber-900/40 py-6 rounded-full hover:bg-amber-950 transition-all uppercase tracking-widest shadow-xl">REINICIAR RITUAL</button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 text-center text-slate-800 text-[10px] uppercase tracking-[0.8em] font-black pointer-events-none">
        David A. Phillips • Escuela Huber • Quirología Técnica • Rider-Waite
      </footer>
    </div>
  );
}

export default App;
