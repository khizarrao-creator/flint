"use client";

import React, { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { motion } from "framer-motion";
import { Loader2, Rocket, ShieldCheck, Mail, Lock } from "lucide-react";
import { api } from "@/app/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await api.post<any>('/auth/login', { email, password });
            login(data.access_token, data.user);
        } catch (err: any) {
            setError(err.message || "Authentication failed. Is the API running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-card/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 group">
                            <ShieldCheck size={32} className="text-primary-foreground group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter italic">FLINT CORE</h1>
                        <p className="text-muted-foreground mt-2 font-medium">Access your intelligent ecosystem</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Credential (Password)</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-xs font-bold text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Authenticate Access"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Authorized Personnel Only</p>
                        <a href="/portal/login" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                            Click here for Customer Portal <Rocket size={12} />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
