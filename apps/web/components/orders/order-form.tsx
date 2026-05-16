"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    User,
    FileText,
    Loader2,
    ArrowDown,
    ArrowUp
} from "lucide-react";
import { api } from "@/app/lib/api";
import { cn } from "@/app/lib/utils";
import { useAuth } from "@/app/lib/auth-context";

interface OrderFormProps {
    type: "SALES" | "PURCHASE";
}

export function OrderForm({ type }: OrderFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Master Data
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [docTypes, setDocTypes] = useState<any[]>([]);

    // Form State
    const [selectedDocTypeId, setSelectedDocTypeId] = useState("");
    const [selectedPartyId, setSelectedPartyId] = useState("");
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<any[]>([
        { productId: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }
    ]);

    // Computed
    const selectedDocType = docTypes.find(dt => dt.id === selectedDocTypeId);
    const isPurchase = type === "PURCHASE";
    const partyLabel = isPurchase ? "Supplier" : "Customer";
    const colorScheme = isPurchase ? "text-amber-500 border-amber-500/20" : "text-primary border-primary/20";
    const btnClass = isPurchase ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/20";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prodData, custData, docData] = await Promise.all([
                    api.get<any[]>('/products'),
                    api.get<any[]>('/customers'), // TODO: Fetch Suppliers for Purchase
                    api.get<any[]>('/doctypes')
                ]);

                setProducts(prodData || []);
                setCustomers(custData || []);

                if (Array.isArray(docData)) {
                    // Filter DocTypes based on current mode
                    const relevantTypes = docData.filter((d: any) =>
                        isPurchase ? d.code.startsWith('P') : d.code.startsWith('S')
                    );
                    setDocTypes(relevantTypes);

                    // Set default
                    if (relevantTypes.length > 0) {
                        setSelectedDocTypeId(relevantTypes[0].id);
                    }
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isPurchase]);

    // Item Management
    const addItem = () => {
        setItems([...items, { productId: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === "productId") {
            const prod = products.find(p => p.id === value);
            if (prod) {
                // Determine price based on context
                const price = isPurchase ? prod.costPrice : prod.basePrice;
                newItems[index].unitPrice = parseFloat(price);
                newItems[index].taxRate = prod.taxRate?.rate ? parseFloat(prod.taxRate.rate) : 0;
            }
        }
        setItems(newItems);
    };

    // Calculations
    const calculateTotals = () => {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        items.forEach(item => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            const discount = Number(item.discount) || 0;
            const taxRate = Number(item.taxRate) || 0;

            const lineTotal = qty * price;
            const lineDiscount = lineTotal * (discount / 100);
            const taxableAmount = lineTotal - lineDiscount;
            const lineTax = taxableAmount * taxRate;

            subtotal += lineTotal;
            totalDiscount += lineDiscount;
            totalTax += lineTax;
        });

        return {
            subtotal,
            totalTax,
            totalDiscount,
            grandTotal: subtotal - totalDiscount + totalTax
        };
    };

    const totals = calculateTotals();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDocTypeId || !selectedPartyId) return;

        try {
            setIsSubmitting(true);
            const payload = {
                docTypeId: selectedDocTypeId,
                [isPurchase ? 'supplierId' : 'customerId']: selectedPartyId,
                orderDate: new Date(orderDate),
                notes,
                products: items.map(i => ({
                    productId: i.productId,
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice),
                    discount: Number(i.discount),
                    taxRate: Number(i.taxRate)
                })),
                totalAmount: totals.grandTotal,
                taxAmount: totals.totalTax,
                discountAmount: totals.totalDiscount
            };

            await api.post('/orders', payload);
            router.back();
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header / Meta */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider mb-2"
                    >
                        <ArrowLeft size={16} /> Back to List
                    </button>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-card border", colorScheme)}>
                            {isPurchase ? <ArrowDown size={28} /> : <ArrowUp size={28} />}
                        </div>
                        New {isPurchase ? "Purchase Order" : "Sales Order"}
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 h-12 rounded-xl font-bold border border-input bg-card hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || items.length === 0}
                        className={cn(
                            "px-8 h-12 rounded-xl text-primary-foreground font-black shadow-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100",
                            btnClass
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Save Transaction
                    </button>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-8">

                {/* Top Row: Context */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText size={14} /> Document Type
                        </label>
                        <select
                            value={selectedDocTypeId}
                            onChange={(e) => setSelectedDocTypeId(e.target.value)}
                            className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all appearance-none"
                            required
                        >
                            <option value="" disabled>Select Type...</option>
                            {docTypes.map(dt => (
                                <option key={dt.id} value={dt.id}>[{dt.code}] {dt.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User size={14} /> {partyLabel}
                        </label>
                        <select
                            value={selectedPartyId}
                            onChange={(e) => setSelectedPartyId(e.target.value)}
                            className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all appearance-none"
                            required
                        >
                            <option value="">Select {partyLabel}...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.displayName || `${c.firstName} ${c.lastName}`}</option>
                            ))}
                        </select>
                        {isPurchase && <p className="text-[10px] text-amber-500 italic">* Using Customers list for Demo</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Calendar size={14} /> Posting Date
                        </label>
                        <input
                            type="date"
                            value={orderDate}
                            onChange={(e) => setOrderDate(e.target.value)}
                            className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Items Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-lg font-black tracking-tight">Line Items</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-muted hover:bg-muted/80 transition-colors",
                                isPurchase ? "text-amber-600" : "text-primary"
                            )}
                        >
                            <Plus size={14} /> Add Row
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-3 text-xs font-black uppercase tracking-widest text-muted-foreground w-12">#</th>
                                    <th className="pb-3 text-xs font-black uppercase tracking-widest text-muted-foreground w-[30%]">Product / Item</th>
                                    <th className="pb-3 text-xs font-black uppercase tracking-widest text-muted-foreground w-24 text-center">Qty</th>
                                    <th className="pb-3 text-xs font-black uppercase tracking-widest text-muted-foreground w-32 text-right">Rate</th>
                                    <th className="pb-3 text-xs font-black uppercase tracking-widest text-muted-foreground w-20 text-center">Disc %</th>
                                    <th className="pb-3 text-xs font-black uppercase tracking-widest text-muted-foreground w-20 text-center">Tax %</th>
                                    <th className="pb-3 text-xs font-black uppercase tracking-widest text-muted-foreground w-32 text-right">Total</th>
                                    <th className="pb-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item, index) => (
                                    <tr key={index} className="group hover:bg-muted/20 transition-colors">
                                        <td className="py-3 font-medium text-muted-foreground">{index + 1}</td>
                                        <td className="py-3">
                                            <select
                                                value={item.productId}
                                                onChange={(e) => updateItem(index, "productId", e.target.value)}
                                                className="w-full h-10 bg-transparent border rounded-lg px-3 font-medium outline-none focus:border-primary/50 transition-all"
                                                required
                                            >
                                                <option value="">Select Product...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-1">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                                className="w-full h-10 bg-transparent border rounded-lg px-2 text-center font-bold outline-none focus:border-primary/50 transition-all"
                                                required
                                            />
                                        </td>
                                        <td className="py-3 px-1">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                                className="w-full h-10 bg-transparent border rounded-lg px-2 text-right font-medium outline-none focus:border-primary/50 transition-all"
                                                required
                                            />
                                        </td>
                                        <td className="py-3 px-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={item.discount}
                                                onChange={(e) => updateItem(index, "discount", e.target.value)}
                                                className="w-full h-10 bg-transparent border rounded-lg px-2 text-center font-medium outline-none focus:border-primary/50 transition-all"
                                            />
                                        </td>
                                        <td className="py-3 px-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={item.taxRate}
                                                onChange={(e) => updateItem(index, "taxRate", e.target.value)}
                                                className="w-full h-10 bg-transparent border rounded-lg px-2 text-center font-medium outline-none focus:border-primary/50 transition-all"
                                            />
                                        </td>
                                        <td className="py-3 text-right font-bold text-foreground">
                                            ${((item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 text-center">
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer: Notes & Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notes / Terms</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-32 bg-muted/30 border rounded-xl p-4 font-medium outline-none focus:border-primary/50 transition-all resize-none"
                            placeholder="Add payment terms, delivery notes, or special instructions..."
                        />
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">Subtotal</span>
                            <span className="font-bold">${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">Discount</span>
                            <span className="font-bold text-rose-500">-${totals.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">Tax</span>
                            <span className="font-bold">${totals.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="h-[1px] bg-border my-2" />
                        <div className="flex justify-between text-xl font-black">
                            <span className={isPurchase ? "text-amber-600" : "text-primary"}>Grand Total</span>
                            <span>${totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
