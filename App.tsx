
import React, { useState, useRef } from 'react';
import { 
  FileJson, 
  FileText, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Home,
  FileDown,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { aiService } from './services/aiService';
import { downloadAsWord } from './services/docxGenerator';

interface Section {
  heading: string;
  body: string;
}

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('Título del Examen');
  const [sections, setSections] = useState<Section[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result as string;
        JSON.parse(jsonContent);
        
        setIsProcessing(true);
        setError(null);
        
        const result = await aiService.analyzeJson(jsonContent);
        if (result) {
          setDocTitle(result.suggestedTitle);
          setSections(result.sections);
        } else {
          setError("La IA no pudo procesar el archivo. Intenta con otro JSON.");
        }
      } catch (err) {
        setError("El archivo no es un JSON válido.");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const isAnswerSection = (s: Section) => 
    s.heading.toLowerCase().includes('respuesta') || 
    s.heading.toLowerCase().includes('clave') || 
    s.heading.toLowerCase().includes('solución');

  const examSections = sections.filter(s => !isAnswerSection(s));
  const answerSections = sections.filter(s => isAnswerSection(s));

  const goHome = () => {
    setSections([]);
    setDocTitle('Título del Examen');
    setError(null);
  };

  const handleDownloadExam = () => {
    downloadAsWord(`${docTitle} - Examen`, examSections, false);
  };

  const handleDownloadAnswers = () => {
    downloadAsWord(`${docTitle} - Respuestas`, answerSections, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-indigo-100">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={goHome}>
            <div className="bg-slate-900 p-2 rounded-lg text-white shadow-sm group-hover:scale-105 transition-transform">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight">EXAM<span className="text-indigo-600">PRO</span></h1>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Eco-Friendly & Smart Formatting</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              className="hidden" 
              ref={fileInputRef}
            />
            {sections.length > 0 && (
              <div className="flex items-center gap-4">
                <button onClick={goHome} className="text-slate-400 hover:text-slate-900 transition-colors p-2 mr-2" title="Inicio">
                  <Home size={20} />
                </button>
                
                <button 
                  onClick={handleDownloadExam}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md group"
                >
                  <FileDown size={18} />
                  Descargar Examen
                </button>

                {answerSections.length > 0 && (
                  <button 
                    onClick={handleDownloadAnswers}
                    className="flex items-center gap-2 bg-white text-emerald-600 border border-emerald-100 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all active:scale-95 shadow-sm group"
                  >
                    <FileCheck size={18} />
                    Descargar Respuestas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-200 p-6 hidden xl:flex flex-col gap-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-500" /> Vista Previa
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              El contenido es de solo lectura. <strong>Descarga el documento Word</strong> para editar las preguntas y opciones con total libertad.
            </p>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <h4 className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <FileDown size={12} /> Formato A. B. C.
            </h4>
            <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
              El cuestionario utiliza letras para las opciones. La hoja de respuestas se descarga limpia, sin datos personales.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col gap-2 text-red-600">
              <div className="flex items-center gap-2 font-bold text-xs uppercase">
                <AlertCircle size={14} /> Error
              </div>
              <p className="text-[10px] leading-tight font-medium">{error}</p>
            </div>
          )}
          
          <div className="mt-auto pt-6 border-t border-slate-50">
             <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">Version 3.4 • Final Edition</p>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto bg-slate-100/50 p-8 custom-scrollbar flex flex-col items-center">
          {sections.length === 0 && !isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm">
              <div className="mb-10 relative">
                <div className="w-28 h-28 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center border border-slate-100 relative z-10">
                  <FileJson size={48} className="text-indigo-500" />
                </div>
                <div className="absolute -inset-4 bg-indigo-100/50 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Generador de Exámenes</h2>
              <p className="text-slate-500 mt-4 text-sm leading-relaxed font-medium">Sube un archivo JSON para generar documentos Word con formato de letras A. B. C. D. listo para imprimir.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 group"
              >
                Importar JSON
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">IA en Acción</p>
                <h3 className="text-xl font-bold text-slate-800">Diseñando el examen...</h3>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-12 pb-20">
              {/* VISTA PREVIA DEL EXAMEN */}
              <div className="flex flex-col items-center">
                <div className="mb-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-5 py-1.5 rounded-full shadow-sm border border-slate-200">
                  <FileText size={12} className="text-indigo-500" /> Vista Previa del Examen
                </div>
                <div 
                  id="exam-content" 
                  className="a4-page relative pointer-events-none select-none"
                  style={{ fontSize: '10pt', color: '#000' }}
                >
                  <div className="text-center border-b border-slate-200 pb-8 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-8">
                      {docTitle}
                    </h2>
                    <div className="grid grid-cols-1 gap-5 text-[10px] font-medium text-slate-800 uppercase tracking-wide text-left max-w-2xl mx-auto">
                      <div className="flex border-b border-slate-200 pb-2">
                        <span className="whitespace-nowrap">Estudiante: ____________________________________________________________________</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span>Grado: ____________________________</span>
                        <span>Fecha: ___/___/___</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {examSections.map((section, idx) => (
                      <div key={idx} className="relative">
                        <h3 className="text-base font-bold text-slate-900 mb-6 border-b border-slate-50 pb-1">
                          {section.heading}
                        </h3>
                        
                        <div className="space-y-4">
                          {section.body.split('\n').map((line, lIdx) => {
                            const trimmed = line.trim();
                            if (!trimmed) return <div key={lIdx} className="h-4" />;

                            // Nueva detección de opciones: A. B. C. D.
                            const optionMatch = trimmed.match(/^([A-Z])[\.\)]\s*(.*)/);

                            if (optionMatch) {
                              const letter = optionMatch[1];
                              const text = optionMatch[2];
                              return (
                                <div key={lIdx} className="flex items-start gap-4 pl-8 py-0.5">
                                  <div className="text-[10.5pt] font-bold text-slate-900 min-w-[20px]">{letter})</div>
                                  <div className="text-[10.5pt] font-normal text-slate-800">{text}</div>
                                </div>
                              );
                            }

                            return (
                              <div key={lIdx} className="text-[10.5pt] leading-snug font-normal text-slate-900 mb-2">
                                {trimmed}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-20 pb-4 flex items-center justify-center gap-4 text-slate-200">
                    <div className="h-[0.5px] flex-1 bg-slate-100" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap opacity-40">
                      Fin del Cuestionario
                    </span>
                    <div className="h-[0.5px] flex-1 bg-slate-100" />
                  </div>
                </div>
              </div>

              {/* VISTA PREVIA DE LAS RESPUESTAS */}
              {answerSections.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-5 py-1.5 rounded-full shadow-sm border border-slate-200 mt-10">
                    <FileCheck size={12} className="text-emerald-500" /> Hoja de Respuestas
                  </div>
                  <div 
                    id="answers-content" 
                    className="a4-page relative pointer-events-none select-none"
                    style={{ fontSize: '10pt', color: '#000' }}
                  >
                    <div className="text-center border-b border-slate-200 pb-8 mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-2">
                        Solucionario
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{docTitle}</p>
                    </div>

                    <div className="space-y-10">
                      {answerSections.map((section, idx) => (
                        <div key={idx} className="relative">
                          <h3 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-50">
                            {section.heading}
                          </h3>
                          <div className="text-[10.5pt] leading-relaxed text-slate-700 whitespace-pre-wrap italic border-l-4 border-slate-100 pl-5 py-1">
                            {section.body.replace(/\[\]/g, '').trim()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-20 pb-4 text-center text-slate-200">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Documento de Referencia</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 px-8 py-3 flex justify-between items-center text-slate-400 font-bold text-[8px] uppercase tracking-widest">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-slate-900" /> Formato A. B. C. D.</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Hoja de Respuestas Ref.</span>
        </div>
        <p className="text-slate-300 tracking-tighter">EXAM PRO v3.4 • FINAL EDITION</p>
      </footer>
    </div>
  );
};

export default App;
