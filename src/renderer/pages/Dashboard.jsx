import React, { useState, useEffect } from 'react';

const Dashboard = ({ user }) => {
    const [stats, setStats] = useState({
        totalSales: 0,
        dailySales: 0,
        weeklySales: 0,
        monthlySales: 0,
        orderCount: 0,
        customerCount: 0,
        lowStockCount: 0,
        recentInvoices: []
    });
    const [loading, setLoading] = useState(true);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetType, setResetType] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    const isManager = user?.role === 'manager';

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await window.electron.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const confirmReset = async () => {
        setIsResetting(true);
        try {
            switch (resetType) {
                case 'sales': await window.electron.resetSales(); break;
                case 'customers': await window.electron.resetCustomers(); break;
                case 'inventory': await window.electron.resetInventory(); break;
                case 'stocks': await window.electron.resetStocks(); break;
                case 'all': await window.electron.resetAll(); break;
                default: break;
            }
            await loadStats();
            setShowResetModal(false);
            setResetType(null);
            alert('Reset successful!');
        } catch (err) {
            console.error('Reset failed:', err);
            alert('Failed to reset data.');
        } finally {
            setIsResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center animate-pulse">
                    <div className="text-4xl text-slate-300">📊 Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 animate-in fade-in duration-500">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        {isManager ? 'Executive Dashboard' : 'Staff Dashboard'}
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        {isManager ? 'Sales performance across different timeframes.' : 'Overview of today\'s shop activity.'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isManager && (
                        <button
                            onClick={() => setShowResetModal(true)}
                            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 flex items-center gap-2"
                        >
                            <span>⚠️</span> Reset Operations
                        </button>
                    )}
                    <div className="text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 italic">
                        Live Data Since Inception
                    </div>
                </div>
            </div>

            {/* Main Stats Row - Revenue Breakdown */}
            <div className={`grid grid-cols-1 ${isManager ? 'md:grid-cols-2 lg:grid-cols-4' : ''} gap-6 mb-10`}>
                <div className={`${isManager ? '' : 'col-span-full'} transition-transform hover:scale-[1.02]`}>
                    <div className={`bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-200 flex items-center justify-between border border-white/10 relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
                        <div className="relative z-10">
                            <div className="text-blue-100 text-sm font-black uppercase tracking-[0.2em] mb-3">Today's Sales Revenue</div>
                            <div className={`${isManager ? 'text-5xl' : 'text-7xl'} font-black tracking-tighter`}>₹{stats.dailySales.toLocaleString()}</div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Live Tracking</span>
                                <span className="text-blue-200 text-xs font-medium italic">Updated just now</span>
                            </div>
                        </div>
                        <div className={`${isManager ? 'text-6xl' : 'text-8xl'} relative z-10 drop-shadow-2xl filter transform transition-transform group-hover:rotate-12`}>
                            ☀️
                        </div>
                    </div>
                </div>

                {isManager && (
                    <>
                        <StatCard
                            label="Weekly (7D)"
                            value={`₹${stats.weeklySales.toLocaleString()}`}
                            icon="📅"
                            color="from-blue-400 to-indigo-600"
                            shadow="shadow-blue-200"
                        />
                        <StatCard
                            label="Monthly (30D)"
                            value={`₹${stats.monthlySales.toLocaleString()}`}
                            icon="📊"
                            color="from-purple-400 to-pink-600"
                            shadow="shadow-purple-200"
                        />
                        <StatCard
                            label="Yearly (365D)"
                            value={`₹${stats.yearlySales ? stats.yearlySales.toLocaleString() : '0'}`}
                            icon="🏛️"
                            color="from-orange-400 to-red-600"
                            shadow="shadow-orange-200"
                        />
                        <StatCard
                            label="Lifetime Revenue"
                            value={`₹${stats.totalSales.toLocaleString()}`}
                            icon="💎"
                            color="from-emerald-400 to-teal-600"
                            shadow="shadow-emerald-200"
                        />
                    </>
                )}
            </div>

            {/* Secondary Stats Row - Operational (Manager Only) */}
            {isManager && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-50 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">🧾</div>
                        <div>
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Orders</div>
                            <div className="text-2xl font-black text-slate-900">{stats.orderCount}</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-50 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold">👥</div>
                        <div>
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Customers</div>
                            <div className="text-2xl font-black text-slate-900">{stats.customerCount}</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-50 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl font-bold">🚨</div>
                        <div>
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Low Stock Items</div>
                            <div className="text-2xl font-black text-slate-900">{stats.lowStockCount}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`${isManager ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 overflow-hidden`}>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <span className="text-blue-500">⚡</span>
                        Recent Sales Feed
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Customer</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Method</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.recentInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-300 font-medium">No sales recorded yet.</td>
                                    </tr>
                                ) : (
                                    stats.recentInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">#INV-{inv.id}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{inv.customer_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {inv.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900">₹{inv.total_amount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isManager && (
                    <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3 relative z-10">
                            <span className="text-blue-400">📊</span>
                            Performance Hint
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                                <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Growth Forecast</div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Your monthly sales of <span className="text-white font-bold">₹{stats.monthlySales.toLocaleString()}</span> represents the health of your shop over the last 30 days. Maintain stock for best sellers.
                                </p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                                <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Quick Tip</div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    You have <span className={`${stats.lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>{stats.lowStockCount} low stock items</span>. Restocking soon will prevent lost revenue on popular items.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Reset Operations</h3>
                                    <p className="text-slate-500 mt-2 font-medium">Select an area to clear. This action is irreversible.</p>
                                </div>
                                <button
                                    onClick={() => { setShowResetModal(false); setResetType(null); }}
                                    className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {resetType ? (
                                <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 text-center">
                                    <div className="text-5xl mb-4">🚨</div>
                                    <h4 className="text-2xl font-black text-red-600 mb-2 uppercase tracking-tight">Are you absolutely sure?</h4>
                                    <p className="text-red-900/60 font-bold mb-8 italic">
                                        You are about to reset <span className="underline decoration-wavy underline-offset-4">{resetType.toUpperCase()}</span>. All data in this category will be permanently deleted.
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            disabled={isResetting}
                                            onClick={() => setResetType(null)}
                                            className="flex-1 bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 disabled:opacity-50"
                                        >
                                            Go Back
                                        </button>
                                        <button
                                            disabled={isResetting}
                                            onClick={confirmReset}
                                            className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isResetting ? 'Resetting...' : 'Confirm Reset'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ResetOption
                                        title="Sales History"
                                        desc="Clear all invoices and billing data."
                                        icon="🧾"
                                        onClick={() => setResetType('sales')}
                                    />
                                    <ResetOption
                                        title="Customer Data"
                                        desc="Delete all customer profiles & history."
                                        icon="👥"
                                        onClick={() => setResetType('customers')}
                                    />
                                    <ResetOption
                                        title="Inventory"
                                        desc="Remove all products and catalogs."
                                        icon="📦"
                                        onClick={() => setResetType('inventory')}
                                    />
                                    <ResetOption
                                        title="Stock Levels"
                                        desc="Set all stock to 0 & clear purchases."
                                        icon="📉"
                                        onClick={() => setResetType('stocks')}
                                    />
                                    <button
                                        onClick={() => setResetType('all')}
                                        className="col-span-full mt-4 bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3"
                                    >
                                        🧨 Factory Reset (Everything)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ResetOption = ({ title, desc, icon, onClick }) => (
    <button
        onClick={onClick}
        className="text-left p-6 rounded-[2rem] border-2 border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all group"
    >
        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">{icon}</div>
        <div className="font-black text-slate-900 uppercase tracking-tight text-lg leading-tight mb-1">{title}</div>
        <div className="text-slate-400 text-xs font-bold font-mono">{desc}</div>
    </button>
);

const StatCard = ({ label, value, icon, color, shadow }) => (
    <div className={`bg-white rounded-[2.5rem] p-8 shadow-xl ${shadow} border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.03] group`}>
        <div>
            <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-slate-600 transition-colors">{label}</div>
            <div className="text-3xl font-black text-slate-900">{value}</div>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform transition-transform group-hover:rotate-12`}>
            {icon}
        </div>
    </div>
);

export default Dashboard;
