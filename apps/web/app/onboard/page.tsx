"use client";

import React, { useState } from "react";
import {
    Rocket,
    CheckCircle2,
    Loader2,
    ArrowRight,
    Globe,
    Building2,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

import { api } from "@/app/lib/api";

export default function OnboardPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        subdomain: ""
    });
    const [error, setError] = useState("");
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await api.post<any>('/tenants/onboard', formData);
            setResult(data);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                {/* Brand */}
                <div className="flex flex-col items-center mb-12 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                        <span className="text-3xl font-black italic">F</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic">FLINT</h1>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-card/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black tracking-tight">Launch your Enterprise</h2>
                                <p className="text-slate-400 font-medium whitespace-pre-line">
                                    Deploy a dedicated, multi-tenant Flint instance in seconds.{"\n"}No credit card required for the trial.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Building2 size={14} /> Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Acme Corporation"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-lg outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Globe size={14} /> Subdomain
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            placeholder="acme"
                                            value={formData.subdomain}
                                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-lg outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-white/30 tracking-tight">
                                            .flint-erp.com
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Only alphanumeric characters allowed.</p>
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-rose-500 font-black text-sm text-center bg-rose-500/10 py-3 rounded-xl border border-rose-500/20"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3 group"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    Deploy Instance
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl text-center space-y-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/30">
                                <CheckCircle2 size={48} className="text-emerald-500" />
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-4xl font-black tracking-tight">All Set, Captain!</h2>
                                <p className="text-slate-400 font-medium">
                                    The <span className="text-white font-black">{result.name}</span> instance is now live at:
                                </p>
                                <div className="bg-white/5 rounded-2xl p-4 font-mono text-xl text-primary font-bold border border-white/5">
                                    {result.subdomain}.flint-erp.com
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-left space-y-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                        <Sparkles size={16} className="text-indigo-400" />
                                    </div>
                                    <p className="text-xs font-black uppercase text-white/40 tracking-widest leading-none mt-2">Database</p>
                                    <p className="font-bold">Provisioned</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-left space-y-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                        <Rocket size={16} className="text-orange-400" />
                                    </div>
                                    <p className="text-xs font-black uppercase text-white/40 tracking-widest leading-none mt-2">API Cluster</p>
                                    <p className="font-bold">Operational</p>
                                </div>
                            </div>

                            <Link
                                href="/"
                                className="w-full h-16 bg-white text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Access Dashboard
                                <ArrowRight size={24} />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-center mt-8 text-white/30 text-xs font-bold uppercase tracking-widest">
                    Powered by Flint Enterprise Core v1.0.4
                </p>
            </motion.div>
        </div>
    );
}
