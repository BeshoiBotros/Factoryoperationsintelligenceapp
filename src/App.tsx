import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { RawMaterials } from './components/RawMaterials';
import { BOM } from './components/BOM';
import { ProductionOrders } from './components/ProductionOrders';
import { Inventory } from './components/Inventory';
import { DowntimeLog } from './components/DowntimeLog';
import { CostReports } from './components/CostReports';
import { Alerts } from './components/Alerts';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Menu, LogOut, Factory, Package, Boxes, FileText, ClipboardList, Warehouse, Clock, DollarSign, Bell } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'login' | 'signup' | 'app'>('login');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAccessToken(token);
        setView('app');
      } else {
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('access_token');
    }
  };

  const handleLogin = (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem('access_token', token);
    setView('app');
  };

  const handleSignup = (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem('access_token', token);
    setView('app');
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    setView('login');
    setCurrentScreen('dashboard');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">Factory Operations Intelligence</h1>
            <p className="text-gray-600">Manage production, inventory, and costs</p>
          </div>
          <Login 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setView('signup')} 
          />
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">Factory Operations Intelligence</h1>
            <p className="text-gray-600">Create your factory account</p>
          </div>
          <Signup 
            onSignup={handleSignup} 
            onSwitchToLogin={() => setView('login')} 
          />
        </div>
      </div>
    );
  }

  // Navigation items with role-based access
  const canAccess = (requiredRoles: string[]) => {
    return user && requiredRoles.includes(user.role);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Factory, roles: ['Owner', 'Plant Manager', 'Supervisor', 'Accountant'] },
    { id: 'products', label: 'Products', icon: Package, roles: ['Owner', 'Plant Manager'] },
    { id: 'raw-materials', label: 'Raw Materials', icon: Boxes, roles: ['Owner', 'Plant Manager'] },
    { id: 'bom', label: 'Bill of Materials', icon: FileText, roles: ['Owner', 'Plant Manager'] },
    { id: 'production', label: 'Production Orders', icon: ClipboardList, roles: ['Owner', 'Plant Manager', 'Supervisor'] },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, roles: ['Owner', 'Plant Manager', 'Supervisor', 'Accountant'] },
    { id: 'downtime', label: 'Downtime Log', icon: Clock, roles: ['Owner', 'Plant Manager', 'Supervisor'] },
    { id: 'cost-reports', label: 'Cost Reports', icon: DollarSign, roles: ['Owner', 'Plant Manager', 'Accountant'] },
    { id: 'alerts', label: 'Alerts', icon: Bell, roles: ['Owner', 'Plant Manager', 'Supervisor', 'Accountant'] }
  ];

  const visibleNavItems = navItems.filter(item => canAccess(item.roles));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Factory className="w-6 h-6" />
              <span>Factory OI</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-indigo-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {sidebarOpen && user && (
          <div className="p-4 border-b border-indigo-800">
            <p className="text-sm text-indigo-300">Logged in as</p>
            <p className="truncate">{user.name}</p>
            <p className="text-xs text-indigo-400">{user.role}</p>
          </div>
        )}

        <nav className="flex-1 p-4">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                  currentScreen === item.id 
                    ? 'bg-indigo-700 text-white' 
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {currentScreen === 'dashboard' && <Dashboard user={user} accessToken={accessToken} />}
          {currentScreen === 'products' && <Products user={user} accessToken={accessToken} />}
          {currentScreen === 'raw-materials' && <RawMaterials user={user} accessToken={accessToken} />}
          {currentScreen === 'bom' && <BOM user={user} accessToken={accessToken} />}
          {currentScreen === 'production' && <ProductionOrders user={user} accessToken={accessToken} />}
          {currentScreen === 'inventory' && <Inventory user={user} accessToken={accessToken} />}
          {currentScreen === 'downtime' && <DowntimeLog user={user} accessToken={accessToken} />}
          {currentScreen === 'cost-reports' && <CostReports user={user} accessToken={accessToken} />}
          {currentScreen === 'alerts' && <Alerts user={user} accessToken={accessToken} />}
        </div>
      </main>
    </div>
  );
}
