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
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {isManager ? 'Executive Dashboard' : 'Staff Dashboard'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        {isManager ? 'Sales performance across different timeframes.' : 'Overview of today\'s shop activity.'}
                    </p>
                </div>
                <div className="text-sm font-bold text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 italic">
                    Live Data Since Inception
                </div>
            </div>

            {/* Main Stats Row - Revenue Breakdown */}
            <div className={`grid grid-cols-1 ${isManager ? 'md:grid-cols-2 lg:grid-cols-4' : ''} gap-6 mb-10`}>
                <div className={`${isManager ? '' : 'col-span-full'} transition-transform hover:scale-[1.02]`}>
                    <div className={`bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-between border border-white/10 relative overflow-hidden group`}>
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
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-white/5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl font-bold">🧾</div>
                        <div>
                            <div className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Orders</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.orderCount}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-white/5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl font-bold">👥</div>
                        <div>
                            <div className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Customers</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.customerCount}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-white/5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center text-xl font-bold">🚨</div>
                        <div>
                            <div className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Low Stock Items</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.lowStockCount}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`${isManager ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-8 overflow-hidden`}>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="text-blue-500">⚡</span>
                        Recent Sales Feed
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Customer</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Method</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px] text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {stats.recentInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-300 dark:text-slate-600 font-medium">No sales recorded yet.</td>
                                    </tr>
                                ) : (
                                    stats.recentInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">#INV-{inv.id}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{inv.customer_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {inv.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">₹{inv.total_amount}</td>
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
                                <p className="text-slate-400 dark:text-slate-400 text-sm leading-relaxed">
                                    Your monthly sales of <span className="text-white font-bold">₹{stats.monthlySales.toLocaleString()}</span> represents the health of your shop over the last 30 days. Maintain stock for best sellers.
                                </p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                                <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Quick Tip</div>
                                <p className="text-slate-400 dark:text-slate-400 text-sm leading-relaxed">
                                    You have <span className={`${stats.lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>{stats.lowStockCount} low stock items</span>. Restocking soon will prevent lost revenue on popular items.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color, shadow }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl ${shadow} dark:shadow-none border border-slate-100 dark:border-white/5 flex items-center justify-between transition-transform hover:scale-[1.03] group`}>
        <div>
            <div className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">{label}</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{value}</div>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform transition-transform group-hover:rotate-12`}>
            {icon}
        </div>
    </div>
);

export default Dashboard;
