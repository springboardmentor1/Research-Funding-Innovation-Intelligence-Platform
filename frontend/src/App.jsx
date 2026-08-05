import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Award, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  User, 
  Search, 
  MessageSquare, 
  Send, 
  Sun, 
  Moon, 
  LogOut, 
  Globe, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  RefreshCw,
  Loader,
  Brain,
  Shield
} from 'lucide-react';

export default function App() {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register'
  
  // Auth input forms
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('RESEARCHER');

  // Page layout
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dashboard recommendations feed
  const [dashboardData, setDashboardData] = useState({
    recommended_grants: [],
    recommended_papers: [],
    recommended_patents: [],
    tech_highlights: [],
    ai_insight: ''
  });

  // Explore / Searches
  const [fundingExplore, setFundingExplore] = useState([]);
  const [fundingRecs, setFundingRecs] = useState([]);
  const [fundingQuery, setFundingQuery] = useState('');
  const [searchingFunding, setSearchingFunding] = useState(false);

  const [papersExplore, setPapersExplore] = useState([]);
  const [papersRecs, setPapersRecs] = useState([]);
  const [papersQuery, setPapersQuery] = useState('');
  const [searchingPapers, setSearchingPapers] = useState(false);

  const [patentsExplore, setPatentsExplore] = useState([]);
  const [patentsRecs, setPatentsRecs] = useState([]);
  const [patentsQuery, setPatentsQuery] = useState('');
  const [searchingPatents, setSearchingPatents] = useState(false);

  const [trendsData, setTrendsData] = useState(null);

  // Profile data forms
  const [profile, setProfile] = useState(null);
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [domainsInput, setDomainsInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [techAreasInput, setTechAreasInput] = useState('');

  // Selected item modal details
  const [selectedFunding, setSelectedFunding] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedPatent, setSelectedPatent] = useState(null);

  // Floating AI Chat widget state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Hello! I am your AI Innovation assistant. How can I help you explore research, grants, or patent opportunities?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load feeds on token authentication
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchDashboardFeed();
      fetchFundingFeed();
      fetchPapersFeed();
      fetchPatentsFeed();
      fetchTrendsFeed();
    }
  }, [token]);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setToken('');
    setUserRole('');
    setUserEmail('');
    setProfile(null);
    setCurrentTab('dashboard');
    setChatMessages([
      { sender: 'ai', text: "Hello! I am your AI Innovation assistant. How can I help you explore research, grants, or patent opportunities?" }
    ]);
    
    // Clear forms
    setOrganization('');
    setDepartment('');
    setInterestsInput('');
    setDomainsInput('');
    setKeywordsInput('');
    setTechAreasInput('');
    
    // Clear search queries & results
    setFundingQuery('');
    setPapersQuery('');
    setPatentsQuery('');
    setFundingRecs([]);
    setPapersRecs([]);
    setPatentsRecs([]);
    setFundingExplore([]);
    setPapersExplore([]);
    setPatentsExplore([]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    
    const params = new URLSearchParams();
    params.append('username', emailInput);
    params.append('password', passwordInput);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (!response.ok) {
        throw new Error('Incorrect credentials. Please verify your password.');
      }

      const data = await response.json();
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userRole', payload.role);
      localStorage.setItem('userEmail', payload.sub);
      
      setToken(data.access_token);
      setUserRole(payload.role);
      setUserEmail(payload.sub);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
          role: roleInput
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errMsg = 'Registration failed.';
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errMsg = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errMsg = errorData.detail.map(e => e.msg).join(', ');
          } else {
            errMsg = JSON.stringify(errorData.detail);
          }
        }
        throw new Error(errMsg);
      }

      setSuccessMsg('Profile created! Log in below.');
      setAuthMode('login');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/profiles/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setOrganization(data.organization || '');
        setDepartment(data.department || '');
        setInterestsInput((data.research_interests || []).join(', '));
        setDomainsInput((data.research_domains || []).join(', '));
        setKeywordsInput((data.keywords || []).join(', '));
        setTechAreasInput((data.technology_areas || []).join(', '));
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    
    const body = {
      first_name: profile?.first_name || 'Innovator',
      last_name: profile?.last_name || 'Member',
      organization,
      department,
      research_interests: interestsInput.split(',').map(s => s.trim()).filter(Boolean),
      research_domains: domainsInput.split(',').map(s => s.trim()).filter(Boolean),
      keywords: keywordsInput.split(',').map(s => s.trim()).filter(Boolean),
      technology_areas: techAreasInput.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const method = profile ? 'PUT' : 'POST';
      const url = profile ? '/profiles/me' : '/profiles/';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        setSuccessMsg('Portfolio saved successfully. Recalculating recommendations...');
        fetchProfile();
        fetchDashboardFeed();
        fetchFundingFeed();
        fetchPapersFeed();
        fetchPatentsFeed();
      } else {
        throw new Error('Could not save profile metadata.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardFeed = async () => {
    try {
      const response = await fetch('/recommendations/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (response.ok) {
        setDashboardData(await response.json());
      }
    } catch (err) {
      console.error('Error loading dashboard recommendations', err);
    }
  };

  const fetchFundingFeed = async (search = '') => {
    setSearchingFunding(true);
    try {
      const response = await fetch(`/recommendations/funding?q=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setFundingRecs(data.recommended || []);
        setFundingExplore(data.explore || []);
      }
    } catch (err) {
      console.error('Error loading funding recommendations', err);
    } finally {
      setSearchingFunding(false);
    }
  };

  const fetchPapersFeed = async (search = '') => {
    setSearchingPapers(true);
    try {
      const response = await fetch(`/recommendations/papers?q=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setPapersRecs(data.recommended || []);
        setPapersExplore(data.explore || []);
      }
    } catch (err) {
      console.error('Error loading papers', err);
    } finally {
      setSearchingPapers(false);
    }
  };

  const fetchPatentsFeed = async (search = '') => {
    setSearchingPatents(true);
    try {
      const response = await fetch(`/recommendations/patents?q=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setPatentsRecs(data.recommended || []);
        setPatentsExplore(data.explore || []);
      }
    } catch (err) {
      console.error('Error loading patents', err);
    } finally {
      setSearchingPatents(false);
    }
  };

  const fetchTrendsFeed = async () => {
    try {
      const response = await fetch('/recommendations/trends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (response.ok) {
        setTrendsData(await response.json());
      }
    } catch (err) {
      console.error('Error loading trends', err);
    }
  };

  // Submit message in global AI Chat Widget
  const submitAIChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    let activeItem = {};
    if (currentTab === 'funding' && selectedFunding) activeItem = selectedFunding;
    if (currentTab === 'papers' && selectedPaper) activeItem = selectedPaper;
    if (currentTab === 'patents' && selectedPatent) activeItem = selectedPatent;

    try {
      const response = await fetch('/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userText,
          page_context: currentTab,
          selected_item: activeItem
        })
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        throw new Error('AI Engine failed to resolve query.');
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I met a connection error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleContextQuestion = (question) => {
    setChatInput(question);
    setTimeout(() => {
      document.getElementById('chat-form-submit')?.click();
    }, 50);
  };

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans selection:bg-[#10a37f]/30 ${theme === 'dark' ? 'bg-[#212121] text-[#ececec]' : 'bg-[#f9f9f9] text-[#212121]'}`}>
        <div className={`w-full max-w-md border rounded-2xl p-8 shadow-2xl relative overflow-hidden ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#10a37f]"></div>
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10a37f]/10 border border-[#10a37f]/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-[#10a37f]" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Innovation Platform</h1>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className={`p-2 rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#2f2f2f] hover:bg-[#3f3f3f] text-[#b4b4b4]' : 'bg-[#f4f4f4] hover:bg-[#e4e4e4] text-[#676767]'}`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>
            Access real-world funding, papers, and patents recommendations.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800 text-[#10a37f] rounded-xl text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Email Address</label>
              <input 
                type="email" 
                required 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@organization.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
              />
            </div>

            <div>
              <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Password</label>
              <input 
                type="password" 
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
              />
            </div>



            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#10a37f] hover:bg-[#0e8f6f] text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>



          <div className="mt-6 text-center text-xs">
            {authMode === 'login' ? (
              <p className={theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}>
                Don't have an account?{' '}
                <button onClick={() => setAuthMode('register')} className="text-[#10a37f] font-semibold hover:underline">
                  Sign Up
                </button>
              </p>
            ) : (
              <p className={theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}>
                Already registered?{' '}
                <button onClick={() => setAuthMode('login')} className="text-[#10a37f] font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans relative ${theme === 'dark' ? 'bg-[#212121] text-[#ececec]' : 'bg-[#f4f4f4] text-[#212121]'}`}>
      
      {/* 1. SIDEBAR PANEL */}
      <aside className={`w-64 border-r flex flex-col ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
        <div className="p-6 border-b border-[#2d2d2d] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10a37f]/15 flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#10a37f]" />
          </div>
          <span className="font-bold tracking-tight text-md">Innovation Platform</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'funding', label: 'Funding', icon: Award },
            { id: 'papers', label: 'Research Papers', icon: BookOpen },
            { id: 'patents', label: 'Patents', icon: FileText },
            { id: 'trends', label: 'Technology Trends', icon: TrendingUp },
            { id: 'profile', label: 'Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  clearMessages();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-[#10a37f] text-white shadow-sm' 
                    : theme === 'dark' 
                      ? 'text-[#b4b4b4] hover:bg-[#2f2f2f] hover:text-[#ececec]' 
                      : 'text-[#676767] hover:bg-[#f4f4f4] hover:text-[#212121]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User cabinet footer */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#10a37f]/10 flex items-center justify-center text-sm font-bold text-[#10a37f]">
              {userEmail ? userEmail[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold truncate">{userEmail}</p>
              <p className={`text-[10px] font-medium tracking-wide uppercase ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{userRole}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className={`p-2 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#2f2f2f] hover:bg-[#3f3f3f] text-[#b4b4b4]' : 'bg-[#f4f4f4] hover:bg-[#e4e4e4] text-[#676767]'}`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`px-8 py-5 border-b flex items-center justify-between ${theme === 'dark' ? 'border-[#2d2d2d] bg-[#171717]' : 'border-[#e5e5e5] bg-white'}`}>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight capitalize">
              {currentTab === 'trends' ? 'Technology Trends Analytics' : `${currentTab} cabinet`}
            </h2>
            {profile && (
              <span className="text-[10px] bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 font-bold px-2 py-0.5 rounded-full uppercase">
                {profile.organization || 'Independent Researcher'}
              </span>
            )}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          {successMsg && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800 text-[#10a37f] rounded-xl text-sm">
              {successMsg}
            </div>
          )}

          {/* --- TAB A: DASHBOARD VIEW --- */}
          {currentTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Insight banner */}
              {dashboardData.ai_insight && (
                <div className={`border p-5 rounded-2xl flex gap-4 items-start shadow-sm ${theme === 'dark' ? 'bg-[#10a37f]/5 border-[#10a37f]/20' : 'bg-[#10a37f]/5 border-[#10a37f]/20'}`}>
                  <div className="w-10 h-10 rounded-xl bg-[#10a37f]/10 border border-[#10a37f]/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#10a37f]" />
                  </div>
                  <div>
                    <h3 className="text-[#10a37f] font-bold text-sm mb-1">AI Generated Insight Summary</h3>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{dashboardData.ai_insight}</p>
                  </div>
                </div>
              )}

              {/* Grid sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Section 1: Recommended Grants */}
                <div className={`border rounded-2xl p-6 shadow-sm space-y-4 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#10a37f]" />
                      <h3 className="font-bold text-sm">Recommended Funding</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#10a37f]">Embedding Match</span>
                  </div>

                  <div className="space-y-4">
                    {dashboardData.recommended_grants && dashboardData.recommended_grants.length > 0 ? (
                      dashboardData.recommended_grants.map((grant) => (
                        <div key={grant.id} className={`p-3.5 border rounded-xl hover:border-[#10a37f]/40 transition-all group ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                          <h4 className="font-semibold text-xs truncate group-hover:text-[#10a37f]">{grant.title}</h4>
                          <p className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{grant.agency}</p>
                          <div className="flex justify-between items-center mt-3 text-[10px]">
                            <span className="font-bold text-[#10a37f]">{grant.funding_amount}</span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}><Clock className="w-3 h-3" /> {grant.deadline}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-xs italic ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Configure your Profile domains to get real-time grant recommendations.</p>
                    )}
                  </div>
                </div>

                {/* Section 2: Recommended Research Papers */}
                <div className={`border rounded-2xl p-6 shadow-sm space-y-4 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#10a37f]" />
                      <h3 className="font-bold text-sm">Recommended Papers</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#10a37f]">Cosine Similarity</span>
                  </div>

                  <div className="space-y-4">
                    {dashboardData.recommended_papers && dashboardData.recommended_papers.length > 0 ? (
                      dashboardData.recommended_papers.map((paper, idx) => (
                        <div key={idx} className={`p-3.5 border rounded-xl hover:border-[#10a37f]/40 transition-all group ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                          <h4 className="font-semibold text-xs line-clamp-1 group-hover:text-[#10a37f]">{paper.title}</h4>
                          <p className={`text-[10px] mt-1 truncate ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{paper.authors}</p>
                          <div className={`flex justify-between items-center mt-3 text-[10px] ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>
                            <span>Year: {paper.publication_year}</span>
                            <span>{paper.citation_count} Citations</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-xs italic ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Academic paper matches will populate here.</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Recommended Patents */}
                <div className={`border rounded-2xl p-6 shadow-sm space-y-4 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#10a37f]" />
                      <h3 className="font-bold text-sm">Recommended Patents</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#10a37f]">USPTO / Lens</span>
                  </div>

                  <div className="space-y-4">
                    {dashboardData.recommended_patents && dashboardData.recommended_patents.length > 0 ? (
                      dashboardData.recommended_patents.map((pat, idx) => (
                        <div key={idx} className={`p-3.5 border rounded-xl hover:border-[#10a37f]/40 transition-all group ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                          <h4 className="font-semibold text-xs line-clamp-1 group-hover:text-[#10a37f]">{pat.patent_title}</h4>
                          <p className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Assignee: {pat.assignee}</p>
                          <div className={`flex justify-between items-center mt-3 text-[10px] ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>
                            <span>Num: {pat.patent_number}</span>
                            <span>Filing: {pat.filing_date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-xs italic ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>No matched patents found.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Emerging Technology Highlights */}
              <div className={`border rounded-2xl p-6 shadow-sm ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                <h3 className="font-bold text-sm mb-4">Emerging Technology Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardData.tech_highlights && dashboardData.tech_highlights.map((tech, idx) => (
                    <div key={idx} className={`p-4 border rounded-xl flex items-center justify-between ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <div>
                        <span className="text-[9px] bg-[#10a37f]/10 text-[#10a37f] px-2 py-0.5 rounded-full font-bold uppercase">{tech.category}</span>
                        <h4 className="font-bold text-xs mt-2">{tech.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-500 font-bold text-xs">{tech.growth}</span>
                        <p className={`text-[9px] mt-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>YoY Growth</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB B: FUNDING MODULE --- */}
          {currentTab === 'funding' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="w-5 h-5 absolute left-4 top-3 text-[#b4b4b4]" />
                  <input
                    type="text"
                    value={fundingQuery}
                    onChange={(e) => setFundingQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchFundingFeed(fundingQuery); }}
                    placeholder="Search NIH, NSF awards by keyword..."
                    className={`w-full border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                  />
                </div>
                
                <button 
                  onClick={() => fetchFundingFeed(fundingQuery)}
                  disabled={searchingFunding}
                  className="bg-[#10a37f] text-white hover:bg-[#0e8f6f] font-semibold text-xs px-5 py-3 rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {searchingFunding && <Loader className="w-3.5 h-3.5 animate-spin" />}
                  <span>{searchingFunding ? 'Exploring...' : 'Explore Funding'}</span>
                </button>
              </div>

              {/* Section 1: Personalized Recommendations */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm border-b border-[#2d2d2d] pb-2">Personalized Matching Opportunities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fundingRecs.length > 0 ? (
                    fundingRecs.map((grant) => (
                      <div key={grant.id} className={`border p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-[#10a37f]/50 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <span className="text-[9px] bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 font-bold px-2 py-0.5 rounded-full uppercase">
                              Embedded Match
                            </span>
                            <span className={`text-10px flex items-center gap-1 font-bold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>
                              <Calendar className="w-3.5 h-3.5" /> Deadline: {grant.deadline}
                            </span>
                          </div>
                          
                          <h4 className={`font-bold text-sm mt-3 ${theme === 'dark' ? 'text-white' : 'text-[#212121]'}`}>{grant.title}</h4>
                          <p className="text-xs text-[#10a37f] mt-1.5 font-semibold">{grant.agency}</p>
                          <p className={`text-xs mt-3 line-clamp-3 leading-relaxed ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{grant.description}</p>
                        </div>

                        <div className={`mt-6 pt-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                          <span className="font-bold text-sm text-[#10a37f]">{grant.funding_amount}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setSelectedFunding(grant)}
                              className={`text-xs font-semibold px-4 py-2 border rounded-xl cursor-pointer ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-[#f4f4f4]'}`}
                            >
                              View Details
                            </button>
                            <a 
                              href={grant.official_website} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs font-semibold bg-[#10a37f] hover:bg-[#0e8f6f] text-white px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              Apply <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs italic ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Enter a search query above to view matched funding opportunities.</p>
                  )}
                </div>
              </div>

              {/* Section 2: Explore list */}
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-sm border-b border-[#2d2d2d] pb-2">Explore NIH / NSF Opportunities</h3>
                <div className="space-y-4">
                  {fundingExplore.map((grant) => (
                    <div key={grant.id} className={`border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-xs truncate ${theme === 'dark' ? 'text-white' : 'text-[#212121]'}`}>{grant.title}</h4>
                        <p className="text-[10px] text-[#10a37f] mt-1">{grant.agency} | {grant.eligibility}</p>
                        <p className={`text-[10px] mt-2 line-clamp-1 leading-relaxed ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{grant.description}</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#10a37f]">{grant.funding_amount}</span>
                          <p className={`text-[9px] mt-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Deadline: {grant.deadline}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedFunding(grant)}
                          className={`text-xs font-semibold px-4 py-2 border rounded-xl cursor-pointer ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-[#f4f4f4]'}`}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB C: RESEARCH PAPERS MODULE --- */}
          {currentTab === 'papers' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="w-5 h-5 absolute left-4 top-3 text-[#b4b4b4]" />
                  <input
                    type="text"
                    value={papersQuery}
                    onChange={(e) => setPapersQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchPapersFeed(papersQuery); }}
                    placeholder="Search OpenAlex, Semantic Scholar papers..."
                    className={`w-full border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                  />
                </div>
                
                <button 
                  onClick={() => fetchPapersFeed(papersQuery)}
                  disabled={searchingPapers}
                  className="bg-[#10a37f] text-white hover:bg-[#0e8f6f] font-semibold text-xs px-5 py-3 rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {searchingPapers && <Loader className="w-3.5 h-3.5 animate-spin" />}
                  <span>{searchingPapers ? 'Querying...' : 'Query Papers'}</span>
                </button>
              </div>

              {/* Recommended list */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm border-b border-[#2d2d2d] pb-2">Matched Literature Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {papersRecs.length > 0 ? (
                    papersRecs.map((paper, idx) => (
                      <div key={idx} className={`border p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-[#10a37f]/50 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                        <div>
                          <h4 className={`font-bold text-sm line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-[#212121]'}`}>{paper.title}</h4>
                          <p className={`text-xs mt-2 italic truncate ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{paper.authors}</p>
                          <p className={`text-xs mt-4 line-clamp-4 leading-relaxed ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{paper.abstract}</p>
                        </div>
                        <div className={`mt-6 pt-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                          <span className="text-[10px] text-[#10a37f] font-bold">Citations: {paper.citation_count} | Year: {paper.publication_year}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setSelectedPaper(paper)}
                              className={`text-xs font-semibold px-4 py-2 border rounded-xl cursor-pointer ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-[#f4f4f4]'}`}
                            >
                              Analyze Paper
                            </button>
                            <a href={paper.url} target="_blank" rel="noreferrer" className="text-xs font-semibold bg-[#10a37f] hover:bg-[#0e8f6f] text-white px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
                              Open Paper <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs italic ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Enter a search query above to view matched research recommendations.</p>
                  )}
                </div>
              </div>

              {/* Explore Search list */}
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-sm border-b border-[#2d2d2d] pb-2">Literature Explorer</h3>
                <div className="space-y-4">
                  {papersExplore.map((paper, idx) => (
                    <div key={idx} className={`border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-xs truncate ${theme === 'dark' ? 'text-white' : 'text-[#212121]'}`}>{paper.title}</h4>
                        <p className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Authors: {paper.authors}</p>
                        <p className={`text-[10px] mt-2 line-clamp-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{paper.abstract}</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className={`text-right text-[10px] font-bold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>
                          <span>Citations: {paper.citation_count}</span>
                          <p className="mt-1">Year: {paper.publication_year}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedPaper(paper)}
                          className={`text-xs font-semibold px-4 py-2 border rounded-xl cursor-pointer ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-[#f4f4f4]'}`}
                        >
                          Analyze
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB D: PATENTS MODULE --- */}
          {currentTab === 'patents' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="w-5 h-5 absolute left-4 top-3 text-[#b4b4b4]" />
                  <input
                    type="text"
                    value={patentsQuery}
                    onChange={(e) => setPatentsQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchPatentsFeed(patentsQuery); }}
                    placeholder="Search USPTO patents by title, number..."
                    className={`w-full border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                  />
                </div>
                
                <button 
                  onClick={() => fetchPatentsFeed(patentsQuery)}
                  disabled={searchingPatents}
                  className="bg-[#10a37f] text-white hover:bg-[#0e8f6f] font-semibold text-xs px-5 py-3 rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {searchingPatents && <Loader className="w-3.5 h-3.5 animate-spin" />}
                  <span>{searchingPatents ? 'Searching...' : 'Search Patents'}</span>
                </button>
              </div>

              {/* Recommended list */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm border-b border-[#2d2d2d] pb-2">Patents Registry Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {patentsRecs.length > 0 ? (
                    patentsRecs.map((pat, idx) => (
                      <div key={idx} className={`border p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-[#10a37f]/50 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                        <div>
                          <h4 className={`font-bold text-sm line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-[#212121]'}`}>{pat.patent_title}</h4>
                          <p className="text-xs text-[#10a37f] mt-1.5 font-semibold">Assignee: {pat.assignee}</p>
                          <p className={`text-xs mt-4 line-clamp-4 leading-relaxed ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{pat.abstract}</p>
                        </div>
                        <div className={`mt-6 pt-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                          <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Pat. Number: {pat.patent_number} | Filing: {pat.filing_date}</span>
                          <button 
                            onClick={() => setSelectedPatent(pat)}
                            className={`text-xs font-semibold px-4 py-2 border rounded-xl cursor-pointer ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-[#f4f4f4]'}`}
                          >
                            Analyze Spec
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs italic ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Enter a search query above to view matched patent recommendations.</p>
                  )}
                </div>
              </div>

              {/* Explore Search list */}
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-sm border-b border-[#2d2d2d] pb-2">Patent Database Explorer</h3>
                <div className="space-y-4">
                  {patentsExplore.map((pat, idx) => (
                    <div key={idx} className={`border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-xs truncate ${theme === 'dark' ? 'text-white' : 'text-[#212121]'}`}>{pat.patent_title}</h4>
                        <p className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Assignee: {pat.assignee}</p>
                        <p className={`text-[10px] mt-2 line-clamp-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{pat.abstract}</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className={`text-right text-[10px] font-bold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>
                          <span>Patent: {pat.patent_number}</span>
                          <p className="mt-1">Filing: {pat.filing_date}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedPatent(pat)}
                          className={`text-xs font-semibold px-4 py-2 border rounded-xl cursor-pointer ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-[#f4f4f4]'}`}
                        >
                          Analyze
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB E: TECHNOLOGY TRENDS VIEW (CHARTS) --- */}
          {currentTab === 'trends' && (
            <div className="space-y-8">
              {trendsData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Publications Growth chart simulation */}
                  <div className={`border rounded-2xl p-6 shadow-sm ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                    <h3 className="font-bold text-sm mb-4">Scientific Publications growth trends</h3>
                    <div className="space-y-4">
                      {trendsData.topics.map((topic, idx) => {
                        const yearsData = trendsData.publications_growth;
                        const value_2025 = yearsData[yearsData.length - 1][topic] || 0;
                        const max_val = Math.max(...yearsData.map(y => y[topic] || 0));
                        const pct = (value_2025 / max_val) * 100;
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{topic}</span>
                              <span className="text-[#10a37f]">{value_2025} Publications</span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-[#e5e5e5]'}`}>
                              <div className="bg-[#10a37f] h-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Patents filing growth simulation */}
                  <div className={`border rounded-2xl p-6 shadow-sm ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                    <h3 className="font-bold text-sm mb-4">Patent Application filing trends</h3>
                    <div className="space-y-4">
                      {trendsData.topics.map((topic, idx) => {
                        const yearsData = trendsData.patents_growth;
                        const value_2025 = yearsData[yearsData.length - 1][topic] || 0;
                        const max_val = Math.max(...yearsData.map(y => y[topic] || 0));
                        const pct = (value_2025 / max_val) * 100;
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{topic}</span>
                              <span className="text-[#10a37f]">{value_2025} filings</span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-[#e5e5e5]'}`}>
                              <div className="bg-[#10a37f] h-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Funding volume distribution simulation */}
                  <div className={`border rounded-2xl p-6 shadow-sm md:col-span-2 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
                    <h3 className="font-bold text-sm mb-4">Funding volume distribution ($ millions)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      {trendsData.topics.map((topic, idx) => {
                        const yearsData = trendsData.funding_trends;
                        const value_2025 = yearsData[yearsData.length - 1][topic] || 0;
                        return (
                          <div key={idx} className={`border p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                            <span className={`text-[10px] font-semibold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>{topic}</span>
                            <div className="text-xl font-bold text-[#10a37f] mt-2">${value_2025}M</div>
                            <p className={`text-[9px] mt-1 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>2025 Total Allocation</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-12">
                  <Loader className="w-6 h-6 animate-spin text-[#10a37f]" />
                </div>
              )}
            </div>
          )}

          {/* --- TAB F: PROFILE TAB (POWERS RECOMMENDATION ENGINE) --- */}
          {currentTab === 'profile' && (
            <div className={`border rounded-2xl p-8 shadow-sm ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
              <div className={`flex items-center gap-3 pb-4 border-b mb-6 ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                <User className="w-6 h-6 text-[#10a37f]" />
                <div>
                  <h3 className="font-bold text-md">Manage Research Profile</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>This metadata triggers embedding recalculations for personalized recommendations.</p>
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Organization</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science Department"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Research Interests (Comma-separated)</label>
                  <input
                    type="text"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder="e.g. federated learning, neural networks, security"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Research Domains</label>
                    <input
                      type="text"
                      value={domainsInput}
                      onChange={(e) => setDomainsInput(e.target.value)}
                      placeholder="AI, Biotechnology"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Keywords</label>
                    <input
                      type="text"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="NLP, Transformer, FAISS"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Technology Areas</label>
                    <input
                      type="text"
                      value={techAreasInput}
                      onChange={(e) => setTechAreasInput(e.target.value)}
                      placeholder="Quantum Computing, Healthcare"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#10a37f] text-white hover:bg-[#0e8f6f] font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Save Portfolio Configuration
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* 3. FLOATING AI ASSISTANT WIDGET (accessible globally) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isAIChatOpen && (
          <div className={`w-80 h-96 border rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
            {/* Header */}
            <div className="bg-[#10a37f] p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-xs">AI Innovation Copilot</span>
              </div>
              <button 
                onClick={() => setIsAIChatOpen(false)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Suggestions list matching active tab */}
            <div className={`px-4 py-2 border-b overflow-x-auto whitespace-nowrap flex gap-2 shrink-0 ${theme === 'dark' ? 'bg-[#2f2f2f]/40 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
              {currentTab === 'funding' && (
                <>
                  <button onClick={() => handleContextQuestion("Should I apply for this?")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Should I apply?</button>
                  <button onClick={() => handleContextQuestion("Explain eligibility criteria")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Eligibility?</button>
                </>
              )}
              {currentTab === 'papers' && (
                <>
                  <button onClick={() => handleContextQuestion("Summarize paper key contributions")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Summarize</button>
                  <button onClick={() => handleContextQuestion("Explain methodology")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Methodology</button>
                </>
              )}
              {currentTab === 'patents' && (
                <>
                  <button onClick={() => handleContextQuestion("Explain novelty of patent")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Explain Novelty</button>
                  <button onClick={() => handleContextQuestion("Commercial applications")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Applications</button>
                </>
              )}
              {currentTab === 'dashboard' && (
                <>
                  <button onClick={() => handleContextQuestion("Find grants related to AI in healthcare")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Grants</button>
                  <button onClick={() => handleContextQuestion("Suggest commercialization opportunities")} className="text-[10px] bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 text-[#10a37f] px-2 py-1 rounded-full font-semibold transition-all">Market Strategy</button>
                </>
              )}
            </div>

            {/* Chat Body */}
            <div className={`flex-1 p-4 overflow-y-auto space-y-3 text-xs ${theme === 'dark' ? 'bg-[#171717]' : 'bg-white'}`}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#10a37f] text-white rounded-tr-none' 
                      : `rounded-tl-none border ${theme === 'dark' ? 'bg-[#2f2f2f] text-[#ececec] border-[#3f3f3f]' : 'bg-[#f4f4f4] text-[#212121] border-[#e5e5e5]'}`
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-xl rounded-tl-none border flex items-center gap-2 ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f]' : 'bg-[#f4f4f4] border-[#e5e5e5]'}`}>
                    <Loader className="w-3.5 h-3.5 animate-spin text-[#10a37f]" />
                    <span>Resolving context...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={submitAIChat} className={`p-3 border-t flex gap-2 shrink-0 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask context question..."
                className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10a37f] transition-all ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3f3f3f] text-[#ececec]' : 'bg-white border-[#e5e5e5] text-[#212121]'}`}
              />
              <button 
                type="submit" 
                id="chat-form-submit"
                className="p-2 bg-[#10a37f] hover:bg-[#0e8f6f] text-white rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          className="w-12 h-12 bg-[#10a37f] hover:bg-[#0e8f6f] text-white rounded-full flex items-center justify-center shadow-2xl transition-all scale-100 hover:scale-105 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* --- MODAL 1: FUNDING DETAIL --- */}
      {selectedFunding && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[#10a37f]"></div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-md font-bold pr-8">{selectedFunding.title}</h3>
                <button onClick={() => setSelectedFunding(null)} className="text-[#b4b4b4] hover:text-white font-bold">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <span className={`uppercase font-semibold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Funding Agency</span>
                  <p className="font-bold mt-1">{selectedFunding.agency}</p>
                </div>
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <span className={`uppercase font-semibold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Target Budget Limit</span>
                  <p className="font-bold text-[#10a37f] mt-1">{selectedFunding.funding_amount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Grant Overview Scope</h4>
                <p className={`text-xs leading-relaxed p-4 border rounded-xl h-40 overflow-y-auto ${theme === 'dark' ? 'text-[#ececec] bg-[#2f2f2f]/10 border-[#2d2d2d]' : 'text-[#212121] bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  {selectedFunding.description}
                </p>
              </div>

              <div className={`flex justify-between items-center pt-4 border-t ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Deadline: {selectedFunding.deadline}</span>
                <a href={selectedFunding.official_website} target="_blank" rel="noreferrer" className="text-xs font-semibold bg-[#10a37f] hover:bg-[#0e8f6f] text-white px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer">
                  Open Official Website <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PAPER DETAIL --- */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[#10a37f]"></div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-md font-bold pr-8">{selectedPaper.title}</h3>
                <button onClick={() => setSelectedPaper(null)} className="text-[#b4b4b4] hover:text-white font-bold">✕</button>
              </div>

              <div className={`text-xs p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d] text-[#b4b4b4]' : 'bg-[#f9f9f9] border-[#e5e5e5] text-[#676767]'}`}>
                <span className="uppercase font-semibold">Authors</span>
                <p className={`font-bold mt-1 italic ${theme === 'dark' ? 'text-white' : 'text-[#212121]'}`}>{selectedPaper.authors}</p>
              </div>

              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Full Abstract Description</h4>
                <p className={`text-xs leading-relaxed p-4 border rounded-xl h-40 overflow-y-auto ${theme === 'dark' ? 'text-[#ececec] bg-[#2f2f2f]/10 border-[#2d2d2d]' : 'text-[#212121] bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  {selectedPaper.abstract}
                </p>
              </div>

              <div className={`flex justify-between items-center pt-4 border-t ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Citations: {selectedPaper.citation_count} | Year: {selectedPaper.publication_year}</span>
                <a href={selectedPaper.url} target="_blank" rel="noreferrer" className="text-xs font-semibold bg-[#10a37f] hover:bg-[#0e8f6f] text-white px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer">
                  Open Paper Link <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: PATENT DETAIL --- */}
      {selectedPatent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-white border-[#e5e5e5]'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[#10a37f]"></div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-md font-bold pr-8">{selectedPatent.patent_title}</h3>
                <button onClick={() => setSelectedPatent(null)} className="text-[#b4b4b4] hover:text-white font-bold">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <span className={`uppercase font-semibold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Assignee</span>
                  <p className="font-bold mt-1">{selectedPatent.assignee}</p>
                </div>
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#2f2f2f]/30 border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <span className={`uppercase font-semibold ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Classification Domain</span>
                  <p className="font-bold text-[#10a37f] mt-1">{selectedPatent.technology_domain}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#b4b4b4]' : 'text-[#676767]'}`}>Patent Abstract</h4>
                <p className={`text-xs leading-relaxed p-4 border rounded-xl h-40 overflow-y-auto ${theme === 'dark' ? 'text-[#ececec] bg-[#2f2f2f]/10 border-[#2d2d2d]' : 'text-[#212121] bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  {selectedPatent.abstract}
                </p>
              </div>

              <div className={`pt-4 border-t text-xs ${theme === 'dark' ? 'border-[#2d2d2d] text-[#b4b4b4]' : 'border-[#e5e5e5] text-[#676767]'}`}>
                <span>Patent Number: {selectedPatent.patent_number} | Filing Date: {selectedPatent.filing_date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
