"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Printer,
    Trash2,
    Download,
    Calendar,
    User,
    Package,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/app/lib/api";
import { cn } from "@/app/lib/utils";
import { useAuth } from "@/app/lib/auth-context";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const canDelete = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch order:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    const handleDelete = async () => {
        if (!canDelete) return;
        if (!confirm("Void this order? Flint will automatically Roll Back Inventory and Deduct the Customer's debt. This action is irreversible.")) return;

        try {
            await api.delete(`/orders/${id}`);
            router.back();
        } catch (error) {
            console.error('Failed to void order:', error);
            alert("Failed to void order. Check connection or permissions.");
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-black uppercase tracking-widest text-muted-foreground animate-pulse text-xs">
                    Decrypting Ledger Data...
                </p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
                <AlertCircle size={64} className="text-rose-500 opacity-20" />
                <div className="text-center">
                    <h2 className="text-2xl font-black">Order Not Found</h2>
                    <p className="text-muted-foreground">The transaction you are looking for does not exist in our sync history.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-3 bg-muted rounded-2xl font-bold hover:bg-muted/80 transition-all"
                >
                    <ArrowLeft size={20} /> Go Back
                </button>
            </div>
        );
    }

    const isPurchase = order.code?.startsWith('P');
    const party = order.customer || order.supplier;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header / Actions */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black tracking-tight">{order.code}</h1>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                order.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                    order.status === 'Draft' ? "bg-muted text-muted-foreground border-muted-foreground/20" :
                                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">
                            {isPurchase ? "Purchase Order" : "Sales Order"} • Created on {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-card border font-black text-sm hover:bg-muted transition-all">
                        <Printer size={18} /> Print
                    </button>
                    <button className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-card border font-black text-sm hover:bg-muted transition-all text-primary">
                        <Download size={18} /> Export PDF
                    </button>
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Table */}
                    <div className="bg-card border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b bg-muted/30">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <Package className="text-primary" />
                                Order Items
                            </h2>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="text-left p-6">Product Description</th>
                                    <th className="text-center p-6">Qty</th>
                                    <th className="text-right p-6">Unit Price</th>
                                    <th className="text-right p-6">Taxes</th>
                                    <th className="text-right p-6">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items?.map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-muted/10 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm tracking-tight">{item.product?.name || "Unknown Item"}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SKU: {item.product?.sku || "N/A"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="inline-flex h-8 px-3 rounded-lg bg-muted items-center justify-center font-black text-xs">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right font-bold text-sm">
                                            ${parseFloat(item.unitPrice).toLocaleString()}
                                        </td>
                                        <td className="p-6 text-right text-xs font-semibold text-muted-foreground">
                                            {item.taxRate}%
                                        </td>
                                        <td className="p-6 text-right font-black text-sm">
                                            ${parseFloat(item.lineTotal).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="p-10 bg-muted/30 border-t flex justify-end">
                            <div className="w-full max-w-xs space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Subtotal Cost</span>
                                    <span className="font-bold">${parseFloat(order.subtotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Tax Liability</span>
                                    <span className="font-bold text-rose-500">+ ${parseFloat(order.taxAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm pb-4 border-b">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Trade Discount</span>
                                    <span className="font-bold text-emerald-500">- ${parseFloat(order.discountAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <div>
                                        <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Grand Total</p>
                                        <p className="text-3xl font-black tracking-tighter mt-1">${parseFloat(order.totalAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Paid to Date</p>
                                        <p className="font-bold text-emerald-500">${parseFloat(order.paidAmount || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Audit */}
                    {order.notes && (
                        <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <FileText size={16} /> Transaction Notes
                            </h3>
                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                {order.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar Details */}
                <div className="space-y-8">
                    {/* Party Info */}
                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                                {isPurchase ? "Supplier Profile" : "Customer Profile"}
                            </p>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
                                    {isPurchase ? <Building2 size={24} /> : <User size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight leading-none mb-1">
                                        {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : order.supplier?.name}
                                    </h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                                        ID: {party?.code || "INTERNAL"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {party?.companyName && (
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <Building2 size={16} className="text-muted-foreground" />
                                        <span>{party.companyName}</span>
                                    </div>
                                )}
                                {(party?.email || party?.contactInfo?.email) && (
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <Mail size={16} className="text-muted-foreground" />
                                        <span>{party?.email || party?.contactInfo?.email}</span>
                                    </div>
                                )}
                                {(party?.phone || party?.contactInfo?.phone) && (
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <Phone size={16} className="text-muted-foreground" />
                                        <span>{party?.phone || party?.contactInfo?.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Outstanding Debt</p>
                                <p className="text-xl font-black">${parseFloat(party?.currentBalance || 0).toLocaleString()}</p>
                            </div>
                            <button className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all group">
                                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Metadata</h4>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Currency</p>
                                <p className="text-sm font-black">{order.currency || "USD"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Doc Type</p>
                                <p className="text-sm font-black uppercase">{order.docType?.code || "STD"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Warehouse</p>
                                <p className="text-sm font-black italic">Primary Flint</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Entry Bot</p>
                                <p className="text-sm font-black uppercase text-primary">Flint AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
