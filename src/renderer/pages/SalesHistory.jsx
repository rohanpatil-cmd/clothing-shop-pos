import React, { useState, useEffect } from 'react';

const SalesHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'weekly', 'monthly'

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const data = await window.electron.getInvoices();
            setInvoices(data || []);
        } catch (err) {
            console.error('Failed to load invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewDetails = async (id) => {
        try {
            const details = await window.electron.getInvoiceDetails(id);
            setSelectedInvoice(details);
        } catch (err) {
            console.error(err);
        }
    };

    const isWithinDays = (dateStr, days) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        return diff <= days * 24 * 60 * 60 * 1000;
    };

    const isToday = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        return date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            inv.customer_mobile.includes(search) ||
            inv.id.toString().includes(search);

        if (!matchesSearch) return false;

        switch (activeFilter) {
            case 'today': return isToday(inv.created_at);
            case 'weekly': return isWithinDays(inv.created_at, 7);
            case 'monthly': return isWithinDays(inv.created_at, 30);
            default: return true;
        }
    });

    return (
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sales History</h2>
                    <p className="text-slate-500 mt-1 text-lg">Filter and track your store's transactions.</p>
                </div>
                <div className="relative w-96">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by Invoice ID, Name or Mobile..."
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'all', label: 'All Records', icon: '📋' },
                    { id: 'today', label: 'Today', icon: '☀️' },
                    { id: 'weekly', label: 'Weekly', icon: '📅' },
                    { id: 'monthly', label: 'Monthly', icon: '📊' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeFilter === tab.id
                            ? 'bg-white text-blue-600 shadow-sm scale-105'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Invoice ID</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Customer</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Date & Time</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Payment</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Discount</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="7" className="p-10 text-center text-slate-400">Loading sales data...</td></tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr><td colSpan="7" className="p-20 text-center text-slate-300 font-bold">No records found for this period.</td></tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                                        <td className="px-6 py-5">
                                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">#INV-{inv.id}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-900">{inv.customer_name}</div>
                                            <div className="text-xs text-slate-400 font-medium">{inv.customer_mobile}</div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 text-sm">
                                            {new Date(inv.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {inv.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {inv.discount_amount > 0 ? (
                                                <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-2 py-1 rounded-lg">-₹{inv.discount_amount.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-slate-300 font-bold text-[10px]">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 font-black text-slate-900 text-lg">
                                            ₹{inv.total_amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => viewDetails(inv.id)}
                                                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all active:scale-95"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Details Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-10 w-[600px] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">Invoice Details</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">#INV-{selectedInvoice.id}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-900 text-2xl">✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-50">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer</h4>
                                <div className="text-lg font-bold text-slate-900">{selectedInvoice.customer_name}</div>
                                <div className="text-slate-500">{selectedInvoice.customer_mobile}</div>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Date</h4>
                                <div className="text-slate-900 font-bold">{new Date(selectedInvoice.created_at).toLocaleString()}</div>
                                <div className="text-slate-500 italic">Method: {selectedInvoice.payment_method}</div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchased Items</h4>
                            <div className="bg-slate-50 rounded-3xl p-6 space-y-3">
                                {selectedInvoice.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{item.product_name}</div>
                                            <div className="text-xs text-slate-400">{item.qty} units x ₹{item.price}</div>
                                        </div>
                                        <div className="font-black text-slate-900 tracking-tight">₹{item.qty * item.price}</div>
                                    </div>
                                ))}
                                {selectedInvoice.discount_amount > 0 && (
                                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                        <div className="text-xs font-black text-emerald-600 uppercase tracking-widest">Discount Applied</div>
                                        <div className="font-black text-emerald-600">-₹{selectedInvoice.discount_amount.toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-900 text-white rounded-3xl p-8">
                            <div>
                                <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Amount</div>
                                <div className="text-sm italic opacity-50">Grand total after discounts</div>
                            </div>
                            <div className="text-4xl font-black text-blue-400">₹{selectedInvoice.total_amount.toLocaleString()}</div>
                        </div>

                        <button
                            className="mt-8 w-full border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            onClick={() => window.print()}
                        >
                            <span>🖨️</span> Print Invoice
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
