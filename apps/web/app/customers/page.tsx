"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Search,
    UserPlus,
    Loader2,
    Filter,
    Mail,
    Phone,
    ArrowUpRight,
    Edit,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { CustomerModal } from "@/components/customers/customer-modal";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";

export default function CustomersPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
    const canDelete = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, customer?: any }>({
        isOpen: false
    });

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/customers');
            setCustomers(data || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!canDelete) return;
        if (!confirm("Remove this business partner? This will not delete their order history, but they will be unlinked from future transactions.")) return;

        try {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (error) {
            console.error('Failed to delete customer:', error);
        }
    };

    const filteredCustomers = customers.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-primary" />
                        Network Directory
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Business Partners</h1>
                    <p className="text-muted-foreground">Manage relationships, track ledger balances, and contact info.</p>
                </div>

                <div className="flex items-center gap-3">
                    {canWrite && (
                        <button
                            onClick={() => setModalConfig({ isOpen: true })}
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <UserPlus size={22} />
                            Add Partner
                        </button>
                    )}
                </div>
            </section>

            <section className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search partners by name, email or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 bg-card border rounded-2xl pl-14 pr-6 font-bold outline-none focus:border-primary/50 transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 h-16 rounded-2xl bg-muted border font-bold hover:bg-muted/80 transition-all">
                    <Filter size={20} />
                    Filters
                </button>
            </section>

            <div className="bg-card border rounded-[2.5rem] overflow-hidden shadow-xl">
                <table className="w-full font-outfit">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Partner Identity</th>
                            <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Matrix</th>
                            <th className="text-right p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ledger Balance</th>
                            <th className="text-right p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="p-10"><div className="h-4 bg-muted rounded-full w-full" /></td>
                                </tr>
                            ))
                        ) : filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center font-bold text-muted-foreground">
                                    No business partners found in directory.
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <motion.tr
                                    key={customer.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-muted/20 transition-all group"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                {customer.firstName?.[0]}{customer.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-lg tracking-tight leading-none mb-1">
                                                    {customer.firstName} {customer.lastName}
                                                </p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {customer.companyName || "Private Individual"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            <Mail size={12} className="text-primary" /> {customer.email || "N/A"}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                            <Phone size={12} /> {customer.phone || "N/A"}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className={cn(
                                            "inline-flex flex-col items-end px-4 py-2 rounded-2xl border",
                                            Number(customer.ledgerBalance) > 0 ? "bg-rose-500/5 border-rose-500/10" : "bg-emerald-500/5 border-emerald-500/10"
                                        )}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Receivables</p>
                                            <p className={cn(
                                                "text-xl font-black",
                                                Number(customer.ledgerBalance) > 0 ? "text-rose-500" : "text-emerald-500"
                                            )}>
                                                ${parseFloat(customer.ledgerBalance).toLocaleString()}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {canWrite && (
                                                <button
                                                    onClick={() => setModalConfig({ isOpen: true, customer })}
                                                    className="p-3 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="p-3 bg-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            <button className="p-3 bg-muted hover:bg-white/10 rounded-xl transition-all">
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CustomerModal
                isOpen={modalConfig.isOpen}
                customer={modalConfig.customer}
                onClose={() => setModalConfig({ isOpen: false })}
                onSuccess={fetchCustomers}
            />
        </div>
    );
}
