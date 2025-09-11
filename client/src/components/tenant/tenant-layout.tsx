"use client";

import { TenantProvider } from "@/context/tenant-context";
import { TenantValidation } from "./tenant-validation";
import { getSubdomainFromUrl } from "@/utils/tenant";

interface TenantLayoutProps {
    children: React.ReactNode;
}

export function TenantLayout({ children }: TenantLayoutProps) {
    const subdomain = getSubdomainFromUrl();

    // If no subdomain, render children directly (main app)
    if (!subdomain) {
        return <>{children}</>;
    }

    // If subdomain exists, wrap with tenant provider and validation
    return (
        <TenantProvider subdomain={subdomain}>
            <TenantValidation>{children}</TenantValidation>
        </TenantProvider>
    );
}
