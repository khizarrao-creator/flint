"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Customer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    ledgerBalance: any;
    tenantId: string;
    role: "CUSTOMER";
    tenant?: {
        name: string;
        subdomain: string;
        theme?: string;
    };
}

interface PortalAuthContextType {
    customer: Customer | null;
    login: (token: string, customer: Customer) => void;
    logout: () => void;
    loading: boolean;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedCustomer = localStorage.getItem("flint_customer");
        const token = localStorage.getItem("flint_portal_token");

        if (savedCustomer && token) {
            setCustomer(JSON.parse(savedCustomer));
        }
        setLoading(false);
    }, []);

    const login = (token: string, customer: Customer) => {
        localStorage.setItem("flint_portal_token", token);
        localStorage.setItem("flint_customer", JSON.stringify(customer));
        setCustomer(customer);

        // Also set the theme if available
        if (customer.tenant?.theme) {
            document.documentElement.setAttribute("data-theme", customer.tenant.theme);
            localStorage.setItem("flint_theme", customer.tenant.theme);
        }

        router.push("/portal");
    };

    const logout = () => {
        localStorage.removeItem("flint_portal_token");
        localStorage.removeItem("flint_customer");
        setCustomer(null);
        router.push("/portal/login");
    };

    return (
        <PortalAuthContext.Provider value={{ customer, login, logout, loading }}>
            {children}
        </PortalAuthContext.Provider>
    );
}

export const usePortalAuth = () => {
    const context = useContext(PortalAuthContext);
    if (context === undefined) {
        throw new Error("usePortalAuth must be used within a PortalAuthProvider");
    }
    return context;
}
