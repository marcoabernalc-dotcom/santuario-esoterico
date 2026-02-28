import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Star, Hand, Layout, Hash, ArrowRight, Sparkles, 
  RotateCcw, Info, User, MapPin, Clock, Camera, 
  Loader2, FileText, Download, Printer, CheckCircle2, Eye,
  ShieldAlert, Heart, Briefcase, Users, Coins, Zap
} from 'lucide-react';

/**
 * SANTUARIO ESOTÉRICO - VERSIÓN INTEGRAL PROFESIONAL
 * Metodologías: David A. Phillips, Escuela Huber, Quirología Técnica y Rider-Waite.
 */

const apiKey = ""; // La clave se configura en Vercel como VITE_GEMINI_API_KEY
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

export default function App() {
  const [view, setView] = useState('welcome'); 
  const [userData, setUserData] = useState({
    name: '', birthDate: '', birthTime: '', birthPlace: '',
    handImage: null, tarotCards: []
  });

  const [studies, setStudies] = useState({
    numerology: '', astral: '', hands: '', tarot: '', synthesis: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [exportMode, setExportMode] = useState(false);
  const fileInputRef = useRef(null);

  // Lógica de llamada a la API con manejo de errores y reintentos
  const callGemini = async (prompt, imageData = null) => {
    setIsProcessing(true);
    setError(null);
    let retries = 0;
    const maxRetries = 5;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          ...(imageData ? [{ inlineData: { mimeType: "image/png", data: imageData.split(',')[1] } }] : [])
        ]
      }],
      systemInstruction: {
        parts: [{ text: "Eres un Oráculo Maestro. Te basas estrictamente en David A. Phillips (Numerología), Escuela Huber (Astrología Huber), Quirología Técnica y Tarot Rider-Waite. Analiza Pasado, Presente, Futuro y las categorías: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias. Siempre incluyes recomendaciones prácticas y místicas. El formato debe ser Markdown profesional con tablas." }]
      }
    };

    while (retries < maxRetries) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Error en la conexión astral");
        setIsProcessing(false);
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        retries++;
        if (retries === maxRetries) {
          setError("El velo está muy espeso. Por favor, intenta de nuevo.");
          setIsProcessing(false);
          throw err;
        }
        await new Promise(res => setTimeout(res, Math.pow(2, retries) * 1000));
      }
    }
  };

  // --- HANDLERS DE CADA ETAPA ---

  const handleNumerology = async () => {
    if (!userData.name || !userData.birthDate) return;
    const prompt = `Realiza el estudio de Numerología para ${userData.name} (Fecha: ${userData.birthDate}) basado exclusivamente en la obra de David A. Phillips. Analiza Pasado, Presente y Futuro. Cubre categorías: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias. Incluye recomendaciones.`;
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, numerology: res }));
      setView('numerology_result');
    }
  };

  const handleAstral = async () => {
    const prompt = `Estudio de Carta Natal (Escuela Huber) para ${userData.name}. Datos: ${userData.birthPlace}, ${userData.birthTime}, ${userData.birthDate}. Analiza Pasado, Presente, Futuro y categorías: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias.`;
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, astral: res }));
      setView('astral_result');
    }
  };

  const handleHands = async (base64) => {
    const prompt = `Analiza esta mano con Quirología Técnica. Desglosa Pasado, Presente, Futuro y categorías de vida: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias. Proporciona recomendaciones.`;
    const res = await callGemini(prompt, base64);
    if (res) {
      setStudies(prev => ({ ...prev, hands: res }));
      setView('hands_result');
    }
  };

  const handleTarot = async () => {
    const cards = userData.tarotCards.map(c => c.name).join(', ');
    const prompt = `Lectura de Tarot Rider-Waite con las cartas: ${cards}. Interpretación para Pasado, Presente, Futuro y categorías de vida.`;
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, tarot: res }));
      setView('tarot_result');
    }
  };

  const handleFinalSynthesis = async () => {
    const prompt = `GENERA EL REPORTE INTEGRAL DEFINITIVO PARA ${userData.name.toUpperCase()}.
    
    ESTRUCTURA OBLIGATORIA DEL REPORTE:

    1. RESUMEN EJECUTIVO DE LOS 4 ESTUDIOS:
       Sintetiza de forma potente y magistral los hallazgos más importantes de todas las disciplinas.

    2. TRANSCRIPCIÓN INTEGRAL DE LOS ESTUDIOS REALIZADOS:
       Incluye el texto completo de cada etapa para registro del consultante:
       - NUMEROLOGÍA (Phillips): ${studies.numerology}
       - CARTA NATAL (Huber): ${studies.astral}
       - QUIROMANCIA (Técnica): ${studies.hands}
       - TAROT (Rider-Waite): ${studies.tarot}

    3. TABLA DE RESULTADOS INTEGRAL:
       Crea una tabla Markdown con las columnas: CATEGORÍA | PASADO | PRESENTE | FUTURO | RECOMENDACIÓN.
       Incluye las filas: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias.

    4. DICTAMEN DEL ORÁCULO MAESTRO:
       Interpretación conjunta hilando todas las herramientas.

    5. DICTAMEN FINAL Y SENTENCIA PROFETICA.`;
    
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, synthesis: res }));
      setView('final_report');
    }
  };

  const downloadReport = () => {
    const content = `# REPORTE INTEGRAL SANTUARIO ESOTÉRICO - ${userData.name}\n\n${studies.synthesis}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estudio_Esoterico_${userData.name.replace(/\s+/g, '_')}.md`;
    a.click();
  };

  // --- VISTAS AUXILIARES ---

  const StepCard = ({ title, icon: Icon, content, onNext, label }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Icon className="w-8 h-8 text-amber-500" />
        <h2 className="text-3xl font-serif font-bold text-amber-100">{title}</h2>
      </div>
      <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl max-h-[55vh] overflow-y-auto custom-scrollbar prose prose-invert prose-amber max-w-none">
        <div className="whitespace-pre-wrap text-slate-300 font-serif text-lg leading-relaxed">
          {content}
        </div>
      </div>
      <button onClick={onNext} className="w-full bg-amber-600 hover:bg-amber-500 p-5 rounded-2xl font-black text-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg">
        {label} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 md:p-12 font-sans overflow-x-hidden selection:bg-amber-500/30">
      {/* Fondo de Estrellas */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-pulse" 
            style={{ width: '2px', height: '2px', top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s` }} />
        ))}
      </div>

      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-16 relative z-10 border-b border-slate-900 pb-8 no-print">
        <div className="flex items-center gap-3">
          <Sparkles className="text-amber-500 w-10 h-10" />
          <h1 className="text-4xl font-serif font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-600">SANTUARIO ESOTÉRICO</h1>
        </div>
        {userData.name && <span className="text-amber-500 font-serif italic text-xl">{userData.name}</span>}
      </nav>

      <main className="max-w-4xl mx-auto relative z-10">
        {error && <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-2xl text-red-200 text-center mb-10 shadow-xl">{error}</div>}

        {view === 'welcome' && (
          <div className="bg-slate-900/40 p-10 md:p-16 rounded-[4rem] border border-slate-800 space-y-12 animate-in zoom-in text-center shadow-2xl">
            <h2 className="text-5xl font-serif font-bold">Portal de Iniciación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-amber-500 tracking-widest flex items-center gap-2">Nombre del Consultante</label>
                <input type="text" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 transition-all text-xl" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} placeholder="Tu nombre completo..." />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-amber-500 tracking-widest flex items-center gap-2">Fecha de Nacimiento</label>
                <input type="date" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 transition-all text-xl" value={userData.birthDate} onChange={(e) => setUserData({...userData, birthDate: e.target.value})} />
              </div>
            </div>
            <button onClick={handleNumerology} disabled={!userData.name || !userData.birthDate || isProcessing} className="w-full bg-amber-600 p-8 rounded-[2.5rem] font-black uppercase tracking-widest text-black flex items-center justify-center gap-4 transition-all shadow-2xl hover:bg-amber-500">
              {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : "Iniciar Ritual de Numerología"}
            </button>
          </div>
        )}

        {view === 'numerology_result' && (
          <StepCard title="I. Numerología (Phillips)" icon={Hash} content={studies.numerology} onNext={() => setView('ask_astral')} label="Continuar a Carta Natal" />
        )}

        {view === 'ask_astral' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 space-y-10 text-center animate-in slide-in-from-right">
            <h2 className="text-4xl font-serif font-bold text-white">Configuración del Cosmos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <input type="text" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-purple-500 text-xl" value={userData.birthPlace} onChange={(e) => setUserData({...userData, birthPlace: e.target.value})} placeholder="Ciudad de nacimiento..." />
              <input type="time" className="w-full bg-black border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-purple-500 text-xl" value={userData.birthTime} onChange={(e) => setUserData({...userData, birthTime: e.target.value})} />
            </div>
            <button onClick={handleAstral} disabled={!userData.birthPlace || !userData.birthTime || isProcessing} className="w-full bg-purple-600 p-6 rounded-[2.5rem] font-black text-white uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "Generar Carta Natal Huber"}
            </button>
          </div>
        )}

        {view === 'astral_result' && (
          <StepCard title="II. Carta Natal" icon={Moon} content={studies.astral} onNext={() => setView('ask_hands')} label="Pasar a Quiromancia" />
        )}

        {view === 'ask_hands' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 text-center space-y-10 animate-in slide-in-from-right">
            <h2 className="text-4xl font-serif font-bold text-white">Quiromancia Técnica</h2>
            <div className="border-4 border-dashed border-slate-800 rounded-[3rem] p-20 bg-slate-950/50 cursor-pointer hover:border-emerald-500/50 transition-all" onClick={() => !isProcessing && fileInputRef.current.click()}>
              {userData.handImage ? <img src={userData.handImage} className="w-72 h-72 mx-auto rounded-[2rem] border-2 border-emerald-500 shadow-2xl" /> : <div className="flex flex-col items-center gap-6 text-slate-700"><Camera className="w-20 h-20" /><p className="font-black uppercase tracking-widest text-sm">Sube una foto de tu palma dominante</p></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if(file){
                  const reader = new FileReader();
                  reader.onloadend = () => { setUserData({...userData, handImage: reader.result}); handleHands(reader.result); };
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
            {isProcessing && <div className="text-emerald-500 animate-pulse font-black uppercase tracking-widest text-sm">Descifrando destino...</div>}
          </div>
        )}

        {view === 'hands_result' && (
          <StepCard title="III. Quiromancia" icon={Hand} content={studies.hands} onNext={() => setView('ask_tarot')} label="Consultar el Tarot" />
        )}

        {view === 'ask_tarot' && (
          <div className="space-y-12 text-center animate-in fade-in">
            <h2 className="text-5xl font-serif font-bold text-white">Los Arcanos Mayores</h2>
            <div className="grid grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} onClick={() => {
                  if (userData.tarotCards[i]) return;
                  const card = ARCANOS_MAYORES[Math.floor(Math.random()*ARCANOS_MAYORES.length)];
                  const newCards = [...userData.tarotCards]; newCards[i] = card;
                  setUserData({...userData, tarotCards: newCards});
                }} className={`aspect-[2/3.5] rounded-[2rem] border-2 flex items-center justify-center p-8 cursor-pointer transition-all duration-500 ${userData.tarotCards[i] ? 'bg-slate-900 border-purple-500 shadow-2xl scale-105' : 'bg-slate-950 border-slate-800 hover:border-purple-900'}`}>
                  {userData.tarotCards[i] ? <p className="text-2xl font-serif font-bold uppercase">{userData.tarotCards[i].name}</p> : <Star className="w-12 h-12 text-slate-900" />}
                </div>
              ))}
            </div>
            <button onClick={handleTarot} disabled={userData.tarotCards.length < 3 || isProcessing} className="w-full bg-purple-800 p-8 rounded-[2.5rem] font-black uppercase text-white shadow-2xl">
              {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : "Ver Lectura de Tarot"}
            </button>
          </div>
        )}

        {view === 'tarot_result' && (
          <StepCard title="IV. Tarot Rider-Waite" icon={Layout} content={studies.tarot} onNext={handleFinalSynthesis} label="GENERAR REPORTE INTEGRAL" />
        )}

        {view === 'final_report' && (
          <div className={`bg-slate-950 border-2 border-amber-600/20 p-8 md:p-20 rounded-[5rem] shadow-2xl relative ${exportMode ? 'bg-white text-black p-12' : ''}`}>
            {!exportMode && <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-amber-600 via-purple-600 via-emerald-600 to-blue-600"></div>}
            <div className="flex flex-col md:flex-row justify-between items-start mb-20 no-print gap-8">
              <div className="text-left space-y-2">
                <h2 className="text-5xl font-serif font-bold">Reporte Integral Definitivo</h2>
                <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">Dictamen Supremo del Oráculo Maestro</p>
              </div>
              <div className="flex gap-4">
                <button onClick={downloadReport} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:bg-emerald-900 transition-all text-sm font-black flex items-center gap-3"><Download className="w-6 h-6" /> .MD</button>
                <button onClick={() => setExportMode(!exportMode)} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:bg-amber-800 transition-all text-sm font-black flex items-center gap-3"><Printer className="w-6 h-6" /> Impresión</button>
              </div>
            </div>
            <div className={`prose max-w-none ${exportMode ? 'prose-slate' : 'prose-invert prose-amber'}`}>
              <div className="whitespace-pre-wrap font-serif text-xl leading-relaxed mb-24 text-justify">
                {studies.synthesis}
              </div>
            </div>
            {exportMode && <button onClick={() => window.print()} className="mt-12 no-print bg-black text-white px-12 py-5 rounded-full font-black uppercase text-lg shadow-xl">Imprimir Documento PDF</button>}
            <button onClick={() => window.location.reload()} className="w-full mt-20 text-amber-500 font-black border-2 border-amber-900/40 py-6 rounded-full no-print uppercase tracking-widest text-lg hover:bg-amber-500/10 transition-all">INICIAR NUEVO RITUAL</button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 text-center text-slate-900 text-[10px] uppercase tracking-[0.8em] font-black pointer-events-none no-print">
        David A. Phillips • Escuela Huber • Quirología Técnica • Rider-Waite
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; }
        @media print { .no-print { display: none !important; } body { background: white !important; color: black !important; padding: 0 !important; } }
        .prose table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 3rem 0; border: 1px solid #334155; border-radius: 1.5rem; overflow: hidden; }
        .prose th, .prose td { border: 1px solid #334155; padding: 18px; text-align: left; }
        .prose th { background: rgba(245, 158, 11, 0.1); color: #f59e0b; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
        ${exportMode ? '.prose th, .prose td { border: 1px solid #ccc; color: black !important; } .prose th { background: #f8f8f8; }' : ''}
      `}} />
    </div>
  );
}
