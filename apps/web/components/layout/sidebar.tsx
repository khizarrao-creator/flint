"use client";

import React, { useState } from "react";
import {
    BarChart3,
    Box,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    CreditCard,
    Home,
    Layers,
    Settings,
    ShoppingCart,
    Users,
    Rocket,
    Factory,
    ShoppingBag,
    Monitor
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { icon: Home, label: "Dashboard", id: "dashboard", href: "/" },
    { icon: ShoppingCart, label: "Sales", id: "sales", href: "/orders" },
    { icon: ShoppingBag, label: "Purchases", id: "purchases", href: "/purchases" },
    { icon: Layers, label: "Inventory", id: "inventory", href: "/inventory" },
    { icon: Factory, label: "Manufacturing", id: "manufacturing", href: "/manufacturing" },
    { icon: Monitor, label: "Assets", id: "assets", href: "/assets" },
    { icon: Box, label: "Products", id: "products", href: "/products" },
    { icon: Users, label: "Partners", id: "customers", href: "/customers" },
    { icon: CreditCard, label: "Finances", id: "finances", href: "/finances" },
    { icon: Settings, label: "Settings", id: "settings", href: "/settings" },
];

import { useAuth } from "@/app/lib/auth-context";

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth(); // <--- Get User Context

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            className={cn(
                "relative h-screen flex flex-col border-r bg-card transition-all duration-300 ease-in-out z-20",
                isCollapsed ? "px-2" : "px-4"
            )}
        >
            {/* ... (Brand Section) ... */}
            <div className={cn(
                "flex items-center gap-3 py-8 overflow-hidden",
                isCollapsed ? "justify-center" : "px-4"
            )}>
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-primary-foreground font-black text-xl italic">
                        {user?.tenant?.name ? user.tenant.name[0].toUpperCase() : "F"}
                    </span>
                </div>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-black italic tracking-tighter text-foreground truncate"
                    >
                        {user?.tenant?.name || "FLINT"}
                    </motion.span>
                )}
            </div>

            {/* ... (Navigation) ... */}
            <nav className="flex-1 space-y-2 mt-4 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "w-6 h-6 flex-shrink-0",
                                isActive ? "text-primary" : "group-hover:scale-110 transition-transform"
                            )} />
                            {!isCollapsed && (
                                <span className="font-semibold text-sm tracking-wide transition-all truncate">
                                    {item.label}
                                </span>
                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-lg shadow-primary/50"
                                />
                            )}
                        </Link>
                    );
                })}

                {/* Only show Onboard link for Super Admins */}
                {(user?.role === 'SUPER_ADMIN') && (
                    <div className="pt-4 pb-2">
                        <div className={cn("h-[1px] bg-border mx-4", isCollapsed && "mx-2")} />
                        <p className={cn("text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-4 ml-4", isCollapsed && "hidden")}>Super Admin</p>
                    </div>
                )}

                {(user?.role === 'SUPER_ADMIN') && (
                    <Link
                        href="/admin"
                        className={cn(
                            "w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative duration-200 border border-primary/20 bg-primary/5",
                            pathname === "/admin" ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary hover:text-primary-foreground"
                        )}
                    >
                        <Rocket className="w-6 h-6 flex-shrink-0" />
                        {!isCollapsed && <span className="font-black text-sm tracking-tight">Admin Portal</span>}
                    </Link>
                )}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full border bg-card flex items-center justify-center hover:bg-muted shadow-md transition-colors z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* User Quick Access */}
            <div className={cn(
                "p-4 border-t mb-4",
                isCollapsed ? "flex flex-col items-center" : ""
            )}>
                <div className={cn(
                    "flex items-center gap-3",
                    isCollapsed ? "justify-center" : ""
                )}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 border-2 border-primary/20 flex-shrink-0 flex items-center justify-center text-xs font-black text-muted-foreground">
                        {user?.username?.[0].toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.username || "Guest User"}</p>
                            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role?.replace('_', ' ').toLowerCase() || "Visitor"}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}
