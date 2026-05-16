"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Loader2, User, Building2, Mail, Phone, Save, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: any;
}

import { api } from "@/app/lib/api";

export function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        email: "",
        phone: "",
        portalAccess: false,
        password: ""
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                companyName: customer.companyName || "",
                email: customer.email || "",
                phone: customer.phone || "",
                portalAccess: customer.portalAccess || false,
                password: ""
            });
        } else {
            setFormData({
                firstName: "",
                lastName: "",
                companyName: "",
                email: "",
                phone: "",
                portalAccess: false,
                password: ""
            });
        }
    }, [customer, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (customer) {
                await api.put(`/customers/${customer.id}`, formData);
            } else {
                await api.post('/customers', formData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-xl bg-card border rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    <div className="p-8 border-b flex items-center justify-between bg-muted/30">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                    <UserPlus size={24} />
                                </div>
                                {customer ? "Edit Partner Registry" : "New Business Partner"}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">First Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Building2 size={12} /> Company Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Mail size={12} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Phone size={12} /> Phone
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>

                        {/* Portal Access Section */}
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-sm">Customer Portal Access</h3>
                                    <p className="text-xs text-muted-foreground">Allow this partner to view invoices and make payments.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.portalAccess}
                                        onChange={(e) => setFormData({ ...formData, portalAccess: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <AnimatePresence>
                                {formData.portalAccess && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-2 bg-muted/30 p-4 rounded-2xl border mb-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Lock size={12} /> Portal Password
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, password: Math.random().toString(36).slice(-8) })}
                                                    className="text-[10px] font-bold text-primary hover:underline"
                                                >
                                                    Generate Random
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full h-12 bg-card border rounded-xl px-4 font-mono font-bold outline-none focus:border-primary/50"
                                                placeholder={customer?.portalAccess ? "•••••••• (Leave blank to keep unchanged)" : "Create a secure password"}
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Share this password with the customer securely. They will use their email to log in.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <> <Save size={22} /> {customer ? "Update Partner" : "Register Partner"} </>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
