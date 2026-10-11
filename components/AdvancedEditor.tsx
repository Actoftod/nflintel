
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiService } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eraser, Wand2, Image as ImageIcon, Sun, RotateCcw, RotateCw, 
  Save, X, Cpu, Globe, Maximize2, MousePointer2, Layers, 
  Eye, ChevronLeft, Sliders, Zap, Sparkles, Video, Play, 
  Download, Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AdvancedEditorProps {
  initialImage: string;
  onSave: (img: string) => void;
  onBack: () => void;
}

const TOOL_PRESETS: Record<string, { label: string; icon: any; suggestions: string[]; color: string }> = {
  fill: { 
    label: 'GEN_FILL', 
    icon: Wand2, 
    color: '#ccff00',
    suggestions: ['Gold championship chain', 'Nike Vapor Elite gloves', 'Carbon fiber visor', 'Captain armband'] 
  },
  erase: { 
    label: 'MAGIC_ERASE', 
    icon: Eraser, 
    color: '#ff3b30',
    suggestions: ['Remove logo watermark', 'Erase spectators', 'Clean skin blemishes'] 
  },
  bg: { 
    label: 'ENV_SYNTH', 
    icon: ImageIcon, 
    color: '#007aff',
    suggestions: ['Neon Tokyo', 'Brutalist Void', 'Mars Habitat', 'Rainy London'] 
  },
  lighting: { 
    label: 'NEURAL_LIGHT', 
    icon: Sun, 
    color: '#ff9500',
    suggestions: ['Rim Lighting', 'Golden Hour', 'Cyberpunk Neon'] 
  }
};

