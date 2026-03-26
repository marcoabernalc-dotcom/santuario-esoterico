import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Star, Hand, Layout, Hash, ArrowRight, Sparkles, 
  RotateCcw, Info, User, MapPin, Clock, Camera, 
  Loader2, FileText, Download, Printer, CheckCircle2, Eye,
  ShieldAlert, Heart, Briefcase, Users, Coins, Zap
} from 'lucide-react';

/**
 * SAGRADO A PAGRUARAN - VERSION TI VERCEL
 * Nadisenio para iti panagbasa ti gasat ken bituen.
 */

// Se establece como cadena vacía para que el entorno de ejecución proporcione la clave automáticamente
const apiKey = ""; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const ARCANOS_MAYORES = [
  { id: 0, name: "Ti Kuneng" }, { id: 1, name: "Ti Managsalamangka" }, { id: 2, name: "Ti Nangato a Padi" },
  { id: 3, name: "Ti Emperatriz" }, { id: 4, name: "Ti Emperador" }, { id: 5, name: "Ti Hierofante" },
  { id: 6, name: "Dagiti Agiinnayat" }, { id: 7, name: "Ti Karitela" }, { id: 8, name: "Ti Pigsá" },
  { id: 9, name: "Ti Agmaymaysa" }, { id: 10, name: "Ti Pagpusingan ti Gasat" }, { id: 11, name: "Ti Hustisia" },
  { id: 12, name: "Ti Naibitay" }, { id: 13, name: "Ti Patay" }, { id: 14, name: "Ti Panagtitimpuyog" },
  { id: 15, name: "Ti Saíro" }, { id: 16, name: "Ti Torre" }, { id: 17, name: "Ti Bituen" },
  { id: 18, name: "Ti Bulan" }, { id: 19, name: "Ti Inniat" }, { id: 20, name: "Ti Hustisia Paha" },
  { id: 21, name: "Ti Lubong" }
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
  const fileInputRef = useRef(null);

  // Panagawag idiay Gemini AI
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
        parts: [{ text: "Sika ket maysa a Oráculo Maestro. Usarem ti David A. Phillips, Escuela Huber, Quirología Técnica, ken Tarot Rider-Waite. Ilawlawagmo ti Napalabas, Agdama, ken Masakbayan. Dagiti kategoria: Salun-at, Ayat, Trabaho, Pamilia, Ekonomia, Gayyem, ken dadduma pay. Isuratmo iti maysa a propetiko a tono." }]
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
        if (!response.ok) throw new Error(data.error?.message || "Madi ti koneksion");
        setIsProcessing(false);
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        retries++;
        if (retries === maxRetries) {
          setError("Ita ket madi ti pannakiuman kadagiti bituen. Padasem manen.");
          setIsProcessing(false);
          throw err;
        }
        await new Promise(res => setTimeout(res, Math.pow(2, retries) * 1000));
      }
    }
  };

  const handleNumerology = async () => {
    if (!userData.name || !userData.birthDate) return;
    const prompt = `Numerolohia ni ${userData.name} (${userData.birthDate}) segun ken David A. Phillips.`;
    const res = await callGemini(prompt);
    if (res) { setStudies(s => ({ ...s, numerology: res })); setView('numerology_result'); }
  };

  const handleAstral = async () => {
    const prompt = `Mapa ti Bituen Huber para ken ${userData.name} idiay ${userData.birthPlace} iti oras a ${userData.birthTime}.`;
    const res = await callGemini(prompt);
    if (res) { setStudies(s => ({ ...s, astral: res })); setView('astral_result'); }
  };

  const handleHands = async (base64) => {
    const prompt = `Panagbasa ti ima (Quirología Técnica) para iti daytoy a ladawan.`;
    const res = await callGemini(prompt, base64);
    if (res) { setStudies(s => ({ ...s, hands: res })); setView('hands_result'); }
  };

  const handleTarot = async () => {
    const cards = userData.tarotCards.map(c => c.name).join(', ');
    const prompt = `Panagbasa ti Tarot Rider-Waite: ${cards}.`;
    const res = await callGemini(prompt);
    if (res) { setStudies(s => ({ ...s, tarot: res })); setView('tarot_result'); }
  };

  const handleFinalReport = async () => {
    const prompt = `DAGUP A REPORTE PARA KEN ${userData.name}. Ilawlawagmo ti amin a naadal manipud kadagiti uppat a wagas ti panagbasa.`;
    const res = await callGemini(prompt);
    if (res) { setStudies(s => ({ ...s, synthesis: res })); setView('final_report'); }
  };

  const StepCard = ({ title, icon: Icon, content, onNext, label }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
          <Icon className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-amber-50">{title}</h2>
      </div>
      <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl max-h-[50vh] overflow-y-auto prose prose-invert prose-amber max-w-none custom-scrollbar">
        <div className="whitespace-pre-wrap text-slate-300 font-serif text-lg leading-relaxed">{content}</div>
      </div>
      <button onClick={onNext} className="w-full bg-amber-600 hover:bg-amber-500 p-5 rounded-2xl font-black text-black uppercase tracking-widest flex items-center justify-center gap-2">
        {label} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 md:p-12 font-sans selection:bg-amber-500/30">
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-16 relative z-10 border-b border-slate-900 pb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="text-amber-500 w-10 h-10" />
          <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-600 uppercase">Sagrado a Pagruaran</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto relative z-10">
        {error && <div className="bg-red-900/40 border-2 border-red-500/50 p-6 rounded-3xl text-red-100 text-center mb-10">{error}</div>}

        {view === 'welcome' && (
          <div className="bg-slate-900/40 p-10 md:p-16 rounded-[4rem] border border-slate-800 space-y-12 animate-in zoom-in text-center shadow-2xl">
            <h2 className="text-5xl font-serif font-bold text-white">Ritual ti Panagirugi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-2">
                <label className="text-xs uppercase text-amber-500 font-bold">Nagan ti Agkunsulta</label>
                <input type="text" className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 text-xl" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} placeholder="Isuratmo ti naganmo..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase text-amber-500 font-bold">Petsa ti Panakaipasngay</label>
                <input type="date" className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-amber-500 text-xl" value={userData.birthDate} onChange={(e) => setUserData({...userData, birthDate: e.target.value})} />
              </div>
            </div>
            <button onClick={handleNumerology} disabled={!userData.name || !userData.birthDate || isProcessing} className="w-full bg-amber-600 p-8 rounded-[2.5rem] font-black uppercase text-black flex items-center justify-center gap-4 hover:bg-amber-500 shadow-2xl">
              {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : "Irugi ti Numerolohia"}
            </button>
          </div>
        )}

        {view === 'numerology_result' && <StepCard title="I. Numerolohia" icon={Hash} content={studies.numerology} onNext={() => setView('ask_astral')} label="Ipasursur idiay Mapa ti Bituen" />}
        {view === 'astral_result' && <StepCard title="II. Mapa ti Bituen" icon={Moon} content={studies.astral} onNext={() => setView('ask_hands')} label="Ipasursur idiay Panagbasa ti Ima" />}
        {view === 'hands_result' && <StepCard title="III. Panagbasa ti Ima" icon={Hand} content={studies.hands} onNext={() => setView('ask_tarot')} label="Ipasursur idiay Tarot" />}
        {view === 'tarot_result' && <StepCard title="IV. Tarot" icon={Layout} content={studies.tarot} onNext={handleFinalReport} label="Garamid ti Dagup a Reporte" />}

        {view === 'final_report' && (
          <div className="bg-slate-950 border-2 border-amber-600/20 p-8 md:p-16 rounded-[4rem] shadow-2xl">
             <h2 className="text-4xl font-serif font-bold mb-10 text-amber-100 uppercase tracking-widest">Dagup a Reporte</h2>
             <div className="whitespace-pre-wrap font-serif text-xl leading-relaxed text-slate-200">{studies.synthesis}</div>
             <button onClick={() => window.location.reload()} className="w-full mt-12 text-amber-500 font-black border-2 border-amber-900/40 py-6 rounded-full hover:bg-amber-900/10 transition-colors uppercase">Baro a Ritual</button>
          </div>
        )}

        {/* Panagkolekta ti dadduma pay a datos */}
        {view === 'ask_astral' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 space-y-10 text-center animate-in slide-in-from-right backdrop-blur-sm">
            <h2 className="text-4xl font-serif font-bold text-white">Mapa ti Langit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <input type="text" className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-purple-500 text-xl" value={userData.birthPlace} onChange={(e) => setUserData({...userData, birthPlace: e.target.value})} placeholder="Ili a nakaipasngayan..." />
              <input type="time" className="w-full bg-black/60 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-purple-500 text-xl" value={userData.birthTime} onChange={(e) => setUserData({...userData, birthTime: e.target.value})} />
            </div>
            <button onClick={handleAstral} className="w-full bg-purple-600 p-8 rounded-[2.5rem] font-black text-white uppercase shadow-xl">Garamid ti Mapa</button>
          </div>
        )}

        {view === 'ask_hands' && (
          <div className="bg-slate-900/40 p-10 rounded-[4rem] border border-slate-800 text-center space-y-10">
            <h2 className="text-4xl font-serif font-bold text-white">Panagbasa ti Ima</h2>
            <div className="border-4 border-dashed border-slate-800 rounded-[3rem] p-20 bg-slate-950/50 cursor-pointer" onClick={() => !isProcessing && fileInputRef.current.click()}>
              {userData.handImage ? <img src={userData.handImage} className="w-72 h-72 mx-auto rounded-[2rem] border-2 border-emerald-500 shadow-2xl object-cover" /> : <div className="flex flex-col items-center gap-6 text-slate-700"><Camera className="w-20 h-20" /><p className="font-black uppercase tracking-widest text-sm">I-upload ti ladawan ti ima</p></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if(file){
                  const reader = new FileReader();
                  reader.onloadend = () => { setUserData({...userData, birthPlace: userData.birthPlace, handImage: reader.result}); handleHands(reader.result); };
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
          </div>
        )}

        {view === 'ask_tarot' && (
          <div className="space-y-12 text-center animate-in fade-in">
            <h2 className="text-5xl font-serif font-bold text-white">Ti Tarot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
            <button onClick={handleTarot} disabled={userData.tarotCards.length < 3 || isProcessing} className="w-full bg-purple-800 p-8 rounded-[2.5rem] font-black uppercase text-white shadow-2xl transition-colors hover:bg-purple-700">Basaen ti Tarot</button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 text-center text-slate-800 text-[10px] uppercase tracking-[0.8em] font-black no-print">
        David A. Phillips • Escuela Huber • Quirología Técnica • Rider-Waite
      </footer>
    </div>
  );
}
