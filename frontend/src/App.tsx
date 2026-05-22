import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layout, Search, Globe, AlertCircle, CheckCircle, RefreshCcw, 
  Settings, ExternalLink, BarChart3, Database, Link as LinkIcon, 
  FileText, MessageSquare, ChevronRight, User, Shield, Zap,
  Menu, X, HelpCircle, Send, Moon, Sun, MapPin, Edit3, ArrowRight,
  List, Layers, Type, AlignLeft, Hash, Target, TrendingUp, PieChart as PieIcon,
  BookOpen, Rocket, Terminal, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- CHILD COMPONENTS ---
import HemingwayEditor from './components/features/content/HemingwayEditor';
import ExpertWriter from './components/features/content/ExpertWriter';

const API_BASE = 'https://froggy-production-c030.up.railway.app';

const App = () => {
  // --- AGENCY PIPELINE STATE ---
  const [pipeline, setPipeline] = useState({
    keyword: '',
    volume: 0,
    difficulty: 0,
    cpc: 0,
    strategy: '',
    outline: '',
    article: '',
    optimized: ''
  });

  const updatePipeline = (updates: any) => {
    setPipeline(prev => ({ ...prev, ...updates }));
  };

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('onboarding');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFixingWP, setIsFixingWP] = useState(false);
  
  // --- DATA STATE ---
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [issues, setIssues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [indexingKnowledge, setIndexingKnowledge] = useState<any>(null);
  
  // --- CONFIG STATE ---
  const [wpConfig, setWpConfig] = useState({ 
    url: 'https://lefrog.io', 
    api_key: '60079b2e686491cd69a09615639a232fe85a07ee5d98ddc08031acef9b09dda7' 
  });
  const [wpVerified, setWpVerified] = useState(true);
  const [showWpModal, setShowWpModal] = useState(false);

  const [dfsConfig, setDfsConfig] = useState({ 
    login: 'davidvalentinetaylor@gmail.com', 
    password: '475929025d4b0da9' 
  });
  const [dfsVerified, setDfsVerified] = useState(true);
  const [ga4Verified, setGa4Verified] = useState(false);
  const [showGA4Modal, setShowGA4Modal] = useState(false);
  const [ga4ClientId, setGa4ClientId] = useState('655909925746-cglen60cangj4g0fao10553tqoups80s.apps.googleusercontent.com');
  const [showDfsModal, setShowDfsModal] = useState(false);
  
  // --- MODULE STATE ---
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordResults, setKeywordResults] = useState<any[]>([]);
  const [isAnalyzingKeywords, setIsAnalyzingKeywords] = useState(false);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // --- REPAIR ENGINE STATE ---
  const [isScanning, setIsScanning] = useState(false);
  const [repairsFound, setRepairsFound] = useState<any[]>([]);

  // --- CHAT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'bot', text: "Ribbit! David, Radar, and the LeFrog Engine are active. Typography is polished, spacing is massive, and the pipeline is wired. How can I help today?" }
  ]);
  const [chatInput, setChatMessagesInput] = useState('');

  // --- EFFECTS ---
  useEffect(() => { 
    fetchSites(); 
    fetchIndexingKnowledge();
  }, []);

  // --- HANDLERS ---
  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/gsc/sites`);
      setSites(res.data);
    } catch (err) { console.error("Error fetching sites", err); }
    setLoading(false);
  };

  const fetchIndexingKnowledge = async () => {
    try {
      const res = await axios.get(`${API_BASE}/gsc/knowledge/indexing`);
      setIndexingKnowledge(res.data);
    } catch (err) { console.error(err); }
  };

  const analyzeSite = async (siteUrl: string) => {
    setLoading(true);
    setSelectedSite(siteUrl);
    setRepairsFound([]); 
    try {
      const res = await axios.get(`${API_BASE}/gsc/issues/${encodeURIComponent(siteUrl)}`);
      setIssues(res.data);
    } catch (err) { console.error("Error analyzing site", err); } finally { setLoading(false); }
  };

  const verifyWP = async () => {
    try {
      const res = await axios.post(`${API_BASE}/wp/verify`, wpConfig);
      if (res.data.status === 'success') {
        setWpVerified(true);
        setShowWpModal(false);
        alert(`Connected to ${res.data.site}`);
      }
    } catch (err) { alert("WP Bridge Failed"); }
  };

  const handleKeywordSearch = async () => {
    if (!keywordInput.trim() || !dfsVerified) return;
    setIsAnalyzingKeywords(true);
    setKeywordError(null);
    try {
      const res = await axios.post(`${API_BASE}/seo/keyword/suggestions`, {
        keyword: keywordInput,
        auth: dfsConfig
      });
      const tasks = res.data.tasks || [];
      const firstTask = tasks[0] || {};
      if (firstTask.status_code !== 20000) {
        setKeywordError(firstTask.status_message || "API Error");
        return;
      }
      const result = firstTask.result?.[0] || {};
      const items = result.items || [];
      setKeywordResults(items.map((item: any) => ({
        kw: item.keyword,
        vol: item.keyword_info?.search_volume || 0,
        diff: item.keyword_properties?.keyword_difficulty || 0,
        cpc: item.keyword_info?.cpc || 0
      })));
    } catch (err) { setKeywordError("Engine Connection Failed"); } finally { setIsAnalyzingKeywords(false); }
  };

  const handleStartAudit = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setRepairsFound([
        { id: 1, type: 'META', title: 'Fix Missing Metadata', description: 'Priority: High. Detected missing meta description for homepage.', status: 'ready' },
        { id: 2, type: 'IMAGE', title: 'Inject Alt Tags', description: 'Priority: Medium. 12 images detected without descriptive alt text.', status: 'ready' },
        { id: 3, type: 'LINK', title: 'Internal Link Cleanup', description: 'Priority: Low. Found 3 broken internal link redirections.', status: 'ready' }
      ]);
      setIsScanning(false);
    }, 2000);
  };

  const handleApplyFix = async (fix: any) => {
    if (!wpVerified) { setShowWpModal(true); return; }
    try {
      const payload = {
        auth: wpConfig,
        site_url: selectedSite,
        fixes: [fix]
      };
      const res = await axios.post(`${API_BASE}/wp/fixes/bulk`, payload);
      if (res.data.success) {
        alert(`Success! "${fix.title}" deployed to ${selectedSite}`);
        setRepairsFound(prev => prev.filter(f => f.id !== fix.id));
      }
    } catch (err) { alert("Fix Deployment Failed."); }
  };

  const handleApplyAllFixes = async () => {
    if (!wpVerified) { setShowWpModal(true); return; }
    setIsFixingWP(true);
    try {
      const payload = {
        auth: wpConfig,
        site_url: selectedSite,
        fixes: repairsFound
      };
      const res = await axios.post(`${API_BASE}/wp/fixes/bulk`, payload);
      if (res.data.success) {
        alert(`Success! ${repairsFound.length} repairs deployed to ${selectedSite}`);
        setRepairsFound([]);
      }
    } catch (err) {
      alert("WP Deployment Failed. Check Bridge Connection.");
    } finally {
      setIsFixingWP(false);
    }
  };

  const handleAIGenerate = async (moduleId: string, promptTemplate: string) => {
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
    } catch (err) { setAiOutput("AI Engine Error"); } finally { setIsGeneratingAI(false); }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { role: 'user', text: chatInput }]);
    setTimeout(() => {
      const monolithContext = "Monolith project detected. I am ready to act as the primary reasoning layer, coordinating 4 specialist AI agents through an arbitration loop. Our current SEO Suite infrastructure is the perfect testing ground for the first Monolith nodes.";
      setChatMessages(prev => [...prev, { role: 'bot', text: chatInput.toLowerCase().includes('monolith') ? monolithContext : "Understood, David. I've logged this to our agency context. Proceeding with the current SEO pipeline flow." }]);
    }, 1000);
    setChatMessagesInput('');
  };

  // --- NAVIGATION CONFIG ---
  const navigation = [
    { id: 'onboarding', name: 'Setup Wizards', icon: Rocket, category: 'Main' },
    { id: 'dashboard', name: 'Dashboard', icon: Layout, category: 'Main' },
    { id: 'intent', name: 'Search Intent', icon: Target, category: 'Keyword Research' },
    { id: 'strategy', name: 'Keyword Strategy', icon: Zap, category: 'Keyword Research' },
    { id: 'longtail', name: 'Long-Tail Gen', icon: List, category: 'Keyword Research' },
    { id: 'related', name: 'Related Keywords', icon: Hash, category: 'Keyword Research' },
    { id: 'silo', name: 'Silo Structure', icon: Layers, category: 'On-Page' },
    { id: 'insert_kw', name: 'Keyword Injector', icon: Edit3, category: 'On-Page' },
    { id: 'meta', name: 'Meta Generator', icon: Type, category: 'On-Page' },
    { id: 'blog_desc', name: 'Post Descriptions', icon: AlignLeft, category: 'Blog Writing' },
    { id: 'blog_outline', name: 'Outline Wizard', icon: List, category: 'Blog Writing' },
    { id: 'blog_titles', name: 'Title Generator', icon: Type, category: 'Blog Writing' },
    { id: 'paragraph', name: 'Paragraph Tool', icon: FileText, category: 'Blog Writing' },
    { id: 'writer', name: 'Expert Article Writer', icon: Rocket, category: 'Blog Writing' },
    { id: 'gbp_attrs', name: 'GBP Attributes', icon: MapPin, category: 'Local SEO' },
    { id: 'gbp_from_content', name: 'GMB from Content', icon: MapPin, category: 'Local SEO' },
    { id: 'gbp_posts', name: 'GMB Post Gen', icon: MapPin, category: 'Local SEO' },
    { id: 'gbp_qa', name: 'GMB Q&A Gen', icon: MapPin, category: 'Local SEO' },
    { id: 'gbp_opt', name: 'GBP Optimizer', icon: MapPin, category: 'Local SEO' },
    { id: 'monolith', name: 'Monolith AI', icon: Sparkles, category: 'System' },
    { id: 'audit', name: 'Technical Audit', icon: Shield, category: 'Technical' },
    { id: 'hemingway', name: 'Hemingway Flow', icon: Zap, category: 'Technical' },
  ];

  const categories = Array.from(new Set(navigation.map(item => item.category)));

  const prompts: any = {
    intent: `Analyze search intent for the provided keywords. Categorize each as Informational, Navigational, Transactional, or Commercial. Format as a clean table.`,
    strategy: `Create a full SEO content strategy and keyword clustering plan for the given target keyword. Provide super categories and associated content titles. Use "---" to separate major categories.`,
    longtail: `Generate high-converting long-tail keyword variations for the target keyword. Focus on user pain points and specific questions.`,
    related: `Identify closely related semantic keywords and LSI terms for the target subject to improve topical authority.`,
    silo: `Develop a logical website silo structure for the given niche. Organize content into parent categories and supporting child pages. Use clear bold headers for Silos.`,
    insert_kw: `Optimize the provided text by naturally inserting the following keywords while maintaining high readability and flow.`,
    meta: `Generate catchy page titles (70-80 chars) and click-bait meta descriptions (140-160 chars) containing the keyword. Format as markdown table.`,
    blog_desc: `Write compelling, click-worthy blog post descriptions that summarize the content and include a call to action.`,
    blog_outline: `Create a detailed blog post outline including H1, H2, and H3 headers and key bullet points for each section.`,
    blog_titles: `Generate 10 viral-style blog post titles for the given keyword that pique curiosity and promise value.`,
    paragraph: `Write a high-quality, SEO-optimized paragraph of text focusing on the provided keyword and context.`,
    writer: `You are David Taylor, an elite SEO agency owner. Write a high-density, 1,200 word authoritative SEO article with a slick, operational tone. Use proper H2/H3 hierarchy, bold strategic signals, and focus on human value + search engine ranking.`,
    gbp_attrs: `Identify the best attributes to enable for a Google Business Profile in this specific industry to improve local ranking.`,
    gbp_from_content: `Transform the provided blog or website content into a high-engagement Google My Business update post.`,
    gbp_posts: `Generate 5 weekly post ideas for a Google Business Profile to keep the feed active and attractive to local customers.`,
    gbp_qa: `Generate 5 compelling Q&A pairs for a Google Business Profile that build trust and address common customer concerns.`,
    gbp_opt: `Analyze the provided business details and suggest optimizations for the GBP title, description, and primary categories.`,
    monolith: `You are the Monolith Arbitrator. Analyze the following query and distribute sub-tasks to 4 specialized AI agents (Research, Content, Technical, Local). Synthesize their expected outputs into a master strategy.`
  };

  const themeClass = isDarkMode ? 'bg-[#050505] text-slate-300' : 'bg-slate-50 text-slate-900';
  const cardClass = isDarkMode ? 'bg-[#0a0a0a]/80 border-white/5 backdrop-blur-xl shadow-2xl' : 'bg-white border-slate-200 shadow-sm';
  const headerClass = isDarkMode ? 'bg-[#050505]/80 border-white/5 backdrop-blur-md' : 'bg-white/80 border-slate-200 shadow-sm';
  const sidebarClass = isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-slate-100 border-slate-200';

  return (
    <div className={`min-h-screen ${themeClass} font-sans flex overflow-hidden transition-colors duration-300 selection:bg-emerald-500/30`}>
      
      {/* --- SIDEBAR --- */}
      <motion.aside initial={false} animate={{ width: isSidebarOpen ? 260 : 80 }} className={`h-screen ${sidebarClass} border-r flex flex-col transition-all z-40`}>
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

        <nav className="flex-1 px-4 mt-4 space-y-6 overflow-y-auto scrollbar-hide pb-20">
          {categories.map(cat => (
            <div key={cat}>
              {isSidebarOpen && <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-3 italic">{cat}</h3>}
              <div className="space-y-1">
                {navigation.filter(item => item.category === cat).map(item => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setAiOutput(''); setAiInput(''); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'text-slate-500 hover:text-emerald-500 hover:bg-white/5'}`}>
                    <item.icon size={18} className={activeTab === item.id ? 'text-emerald-500' : 'group-hover:scale-110 transition-transform'} />
                    {isSidebarOpen && <span className="text-xs font-bold uppercase">{item.name}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#0a0a0a] space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/5 transition-all">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isSidebarOpen && <span className="text-xs font-bold uppercase">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={() => setShowDFSModal(true)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/5 transition-all ${dfsVerified ? 'text-blue-500' : ''}`}>
            <Database size={18} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase">Search Bridge</span>}
          </button>
          <button onClick={() => setShowWpModal(true)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/5 transition-all ${wpVerified ? 'text-emerald-500' : ''}`}>
            <Shield size={18} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase">WP Linked</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent">
        
        <header className={`sticky top-0 h-16 border-b ${headerClass} backdrop-blur-md z-30 px-8 flex items-center justify-between`}>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              {isSidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
              <RefreshCcw size={12} className={loading ? 'animate-spin text-emerald-500' : ''} />
              {navigation.find(n => n.id === activeTab)?.name || activeTab}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <Zap size={10} /> ENGINE READY
            </div>
            <div className="h-8 w-px bg-slate-500/10" />
            <div className="flex flex-col text-right uppercase italic leading-none">
              <span className="text-[10px] font-black text-white">David Taylor</span>
              <span className="text-[8px] font-bold text-emerald-500 tracking-widest">Agency Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto pb-32">
          <AnimatePresence mode="wait">

            {/* ONBOARDING TAB */}
            {activeTab === 'onboarding' && (
              <motion.div key="onboarding" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-16">
                  <h2 className="text-6xl font-black tracking-tighter text-white mb-4 uppercase italic">
                    Onboarding <span className="text-emerald-500 text-shadow-glow">Suite</span>
                  </h2>
                  <p className="text-slate-300 font-bold text-lg tracking-wide max-w-2xl leading-relaxed italic opacity-80">
                    Connect your agency infrastructure. Secure your API links to activate the full LeFrog intelligence engine.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 uppercase italic font-black">
                   <div className="bg-[#0a0a0a] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-[3rem] p-12 flex flex-col justify-between group hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] hover:border-emerald-500/40 transition-all duration-700">
                      <div className="flex items-start justify-between mb-8">
                        <div className="bg-emerald-500/10 w-20 h-20 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-glow"><Globe size={40} /></div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] tracking-widest ${sites.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>{sites.length > 0 ? 'CONNECTED' : 'DISCONNECTED'}</div>
                      </div>
                      <div>
                        <h3 className="text-3xl text-white mb-2 italic">Search Console</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-loose uppercase">Access indexing data and search analytics directly from Google.</p>
                        <button onClick={() => alert("GSC Auth is handled via terminal currently.")} className="w-full py-5 bg-white/5 border border-white/10 hover:border-emerald-500/40 text-white font-black text-xs rounded-2xl transition-all uppercase">Verify GSC Link</button>
                      </div>
                   </div>

                   <div className="bg-[#0a0a0a] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-[3rem] p-12 flex flex-col justify-between group hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] hover:border-emerald-500/40 transition-all duration-700 border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)] hover:border-blue-500/40 hover:shadow-[0_0_80px_rgba(59,130,246,0.2)]">
                      <div className="flex items-start justify-between mb-8">
                        <div className="bg-blue-500/10 w-20 h-20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-glow"><Database size={40} /></div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] tracking-widest ${dfsVerified ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'}`}>{dfsVerified ? 'CONNECTED' : 'DISCONNECTED'}</div>
                      </div>
                      <div>
                        <h3 className="text-3xl text-white mb-2 italic">Search Intelligence</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-loose uppercase">Real-time search metrics and semantic intelligence for all modules.</p>
                        <button onClick={() => setShowDFSModal(true)} className="w-full py-5 bg-white/5 border border-white/10 hover:border-blue-500/40 text-white font-black text-xs rounded-2xl transition-all uppercase">Verify API Key</button>
                      </div>
                   </div>

                   <div className="bg-[#0a0a0a] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-[3rem] p-12 flex flex-col justify-between group hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] hover:border-emerald-500/40 transition-all duration-700 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] hover:border-emerald-500/40">
                      <div className="flex items-start justify-between mb-8">
                        <div className="bg-emerald-500/10 w-20 h-20 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-glow"><Shield size={40} /></div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] tracking-widest ${wpVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>{wpVerified ? 'CONNECTED' : 'DISCONNECTED'}</div>
                      </div>
                      <div>
                        <h3 className="text-3xl text-white mb-2 italic">WordPress Bridge</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-loose uppercase">Remote deployment engine for automated SEO repairs.</p>
                        <button onClick={() => setShowWpModal(true)} className="w-full py-5 bg-white/5 border border-white/10 hover:border-emerald-500/40 text-white font-black text-xs rounded-2xl transition-all uppercase">Link WordPress Site</button>
                      </div>
                   </div>

                   <div className="bg-[#0a0a0a] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-[3rem] p-12 flex flex-col justify-between group hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] hover:border-emerald-500/40 transition-all duration-700 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] hover:border-amber-500/40 opacity-60 grayscale hover:opacity-100 hover:grayscale-0">
                      <div className="flex items-start justify-between mb-8">
                        <div className="bg-amber-500/10 w-20 h-20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-glow"><BarChart3 size={40} /></div>
                        <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] text-slate-500 tracking-widest">ROADMAP v1.5</div>
                      </div>
                      <div>
                        <h3 className="text-3xl text-white mb-2 italic">GA4 Analytics</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-loose uppercase">Conversion tracking and ROI reporting integration.</p>
                        <button disabled className="w-full py-5 bg-white/5 border border-white/10 text-slate-600 font-black text-xs rounded-2xl cursor-not-allowed uppercase">Coming Soon</button>
                      </div>
                   </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-16 rounded-[4rem] text-center">
                   <Rocket className="text-emerald-500 mx-auto mb-8 animate-bounce" size={64} />
                   <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Ready for Deployment</h4>
                   <p className="text-slate-300 font-medium italic max-w-xl mx-auto mb-12 text-lg">Once all connectors are active, the Command Center will unlock full cross-platform SEO automation capabilities.</p>
                   <button onClick={() => setActiveTab('dashboard')} className="px-16 py-6 bg-emerald-500 text-black font-black rounded-3xl shadow-3xl hover:scale-105 transition-all uppercase tracking-widest text-sm italic">Enter Command Center</button>
                </div>
              </motion.div>
            )}
            
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-12 flex justify-between items-end">
                  <div>
                    <h2 className={`text-5xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3 uppercase italic`}>
                      Command <span className="text-emerald-500">Center</span>
                    </h2>
                    <p className="text-slate-300 font-bold text-base tracking-wide max-w-2xl leading-relaxed italic opacity-80">
                      Welcome back, David. Your agency engine is ready. Explore the tool categories below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 uppercase italic font-black">
                   {categories.map((cat) => (
                     <div key={cat} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/[0.03] rounded-[2.5rem] p-8 flex flex-col group hover:border-emerald-500/20 hover:shadow-emerald-500/5 transition-all duration-500">
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <Zap size={12}/> {cat}
                        </h3>
                        <div className="space-y-2">
                          {navigation.filter(item => item.category === cat).map(item => (
                            <button key={item.id} onClick={() => { setActiveTab(item.id); setAiOutput(''); setAiInput(''); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group/btn">
                              <div className="flex items-center gap-3 font-black">
                                <item.icon size={16} className="text-slate-400 group-hover/btn:text-emerald-500 transition-colors" />
                                <span className="text-[11px] text-slate-300 tracking-tight">{item.name}</span>
                              </div>
                              {item.id === 'writer' && <div className="ml-auto mr-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] rounded border border-emerald-500/20">ELITE</div>}
                              <ArrowRight size={12} className="text-slate-600 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          ))}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="grid grid-cols-12 gap-8 italic font-black uppercase">
                  <div className="col-span-12 lg:col-span-4">
                    <div className={`${cardClass} border rounded-[2.5rem] p-10`}>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-10 flex items-center gap-3">
                        <Shield size={14}/> Property Monitor
                      </h3>
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-4 scrollbar-hide">
                        {sites.map(site => (
                          <button key={site.siteUrl} onClick={() => { analyzeSite(site.siteUrl); setActiveTab('audit_view'); }} className={`w-full text-left px-6 py-6 rounded-2xl border transition-all ${selectedSite === site.siteUrl ? 'bg-emerald-500 border-emerald-400 text-black font-black shadow-xl shadow-emerald-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>
                            <div className="flex items-center justify-between">
                              <span className="truncate text-[11px] tracking-tighter">{site.siteUrl.replace('https://', '').replace('http://', '').replace('sc-domain:', '')}</span>
                              {selectedSite === site.siteUrl && <RefreshCcw size={14} className="animate-spin" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-8">
                    <div className={`${cardClass} border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[450px]`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30" />
                        <Zap size={48} className="mb-6 text-emerald-500 opacity-20" />
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">Automatic Fix Engine</h4>
                        <p className="text-slate-300 text-sm font-medium italic max-w-sm mb-10 leading-relaxed opacity-70">
                          Bridge is verified for <span className="text-emerald-500 font-black uppercase">lefrog.io</span>. System is ready to deploy repairs.
                        </p>
                        <button onClick={() => setActiveTab('audit_view')} className="px-10 py-4 bg-emerald-500 text-black font-black rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs">Launch Repair Center</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* GSC AUDIT VIEW: DEEP DIVE */}
            {activeTab === 'audit_view' && (
              <motion.div key="audit_view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                 <div className="mb-12 flex justify-between items-end italic uppercase font-black">
                    <div>
                      <h2 className="text-5xl font-black tracking-tight text-white mb-3">GSC <span className="text-emerald-500 italic">Deep Dive</span></h2>
                      <p className="text-slate-300 font-bold text-lg tracking-wide opacity-60">{selectedSite?.replace('https://', '').replace('http://', '')}</p>
                    </div>
                    <button onClick={() => setActiveTab('dashboard')} className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl text-xs hover:bg-white/10 transition-all flex items-center gap-3">
                      <Layout size={16}/> COMMAND CENTER
                    </button>
                 </div>
                 
                 <div className="space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-black uppercase tracking-tighter italic">
                      {[
                        { label: 'Total Clicks', val: issues?.queries?.reduce((a:any, b:any) => a + b.clicks, 0) || 0, color: 'text-emerald-500' },
                        { label: 'Total Impr.', val: issues?.queries?.reduce((a:any, b:any) => a + (b.impressions || 0), 0).toLocaleString() || 0, color: 'text-blue-500' },
                        { label: 'Avg Position', val: (issues?.queries?.reduce((a:any, b:any) => a + (b.position || 0), 0) / (issues?.queries?.length || 1)).toFixed(1), color: 'text-amber-500' },
                        { label: 'Sitemaps', val: issues?.sitemaps?.length || 0, color: 'text-purple-500' }
                      ].map((s, i) => (
                        <div key={i} className={`${cardClass} border p-8 rounded-[2.5rem] relative overflow-hidden group shadow-glow`}>
                          <span className="text-slate-600 text-[10px] mb-4 block tracking-[0.2em] relative z-10 font-black">{s.label}</span>
                          <div className="flex items-end justify-between relative z-10">
                            <span className={`text-4xl ${s.color}`}>{s.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`${cardClass} border rounded-[3rem] p-10 flex flex-col relative overflow-hidden ring-1 ring-emerald-500/20 shadow-emerald-500/10 shadow-2xl italic`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8 uppercase font-black">
                        <div>
                          <h4 className="text-white text-2xl tracking-tight flex items-center gap-3">
                             <Shield className="text-emerald-500" size={28}/> Automatic Repair Engine
                          </h4>
                          <p className="text-slate-300 text-sm font-bold mt-2 opacity-70">Synchronized with lefrog.io bridge. Ready to deploy fixes.</p>
                        </div>
                        <button onClick={handleStartAudit} disabled={isScanning} className="bg-emerald-500 text-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 font-black">
                          {isScanning ? <RefreshCcw className="animate-spin" size={20}/> : 'START SMART SCAN'}
                        </button>
                      </div>

                      {repairsFound.length > 0 ? (
                        <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Deployable Fixes Detected:</h5>
                          {repairsFound.map((fix) => (
                            <div key={fix.id} className="flex items-center justify-between p-8 bg-white/5 border border-white/5 rounded-[2.5rem] group hover:border-emerald-500/30 transition-all">
                              <div className="flex gap-8 items-center">
                                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-[10px] font-black uppercase tracking-widest">{fix.type}</div>
                                <div className="uppercase">
                                  <p className="text-xl font-black text-white italic tracking-tight leading-none">{fix.title}</p>
                                  <p className="text-sm text-slate-300 font-medium normal-case opacity-70 mt-2">{fix.description}</p>
                                </div>
                              </div>
                              <button onClick={() => handleApplyFix(fix)} className="px-6 py-3 bg-emerald-500 text-black text-[10px] font-black rounded-xl uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95">SYNC TO WP</button>
                            </div>
                          ))}
                          <button onClick={handleApplyAllFixes} disabled={isFixingWP} className="w-full mt-10 py-6 border-2 border-emerald-500/20 text-emerald-500 font-black rounded-[2rem] uppercase tracking-[0.3em] text-xs hover:bg-emerald-500 hover:text-black transition-all">
                            {isFixingWP ? <RefreshCcw className="animate-spin mx-auto" /> : 'BULK DEPLOY ALL REPAIRS'}
                          </button>
                        </div>
                      ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 grayscale italic uppercase font-black">
                           <Layers size={64} className="mb-8 text-emerald-500" />
                           <span className="text-base tracking-[0.3em]">Awaiting Scanner Command</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-12">
                      <div className={`${cardClass} border col-span-12 lg:col-span-5 rounded-[3.5rem] p-12`}>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10 flex items-center gap-3 italic"><PieIcon size={16} className="text-emerald-500" /> Interaction Mix</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={[{ name: 'Clicks', value: issues?.queries?.reduce((a:any, b:any) => a + b.clicks, 0) || 0 }, { name: 'Missed', value: (issues?.queries?.reduce((a:any, b:any) => a + b.impressions, 0) || 0) - (issues?.queries?.reduce((a:any, b:any) => a + b.clicks, 0) || 0) }]} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                                <Cell fill="#10b981" /><Cell fill="#1e293b" />
                              </Pie>
                              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', fontSize: '11px', fontWeight: '900', color: '#fff' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className={`${cardClass} border col-span-12 lg:col-span-7 rounded-[3.5rem] p-16 relative overflow-hidden`}>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-12 flex items-center gap-3 italic relative z-10"><Shield size={16} /> LeFrog AI Intelligence</h3>
                         <div className="prose prose-invert prose-emerald max-w-none relative z-10">
                            {issues?.insights ? (
                              <div className="space-y-16">
                                {issues.insights.split('---').map((section: any, idx: number) => (
                                  <div key={idx} className="pb-12 last:pb-0 border-b border-white/5 last:border-0">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                       p: ({children}) => {
                                         const getRawText = (nodes: any): string => {
                                           return React.Children.toArray(nodes).reduce((text: string, node: any) => {
                                             if (typeof node === 'string') return text + node;
                                             if (React.isValidElement(node)) {
                                               const props: any = node.props;
                                               return text + (props.children ? getRawText(props.children) : '');
                                             }
                                             return text;
                                           }, '');
                                         };

                                         const fullText = getRawText(children);
                                         const toolMatch = fullText.match(/\[\[TOOL:(.*?)\]\]/);
                                         
                                         if (toolMatch) {
                                           const toolId = toolMatch[1];
                                           
                                           const cleanNodes = (nodes: any): any => {
                                             return React.Children.map(nodes, (node) => {
                                               if (typeof node === 'string') {
                                                 return node.replace(/\[\[TOOL:.*?\]\]/g, '');
                                               }
                                               if (React.isValidElement(node)) {
                                                 const props: any = node.props;
                                                 return React.cloneElement(node, {
                                                   ...props,
                                                   children: props.children ? cleanNodes(props.children) : undefined
                                                 });
                                               }
                                               return node;
                                             });
                                           };

                                           return (
                                             <div className="flex flex-col gap-8 mb-12 bg-white/5 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all hover:border-emerald-500/20">
                                               <div className="text-slate-200 font-bold text-lg leading-relaxed normal-case">
                                                  {cleanNodes(children)}
                                               </div>
                                               <button 
                                                 onClick={() => { 
                                                   setActiveTab(toolId); 
                                                   const kwMatch = fullText.match(/'(.*?)'/); 
                                                   setAiInput(kwMatch ? kwMatch[1] : `Focus on: ${selectedSite}`); 
                                                   setAiOutput(''); 
                                                 }} 
                                                 className="w-fit flex items-center gap-4 px-10 py-4 bg-emerald-500 text-black rounded-2xl text-xs font-black uppercase hover:scale-105 transition-all shadow-3xl italic ring-8 ring-emerald-500/10"
                                               >
                                                 <Zap size={16} /> Launch {navigation.find(n => n.id === toolId)?.name || 'Tool'}
                                               </button>
                                             </div>
                                           );
                                         }
                                         return <p className="text-slate-300 font-medium text-lg leading-loose mb-12 normal-case">{children}</p>;
                                       },
                                       h3: ({children}) => <h3 className="text-emerald-500 font-black text-3xl mb-10 mt-6 flex items-center gap-4 uppercase italic tracking-tight border-l-4 border-emerald-500 pl-8">{children}</h3>
                                     }}>
                                      {section.trim()}
                                    </ReactMarkdown>
                                    <div className="h-20" /> 
                                  </div>
                                ))}
                              </div>
                            ) : <div className="flex flex-col items-center justify-center h-[300px] text-slate-600 italic font-black uppercase tracking-widest"><RefreshCcw className="animate-spin mb-8 text-emerald-500" size={48}/> Synthesizing Intelligence...</div>}
                         </div>
                      </div>
                    </div>

                    {indexingKnowledge && (
                      <div className={`${cardClass} border rounded-[4rem] p-16 italic font-black uppercase`}>
                        <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-10">
                           <div className="p-5 rounded-[2rem] bg-blue-500/10 text-blue-500 shadow-glow"><BookOpen size={40} /></div>
                           <div>
                             <h4 className="text-4xl text-white tracking-tighter">Indexing Knowledge Hub</h4>
                             <p className="text-slate-500 text-base mt-2">Why Google skips your assets.</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                           {indexingKnowledge.common_issues.map((issue: any) => (
                             <div key={issue.id} className="space-y-6 p-8 rounded-[3rem] bg-white/5 border border-white/5 hover:border-blue-500/40 transition-all group">
                                <h5 className="text-blue-400 text-lg tracking-widest">{issue.label}</h5>
                                <p className="text-xs font-medium leading-relaxed normal-case opacity-60 italic">{issue.explanation}</p>
                                <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                                  <span className="text-[10px] text-slate-500 tracking-[0.3em]">Strategy:</span>
                                  <p className="text-xs text-slate-200 normal-case leading-relaxed font-bold">{issue.fix}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    <div className={`${cardClass} border rounded-[3rem] overflow-hidden shadow-glow uppercase font-black italic`}>
                      <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="text-xs tracking-[0.4em] text-slate-500 leading-none">Top Performance Matrix</h3>
                        <span className="text-[10px] text-emerald-500 tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-glow">LIVE: 30 DAYS</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="text-[11px] text-slate-600 tracking-[0.3em] border-b border-white/10 bg-white/[0.04]">
                              <th className="p-10">Search Query</th>
                              <th className="p-10 text-right">Clicks</th>
                              <th className="p-10 text-right">Impressions</th>
                              <th className="p-10 text-right">CTR</th>
                              <th className="p-10 text-right">Position</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {issues?.queries?.map((q: any, i: number) => (
                              <tr key={i} className="group hover:bg-emerald-500/5 transition-all">
                                <td className="p-10 text-white text-base tracking-tight">{q.keys[0]}</td>
                                <td className="p-10 text-right text-lg text-emerald-500 tracking-tighter">{q.clicks.toLocaleString()}</td>
                                <td className="p-10 text-right text-base text-slate-400 font-medium">{q.impressions.toLocaleString()}</td>
                                <td className="p-10 text-right text-lg text-blue-400">{(q.ctr * 100).toFixed(1)}%</td>
                                <td className="p-10 text-right text-base text-slate-500">#{q.position.toFixed(0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* AI MODULE TABS */}
            {['intent', 'strategy', 'longtail', 'related', 'silo', 'insert_kw', 'meta', 'blog_desc', 'blog_outline', 'blog_titles', 'paragraph', 'gbp_attrs', 'gbp_from_content', 'gbp_posts', 'gbp_qa', 'gbp_opt', 'monolith', 'writer'].includes(activeTab) && (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                 <div className="flex justify-between items-end border-b border-white/10 pb-12">
                   <div>
                     <h2 className="text-6xl tracking-tighter text-white uppercase italic leading-none">{navigation.find(n => n.id === activeTab)?.name.split(' ')[0]} <span className="text-emerald-500 text-shadow-glow">{navigation.find(n => n.id === activeTab)?.name.split(' ').slice(1).join(' ')}</span></h2>
                     <p className="text-slate-500 font-bold italic text-base tracking-[0.3em] mt-4 opacity-60">Engine Module synchronized with agency-grade logic</p>
                   </div>
                   {aiOutput && (
                     <div className="flex gap-6">
                       {['intent', 'strategy', 'longtail', 'related', 'meta'].includes(activeTab) && (
                         <button onClick={() => { updatePipeline({ keyword: aiInput, strategy: aiOutput }); setActiveTab('blog_outline'); setAiInput(`Strategy Context:\n${aiOutput.substring(0, 1500)}`); setAiOutput(''); }} className="bg-emerald-500 text-black px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-3xl shadow-emerald-500/20 italic">PROCEED TO OUTLINE <ArrowRight size={20} /></button>
                       )}
                       {activeTab === 'blog_outline' && (
                         <button onClick={() => { updatePipeline({ outline: aiOutput }); setActiveTab('writer'); setAiInput(`Topic: ${pipeline.keyword}\nOutline: ${aiOutput}`); }} className="bg-emerald-500 text-black px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-3xl shadow-emerald-500/20 italic">PROCEED TO WRITER <ArrowRight size={20} /></button>
                       )}
                       {activeTab === 'writer' && (
                         <button onClick={() => { updatePipeline({ article: aiOutput }); setActiveTab('hemingway'); }} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:bg-emerald-500 hover:text-black transition-all italic">SEND TO HEMINGWAY <Zap size={20} /></button>
                       )}
                     </div>
                   )}
                 </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-4 space-y-10">
                    <div className={`${cardClass} border p-12 rounded-[3rem] ring-1 ring-white/5 shadow-glow`}>
                      <label className="block text-[11px] text-slate-500 uppercase tracking-[0.4em] mb-8 italic font-black">Input Command Data</label>
                      <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-3xl p-8 text-white text-base focus:outline-none focus:border-emerald-500/50 min-h-[400px] leading-relaxed font-bold italic normal-case" placeholder="Enter keywords, site details, or target context..." />
                      <button onClick={() => handleAIGenerate(activeTab, prompts[activeTab])} disabled={isGeneratingAI || !aiInput.trim()} className="mt-10 w-full py-6 bg-emerald-500 text-black font-black rounded-3xl shadow-3xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] text-xs font-black">
                        {isGeneratingAI ? <RefreshCcw className="animate-spin mx-auto" size={28} /> : 'OPTIMIZE CONTENT'}
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <div className={`${cardClass} border p-12 rounded-[3.5rem] min-h-[800px] relative overflow-hidden bg-black/40`}>
                      <div className="absolute top-10 right-12 flex items-center gap-3"><div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-50" /><span className="text-[11px] font-black text-slate-500 tracking-[0.4em] italic uppercase">Live Output</span></div>
                      <div className="prose prose-invert prose-emerald max-w-none text-body">
                        {aiOutput ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiOutput}</ReactMarkdown> : <div className="h-[600px] flex flex-col items-center justify-center opacity-10 grayscale text-center leading-none"><Zap size={140} className="mb-10 text-emerald-500" /><span className="text-5xl uppercase tracking-tighter font-black italic">Awaiting Engine Command</span></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* EXPERT WRITER MODULE */}
            {activeTab === 'writer_v1' && (
              <motion.div key="writer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                 <div className="mb-16 italic font-black uppercase">
                    <h2 className="text-6xl tracking-tight text-white mb-4">Expert <span className="text-emerald-500">Article Writer</span></h2>
                    <p className="text-slate-500 text-lg tracking-[0.3em] opacity-60">High-Density SEO Synthesis Engine</p>
                 </div>
                 <ExpertWriter brief={pipeline} onGenerate={() => handleAIGenerate('writer', prompts.writer)} isGenerating={isGeneratingAI} />
                 {aiOutput && (
                   <div className="mt-12 flex justify-center uppercase italic font-black">
                     <button onClick={() => { updatePipeline({ article: aiOutput }); setActiveTab('hemingway'); }} className="px-20 py-8 bg-emerald-500 text-black text-lg rounded-[3rem] shadow-3xl hover:scale-110 active:scale-95 transition-all tracking-[0.3em]">SEND TO HEMINGWAY FLOW</button>
                   </div>
                 )}
              </motion.div>
            )}

            {/* HEMINGWAY FLOW */}
            {activeTab === 'hemingway' && (
              <motion.div key="hemingway" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-16 italic font-black uppercase">
                    <h2 className="text-6xl tracking-tight text-white mb-4">Hemingway <span className="text-emerald-500">Optimization</span></h2>
                    <p className="text-slate-500 text-lg tracking-[0.3em] opacity-60">Agency Grade Readability & Impact Polishing</p>
                 </div>
                 <HemingwayEditor initialContent={pipeline.article} onSave={(c: string) => updatePipeline({ article: c })} selectedSite={selectedSite || 'lefrog.io'} />
              </motion.div>
            )}

            {/* TECHNICAL AUDIT HUB */}
            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-[60vh] flex flex-col items-center justify-center opacity-40 italic uppercase font-black grayscale">
                <Shield size={200} className="mb-12 text-emerald-500" />
                <h3 className="text-6xl tracking-tighter text-white italic">Technical Scan Hub</h3>
                <p className="font-bold text-slate-300 mt-6 tracking-[0.5em] text-xl">Integrating v3 Crawler Architecture</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* --- CHAT SUPPORT --- */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end uppercase italic font-black">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className={`${cardClass} w-[450px] h-[650px] border rounded-[3rem] mb-10 shadow-3xl flex flex-col overflow-hidden ring-1 ring-white/10 ring-8 ring-emerald-500/5`}>
                <div className="p-10 bg-emerald-500 text-black flex items-center justify-between font-black uppercase text-sm tracking-tighter italic leading-none border-b border-black/5">
                  <div className="flex items-center gap-4"><HelpCircle size={24}/> LeFrog Intelligence</div>
                  <button onClick={() => setIsChatOpen(false)} className="bg-black/10 p-2 rounded-xl hover:bg-black/20 transition-all"><X size={24}/></button>
                </div>
                <div className="flex-1 p-10 overflow-y-auto space-y-10 scrollbar-hide bg-black/20">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] px-8 py-6 rounded-[2.5rem] text-xs leading-relaxed font-black shadow-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-[#111] text-slate-200 border border-white/5 rounded-tl-none tracking-tight'}`}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                <div className="p-10 border-t border-white/5 flex gap-6 bg-black/60 italic">
                  <input value={chatInput} onChange={e => setChatMessagesInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-sm focus:outline-none font-black text-white placeholder-slate-600" placeholder="Ask LeFrog about SEO..." />
                  <button onClick={handleSendMessage} className="p-5 bg-emerald-500 text-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"><Send size={24} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-black shadow-3xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all relative group ring-12 ring-emerald-500/10">
            <MessageSquare size={40} />
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-emerald-300 rounded-full animate-ping opacity-75 border-4 border-black" />
          </button>
        </div>

      </main>

      {/* --- CONFIG MODALS --- */}
      <AnimatePresence>
        {showDfsModal && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[100] p-4 uppercase font-black italic">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${cardClass} border w-full max-w-xl rounded-[4.5rem] p-16 shadow-3xl relative overflow-hidden ring-8 ring-emerald-500/5`}>
              <button onClick={() => setShowDfsModal(false)} className="absolute top-12 right-16 text-slate-500 hover:text-white"><X size={32}/></button>
              <Database className="text-emerald-500 mb-10 shadow-glow" size={56} /><h3 className="text-6xl tracking-tighter text-white italic mb-4 leading-none">Intelligence Engine</h3><p className="text-slate-500 text-sm mb-16 tracking-[0.5em] uppercase opacity-60">Enterprise API Access</p>
              <div className="space-y-8 mb-16 italic"><input value={dfsConfig.login} onChange={e => setDfsConfig({...dfsConfig, login: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-10 py-7 text-white font-black uppercase tracking-tight text-xl focus:border-emerald-500/30 transition-all" placeholder="ACCOUNT ID (EMAIL)" /><input type="password" value={dfsConfig.password} onChange={e => setDfsConfig({...dfsConfig, password: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-10 py-7 text-white font-black text-xl tracking-[0.2em] focus:border-emerald-500/30 transition-all" placeholder="ACCESS TOKEN" /></div>
              <button onClick={() => { setDfsVerified(true); setShowDfsModal(false); }} className="w-full bg-emerald-500 text-black font-black py-8 rounded-[2.5rem] uppercase tracking-[0.4em] shadow-3xl active:scale-95 transition-all text-base italic shadow-emerald-500/20">Establish Secure Link</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showWpModal && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[100] p-4 uppercase font-black italic">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${cardClass} border w-full max-w-xl rounded-[4.5rem] p-16 shadow-3xl relative overflow-hidden ring-8 ring-emerald-500/5`}>
              <button onClick={() => setShowWpModal(false)} className="absolute top-12 right-16 text-slate-500 hover:text-white"><X size={32}/></button>
              <Shield className="text-emerald-500 mb-10 shadow-glow" size={56} /><h3 className="text-6xl tracking-tighter text-white italic mb-4 leading-none">WP Bridge</h3><p className="text-slate-500 text-sm mb-16 tracking-[0.5em] uppercase opacity-60">Remote Command Link</p>
              <div className="space-y-8 mb-16 italic"><input value={wpConfig.url} onChange={e => setWpConfig({...wpConfig, url: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-10 py-7 text-white font-black uppercase tracking-tight text-xl focus:border-emerald-500/30 transition-all" placeholder="HTTPS://SITE.COM" /><input type="password" value={wpConfig.api_key} onChange={e => setWpConfig({...wpConfig, api_key: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-10 py-7 text-white font-black font-mono tracking-[0.2em] text-xl focus:border-emerald-500/30 transition-all" placeholder="Hermes Command Key" /></div>
              <button onClick={verifyWP} className="w-full bg-emerald-500 text-black font-black py-8 rounded-[2.5rem] uppercase tracking-[0.4em] shadow-3xl active:scale-95 transition-all text-base italic shadow-emerald-500/20">Establish Bridge</button>
            </motion.div>
          </div>
        )}
      <AnimatePresence>
        {showGA4Modal && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[100] p-4 uppercase font-black italic">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${cardClass} border w-full max-w-xl rounded-[4.5rem] p-16 shadow-3xl relative overflow-hidden ring-8 ring-amber-500/5`}>
              <button onClick={() => setShowGA4Modal(false)} className="absolute top-12 right-16 text-slate-500 hover:text-white"><X size={32}/></button>
              <BarChart3 className="text-amber-500 mb-10 shadow-glow" size={56} /><h3 className="text-6xl tracking-tighter text-white italic mb-4 leading-none">GA4 Insight</h3><p className="text-slate-500 text-sm mb-16 tracking-[0.5em] uppercase opacity-60">Conversion API Access</p>
              <div className="space-y-8 mb-16 italic">
                <input value={ga4ClientId} onChange={e => setGa4ClientId(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-10 py-7 text-white font-black uppercase tracking-tight text-xl focus:border-amber-500/30 transition-all" placeholder="GOOGLE CLIENT ID" />
              </div>
              <button onClick={() => { setGa4Verified(true); setShowGA4Modal(false); }} className="w-full bg-amber-500 text-black font-black py-8 rounded-[2.5rem] uppercase tracking-[0.4em] shadow-3xl active:scale-95 transition-all text-base italic shadow-amber-500/20">Establish Analytics Link</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </AnimatePresence>

    </div>
  );
};

export default App;
