import React, { useState, useEffect } from 'react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSales, setCustomerSales] = useState([]);
    const [loadingSales, setLoadingSales] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', email: '' });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await window.electron.getCustomers();
            setCustomers(data || []);
        } catch (err) {
            console.error('Failed to load customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            await window.electron.addCustomer(newCustomer);
            setShowAddModal(false);
            setNewCustomer({ name: '', mobile: '', email: '' });
            loadCustomers();
        } catch (err) {
            alert('Failed to add customer. Mobile number might already exist.');
        }
    };

    const handleViewSales = async (customer) => {
        setSelectedCustomer(customer);
        setLoadingSales(true);
        try {
            const sales = await window.electron.getCustomerInvoices(customer.mobile);
            setCustomerSales(sales || []);
        } catch (err) {
            console.error('Failed to load customer sales:', err);
        } finally {
            setLoadingSales(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Customer Directory</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium">Tracking loyal customers and their purchase frequency.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="relative w-96">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none font-bold text-slate-900 dark:text-white"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.2)] dark:shadow-none"
                    >
                        Register New 👤
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-white/5 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[10px]">Customer Name</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[10px]">Mobile Number</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[10px] text-center">Repeat Count</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[10px]">Joined Date</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[10px] text-right">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-10 text-center text-slate-300 dark:text-slate-700 animate-pulse font-bold">Loading customers...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-5xl">👥</div>
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No customers found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-all duration-200 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${customer.order_count > 3 ? 'bg-blue-600 text-white' : 'bg-slate-900 dark:bg-white/10 text-white'}`}>
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 dark:text-white text-lg leading-tight flex items-center gap-2 uppercase">
                                                        {customer.name}
                                                        {customer.order_count >= 5 && <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md uppercase tracking-tighter">VIP ⭐</span>}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{customer.email || 'No email registered'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl text-xs font-black tracking-tight">{customer.mobile}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`text-xl font-black leading-none ${customer.order_count > 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>
                                                    {customer.order_count}
                                                </span>
                                                <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mt-1">Total Orders</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase">
                                            {customer.created_at ? new Date(customer.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '---'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleViewSales(customer)}
                                                className="bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-blue-100 dark:border-blue-500/20 hover:border-blue-600 shadow-sm"
                                            >
                                                View {customer.order_count} Logs
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-[500px] shadow-2xl border border-slate-100 dark:border-white/5 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Register Customer</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xl">✕</button>
                        </div>
                        <form onSubmit={handleAddCustomer} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter customer name"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="+91 00000 00000"
                                    value={newCustomer.mobile}
                                    onChange={e => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="customer@example.com"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl transition-all active:scale-95 shadow-xl shadow-blue-500/20 dark:shadow-none text-sm uppercase tracking-widest mt-4"
                            >
                                Confirm Registration
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Sales History Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-[700px] max-h-[80vh] flex flex-col shadow-2xl border border-white/20 dark:border-white/5 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8 shrink-0">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Purchase History</h3>
                                <p className="text-slate-400 dark:text-slate-500 font-medium">Customer: <span className="text-blue-600 dark:text-blue-400 font-black">{selectedCustomer.name}</span> <span className="mx-2 text-slate-200 dark:text-slate-800">|</span> Total Visits: <span className="text-slate-900 dark:text-white font-black">{selectedCustomer.order_count}</span></p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-bold text-xl flex items-center justify-center">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {loadingSales ? (
                                <div className="p-20 text-center animate-pulse text-slate-300 dark:text-slate-700 font-black">FETCHING RECORDS...</div>
                            ) : customerSales.length === 0 ? (
                                <div className="p-20 text-center text-slate-300 dark:text-slate-700 space-y-4">
                                    <div className="text-6xl opacity-20">🥡</div>
                                    <div className="font-black uppercase tracking-widest text-sm">No purchases recorded yet</div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Lifetime Savings Given</span>
                                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">₹{customerSales.reduce((sum, s) => sum + (s.discount_amount || 0), 0).toLocaleString()}</span>
                                    </div>
                                    {customerSales.map((sale) => (
                                        <div key={sale.id} className="bg-slate-50 dark:bg-white/[0.02] rounded-[1.5rem] p-6 flex justify-between items-center border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em]">#INV-{String(sale.id).padStart(5, '0')}</div>
                                                    {sale.discount_amount > 0 && (
                                                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter">🎁 Saved ₹{sale.discount_amount}</span>
                                                    )}
                                                </div>
                                                <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mt-1">
                                                    {new Date(sale.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{sale.total_amount.toLocaleString()}</div>
                                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{sale.payment_method}</div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
