import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Award, 
  User, 
  Briefcase, 
  TrendingUp, 
  Bell, 
  FileText, 
  Settings, 
  LogOut, 
  Shield, 
  Plus, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  Cpu, 
  Layers, 
  BarChart2, 
  ArrowRight,
  Book,
  Mail,
  Lock,
  Compass,
  Users,
  PieChart,
  GitBranch,
  Activity,
  Globe,
  DollarSign,
  Sun,
  Moon,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';

export default function App() {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  
  // Auth inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('RESEARCHER');

  // App UI State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [grants, setGrants] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [patentLandscape, setPatentLandscape] = useState([]);
  const [emergingTech, setEmergingTech] = useState([]);
  const [projects, setProjects] = useState([]);
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  // Global search input
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Innovation Scoring Engine (Weighted model)
  const [scoringNovelty, setScoringNovelty] = useState(80);      // 30%
  const [scoringPatentStrength, setScoringPatentStrength] = useState(70); // 20%
  const [scoringMaturity, setScoringMaturity] = useState(60);     // 15%
  const [scoringMarketPotential, setScoringMarketPotential] = useState(85); // 20%
  const [scoringRelevance, setScoringRelevance] = useState(75);   // 15%
  const [activePatentScore, setActivePatentScore] = useState(null);

  // Form inputs for Profile Editor
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [biography, setBiography] = useState('');
  const [academicHistory, setAcademicHistory] = useState('');
  const [researchHistory, setResearchHistory] = useState('');
  const [domainsInput, setDomainsInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [techAreasInput, setTechAreasInput] = useState('');

  // Form inputs for Admin (User Management)
  const [newAdminUserEmail, setNewAdminUserEmail] = useState('');
  const [newAdminUserPass, setNewAdminUserPass] = useState('');
  const [newAdminUserRole, setNewAdminUserRole] = useState('RESEARCHER');

  // Project form for Innovation Managers
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLeader, setNewProjectLeader] = useState('');
  const [newProjectFunding, setNewProjectFunding] = useState(150000);
  const [newProjectStage, setNewProjectStage] = useState('IDEA');

  // Status banners
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search and filter triggers
  const [funderFilter, setFunderFilter] = useState('');
  const [matchScoreThreshold, setMatchScoreThreshold] = useState(0);
  const [expandedOpportunityId, setExpandedOpportunityId] = useState(null);

  // Sync theme class
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Fetch role-specific configurations
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchNotifications();
      fetchGrants();
      fetchIntelligence();
      fetchProjects();
      if (userRole === 'ADMINISTRATOR') {
        fetchAdminUsers();
        fetchAdminStats();
      }
    }
  }, [token, userRole]);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setToken('');
    setUserRole('');
    setUserEmail('');
    setProfile(null);
    setNotifications([]);
    setGrants([]);
    setTimelineData([]);
    setTrendingTopics([]);
    setCollaborators([]);
    setPatentLandscape([]);
    setEmergingTech([]);
    setProjects([]);
    setAdminUsersList([]);
    setAdminStats(null);
    setActivePatentScore(null);
    setCurrentTab('dashboard');
    
    // Clear user cached form states on logout to avoid leaking into other profiles
    setFirstName('');
    setLastName('');
    setOrganization('');
    setBiography('');
    setAcademicHistory('');
    setResearchHistory('');
    setDomainsInput('');
    setKeywordsInput('');
    setTechAreasInput('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    
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
        throw new Error('Incorrect email or password.');
      }

      const data = await response.json();
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userRole', payload.role);
      localStorage.setItem('userEmail', payload.sub);
      
      setToken(data.access_token);
      setUserRole(payload.role);
      setUserEmail(payload.sub);
      setSuccessMsg('Session authenticated.');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();

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
        throw new Error(errorData.detail || 'Registration failed.');
      }

      setSuccessMsg('Registration complete. Sign in below.');
      setAuthMode('login');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/profiles/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setOrganization(data.organization || '');
        setBiography(data.biography || '');
        setAcademicHistory(data.academic_history || '');
        setResearchHistory(data.research_history || '');
        setDomainsInput((data.research_domains || []).join(', '));
        setKeywordsInput((data.keywords || []).join(', '));
        setTechAreasInput((data.technology_areas || []).join(', '));
      } else {
        // Clear cached profile details if profile fetch returns failure (e.g., new user with no profile yet)
        setProfile(null);
        setFirstName('');
        setLastName('');
        setOrganization('');
        setBiography('');
        setAcademicHistory('');
        setResearchHistory('');
        setDomainsInput('');
        setKeywordsInput('');
        setTechAreasInput('');
      }
    } catch (err) {
      console.error('Error loading academic profile', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(await response.json());
      }
    } catch (err) {
      console.error('Error fetching alerts', err);
    }
  };

  const fetchGrants = async () => {
    try {
      const response = await fetch('/recommendations/grants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setGrants(await response.json());
      }
    } catch (err) {
      console.error('Error loading recommendations', err);
    }
  };

  const fetchIntelligence = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const timelineRes = await fetch('/intelligence/trends/publications', { headers });
      if (timelineRes.ok) setTimelineData(await timelineRes.json());

      const topicsRes = await fetch('/intelligence/trends/topics', { headers });
      if (topicsRes.ok) setTrendingTopics(await topicsRes.json());

      const collabsRes = await fetch('/intelligence/trends/collaborators', { headers });
      if (collabsRes.ok) setCollaborators(await collabsRes.json());

      const landscapeRes = await fetch('/intelligence/patents/landscape', { headers });
      if (landscapeRes.ok) setPatentLandscape(await landscapeRes.json());

      const emergingRes = await fetch('/intelligence/patents/emerging-tech', { headers });
      if (emergingRes.ok) setEmergingTech(await emergingRes.json());
    } catch (err) {
      console.error('Error fetching intelligence feeds', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/portfolio/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setProjects(await response.json());
      }
    } catch (err) {
      console.error('Error loading projects', err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAdminUsersList(await response.json());
      }
    } catch (err) {
      console.error('Error listing system users', err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAdminStats(await response.json());
      }
    } catch (err) {
      console.error('Error querying platform statistics', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    clearMessages();
    
    const profileIn = {
      first_name: firstName,
      last_name: lastName,
      organization: organization,
      biography: biography,
      academic_history: academicHistory,
      research_history: researchHistory,
      research_domains: domainsInput.split(',').map(d => d.trim()).filter(Boolean),
      keywords: keywordsInput.split(',').map(k => k.trim()).filter(Boolean),
      technology_areas: techAreasInput.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      const response = await fetch(profile ? '/profiles/me' : '/profiles/', {
        method: profile ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileIn)
      });

      if (!response.ok) throw new Error('Could not update profile credentials.');
      setSuccessMsg('Academic profile updated successfully.');
      fetchProfile();
      fetchGrants();
      fetchNotifications();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      const response = await fetch(`/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error clearing alert', err);
    }
  };

  // Add Project by Innovation Manager
  const handleAddProject = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const response = await fetch('/portfolio/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDesc,
          team_leader: newProjectLeader,
          funding_received: parseFloat(newProjectFunding),
          status: 'Active',
          pipeline_stage: newProjectStage,
          innovation_score: Math.round(Math.random() * 40 + 55)
        })
      });

      if (!response.ok) throw new Error('Failed to create pipeline project.');
      setSuccessMsg('Pipeline project created.');
      setNewProjectTitle('');
      setNewProjectDesc('');
      setNewProjectLeader('');
      fetchProjects();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Update Project Pipeline Stage by Manager
  const handleUpdateProjectStage = async (id, stage) => {
    try {
      const response = await fetch(`/portfolio/projects/${id}/stage?stage=${stage}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error('Error shifting project stage', err);
    }
  };

  // Create User by Admin
  const handleAdminCreateUser = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const response = await fetch('/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newAdminUserEmail,
          password: newAdminUserPass,
          role: newAdminUserRole
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Could not register user.');
      }

      setSuccessMsg('Account registered successfully.');
      setNewAdminUserEmail('');
      setNewAdminUserPass('');
      fetchAdminUsers();
      fetchAdminStats();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Toggle User suspension by Admin
  const handleAdminToggleUserStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/admin/users/${id}/status?is_active=${!currentStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Failed to update user status.');
      }
      fetchAdminUsers();
      fetchAdminStats();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Delete User by Admin
  const handleAdminDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this account?")) return;
    try {
      const response = await fetch(`/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Failed to delete user.');
      }
      setSuccessMsg('User record removed.');
      fetchAdminUsers();
      fetchAdminStats();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Calculate Weighted Innovation Score Card (Milestone 3 specs)
  const calculateEngineScore = () => {
    const rawScore = (scoringNovelty * 0.3) + 
                     (scoringPatentStrength * 0.2) + 
                     (scoringMaturity * 0.15) + 
                     (scoringMarketPotential * 0.2) + 
                     (scoringRelevance * 0.15);
    return Math.round(rawScore * 10) / 10;
  };

  const computedScore = calculateEngineScore();

  // Render Authentication View - Skinned with ChatGPT colors
  if (!token) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#212121] text-[#ececec]' : 'bg-white text-[#212121]'} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-150`}>
        <div className={`max-w-md w-full ${theme === 'dark' ? 'bg-[#171717] border border-[#2d2d2d]' : 'bg-[#f9f9f9] border border-[#e5e5e5]'} shadow-lg rounded-2xl p-8 space-y-6 relative`}>
          
          <button 
            onClick={toggleTheme}
            className={`absolute top-4 right-4 p-2 rounded-full ${theme === 'dark' ? 'hover:bg-[#2f2f2f] text-[#ececec]' : 'hover:bg-slate-200 text-[#212121]'}`}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-[#10a37f] text-white rounded-xl flex items-center justify-center">
              <Compass className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              Innovation Platform
            </h2>
            <p className="mt-2 text-sm text-[#b4b4b4]">
              Milestones 1–3 Cabinet
            </p>
          </div>

          {/* Success/Error Alerts */}
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-600 p-4 text-rose-800 dark:text-rose-200 text-sm rounded-r-md">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-[#10a37f] p-4 text-[#10a37f] dark:text-[#ececec] text-sm rounded-r-md">
              {successMsg}
            </div>
          )}

          {authMode === 'forgot' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#b4b4b4] text-center">
                Enter your registered academic email below to trigger a recovery authentication link.
              </p>
              <input
                type="email"
                required
                className={`block w-full px-3 py-2.5 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                placeholder="name@university.edu"
              />
              <button
                onClick={() => setSuccessMsg('If this email is registered, recovery links have been sent.')}
                className="w-full bg-[#10a37f] hover:bg-[#0e8f6e] text-white font-medium py-3 rounded-lg cursor-pointer"
              >
                Send Recovery Key
              </button>
              <button 
                onClick={() => { setAuthMode('login'); clearMessages(); }}
                className="w-full text-[#b4b4b4] hover:text-[#ececec] text-sm hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[#b4b4b4] tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b4b4b4]">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-[#b4b4b4] tracking-wider">Password</label>
                  {authMode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('forgot'); clearMessages(); }}
                      className="text-xs text-[#10a37f] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b4b4b4]">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-[#b4b4b4] tracking-wider">Account Role Selection</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className={`block w-full px-3 py-2.5 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                  >
                    <option value="RESEARCHER">Researcher</option>
                    <option value="STARTUP_FOUNDER">Startup Founder</option>
                    <option value="INNOVATION_MANAGER">Innovation Manager</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-4 bg-[#10a37f] hover:bg-[#0e8f6e] text-white font-medium py-3 rounded-lg focus:outline-none transition-colors cursor-pointer"
              >
                {authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>
          )}

          {/* OAuth mock option */}
          <div className="border-t border-slate-700/40 pt-4 flex flex-col items-center space-y-2">
            <button
              onClick={() => {
                localStorage.setItem('token', 'mock_google_oauth_token');
                localStorage.setItem('userRole', 'RESEARCHER');
                localStorage.setItem('userEmail', 'google_guest@university.edu');
                setToken('mock_google_oauth_token');
                setUserRole('RESEARCHER');
                setUserEmail('google_guest@university.edu');
                setSuccessMsg('Authenticated via Google OAuth.');
              }}
              className={`w-full border ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f] text-[#ececec]' : 'border-[#e5e5e5] hover:bg-slate-100 text-[#212121]'} text-sm py-2 rounded-lg flex items-center justify-center space-x-2 cursor-pointer`}
            >
              <Globe className="h-4 w-4 text-[#10a37f]" />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="text-center text-sm text-[#b4b4b4] mt-4">
            {authMode === 'login' ? (
              <p>
                Need access credentials?{' '}
                <button 
                  onClick={() => { setAuthMode('register'); clearMessages(); }} 
                  className="text-[#10a37f] hover:underline font-semibold cursor-pointer"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Have an academic account?{' '}
                <button 
                  onClick={() => { setAuthMode('login'); clearMessages(); }} 
                  className="text-[#10a37f] hover:underline font-semibold cursor-pointer"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filtered grants opportunity discoverer
  const filteredGrants = grants.filter(g => {
    const matchesFunder = funderFilter === '' || g.funder.toLowerCase().includes(funderFilter.toLowerCase());
    const matchesScore = g.match_score >= matchScoreThreshold;
    const matchesGlobal = globalSearchQuery === '' || 
      g.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || 
      g.description.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      g.funder.toLowerCase().includes(globalSearchQuery.toLowerCase());
    return matchesFunder && matchesScore && matchesGlobal;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={`min-h-screen flex font-sans ${theme === 'dark' ? 'bg-[#212121] text-[#ececec]' : 'bg-white text-[#212121]'} transition-colors duration-150`}>
      
      {/* Sidebar - Skinned with ChatGPT colors */}
      <aside className={`w-64 ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} flex flex-col border-r shrink-0`}>
        <div className="p-6 border-b border-slate-700/10 flex items-center space-x-3">
          <Compass className="h-6 w-6 text-[#10a37f]" />
          <span className="font-bold text-lg tracking-tight">Intelligence Hub</span>
        </div>

        {/* Sidebar Nav (Customized based on User Roles) */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          
          {/* Dashboard Tab (Common) */}
          <button
            onClick={() => { setCurrentTab('dashboard'); clearMessages(); }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'dashboard' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
          >
            <Layers className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          {/* 1. RESEARCHER SIDEBAR */}
          {userRole === 'RESEARCHER' && (
            <>
              <button
                onClick={() => { setCurrentTab('profile'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'profile' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <User className="h-4 w-4" />
                <span>Research Profile</span>
              </button>
              <button
                onClick={() => { setCurrentTab('funding'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'funding' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Award className="h-4 w-4" />
                <span>Funding Opportunities</span>
              </button>
              <button
                onClick={() => { setCurrentTab('trends'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'trends' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Research Trends</span>
              </button>
              <button
                onClick={() => { setCurrentTab('patents'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'patents' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Patent Intelligence</span>
              </button>
              <button
                onClick={() => { setCurrentTab('scorer'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'scorer' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Cpu className="h-4 w-4" />
                <span>Innovation Score</span>
              </button>
              <button
                onClick={() => { setCurrentTab('commercialization'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'commercialization' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Globe className="h-4 w-4" />
                <span>Commercialization</span>
              </button>
            </>
          )}

          {/* 2. STARTUP FOUNDER SIDEBAR */}
          {userRole === 'STARTUP_FOUNDER' && (
            <>
              <button
                onClick={() => { setCurrentTab('profile'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'profile' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <User className="h-4 w-4" />
                <span>Startup Profile</span>
              </button>
              <button
                onClick={() => { setCurrentTab('funding'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'funding' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Award className="h-4 w-4" />
                <span>Funding Finder</span>
              </button>
              <button
                onClick={() => { setCurrentTab('trends'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'trends' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Tech Intelligence</span>
              </button>
              <button
                onClick={() => { setCurrentTab('patents'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'patents' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Patent Analysis</span>
              </button>
              <button
                onClick={() => { setCurrentTab('scorer'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'scorer' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Cpu className="h-4 w-4" />
                <span>Innovation Score</span>
              </button>
              <button
                onClick={() => { setCurrentTab('commercialization'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'commercialization' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Globe className="h-4 w-4" />
                <span>Commercialization</span>
              </button>
            </>
          )}

          {/* 3. INNOVATION MANAGER SIDEBAR */}
          {userRole === 'INNOVATION_MANAGER' && (
            <>
              <button
                onClick={() => { setCurrentTab('pipeline'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'pipeline' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <GitBranch className="h-4 w-4" />
                <span>Innovation Pipeline</span>
              </button>
              <button
                onClick={() => { setCurrentTab('portfolio'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'portfolio' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Layers className="h-4 w-4" />
                <span>Portfolio Overview</span>
              </button>
              <button
                onClick={() => { setCurrentTab('funding_analytics'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'funding_analytics' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <DollarSign className="h-4 w-4" />
                <span>Funding Analytics</span>
              </button>
              <button
                onClick={() => { setCurrentTab('trends'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'trends' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Tech Intelligence</span>
              </button>
            </>
          )}

          {/* 4. ADMINISTRATOR SIDEBAR */}
          {userRole === 'ADMINISTRATOR' && (
            <>
              <button
                onClick={() => { setCurrentTab('admin_users'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'admin_users' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </button>
              <button
                onClick={() => { setCurrentTab('admin_data'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'admin_data' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Layers className="h-4 w-4" />
                <span>Data Management</span>
              </button>
              <button
                onClick={() => { setCurrentTab('admin_monitoring'); clearMessages(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'admin_monitoring' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
              >
                <Activity className="h-4 w-4" />
                <span>Recommendation Engines</span>
              </button>
            </>
          )}

          {/* Common Notification Bell tab link */}
          <button
            onClick={() => { setCurrentTab('alerts'); clearMessages(); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'alerts' ? 'bg-[#10a37f] text-white' : 'hover:bg-slate-700/10'}`}
          >
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4" />
              <span>Alert Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-700/15 flex items-center justify-between text-sm">
          <div className="truncate pr-2">
            <p className="font-semibold truncate">{userEmail}</p>
            <span className="text-xs text-slate-400 capitalize">{userRole.replace('_', ' ').toLowerCase()}</span>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="text-slate-400 hover:text-[#10a37f] p-2 rounded-lg hover:bg-slate-700/10 cursor-pointer animate-pulse"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        
        {/* Navigation Header */}
        <header className={`h-16 shrink-0 flex items-center justify-between px-8 border-b ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} transition-colors duration-150`}>
          <div className="flex items-center space-x-4 flex-1 max-w-lg">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search grants, topics, patents..."
                className={`block w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-[#2f2f2f]' : 'hover:bg-slate-200'} text-[#10a37f]`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setCurrentTab('alerts')}
              className="relative p-2 text-slate-400 hover:text-slate-500"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
              )}
            </button>

            <div className="h-8 w-px bg-slate-700/10"></div>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-[#10a37f] text-white flex items-center justify-center font-bold text-sm border border-slate-700/10">
                {firstName ? `${firstName[0]}${lastName[0]}` : 'U'}
              </div>
              <span className="text-sm font-semibold truncate max-w-[120px]">
                {firstName ? `${firstName} ${lastName}` : 'User Profile'}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Status Message Banners */}
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-600 p-4 text-rose-800 dark:text-rose-200 text-sm rounded-md shadow-sm flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="text-rose-500 font-bold px-2">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-[#10a37f] p-4 text-[#10a37f] dark:text-emerald-200 text-sm rounded-md shadow-sm flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="text-[#10a37f] font-bold px-2">✕</button>
            </div>
          )}

          {/* TAB: GENERAL OVERVIEW (ROLE-SPECIFIC ROOT DASHBOARD) */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Profile setup missing alert banner */}
              {!profile && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200">Research portfolio is incomplete</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        Please construct your domains and interests setup to calibrate the matching recommendation algorithm.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className="bg-[#10a37f] hover:bg-[#0e8f6e] text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    Configure Profile
                  </button>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* A. RESEARCHER DASHBOARD OVERVIEW */}
              {userRole === 'RESEARCHER' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Innovation Score</span>
                      <p className="text-3xl font-extrabold mt-2 text-[#10a37f]">82.5</p>
                      <p className="text-xs text-slate-400 mt-1">Weighted indices</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Funding Match %</span>
                      <p className="text-3xl font-extrabold mt-2 text-emerald-500">76%</p>
                      <p className="text-xs text-slate-400 mt-1">Avg eligibility score</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Publications</span>
                      <p className="text-3xl font-extrabold mt-2">{profile?.publications?.length || 0}</p>
                      <p className="text-xs text-slate-400 mt-1">Academic papers linked</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Citations</span>
                      <p className="text-3xl font-extrabold mt-2">12</p>
                      <p className="text-xs text-slate-400 mt-1">Total paper impacts</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Patents</span>
                      <p className="text-3xl font-extrabold mt-2">{profile?.patents?.length || 0}</p>
                      <p className="text-xs text-slate-400 mt-1">Intellectual Properties</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Opportunities */}
                    <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <div className="flex justify-between items-center mb-4 border-b border-slate-700/10 pb-3">
                        <h3 className="text-base font-bold">Matched Opportunities</h3>
                        <button onClick={() => setCurrentTab('funding')} className="text-xs text-[#10a37f] hover:underline cursor-pointer">View All</button>
                      </div>
                      <div className="space-y-3">
                        {grants.slice(0, 3).map((grant, i) => (
                          <div key={i} className={`p-3 border ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-slate-100'} rounded-xl transition-all flex justify-between items-center`}>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{grant.funder}</span>
                              <h4 className="font-semibold text-sm mt-1">{grant.title}</h4>
                              <p className="text-xs text-slate-455 mt-0.5">Amount: {grant.amount} | Deadline: {grant.deadline}</p>
                            </div>
                            <span className="text-xs font-bold bg-slate-900 text-[#10a37f] border border-[#10a37f]/20 px-2 py-0.5 rounded">{grant.match_score}% Match</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Advisor panel */}
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <h3 className="text-base font-bold mb-4 border-b border-slate-700/10 pb-3">Academic Recommendations</h3>
                      <div className="space-y-4 text-xs">
                        <div className={`p-3 ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-[#ffffff] border border-[#e5e5e5]'} rounded-xl`}>
                          <p className="font-bold text-slate-400">Potential Collaborator</p>
                          <p className="mt-1 font-semibold">Dr. Sarah Jenkins (QKD Security)</p>
                        </div>
                        <div className={`p-3 ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-[#ffffff] border border-[#e5e5e5]'} rounded-xl`}>
                          <p className="font-bold text-slate-400">Emerging Research Target</p>
                          <p className="mt-1 font-semibold">Event-Driven Neuromorphic Arrays</p>
                        </div>
                        <div className={`p-3 ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-[#ffffff] border border-[#e5e5e5]'} rounded-xl`}>
                          <p className="font-bold text-slate-400">Suggested Patent White Space</p>
                          <p className="mt-1 font-semibold">Solid-State Lithium Anode Interfaces</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* B. STARTUP FOUNDER DASHBOARD OVERVIEW */}
              {userRole === 'STARTUP_FOUNDER' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Innovation Score</span>
                      <p className="text-3xl font-extrabold mt-2 text-[#10a37f]">74.2</p>
                      <p className="text-xs text-slate-400 mt-1">Novelty & IP index</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Technology TRL</span>
                      <p className="text-3xl font-extrabold mt-2 text-purple-500">TRL-6</p>
                      <p className="text-xs text-slate-400 mt-1">System prototyping</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Funding Leads</span>
                      <p className="text-3xl font-extrabold mt-2 text-emerald-500">24</p>
                      <p className="text-xs text-slate-400 mt-1">Accelerator options</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Patent Risk</span>
                      <p className="text-3xl font-extrabold mt-2 text-rose-500">Low</p>
                      <p className="text-xs text-slate-400 mt-1">Infringement indicators</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Market potential</span>
                      <p className="text-3xl font-extrabold mt-2">High</p>
                      <p className="text-xs text-slate-400 mt-1">Commercial runway</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Startup Funding Schemes */}
                    <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <h3 className="text-base font-bold mb-4 border-b border-slate-700/10 pb-3">Accelerators & Government Schemes</h3>
                      <div className="space-y-3">
                        <div className={`p-3 border ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-slate-100'} rounded-xl transition-all flex justify-between items-center text-xs`}>
                          <div>
                            <p className="font-bold">SBIR Phase I Funding</p>
                            <p className="text-slate-450 mt-0.5">Focus: High-impact deep technology prototype trials</p>
                          </div>
                          <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 px-2 py-0.5 rounded font-bold">85% Match</span>
                        </div>
                        <div className={`p-3 border ${theme === 'dark' ? 'border-[#2d2d2d] hover:bg-[#2f2f2f]' : 'border-[#e5e5e5] hover:bg-slate-100'} rounded-xl transition-all flex justify-between items-center text-xs`}>
                          <div>
                            <p className="font-bold">NSF Convergence Accelerator</p>
                            <p className="text-slate-455 mt-0.5">Focus: Multi-disciplinary translational research projects</p>
                          </div>
                          <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 px-2 py-0.5 rounded font-bold">78% Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Commercialization Advice */}
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <h3 className="text-base font-bold mb-4 border-b border-slate-700/10 pb-3">AI Commercial Strategy</h3>
                      <div className="space-y-3 text-xs">
                        <div className={`p-3 ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-[#ffffff] border border-[#e5e5e5]'} rounded-xl`}>
                          <p className="font-bold">Market Entry Pathway</p>
                          <p className="text-slate-450 mt-1">TRL-6 prototype suggests target licensing or pilot partnership with defense contractors.</p>
                        </div>
                        <div className={`p-3 ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-[#ffffff] border border-[#e5e5e5]'} rounded-xl`}>
                          <p className="font-bold">Recommended IP Action</p>
                          <p className="text-slate-455 mt-1">File utility claim mapping to event-triggered classification algorithms before testing public beta.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* C. INNOVATION MANAGER DASHBOARD OVERVIEW */}
              {userRole === 'INNOVATION_MANAGER' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Pipeline Projects</span>
                      <p className="text-3xl font-extrabold mt-2 text-[#10a37f]">{projects.length}</p>
                      <p className="text-xs text-slate-400 mt-1">Tracked innovation pipelines</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Researchers</span>
                      <p className="text-3xl font-extrabold mt-2 text-purple-500">12</p>
                      <p className="text-xs text-slate-400 mt-1">Academic investigators</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Funding Received</span>
                      <p className="text-3xl font-extrabold mt-2 text-[#10a37f]">$4.53M</p>
                      <p className="text-xs text-slate-400 mt-1">Total external grants capital</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Portfolio Score</span>
                      <p className="text-3xl font-extrabold mt-2">76.8</p>
                      <p className="text-xs text-slate-400 mt-1">Avg novelty/patent strength</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Commercial Ready</span>
                      <p className="text-3xl font-extrabold mt-2">1</p>
                      <p className="text-xs text-slate-400 mt-1">Validation/Commercial phase</p>
                    </div>
                  </div>

                  {/* Portfolio Pipeline Visualization */}
                  <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                    <h3 className="text-base font-bold mb-6 border-b border-slate-700/10 pb-3">Innovation Pipeline Flow</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {['IDEA', 'RESEARCH', 'PROTOTYPE', 'VALIDATION', 'COMMERCIALIZATION'].map((stage, sIdx) => {
                        const stageProjects = projects.filter(p => p.pipeline_stage === stage);
                        return (
                          <div key={sIdx} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#212121] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-extrabold text-slate-400">{stage}</span>
                              <span className="bg-[#10a37f] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{stageProjects.length}</span>
                            </div>
                            <div className="space-y-2">
                              {stageProjects.map((p, pIdx) => (
                                <div key={pIdx} className={`p-2 rounded-lg text-xs ${theme === 'dark' ? 'bg-[#171717] border border-[#2d2d2d]' : 'bg-[#ffffff] border border-[#e5e5e5]'}`}>
                                  <p className="font-bold line-clamp-1">{p.title}</p>
                                  <p className="text-[10px] text-slate-450 mt-0.5">Leader: {p.team_leader}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* D. ADMINISTRATOR DASHBOARD OVERVIEW */}
              {userRole === 'ADMINISTRATOR' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total platform users</span>
                      <p className="text-3xl font-extrabold mt-2 text-[#10a37f]">{adminUsersList.length}</p>
                      <p className="text-xs text-slate-400 mt-1">Registered email profiles</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Sessions</span>
                      <p className="text-3xl font-extrabold mt-2 text-purple-500">
                        {adminStats?.platform_activity?.active_sessions || 0}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Simultaneous JWT authentications</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Funding Searches</span>
                      <p className="text-3xl font-extrabold mt-2 text-[#10a37f]">
                        {adminStats?.platform_activity?.funding_searches || 0}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Smart recommendation queries</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Patent Searches</span>
                      <p className="text-3xl font-extrabold mt-2">
                        {adminStats?.platform_activity?.patent_searches || 0}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Landscape classifications</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Research Queries</span>
                      <p className="text-3xl font-extrabold mt-2">
                        {adminStats?.platform_activity?.research_searches || 0}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Timeline fetches</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Platform analytics stats */}
                    <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <h3 className="text-base font-bold mb-4 border-b border-slate-700/10 pb-3">User Role Distributions</h3>
                      {adminStats && (
                        <div className="space-y-4 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Researchers</span>
                            <div className="flex items-center space-x-3 w-2/3">
                              <div className="w-full bg-slate-800 h-2.5 rounded-full">
                                <div className="bg-[#10a37f] h-full rounded-full" style={{ width: `${(adminStats.user_stats.researchers / adminStats.user_stats.total_users) * 100}%` }}></div>
                              </div>
                              <span className="font-semibold text-slate-[#10a37f]">{adminStats.user_stats.researchers}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Startup Founders</span>
                            <div className="flex items-center space-x-3 w-2/3">
                              <div className="w-full bg-slate-800 h-2.5 rounded-full">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(adminStats.user_stats.innovation_managers / adminStats.user_stats.total_users) * 100}%` }}></div>
                              </div>
                              <span className="font-semibold">{adminStats.user_stats.innovation_managers}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Activity Feed */}
                    <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                      <h3 className="text-base font-bold mb-4 border-b border-slate-700/10 pb-3">System Activity Feed</h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>User signup: researcher@univ.edu</span>
                          <span>2m ago</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Profile update: Archana Gurusamy</span>
                          <span>12m ago</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Patent class G06N query</span>
                          <span>24m ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: ACADEMIC PROFILE / PORTFOLIO EDITOR */}
          {currentTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              
              {/* Edit Portfolio Bio */}
              <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3 mb-6">
                  {userRole === 'STARTUP_FOUNDER' ? 'Edit Startup Profile Bio' : 'Edit Academic Portfolio Bio'}
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Associated Organization</label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                      placeholder="University or Enterprise Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Biography & Focus Summary</label>
                    <textarea
                      value={biography}
                      onChange={(e) => setBiography(e.target.value)}
                      rows={3}
                      className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                      placeholder="Bio, research objectives..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Academic Credentials History</label>
                      <input
                        type="text"
                        value={academicHistory}
                        onChange={(e) => setAcademicHistory(e.target.value)}
                        className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                        placeholder="PhD in Quantum Computing (Stanford University)"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Research History & Background</label>
                      <input
                        type="text"
                        value={researchHistory}
                        onChange={(e) => setResearchHistory(e.target.value)}
                        className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                        placeholder="Postdoctoral Fellow (MIT Security Labs)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Research Domains (Comma-separated)</label>
                    <input
                      type="text"
                      value={domainsInput}
                      onChange={(e) => setDomainsInput(e.target.value)}
                      className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                      placeholder="Computer Science, Quantum Physics"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Profile Matching Keywords (Comma-separated)</label>
                    <input
                      type="text"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                      placeholder="QKD, cryptography, photonics"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Technology Application Areas (Comma-separated)</label>
                    <input
                      type="text"
                      value={techAreasInput}
                      onChange={(e) => setTechAreasInput(e.target.value)}
                      className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                      placeholder="Network Security, Financial Encryption"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#10a37f] hover:bg-[#0e8f6e] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    Save Profile Credentials
                  </button>
                </form>
              </div>

              {/* Researcher academic resume sidebar details */}
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4 flex items-center justify-between">
                    <span>Linked Resume Details</span>
                    <Info className="h-4 w-4 text-[#10a37f]" />
                  </h3>
                  {profile ? (
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider block">Academic History</span>
                        <p className="mt-1 font-semibold">{profile.academic_history || 'No credentials history provided.'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider block">Research History</span>
                        <p className="mt-1 font-semibold">{profile.research_history || 'No research background history provided.'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Complete bio to link records.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB: FUNDING OPPORTUNITIES / DISCOVERY */}
          {currentTab === 'funding' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Search & filters */}
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} flex flex-col md:flex-row md:items-end gap-6`}>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-2">
                    <Search className="h-3 w-3" />
                    <span>Search Funder</span>
                  </label>
                  <input
                    type="text"
                    value={funderFilter}
                    onChange={(e) => setFunderFilter(e.target.value)}
                    className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-[#212121]'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                    placeholder="NSF, NIH, DoD, Venture Capital..."
                  />
                </div>
                
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-400 tracking-wider">
                    <span>Min Eligibility Match</span>
                    <span className="text-[#10a37f] font-extrabold">{matchScoreThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={matchScoreThreshold}
                    onChange={(e) => setMatchScoreThreshold(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#2f2f2f] rounded-lg appearance-none cursor-pointer accent-[#10a37f]"
                  />
                </div>

                <button
                  onClick={() => { setFunderFilter(''); setMatchScoreThreshold(0); }}
                  className={`border ${theme === 'dark' ? 'border-[#2d2d2d] hover:border-[#2f2f2f] text-slate-350' : 'border-[#e5e5e5] hover:border-slate-400 text-slate-700'} px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer`}
                >
                  Reset Filters
                </button>
              </div>

              {/* Results table */}
              <div className={`rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} overflow-hidden`}>
                {filteredGrants.length > 0 ? (
                  <div className="divide-y divide-slate-800/40">
                    {filteredGrants.map((grant) => (
                      <div key={grant.grant_id} className="p-6 transition-all hover:bg-slate-700/5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold uppercase text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md">
                                {grant.funder}
                              </span>
                              <span className="text-xs text-slate-500 font-semibold">Ref ID: {grant.grant_id}</span>
                            </div>
                            <h3 className="text-lg font-bold">{grant.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2">{grant.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 pt-2">
                              <div>Funding Capital: <span className={`${theme==='dark'?'text-white':'text-slate-900'} font-bold`}>{grant.amount}</span></div>
                              <div>Deadline Target: <span className={`${theme==='dark'?'text-white':'text-slate-900'} font-bold`}>{grant.deadline}</span></div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 space-y-2">
                            <span className="text-xs font-bold bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 px-2.5 py-1 rounded-full">
                              {grant.match_score}% Match
                            </span>
                            <button
                              onClick={() => setExpandedOpportunityId(expandedOpportunityId === grant.grant_id ? null : grant.grant_id)}
                              className="text-xs text-[#10a37f] hover:underline font-semibold cursor-pointer"
                            >
                              {expandedOpportunityId === grant.grant_id ? 'Hide Match Details' : 'Smart Analysis'}
                            </button>
                          </div>
                        </div>

                        {/* Diagnostics Panel */}
                        {expandedOpportunityId === grant.grant_id && (
                          <div className="mt-4 p-4 bg-[#2f2f2f]/30 border border-[#2d2d2d] rounded-xl space-y-3 text-sm animate-fadeIn">
                            <h4 className="font-bold">Matching Analysis Breakdown</h4>
                            <p className="text-slate-450 italic">"{grant.match_rationale}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 p-6">
                    <Award className="h-12 w-12 mx-auto text-slate-700" />
                    <p className="mt-4 text-base font-semibold">No opportunities match search terms.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RESEARCH TRENDS (INTEL ENGINE) */}
          {currentTab === 'trends' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Topics lists and trend forecasting */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Emerging technology detection */}
                <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} lg:col-span-2`}>
                  <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-[#10a37f]" />
                    <span>Emerging Research Hotspots</span>
                  </h3>
                  <div className="space-y-4">
                    {trendingTopics.slice(0, 5).map((topic, index) => (
                      <div key={index} className={`flex justify-between items-center p-3 border ${theme==='dark'?'border-[#2d2d2d]':'border-[#e5e5e5]'} rounded-xl`}>
                        <div>
                          <h4 className="font-bold text-sm">{topic.name}</h4>
                          <span className="text-xs text-slate-400">Activity volume: {topic.count} publications</span>
                        </div>
                        <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 font-bold text-xs px-2.5 py-1 rounded">
                          +{topic.velocity}% growth velocity
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Network nodes suggestions */}
                <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4">Top Field Investigators</h3>
                  <div className="space-y-3">
                    {collaborators.map((collab, index) => (
                      <div key={index} className={`p-3 border ${theme==='dark'?'border-[#2d2d2d]':'border-[#e5e5e5]'} rounded-xl`}>
                        <p className="font-bold text-sm">{collab.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{collab.publication_count} papers | {collab.domains.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line chart timeline of publications */}
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-base font-bold mb-6 border-b border-slate-850 pb-3">Publication Trends Over Time</h3>
                <div className="h-48 relative flex items-center justify-center">
                  <svg viewBox="0 0 500 200" className="w-full h-full max-w-xl">
                    <line x1="50" y1="20" x2="450" y2="20" stroke={theme==='dark'?'#2d2d2d':'#e5e5e5'} strokeWidth="0.5" />
                    <line x1="50" y1="80" x2="450" y2="80" stroke={theme==='dark'?'#2d2d2d':'#e5e5e5'} strokeWidth="0.5" />
                    <line x1="50" y1="140" x2="450" y2="140" stroke={theme==='dark'?'#2d2d2d':'#e5e5e5'} strokeWidth="0.5" />
                    <line x1="50" y1="180" x2="450" y2="180" stroke={theme==='dark'?'#4b5563':'#9ca3af'} strokeWidth="1" />
                    
                    {/* Curve representing timeline */}
                    <path
                      d="M 100 130 C 200 120, 300 40, 400 30"
                      fill="none"
                      stroke="#10a37f"
                      strokeWidth="3.5"
                    />
                    
                    <circle cx="100" cy="130" r="5" fill="#10a37f" />
                    <circle cx="400" cy="30" r="5" fill="#10a37f" />
                    
                    <text x="100" y="195" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="bold">2025</text>
                    <text x="400" y="195" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="bold">2026</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PATENT INTELLIGENCE */}
          {currentTab === 'patents' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Landscape list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4">Competitor Patent Distributions</h3>
                  <div className="space-y-4">
                    {patentLandscape.map((pat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{pat.category} ({pat.class_code})</span>
                          <span>{pat.patent_count} patents ({pat.percentage}%)</span>
                        </div>
                        <div className="w-full bg-[#2f2f2f] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#10a37f] h-full rounded-full" style={{ width: `${pat.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4">Patent White Space Analysis</h3>
                    <p className="text-xs text-slate-400">
                      Our system detected low patent filing density in event-driven optical synaptic triggers. Target research resources here for highest novelty rankings.
                    </p>
                  </div>
                  <div className="bg-[#2f2f2f]/30 p-3 rounded-xl border border-[#2d2d2d] mt-4 text-xs">
                    <span className="font-bold text-[#10a37f] uppercase tracking-wider">Opportunity Map</span>
                    <p className="mt-1 text-slate-350">TRL range 3-5 suggests early technology transfer agreements are optimal.</p>
                  </div>
                </div>
              </div>

              {/* Patent Heatmap grid visualization */}
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-base font-bold mb-6 border-b border-slate-850 pb-3">Patent Technology Clusters Density Map</h3>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: 40 }).map((_, idx) => {
                    const intensity = Math.round(Math.sin(idx) * 3 + 4); // mock intensity
                    return (
                      <div 
                        key={idx}
                        title={`Cluster ${idx + 1}: ${intensity * 4} active competitors`}
                        className={`h-12 rounded-lg border ${theme==='dark'?'border-[#2d2d2d]':'border-[#e5e5e5]'} flex items-center justify-center font-bold text-xs ${intensity > 5 ? 'bg-[#10a37f] text-white' : intensity > 3 ? 'bg-[#10a37f]/20 text-[#10a37f]' : 'bg-[#2f2f2f]/10 text-slate-400'}`}
                      >
                        C{idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB: WEIGHTED INNOVATION SCORING ENGINE */}
          {currentTab === 'scorer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              
              {/* Parameter Adjustments panel */}
              <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} space-y-6`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3">Weighted Innovation Scoring Parameters</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Research Novelty (Weight 30%)</span>
                      <span className="text-[#10a37f] font-bold">{scoringNovelty}/100</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={scoringNovelty} 
                      onChange={(e) => setScoringNovelty(parseInt(e.target.value))} 
                      className="w-full h-2 bg-[#2f2f2f] rounded-lg appearance-none cursor-pointer accent-[#10a37f]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Patent Strength (Weight 20%)</span>
                      <span className="text-[#10a37f] font-bold">{scoringPatentStrength}/100</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={scoringPatentStrength} 
                      onChange={(e) => setScoringPatentStrength(parseInt(e.target.value))} 
                      className="w-full h-2 bg-[#2f2f2f] rounded-lg appearance-none cursor-pointer accent-[#10a37f]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Technology Maturity (Weight 15%)</span>
                      <span className="text-[#10a37f] font-bold">{scoringMaturity}/100</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={scoringMaturity} 
                      onChange={(e) => setScoringMaturity(parseInt(e.target.value))} 
                      className="w-full h-2 bg-[#2f2f2f] rounded-lg appearance-none cursor-pointer accent-[#10a37f]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Market Potential (Weight 20%)</span>
                      <span className="text-[#10a37f] font-bold">{scoringMarketPotential}/100</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={scoringMarketPotential} 
                      onChange={(e) => setScoringMarketPotential(parseInt(e.target.value))} 
                      className="w-full h-2 bg-[#2f2f2f] rounded-lg appearance-none cursor-pointer accent-[#10a37f]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Funding Relevance (Weight 15%)</span>
                      <span className="text-[#10a37f] font-bold">{scoringRelevance}/100</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={scoringRelevance} 
                      onChange={(e) => setScoringRelevance(parseInt(e.target.value))} 
                      className="w-full h-2 bg-[#2f2f2f] rounded-lg appearance-none cursor-pointer accent-[#10a37f]"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Radar/Result Panel */}
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} flex flex-col justify-between`}>
                <div>
                  <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4">Innovation Score Card</h3>
                  
                  {/* Interactive SVG Radar polygon representing 5 fields */}
                  <div className="h-40 flex items-center justify-center relative">
                    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[160px]">
                      {/* Grid polygons */}
                      <polygon points="100,20 180,80 150,160 50,160 20,80" fill="none" stroke={theme==='dark'?'#2d2d2d':'#e5e5e5'} strokeWidth="0.5" />
                      <polygon points="100,50 150,90 130,140 70,140 50,90" fill="none" stroke={theme==='dark'?'#2d2d2d':'#e5e5e5'} strokeWidth="0.5" />
                      
                      {/* Computed dynamic polygon representing values */}
                      <polygon
                        points={`
                          100,${100 - (scoringNovelty * 0.8)} 
                          ${100 + (scoringPatentStrength * 0.8)},${100 - (scoringPatentStrength * 0.2)} 
                          ${100 + (scoringMaturity * 0.5)},${100 + (scoringMaturity * 0.6)} 
                          ${100 - (scoringMarketPotential * 0.5)},${100 + (scoringMarketPotential * 0.6)} 
                          ${100 - (scoringRelevance * 0.8)},${100 - (scoringRelevance * 0.2)}
                        `}
                        fill="rgba(16, 163, 127, 0.2)"
                        stroke="#10a37f"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>

                  <div className="text-center mt-4">
                    <span className="text-xs uppercase font-extrabold text-[#b4b4b4] tracking-wider">Weighted Overall Score</span>
                    <p className="text-4xl font-extrabold text-[#10a37f] mt-1">{computedScore}/100</p>
                  </div>
                </div>

                <div className="border-t border-[#2d2d2d] pt-4 text-xs text-slate-400 text-center">
                  Values represent weighted novelty indices
                </div>
              </div>

            </div>
          )}

          {/* TAB: COMMERCIALIZATION RECOMMENDATIONS */}
          {currentTab === 'commercialization' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3 mb-6">AI Commercialization Guidelines</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/30':'border-[#e5e5e5] bg-slate-50'} rounded-xl space-y-2`}>
                    <span className="text-xs font-bold uppercase text-[#10a37f]">Productization Pathways</span>
                    <p className="text-sm">Recommend event-triggered photon arrays calibration as a software framework model before silicon taping validation cycles.</p>
                  </div>
                  <div className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/30':'border-[#e5e5e5] bg-slate-50'} rounded-xl space-y-2`}>
                    <span className="text-xs font-bold uppercase text-purple-400">Licensing Targets</span>
                    <p className="text-sm">High patent utility score (70+) suggests direct fit for global semiconductor enterprise licensing agreements.</p>
                  </div>
                  <div className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/30':'border-[#e5e5e5] bg-slate-50'} rounded-xl space-y-2`}>
                    <span className="text-xs font-bold uppercase text-blue-400">Spin-Out Capital</span>
                    <p className="text-sm">TRL 6+ prototype validation matches Seed Venture Capital criteria. Search for strategic defense accelerators.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INNOVATION PIPELINE & PORTFOLIO (INNOVATION MANAGER) */}
          {currentTab === 'pipeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              
              {/* Projects List with Pipeline shift controls */}
              <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3 mb-6">Pipeline Projects List</h3>
                <div className="space-y-4">
                  {projects.map((p) => (
                    <div key={p.id} className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/10':'border-[#e5e5e5] bg-[#ffffff]'} rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm`}>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-base">{p.title}</h4>
                          <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 text-[10px] px-2 py-0.5 rounded uppercase font-extrabold">{p.pipeline_stage}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                        <p className="text-xs font-semibold mt-2">Leader: {p.team_leader} | Funding Received: ${p.funding_received.toLocaleString()}</p>
                      </div>
                      
                      {/* Shift controls */}
                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        <select
                          value={p.pipeline_stage}
                          onChange={(e) => handleUpdateProjectStage(p.id, e.target.value)}
                          className={`px-2 py-1 border ${theme==='dark'?'bg-[#2f2f2f] border-[#2d2d2d] text-white':'bg-white border-[#e5e5e5] text-[#212121]'} rounded text-xs focus:outline-none`}
                        >
                          <option value="IDEA">Idea</option>
                          <option value="RESEARCH">Research</option>
                          <option value="PROTOTYPE">Prototype</option>
                          <option value="VALIDATION">Validation</option>
                          <option value="COMMERCIALIZATION">Commercialization</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Project Form */}
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4">Add Project to Pipeline</h3>
                <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                  <input
                    type="text" required placeholder="Project Title"
                    value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)}
                    className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-slate-900'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                  />
                  <textarea
                    required placeholder="Description" rows={3}
                    value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)}
                    className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-slate-900'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                  />
                  <input
                    type="text" required placeholder="Team Leader Name"
                    value={newProjectLeader} onChange={(e) => setNewProjectLeader(e.target.value)}
                    className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-slate-900'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number" required placeholder="Funding Amount"
                      value={newProjectFunding} onChange={(e) => setNewProjectFunding(parseInt(e.target.value))}
                      className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-slate-900'} rounded-lg focus:outline-none`}
                    />
                    <select
                      value={newProjectStage} onChange={(e) => setNewProjectStage(e.target.value)}
                      className={`px-2 py-1 border ${theme==='dark'?'bg-[#2f2f2f] border-[#2d2d2d] text-white':'bg-white border-[#e5e5e5] text-slate-900'} rounded text-xs`}
                    >
                      <option value="IDEA">Idea</option>
                      <option value="RESEARCH">Research</option>
                      <option value="PROTOTYPE">Prototype</option>
                      <option value="VALIDATION">Validation</option>
                      <option value="COMMERCIALIZATION">Commercialization</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#10a37f] hover:bg-[#0e8f6e] text-white font-semibold py-2 rounded-lg cursor-pointer"
                  >
                    Add Project
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB: PORTFOLIO OVERVIEW */}
          {currentTab === 'portfolio' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3 mb-6">Innovation Portfolio Status</h3>
                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div key={proj.id} className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/10':'border-[#e5e5e5] bg-white'} rounded-xl flex justify-between items-center text-xs shadow-sm`}>
                      <div>
                        <h4 className="font-bold text-sm">{proj.title}</h4>
                        <p className="text-slate-400 mt-1">Leader: {proj.team_leader} | Capital: ${proj.funding_received.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 px-2.5 py-1 rounded font-bold">Innovation Score: {proj.innovation_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FUNDING ANALYTICS (INNOVATION MANAGER) */}
          {currentTab === 'funding_analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Distribution Chart */}
                <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                  <h3 className="text-base font-bold mb-6 border-b border-slate-850 pb-3">Portfolio Capital Distribution</h3>
                  <div className="space-y-4">
                    {projects.map((p, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{p.title}</span>
                          <span>${p.funding_received.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-[#2f2f2f] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#10a37f] h-full rounded-full" style={{ width: `${(p.funding_received / 4500000) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics breakdown */}
                <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-base font-bold mb-4 border-b border-slate-850 pb-3">Funding Performance Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Portfolio Allocation</span>
                        <span className="font-bold">$4,530,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Project Runway Capital</span>
                        <span className="font-bold">$1,132,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">External Grant Success Rate</span>
                        <span className="font-bold text-[#10a37f]">82.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADMIN - USER MANAGEMENT */}
          {currentTab === 'admin_users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              
              {/* User management table */}
              <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3 mb-6">User Registry Management</h3>
                <div className="space-y-4">
                  {adminUsersList.map((user) => (
                    <div key={user.id} className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/10':'border-[#e5e5e5] bg-[#ffffff]'} rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm`}>
                      <div>
                        <p className="font-bold text-sm">{user.email}</p>
                        <p className="text-slate-400 mt-1 uppercase font-semibold tracking-wider">Role: {user.role} | Active: {user.is_active ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAdminToggleUserStatus(user.id, user.is_active)}
                          className={`px-3 py-1 rounded border font-semibold ${user.is_active ? 'border-amber-600/40 text-amber-500 hover:bg-amber-900/10' : 'border-emerald-600/40 text-emerald-500 hover:bg-[#10a37f]/10'} cursor-pointer`}
                        >
                          {user.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleAdminDeleteUser(user.id)}
                          className="p-1 border border-rose-900/40 text-rose-500 hover:bg-rose-900/10 rounded cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add user form */}
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-base font-bold border-b border-slate-850 pb-3 mb-4">Register User Account</h3>
                <form onSubmit={handleAdminCreateUser} className="space-y-3 text-xs">
                  <input
                    type="email" required placeholder="User Email"
                    value={newAdminUserEmail} onChange={(e) => setNewAdminUserEmail(e.target.value)}
                    className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-slate-900'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                  />
                  <input
                    type="password" required placeholder="Password"
                    value={newAdminUserPass} onChange={(e) => setNewAdminUserPass(e.target.value)}
                    className={`block w-full px-3 py-2 border ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#2d2d2d] text-white' : 'bg-white border-[#e5e5e5] text-slate-900'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10a37f]`}
                  />
                  <select
                    value={newAdminUserRole} onChange={(e) => setNewAdminUserRole(e.target.value)}
                    className={`w-full px-2 py-2 border ${theme==='dark'?'bg-[#2f2f2f] border-[#2d2d2d] text-white':'bg-white border-[#e5e5e5] text-slate-900'} rounded`}
                  >
                    <option value="RESEARCHER">Researcher</option>
                    <option value="STARTUP_FOUNDER">Startup Founder</option>
                    <option value="INNOVATION_MANAGER">Innovation Manager</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-[#10a37f] hover:bg-[#0e8f6e] text-white font-semibold py-2 rounded-lg cursor-pointer"
                  >
                    Register User
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB: ADMIN - DATA MANAGEMENT */}
          {currentTab === 'admin_data' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3 mb-6">Manage System Datasets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/30':'border-[#e5e5e5] bg-slate-50'} rounded-xl text-xs`}>
                    <span className="font-bold text-[#10a37f]">Funding Sources</span>
                    <p className="text-slate-400 mt-2">Active sources: 150 records indexed from Government Grants & Accel schemes.</p>
                  </div>
                  <div className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/30':'border-[#e5e5e5] bg-slate-50'} rounded-xl text-xs`}>
                    <span className="font-bold text-purple-400">Research Publications</span>
                    <p className="text-slate-400 mt-2">Linked corpus: Semantic Scholar queries cache database.</p>
                  </div>
                  <div className={`p-4 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/30':'border-[#e5e5e5] bg-slate-50'} rounded-xl text-xs`}>
                    <span className="font-bold text-[#10a37f]">Patent Registries</span>
                    <p className="text-slate-400 mt-2">Active indices: 150 preprocessed USPTO utility patent entries.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADMIN - RECOMMENDATION MONITORING */}
          {currentTab === 'admin_monitoring' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'}`}>
                <h3 className="text-lg font-bold border-b border-slate-850 pb-3 mb-6">Recommendation & Scorer Monitoring</h3>
                
                <div className="space-y-4 text-xs">
                  <div className={`p-3 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/10':'border-[#e5e5e5] bg-white'} rounded-xl flex justify-between items-center`}>
                    <div>
                      <p className="font-bold text-slate-200">Funding Recommendations Engine</p>
                      <p className="text-slate-400 mt-0.5">Status: Operational | Match calculation latency: 12ms</p>
                    </div>
                    <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 px-2 py-0.5 rounded font-bold">Active</span>
                  </div>
                  
                  <div className={`p-3 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/10':'border-[#e5e5e5] bg-white'} rounded-xl flex justify-between items-center`}>
                    <div>
                      <p className="font-bold text-slate-200">Patent Landscape Classifier</p>
                      <p className="text-slate-400 mt-0.5">Status: Operational | Ingestion pipeline active</p>
                    </div>
                    <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 px-2 py-0.5 rounded font-bold">Active</span>
                  </div>

                  <div className={`p-3 border ${theme==='dark'?'border-[#2d2d2d] bg-[#2f2f2f]/10':'border-[#e5e5e5] bg-white'} rounded-xl flex justify-between items-center`}>
                    <div>
                      <p className="font-bold text-slate-200">Innovation Scoring Scorer</p>
                      <p className="text-slate-400 mt-0.5">Status: Operational | Weighted matrix calculation active</p>
                    </div>
                    <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/30 px-2 py-0.5 rounded font-bold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATION INBOX */}
          {currentTab === 'alerts' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#171717] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-[#e5e5e5]'} overflow-hidden`}>
                <div className="p-6 border-b border-slate-850 bg-slate-950/20 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Alert Warning Center</h3>
                  <span className="text-xs bg-slate-800 text-slate-200 font-bold px-2.5 py-1 rounded-full">
                    {unreadCount} unread warnings
                  </span>
                </div>

                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-800/40">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-6 flex items-start gap-4 transition-all ${notif.is_read ? 'opacity-50' : 'bg-slate-950/10 border-l-4 border-[#10a37f]'}`}
                      >
                        <div className="shrink-0 mt-1">
                          {notif.type === 'DEADLINE' ? (
                            <div className="p-2 bg-amber-955/20 text-amber-500 border border-amber-900 rounded-lg">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                          ) : notif.type === 'TECHNOLOGY' ? (
                            <div className="p-2 bg-blue-955/20 text-blue-500 border border-blue-900 rounded-lg">
                              <Cpu className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="p-2 bg-rose-955/20 text-rose-500 border border-rose-900 rounded-lg">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm">{notif.title}</h4>
                            <span className="text-xs text-slate-500 font-medium">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 pr-4">{notif.message}</p>
                          
                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkNotificationRead(notif.id)}
                              className={`mt-3 inline-flex items-center space-x-1 text-[10px] border ${theme === 'dark' ? 'border-[#2d2d2d] text-white bg-[#171717] hover:border-slate-700' : 'border-[#e5e5e5] text-slate-800 bg-slate-100 hover:border-slate-400'} px-3 py-1 rounded font-semibold transition-colors cursor-pointer`}
                            >
                              <Check className="h-3 w-3" />
                              <span>Mark as Read</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 p-6">
                    <Bell className="h-12 w-12 mx-auto text-slate-700" />
                    <p className="mt-4 text-base font-semibold">Inbox is empty.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
