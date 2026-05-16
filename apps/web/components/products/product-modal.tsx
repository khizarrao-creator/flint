"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Package, Tag, DollarSign, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { api } from "@/app/lib/api";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: any; // If provided, we are in Edit mode
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [taxRates, setTaxRates] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        code: "",
        description: "",
        barcode: "",
        upc: "",
        categoryId: "",
        brandId: "",
        uomId: "",
        taxRateId: "",
        basePrice: 0,
        costPrice: 0,
        salePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        stockQuantity: 0,
        minStockLevel: 5,
        reorderQuantity: 0,
        weight: 0,
        weightUnit: "kg",
        dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
        shelfLifeDays: 0,
        isActive: true,
        isStockable: true,
        isPurchasable: true,
        isSellable: true,
        isManufactured: false,
        trackInventory: true,
        trackSerial: false,
        trackBatch: false
    });

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [categoriesData, brandsData, unitsData, taxRatesData] = await Promise.all([
                    api.get<any[]>('/categories'),
                    api.get<any[]>('/brands'),
                    api.get<any[]>('/units'),
                    api.get<any[]>('/tax-rates'),
                ]);

                if (Array.isArray(categoriesData)) setCategories(categoriesData);
                if (Array.isArray(brandsData)) setBrands(brandsData);
                if (Array.isArray(unitsData)) setUnits(unitsData);
                if (Array.isArray(taxRatesData)) setTaxRates(taxRatesData);
            } catch (err) {
                console.error('Error fetching master data:', err);
            }
        };
        if (isOpen) fetchMasterData();
    }, [isOpen]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                sku: product.sku || "",
                code: product.code || product.sku || "",
                description: product.description || "",
                barcode: product.barcode || "",
                upc: product.upc || "",
                categoryId: product.categoryId || "",
                brandId: product.brandId || "",
                uomId: product.uomId || "",
                taxRateId: product.taxRateId || "",
                basePrice: parseFloat(product.basePrice || 0),
                costPrice: parseFloat(product.costPrice || 0),
                salePrice: parseFloat(product.salePrice || 0),
                minPrice: parseFloat(product.minPrice || 0),
                maxPrice: parseFloat(product.maxPrice || 0),
                stockQuantity: parseFloat(product.stockQuantity || 0),
                minStockLevel: parseFloat(product.minStockLevel || 0),
                reorderQuantity: parseFloat(product.reorderQuantity || 0),
                weight: parseFloat(product.weight || 0),
                weightUnit: product.weightUnit || "kg",
                dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: "cm" },
                shelfLifeDays: product.shelfLifeDays || 0,
                isActive: product.isActive ?? true,
                isStockable: product.isStockable ?? true,
                isPurchasable: product.isPurchasable ?? true,
                isSellable: product.isSellable ?? true,
                isManufactured: product.isManufactured ?? false,
                trackInventory: product.trackInventory ?? true,
                trackSerial: product.trackSerial ?? false,
                trackBatch: product.trackBatch ?? false
            });
        } else {
            setFormData({
                name: "",
                sku: "",
                code: "",
                description: "",
                barcode: "",
                upc: "",
                categoryId: "",
                brandId: "",
                uomId: "",
                taxRateId: "",
                basePrice: 0,
                costPrice: 0,
                salePrice: 0,
                minPrice: 0,
                maxPrice: 0,
                stockQuantity: 0,
                minStockLevel: 5,
                reorderQuantity: 0,
                weight: 0,
                weightUnit: "kg",
                dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
                shelfLifeDays: 0,
                isActive: true,
                isStockable: true,
                isPurchasable: true,
                isSellable: true,
                isManufactured: false,
                trackInventory: true,
                trackSerial: false,
                trackBatch: false
            });
        }
    }, [product, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                ...formData,
                categoryId: formData.categoryId || null,
                brandId: formData.brandId || null,
                uomId: formData.uomId || null,
                taxRateId: formData.taxRateId || null,
            };

            if (product) {
                await api.put(`/products/${product.id}`, payload);
            } else {
                await api.post('/products', payload);
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
                    className="relative w-full max-w-4xl bg-card border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 border-b flex items-center justify-between bg-muted/30">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                    <Package size={24} />
                                </div>
                                {product ? "Edit Product Registry" : "Register New Product"}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="overflow-y-auto p-8 custom-scrollbar">
                        <div className="space-y-12">
                            {/* Section 1: Core Integration */}
                            <div>
                                <h3 className="text-lg font-black tracking-tighter uppercase mb-6 flex items-center gap-3 text-primary">
                                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs">01</span>
                                    Core Identification
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                            placeholder="Enter product name..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SKU (Stock Keeping Unit)</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.sku}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                setFormData({ ...formData, sku: val, code: formData.code === formData.sku ? val : formData.code });
                                            }}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                            placeholder="e.g. LAP-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
                                        <select
                                            required
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50 appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1rem_1rem]"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Brand</label>
                                        <select
                                            value={formData.brandId}
                                            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50 appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1rem_1rem]"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                        >
                                            <option value="">No Brand</option>
                                            {brands.map(brand => (
                                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit of Measure</label>
                                        <select
                                            value={formData.uomId}
                                            onChange={(e) => setFormData({ ...formData, uomId: e.target.value })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50 appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1rem_1rem]"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                        >
                                            <option value="">No UOM</option>
                                            {units.map(unit => (
                                                <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tax Rate</label>
                                        <select
                                            value={formData.taxRateId}
                                            onChange={(e) => setFormData({ ...formData, taxRateId: e.target.value })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50 appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1rem_1rem]"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                        >
                                            <option value="">No Tax</option>
                                            {taxRates.map(tax => (
                                                <option key={tax.id} value={tax.id}>{tax.name} ({parseFloat(tax.rate) * 100}%)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Barcode (EAN/GTIN)</label>
                                        <input
                                            type="text"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                            placeholder="e.g. 501234567890"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Short Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full min-h-24 py-4 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50 resize-none"
                                            placeholder="Briefly describe the product..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Financial Model */}
                            <div>
                                <h3 className="text-lg font-black tracking-tighter uppercase mb-6 flex items-center gap-3 text-emerald-500">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs">02</span>
                                    Financials & Pricing
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-emerald-500/80">Base Price ($)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-6 font-bold underline-offset-4 focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost Price ($)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sale Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.salePrice}
                                            onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Sell Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.minPrice}
                                            onChange={(e) => setFormData({ ...formData, minPrice: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Sell Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.maxPrice}
                                            onChange={(e) => setFormData({ ...formData, maxPrice: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Inventory & Logistics */}
                            <div>
                                <h3 className="text-lg font-black tracking-tighter uppercase mb-6 flex items-center gap-3 text-amber-500">
                                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs">03</span>
                                    Logistics & Control
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-amber-500/80">Opening Stock</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-amber-500/5 border border-amber-500/10 rounded-2xl px-6 font-bold outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-amber-500/80">Safety Stock (Min)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.minStockLevel}
                                            onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-amber-500/5 border border-amber-500/10 rounded-2xl px-6 font-bold outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reorder Qty</label>
                                        <input
                                            type="number"
                                            value={formData.reorderQuantity}
                                            onChange={(e) => setFormData({ ...formData, reorderQuantity: parseFloat(e.target.value) })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Weight</label>
                                        <div className="flex">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                                className="w-full h-14 bg-muted/50 border rounded-l-2xl px-6 font-bold outline-none focus:border-primary/50"
                                            />
                                            <select
                                                value={formData.weightUnit}
                                                onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                                                className="w-24 h-14 bg-muted border border-l-0 rounded-r-2xl px-3 font-bold outline-none"
                                            >
                                                <option value="kg">KG</option>
                                                <option value="g">G</option>
                                                <option value="lb">LB</option>
                                                <option value="oz">OZ</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shelf Life (Days)</label>
                                        <input
                                            type="number"
                                            value={formData.shelfLifeDays}
                                            onChange={(e) => setFormData({ ...formData, shelfLifeDays: parseInt(e.target.value) })}
                                            className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Physical Dimensions</label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {['length', 'width', 'height'].map((dim) => (
                                                <div key={dim} className="space-y-1">
                                                    <label className="text-[9px] uppercase text-muted-foreground/60">{dim}</label>
                                                    <input
                                                        type="number"
                                                        value={(formData as any).dimensions?.[dim] || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            dimensions: {
                                                                ...(formData as any).dimensions,
                                                                [dim]: parseFloat(e.target.value)
                                                            }
                                                        } as any)}
                                                        className="w-full h-12 bg-muted/30 border rounded-xl px-4 font-bold outline-none"
                                                    />
                                                </div>
                                            ))}
                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase text-muted-foreground/60">Unit</label>
                                                <select
                                                    value={(formData as any).dimensions?.unit || "cm"}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        dimensions: {
                                                            ...(formData as any).dimensions,
                                                            unit: e.target.value
                                                        }
                                                    } as any)}
                                                    className="w-full h-12 bg-muted/30 border rounded-xl px-4 font-bold outline-none"
                                                >
                                                    <option value="cm">CM</option>
                                                    <option value="mm">MM</option>
                                                    <option value="in">IN</option>
                                                    <option value="m">M</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Operational Settings */}
                            <div>
                                <h3 className="text-lg font-black tracking-tighter uppercase mb-6 flex items-center gap-3 text-indigo-500">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs">04</span>
                                    Operational Configuration
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { label: "Active", key: "isActive" },
                                        { label: "Stockable", key: "isStockable" },
                                        { label: "Purchasable", key: "isPurchasable" },
                                        { label: "Sellable", key: "isSellable" },
                                        { label: "Manufactured", key: "isManufactured" },
                                        { label: "Track Inventory", key: "trackInventory" },
                                        { label: "Track Serial", key: "trackSerial" },
                                        { label: "Track Batch", key: "trackBatch" }
                                    ].map((item) => (
                                        <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })}
                                                className={cn(
                                                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                                                    formData[item.key as keyof typeof formData] ? "bg-indigo-500" : "bg-muted"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 bg-white rounded-full transition-all duration-300",
                                                    formData[item.key as keyof typeof formData] ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4 sticky bottom-0 bg-card pt-6 border-t pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-14 border-2 border-muted hover:bg-muted rounded-2xl font-black transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] h-14 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <> <Save size={20} /> {product ? "Sync Product Data" : "Initialize SKU Registry"} </>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>

    );
}
