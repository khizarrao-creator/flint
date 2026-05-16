"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    id: string;
    email: string;
    username: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER" | "VIEWER" | "CUSTOMER";
    tenantId: string;
    tenant?: {
        name: string;
        subdomain: string;
        theme?: string;
    };
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedUser = localStorage.getItem("flint_user");
        const token = localStorage.getItem("flint_token");

        if (savedUser && token) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
            } catch (e) {
                console.error("Failed to parse saved user", e);
                localStorage.removeItem("flint_user");
                localStorage.removeItem("flint_token");
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem("flint_token", token);
        localStorage.setItem("flint_user", JSON.stringify(user));
        setUser(user);

        if (user.role === "SUPER_ADMIN") {
            router.push("/admin");
        } else if (user.role === "CUSTOMER") {
            router.push("/portal");
        } else {
            router.push("/");
        }
    };

    const logout = () => {
        localStorage.removeItem("flint_token");
        localStorage.removeItem("flint_user");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
