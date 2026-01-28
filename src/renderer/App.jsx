import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesHistory from './pages/SalesHistory';
import Customers from './pages/Customers';
import PurchaseLedger from './pages/PurchaseLedger';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settings = await window.electron.getSettings();
      if (settings && settings.theme) {
        setTheme(settings.theme);
        applyTheme(settings.theme);
      }
    } catch (err) {
      console.error('Failed to load theme:', err);
    }
  };

  const applyTheme = (currentTheme) => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Re-load theme periodically or when switching tabs to ensure it's synced
  useEffect(() => {
    if (user) loadTheme();
  }, [activeTab, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'inventory':
        return <Inventory user={user} />;
      case 'invoices':
        return <Invoices />;
      case 'sales-history':
        return user.role === 'manager' ? <SalesHistory /> : <AccessDenied />;
      case 'stock-procurement':
        return user.role === 'manager' ? <PurchaseLedger /> : <AccessDenied />;
      case 'customers':
        return <Customers />;
      case 'settings':
        return user.role === 'manager' ? <Settings /> : <AccessDenied />;
      default:
        return (
          <div className="p-8 flex items-center justify-center h-full">
            <div className="text-center animate-in slide-in-from-top-4 duration-500">
              <h1 className="text-4xl font-black text-slate-300 uppercase tracking-widest">{activeTab}</h1>
              <p className="mt-4 text-slate-400 font-medium italic">Section under active development...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-white">
        {renderContent()}
      </main>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="text-9xl mb-8">🚫</div>
      <h1 className="text-4xl font-black text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 text-lg">You do not have permission to view this section.</p>
    </div>
  );
}

export default App;
