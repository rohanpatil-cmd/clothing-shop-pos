import React, { useState } from 'react';

const AddProductModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        size: '',
        color: '',
        stock_qty: 0,
        cost_price: 0,
        selling_price: 0,
        image: ''
    });

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic size check (optional)
            if (file.size > 2000000) {
                alert('Image is too large. Please select a file smaller than 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await window.electron.addProduct({
                ...formData,
                stock_qty: parseInt(formData.stock_qty),
                cost_price: parseFloat(formData.cost_price),
                selling_price: parseFloat(formData.selling_price)
            });
            onAdd();
            onClose();
            setFormData({
                name: '',
                category: '',
                size: '',
                color: '',
                stock_qty: 0,
                cost_price: 0,
                selling_price: 0,
                image: ''
            });
        } catch (err) {
            console.error('Failed to add product:', err);
            alert('Error adding product to database.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-10 w-[600px] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Add New Product</h2>
                        <p className="text-slate-500 font-medium">Capture the details of your latest stock.</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Area */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-6 hover:border-blue-400 transition-all bg-slate-50 cursor-pointer relative group overflow-hidden">
                        {formData.image ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-bold text-sm bg-blue-600 px-4 py-2 rounded-full">Change Image</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-4xl mb-2">📸</div>
                                <div className="text-sm font-bold text-slate-900">Upload Product Photo</div>
                                <div className="text-xs text-slate-400 mt-1">Click to browse (JPG, PNG)</div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                        <input
                            required
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300"
                            type="text"
                            placeholder="e.g. Premium Silk Scarf"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <input
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                placeholder="e.g. Accessories"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Stock Qty</label>
                            <input
                                required
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="number"
                                value={formData.stock_qty}
                                onChange={e => setFormData({ ...formData, stock_qty: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Size</label>
                            <input
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                placeholder="e.g. Free Size"
                                value={formData.size}
                                onChange={e => setFormData({ ...formData, size: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Color</label>
                            <input
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                placeholder="e.g. Emerald Green"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cost Price</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-4 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    type="number"
                                    step="0.01"
                                    value={formData.cost_price}
                                    onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Selling Price</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-4 font-black text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    type="number"
                                    step="0.01"
                                    value={formData.selling_price}
                                    onChange={e => setFormData({ ...formData, selling_price: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black py-5 rounded-[1.5rem] transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>Save Product</span>
                            <span className="text-xl">✨</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
