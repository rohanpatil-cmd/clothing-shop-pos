import React, { useState, useEffect } from 'react';
import AddProductModal from '../components/AddProductModal';

const Inventory = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const isManager = user?.role === 'manager';

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await window.electron.getProducts();
            setProducts(data || []);
        } catch (err) {
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isManager) return;
        if (confirm('Are you sure you want to delete this product?')) {
            await window.electron.deleteProduct(id);
            loadProducts();
        }
    };

    const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
            String(p.id).includes(search);

        const matchesCategory = selectedCategory === 'All' || (p.category || 'General') === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Store</h2>
                    <p className="text-slate-500 mt-1 text-lg font-medium">
                        {isManager ? 'Manage your products, catalog, and stock levels.' : 'View current stock levels and product catalog.'}
                    </p>
                </div>
                {isManager && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[2rem] font-black transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95 flex items-center gap-3"
                    >
                        <span className="text-2xl font-normal">＋</span> Add New Product
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 mb-8">
                <div className="relative flex-1 min-w-[300px]">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by Product Name, ID, or Category..."
                        className="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-12 pr-6 py-4 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none font-bold text-slate-900"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-[1.5rem] shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category:</span>
                    <select
                        className="bg-transparent font-black px-4 py-2 outline-none appearance-none cursor-pointer pr-8"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '12px' }}
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 px-6 py-4 bg-blue-50 text-blue-600 rounded-[1.5rem] border border-blue-100 font-black text-xs uppercase tracking-widest">
                    <span>📊</span>
                    <span>{filteredProducts.length} Results</span>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 backdrop-blur-sm bg-white/80">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Product / Catalog</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Category</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Specs</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Stock Status</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Sell Price</th>
                                {isManager && <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={isManager ? "6" : "5"} className="px-8 py-20 text-center animate-pulse">
                                        <div className="text-2xl font-bold text-slate-300">Loading catalog...</div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={isManager ? "6" : "5"} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl">🛍️</div>
                                            <div className="text-xl font-black text-slate-900">No products found.</div>
                                            <p className="text-slate-400 font-medium">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner border border-slate-100 group-hover:scale-110 transition-transform">
                                                    {product.image ? (
                                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl font-black">👕</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-lg leading-tight">{product.name}</div>
                                                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">#PRD-{String(product.id).padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                {product.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">{product.size}</span>
                                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black">{product.color}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`text-xl font-black ${product.stock_qty < 5 ? 'text-red-500' : 'text-slate-900'}`}>
                                                    {product.stock_qty}
                                                </div>
                                                {product.stock_qty < 5 && (
                                                    <div className="animate-pulse bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Critically Low</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-black text-slate-900 text-xl tracking-tighter">
                                            ₹{product.selling_price.toLocaleString()}
                                        </td>
                                        {isManager && (
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button className="bg-slate-100 hover:bg-slate-200 p-3 rounded-2xl transition-all cursor-pointer" title="Edit Product">⚙️</button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-2xl transition-all cursor-pointer"
                                                        title="Remove Product"
                                                    >🗑️</button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isManager && (
                <AddProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={loadProducts}
                />
            )}
        </div>
    );
};

export default Inventory;
