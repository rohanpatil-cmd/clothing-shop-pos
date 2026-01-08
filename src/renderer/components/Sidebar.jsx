import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['manager', 'user'] },
        { id: 'invoices', label: 'New Invoice', icon: '➕', roles: ['manager', 'user'] },
        { id: 'sales-history', label: 'Sales History', icon: '🧾', roles: ['manager'] },
        { id: 'stock-procurement', label: 'Stock Procurement', icon: '🚚', roles: ['manager'] },
        { id: 'inventory', label: 'Inventory', icon: '📦', roles: ['manager'] },
        { id: 'customers', label: 'Customers', icon: '👥', roles: ['manager', 'user'] },
        { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['manager'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="w-64 bg-slate-900 h-screen text-white flex flex-col shadow-2xl overflow-hidden shrink-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-blue-400 text-2xl">👕</span>
                    Shop Manager
                </h1>
            </div>

            <div className="flex-1 mt-6 px-4 overflow-y-auto">
                {filteredItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${activeTab === item.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-4 bg-slate-800/50 m-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{user.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">{user.role}</div>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                    <span>🚪</span> Logout
                </button>
            </div>

            <div className="px-4 pb-6">
                <div className="bg-slate-950 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">System Status</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Connected Live</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
