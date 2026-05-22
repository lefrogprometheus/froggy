import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { 
  FileText, Zap, CheckCircle, AlertTriangle, 
  BarChart3, Settings, Save, Send, Trash2, Copy,
  ArrowUpRight, Link as LinkIcon, Share2, MessageSquare,
  Globe, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HemingwayEditor = ({ initialContent = '', onSave, selectedSite = 'lefrog.io' }) => {
  const [content, setContent] = useState(initialContent);
  const [activeAnalysis, setActiveAnalysis] = useState(true);
  const [showGSCContext, setShowGSCContext] = useState(true);
  const [showSpooler, setShowSpooler] = useState(false);
  const editorRef = useRef(null);

  // Mock GSC Data for the "Evidence of Impact" Overlay
  const sparklineData = [
    { name: 'Day 1', clicks: 400 },
    { name: 'Day 2', clicks: 450 },
    { name: 'Day 3', clicks: 420 },
    { name: 'Day 4', clicks: 500 },
    { name: 'Day 5', clicks: 580 },
    { name: 'Day 6', clicks: 540 },
    { name: 'Day 7', clicks: 620 },
  ];

  // Analysis Logic
  const analysis = useMemo(() => {
    const text = content.trim();
    if (!text) return { score: 0, sentences: [], words: 0, complex: 0, passive: 0, adverbs: 0, positions: [] };

    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const words = text.split(/\s+/).filter(Boolean);
    
    // Track positions for "Signal Lighting" scrollbar
    const passiveCount = (text.match(/\b(is|am|are|was|were|be|being|been)\b\s+\w+ed\b/gi) || []).length;
    const adverbCount = (text.match(/\b\w+ly\b/gi) || []).length;
    const complexCount = sentences.filter(s => s.split(' ').length > 20).length;
    const veryComplexCount = sentences.filter(s => s.split(' ').length > 30).length;

    const score = Math.max(0, Math.min(100, 100 - (complexCount * 5) - (passiveCount * 2) - (adverbCount * 1)));

    return {
      score,
      sentencesCount: sentences.length,
      words: words.length,
      complex: complexCount,
      veryComplex: veryComplexCount,
      passive: passiveCount,
      adverbs: adverbCount
    };
  }, [content]);

  const COLORS = ['#10b981', '#f59e0b'];
  const chartData = [
    { name: 'Readability', value: analysis.score, color: '#10b981' },
    { name: 'Complexity', value: 100 - analysis.score, color: '#f59e0b' }
  ];

  const internalLinks = [
    { title: "SEO Strategy for 2026", url: "/seo-strategy-2026" },
    { title: "WordPress Bridge Setup", url: "/wp-bridge-guide" },
    { title: "GSC Data Mining", url: "/gsc-mining" }
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-full min-h-[700px]">
      
      {/* Editor Main Surface */}
      <div className="col-span-12 lg:col-span-8 flex flex-col space-y-4 relative">
        
        {/* GSC CONTEXT OVERLAY (Top Sparkline) */}
        <AnimatePresence>
          {showGSCContext && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">GSC Context: {selectedSite}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500">+12% vs last week</div>
              </div>
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-black uppercase tracking-tighter text-sm flex items-center gap-2">
              <FileText size={18} className="text-emerald-500" />
              Hemingway Flow
            </h3>
            <button onClick={() => setShowGSCContext(!showGSCContext)} className="text-[10px] font-black text-slate-500 hover:text-emerald-500 transition-colors">
              TOGGLE GSC DATA
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400 uppercase">
              Persona: <span className="text-emerald-500">David Taylor</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-3xl relative overflow-hidden flex">
          
          {/* Signal Lighting (Left Bar) */}
          <div className="w-1 border-r border-white/5 h-full relative opacity-50">
             {analysis.veryComplex > 0 && <div className="absolute top-[20%] w-full h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
             {analysis.complex > 0 && <div className="absolute top-[45%] w-full h-1 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
             {analysis.passive > 0 && <div className="absolute top-[75%] w-full h-1 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
          </div>

          <div className="flex-1 p-8 relative">
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-300 font-medium leading-relaxed resize-none scrollbar-hide text-lg"
              placeholder="Start the flow..."
            />
          </div>
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[grid_20px_20px] bg-white" />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSpooler(true)}
            className="flex-1 bg-emerald-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-emerald-500/10 uppercase tracking-tighter text-sm"
          >
            <Send size={18} />
            Publish & Spool
          </button>
        </div>
      </div>

      {/* Analysis Sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        
        {/* Score Card */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6">
          <div className="text-center mb-6">
             <div className="h-32 w-32 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={50} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-3xl font-black text-white -mt-20">{analysis.score}</div>
              <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">READABILITY</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div className="text-center">
              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Words</div>
              <div className="text-lg font-black text-white">{analysis.words}</div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">SEO Impact</div>
              <div className="text-lg font-black text-emerald-500">High</div>
            </div>
          </div>
        </div>

        {/* Style Diagnostics */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 space-y-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Style Warnings</span>
          {[
            { label: 'Passive Voice', count: analysis.passive, color: 'text-emerald-400' },
            { label: 'Complex Sentences', count: analysis.complex, color: 'text-amber-400' },
            { label: 'Critical Fixes', count: analysis.veryComplex, color: 'text-red-400' }
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] font-black uppercase text-slate-400">{r.label}</span>
              <span className={`font-black ${r.color}`}>{r.count}</span>
            </div>
          ))}
        </div>

        {/* INTERNAL LINKS (WP Bridge) */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <LinkIcon size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Bridge Suggestions</span>
          </div>
          <div className="space-y-2">
            {internalLinks.map((link, i) => (
              <div key={i} className="group flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer">
                <div className="text-[10px] font-bold text-slate-300 truncate w-40">{link.title}</div>
                <ArrowUpRight size={12} className="text-slate-600 group-hover:text-emerald-500" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SPOOLER MODAL */}
      <AnimatePresence>
        {showSpooler && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[110] p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="bg-[#0a0a0a] border border-emerald-500/20 w-full max-w-lg rounded-[40px] p-10 relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Share2 size={200} className="text-emerald-500" />
                </div>
                
                <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2 uppercase">Success<span className="text-emerald-500">!</span></h3>
                <p className="text-slate-500 font-bold mb-10 italic">Published to lefrog.io. Spooling social distribution...</p>
                
                <div className="space-y-4 mb-10">
                  {[
                    { label: 'Google Business Profile', status: 'SPOOLING', icon: Globe },
                    { label: 'LinkedIn Professional', status: 'READY', icon: Share2 },
                    { label: 'Agency Slack Alert', status: 'SENT', icon: MessageSquare }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                           <s.icon size={20} />
                         </div>
                         <span className="font-black uppercase text-xs tracking-tighter text-slate-200">{s.label}</span>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${s.status === 'SPOOLING' ? 'bg-amber-500 text-black' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={() => setShowSpooler(false)} className="w-full py-5 bg-white text-black font-black rounded-3xl uppercase tracking-tighter hover:bg-emerald-500 transition-colors shadow-2xl">
                  Back to Dashboard
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HemingwayEditor;
