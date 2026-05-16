"use client";

import React, { useEffect, useState } from "react";
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    TrendingUp,
    History,
    Download,
    Filter,
    Search,
    Loader2,
    FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/lib/auth-context";
import { cn } from "@/app/lib/utils";
import { useRouter } from "next/navigation";

import { api } from "@/app/lib/api";

export default function FinancesPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalReceivable: 0,
        totalRevenue: 0,
        cashOnHand: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accData, transData] = await Promise.all([
                api.get<any[]>('/finances/accounts'),
                api.get<any[]>('/finances/transactions')
            ]);

            setAccounts(accData || []);
            setTransactions(transData || []);

            if (Array.isArray(accData)) {
                setStats({
                    totalReceivable: parseFloat(accData.find((a: any) => a.accountCode === '1101')?.balance || 0),
                    totalRevenue: parseFloat(accData.find((a: any) => a.accountCode === '4001')?.balance || 0),
                    cashOnHand: parseFloat(accData.find((a: any) => a.accountCode === '1001')?.balance || 0)
                });
            }
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-primary" />
                        Flint Capital
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Financial Treasury</h1>
                    <p className="text-muted-foreground">Monitor cash flow, receivables, and revenue integrity.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/finances/reports')}
                        className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <FileText size={20} />
                        Reports
                    </button>
                    <button className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-muted border font-bold hover:bg-muted/80 transition-all">
                        <Download size={20} />
                        Export Ledger
                    </button>
                </div>
            </section>

            {/* Financial Health Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Gross Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, color: "primary", icon: TrendingUp },
                    { label: "Total Receivables", value: `$${stats.totalReceivable.toLocaleString()}`, color: "rose", icon: Wallet },
                    { label: "Cash on Hand", value: `$${stats.cashOnHand.toLocaleString()}`, color: "slate", icon: CreditCard },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-card border shadow-sm relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{item.label}</p>
                                <h3 className="text-3xl font-black tracking-tighter">{item.value}</h3>
                            </div>
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                                item.color === 'primary' ? "bg-primary/10 text-primary" :
                                    item.color === 'rose' ? "bg-rose-500/10 text-rose-500" : "bg-muted text-foreground"
                            )}>
                                <item.icon size={28} />
                            </div>
                        </div>
                        {/* Visual Background Flair */}
                        <div className={cn(
                            "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                            item.color === 'primary' ? "bg-primary" :
                                item.color === 'rose' ? "bg-rose-500" : "bg-slate-500"
                        )} />
                    </motion.div>
                ))}
            </section>

            {/* Transaction Ledger */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    Global Ledger
                    <span className="text-xs font-bold text-muted-foreground uppercase opacity-50 px-2 py-1 bg-muted rounded-lg tracking-widest ml-2">Realtime</span>
                </h2>

                <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b">
                                <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
                                <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Description</th>
                                <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Type</th>
                                <th className="p-6 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="p-6"><div className="h-6 bg-muted rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-muted-foreground font-bold">
                                        No transactions recorded in this fiscal period.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-6 text-sm font-bold opacity-60">
                                            {new Date(t.transactionDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 font-bold text-sm">
                                            {t.description}
                                            {t.referenceNumber && (
                                                <span className="block text-[10px] text-muted-foreground uppercase mt-1">Ref: {t.referenceNumber}</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                                t.type === 'Credit' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                            )}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className={cn(
                                            "p-6 text-right font-black",
                                            t.type === 'Credit' ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {t.type === 'Credit' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
