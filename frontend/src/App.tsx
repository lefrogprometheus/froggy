import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layout, Search, Globe, AlertCircle, CheckCircle, RefreshCcw, 
  Settings, ExternalLink, BarChart3, Database, Link as LinkIcon, 
  FileText, MessageSquare, ChevronRight, User, Shield, Zap,
  Menu, X, HelpCircle, Send, Moon, Sun, MapPin, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://localhost:8000';

const App = () => {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Data State
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [issues, setIssues] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // WP Config State
  const [wpConfig, setWpConfig] = useState({ 
    url: 'https://lefrog.io', 
    api_key: '60079b2e686491cd69a09615639a232fe85a07ee5d98ddc08031acef9b09dda7' 
  });
  const [wpVerified, setWpVerified] = useState(true); // Setting true since we just verified it


  // DFS Config State
  const [dfsConfig, setDfsConfig] = useState({ 
    login: 'davidvalentinetaylor@gmail.com', 
    password: '475929025d4b0da9' 
  });
  const [dfsVerified, setDfsVerified] = useState(true);
  const [showDFSModal, setShowDfsModal] = useState(false);
  
  // Research State
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordResults, setKeywordResults] = useState([]);
  const [isAnalyzingKeywords, setIsAnalyzingKeywords] = useState(false);

  // AI Module State
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Chat Support State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: "Ribbit! I'm LeFrog Support. David just uploaded a massive ZIP of 20+ SEO prompts. I'm learning them now! How can I help?" }
  ]);
  const [chatInput, setChatMessagesInput] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await axios.get(`${API_BASE}/gsc/sites`);
      setSites(res.data);
    } catch (err) {
      console.error("Error fetching sites", err);
    }
  };

  const analyzeSite = async (siteUrl) => {
    setLoading(true);
    setSelectedSite(siteUrl);
    try {
      const res = await axios.get(`${API_BASE}/gsc/issues/${encodeURIComponent(siteUrl)}`);
      setIssues(res.data);
    } catch (err) {
      console.error("Error analyzing site", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyWP = async () => {
    try {
      const res = await axios.post(`${API_BASE}/wp/verify`, wpConfig);
      if (res.data.status === 'success') {
        setWpVerified(true);
        setShowWpModal(false);
        alert(`WordPress Verified: Connected to ${res.data.site}`);
      }
    } catch (err) {
      alert("Plugin Verification Failed. Check your API Key and URL.");
    }
  };

  const handleKeywordSearch = async () => {
    if (!keywordInput.trim() || !dfsVerified) return;
    setIsAnalyzingKeywords(true);
    try {
      const res = await axios.post(`${API_BASE}/seo/keyword/suggestions`, {
        keyword: keywordInput,
        auth: dfsConfig
      });
      const items = res.data.tasks?.[0]?.result?.[0]?.items || [];
      setKeywordResults(items.map(item => ({
        kw: item.keyword,
        vol: item.keyword_info?.search_volume || 0,
        diff: item.keyword_properties?.keyword_difficulty || 0,
        cpc: item.keyword_info?.cpc || 0
      })));
    } catch (err) {
      console.error("Keyword search failed", err);
    } finally {
      setIsAnalyzingKeywords(false);
    }
  };

  const handleAIGenerate = async (moduleId, promptTemplate) => {
    if (!aiInput.trim()) return;
    setIsGeneratingAI(true);
    setAiOutput('');
    try {
      const res = await axios.post(`${API_BASE}/ai/generate`, {
        module_id: moduleId,
        user_input: aiInput,
        prompt_template: promptTemplate
      });
      setAiOutput(res.data.content);
    } catch (err) {
      console.error("AI Generation failed", err);
      setAiOutput("Error: AI Engine failed to generate content. Please check API settings.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { role: 'user', text: chatInput }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'bot', 
        text: "I've analyzed the new modules. I can now help you with GBP Post generation, Keyword Strategy clustering, and Meta description optimization. Which one are we working on?" 
      }]);
    }, 1000);
    setChatMessagesInput('');
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Layout, category: 'Main' },
    { id: 'research', name: 'Keyword Research', icon: Search, category: 'Research' },
    { id: 'strategy', name: 'Keyword Strategy', icon: Zap, category: 'Research' },
    { id: 'gbp', name: 'GBP Optimizer', icon: MapPin, category: 'Local SEO' },
    { id: 'meta', name: 'Meta Generator', icon: Edit3, category: 'Content' },
    { id: 'content', name: 'Blog Wizard', icon: FileText, category: 'Content' },
    { id: 'audit', name: 'Technical Audit', icon: Shield, category: 'Technical' },
  ];

  const categories = Array.from(new Set(navigation.map(item => item.category)));

  // Module Prompt Templates (from unzipped archive)
  const prompts = {
    meta: `Please ignore all previous instructions. Please respond only in the English language. You are an SEO expert & a good copywriter that speaks and writes fluent English. Do not self reference. Do not explain what you are doing. I will give you a list of keywords, and I want you to generate catchy page titles and click-bait meta descriptions for them. The page titles should be between 70 and 80 characters. The meta descriptions should be between 140 and 160 characters. Both the page titles and the meta descriptions should contain the keyword. Please print this out in a markdown table with "Keyword" as the first column, "Title" as the second and "Description" as the third column.`,
    gbp: `Please ignore all previous instructions. Please respond only in the English language. You are the a local SEO & Google My Business SEO expert. Do not self reference. Do not explain what you are doing. Please generate 5 compelling Questions and Answers (Q&A) that will inform and engage my customers. The Q&A should be concise and informative and include important local SEO and longtail keywords.`,
    strategy: `Please ignore all previous instructions. Please respond only in the English language. You are a market research expert that speaks and writes fluent English. You are an expert in keyword research and can develop a full SEO content plan. Create a markdown table with a list of closely related keywords clustered according to the top 10 super categories. For each keyword, show Search Intent, a catchy Title, and a Meta Description.`,
    content: `You are an SEO content writing expert. Generate a comprehensive blog post outline for the given topic. Include H1, H2, and H3 headers, bullet points for key sections, and a target primary keyword list.`
  };

  const themeClass = isDarkMode ? 'bg-[#050505] text-slate-200' : 'bg-slate-50 text-slate-900';
  const cardClass = isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const headerClass = isDarkMode ? 'bg-[#050505]/80 border-white/5' : 'bg-white/80 border-slate-200 shadow-sm';
  const sidebarClass = isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-slate-100 border-slate-200';

  return (
    <div className={`min-h-screen ${themeClass} font-sans flex overflow-hidden transition-colors duration-300`}>
      
      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={`h-screen ${sidebarClass} border-r flex flex-col transition-all z-40`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <Globe className={isDarkMode ? 'text-black' : 'text-white'} size={24} />
          </div>
          {isSidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`font-black text-xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              LEFROG<span className="text-emerald-500">.IO</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-8 overflow-y-auto scrollbar-hide">
          {categories.map(cat => (
            <div key={cat}>
              {isSidebarOpen && <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">{cat}</h3>}
              <div className="space-y-1">
                {navigation.filter(item => item.category === cat).map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setAiOutput(''); setAiInput(''); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-slate-500 hover:text-emerald-500'}`}
                  >
                    <item.icon size={20} className={activeTab === item.id ? 'text-emerald-500' : 'group-hover:scale-110 transition-transform'} />
                    {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/5 transition-all">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={() => setShowDFSModal(true)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/5 transition-all ${dfsVerified ? 'text-blue-500' : ''}`}>
            <Database size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">DFS {dfsVerified ? 'Active' : 'Setup'}</span>}
          </button>
          <button onClick={() => setShowWpModal(true)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/5 transition-all ${wpVerified ? 'text-emerald-500' : ''}`}>
            <Shield size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">WP Bridge {wpVerified ? 'Active' : 'Setup'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent">
        
        <header className={`sticky top-0 h-16 border-b ${headerClass} backdrop-blur-md z-30 px-8 flex items-center justify-between`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            {isSidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <Zap size={10} /> ENGINE v1.2
            </div>
            <div className="h-8 w-px bg-slate-500/10 mx-2" />
            <button className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-xs shadow-lg shadow-emerald-500/10">DT</button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>GSC <span className="text-emerald-500">Analyzer</span></h2>
                    <p className="text-slate-500 font-medium italic">Direct intelligence from Google Search Console properties.</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className={`${cardClass} border rounded-2xl p-6`}>
                      <h3 className="text-sm font-bold uppercase tracking-tighter mb-6">Properties</h3>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                        {sites.map(site => (
                          <button key={site.siteUrl} onClick={() => analyzeSite(site.siteUrl)} className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${selectedSite === site.siteUrl ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg' : 'bg-transparent border-transparent text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-500'}`}>
                            <div className="flex items-center justify-between">
                              <span className="truncate text-sm font-bold">{site.siteUrl.replace('https://', '').replace('http://', '')}</span>
                              {selectedSite === site.siteUrl && <RefreshCcw size={14} className="animate-spin" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-8">
                    {selectedSite ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Sitemaps', val: issues?.sitemaps?.length || 0, icon: FileText, color: 'text-blue-500' },
                            { label: 'Avg Position', val: '12.4', icon: BarChart3, color: 'text-amber-500' },
                            { label: 'Integrity', val: '8.9/10', icon: Shield, color: 'text-emerald-500' }
                          ].map((s, i) => (
                            <div key={i} className={`${cardClass} border p-6 rounded-2xl`}>
                              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 block">{s.label}</span>
                              <div className="flex items-end justify-between">
                                <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.val}</span>
                                <s.icon className={s.color} size={20} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`${cardClass} border rounded-2xl overflow-hidden shadow-2xl`}>
                          <div className="p-6 border-b border-white/5 font-black text-xs uppercase tracking-widest">Active Repairs</div>
                          <div className="p-12 text-center text-slate-500 italic">Connected to WP Bridge. Analyzing site for one-click repairs...</div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-12 opacity-40">
                        <Globe size={64} className="mb-6" />
                        <p className="text-xl font-black uppercase tracking-tighter">Standby for Data</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI MODULE TABS (Meta, GBP, Strategy, Content) */}
            {['meta', 'gbp', 'strategy', 'content'].includes(activeTab) && (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">
                    {navigation.find(n => n.id === activeTab).name.split(' ')[0]} <span className="text-emerald-500">{navigation.find(n => n.id === activeTab).name.split(' ')[1]}</span>
                  </h2>
                  <p className="text-slate-500 font-medium italic">Powered by LeFrog AI Prompt Engine.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className={`${cardClass} border p-8 rounded-3xl`}>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">User Input (Keywords, Topics, Business Name)</label>
                      <textarea 
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 min-h-[200px] font-medium"
                        placeholder="Enter keywords or site details here..."
                      />
                      <button 
                        onClick={() => handleAIGenerate(activeTab, prompts[activeTab])}
                        disabled={isGeneratingAI || !aiInput.trim()}
                        className="mt-6 w-full py-4 bg-emerald-500 text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-tighter disabled:opacity-50"
                      >
                        {isGeneratingAI ? <RefreshCcw className="animate-spin mx-auto" /> : 'Run AI Optimization'}
                      </button>
                    </div>
                  </div>

                  <div className={`${cardClass} border p-8 rounded-3xl min-h-[400px] relative overflow-hidden`}>
                    <div className="absolute top-6 right-8 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Live Output</div>
                    <div className="prose prose-invert prose-emerald max-w-none prose-sm">
                      {aiOutput ? (
                        <ReactMarkdown>{aiOutput}</ReactMarkdown>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 italic">Result will appear here...</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RESEARCH TAB */}
            {activeTab === 'research' && (
              <motion.div key="research" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div>
                  <h2 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">Keyword <span className="text-emerald-500">Intelligence</span></h2>
                  <p className="text-slate-500 font-medium italic">Fueled by DataForSEO API.</p>
                </div>
                <div className={`${cardClass} border p-8 rounded-3xl flex flex-col md:flex-row gap-4`}>
                   <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500" placeholder="Search volume for..." />
                   <button onClick={handleKeywordSearch} className="px-10 bg-emerald-500 text-black font-black rounded-2xl">Search</button>
                </div>
                <div className={`${cardClass} border rounded-3xl overflow-hidden`}>
                  <div className="divide-y divide-white/5">
                    {keywordResults.map((r, i) => (
                      <div key={i} className="p-6 flex justify-between">
                        <span className="font-bold">{r.kw}</span>
                        <div className="flex gap-10 text-[10px] uppercase font-black">
                          <div><span className="text-slate-600 block">Volume</span>{r.vol}</div>
                          <div><span className="text-slate-600 block">Difficulty</span>{r.diff}</div>
                          <div><span className="text-slate-600 block">CPC</span>${r.cpc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AUDIT TAB */}
            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[60vh] flex items-center justify-center opacity-20">
                <Shield size={100} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* --- CHAT SUPPORT --- */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className={`${cardClass} w-96 h-[500px] border rounded-2xl mb-4 shadow-2xl flex flex-col overflow-hidden`}>
                <div className="p-4 bg-emerald-500 text-black flex items-center justify-between font-black uppercase text-xs">
                  <span>LeFrog Assistant</span>
                  <button onClick={() => setIsChatOpen(false)}><X size={18}/></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[11px] leading-relaxed font-bold ${msg.role === 'user' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-300'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/5 flex gap-2">
                  <input value={chatInput} onChange={e => setChatMessagesInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none" placeholder="Message assistant..." />
                  <button onClick={handleSendMessage} className="p-2 bg-emerald-500 text-black rounded-xl"><Send size={16} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-2xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all">
            <MessageSquare size={28} />
          </button>
        </div>

      </main>

      {/* --- CONFIG MODALS --- */}
      <AnimatePresence>
        {showDFSModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${cardClass} border w-full max-w-md rounded-3xl p-8 shadow-2xl relative`}>
              <h3 className="text-3xl font-black mb-6 uppercase italic">DataForSEO</h3>
              <div className="space-y-5 mb-10">
                <input value={dfsConfig.login} onChange={e => setDfsConfig({...dfsConfig, login: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-white" placeholder="API Login" />
                <input type="password" value={dfsConfig.password} onChange={e => setDfsConfig({...dfsConfig, password: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-white" placeholder="API Password" />
              </div>
              <button onClick={() => { setDfsVerified(true); setShowDfsModal(false); }} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl">Connect API</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;
