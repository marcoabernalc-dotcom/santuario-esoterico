import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Star, Hand, Layout, Hash, ArrowRight, Sparkles, 
  RotateCcw, Info, User, MapPin, Clock, Camera, 
  Loader2, FileText, Download, Printer, CheckCircle2, Eye,
  ShieldAlert, Heart, Briefcase, Users, Coins, Zap
} from 'lucide-react';

/**
 * SANTUARIO ESOTÉRICO - VERSIÓN CORREGIDA Y OPTIMIZADA
 * Metodologías: David A. Phillips, Escuela Huber, Quirología Técnica y Rider-Waite.
 * * NOTA DE SEGURIDAD: Se ha corregido el error de compilación. 
 * La clave de API se gestiona automáticamente por el entorno.
 */

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

  /**
   * Ejecuta llamadas a la API de Gemini con lógica de reintentos exponencial.
   */
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
        parts: [{ text: "Eres un Oráculo Maestro experto en David A. Phillips, Escuela Huber, Quirología Técnica y Tarot Rider-Waite. Analiza Pasado, Presente y Futuro en categorías: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias. Usa Markdown para el formato y genera recomendaciones profundas." }]
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
        
        if (!response.ok) throw new Error(data.error?.message || "Error en la conexión mística");
        
        setIsProcessing(false);
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        retries++;
        if (retries === maxRetries) {
          setError("No se ha podido establecer contacto con los astros. Por favor, comprueba tu conexión e intenta de nuevo.");
          setIsProcessing(false);
          throw err;
        }
        await new Promise(res => setTimeout(res, Math.pow(2, retries) * 1000));
      }
    }
  };

  const handleNumerology = async () => {
    if (!userData.name || !userData.birthDate) return;
    const prompt = `Realiza un estudio detallado de Numerología para ${userData.name} (Fecha de nacimiento: ${userData.birthDate}) basado en las enseñanzas de David A. Phillips. Analiza Pasado, Presente y Futuro, y profundiza en las categorías: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias. Incluye consejos prácticos.`;
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, numerology: res }));
      setView('numerology_result');
    }
  };

  const handleAstral = async () => {
    const prompt = `Realiza el estudio de Carta Natal (Sistema Escuela Huber) para ${userData.name}. Nacimiento en ${userData.birthPlace} a las ${userData.birthTime} del ${userData.birthDate}. Analiza Pasado, Presente, Futuro y las categorías: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias.`;
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, astral: res }));
      setView('astral_result');
    }
  };

  const handleHands = async (base64) => {
    const prompt = `Analiza técnicamente esta palma de la mano utilizando Quirología Técnica. Identifica líneas y montes. Desglosa Pasado, Presente y Futuro, y evalúa: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias.`;
    const res = await callGemini(prompt, base64);
    if (res) {
      setStudies(prev => ({ ...prev, hands: res }));
      setView('hands_result');
    }
  };

  const handleTarot = async () => {
    const cards = userData.tarotCards.map(c => c.name).join(', ');
    const prompt = `Lectura de Tarot Rider-Waite con los Arcanos: ${cards}. Interpreta el mensaje para el consultante en Pasado, Presente y Futuro, cubriendo las categorías vitales de Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias.`;
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, tarot: res }));
      setView('tarot_result');
    }
  };

  const handleFinalSynthesis = async () => {
    const prompt = `GENERA EL REPORTE INTEGRAL DEFINITIVO PARA ${userData.name.toUpperCase()}.
    
    ESTRUCTURA OBLIGATORIA:
    1. RESUMEN EJECUTIVO: Una síntesis magistral que fusione los hallazgos de las 4 disciplinas.
    
    2. TRANSCRIPCIÓN INTEGRAL DE LOS ESTUDIOS REALIZADOS:
       Incluye el texto completo de cada etapa previa:
       - NUMEROLOGÍA (David A. Phillips): ${studies.numerology}
       - CARTA NATAL (Escuela Huber): ${studies.astral}
       - QUIROMANCIA (Quirología Técnica): ${studies.hands}
       - TAROT (Rider-Waite): ${studies.tarot}

    3. TABLA DE RESULTADOS INTEGRAL:
       Formato tabla Markdown con: CATEGORÍA | PASADO | PRESENTE | FUTURO | RECOMENDACIÓN.
       Filas: Salud, Amor, Trabajo, Familia, Economía, Amigos, Daños, Enemigos, Envidias.

    4. DICTAMEN FINAL DEL ORÁCULO MAESTRO: Un consejo profético final basado en toda la evidencia recogida.`;
    
    const res = await callGemini(prompt);
    if (res) {
      setStudies(prev => ({ ...prev, synthesis: res }));
      setView('final_report');
    }
  };

  const downloadReport = () => {
    const content = `# REPORTE INTEGRAL SANTUARIO ESOTÉRICO\nCONSULTANTE: ${userData.name}\n\n${studies.synthesis}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${userData.name.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StepCard = ({ title, icon: Icon, content, onNext, label }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-500/20 rounded-2xl">
          <Icon className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-amber-50">{title}</h2>
      </div>
      <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl max-h-[55vh] overflow-y-auto custom-scrollbar prose prose-invert prose-amber max-w-none">
        <div className="whitespace-pre-wrap text-slate-300 font-serif text-lg leading-relaxed">
          {content}
        </div>
      </div>
      <button 
        onClick={onNext} 
        className="w-full bg-amber-600 hover:bg-amber-500 p-5 rounded-2xl font-black text-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg group"
      >
        {label} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 md:p-12 font-sans overflow-x-hidden selection:bg-amber-500/30">
      {/* Fondo Animado de Estrellas */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-pulse" 
            style={{ 
              width: '2px', 
              height: '2px', 
              top: `${Math.random()*100}%`, 
              left: `${Math.random()*100}%`,
              animationDuration: `${2 + Math.random()*3}s`,
              animationDelay: `${Math.random()*5}s`
            }} 
          />
        ))}
      </div>

      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-16 relative z-10 border-b border-slate-900 pb-8 no-print">
        <div className="flex items-center gap-3 group">
          <Sparkles className="text-amber-500 w-10 h-10 group-hover:rotate-12 transition-transform" />
          <h1 className="text-4xl font-serif font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-600">
            SANTUARIO ESOTÉRICO
          </h1>
        </div>
        {userData.name && (
          <div className="flex items-center gap-2 text-amber-500/80 font-serif italic text-xl">
            <User className="w-5 h-5" />
            <span>{userData.name}</span>
          </div>
        )}
      </nav>

      <main className="max-w-4xl mx-auto relative z-10">
        {error && (
          <div className="bg-red-900/40 border-2 border-red-500/50 p-6 rounded-3xl text-red-100 text-center mb-10 shadow-2xl flex items-center justify-center gap-3 animate-in shake">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {view === 'welcome' && (
          <div className="bg-slate-900/40 p-10 md:p-16 rounded-[4rem] border border-slate-800 space-y-12 animate-in zoom-in text-center shadow-2xl backdrop-blur-sm">
            <div className="space-y-4">
              <h2 className="text-5xl font-serif font-bold text-white">Portal de Iniciación</h2>
              <p className="text-slate-400 text-lg">Introduce tus coordenadas vitales para abrir el velo del conocimiento.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-amber-500 tracking-widest flex items-center gap-2">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 transition-all text-xl placeholder:text-slate-700" 
                  value={userData.name} 
                  onChange={(e) => setUserData({...userData, name: e.target.value})} 
                  placeholder="Tu nombre sagrado..." 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-amber-500 tracking-widest flex items-center gap-2">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 transition-all text-xl" 
                  value={userData.birthDate} 
                  onChange={(e) => setUserData({...userData, birthDate: e.target.value})} 
                />
              </div>
            </div>
            <button 
              onClick={handleNumerology} 
              disabled={!userData.name || !userData.birthDate || isProcessing} 
              className="w-full bg-amber-600 p-8 rounded-[2.5rem] font-black uppercase tracking-widest text-black flex items-center justify-center gap-4 transition-all shadow-2xl hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : (
                <>
                  <Hash className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Iniciar Ritual de Numerología</span>
                </>
              )}
            </button>
          </div>
        )}

        {view === 'numerology_result' && (
          <StepCard 
            title="I. Numerología (Enseñanzas de Phillips)" 
            icon={Hash} 
            content={studies.numerology} 
            onNext={() => setView('ask_astral')} 
            label="Continuar a Configuración Astral" 
          />
        )}

        {view === 'ask_astral' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 space-y-10 text-center animate-in slide-in-from-right backdrop-blur-sm">
            <h2 className="text-4xl font-serif font-bold text-white">Coordenadas del Cielo</h2>
            <p className="text-slate-400">Define el lugar y la hora de tu primer respiro.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-purple-500 tracking-widest flex items-center gap-2">Lugar de Nacimiento</label>
                <input type="text" className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-purple-500 text-xl placeholder:text-slate-700" value={userData.birthPlace} onChange={(e) => setUserData({...userData, birthPlace: e.target.value})} placeholder="Ciudad, País..." />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-purple-500 tracking-widest flex items-center gap-2">Hora de Nacimiento</label>
                <input type="time" className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-purple-500 text-xl" value={userData.birthTime} onChange={(e) => setUserData({...userData, birthTime: e.target.value})} />
              </div>
            </div>
            <button 
              onClick={handleAstral} 
              disabled={!userData.birthPlace || !userData.birthTime || isProcessing} 
              className="w-full bg-purple-600 p-8 rounded-[2.5rem] font-black text-white uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl hover:bg-purple-500 transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : (
                <>
                  <Moon className="w-6 h-6" />
                  <span>Generar Carta Natal Huber</span>
                </>
              )}
            </button>
          </div>
        )}

        {view === 'astral_result' && (
          <StepCard 
            title="II. Carta Natal (Espejo del Cosmos)" 
            icon={Moon} 
            content={studies.astral} 
            onNext={() => setView('ask_hands')} 
            label="Pasar al Análisis de Quiromancia" 
          />
        )}

        {view === 'ask_hands' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 text-center space-y-10 animate-in slide-in-from-right backdrop-blur-sm">
            <h2 className="text-4xl font-serif font-bold text-white">Mapa Quirógrafo</h2>
            <p className="text-slate-400">Captura la impronta nerviosa de tu destino escrita en tus manos.</p>
            <div 
              className="border-4 border-dashed border-slate-800 rounded-[3rem] p-20 bg-slate-950/50 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group" 
              onClick={() => !isProcessing && fileInputRef.current.click()}
            >
              {userData.handImage ? (
                <div className="relative inline-block">
                  <img src={userData.handImage} className="w-72 h-72 mx-auto rounded-[2rem] border-2 border-emerald-500 shadow-2xl object-cover" />
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-slate-700 group-hover:text-emerald-500/60 transition-colors">
                  <Camera className="w-20 h-20" />
                  <p className="font-black uppercase tracking-widest text-sm">Sube una foto clara de tu palma</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if(file){
                    const reader = new FileReader();
                    reader.onloadend = () => { 
                      setUserData({...userData, handImage: reader.result}); 
                      handleHands(reader.result); 
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </div>
            {isProcessing && (
              <div className="flex items-center justify-center gap-3 text-emerald-500 animate-pulse font-black uppercase tracking-widest text-sm">
                <Loader2 className="animate-spin" />
                <span>Escaneando surcos palmares...</span>
              </div>
            )}
          </div>
        )}

        {view === 'hands_result' && (
          <StepCard 
            title="III. Quiromancia Técnica" 
            icon={Hand} 
            content={studies.hands} 
            onNext={() => setView('ask_tarot')} 
            label="Consultar los Arcanos del Tarot" 
          />
        )}

        {view === 'ask_tarot' && (
          <div className="space-y-12 text-center animate-in fade-in">
            <div className="space-y-4">
              <h2 className="text-5xl font-serif font-bold text-white">El Umbral del Destino</h2>
              <p className="text-slate-400">Selecciona tres cartas para revelar los misterios del Tarot Rider-Waite.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    if (userData.tarotCards[i] || isProcessing) return;
                    const card = ARCANOS_MAYORES[Math.floor(Math.random()*ARCANOS_MAYORES.length)];
                    const newCards = [...userData.tarotCards]; 
                    newCards[i] = card;
                    setUserData({...userData, tarotCards: newCards});
                  }} 
                  className={`aspect-[2/3.5] rounded-[2rem] border-2 flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-500 ${
                    userData.tarotCards[i] 
                      ? 'bg-slate-900 border-purple-500 shadow-2xl scale-105' 
                      : 'bg-slate-950 border-slate-800 hover:border-purple-900/50 hover:bg-purple-900/5'
                  }`}
                >
                  {userData.tarotCards[i] ? (
                    <div className="text-center space-y-4 animate-in zoom-in">
                      <Layout className="w-12 h-12 text-purple-400 mx-auto" />
                      <p className="text-2xl font-serif font-bold uppercase text-purple-100">{userData.tarotCards[i].name}</p>
                      <p className="text-[10px] text-purple-500 font-black tracking-tighter">CARTA REVELADA</p>
                    </div>
                  ) : (
                    <Star className="w-12 h-12 text-slate-900" />
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={handleTarot} 
              disabled={userData.tarotCards.length < 3 || isProcessing} 
              className="w-full bg-purple-800 p-8 rounded-[2.5rem] font-black uppercase text-white shadow-2xl hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : "Ver Lectura de Tarot"}
            </button>
          </div>
        )}

        {view === 'tarot_result' && (
          <StepCard 
            title="IV. El Mensaje de los Arcanos" 
            icon={Layout} 
            content={studies.tarot} 
            onNext={handleFinalSynthesis} 
            label="GENERAR REPORTE INTEGRAL DEFINITIVO" 
          />
        )}

        {view === 'final_report' && (
          <div className={`bg-slate-950 border-2 border-amber-600/20 p-8 md:p-16 rounded-[4rem] shadow-2xl relative transition-all ${exportMode ? 'bg-white text-black p-12 rounded-none border-none shadow-none' : ''}`}>
            {!exportMode && <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-amber-600 via-purple-600 via-emerald-600 to-blue-600"></div>}
            
            <div className="flex flex-col md:flex-row justify-between items-start mb-16 no-print gap-8 border-b border-slate-900 pb-10">
              <div className="text-left space-y-2">
                <h2 className="text-5xl font-serif font-bold">Dictamen Supremo</h2>
                <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">Reporte Integral del Oráculo Maestro</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={downloadReport} 
                  title="Descargar Markdown"
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:bg-emerald-900/20 hover:border-emerald-500/50 transition-all shadow-lg text-emerald-500"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setExportMode(!exportMode)} 
                  title="Modo Lectura / Impresión"
                  className={`bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:bg-amber-800/20 hover:border-amber-500/50 transition-all shadow-lg ${exportMode ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400'}`}
                >
                  <Printer className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className={`prose max-w-none ${exportMode ? 'prose-slate' : 'prose-invert prose-amber'}`}>
              <div className="whitespace-pre-wrap font-serif text-xl leading-relaxed mb-24 text-justify">
                {studies.synthesis}
              </div>
            </div>

            {exportMode && (
              <button 
                onClick={() => window.print()} 
                className="mt-12 no-print bg-black text-white px-12 py-5 rounded-full font-black uppercase text-lg shadow-2xl hover:scale-105 transition-transform"
              >
                Imprimir Documento PDF
              </button>
            )}

            <button 
              onClick={() => window.location.reload()} 
              className="w-full mt-20 text-amber-500 font-black border-2 border-amber-900/40 py-6 rounded-full no-print uppercase tracking-widest text-lg hover:bg-amber-500/10 transition-all active:scale-95 shadow-lg"
            >
              CERRAR CICLO E INICIAR NUEVA ERA
            </button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 text-center text-slate-900 text-[10px] uppercase tracking-[0.8em] font-black pointer-events-none no-print">
        David A. Phillips • Escuela Huber • Quirología Técnica • Rider-Waite
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 2px solid black; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        @media print { 
          .no-print { display: none !important; } 
          body { background: white !important; color: black !important; padding: 0 !important; } 
          .bg-slate-950 { background: white !important; border: none !important; }
        }

        .prose table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 3rem 0; border: 1px solid #334155; border-radius: 1.5rem; overflow: hidden; }
        .prose th, .prose td { border: 1px solid #334155; padding: 18px; text-align: left; }
        .prose th { background: rgba(245, 158, 11, 0.1); color: #f59e0b; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; }
        
        ${exportMode ? `
          .prose th, .prose td { border: 1px solid #ccc !important; color: black !important; } 
          .prose th { background: #f8f8f8 !important; }
          .prose { color: black !important; }
        ` : ''}

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-in.shake { animation: shake 0.5s ease-in-out; }
      `}} />
    </div>
  );
}
