import React, { useState, useEffect } from 'react';

const Settings = () => {
    const [settings, setSettings] = useState({
        store_name: '',
        store_address: '',
        store_contact: '',
        whatsapp_token: '',
        whatsapp_phone_id: '',
        currency_symbol: '₹',
        theme: 'light'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Reset States
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetType, setResetType] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await window.electron.getSettings();
            if (data) setSettings(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            await window.electron.updateSettings(settings);
            setMessage({ text: 'Settings updated successfully! ✨', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setMessage({ text: 'Failed to update settings. ❌', type: 'error' });
        } finally {
            setSaving(false);
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
            setShowResetModal(false);
            setResetType(null);
            setMessage({ text: 'System reset successful! 🧹', type: 'success' });
        } catch (err) {
            console.error('Reset failed:', err);
            setMessage({ text: 'System reset failed. ❌', type: 'error' });
        } finally {
            setIsResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-2xl font-black text-slate-300">Loading configurations...</div>
            </div>
        );
    }

    return (
        <div className="p-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-12 flex justify-between items-start">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">System Settings</h2>
                    <p className="text-slate-500 text-lg font-medium">Configure your store identity and API integrations.</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-4 rounded-2xl font-black text-sm uppercase tracking-widest text-center animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8 pb-10">
                {/* Store Profile Section */}
                <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                        <span className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl">🏢</span>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight">Store Profile</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Identity & Contact Info</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-inner transition-all outline-none"
                                value={settings.store_name}
                                onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-inner transition-all outline-none"
                                value={settings.store_contact}
                                onChange={e => setSettings({ ...settings, store_contact: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Address</label>
                            <textarea
                                required
                                rows="3"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-inner transition-all outline-none resize-none"
                                value={settings.store_address}
                                onChange={e => setSettings({ ...settings, store_address: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* WhatsApp Integration Section */}
                <section className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/20 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32"></div>

                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5 relative z-10">
                        <span className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl">📱</span>
                        <div>
                            <h3 className="text-2xl font-black text-white leading-tight">WhatsApp API</h3>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Meta Cloud API Integration</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Permanent Access Token</label>
                            <input
                                type="password"
                                placeholder="EAAW..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 font-mono text-xs text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                value={settings.whatsapp_token}
                                onChange={e => setSettings({ ...settings, whatsapp_token: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number ID</label>
                            <input
                                type="text"
                                placeholder="1029384..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 font-mono text-sm text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                value={settings.whatsapp_phone_id}
                                onChange={e => setSettings({ ...settings, whatsapp_phone_id: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* System Section */}
                <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                        <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">⚙️</span>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight">Preferences</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Localization & Defaults</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Symbol</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-900 text-center text-2xl focus:ring-2 focus:ring-blue-500 shadow-inner transition-all outline-none"
                                value={settings.currency_symbol}
                                onChange={e => setSettings({ ...settings, currency_symbol: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-6 pt-4">
                    <button
                        type="button"
                        onClick={loadSettings}
                        className="px-10 py-5 rounded-[1.5rem] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-xs"
                    >
                        Reset Changes
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-[1.5rem] font-black transition-all shadow-2xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                        {saving ? (
                            <span className="animate-spin opacity-50">⏳</span>
                        ) : (
                            <span className="text-xl">💾</span>
                        )}
                        <span>SAVE ALL CONFIGURATIONS</span>
                    </button>
                </div>
            </form>

            {/* Danger Zone Section */}
            <div className="mt-16 pt-16 border-t border-slate-200">
                <div className="flex items-center gap-4 mb-10">
                    <span className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl">⚠️</span>
                    <div>
                        <h3 className="text-2xl font-black text-red-600 leading-tight uppercase tracking-tight">Danger Zone</h3>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">System Reset & Data Deletion</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResetActionCard
                        title="Reset Sales"
                        desc="Clear all invoice history and revenue records."
                        onClick={() => { setResetType('sales'); setShowResetModal(true); }}
                    />
                    <ResetActionCard
                        title="Clear Customers"
                        desc="Delete all customer profiles and their data."
                        onClick={() => { setResetType('customers'); setShowResetModal(true); }}
                    />
                    <ResetActionCard
                        title="Wipe Inventory"
                        desc="Remove all products and catalog items."
                        onClick={() => { setResetType('inventory'); setShowResetModal(true); }}
                    />
                    <ResetActionCard
                        title="Zero Stocks"
                        desc="Reset all quantities to 0 and clear purchases."
                        onClick={() => { setResetType('stocks'); setShowResetModal(true); }}
                    />
                    <button
                        onClick={() => { setResetType('all'); setShowResetModal(true); }}
                        className="col-span-full bg-red-600 hover:bg-red-700 text-white p-8 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-red-200 active:scale-95"
                    >
                        🧨 FULL FACTORY RESET (EVERYTHING)
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 text-center">
                            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🚨</div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Final Confirmation</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                Are you sure you want to reset <span className="text-red-600 font-bold underline underline-offset-4">{resetType?.toUpperCase()}</span>?
                                This action <span className="text-red-600 font-bold italic">cannot be undone</span>.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    disabled={isResetting}
                                    onClick={() => { setShowResetModal(false); setResetType(null); }}
                                    className="flex-1 bg-slate-100 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isResetting}
                                    onClick={confirmReset}
                                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isResetting ? 'Wiping...' : 'Destroy Data'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ResetActionCard = ({ title, desc, onClick }) => (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-red-100 transition-all flex flex-col justify-between items-start gap-4">
        <div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h4>
            <p className="text-slate-400 text-xs font-bold leading-relaxed">{desc}</p>
        </div>
        <button
            onClick={onClick}
            className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline"
        >
            Perform Reset →
        </button>
    </div>
);

export default Settings;
