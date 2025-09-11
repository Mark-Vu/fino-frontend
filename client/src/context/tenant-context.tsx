"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    Tenant,
    getUserById,
    requestTenantAccess,
} from "@/services/users.service";
import { useAuth } from "@/context/auth-context";

interface TenantContextType {
    user: User | null;
    tenant: Tenant | null;
    loading: boolean;
    error: string | null;
    isTenantValid: boolean;
    isUserInTenant: boolean;
    requestAccess: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
    children: React.ReactNode;
    subdomain: string;
}

export function TenantProvider({ children, subdomain }: TenantProviderProps) {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isTenantValid = tenant !== null;
    const isUserInTenant = user?.tenantId === tenant?.id;

    const requestAccess = async () => {
        if (!tenant || !authUser) return;

        try {
            await requestTenantAccess(tenant.id);
            // Refresh user data after request
            const updatedUser = await getUserById(authUser.id);
            setUser(updatedUser);
        } catch (err) {
            console.error("Failed to request access:", err);
            setError("Failed to request access. Please try again.");
        }
    };

    useEffect(() => {
        const initializeTenant = async () => {
            try {
                setLoading(true);
                setError(null);

                // Set tenant from subdomain directly (no backend lookup)
                setTenant({ id: subdomain, companyName: subdomain, subdomain });

                // If user is logged in, get their full user data
                if (authUser) {
                    try {
                        const userData = await getUserById(authUser.id);
                        setUser(userData);
                    } catch (error) {
                        console.error("Failed to get user:", error);
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Failed to initialize tenant:", err);
                setError("Failed to load tenant information");
            } finally {
                setLoading(false);
            }
        };

        if (subdomain) {
            initializeTenant();
        }
    }, [subdomain, authUser]);

    const value: TenantContextType = {
        user,
        tenant,
        loading,
        error,
        isTenantValid,
        isUserInTenant,
        requestAccess,
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}

// Optional hook that does not throw when provider is missing
export function useTenantOptional() {
    return useContext(TenantContext);
}
