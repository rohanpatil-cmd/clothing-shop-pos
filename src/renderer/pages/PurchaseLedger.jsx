import React, { useState, useEffect } from 'react';

const PurchaseLedger = () => {
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        supplier_name: '',
        purchase_price: '',
        qty: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [purchaseData, productData] = await Promise.all([
                window.electron.getPurchases(),
                window.electron.getProducts()
            ]);
            setPurchases(purchaseData || []);
            setProducts(productData || []);
        } catch (err) {
            console.error('Failed to load purchase ledger:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await window.electron.addPurchase({
                ...formData,
                product_id: parseInt(formData.product_id),
                purchase_price: parseFloat(formData.purchase_price),
                qty: parseInt(formData.qty)
            });
            setIsModalOpen(false);
            setFormData({ product_id: '', supplier_name: '', purchase_price: '', qty: '' });
            loadData();
        } catch (err) {
            console.error('Failed to record purchase:', err);
            alert('Error recording purchase.');
        }
    };

    return (
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Purchase Ledger</h2>
                    <p className="text-slate-500 mt-1 text-lg font-medium text-slate-400">Track where your stock came from and how much you paid.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 flex items-center gap-3"
                >
                    <span className="text-2xl font-normal">🚛</span> Record New Stock
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Procurement Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Name</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supplier / Source</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Qty</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Unit Cost</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Expenditure</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="6" className="p-20 text-center animate-pulse text-slate-300 font-bold">Loading ledger...</td></tr>
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-32 text-center text-slate-300">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="text-6xl opacity-20">📜</span>
                                            <span className="font-black uppercase tracking-widest text-sm">No procurement records found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="text-slate-500 font-bold text-xs uppercase tracking-tight">
                                                {new Date(purchase.purchase_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{purchase.product_name}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 w-fit uppercase tracking-wider border border-slate-200">
                                                {purchase.supplier_name}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="font-black text-slate-900 bg-blue-50 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto shadow-inner text-sm">
                                                {purchase.qty}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-bold text-slate-500">
                                            ₹{purchase.purchase_price.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-slate-900 text-lg tracking-tighter">
                                            ₹{(purchase.purchase_price * purchase.qty).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Procurement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-10 w-[550px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900">Log Procurement</h3>
                                <p className="text-slate-400 font-medium">Add new stock arrivals to the inventory.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 w-10 h-10 rounded-full text-slate-400 hover:text-slate-600 transition-colors font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                                    value={formData.product_id}
                                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                >
                                    <option value="">Choose item...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.size} - {p.color})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier / Vendor Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Surat Wholesale Hub"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                    value={formData.supplier_name}
                                    onChange={e => setFormData({ ...formData, supplier_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchased Qty</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                        value={formData.qty}
                                        onChange={e => setFormData({ ...formData, qty: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Per Unit (Landing Cost)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-5 py-4 font-black text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            value={formData.purchase_price}
                                            onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-5 rounded-2xl font-black text-sm text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm shadow-[0_20px_40px_rgba(37,99,235,0.2)] transition-all active:scale-95"
                                >
                                    Confirm Procurement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseLedger;
