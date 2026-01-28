import React, { useState, useEffect, useRef } from 'react';

const Invoices = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', mobile: '' });
    const [search, setSearch] = useState('');
    const [discount, setDiscount] = useState(0);
    const [lastInvoice, setLastInvoice] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [settings, setSettings] = useState({});

    const printRef = useRef();

    useEffect(() => {
        loadSettings();
        loadProducts();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await window.electron.getSettings();
            setSettings(data || {});
        } catch (err) {
            console.error('Failed to load settings:', err);
        }
    };

    useEffect(() => {
        if (customer.mobile.length >= 10) {
            fetchCustomer();
        }
    }, [customer.mobile]);

    const fetchCustomer = async () => {
        try {
            const data = await window.electron.getCustomer(customer.mobile);
            // Only auto-fill if the user hasn't typed a name yet or it's a perfect match
            if (data && !customer.name) {
                setCustomer(prev => ({ ...prev, name: data.name }));
            }
        } catch (err) {
            console.error('Failed to fetch customer:', err);
        }
    };

    const loadProducts = async () => {
        const data = await window.electron.getProducts();
        setProducts(data || []);
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                price: product.selling_price,
                image: product.image,
                qty: 1
            }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.product_id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = Math.max(0, subtotal - (parseFloat(discount) || 0));

    const handleCreateInvoice = async () => {
        if (!customer.mobile || !customer.name || cart.length === 0) {
            alert('Please enter customer details (mobile & name) and add items to cart');
            return;
        }

        try {
            const invoiceData = {
                customer,
                items: cart,
                total_amount: total,
                tax_amount: 0,
                discount_amount: parseFloat(discount) || 0,
                payment_method: 'Cash'
            };
            const invoiceId = await window.electron.createInvoice(invoiceData);

            // Set for printing
            setLastInvoice({
                id: invoiceId,
                ...invoiceData,
                date: new Date()
            });
            // No immediate WhatsApp send here – will be handled by useEffect below

            setShowSuccess(true);
            // The WhatsApp message will be sent automatically when `lastInvoice` updates (see useEffect).
            setCart([]);
            setCustomer({ name: '', mobile: '' });
            setDiscount(0);
            loadProducts(); // Refresh stock
        } catch (err) {
            console.error(err);
            alert('Failed to create invoice');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const sendInvoiceToWhatsApp = async () => {
        if (!lastInvoice) return;
        console.log('Attempting to send WhatsApp for invoice:', lastInvoice.id);
        let mobile = lastInvoice.customer?.mobile?.replace(/\D/g, '');
        if (!mobile) {
            console.warn('No mobile number to send WhatsApp');
            return;
        }
        // Basic India country code prefixing if only 10 digits
        if (mobile.length === 10) {
            mobile = '91' + mobile;
        }
        const invoiceNo = String(lastInvoice.id).padStart(5, '0');
        const date = new Date(lastInvoice.date).toLocaleString();
        const total = lastInvoice.total_amount?.toLocaleString();
        const itemsText = lastInvoice.items
            ?.map(item => `${item.name} x${item.qty}: ₹${(item.price * item.qty).toLocaleString()}`)
            .join('\n');
        const storeName = settings.store_name || 'Luxury Clothing';
        const message = `*Invoice #INV-${invoiceNo}*\nDate: ${date}\nCustomer: ${lastInvoice.customer.name}\nContact: ${lastInvoice.customer.mobile}\n\n*Items:*\n${itemsText}\n\n*Total:* ₹${total}\n\nThank you for shopping with *${storeName}*! ✨`;
        try {
            const response = await fetch('http://localhost:4000/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile,
                    message,
                    token: settings.whatsapp_token,
                    phoneId: settings.whatsapp_phone_id
                })
            });
            const result = await response.json();
            console.log('WhatsApp send result:', result);
        } catch (e) {
            console.error('Failed to send WhatsApp invoice', e);
        }
    };

    useEffect(() => {
        if (lastInvoice) {
            (async () => {
                await sendInvoiceToWhatsApp();
            })();
        }
    }, [lastInvoice]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    );





    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
            <style>
                {`
                    @media print {
                        @page { margin: 0; size: auto; }
                        body * { visibility: hidden; }
                        #printable-receipt, #printable-receipt * { visibility: visible; }
                        #printable-receipt { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 210mm; /* A4 Width */
                            min-height: 297mm;
                            padding: 20mm;
                            background: white;
                            color: black;
                            font-family: 'Inter', sans-serif;
                            visibility: visible !important;
                        }
                        .print-hidden { display: none !important; }
                    }
                `}
            </style>

            {/* Product Selection Area */}
            <div className="flex-1 flex flex-col p-8 overflow-hidden print:hidden">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Checkout Counter</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Select products to build customer invoice.</p>
                    </div>
                    <div className="relative w-96">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Find items..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 shadow-sm shadow-slate-200/50 dark:shadow-none transition-all outline-none font-bold text-slate-900 dark:text-white"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            disabled={product.stock_qty <= 0}
                            className={`p-5 rounded-[2.5rem] border text-left transition-all group relative overflow-hidden flex flex-col ${product.stock_qty <= 0
                                ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-white/5 opacity-60 cursor-not-allowed shadow-none'
                                : 'bg-white dark:bg-slate-900 border-white dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] hover:-translate-y-1'
                                }`}
                        >
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl h-48 flex items-center justify-center mb-5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all overflow-hidden relative shadow-inner">
                                {product.image ? (
                                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                                ) : (
                                    <span className="text-5xl drop-shadow-lg">👕</span>
                                )}
                                {product.stock_qty <= 0 && (
                                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="text-white font-black uppercase tracking-widest text-xs bg-red-600 px-4 py-1.5 rounded-full">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate uppercase">{product.name}</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 uppercase font-black tracking-[0.2em]">{product.category || 'Standard'}</p>
                                <div className="flex justify-between items-end mt-auto">
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">₹{product.selling_price.toLocaleString()}</span>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${product.stock_qty < 5
                                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                                        }`}>
                                        {product.stock_qty} IN STOCK
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-[400px] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-white/5 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.04)] dark:shadow-none relative z-10 transition-all print:hidden">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center text-lg">🛒</span>
                            Order Summary
                        </h3>
                        <span className="bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{cart.length} ITEMS</span>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                            <input
                                type="text"
                                placeholder="+91 00000 00000"
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none"
                                value={customer.mobile}
                                onChange={e => setCustomer({ ...customer, mobile: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none"
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-4 opacity-40">
                            <span className="text-7xl">🛍️</span>
                            <p className="font-black text-xl uppercase tracking-widest">Cart is Empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product_id} className="flex gap-4 items-center group animate-in slide-in-from-right-4 duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner">
                                    {item.image ? (
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm truncate uppercase tracking-tight">{item.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">{item.qty} units</span>
                                        <span className="text-slate-200 dark:text-slate-800">|</span>
                                        <span className="text-blue-600 dark:text-blue-400 text-xs font-black tracking-tight">₹{(item.qty * item.price).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.product_id)}
                                    className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 hover:bg-red-500 hover:text-white rounded-full transition-all active:scale-90"
                                >✕</button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 bg-slate-900 dark:bg-black text-white rounded-t-[4rem] shadow-[0_-20px_50px_rgba(15,23,42,0.3)]">
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center opacity-50">
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Merchandise Total</span>
                            <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Apply Discount</span>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    className="bg-transparent border-none outline-none text-right font-black text-white w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={discount}
                                    onChange={e => setDiscount(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-end py-2">
                            <span className="text-lg font-black uppercase tracking-[0.2em]">Grand Total</span>
                            <span className="text-4xl font-black text-blue-400 tracking-tighter">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleCreateInvoice}
                        disabled={cart.length === 0}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 dark:disabled:bg-white/5 dark:disabled:text-slate-700 disabled:cursor-not-allowed text-white font-black py-6 rounded-3xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 text-xl tracking-[0.1em] flex items-center justify-center gap-3"
                    >
                        <span>FINALIZE ORDER</span>
                        <span className="text-2xl font-normal">→</span>
                    </button>
                </div>
            </div>

            {/* Success & Print Modal */}
            {showSuccess && lastInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 print:hidden p-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-[600px] max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl">
                                    ✅
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Order Confirmed</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">#INV-{String(lastInvoice.id).padStart(5, '0')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-10 h-10 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full flex items-center justify-center transition-all"
                            >✕</button>
                        </div>

                        {/* Digital Invoice Preview */}
                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
                            <div className="bg-slate-50 dark:bg-black/20 rounded-3xl p-6 border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Customer</p>
                                        <p className="font-black text-slate-900 dark:text-white text-lg uppercase">{lastInvoice.customer?.name}</p>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{lastInvoice.customer?.mobile}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</p>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{new Date(lastInvoice.date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Purchased Items</p>
                                    <div className="space-y-3">
                                        {lastInvoice.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center text-xs font-black">
                                                        {item.qty}
                                                    </div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-sm tracking-tight">{item.name}</span>
                                                </div>
                                                <span className="font-black text-slate-900 dark:text-white text-sm">₹{(item.price * item.qty).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/5 space-y-2">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-500 dark:text-slate-400">
                                        <span>Subtotal</span>
                                        <span>₹{((lastInvoice?.total_amount || 0) + (lastInvoice?.discount_amount || 0)).toLocaleString()}</span>
                                    </div>
                                    {(lastInvoice?.discount_amount || 0) > 0 && (
                                        <div className="flex justify-between items-center text-sm font-bold text-red-500 dark:text-red-400">
                                            <span>Discount</span>
                                            <span>-₹{lastInvoice?.discount_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Net Payable</span>
                                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{(lastInvoice?.total_amount || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-500/20">
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span>📱</span> WhatsApp Invoice Sent Successfully
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex-shrink-0">
                            <button
                                onClick={handlePrint}
                                className="bg-slate-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
                            >
                                <span className="text-xl">🖨️</span> Print Bill
                            </button>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-200 dark:shadow-none"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Premium Printable Invoice */}
            <div id="printable-receipt" className="hidden print:block bg-white text-slate-900 border-t-8 border-slate-900">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2 uppercase leading-[0.8]">{settings.store_name || 'LUXURY CLOTHING'}</h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Authentic Premium Boutique</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-slate-900 mb-4 uppercase">Invoice</div>
                        <div className="space-y-1 text-sm">
                            <p className="font-bold flex justify-end gap-4"><span className="text-slate-400 uppercase tracking-widest text-[10px]">No:</span> #INV-{lastInvoice?.id ? String(lastInvoice.id).padStart(5, '0') : ''}</p>
                            <p className="font-bold flex justify-end gap-4"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Date:</span> {lastInvoice?.date ? new Date(lastInvoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12 pb-12 border-b-2 border-slate-100">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Billing Information</h4>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900 uppercase">{lastInvoice?.customer?.name || 'Valued Customer'}</p>
                            <p className="font-bold text-slate-500">{lastInvoice?.customer?.mobile || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Store Location</h4>
                        <div className="space-y-1 text-sm font-bold text-slate-900">
                            <p>{settings.store_address || '123 Luxury Avenue, Fashion District, Mumbai'}</p>
                            <p>Contact: {settings.store_contact || '+91 98765 43210'}</p>
                        </div>
                    </div>
                </div>

                <table className="w-full mb-12">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Item Description</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Quantity</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Unit Price</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                        {lastInvoice?.items?.map((item, idx) => (
                            <tr key={idx} className="font-bold text-slate-900">
                                <td className="px-6 py-6 uppercase tracking-tight">{item.name}</td>
                                <td className="px-6 py-6 text-center">{item.qty} Pcs</td>
                                <td className="px-6 py-6 text-right text-slate-500">₹{item.price.toLocaleString()}</td>
                                <td className="px-6 py-6 text-right text-xl">₹{(item.price * item.qty).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-12">
                    <div className="w-80 space-y-4">
                        <div className="flex justify-between items-center text-slate-500 font-bold">
                            <span className="uppercase text-[10px] tracking-widest">Subtotal</span>
                            <span>₹{((lastInvoice?.total_amount || 0) + (lastInvoice?.discount_amount || 0)).toLocaleString()}</span>
                        </div>
                        {(lastInvoice?.discount_amount || 0) > 0 && (
                            <div className="flex justify-between items-center text-red-500 font-bold">
                                <span className="uppercase text-[10px] tracking-widest text-red-400">Promotional Discount</span>
                                <span>-₹{lastInvoice?.discount_amount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-slate-500 font-bold border-b pb-4 border-slate-100">
                            <span className="uppercase text-[10px] tracking-widest">Tax (GST Inclusive)</span>
                            <span>Included</span>
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <span className="text-lg font-black uppercase tracking-[0.2em] text-slate-900">Total Due</span>
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{(lastInvoice?.total_amount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-12 border-t-2 border-slate-100 grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Terms & Conditions</h4>
                        <ul className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase list-disc ml-4">
                            <li>Goods once sold cannot be returned.</li>
                            <li>Exchange valid within 7 days with original tag and bill.</li>
                            <li>No warranty on delicate fabrics or embellishments.</li>
                            <li>All disputes are subject to Mumbai jurisdiction.</li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 border-2 border-slate-100 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-30">
                            🛡️
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authentic Quality Verified</p>
                        <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Thank you for your patronage</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoices;
