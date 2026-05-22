import React, { useState } from 'react';
import { 
  FileText, Zap, ChevronRight, Layout, List, 
  RefreshCcw, ArrowRight, MessageSquare, Shield,
  CheckCircle, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpertWriter = ({ brief, onGenerate, isGenerating }) => {
  const [activeStep, setActiveTab] = useState('brief');

  if (!brief.keyword) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 opacity-40 italic">
        <FileText size={64} className="mb-4" />
        <p className="font-black uppercase tracking-tighter">No Active Brief</p>
        <p className="text-xs">Search for a keyword first to start the flow.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8 h-full min-h-[600px]">
      
      {/* WRITER WORKSPACE */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        
        {/* PROGRESS TRACKER */}
        <div className="flex items-center gap-4 px-2">
           {[
             { id: 'brief', label: 'Content Brief', icon: List },
             { id: 'writing', label: 'AI Synthesis', icon: Zap },
             { id: 'hemingway', label: 'Optimization', icon: Shield }
           ].map((step, idx) => (
             <React.Fragment key={step.id}>
               <div className={`flex items-center gap-2 ${activeStep === step.id ? 'text-emerald-500' : 'text-slate-600'}`}>
                  <step.icon size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{step.label}</span>
               </div>
               {idx < 2 && <ChevronRight size={12} className="text-slate-800" />}
             </React.Fragment>
           ))}
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 relative overflow-hidden">
           <div className="relative z-10">
              <div className="mb-8">
                <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] block mb-2">Primary Objective</span>
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">{brief.keyword}</h3>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-10">
                 <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Content Strategy context</span>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/20 pl-4 normal-case">
                       {brief.strategy || "Optimized article drafting based on target search intent and semantic clustering."}
                    </p>
                 </div>
                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Secondary Semantics</span>
                    <div className="flex flex-wrap gap-2">
                       {['Strategy', 'Implementation', 'Case Study', 'Expert Tips'].map(tag => (
                         <span key={tag} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[8px] font-black text-slate-500 uppercase tracking-tighter italic">#{tag}</span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl mb-10">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-[10px] text-black">DT</div>
                    <div>
                       <span className="text-[10px] font-black text-white uppercase block">David Taylor Persona</span>
                       <span className="text-[8px] font-bold text-emerald-500/70 uppercase tracking-widest">Active Influence</span>
                    </div>
                 </div>
                 <p className="text-[11px] text-slate-400 font-medium italic">
                    AI will synthesize a 1,200 word authoritative article with a high-density operational tone, focusing on signal over noise.
                 </p>
              </div>

              <button 
                onClick={() => onGenerate(brief)}
                disabled={isGenerating}
                className="w-full py-5 bg-emerald-500 text-black font-black rounded-3xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-tighter italic"
              >
                {isGenerating ? <RefreshCcw className="animate-spin" /> : <><Zap size={18} /> Initiate Full Article Synthesis</>}
              </button>
           </div>

           {/* Backdrop Pattern */}
           <div className="absolute top-0 right-0 p-10 opacity-[0.02]">
              <Edit3 size={300} />
           </div>
        </div>
      </div>

      {/* STATS SIDEBAR */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
         <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 block">Intelligence Metrics</span>
            <div className="space-y-4">
               <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Volume</span>
                  <span className="text-xl font-black text-white italic">{brief.volume?.toLocaleString() || '0'}</span>
               </div>
               <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Difficulty</span>
                  <span className={`text-xl font-black italic ${brief.difficulty > 50 ? 'text-red-500' : 'text-emerald-500'}`}>{brief.difficulty || '0'}/100</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">CPC Est.</span>
                  <span className="text-xl font-black text-emerald-500 italic">${brief.cpc?.toFixed(2) || '0.00'}</span>
               </div>
            </div>
         </div>

         <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
               <CheckCircle size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Auto-Optimization</span>
            </div>
            <ul className="space-y-3">
               {['H1-H3 Structure', 'Internal Link Hooks', 'Passive Voice Check', 'Readability Sync'].map(item => (
                 <li key={item} className="text-[10px] font-bold text-slate-400 flex items-center gap-2 italic">
                   <div className="w-1 h-1 rounded-full bg-emerald-500" />
                   {item}
                 </li>
               ))}
            </ul>
         </div>
      </div>

    </div>
  );
};

export default ExpertWriter;
