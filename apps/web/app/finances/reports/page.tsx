"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context";
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    Building,
    Scale,
    FileText,
    Wallet,
    Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

import { api } from "@/app/lib/api";

export default function FinancialReportsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'bs' | 'is'>('bs'); // Balance Sheet vs Income Statement

    useEffect(() => {
        fetchStatements();
    }, []);

    const fetchStatements = async () => {
        try {
            setLoading(true);
            const res = await api.get<any>('/finances/statements');
            setData(res);
        } catch (error) {
            console.error('Failed to fetch statements:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatementRow = ({ name, value, bold = false, indent = false, isTotal = false, color }: any) => (
        <div className={cn(
            "flex justify-between items-center py-3 border-b border-dashed border-gray-100 last:border-0 hover:bg-muted/10 transition-colors px-4 rounded-lg",
            bold && "font-black",
            isTotal && "bg-muted/20 border-t border-solid border-gray-200 mt-2",
            indent && "pl-8 text-sm text-muted-foreground font-medium"
        )}>
            <span className={cn(color && `text-${color}-500`)}>{name}</span>
            <span className={cn("font-bold", color && `text-${color}-500`)}>${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold tracking-widest text-xs uppercase">
                        <Link href="/finances" className="hover:underline">Finances</Link> / Reports
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Financial Statements</h1>
                    <p className="text-muted-foreground">Real-time Balance Sheet and Income Statement.</p>
                </div>

                <div className="bg-card border rounded-2xl p-1 flex">
                    <button
                        onClick={() => setActiveTab('bs')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === 'bs' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Scale size={16} />
                        Balance Sheet
                    </button>
                    <button
                        onClick={() => setActiveTab('is')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === 'is' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <TrendingUp size={16} />
                        Income Statement
                    </button>
                </div>
            </section>

            <div className="font-outfit min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                        <p className="text-sm font-bold text-muted-foreground">Compiling Ledger...</p>
                    </div>
                ) : !data ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                        <FileText size={48} className="opacity-20" />
                        <p>No financial data available.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'bs' && (
                            <motion.div
                                key="bs"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                {/* Assets */}
                                <div className="bg-card border rounded-3xl p-8 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                            <Wallet size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight">Assets</h2>
                                    </div>

                                    <div className="space-y-1">
                                        {data.balanceSheet.assets.map((acc: any) => (
                                            <StatementRow key={acc.id} name={acc.name} value={acc.balance} indent />
                                        ))}
                                        <StatementRow name="Total Assets" value={data.balanceSheet.totals.assets} isTotal bold color="emerald" />
                                    </div>
                                </div>

                                {/* Liabilities & Equity */}
                                <div className="space-y-8">
                                    <div className="bg-card border rounded-3xl p-8 space-y-6 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                                <Landmark size={24} />
                                            </div>
                                            <h2 className="text-2xl font-black tracking-tight">Liabilities</h2>
                                        </div>
                                        <div className="space-y-1">
                                            {data.balanceSheet.liabilities.map((acc: any) => (
                                                <StatementRow key={acc.id} name={acc.name} value={acc.balance} indent />
                                            ))}
                                            <StatementRow name="Total Liabilities" value={data.balanceSheet.totals.liabilities} isTotal bold color="rose" />
                                        </div>
                                    </div>

                                    <div className="bg-card border rounded-3xl p-8 space-y-6 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                <Building size={24} />
                                            </div>
                                            <h2 className="text-2xl font-black tracking-tight">Equity</h2>
                                        </div>
                                        <div className="space-y-1">
                                            {data.balanceSheet.equity.map((acc: any) => (
                                                <StatementRow key={acc.id} name={acc.name} value={acc.balance} indent />
                                            ))}
                                            <StatementRow name="Total Equity" value={data.balanceSheet.totals.equity} isTotal bold color="blue" />
                                        </div>
                                    </div>

                                    <div className="bg-muted p-6 rounded-2xl flex justify-between items-center border border-dashed border-gray-300">
                                        <span className="font-medium text-muted-foreground uppercase tracking-widest text-xs">Check (Assets = Liab + Equity)</span>
                                        <span className={cn(
                                            "font-black text-lg",
                                            Math.abs(Number(data.balanceSheet.totals.assets) - (Number(data.balanceSheet.totals.liabilities) + Number(data.balanceSheet.totals.equity))) < 0.01 ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {Math.abs(Number(data.balanceSheet.totals.assets) - (Number(data.balanceSheet.totals.liabilities) + Number(data.balanceSheet.totals.equity))) < 0.01 ? "Balanced" : "Unbalanced"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'is' && (
                            <motion.div
                                key="is"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-3xl mx-auto space-y-8"
                            >
                                <div className="bg-card border rounded-[2.5rem] p-10 shadow-xl space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500" />

                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight">Income Statement</h2>
                                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">For the current fiscal period</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Revenue */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 border-b border-emerald-100 pb-2">Revenue</h3>
                                            {data.incomeStatement.revenue.map((acc: any) => (
                                                <StatementRow key={acc.id} name={acc.name} value={acc.balance} />
                                            ))}
                                            <StatementRow name="Total Revenue" value={data.incomeStatement.totals.revenue} isTotal bold />
                                        </div>

                                        {/* Expenses */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-rose-500 border-b border-rose-100 pb-2">Expenses</h3>
                                            {data.incomeStatement.expenses.map((acc: any) => (
                                                <StatementRow key={acc.id} name={acc.name} value={acc.balance} />
                                            ))}
                                            <StatementRow name="Total Expenses" value={data.incomeStatement.totals.expenses} isTotal bold />
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t-2 border-dashed">
                                        <div className="flex justify-between items-center p-6 bg-slate-900 text-white rounded-2xl shadow-lg">
                                            <span className="text-lg font-medium opacity-80">Net Income</span>
                                            <span className={cn(
                                                "text-3xl font-black tracking-tight",
                                                data.incomeStatement.totals.netIncome >= 0 ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                ${Number(data.incomeStatement.totals.netIncome).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