const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ initialImage, onSave, onBack }) => {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [activeTool, setActiveTool] = useState<'fill' | 'bg' | 'lighting' | 'erase'>('fill');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Undo/Redo State
  const [history, setHistory] = useState<string[]>([initialImage]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  const [brushSize, setBrushSize] = useState(48);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showMask, setShowMask] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isComparing, setIsComparing] = useState(false);

  // Video State
  const [showVideoMaker, setShowVideoMaker] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gemini = useRef(new GeminiService());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space') setIsComparing(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsComparing(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = TOOL_PRESETS[activeTool].color + 'AA';
  }, [brushSize, activeTool]);

  const startDrawing = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || isProcessing || isComparing) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (!isDrawing || !canvasRef.current || isProcessing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const crect = canvas.getBoundingClientRect();
    const x = (e.clientX - crect.left) * (canvas.width / crect.width);
    const y = (e.clientY - crect.top) * (canvas.height / crect.height);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generateMask = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return null;
    tCtx.fillStyle = 'black';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.globalCompositeOperation = 'source-over';
    tCtx.drawImage(canvas, 0, 0);
    const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;
    let hasPixels = false;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] > 0) {
        data[0] = data[i+1] = data[i+2] = 255;
        data[i+3] = 255;
        hasPixels = true;
      }
    }
    tCtx.putImageData(imgData, 0, 0);
    return hasPixels ? tempCanvas.toDataURL('image/png') : null;
  }, []);

  const handleAIAction = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt && activeTool !== 'erase') return;
    
    setIsProcessing(true);
    const mask = generateMask();

    try {
      let result = '';
      if (!mask && finalPrompt) {
        result = await gemini.current.performFlashImageEdit(currentImage, finalPrompt);
      } else {
        result = await gemini.current.performGenerativeEdit(currentImage, finalPrompt, activeTool, mask || undefined);
      }
      
      if (result) {
        setCurrentImage(result);
        setHistory(prev => [...prev, result]);
        setRedoStack([]); // New action invalidates redo stack
        clearCanvas();
      }
    } catch (err) {
      console.error(err);
      alert('Neural processing error.');
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const last = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      
      setRedoStack(prev => [last, ...prev]);
      setHistory(newHistory);
      setCurrentImage(previous);
      clearCanvas();
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      const newRedoStack = redoStack.slice(1);
      
      setHistory(prev => [...prev, next]);
      setRedoStack(newRedoStack);
      setCurrentImage(next);
      clearCanvas();
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    setIsGeneratingVideo(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic high-performance athlete video. Style: Nike commercial. ${videoPrompt}`,
        image: {
          imageBytes: currentImage.split(',')[1],
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
        setShowVideoMaker(false);
      }
    } catch (err) {
      console.error("Video synthesis failed:", err);
      alert("Neural motion synthesis failed. Check your connection.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#050505] animate-in fade-in duration-700">
      <header className="sticky top-0 z-[110] bg-black/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 group p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-500 group-hover:text-white" />
            <div className="flex flex-col items-start leading-none">
              <span className="font-oswald italic font-black text-[10px] tracking-widest text-zinc-500 uppercase">EXIT_STUDIO</span>
              <span className="font-oswald italic font-black text-[14px] text-white uppercase mt-1">DESIGN_MATRIX_v5.4</span>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 mr-4">
            <button 
              onClick={undo} 
              disabled={history.length <= 1 || isProcessing} 
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 transition-all border border-white/5"
              title="Undo Neural State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={redo} 
              disabled={redoStack.length === 0 || isProcessing} 
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 transition-all border border-white/5"
              title="Redo Neural State"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowVideoMaker(true)} className="w-10 h-10 glass border border-[#ccff00]/20 rounded-xl flex items-center justify-center text-[#ccff00] hover:bg-[#ccff00]/10 transition-all" title="Generate Cinematic Clip">
              <Video className="w-4 h-4" />
            </button>
            <button onClick={clearCanvas} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all border border-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => onSave(currentImage)} className="px-8 py-3 bg-[#ccff00] text-black font-oswald italic font-black text-sm rounded-xl hover:scale-105 active:scale-95 transition-all uppercase shadow-[0_0_20px_rgba(204,255,0,0.3)] flex items-center gap-2">
            <Save className="w-4 h-4" /> COMMIT_MASTER
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        <aside className="w-full lg:w-[360px] lg:border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-xl shrink-0 p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-oswald italic text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-black">ACTIVE_TOOL</h4>
              <div className="w-1 h-1 rounded-full bg-[#ccff00] animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TOOL_PRESETS).map(([id, tool]) => (
                <button key={id} onClick={() => setActiveTool(id as any)} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group ${activeTool === id ? 'bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.1)]' : 'glass border-white/5 text-zinc-500 hover:border-white/10 hover:text-white'}`}>
                  <tool.icon className={`w-5 h-5 shrink-0 ${activeTool === id ? 'text-black' : 'text-zinc-700 group-hover:text-white'}`} />
                  <span className="font-oswald italic font-black text-[11px] tracking-widest uppercase leading-none">{tool.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-3 h-3 text-[#ccff00]" />
                <h4 className="font-oswald italic text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-black">BRUSH_PARAMS</h4>
              </div>
              <span className="font-oswald italic text-[10px] text-white font-black">{brushSize}PX</span>
            </div>
            <div className="glass p-5 rounded-2xl border border-white/5">
              <input type="range" min="8" max="250" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#ccff00]" />
            </div>
          </section>

          <section className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#ccff00]" />
                <h4 className="font-oswald italic text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-black">NEURAL_PROMPT</h4>
              </div>
            </div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="DIRECTIVE (e.g. 'Add a retro filter')" className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 font-inter italic text-sm text-zinc-300 outline-none focus:border-[#ccff00] h-32 resize-none transition-all shadow-inner" />
            <button onClick={() => handleAIAction()} disabled={isProcessing || (!prompt && activeTool !== 'erase')} className="w-full py-4 bg-white text-black font-oswald italic font-black text-sm rounded-xl hover:bg-[#ccff00] transition-all disabled:opacity-20 uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2">
              {isProcessing ? <RotateCcw className="w-4 h-4 animate-spin" /> : 'EXECUTE_REMIX'}
            </button>
          </section>
        </aside>

        <main className="flex-1 relative bg-black flex items-center justify-center p-4 lg:p-10 group cursor-none">
          <div ref={containerRef} className="relative w-full max-w-[1200px] aspect-[3/4] glass rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-zinc-950">
            {generatedVideoUrl ? (
              <div className="relative w-full h-full">
                <video src={generatedVideoUrl} autoPlay loop playsInline className="w-full h-full object-cover" />
                <button onClick={() => setGeneratedVideoUrl(null)} className="absolute top-6 right-6 w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all z-[100]">
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-[100]">
                  <div className="px-4 py-2 glass rounded-full font-oswald italic text-[10px] tracking-mega text-[#ccff00] uppercase font-black">
                    VEO_SYNTHESIS_ACTIVE
                  </div>
                </div>
              </div>
            ) : (
              <>
                <img src={isComparing ? initialImage : currentImage} className="w-full h-full object-cover pointer-events-none transition-opacity duration-300" alt="Design Viewport" />
                <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} className={`absolute inset-0 z-20 touch-none transition-opacity duration-500 ${showMask && !isComparing && !isProcessing ? 'opacity-100' : 'opacity-0'}`} />
              </>
            )}

            <AnimatePresence>
              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center z-[100]">
                  <div className="relative w-32 h-32 mb-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-[#ccff00]/10 border-t-[#ccff00] rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center"><Cpu className="w-12 h-12 text-[#ccff00] animate-pulse" /></div>
                  </div>
                  <h2 className="font-oswald italic font-black text-4xl text-[#ccff00] tracking-ultra uppercase text-center">FORGING_PLATE</h2>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isProcessing && !isComparing && !generatedVideoUrl && (
              <div className="absolute pointer-events-none z-50 border-2 rounded-full flex items-center justify-center transition-transform duration-75" style={{ width: brushSize, height: brushSize, left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)', borderColor: TOOL_PRESETS[activeTool].color, boxShadow: `0 0 15px ${TOOL_PRESETS[activeTool].color}66` }} />
            )}
          </div>
        </main>
      </div>

      {/* Video Generation Modal */}
      <AnimatePresence>
        {showVideoMaker && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg glass border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 blur-[60px]" />
              <button onClick={() => setShowVideoMaker(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="font-oswald italic font-black text-4xl uppercase tracking-ultra text-white mb-2">VEO_CLIP_GEN</h3>
              <p className="font-oswald italic text-[10px] text-zinc-500 tracking-[0.3em] uppercase mb-8">NEURAL_MOTION_SYNTHESIS</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-oswald italic text-[9px] text-[#ccff00] tracking-widest uppercase font-black px-1">MOTION_DIRECTIVE</label>
                  <textarea 
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="e.g. Athlete sprinting out of dark smoke with red laser trails..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-oswald italic font-black text-xl text-white outline-none focus:border-[#ccff00] h-32 resize-none"
                    autoFocus
                  />
                </div>
                <button 
                  onClick={handleGenerateVideo}
                  disabled={!videoPrompt || isGeneratingVideo}
                  className="w-full py-5 bg-[#ccff00] text-black font-oswald italic font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase"
                >
                  {isGeneratingVideo ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> SYNTHESIZING_CLIP...</>
                  ) : (
                    <><Play className="w-6 h-6" /> COMMENCE_GEN</>
                  )}
                </button>
                <div className="flex items-center gap-2 text-zinc-600 justify-center">
                  <Sparkles className="w-3 h-3" />
                  <span className="font-oswald italic text-[8px] uppercase tracking-widest">Veo 3.1 AI Engine // Ultra High Performance</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedEditor;
