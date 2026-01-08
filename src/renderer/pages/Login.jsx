import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await window.electron.login({ username, password });
            if (user) {
                onLogin(user);
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600 via-slate-900 to-black">
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] w-[450px] shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-lg shadow-blue-500/50 mb-6 text-4xl">
                        👕
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Shop Manager</h1>
                    <p className="text-blue-200/60 font-medium mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-200/50 uppercase tracking-widest ml-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-200/50 uppercase tracking-widest ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl text-sm font-medium animate-bounce">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-lg flex items-center justify-center gap-3 mt-8"
                    >
                        {isLoading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <span className="text-xl">→</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-10 border-t border-white/5 text-center">
                    <p className="text-white/30 text-xs font-medium">
                        Protected by Advanced Security System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
